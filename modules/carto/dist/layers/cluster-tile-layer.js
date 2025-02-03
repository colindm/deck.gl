// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { GeoJsonLayer } from '@deck.gl/layers';
import { TileLayer } from '@deck.gl/geo-layers';
import { registerLoaders } from '@loaders.gl/core';
import { binaryToGeojson } from '@loaders.gl/gis';
import { CompositeLayer, _deepEqual as deepEqual } from '@deck.gl/core';
import { aggregateTile, clustersToBinary, computeAggregationStats, extractAggregationProperties } from "./cluster-utils.js";
import { DEFAULT_TILE_SIZE } from "../constants.js";
import QuadbinTileset2D from "./quadbin-tileset-2d.js";
import { getQuadbinPolygon } from "./quadbin-utils.js";
import CartoSpatialTileLoader from "./schema/carto-spatial-tile-loader.js";
import { injectAccessToken, TilejsonPropType } from "./utils.js";
registerLoaders([CartoSpatialTileLoader]);
const defaultProps = {
    data: TilejsonPropType,
    clusterLevel: { type: 'number', value: 5, min: 1 },
    getPosition: {
        type: 'accessor',
        value: ({ id }) => getQuadbinPolygon(id, 0.5).slice(2, 4)
    },
    getWeight: { type: 'accessor', value: 1 },
    refinementStrategy: 'no-overlap',
    tileSize: DEFAULT_TILE_SIZE
};
class ClusterGeoJsonLayer extends TileLayer {
    initializeState() {
        super.initializeState();
        this.state.aggregationCache = new WeakMap();
    }
    // eslint-disable-next-line max-statements
    renderLayers() {
        const visibleTiles = this.state.tileset?.tiles.filter((tile) => {
            return tile.isLoaded && tile.content && this.state.tileset.isTileVisible(tile);
        });
        if (!visibleTiles?.length) {
            return null;
        }
        visibleTiles.sort((a, b) => b.zoom - a.zoom);
        const { zoom } = this.context.viewport;
        const { clusterLevel, getPosition, getWeight } = this.props;
        const { aggregationCache } = this.state;
        const properties = extractAggregationProperties(visibleTiles[0]);
        const data = [];
        let needsUpdate = false;
        for (const tile of visibleTiles) {
            // Calculate aggregation based on viewport zoom
            const overZoom = Math.round(zoom - tile.zoom);
            const aggregationLevels = Math.round(clusterLevel) - overZoom;
            let tileAggregationCache = aggregationCache.get(tile.content);
            if (!tileAggregationCache) {
                tileAggregationCache = new Map();
                aggregationCache.set(tile.content, tileAggregationCache);
            }
            const didAggregate = aggregateTile(tile, tileAggregationCache, aggregationLevels, properties, getPosition, getWeight);
            needsUpdate || (needsUpdate = didAggregate);
            data.push(...tileAggregationCache.get(aggregationLevels));
        }
        data.sort((a, b) => Number(b.count - a.count));
        const clusterIds = data?.map((tile) => tile.id);
        needsUpdate || (needsUpdate = !deepEqual(clusterIds, this.state.clusterIds, 1));
        this.setState({ clusterIds });
        if (needsUpdate) {
            const stats = computeAggregationStats(data, properties);
            const binaryData = clustersToBinary(data);
            binaryData.points.attributes = { stats };
            this.setState({ data: binaryData });
        }
        const props = {
            ...this.props,
            id: 'clusters',
            data: this.state.data,
            dataComparator: (data, oldData) => {
                const newIds = data?.points?.properties?.map((tile) => tile.id);
                const oldIds = oldData?.points?.properties?.map((tile) => tile.id);
                return deepEqual(newIds, oldIds, 1);
            }
        };
        return new GeoJsonLayer(this.getSubLayerProps(props));
    }
    getPickingInfo(params) {
        const info = params.info;
        if (info.index !== -1) {
            const { data } = params.sourceLayer.props;
            info.object = binaryToGeojson(data, {
                globalFeatureId: info.index
            });
        }
        return info;
    }
    _updateAutoHighlight(info) {
        for (const layer of this.getSubLayers()) {
            layer.updateAutoHighlight(info);
        }
    }
    filterSubLayer() {
        return true;
    }
}
ClusterGeoJsonLayer.layerName = 'ClusterGeoJsonLayer';
ClusterGeoJsonLayer.defaultProps = defaultProps;
// Adapter layer around ClusterLayer that converts tileJSON into TileLayer API
class ClusterTileLayer extends CompositeLayer {
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
        return [
            // @ts-ignore
            new ClusterGeoJsonLayer(this.props, {
                id: `cluster-geojson-layer-${this.props.id}`,
                data,
                // TODO: Tileset2D should be generic over TileIndex type
                TilesetClass: QuadbinTileset2D,
                maxZoom,
                loadOptions: this.getLoadOptions()
            })
        ];
    }
}
ClusterTileLayer.layerName = 'ClusterTileLayer';
ClusterTileLayer.defaultProps = defaultProps;
export default ClusterTileLayer;
//# sourceMappingURL=cluster-tile-layer.js.map