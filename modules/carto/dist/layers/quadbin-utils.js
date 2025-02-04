// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { worldToLngLat } from '@math.gl/web-mercator';
import { cellToTile } from 'quadbin';
const TILE_SIZE = 512;
export function quadbinToOffset(quadbin) {
    const { x, y, z } = cellToTile(quadbin);
    const scale = TILE_SIZE / (1 << z);
    return [x * scale, TILE_SIZE - y * scale, scale];
}
export function quadbinToWorldBounds(quadbin, coverage) {
    const [xOffset, yOffset, scale] = quadbinToOffset(quadbin);
    return [
        [xOffset, yOffset],
        [xOffset + coverage * scale, yOffset - coverage * scale]
    ];
}
export function getQuadbinPolygon(quadbin, coverage = 1) {
    const [topLeft, bottomRight] = quadbinToWorldBounds(quadbin, coverage);
    const [w, n] = worldToLngLat(topLeft);
    const [e, s] = worldToLngLat(bottomRight);
    return [e, n, e, s, w, s, w, n, e, n];
}
//# sourceMappingURL=quadbin-utils.js.map