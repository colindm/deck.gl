// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Buffer } from '@luma.gl/core';
import { typedArrayFromDataType, getBufferAttributeLayout, getStride, dataTypeFromTypedArray } from "./gl-utils.js";
import typedArrayManager from "../../utils/typed-array-manager.js";
import { toDoublePrecisionArray } from "../../utils/math-utils.js";
import log from "../../utils/log.js";
function resolveShaderAttribute(baseAccessor, shaderAttributeOptions) {
    if (shaderAttributeOptions.offset) {
        log.removed('shaderAttribute.offset', 'vertexOffset, elementOffset')();
    }
    // All shader attributes share the parent's stride
    const stride = getStride(baseAccessor);
    // `vertexOffset` is used to access the neighboring vertex's value
    // e.g. `nextPositions` in polygon
    const vertexOffset = shaderAttributeOptions.vertexOffset !== undefined
        ? shaderAttributeOptions.vertexOffset
        : baseAccessor.vertexOffset || 0;
    // `elementOffset` is defined when shader attribute's size is smaller than the parent's
    // e.g. `translations` in transform matrix
    const elementOffset = shaderAttributeOptions.elementOffset || 0;
    const offset = 
    // offsets defined by the attribute
    vertexOffset * stride +
        elementOffset * baseAccessor.bytesPerElement +
        // offsets defined by external buffers if any
        (baseAccessor.offset || 0);
    return {
        ...shaderAttributeOptions,
        offset,
        stride
    };
}
function resolveDoublePrecisionShaderAttributes(baseAccessor, shaderAttributeOptions) {
    const resolvedOptions = resolveShaderAttribute(baseAccessor, shaderAttributeOptions);
    return {
        high: resolvedOptions,
        low: {
            ...resolvedOptions,
            offset: resolvedOptions.offset + baseAccessor.size * 4
        }
    };
}
export default class DataColumn {
    /* eslint-disable max-statements */
    constructor(device, opts, state) {
        this._buffer = null;
        this.device = device;
        this.id = opts.id || '';
        this.size = opts.size || 1;
        const logicalType = opts.logicalType || opts.type;
        const doublePrecision = logicalType === 'float64';
        let { defaultValue } = opts;
        defaultValue = Number.isFinite(defaultValue)
            ? [defaultValue]
            : defaultValue || new Array(this.size).fill(0);
        let bufferType;
        if (doublePrecision) {
            bufferType = 'float32';
        }
        else if (!logicalType && opts.isIndexed) {
            bufferType = 'uint32';
        }
        else {
            bufferType = logicalType || 'float32';
        }
        // This is the attribute type defined by the layer
        // If an external buffer is provided, this.type may be overwritten
        // But we always want to use defaultType for allocation
        let defaultType = typedArrayFromDataType(logicalType || bufferType);
        this.doublePrecision = doublePrecision;
        // `fp64: false` tells a double-precision attribute to allocate Float32Arrays
        // by default when using auto-packing. This is more efficient in use cases where
        // high precision is unnecessary, but the `64Low` attribute is still required
        // by the shader.
        if (doublePrecision && opts.fp64 === false) {
            defaultType = Float32Array;
        }
        this.value = null;
        this.settings = {
            ...opts,
            defaultType,
            defaultValue: defaultValue,
            logicalType,
            type: bufferType,
            normalized: bufferType.includes('norm'),
            size: this.size,
            bytesPerElement: defaultType.BYTES_PER_ELEMENT
        };
        this.state = {
            ...state,
            externalBuffer: null,
            bufferAccessor: this.settings,
            allocatedValue: null,
            numInstances: 0,
            bounds: null,
            constant: false
        };
    }
    /* eslint-enable max-statements */
    get isConstant() {
        return this.state.constant;
    }
    get buffer() {
        return this._buffer;
    }
    get byteOffset() {
        const accessor = this.getAccessor();
        if (accessor.vertexOffset) {
            return accessor.vertexOffset * getStride(accessor);
        }
        return 0;
    }
    get numInstances() {
        return this.state.numInstances;
    }
    set numInstances(n) {
        this.state.numInstances = n;
    }
    delete() {
        if (this._buffer) {
            this._buffer.delete();
            this._buffer = null;
        }
        typedArrayManager.release(this.state.allocatedValue);
    }
    getBuffer() {
        if (this.state.constant) {
            return null;
        }
        return this.state.externalBuffer || this._buffer;
    }
    getValue(attributeName = this.id, options = null) {
        const result = {};
        if (this.state.constant) {
            const value = this.value;
            if (options) {
                const shaderAttributeDef = resolveShaderAttribute(this.getAccessor(), options);
                const offset = shaderAttributeDef.offset / value.BYTES_PER_ELEMENT;
                const size = shaderAttributeDef.size || this.size;
                result[attributeName] = value.subarray(offset, offset + size);
            }
            else {
                result[attributeName] = value;
            }
        }
        else {
            result[attributeName] = this.getBuffer();
        }
        if (this.doublePrecision) {
            if (this.value instanceof Float64Array) {
                result[`${attributeName}64Low`] = result[attributeName];
            }
            else {
                // Disable fp64 low part
                result[`${attributeName}64Low`] = new Float32Array(this.size);
            }
        }
        return result;
    }
    _getBufferLayout(attributeName = this.id, options = null) {
        const accessor = this.getAccessor();
        const attributes = [];
        const result = {
            name: this.id,
            byteStride: getStride(accessor),
            attributes
        };
        if (this.doublePrecision) {
            const doubleShaderAttributeDefs = resolveDoublePrecisionShaderAttributes(accessor, options || {});
            attributes.push(getBufferAttributeLayout(attributeName, { ...accessor, ...doubleShaderAttributeDefs.high }), getBufferAttributeLayout(`${attributeName}64Low`, {
                ...accessor,
                ...doubleShaderAttributeDefs.low
            }));
        }
        else if (options) {
            const shaderAttributeDef = resolveShaderAttribute(accessor, options);
            attributes.push(getBufferAttributeLayout(attributeName, { ...accessor, ...shaderAttributeDef }));
        }
        else {
            attributes.push(getBufferAttributeLayout(attributeName, accessor));
        }
        return result;
    }
    setAccessor(accessor) {
        this.state.bufferAccessor = accessor;
    }
    getAccessor() {
        return this.state.bufferAccessor;
    }
    // Returns [min: Array(size), max: Array(size)]
    /* eslint-disable max-depth */
    getBounds() {
        if (this.state.bounds) {
            return this.state.bounds;
        }
        let result = null;
        if (this.state.constant && this.value) {
            const min = Array.from(this.value);
            result = [min, min];
        }
        else {
            const { value, numInstances, size } = this;
            const len = numInstances * size;
            if (value && len && value.length >= len) {
                const min = new Array(size).fill(Infinity);
                const max = new Array(size).fill(-Infinity);
                for (let i = 0; i < len;) {
                    for (let j = 0; j < size; j++) {
                        const v = value[i++];
                        if (v < min[j])
                            min[j] = v;
                        if (v > max[j])
                            max[j] = v;
                    }
                }
                result = [min, max];
            }
        }
        this.state.bounds = result;
        return result;
    }
    // returns true if success
    // eslint-disable-next-line max-statements
    setData(data) {
        const { state } = this;
        let opts;
        if (ArrayBuffer.isView(data)) {
            opts = { value: data };
        }
        else if (data instanceof Buffer) {
            opts = { buffer: data };
        }
        else {
            opts = data;
        }
        const accessor = { ...this.settings, ...opts };
        if (ArrayBuffer.isView(opts.value)) {
            if (!opts.type) {
                // Deduce data type
                const is64Bit = this.doublePrecision && opts.value instanceof Float64Array;
                if (is64Bit) {
                    accessor.type = 'float32';
                }
                else {
                    const type = dataTypeFromTypedArray(opts.value);
                    accessor.type = accessor.normalized ? type.replace('int', 'norm') : type;
                }
            }
            accessor.bytesPerElement = opts.value.BYTES_PER_ELEMENT;
            accessor.stride = getStride(accessor);
        }
        state.bounds = null; // clear cached bounds
        if (opts.constant) {
            // set constant
            let value = opts.value;
            value = this._normalizeValue(value, [], 0);
            if (this.settings.normalized) {
                value = this.normalizeConstant(value);
            }
            const hasChanged = !state.constant || !this._areValuesEqual(value, this.value);
            if (!hasChanged) {
                return false;
            }
            state.externalBuffer = null;
            state.constant = true;
            this.value = ArrayBuffer.isView(value) ? value : new Float32Array(value);
        }
        else if (opts.buffer) {
            const buffer = opts.buffer;
            state.externalBuffer = buffer;
            state.constant = false;
            this.value = opts.value || null;
        }
        else if (opts.value) {
            this._checkExternalBuffer(opts);
            let value = opts.value;
            state.externalBuffer = null;
            state.constant = false;
            this.value = value;
            let { buffer } = this;
            const stride = getStride(accessor);
            const byteOffset = (accessor.vertexOffset || 0) * stride;
            if (this.doublePrecision && value instanceof Float64Array) {
                value = toDoublePrecisionArray(value, accessor);
            }
            if (this.settings.isIndexed) {
                const ArrayType = this.settings.defaultType;
                if (value.constructor !== ArrayType) {
                    // Cast the index buffer to expected type
                    value = new ArrayType(value);
                }
            }
            // A small over allocation is used as safety margin
            // Shader attributes may try to access this buffer with bigger offsets
            const requiredBufferSize = value.byteLength + byteOffset + stride * 2;
            if (!buffer || buffer.byteLength < requiredBufferSize) {
                buffer = this._createBuffer(requiredBufferSize);
            }
            buffer.write(value, byteOffset);
        }
        this.setAccessor(accessor);
        return true;
    }
    updateSubBuffer(opts = {}) {
        this.state.bounds = null; // clear cached bounds
        const value = this.value;
        const { startOffset = 0, endOffset } = opts;
        this.buffer.write(this.doublePrecision && value instanceof Float64Array
            ? toDoublePrecisionArray(value, {
                size: this.size,
                startIndex: startOffset,
                endIndex: endOffset
            })
            : value.subarray(startOffset, endOffset), startOffset * value.BYTES_PER_ELEMENT + this.byteOffset);
    }
    allocate(numInstances, copy = false) {
        const { state } = this;
        const oldValue = state.allocatedValue;
        // Allocate at least one element to ensure a valid buffer
        const value = typedArrayManager.allocate(oldValue, numInstances + 1, {
            size: this.size,
            type: this.settings.defaultType,
            copy
        });
        this.value = value;
        const { byteOffset } = this;
        let { buffer } = this;
        if (!buffer || buffer.byteLength < value.byteLength + byteOffset) {
            buffer = this._createBuffer(value.byteLength + byteOffset);
            if (copy && oldValue) {
                // Upload the full existing attribute value to the GPU, so that updateBuffer
                // can choose to only update a partial range.
                // TODO - copy old buffer to new buffer on the GPU
                buffer.write(oldValue instanceof Float64Array ? toDoublePrecisionArray(oldValue, this) : oldValue, byteOffset);
            }
        }
        state.allocatedValue = value;
        state.constant = false;
        state.externalBuffer = null;
        this.setAccessor(this.settings);
        return true;
    }
    // PRIVATE HELPER METHODS
    _checkExternalBuffer(opts) {
        const { value } = opts;
        if (!ArrayBuffer.isView(value)) {
            throw new Error(`Attribute ${this.id} value is not TypedArray`);
        }
        const ArrayType = this.settings.defaultType;
        let illegalArrayType = false;
        if (this.doublePrecision) {
            // not 32bit or 64bit
            illegalArrayType = value.BYTES_PER_ELEMENT < 4;
        }
        if (illegalArrayType) {
            throw new Error(`Attribute ${this.id} does not support ${value.constructor.name}`);
        }
        if (!(value instanceof ArrayType) && this.settings.normalized && !('normalized' in opts)) {
            log.warn(`Attribute ${this.id} is normalized`)();
        }
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
    normalizeConstant(value) {
        /* eslint-disable complexity */
        switch (this.settings.type) {
            case 'snorm8':
                // normalize [-128, 127] to [-1, 1]
                return new Float32Array(value).map(x => ((x + 128) / 255) * 2 - 1);
            case 'snorm16':
                // normalize [-32768, 32767] to [-1, 1]
                return new Float32Array(value).map(x => ((x + 32768) / 65535) * 2 - 1);
            case 'unorm8':
                // normalize [0, 255] to [0, 1]
                return new Float32Array(value).map(x => x / 255);
            case 'unorm16':
                // normalize [0, 65535] to [0, 1]
                return new Float32Array(value).map(x => x / 65535);
            default:
                // No normalization for gl.FLOAT and gl.HALF_FLOAT
                return value;
        }
    }
    /* check user supplied values and apply fallback */
    _normalizeValue(value, out, start) {
        const { defaultValue, size } = this.settings;
        if (Number.isFinite(value)) {
            out[start] = value;
            return out;
        }
        if (!value) {
            let i = size;
            while (--i >= 0) {
                out[start + i] = defaultValue[i];
            }
            return out;
        }
        // Important - switch cases are 5x more performant than a for loop!
        /* eslint-disable no-fallthrough, default-case */
        switch (size) {
            case 4:
                out[start + 3] = Number.isFinite(value[3]) ? value[3] : defaultValue[3];
            case 3:
                out[start + 2] = Number.isFinite(value[2]) ? value[2] : defaultValue[2];
            case 2:
                out[start + 1] = Number.isFinite(value[1]) ? value[1] : defaultValue[1];
            case 1:
                out[start + 0] = Number.isFinite(value[0]) ? value[0] : defaultValue[0];
                break;
            default:
                // In the rare case where the attribute size > 4, do it the slow way
                // This is used for e.g. transform matrices
                let i = size;
                while (--i >= 0) {
                    out[start + i] = Number.isFinite(value[i]) ? value[i] : defaultValue[i];
                }
        }
        return out;
    }
    _areValuesEqual(value1, value2) {
        if (!value1 || !value2) {
            return false;
        }
        const { size } = this;
        for (let i = 0; i < size; i++) {
            if (value1[i] !== value2[i]) {
                return false;
            }
        }
        return true;
    }
    _createBuffer(byteLength) {
        if (this._buffer) {
            this._buffer.destroy();
        }
        const { isIndexed, type } = this.settings;
        this._buffer = this.device.createBuffer({
            ...this._buffer?.props,
            id: this.id,
            usage: isIndexed ? Buffer.INDEX : Buffer.VERTEX,
            indexType: isIndexed ? type : undefined,
            byteLength
        });
        return this._buffer;
    }
}
//# sourceMappingURL=data-column.js.map