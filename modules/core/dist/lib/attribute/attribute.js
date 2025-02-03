// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
/* eslint-disable complexity */
import DataColumn from "./data-column.js";
import assert from "../../utils/assert.js";
import { createIterable, getAccessorFromBuffer } from "../../utils/iterable-utils.js";
import { fillArray } from "../../utils/flatten.js";
import * as range from "../../utils/range.js";
import { bufferLayoutEqual } from "./gl-utils.js";
import { normalizeTransitionSettings } from "./transition-settings.js";
export default class Attribute extends DataColumn {
    constructor(device, opts) {
        super(device, opts, {
            startIndices: null,
            lastExternalBuffer: null,
            binaryValue: null,
            binaryAccessor: null,
            needsUpdate: true,
            needsRedraw: false,
            layoutChanged: false,
            updateRanges: range.FULL
        });
        /** Legacy approach to set attribute value - read `isConstant` instead for attribute state */
        this.constant = false;
        // eslint-disable-next-line
        this.settings.update = opts.update || (opts.accessor ? this._autoUpdater : undefined);
        Object.seal(this.settings);
        Object.seal(this.state);
        // Check all fields and generate helpful error messages
        this._validateAttributeUpdaters();
    }
    get startIndices() {
        return this.state.startIndices;
    }
    set startIndices(layout) {
        this.state.startIndices = layout;
    }
    needsUpdate() {
        return this.state.needsUpdate;
    }
    needsRedraw({ clearChangedFlags = false } = {}) {
        const needsRedraw = this.state.needsRedraw;
        this.state.needsRedraw = needsRedraw && !clearChangedFlags;
        return needsRedraw;
    }
    layoutChanged() {
        return this.state.layoutChanged;
    }
    setAccessor(accessor) {
        var _a;
        (_a = this.state).layoutChanged || (_a.layoutChanged = !bufferLayoutEqual(accessor, this.getAccessor()));
        super.setAccessor(accessor);
    }
    getUpdateTriggers() {
        const { accessor } = this.settings;
        // Backards compatibility: allow attribute name to be used as update trigger key
        return [this.id].concat((typeof accessor !== 'function' && accessor) || []);
    }
    supportsTransition() {
        return Boolean(this.settings.transition);
    }
    // Resolve transition settings object if transition is enabled, otherwise `null`
    getTransitionSetting(opts) {
        if (!opts || !this.supportsTransition()) {
            return null;
        }
        const { accessor } = this.settings;
        // TODO: have the layer resolve these transition settings itself?
        const layerSettings = this.settings.transition;
        // these are the transition settings passed in by the user
        const userSettings = Array.isArray(accessor)
            ? // @ts-ignore
                opts[accessor.find(a => opts[a])]
            : // @ts-ignore
                opts[accessor];
        // Shorthand: use duration instead of parameter object
        return normalizeTransitionSettings(userSettings, layerSettings);
    }
    setNeedsUpdate(reason = this.id, dataRange) {
        this.state.needsUpdate = this.state.needsUpdate || reason;
        this.setNeedsRedraw(reason);
        if (dataRange) {
            const { startRow = 0, endRow = Infinity } = dataRange;
            this.state.updateRanges = range.add(this.state.updateRanges, [startRow, endRow]);
        }
        else {
            this.state.updateRanges = range.FULL;
        }
    }
    clearNeedsUpdate() {
        this.state.needsUpdate = false;
        this.state.updateRanges = range.EMPTY;
    }
    setNeedsRedraw(reason = this.id) {
        this.state.needsRedraw = this.state.needsRedraw || reason;
    }
    allocate(numInstances) {
        const { state, settings } = this;
        if (settings.noAlloc) {
            // Data is provided through a Buffer object.
            return false;
        }
        if (settings.update) {
            super.allocate(numInstances, state.updateRanges !== range.FULL);
            return true;
        }
        return false;
    }
    updateBuffer({ numInstances, data, props, context }) {
        if (!this.needsUpdate()) {
            return false;
        }
        const { state: { updateRanges }, settings: { update, noAlloc } } = this;
        let updated = true;
        if (update) {
            // Custom updater - typically for non-instanced layers
            for (const [startRow, endRow] of updateRanges) {
                update.call(context, this, { data, startRow, endRow, props, numInstances });
            }
            if (!this.value) {
                // no value was assigned during update
            }
            else if (this.constant ||
                !this.buffer ||
                this.buffer.byteLength < this.value.byteLength + this.byteOffset) {
                this.setData({
                    value: this.value,
                    constant: this.constant
                });
                // Setting attribute.constant in updater is a legacy approach that interferes with allocation in the next cycle
                // Respect it here but reset after use
                this.constant = false;
            }
            else {
                for (const [startRow, endRow] of updateRanges) {
                    const startOffset = Number.isFinite(startRow) ? this.getVertexOffset(startRow) : 0;
                    const endOffset = Number.isFinite(endRow)
                        ? this.getVertexOffset(endRow)
                        : noAlloc || !Number.isFinite(numInstances)
                            ? this.value.length
                            : numInstances * this.size;
                    super.updateSubBuffer({ startOffset, endOffset });
                }
            }
            this._checkAttributeArray();
        }
        else {
            updated = false;
        }
        this.clearNeedsUpdate();
        this.setNeedsRedraw();
        return updated;
    }
    // Use generic value
    // Returns true if successful
    setConstantValue(value) {
        if (value === undefined || typeof value === 'function') {
            return false;
        }
        const hasChanged = this.setData({ constant: true, value });
        if (hasChanged) {
            this.setNeedsRedraw();
        }
        this.clearNeedsUpdate();
        return true;
    }
    // Use external buffer
    // Returns true if successful
    // eslint-disable-next-line max-statements
    setExternalBuffer(buffer) {
        const { state } = this;
        if (!buffer) {
            state.lastExternalBuffer = null;
            return false;
        }
        this.clearNeedsUpdate();
        if (state.lastExternalBuffer === buffer) {
            return true;
        }
        state.lastExternalBuffer = buffer;
        this.setNeedsRedraw();
        this.setData(buffer);
        return true;
    }
    // Binary value is a typed array packed from mapping the source data with the accessor
    // If the returned value from the accessor is the same as the attribute value, set it directly
    // Otherwise use the auto updater for transform/normalization
    setBinaryValue(buffer, startIndices = null) {
        const { state, settings } = this;
        if (!buffer) {
            state.binaryValue = null;
            state.binaryAccessor = null;
            return false;
        }
        if (settings.noAlloc) {
            // Let the layer handle this
            return false;
        }
        if (state.binaryValue === buffer) {
            this.clearNeedsUpdate();
            return true;
        }
        state.binaryValue = buffer;
        this.setNeedsRedraw();
        const needsUpdate = settings.transform || startIndices !== this.startIndices;
        if (needsUpdate) {
            if (ArrayBuffer.isView(buffer)) {
                buffer = { value: buffer };
            }
            const binaryValue = buffer;
            assert(ArrayBuffer.isView(binaryValue.value), `invalid ${settings.accessor}`);
            const needsNormalize = Boolean(binaryValue.size) && binaryValue.size !== this.size;
            state.binaryAccessor = getAccessorFromBuffer(binaryValue.value, {
                size: binaryValue.size || this.size,
                stride: binaryValue.stride,
                offset: binaryValue.offset,
                startIndices: startIndices,
                nested: needsNormalize
            });
            // Fall through to auto updater
            return false;
        }
        this.clearNeedsUpdate();
        this.setData(buffer);
        return true;
    }
    getVertexOffset(row) {
        const { startIndices } = this;
        const vertexIndex = startIndices
            ? row < startIndices.length
                ? startIndices[row]
                : this.numInstances
            : row;
        return vertexIndex * this.size;
    }
    getValue() {
        const shaderAttributeDefs = this.settings.shaderAttributes;
        const result = super.getValue();
        if (!shaderAttributeDefs) {
            return result;
        }
        for (const shaderAttributeName in shaderAttributeDefs) {
            Object.assign(result, super.getValue(shaderAttributeName, shaderAttributeDefs[shaderAttributeName]));
        }
        return result;
    }
    /** Generate WebGPU-style buffer layout descriptor from this attribute */
    getBufferLayout(
    /** A luma.gl Model-shaped object that supplies additional hint to attribute resolution */
    modelInfo) {
        // Clear change flag
        this.state.layoutChanged = false;
        const shaderAttributeDefs = this.settings.shaderAttributes;
        const result = super._getBufferLayout();
        const { stepMode } = this.settings;
        if (stepMode === 'dynamic') {
            // If model info is provided, use isInstanced flag to determine step mode
            // If no model info is provided, assume it's an instanced model (most common use case)
            result.stepMode = modelInfo ? (modelInfo.isInstanced ? 'instance' : 'vertex') : 'instance';
        }
        else {
            result.stepMode = stepMode ?? 'vertex';
        }
        if (!shaderAttributeDefs) {
            return result;
        }
        for (const shaderAttributeName in shaderAttributeDefs) {
            const map = super._getBufferLayout(shaderAttributeName, shaderAttributeDefs[shaderAttributeName]);
            // @ts-ignore
            result.attributes.push(...map.attributes);
        }
        return result;
    }
    /* eslint-disable max-depth, max-statements */
    _autoUpdater(attribute, { data, startRow, endRow, props, numInstances }) {
        if (attribute.constant) {
            return;
        }
        const { settings, state, value, size, startIndices } = attribute;
        const { accessor, transform } = settings;
        const accessorFunc = state.binaryAccessor ||
            // @ts-ignore
            (typeof accessor === 'function' ? accessor : props[accessor]);
        assert(typeof accessorFunc === 'function', `accessor "${accessor}" is not a function`);
        let i = attribute.getVertexOffset(startRow);
        const { iterable, objectInfo } = createIterable(data, startRow, endRow);
        for (const object of iterable) {
            objectInfo.index++;
            let objectValue = accessorFunc(object, objectInfo);
            if (transform) {
                // transform callbacks could be bound to a particular layer instance.
                // always point `this` to the current layer.
                objectValue = transform.call(this, objectValue);
            }
            if (startIndices) {
                const numVertices = (objectInfo.index < startIndices.length - 1
                    ? startIndices[objectInfo.index + 1]
                    : numInstances) - startIndices[objectInfo.index];
                if (objectValue && Array.isArray(objectValue[0])) {
                    let startIndex = i;
                    for (const item of objectValue) {
                        attribute._normalizeValue(item, value, startIndex);
                        startIndex += size;
                    }
                }
                else if (objectValue && objectValue.length > size) {
                    value.set(objectValue, i);
                }
                else {
                    attribute._normalizeValue(objectValue, objectInfo.target, 0);
                    fillArray({
                        target: value,
                        source: objectInfo.target,
                        start: i,
                        count: numVertices
                    });
                }
                i += numVertices * size;
            }
            else {
                attribute._normalizeValue(objectValue, value, i);
                i += size;
            }
        }
    }
    /* eslint-enable max-depth, max-statements */
    // Validate deck.gl level fields
    _validateAttributeUpdaters() {
        const { settings } = this;
        // Check that 'update' is a valid function
        const hasUpdater = settings.noAlloc || typeof settings.update === 'function';
        if (!hasUpdater) {
            throw new Error(`Attribute ${this.id} missing update or accessor`);
        }
    }
    // check that the first few elements of the attribute are reasonable
    /* eslint-disable no-fallthrough */
    _checkAttributeArray() {
        const { value } = this;
        const limit = Math.min(4, this.size);
        if (value && value.length >= limit) {
            let valid = true;
            switch (limit) {
                case 4:
                    valid = valid && Number.isFinite(value[3]);
                case 3:
                    valid = valid && Number.isFinite(value[2]);
                case 2:
                    valid = valid && Number.isFinite(value[1]);
                case 1:
                    valid = valid && Number.isFinite(value[0]);
                    break;
                default:
                    valid = false;
            }
            if (!valid) {
                throw new Error(`Illegal attribute generated for ${this.id}`);
            }
        }
    }
}
//# sourceMappingURL=attribute.js.map