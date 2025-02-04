// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { CompositeLayer } from '@deck.gl/core';
import { H3HexagonLayer } from '@deck.gl/geo-layers';
import H3Tileset2D, { getHexagonResolution } from "./h3-tileset-2d.js";
import SpatialIndexTileLayer from "./spatial-index-tile-layer.js";
import { injectAccessToken, TilejsonPropType } from "./utils.js";
import { DEFAULT_TILE_SIZE } from "../constants.js";
export const renderSubLayers = props => {
    const { data } = props;
    const { index } = props.tile;
    if (!data || !data.length)
        return null;
    return new H3HexagonLayer(props, {
        getHexagon: d => d.id,
        centerHexagon: index,
        highPrecision: true
    });
};
const defaultProps = {
    data: TilejsonPropType,
    tileSize: DEFAULT_TILE_SIZE
};
class H3TileLayer extends CompositeLayer {
    initializeState() {
        H3HexagonLayer._checkH3Lib();
    }
    getLoadOptions() {
        const loadOptions = super.getLoadOptions() || {};
        const tileJSON = this.props.data;
        injectAccessToken(loadOptions, tileJSON.accessToken);
        loadOptions.cartoSpatialTile = { ...loadOptions.cartoSpatialTile, scheme: 'h3' };
        return loadOptions;
    }
    renderLayers() {
        const tileJSON = this.props.data;
        if (!tileJSON)
            return null;
        const { tiles: data } = tileJSON;
        let { minresolution, maxresolution } = tileJSON;
        // Convert Mercator zooms provided in props into H3 res levels
        // and clip into valid range provided from the tilejson
        if (this.props.minZoom) {
            minresolution = Math.max(minresolution, getHexagonResolution({ zoom: this.props.minZoom, latitude: 0 }, this.props.tileSize));
        }
        if (this.props.maxZoom) {
            maxresolution = Math.min(maxresolution, getHexagonResolution({ zoom: this.props.maxZoom, latitude: 0 }, this.props.tileSize));
        }
        const SubLayerClass = this.getSubLayerClass('spatial-index-tile', SpatialIndexTileLayer);
        // The naming is unfortunate, but minZoom & maxZoom in the context
        // of a Tileset2D refer to the resolution levels, not the Mercator zooms
        return new SubLayerClass(this.props, {
            id: `h3-tile-layer-${this.props.id}`,
            data,
            // TODO: Tileset2D should be generic over TileIndex type
            TilesetClass: H3Tileset2D,
            renderSubLayers,
            // minZoom and maxZoom are H3 resolutions, however we must use this naming as that is what the Tileset2D class expects
            minZoom: minresolution,
            maxZoom: maxresolution,
            loadOptions: this.getLoadOptions()
        });
    }
}
H3TileLayer.layerName = 'H3TileLayer';
H3TileLayer.defaultProps = defaultProps;
export default H3TileLayer;
//# sourceMappingURL=h3-tile-layer.js.map