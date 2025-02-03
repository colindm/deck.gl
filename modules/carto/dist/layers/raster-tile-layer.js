// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { CompositeLayer } from '@deck.gl/core';
import RasterLayer from "./raster-layer.js";
import QuadbinTileset2D from "./quadbin-tileset-2d.js";
import { injectAccessToken, TilejsonPropType } from "./utils.js";
import { DEFAULT_TILE_SIZE } from "../constants.js";
import { TileLayer } from '@deck.gl/geo-layers';
import { copy, PostProcessModifier } from "./post-process-utils.js";
export const renderSubLayers = props => {
    const tileIndex = props.tile?.index?.q;
    if (!tileIndex)
        return null;
    return new RasterLayer(props, { tileIndex });
};
const defaultProps = {
    data: TilejsonPropType,
    refinementStrategy: 'no-overlap',
    tileSize: DEFAULT_TILE_SIZE
};
class PostProcessTileLayer extends PostProcessModifier(TileLayer, copy) {
    filterSubLayer(context) {
        // Handle DrawCallbackLayer
        const { tile } = context.layer.props;
        if (!tile)
            return true;
        return super.filterSubLayer(context);
    }
}
class RasterTileLayer extends CompositeLayer {
    getLoadOptions() {
        const loadOptions = super.getLoadOptions() || {};
        const tileJSON = this.props.data;
        injectAccessToken(loadOptions, tileJSON.accessToken);
        return loadOptions;
    }
    renderLayers() {
        const tileJSON = this.props.data;
        if (!tileJSON)
            return null;
        const { tiles: data, minzoom: minZoom, maxzoom: maxZoom, raster_metadata: metadata } = tileJSON;
        const SubLayerClass = this.getSubLayerClass('tile', PostProcessTileLayer);
        return new SubLayerClass(this.props, {
            id: `raster-tile-layer-${this.props.id}`,
            data,
            // TODO: Tileset2D should be generic over TileIndex type
            TilesetClass: QuadbinTileset2D,
            renderSubLayers,
            minZoom,
            maxZoom,
            loadOptions: {
                cartoRasterTile: { metadata },
                ...this.getLoadOptions()
            }
        });
    }
}
RasterTileLayer.layerName = 'RasterTileLayer';
RasterTileLayer.defaultProps = defaultProps;
export default RasterTileLayer;
//# sourceMappingURL=raster-tile-layer.js.map