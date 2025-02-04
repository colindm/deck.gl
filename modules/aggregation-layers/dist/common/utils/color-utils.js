// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
export const defaultColorRange = [
    [255, 255, 178],
    [254, 217, 118],
    [254, 178, 76],
    [253, 141, 60],
    [240, 59, 32],
    [189, 0, 38]
];
// Converts a colorRange array to a flat array with 4 components per color
export function colorRangeToFlatArray(colorRange, normalize = false, ArrayType = Float32Array) {
    let flatArray;
    if (Number.isFinite(colorRange[0])) {
        // its already a flat array.
        flatArray = new ArrayType(colorRange);
    }
    else {
        // flatten it
        flatArray = new ArrayType(colorRange.length * 4);
        let index = 0;
        for (let i = 0; i < colorRange.length; i++) {
            const color = colorRange[i];
            flatArray[index++] = color[0];
            flatArray[index++] = color[1];
            flatArray[index++] = color[2];
            flatArray[index++] = Number.isFinite(color[3]) ? color[3] : 255;
        }
    }
    if (normalize) {
        for (let i = 0; i < flatArray.length; i++) {
            flatArray[i] /= 255;
        }
    }
    return flatArray;
}
export const COLOR_RANGE_FILTER = {
    linear: 'linear',
    quantile: 'nearest',
    quantize: 'nearest',
    ordinal: 'nearest'
};
export function updateColorRangeTexture(texture, type) {
    texture.setSampler({
        minFilter: COLOR_RANGE_FILTER[type],
        magFilter: COLOR_RANGE_FILTER[type]
    });
}
export function createColorRangeTexture(device, colorRange, type = 'linear') {
    const colors = colorRangeToFlatArray(colorRange, false, Uint8Array);
    return device.createTexture({
        format: 'rgba8unorm',
        mipmaps: false,
        sampler: {
            minFilter: COLOR_RANGE_FILTER[type],
            magFilter: COLOR_RANGE_FILTER[type],
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge'
        },
        data: colors,
        width: colors.length / 4,
        height: 1
    });
}
//# sourceMappingURL=color-utils.js.map