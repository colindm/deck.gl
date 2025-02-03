// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { registerLoaders } from '@loaders.gl/core';
import CartoPropertiesTileLoader from "./schema/carto-properties-tile-loader.js";
import CartoVectorTileLoader from "./schema/carto-vector-tile-loader.js";
registerLoaders([CartoPropertiesTileLoader, CartoVectorTileLoader]);
import { ClipExtension } from '@deck.gl/extensions';
import { MVTLayer, _getURLFromTemplate } from '@deck.gl/geo-layers';
import { GeoJsonLayer } from '@deck.gl/layers';
import { TilejsonPropType, injectAccessToken, mergeBoundaryData } from "./utils.js";
import { DEFAULT_TILE_SIZE } from "../constants.js";
const defaultProps = {
    ...MVTLayer.defaultProps,
    data: TilejsonPropType,
    dataComparator: TilejsonPropType.equal,
    tileSize: DEFAULT_TILE_SIZE
};
// @ts-ignore
class VectorTileLayer extends MVTLayer {
    constructor(...propObjects) {
        // Force externally visible props type, as it is not possible modify via extension
        // @ts-ignore
        super(...propObjects);
    }
    initializeState() {
        super.initializeState();
        this.setState({ binary: true });
    }
    updateState(parameters) {
        const { props } = parameters;
        if (props.data) {
            super.updateState(parameters);
            const formatTiles = new URL(props.data.tiles[0]).searchParams.get('formatTiles');
            const mvt = formatTiles === 'mvt';
            this.setState({ mvt });
        }
    }
    getLoadOptions() {
        const loadOptions = super.getLoadOptions() || {};
        const tileJSON = this.props.data;
        injectAccessToken(loadOptions, tileJSON.accessToken);
        loadOptions.gis = { format: 'binary' }; // Use binary for MVT loading
        return loadOptions;
    }
    /* eslint-disable camelcase */
    async getTileData(tile) {
        const tileJSON = this.props.data;
        const { tiles, properties_tiles } = tileJSON;
        const url = _getURLFromTemplate(tiles, tile);
        if (!url) {
            return Promise.reject('Invalid URL');
        }
        const loadOptions = this.getLoadOptions();
        const { fetch } = this.props;
        const { signal } = tile;
        // Fetch geometry and attributes separately
        const geometryFetch = fetch(url, { propName: 'data', layer: this, loadOptions, signal });
        if (!properties_tiles) {
            return await geometryFetch;
        }
        const propertiesUrl = _getURLFromTemplate(properties_tiles, tile);
        if (!propertiesUrl) {
            return Promise.reject('Invalid properties URL');
        }
        const attributesFetch = fetch(propertiesUrl, {
            propName: 'data',
            layer: this,
            loadOptions,
            signal
        });
        const [geometry, attributes] = await Promise.all([geometryFetch, attributesFetch]);
        if (!geometry)
            return null;
        return attributes ? mergeBoundaryData(geometry, attributes) : geometry;
    }
    /* eslint-enable camelcase */
    renderSubLayers(props) {
        if (props.data === null) {
            return null;
        }
        if (this.state.mvt) {
            return super.renderSubLayers(props);
        }
        const tileBbox = props.tile.bbox;
        const { west, south, east, north } = tileBbox;
        const extensions = [new ClipExtension(), ...(props.extensions || [])];
        const clipProps = {
            clipBounds: [west, south, east, north]
        };
        const applyClipExtensionToSublayerProps = (subLayerId) => {
            return {
                [subLayerId]: {
                    ...clipProps,
                    ...props?._subLayerProps?.[subLayerId],
                    extensions: [...extensions, ...(props?._subLayerProps?.[subLayerId]?.extensions || [])]
                }
            };
        };
        const subLayerProps = {
            ...props,
            autoHighlight: false,
            // Do not perform clipping on points (#9059)
            _subLayerProps: {
                ...props._subLayerProps,
                ...applyClipExtensionToSublayerProps('polygons-fill'),
                ...applyClipExtensionToSublayerProps('polygons-stroke'),
                ...applyClipExtensionToSublayerProps('linestrings')
            }
        };
        const subLayer = new GeoJsonLayer(subLayerProps);
        return subLayer;
    }
    _isWGS84() {
        // CARTO binary tile coordinates are [lng, lat], not tile-relative like MVT.
        if (this.state.mvt)
            return super._isWGS84();
        return true;
    }
}
VectorTileLayer.layerName = 'VectorTileLayer';
VectorTileLayer.defaultProps = defaultProps;
export default VectorTileLayer;
//# sourceMappingURL=vector-tile-layer.js.map