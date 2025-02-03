// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { TileReader } from "./carto-spatial-tile.js";
import { parsePbf } from "./tile-loader-utils.js";
import { getWorkerUrl } from "../../utils.js";
import { binaryToSpatialjson } from "./spatialjson-utils.js";
const VERSION = typeof "9.1.0-beta.3" !== 'undefined' ? "9.1.0-beta.3" : 'latest';
const id = 'cartoSpatialTile';
const DEFAULT_OPTIONS = {
    cartoSpatialTile: {
        scheme: 'quadbin',
        workerUrl: getWorkerUrl(id, VERSION)
    }
};
const CartoSpatialTileLoader = {
    name: 'CARTO Spatial Tile',
    version: VERSION,
    id,
    module: 'carto',
    extensions: ['pbf'],
    mimeTypes: ['application/vnd.carto-spatial-tile'],
    category: 'geometry',
    parse: async (arrayBuffer, options) => parseCartoSpatialTile(arrayBuffer, options),
    parseSync: parseCartoSpatialTile,
    worker: true,
    options: DEFAULT_OPTIONS
};
function parseCartoSpatialTile(arrayBuffer, options) {
    if (!arrayBuffer)
        return null;
    const tile = parsePbf(arrayBuffer, TileReader);
    const { cells } = tile;
    const scheme = options?.cartoSpatialTile?.scheme;
    const data = { cells, scheme };
    return binaryToSpatialjson(data);
}
export default CartoSpatialTileLoader;
//# sourceMappingURL=carto-spatial-tile-loader.js.map