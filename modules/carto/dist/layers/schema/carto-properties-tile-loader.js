// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { TileReader } from "./carto-properties-tile.js";
import { parsePbf } from "./tile-loader-utils.js";
const CartoPropertiesTileLoader = {
    name: 'CARTO Properties Tile',
    version: '1',
    id: 'cartoPropertiesTile',
    module: 'carto',
    extensions: ['pbf'],
    mimeTypes: ['application/vnd.carto-properties-tile'],
    category: 'geometry',
    worker: true,
    parse: async (arrayBuffer, options) => parseCartoPropertiesTile(arrayBuffer, options),
    parseSync: parseCartoPropertiesTile,
    options: {}
};
function parseCartoPropertiesTile(arrayBuffer, options) {
    if (!arrayBuffer)
        return null;
    return parsePbf(arrayBuffer, TileReader);
}
export default CartoPropertiesTileLoader;
//# sourceMappingURL=carto-properties-tile-loader.js.map