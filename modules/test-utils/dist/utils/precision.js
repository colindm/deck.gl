// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
/**
 * Covert all numbers in a deep structure to a given precision, allowing
 * reliable float comparisons. Converts data in-place.
 */
export function toLowPrecision(input, precision = 11) {
    /* eslint-disable guard-for-in */
    if (typeof input === 'number') {
        return Number(input.toPrecision(precision));
    }
    if (Array.isArray(input)) {
        return input.map(item => toLowPrecision(item, precision));
    }
    if (typeof input === 'object') {
        for (const key in input) {
            input[key] = toLowPrecision(input[key], precision);
        }
    }
    return input;
}
//# sourceMappingURL=precision.js.map