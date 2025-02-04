// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { TileReader } from "./carto-raster-tile.js";
import { parsePbf } from "./tile-loader-utils.js";
import { getWorkerUrl } from "../../utils.js";
const VERSION = typeof "9.1.0-beta.3" !== 'undefined' ? "9.1.0-beta.3" : 'latest';
const id = 'cartoRasterTile';
const DEFAULT_OPTIONS = {
    cartoRasterTile: {
        metadata: null,
        workerUrl: getWorkerUrl(id, VERSION)
    }
};
const CartoRasterTileLoader = {
    name: 'CARTO Raster Tile',
    version: VERSION,
    id,
    module: 'carto',
    extensions: ['pbf'],
    mimeTypes: ['application/vnd.carto-raster-tile'],
    category: 'geometry',
    parse: async (arrayBuffer, options) => parseCartoRasterTile(arrayBuffer, options),
    parseSync: parseCartoRasterTile,
    worker: true,
    options: DEFAULT_OPTIONS
};
function parseCartoRasterTile(arrayBuffer, options) {
    const metadata = options?.cartoRasterTile?.metadata;
    if (!arrayBuffer || !metadata)
        return null;
    // @ts-expect-error Upstream type needs to be updated
    TileReader.compression = metadata.compression;
    const out = parsePbf(arrayBuffer, TileReader);
    const { bands, blockSize } = out;
    const numericProps = {};
    for (let i = 0; i < bands.length; i++) {
        const { name, data } = bands[i];
        numericProps[name] = data;
    }
    return { blockSize, cells: { numericProps, properties: [] } };
}
export default CartoRasterTileLoader;
//# sourceMappingURL=carto-raster-tile-loader.js.map