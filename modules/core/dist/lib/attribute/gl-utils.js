// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { getTypedArrayFromDataType, getDataTypeFromTypedArray } from '@luma.gl/core';
export function typedArrayFromDataType(type) {
    // Sorted in some order of likelihood to reduce amount of comparisons
    switch (type) {
        case 'float64':
            return Float64Array;
        case 'uint8':
        case 'unorm8':
            return Uint8ClampedArray;
        default:
            return getTypedArrayFromDataType(type);
    }
}
export const dataTypeFromTypedArray = getDataTypeFromTypedArray;
export function getBufferAttributeLayout(name, accessor) {
    return {
        attribute: name,
        // @ts-expect-error Not all combinations are valid vertex formats; it's up to DataColumn to ensure
        format: accessor.size > 1
            ? `${accessor.type}x${accessor.size}`
            : accessor.type,
        byteOffset: accessor.offset || 0
        // Note stride is set on the top level
    };
}
export function getStride(accessor) {
    return accessor.stride || accessor.size * accessor.bytesPerElement;
}
export function bufferLayoutEqual(accessor1, accessor2) {
    return (accessor1.type === accessor2.type &&
        accessor1.size === accessor2.size &&
        getStride(accessor1) === getStride(accessor2) &&
        (accessor1.offset || 0) === (accessor2.offset || 0));
}
//# sourceMappingURL=gl-utils.js.map