// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { CompositeLayer } from '@deck.gl/core';
import QuadbinLayer from "./quadbin-layer.js";
import QuadbinTileset2D from "./quadbin-tileset-2d.js";
import SpatialIndexTileLayer from "./spatial-index-tile-layer.js";
import { hexToBigInt } from 'quadbin';
import { injectAccessToken, TilejsonPropType } from "./utils.js";
import { DEFAULT_TILE_SIZE } from "../constants.js";
export const renderSubLayers = props => {
    const { data } = props;
    if (!data || !data.length)
        return null;
    const isBigInt = typeof data[0].id === 'bigint';
    return new QuadbinLayer(props, {
        getQuadbin: isBigInt ? d => d.id : d => hexToBigInt(d.id)
    });
};
const defaultProps = {
    data: TilejsonPropType,
    tileSize: DEFAULT_TILE_SIZE
};
class QuadbinTileLayer extends CompositeLayer {
    getLoadOptions() {
        const loadOptions = super.getLoadOptions() || {};
        const tileJSON = this.props.data;
        injectAccessToken(loadOptions, tileJSON.accessToken);
        loadOptions.cartoSpatialTile = { ...loadOptions.cartoSpatialTile, scheme: 'quadbin' };
        return loadOptions;
    }
    renderLayers() {
        const tileJSON = this.props.data;
        if (!tileJSON)
            return null;
        const { tiles: data, maxresolution: maxZoom } = tileJSON;
        const SubLayerClass = this.getSubLayerClass('spatial-index-tile', SpatialIndexTileLayer);
        return new SubLayerClass(this.props, {
            id: `quadbin-tile-layer-${this.props.id}`,
            data,
            // TODO: Tileset2D should be generic over TileIndex type
            TilesetClass: QuadbinTileset2D,
            renderSubLayers,
            maxZoom,
            loadOptions: this.getLoadOptions()
        });
    }
}
QuadbinTileLayer.layerName = 'QuadbinTileLayer';
QuadbinTileLayer.defaultProps = defaultProps;
export default QuadbinTileLayer;
//# sourceMappingURL=quadbin-tile-layer.js.map