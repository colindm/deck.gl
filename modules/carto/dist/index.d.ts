import { default as ClusterTileLayer } from "./layers/cluster-tile-layer.js";
import { default as H3TileLayer } from "./layers/h3-tile-layer.js";
import { default as HeatmapTileLayer } from "./layers/heatmap-tile-layer.js";
import { default as PointLabelLayer } from "./layers/point-label-layer.js";
import { default as QuadbinTileLayer } from "./layers/quadbin-tile-layer.js";
import { default as RasterTileLayer } from "./layers/raster-tile-layer.js";
import { default as VectorTileLayer } from "./layers/vector-tile-layer.js";
declare const CARTO_LAYERS: {
    ClusterTileLayer: typeof ClusterTileLayer;
    H3TileLayer: typeof H3TileLayer;
    HeatmapTileLayer: typeof HeatmapTileLayer;
    PointLabelLayer: typeof PointLabelLayer;
    QuadbinTileLayer: typeof QuadbinTileLayer;
    RasterTileLayer: typeof RasterTileLayer;
    VectorTileLayer: typeof VectorTileLayer;
};
export { CARTO_LAYERS, ClusterTileLayer, H3TileLayer, HeatmapTileLayer, PointLabelLayer, QuadbinTileLayer, RasterTileLayer, VectorTileLayer };
export { default as _QuadbinLayer } from "./layers/quadbin-layer.js";
export { default as _RasterLayer } from "./layers/raster-layer.js";
export { default as _SpatialIndexTileLayer } from "./layers/spatial-index-tile-layer.js";
export type { ClusterTileLayerProps } from "./layers/cluster-tile-layer.js";
export type { H3TileLayerProps } from "./layers/h3-tile-layer.js";
export type { HeatmapTileLayerProps } from "./layers/heatmap-tile-layer.js";
export type { PointLabelLayerProps } from "./layers/point-label-layer.js";
export type { QuadbinLayerProps } from "./layers/quadbin-layer.js";
export type { QuadbinTileLayerProps } from "./layers/quadbin-tile-layer.js";
export type { RasterLayerProps } from "./layers/raster-layer.js";
export type { RasterTileLayerProps } from "./layers/raster-tile-layer.js";
export type { SpatialIndexTileLayerProps } from "./layers/spatial-index-tile-layer.js";
export type { VectorTileLayerProps } from "./layers/vector-tile-layer.js";
export { default as BASEMAP, GOOGLE_BASEMAPS as _GOOGLE_BASEMAPS, getStyleUrl as _getStyleUrl, fetchStyle as _fetchStyle, applyLayerGroupFilters as _applyLayerGroupFilters, STYLE_LAYER_GROUPS as _STYLE_LAYER_GROUPS } from "./basemap.js";
export { default as colorBins } from "./style/color-bins-style.js";
export { default as colorCategories } from "./style/color-categories-style.js";
export { default as colorContinuous } from "./style/color-continuous-style.js";
export { fetchMap } from "./api/index.js";
export { fetchBasemapProps } from "./api/basemap.js";
export type { FetchMapOptions, FetchMapResult, Basemap as _Basemap, MapLibreBasemap as _MapLibreBasemap, GoogleBasemap as _GoogleBasemap } from "./api/index.js";
export declare const CARTO_SOURCES: {
    boundaryQuerySource: (options: import("@carto/api-client").BoundaryQuerySourceOptions) => Promise<import("@carto/api-client").BoundaryQuerySourceResponse>;
    boundaryTableSource: (options: import("@carto/api-client").BoundaryTableSourceOptions) => Promise<import("@carto/api-client").BoundaryTableSourceResponse>;
    h3QuerySource: (options: import("@carto/api-client").H3QuerySourceOptions) => Promise<import("@carto/api-client").H3QuerySourceResponse>;
    h3TableSource: (options: import("@carto/api-client").H3TableSourceOptions) => Promise<import("@carto/api-client").H3TableSourceResponse>;
    h3TilesetSource: (options: import("@carto/api-client").H3TilesetSourceOptions) => Promise<import("@carto/api-client").H3TilesetSourceResponse>;
    rasterSource: (options: import("@carto/api-client").RasterSourceOptions) => Promise<import("@carto/api-client").RasterSourceResponse>;
    quadbinQuerySource: (options: import("@carto/api-client").QuadbinQuerySourceOptions) => Promise<import("@carto/api-client").QuadbinQuerySourceResponse>;
    quadbinTableSource: (options: import("@carto/api-client").QuadbinTableSourceOptions) => Promise<import("@carto/api-client").QuadbinTableSourceResponse>;
    quadbinTilesetSource: (options: import("@carto/api-client").QuadbinTilesetSourceOptions) => Promise<import("@carto/api-client").QuadbinTilesetSourceResponse>;
    vectorQuerySource: (options: import("@carto/api-client").VectorQuerySourceOptions) => Promise<import("@carto/api-client").VectorQuerySourceResponse>;
    vectorTableSource: (options: import("@carto/api-client").VectorTableSourceOptions) => Promise<import("@carto/api-client").VectorTableSourceResponse>;
    vectorTilesetSource: (options: import("@carto/api-client").VectorTilesetSourceOptions) => Promise<import("@carto/api-client").VectorTilesetSourceResponse>;
};
export { boundaryQuerySource, boundaryTableSource, h3QuerySource, h3TableSource, h3TilesetSource, rasterSource, quadbinQuerySource, quadbinTableSource, quadbinTilesetSource, vectorQuerySource, vectorTableSource, vectorTilesetSource, query, CartoAPIError, SOURCE_DEFAULTS } from '@carto/api-client';
export type { GeojsonResult, JsonResult, TilejsonResult, SourceOptions, QuerySourceOptions, TableSourceOptions, TilesetSourceOptions, BoundaryQuerySourceOptions, BoundaryTableSourceOptions, H3QuerySourceOptions, H3TableSourceOptions, H3TilesetSourceOptions, RasterSourceOptions, QuadbinQuerySourceOptions, QuadbinTableSourceOptions, QuadbinTilesetSourceOptions, VectorQuerySourceOptions, VectorTableSourceOptions, VectorTilesetSourceOptions, QueryParameters } from '@carto/api-client';
//# sourceMappingURL=index.d.ts.map