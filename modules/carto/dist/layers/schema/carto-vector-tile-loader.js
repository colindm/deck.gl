// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import earcut from 'earcut';
import { TileReader } from "./carto-tile.js";
import { parsePbf } from "./tile-loader-utils.js";
import { getWorkerUrl } from "../../utils.js";
const VERSION = typeof "9.1.0-beta.3" !== 'undefined' ? "9.1.0-beta.3" : 'latest';
const id = 'cartoVectorTile';
const DEFAULT_OPTIONS = {
    cartoVectorTile: {
        workerUrl: getWorkerUrl(id, VERSION)
    }
};
const CartoVectorTileLoader = {
    name: 'CARTO Vector Tile',
    version: VERSION,
    id,
    module: 'carto',
    extensions: ['pbf'],
    mimeTypes: ['application/vnd.carto-vector-tile'],
    category: 'geometry',
    parse: async (arrayBuffer, options) => parseCartoVectorTile(arrayBuffer, options),
    parseSync: parseCartoVectorTile,
    worker: true,
    options: DEFAULT_OPTIONS
};
function triangulatePolygon(polygons, target, { startPosition, endPosition, indices }) {
    const coordLength = polygons.positions.size;
    const start = startPosition * coordLength;
    const end = endPosition * coordLength;
    // Extract positions and holes for just this polygon
    const polygonPositions = polygons.positions.value.subarray(start, end);
    // Holes are referenced relative to outer polygon
    const holes = indices.slice(1).map((n) => n - startPosition);
    // Compute triangulation
    const triangles = earcut(polygonPositions, holes, coordLength);
    // Indices returned by triangulation are relative to start
    // of polygon, so we need to offset
    for (let t = 0, tl = triangles.length; t < tl; ++t) {
        target.push(startPosition + triangles[t]);
    }
}
function triangulate(polygons) {
    const { polygonIndices, primitivePolygonIndices } = polygons;
    const triangles = [];
    let rangeStart = 0;
    for (let i = 0; i < polygonIndices.value.length - 1; i++) {
        const startPosition = polygonIndices.value[i];
        const endPosition = polygonIndices.value[i + 1];
        // Extract hole indices between start & end position
        const rangeEnd = primitivePolygonIndices.value.indexOf(endPosition);
        const indices = primitivePolygonIndices.value.subarray(rangeStart, rangeEnd);
        rangeStart = rangeEnd;
        triangulatePolygon(polygons, triangles, { startPosition, endPosition, indices });
    }
    polygons.triangles = { value: new Uint32Array(triangles), size: 1 };
}
function parseCartoVectorTile(arrayBuffer, options) {
    if (!arrayBuffer)
        return null;
    const tile = parsePbf(arrayBuffer, TileReader);
    if (tile.polygons && !tile.polygons.triangles) {
        triangulate(tile.polygons);
    }
    return tile;
}
export default CartoVectorTileLoader;
//# sourceMappingURL=carto-vector-tile-loader.js.map