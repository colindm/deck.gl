// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { registerLoaders } from '@loaders.gl/core';
import CartoRasterTileLoader from "./schema/carto-raster-tile-loader.js";
import CartoSpatialTileLoader from "./schema/carto-spatial-tile-loader.js";
registerLoaders([CartoRasterTileLoader, CartoSpatialTileLoader]);
import { TileLayer } from '@deck.gl/geo-layers';
import { DEFAULT_TILE_SIZE } from "../constants.js";
function isFeatureIdDefined(value) {
    return value !== undefined && value !== null && value !== '';
}
const defaultProps = {
    tileSize: DEFAULT_TILE_SIZE
};
class SpatialIndexTileLayer extends TileLayer {
    _updateAutoHighlight(info) {
        const { hoveredFeatureId } = this.state;
        const hoveredFeature = info.object;
        let newHoveredFeatureId = null;
        if (hoveredFeature) {
            newHoveredFeatureId = hoveredFeature.id;
        }
        if (hoveredFeatureId !== newHoveredFeatureId) {
            let { highlightColor } = this.props;
            if (typeof highlightColor === 'function') {
                highlightColor = highlightColor(info);
            }
            this.setState({
                highlightColor,
                hoveredFeatureId: newHoveredFeatureId
            });
        }
    }
    getSubLayerPropsByTile(tile) {
        return {
            highlightedObjectIndex: this.getHighlightedObjectIndex(tile),
            highlightColor: this.state.highlightColor
        };
    }
    getHighlightedObjectIndex(tile) {
        const { hoveredFeatureId } = this.state;
        const data = tile.content;
        const isFeatureIdPresent = isFeatureIdDefined(hoveredFeatureId);
        if (!isFeatureIdPresent ||
            !Array.isArray(data) ||
            // Quick check for whether id is within tile. data.findIndex is expensive
            !this._featureInTile(tile, hoveredFeatureId)) {
            return -1;
        }
        return data.findIndex(feature => feature.id === hoveredFeatureId);
    }
    _featureInTile(tile, featureId) {
        // TODO: Tile2DHeader index should be generic for H3TileIndex or QuadbinTileIndex
        const tileset = this.state.tileset;
        const tileZoom = tileset.getTileZoom(tile.index);
        // @ts-ignore
        const KEY = tile.index.q ? 'q' : 'i';
        // TODO - Tileset2D methods expect tile index in the shape of {x, y, z}
        let featureIndex = { [KEY]: featureId };
        let featureZoom = tileset.getTileZoom(featureIndex);
        while (!(featureZoom <= tileZoom)) {
            featureIndex = tileset.getParentIndex(featureIndex);
            featureZoom = tileset.getTileZoom(featureIndex);
        }
        return featureIndex[KEY] === tile.index[KEY];
    }
}
SpatialIndexTileLayer.layerName = 'SpatialIndexTileLayer';
SpatialIndexTileLayer.defaultProps = defaultProps;
export default SpatialIndexTileLayer;
//# sourceMappingURL=spatial-index-tile-layer.js.map