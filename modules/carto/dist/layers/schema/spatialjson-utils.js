// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { bigIntToHex } from 'quadbin';
export function binaryToSpatialjson(binary) {
    const { cells, scheme } = binary;
    const count = cells.indices.value.length;
    const spatial = [];
    for (let i = 0; i < count; i++) {
        const id = scheme === 'h3' ? bigIntToHex(cells.indices.value[i]) : cells.indices.value[i];
        const properties = { ...cells.properties[i] };
        for (const key of Object.keys(cells.numericProps)) {
            properties[key] = cells.numericProps[key].value[i];
        }
        spatial.push({ id, properties });
    }
    return spatial;
}
//# sourceMappingURL=spatialjson-utils.js.map