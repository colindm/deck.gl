"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// dist/index.js
var dist_exports = {};
__export(dist_exports, {
  BASEMAP: () => basemap_default,
  CARTO_LAYERS: () => CARTO_LAYERS,
  CARTO_SOURCES: () => CARTO_SOURCES,
  CartoAPIError: () => import_api_client4.CartoAPIError,
  ClusterTileLayer: () => cluster_tile_layer_default,
  H3TileLayer: () => h3_tile_layer_default,
  HeatmapTileLayer: () => heatmap_tile_layer_default,
  PointLabelLayer: () => point_label_layer_default,
  QuadbinTileLayer: () => quadbin_tile_layer_default,
  RasterTileLayer: () => raster_tile_layer_default,
  SOURCE_DEFAULTS: () => import_api_client4.SOURCE_DEFAULTS,
  VectorTileLayer: () => vector_tile_layer_default,
  _GOOGLE_BASEMAPS: () => GOOGLE_BASEMAPS,
  _QuadbinLayer: () => quadbin_layer_default,
  _RasterLayer: () => raster_layer_default,
  _STYLE_LAYER_GROUPS: () => STYLE_LAYER_GROUPS,
  _SpatialIndexTileLayer: () => spatial_index_tile_layer_default,
  _applyLayerGroupFilters: () => applyLayerGroupFilters,
  _fetchStyle: () => fetchStyle,
  _getStyleUrl: () => getStyleUrl,
  boundaryQuerySource: () => import_api_client4.boundaryQuerySource,
  boundaryTableSource: () => import_api_client4.boundaryTableSource,
  colorBins: () => colorBins,
  colorCategories: () => colorCategories,
  colorContinuous: () => colorContinuous,
  fetchBasemapProps: () => fetchBasemapProps,
  fetchMap: () => fetchMap,
  h3QuerySource: () => import_api_client4.h3QuerySource,
  h3TableSource: () => import_api_client4.h3TableSource,
  h3TilesetSource: () => import_api_client4.h3TilesetSource,
  quadbinQuerySource: () => import_api_client4.quadbinQuerySource,
  quadbinTableSource: () => import_api_client4.quadbinTableSource,
  quadbinTilesetSource: () => import_api_client4.quadbinTilesetSource,
  query: () => import_api_client4.query,
  rasterSource: () => import_api_client4.rasterSource,
  vectorQuerySource: () => import_api_client4.vectorQuerySource,
  vectorTableSource: () => import_api_client4.vectorTableSource,
  vectorTilesetSource: () => import_api_client4.vectorTilesetSource
});
module.exports = __toCommonJS(dist_exports);

// dist/layers/cluster-tile-layer.js
var import_layers = require("@deck.gl/layers");
var import_geo_layers2 = require("@deck.gl/geo-layers");
var import_core5 = require("@loaders.gl/core");
var import_gis = require("@loaders.gl/gis");
var import_core6 = require("@deck.gl/core");

// dist/layers/cluster-utils.js
var import_quadbin = require("quadbin");
var import_core = require("@deck.gl/core");
function aggregateTile(tile, tileAggregationCache, aggregationLevels, properties = [], getPosition, getWeight) {
  var _a;
  if (!tile.content)
    return false;
  if (!tile.userData)
    tile.userData = {};
  const cell0 = (_a = tileAggregationCache.get(aggregationLevels)) == null ? void 0 : _a[0];
  if (cell0) {
    if (properties.every((property) => property.name in cell0)) {
      return false;
    }
    tileAggregationCache.clear();
  }
  const out = {};
  for (const cell of tile.content) {
    let id4 = cell.id;
    const position = typeof getPosition === "function" ? getPosition(cell, {}) : getPosition;
    for (let i = 0; i < aggregationLevels - 1; i++) {
      id4 = (0, import_quadbin.cellToParent)(id4);
    }
    const parentId = Number(id4);
    if (!(parentId in out)) {
      out[parentId] = { id: id4, count: 0, position: [0, 0] };
      for (const { name, aggregation } of properties) {
        if (aggregation === "any") {
          out[parentId][name] = cell.properties[name];
        } else {
          out[parentId][name] = 0;
        }
      }
    }
    const prevTotalW = out[parentId].count;
    out[parentId].count += typeof getWeight === "function" ? getWeight(cell, {}) : getWeight;
    const totalW = out[parentId].count;
    const W = totalW - prevTotalW;
    out[parentId].position[0] = (prevTotalW * out[parentId].position[0] + W * position[0]) / totalW;
    out[parentId].position[1] = (prevTotalW * out[parentId].position[1] + W * position[1]) / totalW;
    for (const { name, aggregation } of properties) {
      const prevValue = out[parentId][name];
      const value = cell.properties[name];
      if (aggregation === "average") {
        out[parentId][name] = (prevTotalW * prevValue + W * value) / totalW;
      } else if (aggregation === "count" || aggregation === "sum") {
        out[parentId][name] = prevValue + value;
      } else if (aggregation === "max") {
        out[parentId][name] = Math.max(prevValue, value);
      } else if (aggregation === "min") {
        out[parentId][name] = Math.min(prevValue, value);
      }
    }
  }
  tileAggregationCache.set(aggregationLevels, Object.values(out));
  return true;
}
function extractAggregationProperties(tile) {
  const properties = [];
  const validAggregations = ["any", "average", "count", "min", "max", "sum"];
  for (const name of Object.keys(tile.content[0].properties)) {
    let aggregation = name.split("_").pop().toLowerCase();
    if (!validAggregations.includes(aggregation)) {
      import_core.log.warn(`No valid aggregation present in ${name} property`)();
      aggregation = "any";
    }
    properties.push({ name, aggregation });
  }
  return properties;
}
function computeAggregationStats(data, properties) {
  const stats = {};
  for (const { name, aggregation } of properties) {
    stats[name] = { min: Infinity, max: -Infinity };
    if (aggregation !== "any") {
      for (const d of data) {
        stats[name].min = Math.min(stats[name].min, d[name]);
        stats[name].max = Math.max(stats[name].max, d[name]);
      }
    }
  }
  return stats;
}
var EMPTY_UINT16ARRAY = new Uint16Array();
var EMPTY_BINARY_PROPS = {
  positions: { value: new Float32Array(), size: 2 },
  properties: [],
  numericProps: {},
  featureIds: { value: EMPTY_UINT16ARRAY, size: 1 },
  globalFeatureIds: { value: EMPTY_UINT16ARRAY, size: 1 }
};
function clustersToBinary(data) {
  const positions = new Float32Array(data.length * 2);
  const featureIds = new Uint16Array(data.length);
  for (let i = 0; i < data.length; i++) {
    positions.set(data[i].position, 2 * i);
    featureIds[i] = i;
  }
  return {
    shape: "binary-feature-collection",
    points: {
      type: "Point",
      positions: { value: positions, size: 2 },
      properties: data,
      numericProps: {},
      featureIds: { value: featureIds, size: 1 },
      globalFeatureIds: { value: featureIds, size: 1 }
    },
    lines: {
      type: "LineString",
      pathIndices: { value: EMPTY_UINT16ARRAY, size: 1 },
      ...EMPTY_BINARY_PROPS
    },
    polygons: {
      type: "Polygon",
      polygonIndices: { value: EMPTY_UINT16ARRAY, size: 1 },
      primitivePolygonIndices: { value: EMPTY_UINT16ARRAY, size: 1 },
      ...EMPTY_BINARY_PROPS
    }
  };
}

// dist/constants.js
var DEFAULT_TILE_SIZE = 512;

// dist/layers/quadbin-tileset-2d.js
var import_geo_layers = require("@deck.gl/geo-layers");
var import_quadbin2 = require("quadbin");
var QuadbinTileset2D = class extends import_geo_layers._Tileset2D {
  // @ts-expect-error for spatial indices, TileSet2d should be parametrized by TileIndexT
  getTileIndices(opts) {
    return super.getTileIndices(opts).map(import_quadbin2.tileToCell).map((q) => ({ q, i: (0, import_quadbin2.bigIntToHex)(q) }));
  }
  // @ts-expect-error TileIndex must be generic
  getTileId({ q, i }) {
    return i || (0, import_quadbin2.bigIntToHex)(q);
  }
  // @ts-expect-error TileIndex must be generic
  getTileMetadata({ q }) {
    return super.getTileMetadata((0, import_quadbin2.cellToTile)(q));
  }
  // @ts-expect-error TileIndex must be generic
  getTileZoom({ q }) {
    return Number((0, import_quadbin2.getResolution)(q));
  }
  // @ts-expect-error TileIndex must be generic
  getParentIndex({ q }) {
    return { q: (0, import_quadbin2.cellToParent)(q) };
  }
};

// dist/layers/quadbin-utils.js
var import_web_mercator = require("@math.gl/web-mercator");
var import_quadbin3 = require("quadbin");
var TILE_SIZE = 512;
function quadbinToOffset(quadbin) {
  const { x, y, z } = (0, import_quadbin3.cellToTile)(quadbin);
  const scale = TILE_SIZE / (1 << z);
  return [x * scale, TILE_SIZE - y * scale, scale];
}
function quadbinToWorldBounds(quadbin, coverage) {
  const [xOffset, yOffset, scale] = quadbinToOffset(quadbin);
  return [
    [xOffset, yOffset],
    [xOffset + coverage * scale, yOffset - coverage * scale]
  ];
}
function getQuadbinPolygon(quadbin, coverage = 1) {
  const [topLeft, bottomRight] = quadbinToWorldBounds(quadbin, coverage);
  const [w, n] = (0, import_web_mercator.worldToLngLat)(topLeft);
  const [e, s] = (0, import_web_mercator.worldToLngLat)(bottomRight);
  return [e, n, e, s, w, s, w, n, e, n];
}

// dist/layers/schema/fast-pbf.js
var import_compression = require("@loaders.gl/compression");
function readPackedTypedArray(TypedArray, pbf, obj, options) {
  const end = pbf.type === 2 ? pbf.readVarint() + pbf.pos : pbf.pos + 1;
  const data = pbf.buf.buffer.slice(pbf.pos, end);
  if ((options == null ? void 0 : options.compression) === "gzip") {
    const compression = new import_compression.GZipCompression();
    const decompressedData = compression.decompressSync(data);
    obj.value = new TypedArray(decompressedData);
  } else {
    obj.value = new TypedArray(data);
  }
  pbf.pos = end;
  return obj.value;
}

// dist/layers/schema/carto-tile.js
var KeyValueObjectReader = class {
  static read(pbf, end) {
    return pbf.readFields(KeyValueObjectReader._readField, { key: "", value: null }, end);
  }
  static _readField(tag, obj, pbf) {
    if (tag === 1)
      obj.key = pbf.readString();
    else if (tag === 2)
      obj.value = pbf.readString();
  }
};
var PropertiesReader = class {
  static read(pbf, end) {
    return pbf.readFields(PropertiesReader._readField, {}, end);
  }
  static _readField(tag, obj, pbf) {
    if (tag === 1) {
      const { key, value } = KeyValueObjectReader.read(pbf, pbf.readVarint() + pbf.pos);
      obj[key] = value;
    }
  }
};
var DoublesReader = class {
  static read(pbf, end) {
    const { value, size } = pbf.readFields(DoublesReader._readField, { value: [], size: 0 }, end);
    return { value, size };
  }
  static _readField(tag, obj, pbf) {
    if (tag === 1)
      readPackedTypedArray(Float64Array, pbf, obj);
    else if (tag === 2)
      obj.size = pbf.readVarint(true);
  }
};
var IntsReader = class {
  static read(pbf, end) {
    const { value, size } = pbf.readFields(IntsReader._readField, { value: [], size: 0 }, end);
    return { value: new Uint32Array(value), size };
  }
  static _readField(tag, obj, pbf) {
    if (tag === 1)
      pbf.readPackedVarint(obj.value);
    else if (tag === 2)
      obj.size = pbf.readVarint(true);
  }
};
var FieldsReader = class {
  static read(pbf, end) {
    return pbf.readFields(FieldsReader._readField, { id: 0 }, end);
  }
  static _readField(tag, obj, pbf) {
    if (tag === 1)
      obj.id = pbf.readVarint();
  }
};
var NumericPropReader = class {
  static read(pbf, end) {
    return pbf.readFields(NumericPropReader._readField, { value: [] }, end);
  }
  static _readField(tag, obj, pbf) {
    if (tag === 1)
      readPackedTypedArray(Float64Array, pbf, obj);
  }
};
var NumericPropKeyValueReader = class {
  static read(pbf, end) {
    return pbf.readFields(NumericPropKeyValueReader._readField, { key: "", value: null }, end);
  }
  static _readField(tag, obj, pbf) {
    if (tag === 1)
      obj.key = pbf.readString();
    else if (tag === 2)
      obj.value = NumericPropReader.read(pbf, pbf.readVarint() + pbf.pos);
  }
};
var PointsReader = class {
  static read(pbf, end) {
    return pbf.readFields(PointsReader._readField, {
      positions: null,
      globalFeatureIds: null,
      featureIds: null,
      properties: [],
      numericProps: {},
      fields: []
    }, end);
  }
  static _readField(tag, obj, pbf) {
    if (tag === 1)
      obj.positions = DoublesReader.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 2)
      obj.globalFeatureIds = IntsReader.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 3)
      obj.featureIds = IntsReader.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 4)
      obj.properties.push(PropertiesReader.read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 5) {
      const entry = NumericPropKeyValueReader.read(pbf, pbf.readVarint() + pbf.pos);
      obj.numericProps[entry.key] = entry.value;
    } else if (tag === 6)
      obj.fields.push(FieldsReader.read(pbf, pbf.readVarint() + pbf.pos));
  }
};
var LinesReader = class {
  static read(pbf, end) {
    return pbf.readFields(LinesReader._readField, {
      positions: null,
      pathIndices: null,
      globalFeatureIds: null,
      featureIds: null,
      properties: [],
      numericProps: {},
      fields: []
    }, end);
  }
  static _readField(tag, obj, pbf) {
    if (tag === 1)
      obj.positions = DoublesReader.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 2)
      obj.pathIndices = IntsReader.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 3)
      obj.globalFeatureIds = IntsReader.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 4)
      obj.featureIds = IntsReader.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 5)
      obj.properties.push(PropertiesReader.read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 6) {
      const entry = NumericPropKeyValueReader.read(pbf, pbf.readVarint() + pbf.pos);
      obj.numericProps[entry.key] = entry.value;
    } else if (tag === 7)
      obj.fields.push(FieldsReader.read(pbf, pbf.readVarint() + pbf.pos));
  }
};
var PolygonsReader = class {
  static read(pbf, end) {
    return pbf.readFields(PolygonsReader._readField, {
      positions: null,
      polygonIndices: null,
      globalFeatureIds: null,
      featureIds: null,
      primitivePolygonIndices: null,
      triangles: null,
      properties: [],
      numericProps: {},
      fields: []
    }, end);
  }
  static _readField(tag, obj, pbf) {
    if (tag === 1)
      obj.positions = DoublesReader.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 2)
      obj.polygonIndices = IntsReader.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 3)
      obj.globalFeatureIds = IntsReader.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 4)
      obj.featureIds = IntsReader.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 5)
      obj.primitivePolygonIndices = IntsReader.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 6)
      obj.triangles = IntsReader.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 7)
      obj.properties.push(PropertiesReader.read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 8) {
      const entry = NumericPropKeyValueReader.read(pbf, pbf.readVarint() + pbf.pos);
      obj.numericProps[entry.key] = entry.value;
    } else if (tag === 9)
      obj.fields.push(FieldsReader.read(pbf, pbf.readVarint() + pbf.pos));
  }
};
var TileReader = class {
  static read(pbf, end) {
    return pbf.readFields(TileReader._readField, { points: null, lines: null, polygons: null }, end);
  }
  static _readField(tag, obj, pbf) {
    if (tag === 1)
      obj.points = PointsReader.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 2)
      obj.lines = LinesReader.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 3)
      obj.polygons = PolygonsReader.read(pbf, pbf.readVarint() + pbf.pos);
  }
};

// dist/layers/schema/carto-spatial-tile.js
var IndicesReader = class {
  static read(pbf, end) {
    return pbf.readFields(IndicesReader._readField, { value: [] }, end);
  }
  static _readField(tag, obj, pbf) {
    if (tag === 1)
      readPackedTypedArray(BigUint64Array, pbf, obj);
  }
};
var CellsReader = class {
  static read(pbf, end) {
    return pbf.readFields(CellsReader._readField, { indices: null, properties: [], numericProps: {} }, end);
  }
  static _readField(tag, obj, pbf) {
    if (tag === 1)
      obj.indices = IndicesReader.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 2)
      obj.properties.push(PropertiesReader.read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 3) {
      const entry = NumericPropKeyValueReader.read(pbf, pbf.readVarint() + pbf.pos);
      obj.numericProps[entry.key] = entry.value;
    }
  }
};
var TileReader2 = class {
  static read(pbf, end) {
    return pbf.readFields(TileReader2._readField, { scheme: 0, cells: null }, end);
  }
  static _readField(tag, obj, pbf) {
    if (tag === 1)
      obj.scheme = pbf.readVarint();
    else if (tag === 2)
      obj.cells = CellsReader.read(pbf, pbf.readVarint() + pbf.pos);
  }
};

// dist/layers/schema/tile-loader-utils.js
var import_pbf = __toESM(require("pbf"), 1);
function parsePbf(buffer, TileReader5) {
  const pbf = new import_pbf.default(buffer);
  const tile = TileReader5.read(pbf);
  return tile;
}

// dist/utils.js
var import_core2 = require("@deck.gl/core");
function assert(condition, message) {
  import_core2.log.assert(condition, message);
}
function createBinaryProxy(data, index) {
  const { properties, numericProps } = data;
  return new Proxy(properties[index] || {}, {
    get(target, property) {
      if (property in numericProps) {
        return numericProps[property].value[index];
      }
      return target[property];
    },
    has(target, property) {
      return property in numericProps || property in target;
    },
    ownKeys(target) {
      return [...Object.keys(numericProps), ...Reflect.ownKeys(target)];
    },
    getOwnPropertyDescriptor(target, prop) {
      return { enumerable: true, configurable: true };
    }
  });
}
function getWorkerUrl(id4, version) {
  return `https://unpkg.com/@deck.gl/carto@${version}/dist/${id4}-worker.js`;
}
function scaleIdentity() {
  let unknown;
  function scale(x) {
    return x === null ? unknown : x;
  }
  scale.invert = scale;
  scale.domain = scale.range = (d) => d;
  scale.unknown = (u) => {
    if (u) {
      unknown = u;
    }
    return unknown;
  };
  scale.copy = () => {
    const scaleCopy = scaleIdentity();
    scaleCopy.unknown(unknown);
    return scaleCopy;
  };
  return scale;
}

// dist/layers/schema/spatialjson-utils.js
var import_quadbin4 = require("quadbin");
function binaryToSpatialjson(binary) {
  const { cells, scheme } = binary;
  const count = cells.indices.value.length;
  const spatial = [];
  for (let i = 0; i < count; i++) {
    const id4 = scheme === "h3" ? (0, import_quadbin4.bigIntToHex)(cells.indices.value[i]) : cells.indices.value[i];
    const properties = { ...cells.properties[i] };
    for (const key of Object.keys(cells.numericProps)) {
      properties[key] = cells.numericProps[key].value[i];
    }
    spatial.push({ id: id4, properties });
  }
  return spatial;
}

// dist/layers/schema/carto-spatial-tile-loader.js
var VERSION = true ? "9.1.0-beta.3" : "latest";
var id = "cartoSpatialTile";
var DEFAULT_OPTIONS = {
  cartoSpatialTile: {
    scheme: "quadbin",
    workerUrl: getWorkerUrl(id, VERSION)
  }
};
var CartoSpatialTileLoader = {
  name: "CARTO Spatial Tile",
  version: VERSION,
  id,
  module: "carto",
  extensions: ["pbf"],
  mimeTypes: ["application/vnd.carto-spatial-tile"],
  category: "geometry",
  parse: async (arrayBuffer, options) => parseCartoSpatialTile(arrayBuffer, options),
  parseSync: parseCartoSpatialTile,
  worker: true,
  options: DEFAULT_OPTIONS
};
function parseCartoSpatialTile(arrayBuffer, options) {
  var _a;
  if (!arrayBuffer)
    return null;
  const tile = parsePbf(arrayBuffer, TileReader2);
  const { cells } = tile;
  const scheme = (_a = options == null ? void 0 : options.cartoSpatialTile) == null ? void 0 : _a.scheme;
  const data = { cells, scheme };
  return binaryToSpatialjson(data);
}
var carto_spatial_tile_loader_default = CartoSpatialTileLoader;

// dist/layers/utils.js
var import_core3 = require("@deck.gl/core");
var import_core4 = require("@deck.gl/core");
function injectAccessToken(loadOptions, accessToken) {
  var _a, _b, _c;
  if (!((_b = (_a = loadOptions == null ? void 0 : loadOptions.fetch) == null ? void 0 : _a.headers) == null ? void 0 : _b.Authorization)) {
    loadOptions.fetch = {
      ...loadOptions.fetch,
      headers: { ...(_c = loadOptions.fetch) == null ? void 0 : _c.headers, Authorization: `Bearer ${accessToken}` }
    };
  }
}
function mergeBoundaryData(geometry, properties) {
  const mapping = {};
  for (const { geoid, ...rest } of properties.properties) {
    if (geoid in mapping) {
      import_core3.log.warn("Duplicate geoid key in boundary mapping, using first occurance")();
    } else {
      mapping[geoid] = rest;
    }
  }
  for (const type of ["points", "lines", "polygons"]) {
    const geom = geometry[type];
    if (geom.positions.value.length === 0) {
      continue;
    }
    geom.properties = geom.properties.map(({ geoid }) => mapping[geoid]);
    const { positions, globalFeatureIds } = geom;
    let indices = null;
    if (type === "lines")
      indices = geom.pathIndices.value;
    if (type === "polygons")
      indices = geom.polygonIndices.value;
    const length = positions.value.length / positions.size;
    for (const key in properties.numericProps) {
      const sourceProp = properties.numericProps[key].value;
      const TypedArray = sourceProp.constructor;
      const destProp = new TypedArray(length);
      geom.numericProps[key] = { value: destProp, size: 1 };
      if (!indices) {
        for (let i = 0; i < length; i++) {
          const featureId = globalFeatureIds.value[i];
          destProp[i] = sourceProp[featureId];
        }
      } else {
        for (let i = 0; i < indices.length - 1; i++) {
          const startIndex = indices[i];
          const endIndex = indices[i + 1];
          const featureId = globalFeatureIds.value[startIndex];
          destProp.fill(sourceProp[featureId], startIndex, endIndex);
        }
      }
    }
  }
  return geometry;
}
var TilejsonPropType = {
  type: "object",
  value: null,
  validate: (value, propType) => propType.optional && value === null || typeof value === "object" && Array.isArray(value.tiles) && value.tiles.every((url) => typeof url === "string"),
  equal: (value1, value2) => {
    return (0, import_core4._deepEqual)(value1, value2, 2);
  },
  async: true
};

// dist/layers/cluster-tile-layer.js
(0, import_core5.registerLoaders)([carto_spatial_tile_loader_default]);
var defaultProps = {
  data: TilejsonPropType,
  clusterLevel: { type: "number", value: 5, min: 1 },
  getPosition: {
    type: "accessor",
    value: ({ id: id4 }) => getQuadbinPolygon(id4, 0.5).slice(2, 4)
  },
  getWeight: { type: "accessor", value: 1 },
  refinementStrategy: "no-overlap",
  tileSize: DEFAULT_TILE_SIZE
};
var ClusterGeoJsonLayer = class extends import_geo_layers2.TileLayer {
  initializeState() {
    super.initializeState();
    this.state.aggregationCache = /* @__PURE__ */ new WeakMap();
  }
  // eslint-disable-next-line max-statements
  renderLayers() {
    var _a;
    const visibleTiles = (_a = this.state.tileset) == null ? void 0 : _a.tiles.filter((tile) => {
      return tile.isLoaded && tile.content && this.state.tileset.isTileVisible(tile);
    });
    if (!(visibleTiles == null ? void 0 : visibleTiles.length)) {
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
      const overZoom = Math.round(zoom - tile.zoom);
      const aggregationLevels = Math.round(clusterLevel) - overZoom;
      let tileAggregationCache = aggregationCache.get(tile.content);
      if (!tileAggregationCache) {
        tileAggregationCache = /* @__PURE__ */ new Map();
        aggregationCache.set(tile.content, tileAggregationCache);
      }
      const didAggregate = aggregateTile(tile, tileAggregationCache, aggregationLevels, properties, getPosition, getWeight);
      needsUpdate || (needsUpdate = didAggregate);
      data.push(...tileAggregationCache.get(aggregationLevels));
    }
    data.sort((a, b) => Number(b.count - a.count));
    const clusterIds = data == null ? void 0 : data.map((tile) => tile.id);
    needsUpdate || (needsUpdate = !(0, import_core6._deepEqual)(clusterIds, this.state.clusterIds, 1));
    this.setState({ clusterIds });
    if (needsUpdate) {
      const stats = computeAggregationStats(data, properties);
      const binaryData = clustersToBinary(data);
      binaryData.points.attributes = { stats };
      this.setState({ data: binaryData });
    }
    const props = {
      ...this.props,
      id: "clusters",
      data: this.state.data,
      dataComparator: (data2, oldData) => {
        var _a2, _b, _c, _d;
        const newIds = (_b = (_a2 = data2 == null ? void 0 : data2.points) == null ? void 0 : _a2.properties) == null ? void 0 : _b.map((tile) => tile.id);
        const oldIds = (_d = (_c = oldData == null ? void 0 : oldData.points) == null ? void 0 : _c.properties) == null ? void 0 : _d.map((tile) => tile.id);
        return (0, import_core6._deepEqual)(newIds, oldIds, 1);
      }
    };
    return new import_layers.GeoJsonLayer(this.getSubLayerProps(props));
  }
  getPickingInfo(params) {
    const info = params.info;
    if (info.index !== -1) {
      const { data } = params.sourceLayer.props;
      info.object = (0, import_gis.binaryToGeojson)(data, {
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
};
ClusterGeoJsonLayer.layerName = "ClusterGeoJsonLayer";
ClusterGeoJsonLayer.defaultProps = defaultProps;
var ClusterTileLayer = class extends import_core6.CompositeLayer {
  getLoadOptions() {
    const loadOptions = super.getLoadOptions() || {};
    const tileJSON = this.props.data;
    injectAccessToken(loadOptions, tileJSON.accessToken);
    loadOptions.cartoSpatialTile = { ...loadOptions.cartoSpatialTile, scheme: "quadbin" };
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
};
ClusterTileLayer.layerName = "ClusterTileLayer";
ClusterTileLayer.defaultProps = defaultProps;
var cluster_tile_layer_default = ClusterTileLayer;

// dist/layers/h3-tile-layer.js
var import_core8 = require("@deck.gl/core");
var import_geo_layers5 = require("@deck.gl/geo-layers");

// dist/layers/h3-tileset-2d.js
var import_geo_layers3 = require("@deck.gl/geo-layers");
var import_h3_js = require("h3-js");
var MAX_LATITUDE = 85.051128;
function padBoundingBox({ west, north, east, south }, resolution) {
  const corners = [
    [north, east],
    [south, east],
    [south, west],
    [north, west]
  ];
  const cornerCells = corners.map((c) => (0, import_h3_js.latLngToCell)(c[0], c[1], resolution));
  const cornerEdgeLengths = cornerCells.map((c) => Math.max(...(0, import_h3_js.originToDirectedEdges)(c).map((e) => (0, import_h3_js.edgeLength)(e, import_h3_js.UNITS.rads))) * 180 / Math.PI);
  const bufferLat = Math.max(...cornerEdgeLengths);
  const bufferLon = Math.min(180, bufferLat / Math.cos((north + south) / 2 * Math.PI / 180));
  return {
    north: Math.min(north + bufferLat, MAX_LATITUDE),
    east: east + bufferLon,
    south: Math.max(south - bufferLat, -MAX_LATITUDE),
    west: west - bufferLon
  };
}
function getHexagonsInBoundingBox({ west, north, east, south }, resolution) {
  const longitudeSpan = Math.abs(east - west);
  if (longitudeSpan > 180) {
    const nSegments = Math.ceil(longitudeSpan / 180);
    let h3Indices = [];
    for (let s = 0; s < nSegments; s++) {
      const segmentWest = west + s * 180;
      const segmentEast = Math.min(segmentWest + 179.9999999, east);
      h3Indices = h3Indices.concat(getHexagonsInBoundingBox({ west: segmentWest, north, east: segmentEast, south }, resolution));
    }
    return [...new Set(h3Indices)];
  }
  const polygon = [
    [north, east],
    [south, east],
    [south, west],
    [north, west],
    [north, east]
  ];
  return (0, import_h3_js.polygonToCells)(polygon, resolution);
}
function tileToBoundingBox(index) {
  const coordinates = (0, import_h3_js.cellToBoundary)(index);
  const latitudes = coordinates.map((c) => c[0]);
  const longitudes = coordinates.map((c) => c[1]);
  const west = Math.min(...longitudes);
  const south = Math.min(...latitudes);
  const east = Math.max(...longitudes);
  const north = Math.max(...latitudes);
  return { west, south, east, north };
}
var BIAS = 2;
function getHexagonResolution(viewport, tileSize) {
  const zoomOffset = Math.log2(tileSize / 512);
  const hexagonScaleFactor = 2 / 3 * (viewport.zoom - zoomOffset);
  const latitudeScaleFactor = Math.log(1 / Math.cos(Math.PI * viewport.latitude / 180));
  return Math.max(0, Math.floor(hexagonScaleFactor + latitudeScaleFactor - BIAS));
}
var H3Tileset2D = class extends import_geo_layers3._Tileset2D {
  /**
   * Returns all tile indices in the current viewport. If the current zoom level is smaller
   * than minZoom, return an empty array. If the current zoom level is greater than maxZoom,
   * return tiles that are on maxZoom.
   */
  // @ts-expect-error Tileset2D should be generic over TileIndex
  getTileIndices({ viewport, minZoom, maxZoom }) {
    if (viewport.latitude === void 0)
      return [];
    const [west, south, east, north] = viewport.getBounds();
    const { tileSize } = this.opts;
    let z = getHexagonResolution(viewport, tileSize);
    let indices;
    if (typeof minZoom === "number" && Number.isFinite(minZoom) && z < minZoom) {
      return [];
    }
    if (typeof maxZoom === "number" && Number.isFinite(maxZoom) && z > maxZoom) {
      z = maxZoom;
      const center = (0, import_h3_js.latLngToCell)(viewport.latitude, viewport.longitude, maxZoom);
      indices = (0, import_h3_js.gridDisk)(center, 1);
    } else {
      const paddedBounds = padBoundingBox({ west, north, east, south }, z);
      indices = getHexagonsInBoundingBox(paddedBounds, z);
    }
    return indices.map((i) => ({ i }));
  }
  // @ts-expect-error Tileset2D should be generic over TileIndex
  getTileId({ i }) {
    return i;
  }
  // @ts-expect-error Tileset2D should be generic over TileIndex
  getTileMetadata({ i }) {
    return { bbox: tileToBoundingBox(i) };
  }
  // @ts-expect-error Tileset2D should be generic over TileIndex
  getTileZoom({ i }) {
    return (0, import_h3_js.getResolution)(i);
  }
  // @ts-expect-error Tileset2D should be generic over TileIndex
  getParentIndex(index) {
    const resolution = (0, import_h3_js.getResolution)(index.i);
    const i = (0, import_h3_js.cellToParent)(index.i, resolution - 1);
    return { i };
  }
};

// dist/layers/spatial-index-tile-layer.js
var import_core7 = require("@loaders.gl/core");

// dist/layers/schema/carto-raster-tile.js
var ARRAY_TYPES = {
  uint8: Uint8Array,
  uint16: Uint16Array,
  uint32: Uint32Array,
  uint64: BigUint64Array,
  int8: Int8Array,
  int16: Int16Array,
  int32: Int32Array,
  int64: BigInt64Array,
  float32: Float32Array,
  float64: Float64Array
};
var BandReader = class {
  static read(pbf, end) {
    return pbf.readFields(BandReader._readField, { name: "", type: "", data: null }, end);
  }
  static _readField(tag, obj, pbf) {
    if (tag === 1)
      obj.name = pbf.readString();
    else if (tag === 2)
      obj.type = pbf.readString();
    else if (tag === 3) {
      const TypedArray = ARRAY_TYPES[obj.type];
      if (!TypedArray) {
        throw Error(`Invalid data type: ${obj.type}`);
      }
      obj.data = {};
      const { compression } = TileReader3;
      readPackedTypedArray(TypedArray, pbf, obj.data, { compression });
    }
  }
};
var TileReader3 = class {
  static read(pbf, end) {
    return pbf.readFields(TileReader3._readField, { blockSize: 0, bands: [] }, end);
  }
  static _readField(tag, obj, pbf) {
    if (tag === 1)
      obj.blockSize = pbf.readVarint();
    else if (tag === 2)
      obj.bands.push(BandReader.read(pbf, pbf.readVarint() + pbf.pos));
  }
};

// dist/layers/schema/carto-raster-tile-loader.js
var VERSION2 = true ? "9.1.0-beta.3" : "latest";
var id2 = "cartoRasterTile";
var DEFAULT_OPTIONS2 = {
  cartoRasterTile: {
    metadata: null,
    workerUrl: getWorkerUrl(id2, VERSION2)
  }
};
var CartoRasterTileLoader = {
  name: "CARTO Raster Tile",
  version: VERSION2,
  id: id2,
  module: "carto",
  extensions: ["pbf"],
  mimeTypes: ["application/vnd.carto-raster-tile"],
  category: "geometry",
  parse: async (arrayBuffer, options) => parseCartoRasterTile(arrayBuffer, options),
  parseSync: parseCartoRasterTile,
  worker: true,
  options: DEFAULT_OPTIONS2
};
function parseCartoRasterTile(arrayBuffer, options) {
  var _a;
  const metadata = (_a = options == null ? void 0 : options.cartoRasterTile) == null ? void 0 : _a.metadata;
  if (!arrayBuffer || !metadata)
    return null;
  TileReader3.compression = metadata.compression;
  const out = parsePbf(arrayBuffer, TileReader3);
  const { bands, blockSize } = out;
  const numericProps = {};
  for (let i = 0; i < bands.length; i++) {
    const { name, data } = bands[i];
    numericProps[name] = data;
  }
  return { blockSize, cells: { numericProps, properties: [] } };
}
var carto_raster_tile_loader_default = CartoRasterTileLoader;

// dist/layers/spatial-index-tile-layer.js
var import_geo_layers4 = require("@deck.gl/geo-layers");
(0, import_core7.registerLoaders)([carto_raster_tile_loader_default, carto_spatial_tile_loader_default]);
function isFeatureIdDefined(value) {
  return value !== void 0 && value !== null && value !== "";
}
var defaultProps2 = {
  tileSize: DEFAULT_TILE_SIZE
};
var SpatialIndexTileLayer = class extends import_geo_layers4.TileLayer {
  _updateAutoHighlight(info) {
    const { hoveredFeatureId } = this.state;
    const hoveredFeature = info.object;
    let newHoveredFeatureId = null;
    if (hoveredFeature) {
      newHoveredFeatureId = hoveredFeature.id;
    }
    if (hoveredFeatureId !== newHoveredFeatureId) {
      let { highlightColor } = this.props;
      if (typeof highlightColor === "function") {
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
    if (!isFeatureIdPresent || !Array.isArray(data) || // Quick check for whether id is within tile. data.findIndex is expensive
    !this._featureInTile(tile, hoveredFeatureId)) {
      return -1;
    }
    return data.findIndex((feature) => feature.id === hoveredFeatureId);
  }
  _featureInTile(tile, featureId) {
    const tileset = this.state.tileset;
    const tileZoom = tileset.getTileZoom(tile.index);
    const KEY = tile.index.q ? "q" : "i";
    let featureIndex = { [KEY]: featureId };
    let featureZoom = tileset.getTileZoom(featureIndex);
    while (!(featureZoom <= tileZoom)) {
      featureIndex = tileset.getParentIndex(featureIndex);
      featureZoom = tileset.getTileZoom(featureIndex);
    }
    return featureIndex[KEY] === tile.index[KEY];
  }
};
SpatialIndexTileLayer.layerName = "SpatialIndexTileLayer";
SpatialIndexTileLayer.defaultProps = defaultProps2;
var spatial_index_tile_layer_default = SpatialIndexTileLayer;

// dist/layers/h3-tile-layer.js
var renderSubLayers = (props) => {
  const { data } = props;
  const { index } = props.tile;
  if (!data || !data.length)
    return null;
  return new import_geo_layers5.H3HexagonLayer(props, {
    getHexagon: (d) => d.id,
    centerHexagon: index,
    highPrecision: true
  });
};
var defaultProps3 = {
  data: TilejsonPropType,
  tileSize: DEFAULT_TILE_SIZE
};
var H3TileLayer = class extends import_core8.CompositeLayer {
  initializeState() {
    import_geo_layers5.H3HexagonLayer._checkH3Lib();
  }
  getLoadOptions() {
    const loadOptions = super.getLoadOptions() || {};
    const tileJSON = this.props.data;
    injectAccessToken(loadOptions, tileJSON.accessToken);
    loadOptions.cartoSpatialTile = { ...loadOptions.cartoSpatialTile, scheme: "h3" };
    return loadOptions;
  }
  renderLayers() {
    const tileJSON = this.props.data;
    if (!tileJSON)
      return null;
    const { tiles: data } = tileJSON;
    let { minresolution, maxresolution } = tileJSON;
    if (this.props.minZoom) {
      minresolution = Math.max(minresolution, getHexagonResolution({ zoom: this.props.minZoom, latitude: 0 }, this.props.tileSize));
    }
    if (this.props.maxZoom) {
      maxresolution = Math.min(maxresolution, getHexagonResolution({ zoom: this.props.maxZoom, latitude: 0 }, this.props.tileSize));
    }
    const SubLayerClass = this.getSubLayerClass("spatial-index-tile", spatial_index_tile_layer_default);
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
};
H3TileLayer.layerName = "H3TileLayer";
H3TileLayer.defaultProps = defaultProps3;
var h3_tile_layer_default = H3TileLayer;

// dist/layers/heatmap-tile-layer.js
var import_quadbin6 = require("quadbin");
var import_core11 = require("@deck.gl/core");
var import_layers2 = require("@deck.gl/layers");

// dist/layers/heatmap.js
var fs = (
  /* glsl */
  `uniform heatmapUniforms {
  vec2 colorDomain;
  vec2 delta;
  float intensity;
  float opacity;
  float radiusPixels;
} heatmap;

uniform sampler2D colorTexture;

vec3 colorGradient(float value) {
  return texture(colorTexture, vec2(value, 0.5)).rgb;
}

const vec3 SHIFT = vec3(1.0, 256.0, 256.0 * 256.0);
const float MAX_VAL = SHIFT.z * 255.0;
const float SCALE = MAX_VAL / 8.0;
vec4 pack(float value) {
  return vec4(mod(vec3(value, floor(value / SHIFT.yz)), 256.0), 255.0) / 255.0;
}
float unpack(vec3 color) {
  return 255.0 * dot(color, SHIFT);
}

vec4 heatmap_sampleColor(sampler2D source, vec2 texSize, vec2 texCoord) {
  bool firstPass = (heatmap.delta.y < 0.5);
  float accumulator = 0.0;

  // Controls quality of heatmap, larger values increase quality at expense of performance
  float SUPPORT = clamp(heatmap.radiusPixels / 2.0, 8.0, 32.0);

  // Gaussian normalization parameters
  float sigma = SUPPORT / 3.0;
  float a = -0.5 / (sigma * sigma);
  float w0 = 0.3989422804014327 / sigma; // 1D normalization
  for (float t = -SUPPORT; t <= SUPPORT; t++) {
    vec2 percent = (t * heatmap.delta - 0.5) / SUPPORT;
    vec2 delta = percent * heatmap.radiusPixels / texSize;
    vec4 offsetColor = texture(source, texCoord + delta);

    // Unpack float
    float value = unpack(offsetColor.rgb);

    // Gaussian
    float weight = w0 * exp(a * t * t);
    
    accumulator += value * weight;
  }

  if (firstPass) {
    return pack(accumulator);
  }

  // Undo scaling to obtain normalized density
  float density = 10.0 * heatmap.intensity * accumulator / SCALE;
 
  // Domain also in normalized density units
  vec2 domain = heatmap.colorDomain;

  // Apply domain
  float f = (density - domain[0]) / (domain[1] - domain[0]);

  // sqrt/log scaling??
  // float f = (log(density) - log(domain[0] + 1.0)) / (log(domain[1] + 1.0) - log(domain[0] + 1.0));
  // f = sqrt(f);

  // Color map
  vec4 color = vec4(0.0);
  color.rgb = colorGradient(f);

  color.a = smoothstep(0.0, 0.1, f);
  color.a = pow(color.a, 1.0 / 2.2);
  color.a *= heatmap.opacity;

  return color;
}
`
);
var heatmap = {
  name: "heatmap",
  uniformPropTypes: {
    colorDomain: { value: [0, 1] },
    delta: { value: [0, 1] },
    intensity: { value: 1, min: 0.1, max: 10 },
    opacity: { value: 1, min: 0, max: 1 },
    radiusPixels: { value: 20, min: 0, softMax: 100 }
  },
  uniformTypes: {
    colorDomain: "vec2<f32>",
    delta: "vec2<f32>",
    intensity: "f32",
    opacity: "f32",
    radiusPixels: "f32"
  },
  // @ts-ignore TODO v9.1
  getUniforms: (opts) => {
    if (!opts)
      return {};
    const { colorDomain = [0, 1], colorTexture, delta = [1, 0], intensity = 1, opacity = 1, radiusPixels = 20 } = opts;
    return {
      colorDomain,
      colorTexture,
      delta,
      intensity,
      opacity,
      radiusPixels
    };
  },
  fs,
  passes: [
    // @ts-expect-error Seems typing in luma.gl should be Partial<>
    { sampler: true, uniforms: { delta: [1, 0] } },
    // @ts-expect-error Seems typing in luma.gl should be Partial<>
    { sampler: true, uniforms: { delta: [0, 1] } }
  ]
};

// dist/layers/post-process-utils.js
var import_core9 = require("@deck.gl/core");
var TEXTURE_PROPS = {
  format: "rgba8unorm",
  mipmaps: false,
  sampler: {
    minFilter: "linear",
    magFilter: "linear",
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge"
  }
};
function getPostProcessLayer(layer) {
  while (layer.parent && !layer.applyPostProcess) {
    layer = layer.parent;
  }
  return layer;
}
var DrawCallbackLayer = class extends import_core9.Layer {
  initializeState() {
    this.id = `draw-callback-${getPostProcessLayer(this).props.id}`;
  }
  _drawLayer() {
    getPostProcessLayer(this).applyPostProcess();
  }
};
DrawCallbackLayer.layerName = "DrawCallbackLayer";
function RTTModifier(BaseLayer) {
  var _a;
  return _a = class RTTLayer extends BaseLayer {
    draw(opts) {
      const { shaderModuleProps } = opts;
      const { picking } = shaderModuleProps;
      const postProcessLayer = getPostProcessLayer(this);
      if (!picking.isActive) {
        postProcessLayer.enableRTT(opts);
      }
      super.draw(opts);
      if (!picking.isActive) {
        postProcessLayer.disableRTT();
      }
    }
  }, // @ts-expect-error typescript doesn't see static property
  _a.layerName = `RTT-${BaseLayer.layerName}`, _a;
}
function PostProcessModifier(BaseLayer, effect) {
  var _a;
  return _a = class PostProcessLayer extends BaseLayer {
    initializeState(context) {
      super.initializeState(context);
      this._createTextures();
      this.internalState.postProcess = new import_core9.PostProcessEffect(effect, this.props);
      this.internalState.postProcess.setup(context);
    }
    updateState(params) {
      super.updateState(params);
      this.internalState.postProcess.setProps(this.props);
    }
    renderLayers() {
      let subLayers = super.renderLayers();
      if (!subLayers) {
        return null;
      }
      subLayers = Array.isArray(subLayers) ? subLayers : [subLayers];
      return [...subLayers, new DrawCallbackLayer()];
    }
    _createTextures() {
      const { device } = this.context;
      this.internalState.renderBuffers = [0, 1].map((i) => {
        return device.createFramebuffer({
          id: `layer-fbo-${i}`,
          colorAttachments: [device.createTexture(TEXTURE_PROPS)],
          depthStencilAttachment: "depth16unorm"
        });
      });
    }
    _resizeBuffers(opts) {
      const { shaderModuleProps } = opts;
      const { viewport } = this.context;
      const { devicePixelRatio } = shaderModuleProps.project;
      const width = devicePixelRatio * viewport.width;
      const height = devicePixelRatio * viewport.height;
      this.internalState.renderBuffers.forEach((fbo) => fbo.resize({ width, height }));
    }
    enableRTT(opts) {
      this._resizeBuffers(opts);
      this.internalState.originalRenderPass = this.context.renderPass;
      const [framebuffer] = this.internalState.renderBuffers;
      this.internalState.internalRenderPass = this.context.device.beginRenderPass({
        framebuffer,
        parameters: { viewport: [0, 0, framebuffer.width, framebuffer.height] },
        // Only clear on first render
        clearColor: this.internalState.renderInProgress ? false : [0, 0, 0, 0]
      });
      this.internalState.renderInProgress = true;
      this.context.renderPass = this.internalState.internalRenderPass;
    }
    disableRTT() {
      this.internalState.internalRenderPass.end();
      this.context.renderPass = this.internalState.originalRenderPass;
    }
    applyPostProcess() {
      if (!this.internalState.renderInProgress) {
        return;
      }
      const [inputBuffer, swapBuffer] = this.internalState.renderBuffers;
      const { framebuffer: target } = this.context.renderPass.props;
      this.internalState.postProcess.postRender({
        inputBuffer,
        swapBuffer,
        target
      });
      this.internalState.renderInProgress = false;
    }
    _finalize() {
      this.internalState.renderBuffers.forEach((fbo) => {
        fbo.destroy();
      });
      this.internalState.renderBuffers = null;
      this.internalState.postProcess.cleanup();
    }
  }, _a.layerName = `PostProcess${BaseLayer.layerName}`, _a;
}
var fs2 = (
  /* glsl */
  `vec4 copy_filterColor_ext(vec4 color, vec2 texSize, vec2 texCoord) {
  return color;
}
`
);
var copy = {
  name: "copy",
  fs: fs2,
  getUniforms: () => ({}),
  passes: [{ filter: true }]
};

// dist/layers/quadbin-tile-layer.js
var import_core10 = require("@deck.gl/core");

// dist/layers/quadbin-layer.js
var import_geo_layers6 = require("@deck.gl/geo-layers");
var defaultProps4 = {
  getQuadbin: { type: "accessor", value: (d) => d.quadbin }
};
var QuadbinLayer = class extends import_geo_layers6._GeoCellLayer {
  indexToBounds() {
    const { data, extruded, getQuadbin } = this.props;
    const coverage = extruded ? 0.99 : 1;
    return {
      data,
      _normalize: false,
      positionFormat: "XY",
      getPolygon: (x, objectInfo) => getQuadbinPolygon(getQuadbin(x, objectInfo), coverage),
      updateTriggers: { getPolygon: coverage }
    };
  }
};
QuadbinLayer.layerName = "QuadbinLayer";
QuadbinLayer.defaultProps = defaultProps4;
var quadbin_layer_default = QuadbinLayer;

// dist/layers/quadbin-tile-layer.js
var import_quadbin5 = require("quadbin");
var renderSubLayers2 = (props) => {
  const { data } = props;
  if (!data || !data.length)
    return null;
  const isBigInt = typeof data[0].id === "bigint";
  return new quadbin_layer_default(props, {
    getQuadbin: isBigInt ? (d) => d.id : (d) => (0, import_quadbin5.hexToBigInt)(d.id)
  });
};
var defaultProps5 = {
  data: TilejsonPropType,
  tileSize: DEFAULT_TILE_SIZE
};
var QuadbinTileLayer = class extends import_core10.CompositeLayer {
  getLoadOptions() {
    const loadOptions = super.getLoadOptions() || {};
    const tileJSON = this.props.data;
    injectAccessToken(loadOptions, tileJSON.accessToken);
    loadOptions.cartoSpatialTile = { ...loadOptions.cartoSpatialTile, scheme: "quadbin" };
    return loadOptions;
  }
  renderLayers() {
    const tileJSON = this.props.data;
    if (!tileJSON)
      return null;
    const { tiles: data, maxresolution: maxZoom } = tileJSON;
    const SubLayerClass = this.getSubLayerClass("spatial-index-tile", spatial_index_tile_layer_default);
    return new SubLayerClass(this.props, {
      id: `quadbin-tile-layer-${this.props.id}`,
      data,
      // TODO: Tileset2D should be generic over TileIndex type
      TilesetClass: QuadbinTileset2D,
      renderSubLayers: renderSubLayers2,
      maxZoom,
      loadOptions: this.getLoadOptions()
    });
  }
};
QuadbinTileLayer.layerName = "QuadbinTileLayer";
QuadbinTileLayer.defaultProps = defaultProps5;
var quadbin_tile_layer_default = QuadbinTileLayer;

// dist/layers/heatmap-tile-layer.js
var defaultColorRange = [
  [255, 255, 178],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [240, 59, 32],
  [189, 0, 38]
];
var TEXTURE_PROPS2 = {
  format: "rgba8unorm",
  mipmaps: false,
  sampler: {
    minFilter: "linear",
    magFilter: "linear",
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge"
  }
};
function unitDensityForCell(cell) {
  const cellResolution = Number((0, import_quadbin6.getResolution)(cell));
  return Math.pow(4, cellResolution);
}
function colorRangeToFlatArray(colorRange) {
  const flatArray = new Uint8Array(colorRange.length * 4);
  let index = 0;
  for (let i = 0; i < colorRange.length; i++) {
    const color = colorRange[i];
    flatArray[index++] = color[0];
    flatArray[index++] = color[1];
    flatArray[index++] = color[2];
    flatArray[index++] = Number.isFinite(color[3]) ? color[3] : 255;
  }
  return flatArray;
}
var uniformBlock = `uniform densityUniforms {
  float factor;
} density;
`;
var densityUniforms = {
  name: "density",
  vs: uniformBlock,
  uniformTypes: {
    factor: "f32"
  }
};
var RTTSolidPolygonLayer = class extends RTTModifier(import_layers2.SolidPolygonLayer) {
  getShaders(type) {
    const shaders = super.getShaders(type);
    shaders.inject = {
      "vs:#main-end": `
      // Value from getWeight accessor
  float weight = elevations;

  // Keep "power" delivered to screen constant when tiles update
  // by outputting normalized density
  weight *= density.factor;

  // Pack float into 3 channels to pass to heatmap shader
  // SCALE value important, as we don't want to saturate
  // but also want enough definition to avoid banding
  const vec3 SHIFT = vec3(1.0, 256.0, 256.0 * 256.0);
  const float MAX_VAL = SHIFT.z * 255.0;
  const float SCALE = MAX_VAL / 8.0;
  weight *= SCALE;
  weight = clamp(weight, 0.0, MAX_VAL);
  vColor = vec4(mod(vec3(weight, floor(weight / SHIFT.yz)), 256.0), 255.0) / 255.0;
`
    };
    shaders.modules = [...shaders.modules, densityUniforms];
    return shaders;
  }
  draw(opts) {
    const cell = this.props.data[0];
    const maxDensity = this.props.elevationScale;
    const densityProps = {
      factor: unitDensityForCell(cell.id) / maxDensity
    };
    for (const model of this.state.models) {
      model.shaderInputs.setProps({ density: densityProps });
    }
    super.draw(opts);
  }
};
RTTSolidPolygonLayer.layerName = "RTTSolidPolygonLayer";
var PostProcessQuadbinTileLayer = PostProcessModifier(quadbin_tile_layer_default, heatmap);
var defaultProps6 = {
  data: TilejsonPropType,
  getWeight: { type: "accessor", value: 1 },
  onMaxDensityChange: { type: "function", optional: true, value: null },
  colorDomain: { type: "array", value: [0, 1] },
  colorRange: defaultColorRange,
  intensity: { type: "number", value: 1 },
  radiusPixels: { type: "number", min: 0, max: 100, value: 20 }
};
var HeatmapTileLayer = class extends import_core11.CompositeLayer {
  initializeState() {
    this.state = {
      isLoaded: false,
      tiles: /* @__PURE__ */ new Set(),
      viewportChanged: false
    };
  }
  shouldUpdateState({ changeFlags }) {
    const { viewportChanged } = changeFlags;
    this.setState({ viewportChanged });
    return changeFlags.somethingChanged;
  }
  updateState(opts) {
    const { props, oldProps } = opts;
    super.updateState(opts);
    if (props.colorRange !== oldProps.colorRange) {
      this._updateColorTexture(opts);
    }
  }
  renderLayers() {
    var _a, _b, _c;
    const { data, getWeight, colorDomain, intensity, radiusPixels, _subLayerProps, updateTriggers, onMaxDensityChange, onViewportLoad, onTileLoad, onTileUnload, ...tileLayerProps } = this.props;
    const subLayerProps = {
      ..._subLayerProps,
      cell: {
        ..._subLayerProps == null ? void 0 : _subLayerProps.cell,
        _subLayerProps: {
          ...(_a = _subLayerProps == null ? void 0 : _subLayerProps.cell) == null ? void 0 : _a._subLayerProps,
          fill: {
            ...(_c = (_b = _subLayerProps == null ? void 0 : _subLayerProps.cell) == null ? void 0 : _b._subLayerProps) == null ? void 0 : _c.fill,
            type: RTTSolidPolygonLayer
          }
        }
      }
    };
    let tileZ = 0;
    let maxDensity = 0;
    const tiles = [...this.state.tiles].filter((t) => t.isVisible && t.content);
    for (const tile of tiles) {
      const cell = tile.content[0];
      const unitDensity = unitDensityForCell(cell.id);
      maxDensity = Math.max(tile.userData.maxWeight * unitDensity, maxDensity);
      tileZ = Math.max(tile.zoom, tileZ);
    }
    const overzoom = this.context.viewport.zoom - tileZ;
    const estimatedMaxDensity = maxDensity * Math.pow(2, overzoom);
    maxDensity = estimatedMaxDensity;
    if (typeof onMaxDensityChange === "function") {
      onMaxDensityChange(maxDensity);
    }
    return new PostProcessQuadbinTileLayer(tileLayerProps, this.getSubLayerProps({
      id: "heatmap",
      data,
      // Re-use existing props to pass down values to sublayer
      // TODO replace with custom layer
      getFillColor: 0,
      getElevation: getWeight,
      elevationScale: maxDensity,
      colorDomain,
      radiusPixels,
      intensity,
      _subLayerProps: subLayerProps,
      refinementStrategy: "no-overlap",
      colorTexture: this.state.colorTexture,
      // Disable line rendering
      extruded: false,
      stroked: false,
      updateTriggers: {
        getElevation: updateTriggers.getWeight
      },
      // Tile stats
      onViewportLoad: (tiles2) => {
        this.setState({ isLoaded: true });
        if (typeof onViewportLoad === "function") {
          onViewportLoad(tiles2);
        }
      },
      onTileLoad: (tile) => {
        let maxWeight = -Infinity;
        if (typeof getWeight !== "function") {
          maxWeight = getWeight;
        } else if (tile.content) {
          for (const d of tile.content) {
            maxWeight = Math.max(getWeight(d, {}), maxWeight);
          }
        }
        tile.userData = { maxWeight };
        this.state.tiles.add(tile);
        if (typeof onTileLoad === "function") {
          onTileLoad(tile);
        }
      },
      onTileUnload: (tile) => {
        this.state.tiles.delete(tile);
        if (typeof onTileUnload === "function") {
          onTileUnload(tile);
        }
      },
      transitions: { elevationScale: { type: "spring", stiffness: 0.3, damping: 0.5 } }
    }));
  }
  _updateColorTexture(opts) {
    const { colorRange } = opts.props;
    let { colorTexture } = this.state;
    const colors = colorRangeToFlatArray(colorRange);
    if (colorTexture && (colorTexture == null ? void 0 : colorTexture.width) === colorRange.length) {
      colorTexture.setSubImageData({ data: colors });
    } else {
      colorTexture == null ? void 0 : colorTexture.destroy();
      colorTexture = this.context.device.createTexture({
        ...TEXTURE_PROPS2,
        data: colors,
        width: colorRange.length,
        height: 1
      });
    }
    this.setState({ colorTexture });
  }
};
HeatmapTileLayer.layerName = "HeatmapTileLayer";
HeatmapTileLayer.defaultProps = defaultProps6;
var heatmap_tile_layer_default = HeatmapTileLayer;

// dist/layers/point-label-layer.js
var import_core12 = require("@deck.gl/core");
var import_layers3 = require("@deck.gl/layers");
var [LEFT, TOP, RIGHT, BOTTOM] = [0, 1, 2, 3];
var EnhancedTextBackgroundLayer = class extends import_layers3._TextBackgroundLayer {
  getShaders() {
    const shaders = super.getShaders();
    let vs = shaders.vs;
    vs = vs.replaceAll("textBackground.padding.", "_padding.");
    vs = vs.replace("void main(void) {", "void main(void) {\n  vec4 _padding = textBackground.padding + instancePixelOffsets.xyxy * vec4(1.0, 1.0, -1.0, -1.0);");
    return { ...shaders, vs };
  }
};
EnhancedTextBackgroundLayer.layerName = "EnhancedTextBackgroundLayer";
var EnhancedTextLayer = class extends import_layers3.TextLayer {
  filterSubLayer({ layer, renderPass }) {
    const background = layer.id.includes("primary-background");
    if (renderPass === "collision") {
      return background;
    }
    return !background;
  }
};
EnhancedTextLayer.layerName = "EnhancedTextLayer";
var defaultProps7 = {
  ...import_layers3.TextLayer.defaultProps,
  getRadius: { type: "accessor", value: 1 },
  radiusScale: { type: "number", min: 0, value: 1 }
};
var PointLabelLayer = class extends import_core12.CompositeLayer {
  calculatePixelOffset(secondary) {
    const { getTextAnchor: anchor, getAlignmentBaseline: alignment, getRadius, getSecondaryText, radiusScale, secondarySizeScale, sizeScale } = this.props;
    const xMult = anchor === "middle" ? 0 : anchor === "start" ? 1 : -1;
    const yMult = alignment === "center" ? 0 : alignment === "bottom" ? 1 : -1;
    const xPadding = sizeScale / 4;
    const yPadding = sizeScale * (1 + 1 / 4);
    const secondaryOffset = 0.6 * (1 - yMult) * sizeScale;
    let yOffset = secondary ? secondaryOffset : 0;
    if (anchor === "middle" && alignment === "top" && getSecondaryText) {
      yOffset -= secondaryOffset;
      yOffset -= secondarySizeScale;
      yOffset += sizeScale;
    }
    const radiusPadding = 1 + 1 / 4;
    return typeof getRadius === "function" ? (d, info) => {
      const r = (info ? getRadius(d, info) : 1) * radiusScale * radiusPadding;
      return [xMult * (r + xPadding), yMult * (r + yPadding) + yOffset];
    } : [
      xMult * (getRadius * radiusScale * radiusPadding + xPadding),
      yMult * (getRadius * radiusScale * radiusPadding + yPadding) + yOffset
    ];
  }
  calculateBackgroundPadding() {
    const { getTextAnchor: anchor, getAlignmentBaseline: alignment, sizeScale } = this.props;
    const paddingX = 12 * sizeScale;
    const paddingY = 3 * sizeScale;
    const backgroundPadding = [0, 0, 0, 0];
    if (alignment === "top") {
      backgroundPadding[TOP] = paddingY;
    } else if (alignment === "bottom") {
      backgroundPadding[BOTTOM] = paddingY;
    } else {
      backgroundPadding[TOP] = 0.5 * paddingY;
      backgroundPadding[BOTTOM] = 0.5 * paddingY;
    }
    if (anchor === "start") {
      backgroundPadding[LEFT] = paddingX;
    } else if (anchor === "end") {
      backgroundPadding[RIGHT] = paddingX;
    } else {
      backgroundPadding[LEFT] = 0.5 * paddingX;
      backgroundPadding[RIGHT] = 0.5 * paddingX;
    }
    return backgroundPadding;
  }
  renderTextLayer(id4, { updateTriggers: updateTriggersOverride = {}, ...props }) {
    const { data, characterSet, fontFamily, fontSettings, fontWeight, outlineColor, outlineWidth, sizeScale, radiusScale, getAlignmentBaseline, getColor, getPosition, getTextAnchor, updateTriggers } = this.props;
    return new EnhancedTextLayer(this.getSubLayerProps({
      id: id4,
      data,
      characterSet,
      fontFamily,
      fontSettings,
      fontWeight,
      outlineColor,
      outlineWidth,
      sizeScale,
      getAlignmentBaseline,
      getColor,
      getPosition,
      getTextAnchor,
      updateTriggers: {
        ...updateTriggers,
        ...updateTriggersOverride,
        getPixelOffset: [
          updateTriggers.getRadius,
          updateTriggers.getTextAnchor,
          updateTriggers.getAlignmentBaseline,
          radiusScale,
          sizeScale
        ]
      }
    }), {
      getSize: 1,
      _subLayerProps: { background: { type: EnhancedTextBackgroundLayer } }
    }, props);
  }
  renderLayers() {
    const { getText, getSecondaryColor, getSecondaryText, secondaryOutlineColor, secondarySizeScale, updateTriggers } = this.props;
    const getPixelOffset = this.calculatePixelOffset(false);
    const backgroundPadding = this.calculateBackgroundPadding();
    const out = [
      // Text doesn't update via updateTrigger for some reason
      this.renderTextLayer(`${updateTriggers.getText}-primary`, {
        backgroundPadding,
        getText,
        getPixelOffset,
        background: true
        // Only use background for primary label for faster collisions
      }),
      Boolean(getSecondaryText) && this.renderTextLayer(`${updateTriggers.getSecondaryText}-secondary`, {
        getText: getSecondaryText,
        getPixelOffset: this.calculatePixelOffset(true),
        getAlignmentBaseline: "top",
        // updateTriggers: {getText: updateTriggers.getSecondaryText},
        // Optional overrides
        ...getSecondaryColor && { getColor: getSecondaryColor },
        ...secondarySizeScale && { sizeScale: secondarySizeScale },
        ...secondaryOutlineColor && { outlineColor: secondaryOutlineColor }
      })
    ];
    return out;
  }
};
PointLabelLayer.layerName = "PointLabelLayer";
PointLabelLayer.defaultProps = defaultProps7;
var point_label_layer_default = PointLabelLayer;

// dist/layers/raster-tile-layer.js
var import_core14 = require("@deck.gl/core");

// dist/layers/raster-layer.js
var import_core13 = require("@deck.gl/core");
var import_layers4 = require("@deck.gl/layers");

// dist/layers/raster-layer-vertex.glsl.js
var raster_layer_vertex_glsl_default = `#version 300 es
#define SHADER_NAME raster-layer-vertex-shader
in vec3 positions;
in vec3 normals;
in float instanceElevations;
in vec4 instanceFillColors;
in vec4 instanceLineColors;
in vec3 instancePickingColors;
out vec4 vColor;
#ifdef FLAT_SHADING
out vec4 position_commonspace;
#endif
void main(void) {
vec2 tileOrigin = column.offset.xy;
float scale = column.widthScale;
int yIndex = - (gl_InstanceID / BLOCK_WIDTH);
int xIndex = gl_InstanceID + (yIndex * BLOCK_WIDTH);
vec2 cellCenter = scale * vec2(float(xIndex) + 0.5, float(yIndex) - 0.5);
vec4 color = column.isStroke ? instanceLineColors : instanceFillColors;
float shouldRender = float(color.a > 0.0 && instanceElevations >= 0.0);
float cellWidth = column.coverage * scale;
geometry.position = vec4(tileOrigin + cellCenter, 0.0, 1.0);
if (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR_AUTO_OFFSET) {
geometry.position.xyz -= project.commonOrigin;
}
float elevation = 0.0;
float strokeOffsetRatio = 1.0;
if (column.extruded) {
elevation = instanceElevations * (positions.z + 1.0) / 2.0 * column.elevationScale;
} else if (column.stroked) {
float halfOffset = project_pixel_size(column.widthScale) / cellWidth;
if (column.isStroke) {
strokeOffsetRatio -= sign(positions.z) * halfOffset;
} else {
strokeOffsetRatio -= halfOffset;
}
}
geometry.pickingColor = instancePickingColors;
vec2 base = positions.xy * scale * strokeOffsetRatio * column.coverage * shouldRender;
vec3 cell = vec3(base, project_size(elevation));
DECKGL_FILTER_SIZE(cell, geometry);
geometry.position.xyz += cell;
gl_Position = project_common_position_to_clipspace(geometry.position);
geometry.normal = project_normal(normals);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
if (column.extruded && !column.isStroke) {
#ifdef FLAT_SHADING
position_commonspace = geometry.position;
vColor = vec4(color.rgb, color.a * layer.opacity);
#else
vec3 lightColor = lighting_getLightColor(color.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);
vColor = vec4(lightColor, color.a * layer.opacity);
#endif
} else {
vColor = vec4(color.rgb, color.a * layer.opacity);
}
DECKGL_FILTER_COLOR(vColor, geometry);
}
`;

// dist/layers/raster-layer.js
var defaultProps8 = {
  ...import_layers4.ColumnLayer.defaultProps,
  extruded: false,
  diskResolution: 4,
  vertices: [
    [-0.5, -0.5],
    [0.5, -0.5],
    [0.5, 0.5],
    [-0.5, 0.5]
  ]
};
var RasterColumnLayer = class extends RTTModifier(import_layers4.ColumnLayer) {
  getShaders() {
    const shaders = super.getShaders();
    const data = this.props.data;
    const BLOCK_WIDTH = data.data.blockSize ?? Math.sqrt(data.length);
    return { ...shaders, defines: { ...shaders.defines, BLOCK_WIDTH }, vs: raster_layer_vertex_glsl_default };
  }
  initializeState() {
    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instanceElevations: {
        size: 1,
        transition: true,
        accessor: "getElevation"
      },
      instanceFillColors: {
        size: this.props.colorFormat.length,
        type: "unorm8",
        transition: true,
        accessor: "getFillColor",
        defaultValue: [0, 0, 0, 255]
      },
      instanceLineColors: {
        size: this.props.colorFormat.length,
        type: "unorm8",
        transition: true,
        accessor: "getLineColor",
        defaultValue: [255, 255, 255, 255]
      }
    });
  }
};
RasterColumnLayer.layerName = "RasterColumnLayer";
function wrappedDataComparator(oldData, newData) {
  return oldData.data === newData.data && oldData.length === newData.length;
}
var RasterLayer = class extends import_core13.CompositeLayer {
  renderLayers() {
    const { data, getElevation, getFillColor, getLineColor, getLineWidth, tileIndex, updateTriggers } = this.props;
    if (!data || !tileIndex)
      return null;
    const blockSize = data.blockSize ?? 0;
    const [xOffset, yOffset, scale] = quadbinToOffset(tileIndex);
    const offset = [xOffset, yOffset];
    const lineWidthScale = scale / blockSize;
    const CellLayer = this.getSubLayerClass("column", RasterColumnLayer);
    const { highlightedObjectIndex, highlightColor } = this.state;
    return new CellLayer(this.props, this.getSubLayerProps({
      id: "cell",
      updateTriggers,
      getElevation: this.getSubLayerAccessor(getElevation),
      getFillColor: this.getSubLayerAccessor(getFillColor),
      getLineColor: this.getSubLayerAccessor(getLineColor),
      getLineWidth: this.getSubLayerAccessor(getLineWidth)
    }), {
      data: {
        data,
        // Pass through data for getSubLayerAccessor()
        length: blockSize * blockSize
      },
      dataComparator: wrappedDataComparator,
      offset,
      lineWidthScale,
      // Re-use widthScale prop to pass cell scale,
      highlightedObjectIndex,
      highlightColor,
      // RTT requires blending otherwise opacity < 1 blends with black
      // render target
      parameters: {
        blendColorSrcFactor: "one",
        blendAlphaSrcFactor: "one",
        blendColorDstFactor: "zero",
        blendAlphaDstFactor: "zero",
        blendColorOperation: "add",
        blendAlphaOperation: "add"
      }
    });
  }
  getSubLayerAccessor(accessor) {
    if (typeof accessor !== "function") {
      return super.getSubLayerAccessor(accessor);
    }
    return (object, info) => {
      const { data, index } = info;
      const binaryData = data.data;
      const proxy = createBinaryProxy(binaryData.cells, index);
      return accessor({ properties: proxy }, info);
    };
  }
  getPickingInfo(params) {
    const info = super.getPickingInfo(params);
    if (info.index !== -1) {
      info.object = this.getSubLayerAccessor((x) => x)(void 0, {
        data: this.props,
        index: info.index
      });
    }
    return info;
  }
  _updateAutoHighlight(info) {
    const { highlightedObjectIndex } = this.state;
    let newHighlightedObjectIndex = -1;
    if (info.index !== -1) {
      newHighlightedObjectIndex = info.index;
    }
    if (highlightedObjectIndex !== newHighlightedObjectIndex) {
      let { highlightColor } = this.props;
      if (typeof highlightColor === "function") {
        highlightColor = highlightColor(info);
      }
      this.setState({
        highlightColor,
        highlightedObjectIndex: newHighlightedObjectIndex
      });
    }
  }
};
RasterLayer.layerName = "RasterLayer";
RasterLayer.defaultProps = defaultProps8;
var raster_layer_default = RasterLayer;

// dist/layers/raster-tile-layer.js
var import_geo_layers7 = require("@deck.gl/geo-layers");
var renderSubLayers3 = (props) => {
  var _a, _b;
  const tileIndex = (_b = (_a = props.tile) == null ? void 0 : _a.index) == null ? void 0 : _b.q;
  if (!tileIndex)
    return null;
  return new raster_layer_default(props, { tileIndex });
};
var defaultProps9 = {
  data: TilejsonPropType,
  refinementStrategy: "no-overlap",
  tileSize: DEFAULT_TILE_SIZE
};
var PostProcessTileLayer = class extends PostProcessModifier(import_geo_layers7.TileLayer, copy) {
  filterSubLayer(context) {
    const { tile } = context.layer.props;
    if (!tile)
      return true;
    return super.filterSubLayer(context);
  }
};
var RasterTileLayer = class extends import_core14.CompositeLayer {
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
    const SubLayerClass = this.getSubLayerClass("tile", PostProcessTileLayer);
    return new SubLayerClass(this.props, {
      id: `raster-tile-layer-${this.props.id}`,
      data,
      // TODO: Tileset2D should be generic over TileIndex type
      TilesetClass: QuadbinTileset2D,
      renderSubLayers: renderSubLayers3,
      minZoom,
      maxZoom,
      loadOptions: {
        cartoRasterTile: { metadata },
        ...this.getLoadOptions()
      }
    });
  }
};
RasterTileLayer.layerName = "RasterTileLayer";
RasterTileLayer.defaultProps = defaultProps9;
var raster_tile_layer_default = RasterTileLayer;

// dist/layers/vector-tile-layer.js
var import_core15 = require("@loaders.gl/core");

// dist/layers/schema/carto-properties-tile.js
var TileReader4 = class {
  static read(pbf, end) {
    return pbf.readFields(TileReader4._readField, { properties: [], numericProps: {} }, end);
  }
  static _readField(tag, obj, pbf) {
    if (tag === 1)
      obj.properties.push(PropertiesReader.read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 2) {
      const entry = NumericPropKeyValueReader.read(pbf, pbf.readVarint() + pbf.pos);
      obj.numericProps[entry.key] = entry.value;
    }
  }
};

// dist/layers/schema/carto-properties-tile-loader.js
var CartoPropertiesTileLoader = {
  name: "CARTO Properties Tile",
  version: "1",
  id: "cartoPropertiesTile",
  module: "carto",
  extensions: ["pbf"],
  mimeTypes: ["application/vnd.carto-properties-tile"],
  category: "geometry",
  worker: true,
  parse: async (arrayBuffer, options) => parseCartoPropertiesTile(arrayBuffer, options),
  parseSync: parseCartoPropertiesTile,
  options: {}
};
function parseCartoPropertiesTile(arrayBuffer, options) {
  if (!arrayBuffer)
    return null;
  return parsePbf(arrayBuffer, TileReader4);
}
var carto_properties_tile_loader_default = CartoPropertiesTileLoader;

// dist/layers/schema/carto-vector-tile-loader.js
var import_earcut = __toESM(require("earcut"), 1);
var VERSION3 = true ? "9.1.0-beta.3" : "latest";
var id3 = "cartoVectorTile";
var DEFAULT_OPTIONS3 = {
  cartoVectorTile: {
    workerUrl: getWorkerUrl(id3, VERSION3)
  }
};
var CartoVectorTileLoader = {
  name: "CARTO Vector Tile",
  version: VERSION3,
  id: id3,
  module: "carto",
  extensions: ["pbf"],
  mimeTypes: ["application/vnd.carto-vector-tile"],
  category: "geometry",
  parse: async (arrayBuffer, options) => parseCartoVectorTile(arrayBuffer, options),
  parseSync: parseCartoVectorTile,
  worker: true,
  options: DEFAULT_OPTIONS3
};
function triangulatePolygon(polygons, target, { startPosition, endPosition, indices }) {
  const coordLength = polygons.positions.size;
  const start = startPosition * coordLength;
  const end = endPosition * coordLength;
  const polygonPositions = polygons.positions.value.subarray(start, end);
  const holes = indices.slice(1).map((n) => n - startPosition);
  const triangles = (0, import_earcut.default)(polygonPositions, holes, coordLength);
  for (let t = 0, tl = triangles.length; t < tl; ++t) {
    target.push(startPosition + triangles[t]);
  }
}
function triangulate(polygons) {
  const { polygonIndices, primitivePolygonIndices } = polygons;
  const triangles = [];
  let rangeStart = 0;
  for (let i = 0; i < polygonIndices.value.length - 1; i++) {
    const startPosition = polygonIndices.value[i];
    const endPosition = polygonIndices.value[i + 1];
    const rangeEnd = primitivePolygonIndices.value.indexOf(endPosition);
    const indices = primitivePolygonIndices.value.subarray(rangeStart, rangeEnd);
    rangeStart = rangeEnd;
    triangulatePolygon(polygons, triangles, { startPosition, endPosition, indices });
  }
  polygons.triangles = { value: new Uint32Array(triangles), size: 1 };
}
function parseCartoVectorTile(arrayBuffer, options) {
  if (!arrayBuffer)
    return null;
  const tile = parsePbf(arrayBuffer, TileReader);
  if (tile.polygons && !tile.polygons.triangles) {
    triangulate(tile.polygons);
  }
  return tile;
}
var carto_vector_tile_loader_default = CartoVectorTileLoader;

// dist/layers/vector-tile-layer.js
var import_extensions = require("@deck.gl/extensions");
var import_geo_layers8 = require("@deck.gl/geo-layers");
var import_layers5 = require("@deck.gl/layers");
(0, import_core15.registerLoaders)([carto_properties_tile_loader_default, carto_vector_tile_loader_default]);
var defaultProps10 = {
  ...import_geo_layers8.MVTLayer.defaultProps,
  data: TilejsonPropType,
  dataComparator: TilejsonPropType.equal,
  tileSize: DEFAULT_TILE_SIZE
};
var VectorTileLayer = class extends import_geo_layers8.MVTLayer {
  constructor(...propObjects) {
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
      const formatTiles = new URL(props.data.tiles[0]).searchParams.get("formatTiles");
      const mvt = formatTiles === "mvt";
      this.setState({ mvt });
    }
  }
  getLoadOptions() {
    const loadOptions = super.getLoadOptions() || {};
    const tileJSON = this.props.data;
    injectAccessToken(loadOptions, tileJSON.accessToken);
    loadOptions.gis = { format: "binary" };
    return loadOptions;
  }
  /* eslint-disable camelcase */
  async getTileData(tile) {
    const tileJSON = this.props.data;
    const { tiles, properties_tiles } = tileJSON;
    const url = (0, import_geo_layers8._getURLFromTemplate)(tiles, tile);
    if (!url) {
      return Promise.reject("Invalid URL");
    }
    const loadOptions = this.getLoadOptions();
    const { fetch: fetch2 } = this.props;
    const { signal } = tile;
    const geometryFetch = fetch2(url, { propName: "data", layer: this, loadOptions, signal });
    if (!properties_tiles) {
      return await geometryFetch;
    }
    const propertiesUrl = (0, import_geo_layers8._getURLFromTemplate)(properties_tiles, tile);
    if (!propertiesUrl) {
      return Promise.reject("Invalid properties URL");
    }
    const attributesFetch = fetch2(propertiesUrl, {
      propName: "data",
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
    const extensions = [new import_extensions.ClipExtension(), ...props.extensions || []];
    const clipProps = {
      clipBounds: [west, south, east, north]
    };
    const applyClipExtensionToSublayerProps = (subLayerId) => {
      var _a, _b, _c;
      return {
        [subLayerId]: {
          ...clipProps,
          ...(_a = props == null ? void 0 : props._subLayerProps) == null ? void 0 : _a[subLayerId],
          extensions: [...extensions, ...((_c = (_b = props == null ? void 0 : props._subLayerProps) == null ? void 0 : _b[subLayerId]) == null ? void 0 : _c.extensions) || []]
        }
      };
    };
    const subLayerProps = {
      ...props,
      autoHighlight: false,
      // Do not perform clipping on points (#9059)
      _subLayerProps: {
        ...props._subLayerProps,
        ...applyClipExtensionToSublayerProps("polygons-fill"),
        ...applyClipExtensionToSublayerProps("polygons-stroke"),
        ...applyClipExtensionToSublayerProps("linestrings")
      }
    };
    const subLayer = new import_layers5.GeoJsonLayer(subLayerProps);
    return subLayer;
  }
  _isWGS84() {
    if (this.state.mvt)
      return super._isWGS84();
    return true;
  }
};
VectorTileLayer.layerName = "VectorTileLayer";
VectorTileLayer.defaultProps = defaultProps10;
var vector_tile_layer_default = VectorTileLayer;

// dist/basemap.js
var import_api_client = require("@carto/api-client");
var cartoStyleUrlTemplate = "https://basemaps.cartocdn.com/gl/{basemap}-gl-style/style.json";
var CARTO_MAP_STYLES = ["positron", "dark-matter", "voyager"];
var GOOGLE_BASEMAPS = {
  roadmap: {
    mapTypeId: "roadmap",
    mapId: "3754c817b510f791"
  },
  "google-positron": {
    mapTypeId: "roadmap",
    mapId: "ea84ae4203ef21cd"
  },
  "google-dark-matter": {
    mapTypeId: "roadmap",
    mapId: "2fccc3b36c22a0e2"
  },
  "google-voyager": {
    mapTypeId: "roadmap",
    mapId: "885caf1e15bb9ef2"
  },
  satellite: {
    mapTypeId: "satellite"
  },
  hybrid: {
    mapTypeId: "hybrid"
  },
  terrain: {
    mapTypeId: "terrain"
  }
};
var STYLE_LAYER_GROUPS = [
  {
    slug: "label",
    filter: ({ id: id4 }) => Boolean(id4.match(/(?=(label|_label|place-|place_|poi-|poi_|watername_|roadname_|housenumber))/)),
    defaultVisibility: true
  },
  {
    slug: "road",
    filter: ({ id: id4 }) => Boolean(id4.match(/(?=(road|railway|tunnel|street|bridge))(?!.*label)/)),
    defaultVisibility: true
  },
  {
    slug: "border",
    filter: ({ id: id4 }) => Boolean(id4.match(/border|boundaries|boundary_/)),
    defaultVisibility: false
  },
  {
    slug: "building",
    filter: ({ id: id4 }) => Boolean(id4.match(/building/)),
    defaultVisibility: true
  },
  {
    slug: "water",
    filter: ({ id: id4 }) => Boolean(id4.match(/(?=(water|stream|ferry))/)),
    defaultVisibility: true
  },
  {
    slug: "land",
    filter: ({ id: id4 }) => Boolean(id4.match(/(?=(parks|landcover|industrial|sand|hillshade|park_))/)),
    defaultVisibility: true
  }
];
function applyLayerGroupFilters(style, visibleLayerGroups) {
  if (!Array.isArray(style == null ? void 0 : style.layers)) {
    return style;
  }
  const removedLayerFilters = STYLE_LAYER_GROUPS.filter((lg) => !visibleLayerGroups[lg.slug]).map((lg) => lg.filter);
  const visibleLayers = style.layers.filter((layer) => removedLayerFilters.every((match) => !match(layer)));
  return {
    ...style,
    layers: visibleLayers
  };
}
function someLayerGroupsDisabled(visibleLayerGroups) {
  return visibleLayerGroups && Object.values(visibleLayerGroups).every(Boolean) === false;
}
function getStyleUrl(styleType) {
  return cartoStyleUrlTemplate.replace("{basemap}", styleType);
}
async function fetchStyle({ styleUrl, errorContext }) {
  let response;
  return await fetch(styleUrl, { mode: "cors" }).then((res) => {
    response = res;
    return res.json();
  }).catch((error) => {
    throw new import_api_client.CartoAPIError(error, { ...errorContext, requestType: "Basemap style" }, response);
  });
}
var basemap_default = {
  VOYAGER: getStyleUrl("voyager"),
  POSITRON: getStyleUrl("positron"),
  DARK_MATTER: getStyleUrl("dark-matter"),
  VOYAGER_NOLABELS: getStyleUrl("voyager-nolabels"),
  POSITRON_NOLABELS: getStyleUrl("positron-nolabels"),
  DARK_MATTER_NOLABELS: getStyleUrl("dark-matter-nolabels")
};

// dist/style/color-bins-style.js
var import_d3_scale = require("d3-scale");

// dist/style/palette.js
var cartoColors = __toESM(require("cartocolor"), 1);
var DEFAULT_PALETTE = "PurpOr";
var NULL_COLOR = [204, 204, 204];
var OTHERS_COLOR = [119, 119, 119];
function getPalette(name, numCategories) {
  const palette = cartoColors[name];
  let paletteIndex = numCategories;
  assert(palette, `Palette "${name}" not found. Expected a CARTOColors string`);
  const palettesColorVariants = Object.keys(palette).filter((p) => p !== "tags").map(Number);
  const longestPaletteIndex = Math.max(...palettesColorVariants);
  const smallestPaletteIndex = Math.min(...palettesColorVariants);
  if (!Number.isInteger(numCategories) || numCategories > longestPaletteIndex) {
    paletteIndex = longestPaletteIndex;
  } else if (numCategories < smallestPaletteIndex) {
    paletteIndex = smallestPaletteIndex;
  }
  let colors = palette[paletteIndex];
  if (palette.tags && palette.tags.includes("qualitative")) {
    colors = colors.slice(0, -1);
  }
  return colors.map((c) => hexToRgb(c));
}
function hexToRgb(hex) {
  let result = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(hex);
  if (result) {
    return [
      parseInt(result[1] + result[1], 16),
      parseInt(result[2] + result[2], 16),
      parseInt(result[3] + result[3], 16),
      255
    ];
  }
  result = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(hex);
  if (result) {
    return [
      parseInt(result[1] + result[1], 16),
      parseInt(result[2] + result[2], 16),
      parseInt(result[3] + result[3], 16),
      parseInt(result[4] + result[4], 16)
    ];
  }
  result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), 255];
  }
  result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  assert(result, `Hexadecimal color "${hex}" was not parsed correctly`);
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
    parseInt(result[4], 16)
  ];
}

// dist/style/utils.js
var ALLOWED_ATTR_TYPES = Object.freeze(["function", "string"]);
function getAttrValue(attr, d, info) {
  var _a;
  assert(typeof d === "object", 'Expected "data" to be an object');
  assert(ALLOWED_ATTR_TYPES.includes(typeof attr), 'Expected "attr" to be a function or string');
  if (typeof attr === "function") {
    return attr(d, info);
  }
  return (_a = d == null ? void 0 : d.properties) == null ? void 0 : _a[attr];
}

// dist/style/color-bins-style.js
function colorBins({ attr, domain, colors = DEFAULT_PALETTE, nullColor = NULL_COLOR }) {
  assert(Array.isArray(domain), 'Expected "domain" to be an array of numbers');
  const palette = typeof colors === "string" ? getPalette(colors, domain.length + 1) : colors;
  const color = (0, import_d3_scale.scaleThreshold)().domain(domain).range(palette);
  return (d, info) => {
    const value = getAttrValue(attr, d, info);
    return typeof value === "number" && Number.isFinite(value) ? color(value) : nullColor;
  };
}

// dist/style/color-categories-style.js
function colorCategories({ attr, domain, colors = DEFAULT_PALETTE, nullColor = NULL_COLOR, othersColor = OTHERS_COLOR }) {
  assert(Array.isArray(domain), 'Expected "domain" to be an array of numbers or strings');
  const colorsByCategory = {};
  const palette = typeof colors === "string" ? getPalette(colors, domain.length) : colors;
  for (const [i, c] of domain.entries()) {
    colorsByCategory[c] = palette[i];
  }
  return (d, info) => {
    const value = getAttrValue(attr, d, info);
    return typeof value === "number" && Number.isFinite(value) || typeof value === "string" ? colorsByCategory[value] || othersColor : nullColor;
  };
}

// dist/style/color-continuous-style.js
var import_d3_scale2 = require("d3-scale");
function colorContinuous({ attr, domain, colors = DEFAULT_PALETTE, nullColor = NULL_COLOR }) {
  assert(Array.isArray(domain), 'Expected "domain" to be an array of numbers');
  const palette = typeof colors === "string" ? getPalette(colors, domain.length) : colors;
  const color = (0, import_d3_scale2.scaleLinear)().domain(domain).range(palette);
  return (d, info) => {
    const value = getAttrValue(attr, d, info);
    return typeof value === "number" && Number.isFinite(value) ? color(value) : nullColor;
  };
}

// dist/api/fetch-map.js
var import_api_client2 = require("@carto/api-client");

// dist/api/parse-map.js
var import_core16 = require("@deck.gl/core");

// dist/api/layer-map.js
var import_d3_array = require("d3-array");
var import_d3_color = require("d3-color");
var import_d3_scale3 = require("d3-scale");
var import_d3_format = require("d3-format");
var import_moment_timezone = __toESM(require("moment-timezone"), 1);
var import_aggregation_layers = require("@deck.gl/aggregation-layers");
var import_layers6 = require("@deck.gl/layers");
var import_geo_layers9 = require("@deck.gl/geo-layers");
var SCALE_FUNCS = {
  linear: import_d3_scale3.scaleLinear,
  ordinal: import_d3_scale3.scaleOrdinal,
  log: import_d3_scale3.scaleLog,
  point: import_d3_scale3.scalePoint,
  quantile: import_d3_scale3.scaleQuantile,
  quantize: import_d3_scale3.scaleQuantize,
  sqrt: import_d3_scale3.scaleSqrt,
  custom: import_d3_scale3.scaleThreshold,
  identity: scaleIdentity
};
function identity(v) {
  return v;
}
var UNKNOWN_COLOR = "#868d91";
var AGGREGATION = {
  average: "MEAN",
  maximum: "MAX",
  minimum: "MIN",
  sum: "SUM"
};
var OPACITY_MAP = {
  getFillColor: "opacity",
  getLineColor: "strokeOpacity",
  getTextColor: "opacity"
};
var AGGREGATION_FUNC = {
  "count unique": (values, accessor) => (0, import_d3_array.groupSort)(values, (v) => v.length, accessor).length,
  median: import_d3_array.median,
  // Unfortunately mode() is only available in d3-array@3+ which is ESM only
  mode: (values, accessor) => (0, import_d3_array.groupSort)(values, (v) => v.length, accessor).pop(),
  stddev: import_d3_array.deviation,
  variance: import_d3_array.variance
};
var TILE_LAYER_TYPE_TO_LAYER = {
  clusterTile: cluster_tile_layer_default,
  h3: h3_tile_layer_default,
  heatmapTile: heatmap_tile_layer_default,
  mvt: vector_tile_layer_default,
  quadbin: quadbin_tile_layer_default,
  raster: raster_tile_layer_default,
  tileset: vector_tile_layer_default
};
var hexToRGBA = (c) => {
  const { r, g, b, opacity } = (0, import_d3_color.rgb)(c);
  return [r, g, b, 255 * opacity];
};
var sharedPropMap = {
  // Apply the value of Kepler `color` prop to the deck `getFillColor` prop
  color: "getFillColor",
  isVisible: "visible",
  label: "cartoLabel",
  textLabel: {
    alignment: "getTextAlignmentBaseline",
    anchor: "getTextAnchor",
    // Apply the value of Kepler `textLabel.color` prop to the deck `getTextColor` prop
    color: "getTextColor",
    size: "getTextSize"
  },
  visConfig: {
    enable3d: "extruded",
    elevationScale: "elevationScale",
    filled: "filled",
    strokeColor: "getLineColor",
    stroked: "stroked",
    thickness: "getLineWidth",
    radius: "getPointRadius",
    wireframe: "wireframe"
  }
};
var customMarkersPropsMap = {
  color: "getIconColor",
  visConfig: {
    radius: "getIconSize"
  }
};
var heatmapTilePropsMap = {
  visConfig: {
    colorRange: (x) => ({ colorRange: x.colors.map(hexToRGBA) }),
    radius: "radiusPixels"
  }
};
var aggregationVisConfig = {
  colorAggregation: (x) => ({ colorAggregation: AGGREGATION[x] || AGGREGATION.sum }),
  colorRange: (x) => ({ colorRange: x.colors.map(hexToRGBA) }),
  coverage: "coverage",
  elevationPercentile: ["elevationLowerPercentile", "elevationUpperPercentile"],
  percentile: ["lowerPercentile", "upperPercentile"]
};
var defaultProps11 = {
  lineMiterLimit: 2,
  lineWidthUnits: "pixels",
  pointRadiusUnits: "pixels",
  rounded: true,
  wrapLongitude: false
};
function mergePropMaps(a = {}, b = {}) {
  return { ...a, ...b, visConfig: { ...a.visConfig, ...b.visConfig } };
}
function getLayer(type, config, dataset) {
  var _a, _b;
  let basePropMap = sharedPropMap;
  if ((_a = config.visConfig) == null ? void 0 : _a.customMarkers) {
    basePropMap = mergePropMaps(basePropMap, customMarkersPropsMap);
  }
  if (type === "heatmapTile") {
    basePropMap = mergePropMaps(basePropMap, heatmapTilePropsMap);
  }
  if (TILE_LAYER_TYPE_TO_LAYER[type]) {
    return getTileLayer(dataset, basePropMap, type);
  }
  const geoColumn = dataset == null ? void 0 : dataset.geoColumn;
  const getPosition = (d) => d[geoColumn].coordinates;
  const hexagonId = (_b = config.columns) == null ? void 0 : _b.hex_id;
  const layerTypeDefs = {
    point: {
      Layer: import_layers6.GeoJsonLayer,
      propMap: {
        columns: {
          altitude: (x) => ({ parameters: { depthWriteEnabled: Boolean(x) } })
        },
        visConfig: { outline: "stroked" }
      }
    },
    geojson: {
      Layer: import_layers6.GeoJsonLayer
    },
    grid: {
      Layer: import_aggregation_layers.GridLayer,
      propMap: { visConfig: { ...aggregationVisConfig, worldUnitSize: (x) => ({ cellSize: 1e3 * x }) } },
      defaultProps: { getPosition }
    },
    heatmap: {
      Layer: import_aggregation_layers.HeatmapLayer,
      propMap: { visConfig: { ...aggregationVisConfig, radius: "radiusPixels" } },
      defaultProps: { getPosition }
    },
    hexagon: {
      Layer: import_aggregation_layers.HexagonLayer,
      propMap: { visConfig: { ...aggregationVisConfig, worldUnitSize: (x) => ({ radius: 1e3 * x }) } },
      defaultProps: { getPosition }
    },
    hexagonId: {
      Layer: import_geo_layers9.H3HexagonLayer,
      propMap: { visConfig: { coverage: "coverage" } },
      defaultProps: { getHexagon: (d) => d[hexagonId], stroked: false }
    }
  };
  const layer = layerTypeDefs[type];
  assert(layer, `Unsupported layer type: ${type}`);
  return {
    ...layer,
    propMap: mergePropMaps(basePropMap, layer.propMap),
    defaultProps: { ...defaultProps11, ...layer.defaultProps }
  };
}
function getTileLayer(dataset, basePropMap, type) {
  const { aggregationExp, aggregationResLevel } = dataset;
  return {
    Layer: TILE_LAYER_TYPE_TO_LAYER[type] || vector_tile_layer_default,
    propMap: basePropMap,
    defaultProps: {
      ...defaultProps11,
      ...aggregationExp && { aggregationExp },
      ...aggregationResLevel && { aggregationResLevel },
      uniqueIdProperty: "geoid"
    }
  };
}
function domainFromAttribute(attribute, scaleType, scaleLength) {
  if (scaleType === "ordinal" || scaleType === "point") {
    return attribute.categories.map((c) => c.category).filter((c) => c !== void 0 && c !== null);
  }
  if (scaleType === "quantile" && attribute.quantiles) {
    return attribute.quantiles.global ? attribute.quantiles.global[scaleLength] : attribute.quantiles[scaleLength];
  }
  let { min } = attribute;
  if (scaleType === "log" && min === 0) {
    min = 1e-5;
  }
  return [min, attribute.max];
}
function domainFromValues(values, scaleType) {
  if (scaleType === "ordinal" || scaleType === "point") {
    return (0, import_d3_array.groupSort)(values, (g) => -g.length, (d) => d);
  } else if (scaleType === "quantile") {
    return values.sort((a, b) => a - b);
  } else if (scaleType === "log") {
    const [d0, d1] = (0, import_d3_array.extent)(values);
    return [d0 === 0 ? 1e-5 : d0, d1];
  }
  return (0, import_d3_array.extent)(values);
}
function calculateDomain(data, name, scaleType, scaleLength) {
  if (data.tilestats) {
    const { attributes } = data.tilestats.layers[0];
    const attribute = attributes.find((a) => a.attribute === name);
    return domainFromAttribute(attribute, scaleType, scaleLength);
  } else if (data.features) {
    const values = data.features.map(({ properties }) => properties[name]);
    return domainFromValues(values, scaleType);
  } else if (Array.isArray(data) && data[0][name] !== void 0) {
    const values = data.map((properties) => properties[name]);
    return domainFromValues(values, scaleType);
  }
  return [0, 1];
}
function normalizeAccessor(accessor, data) {
  if (data.features || data.tilestats) {
    return (object, info) => {
      if (object) {
        return accessor(object.properties || object.__source.object.properties);
      }
      const { data: data2, index } = info;
      const proxy = createBinaryProxy(data2, index);
      return accessor(proxy);
    };
  }
  return accessor;
}
function opacityToAlpha(opacity) {
  return opacity !== void 0 ? Math.round(255 * Math.pow(opacity, 1 / 2.2)) : 255;
}
function getAccessorKeys(name, aggregation) {
  let keys = [name];
  if (aggregation) {
    keys = keys.concat([aggregation, aggregation.toUpperCase()].map((a) => `${name}_${a}`));
  }
  return keys;
}
function findAccessorKey(keys, properties) {
  for (const key of keys) {
    if (key in properties) {
      return [key];
    }
  }
  throw new Error(`Could not find property for any accessor key: ${keys}`);
}
function getColorValueAccessor({ name }, colorAggregation, data) {
  const aggregator = AGGREGATION_FUNC[colorAggregation];
  const accessor = (values) => aggregator(values, (p) => p[name]);
  return normalizeAccessor(accessor, data);
}
function getColorAccessor({ name, colorColumn }, scaleType, { aggregation, range }, opacity, data) {
  const scale = calculateLayerScale(colorColumn || name, scaleType, range, data);
  const alpha = opacityToAlpha(opacity);
  let accessorKeys = getAccessorKeys(name, aggregation);
  const accessor = (properties) => {
    if (!(accessorKeys[0] in properties)) {
      accessorKeys = findAccessorKey(accessorKeys, properties);
    }
    const propertyValue = properties[accessorKeys[0]];
    const { r, g, b } = (0, import_d3_color.rgb)(scale(propertyValue));
    return [r, g, b, propertyValue === null ? 0 : alpha];
  };
  return normalizeAccessor(accessor, data);
}
function calculateLayerScale(name, scaleType, range, data) {
  const scale = SCALE_FUNCS[scaleType]();
  let domain = [];
  let scaleColor = [];
  if (scaleType !== "identity") {
    const { colorMap, colors } = range;
    if (Array.isArray(colorMap)) {
      colorMap.forEach(([value, color]) => {
        domain.push(value);
        scaleColor.push(color);
      });
    } else {
      domain = calculateDomain(data, name, scaleType, colors.length);
      scaleColor = colors;
    }
    if (scaleType === "ordinal") {
      domain = domain.slice(0, scaleColor.length);
    }
  }
  scale.domain(domain);
  scale.range(scaleColor);
  scale.unknown(UNKNOWN_COLOR);
  return scale;
}
var FALLBACK_ICON = "data:image/svg+xml;charset=utf-8;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiAgPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiLz4NCjwvc3ZnPg==";
function getIconUrlAccessor(field, range, { fallbackUrl, maxIconSize, useMaskedIcons }, data) {
  const urlToUnpackedIcon = (url) => ({
    id: `${url}@@${maxIconSize}`,
    url,
    width: maxIconSize,
    height: maxIconSize,
    mask: useMaskedIcons
  });
  let unknownValue = fallbackUrl || FALLBACK_ICON;
  if (range == null ? void 0 : range.othersMarker) {
    unknownValue = range.othersMarker;
  }
  const unknownIcon = urlToUnpackedIcon(unknownValue);
  if (!range || !field) {
    return () => unknownIcon;
  }
  const mapping = {};
  for (const { value, markerUrl } of range.markerMap) {
    if (markerUrl) {
      mapping[value] = urlToUnpackedIcon(markerUrl);
    }
  }
  const accessor = (properties) => {
    const propertyValue = properties[field.name];
    return mapping[propertyValue] || unknownIcon;
  };
  return normalizeAccessor(accessor, data);
}
function getMaxMarkerSize(visConfig, visualChannels) {
  const { radiusRange, radius } = visConfig;
  const { radiusField, sizeField } = visualChannels;
  const field = radiusField || sizeField;
  return Math.ceil(radiusRange && field ? radiusRange[1] : radius);
}
function negateAccessor(accessor) {
  return typeof accessor === "function" ? (d, i) => -accessor(d, i) : -accessor;
}
function getSizeAccessor({ name }, scaleType, aggregation, range, data) {
  const scale = scaleType ? SCALE_FUNCS[scaleType]() : identity;
  if (scaleType) {
    if (aggregation !== "count") {
      scale.domain(calculateDomain(data, name, scaleType));
    }
    scale.range(range);
  }
  let accessorKeys = getAccessorKeys(name, aggregation);
  const accessor = (properties) => {
    if (!(accessorKeys[0] in properties)) {
      accessorKeys = findAccessorKey(accessorKeys, properties);
    }
    const propertyValue = properties[accessorKeys[0]];
    return scale(propertyValue);
  };
  return normalizeAccessor(accessor, data);
}
var FORMATS = {
  date: (s) => import_moment_timezone.default.utc(s).format("MM/DD/YY HH:mm:ssa"),
  integer: (0, import_d3_format.format)("i"),
  float: (0, import_d3_format.format)(".5f"),
  timestamp: (s) => import_moment_timezone.default.utc(s).format("X"),
  default: String
};
function getTextAccessor({ name, type }, data) {
  const format = FORMATS[type] || FORMATS.default;
  const accessor = (properties) => {
    return format(properties[name]);
  };
  return normalizeAccessor(accessor, data);
}

// dist/api/parse-map.js
var import_extensions2 = require("@deck.gl/extensions");
var collisionFilterExtension = new import_extensions2.CollisionFilterExtension();
function parseMap(json) {
  const { keplerMapConfig, datasets, token } = json;
  assert(keplerMapConfig.version === "v1", "Only support Kepler v1");
  const { mapState, mapStyle } = keplerMapConfig.config;
  const { layers, layerBlending, interactionConfig } = keplerMapConfig.config.visState;
  return {
    id: json.id,
    title: json.title,
    description: json.description,
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
    initialViewState: mapState,
    /** @deprecated Use `basemap`. */
    mapStyle,
    token,
    layers: layers.reverse().map(({ id: id4, type, config, visualChannels }) => {
      try {
        const { dataId } = config;
        const dataset = datasets.find((d) => d.id === dataId);
        assert(dataset, `No dataset matching dataId: ${dataId}`);
        const { data } = dataset;
        assert(data, `No data loaded for dataId: ${dataId}`);
        const { Layer: Layer2, propMap, defaultProps: defaultProps12 } = getLayer(type, config, dataset);
        const styleProps = createStyleProps(config, propMap);
        return new Layer2({
          id: id4,
          data,
          ...defaultProps12,
          ...createInteractionProps(interactionConfig),
          ...styleProps,
          ...createChannelProps(id4, type, config, visualChannels, data),
          // Must come after style
          ...createParametersProp(layerBlending, styleProps.parameters || {}),
          // Must come after style
          ...createLoadOptions(token)
        });
      } catch (e) {
        import_core16.log.error(e.message)();
        return void 0;
      }
    })
  };
}
function createParametersProp(layerBlending, parameters) {
  if (layerBlending === "additive") {
    parameters.blendColorSrcFactor = parameters.blendAlphaSrcFactor = "src-alpha";
    parameters.blendColorDstFactor = parameters.blendAlphaDstFactor = "dst-alpha";
    parameters.blendColorOperation = parameters.blendAlphaOperation = "add";
  } else if (layerBlending === "subtractive") {
    parameters.blendColorSrcFactor = "one";
    parameters.blendColorDstFactor = "one-minus-dst-color";
    parameters.blendAlphaSrcFactor = "src-alpha";
    parameters.blendAlphaDstFactor = "dst-alpha";
    parameters.blendColorOperation = "subtract";
    parameters.blendAlphaOperation = "add";
  }
  return Object.keys(parameters).length ? { parameters } : {};
}
function createInteractionProps(interactionConfig) {
  const pickable = interactionConfig && interactionConfig.tooltip.enabled;
  return {
    autoHighlight: pickable,
    pickable
  };
}
function mapProps(source, target, mapping) {
  for (const sourceKey in mapping) {
    const sourceValue = source[sourceKey];
    const targetKey = mapping[sourceKey];
    if (sourceValue === void 0) {
      continue;
    }
    if (typeof targetKey === "string") {
      target[targetKey] = sourceValue;
    } else if (typeof targetKey === "function") {
      const [key, value] = Object.entries(targetKey(sourceValue))[0];
      target[key] = value;
    } else if (typeof targetKey === "object") {
      mapProps(sourceValue, target, targetKey);
    }
  }
}
function createStyleProps(config, mapping) {
  const result = {};
  mapProps(config, result, mapping);
  if (result.stroked && !result.getLineColor) {
    result.getLineColor = result.getFillColor;
  }
  for (const colorAccessor in OPACITY_MAP) {
    if (Array.isArray(result[colorAccessor])) {
      const color = [...result[colorAccessor]];
      const opacityKey = OPACITY_MAP[colorAccessor];
      const opacity = config.visConfig[opacityKey];
      color[3] = opacityToAlpha(opacity);
      result[colorAccessor] = color;
    }
  }
  result.highlightColor = config.visConfig.enable3d ? [255, 255, 255, 60] : [252, 242, 26, 255];
  return result;
}
function createChannelProps(id4, type, config, visualChannels, data) {
  var _a;
  const { colorField, colorScale, radiusField, radiusScale, sizeField, sizeScale, strokeColorField, strokeColorScale, weightField } = visualChannels;
  let { heightField, heightScale } = visualChannels;
  if (type === "hexagonId") {
    heightField = sizeField;
    heightScale = sizeScale;
  }
  const { textLabel, visConfig } = config;
  const result = {};
  if (type === "grid" || type === "hexagon") {
    result.colorScaleType = colorScale;
    if (colorField) {
      const { colorAggregation } = config.visConfig;
      if (!AGGREGATION[colorAggregation]) {
        result.getColorValue = getColorValueAccessor(colorField, colorAggregation, data);
      } else {
        result.getColorWeight = (d) => d[colorField.name];
      }
    }
  } else if (colorField) {
    const { colorAggregation: aggregation, colorRange: range } = visConfig;
    result.getFillColor = getColorAccessor(
      colorField,
      // @ts-ignore
      colorScale,
      { aggregation, range },
      visConfig.opacity,
      data
    );
  }
  if (type === "point") {
    const altitude = (_a = config.columns) == null ? void 0 : _a.altitude;
    if (altitude) {
      result.dataTransform = (data2) => {
        data2.features.forEach(({ geometry, properties }) => {
          const { type: type2, coordinates } = geometry;
          if (type2 === "Point") {
            coordinates[2] = properties[altitude];
          }
        });
        return data2;
      };
    }
  }
  if (radiusField || sizeField) {
    result.getPointRadius = getSizeAccessor(
      // @ts-ignore
      radiusField || sizeField,
      // @ts-ignore
      radiusScale || sizeScale,
      visConfig.sizeAggregation,
      visConfig.radiusRange || visConfig.sizeRange,
      data
    );
  }
  if (strokeColorField) {
    const fallbackOpacity = type === "point" ? visConfig.opacity : 1;
    const opacity = visConfig.strokeOpacity !== void 0 ? visConfig.strokeOpacity : fallbackOpacity;
    const { strokeColorAggregation: aggregation, strokeColorRange: range } = visConfig;
    result.getLineColor = getColorAccessor(
      strokeColorField,
      // @ts-ignore
      strokeColorScale,
      // @ts-ignore
      { aggregation, range },
      opacity,
      data
    );
  }
  if (heightField && visConfig.enable3d) {
    result.getElevation = getSizeAccessor(
      heightField,
      // @ts-ignore
      heightScale,
      visConfig.heightAggregation,
      visConfig.heightRange || visConfig.sizeRange,
      data
    );
  }
  if (weightField) {
    result.getWeight = getSizeAccessor(weightField, void 0, visConfig.weightAggregation, void 0, data);
  }
  if (visConfig.customMarkers) {
    const maxIconSize = getMaxMarkerSize(visConfig, visualChannels);
    const { getPointRadius, getFillColor } = result;
    const { customMarkersUrl, customMarkersRange, filled: useMaskedIcons } = visConfig;
    result.pointType = "icon";
    result.getIcon = getIconUrlAccessor(visualChannels.customMarkersField, customMarkersRange, { fallbackUrl: customMarkersUrl, maxIconSize, useMaskedIcons }, data);
    result._subLayerProps = {
      "points-icon": {
        loadOptions: {
          image: {
            type: "imagebitmap"
          },
          imagebitmap: {
            resizeWidth: maxIconSize,
            resizeHeight: maxIconSize,
            resizeQuality: "high"
          }
        }
      }
    };
    if (getFillColor && useMaskedIcons) {
      result.getIconColor = getFillColor;
    }
    if (getPointRadius) {
      result.getIconSize = getPointRadius;
    }
    if (visualChannels.rotationField) {
      result.getIconAngle = negateAccessor(getSizeAccessor(visualChannels.rotationField, void 0, null, void 0, data));
    }
  } else if (type === "point" || type === "tileset") {
    result.pointType = "circle";
  }
  if (textLabel && textLabel.length && textLabel[0].field) {
    const [mainLabel, secondaryLabel] = textLabel;
    const collisionGroup = id4;
    ({
      alignment: result.getTextAlignmentBaseline,
      anchor: result.getTextAnchor,
      color: result.getTextColor,
      outlineColor: result.textOutlineColor,
      size: result.textSizeScale
    } = mainLabel);
    const { color: getSecondaryColor, field: secondaryField, outlineColor: secondaryOutlineColor, size: secondarySizeScale } = secondaryLabel || {};
    result.getText = mainLabel.field && getTextAccessor(mainLabel.field, data);
    const getSecondaryText = secondaryField && getTextAccessor(secondaryField, data);
    result.pointType = `${result.pointType}+text`;
    result.textCharacterSet = "auto";
    result.textFontFamily = "Inter, sans";
    result.textFontSettings = { sdf: true };
    result.textFontWeight = 600;
    result.textOutlineWidth = 3;
    result._subLayerProps = {
      ...result._subLayerProps,
      "points-text": {
        type: point_label_layer_default,
        extensions: [collisionFilterExtension],
        collisionEnabled: true,
        collisionGroup,
        // getPointRadius already has radiusScale baked in, so only pass one or the other
        ...result.getPointRadius ? { getRadius: result.getPointRadius } : { radiusScale: visConfig.radius },
        ...secondaryField && {
          getSecondaryText,
          getSecondaryColor,
          secondarySizeScale,
          secondaryOutlineColor
        }
      }
    };
  }
  return result;
}
function createLoadOptions(accessToken) {
  return {
    loadOptions: { fetch: { headers: { Authorization: `Bearer ${accessToken}` } } }
  };
}

// dist/api/basemap.js
var CUSTOM_STYLE_ID_PREFIX = "custom:";
var DEFAULT_CARTO_STYLE = "positron";
function mapLibreViewpros(config) {
  const { longitude, latitude, ...rest } = config.mapState;
  return {
    center: [longitude, latitude],
    ...rest
  };
}
async function fetchBasemapProps({ config, errorContext, applyLayerFilters = true }) {
  var _a;
  const { mapStyle } = config;
  const styleType = mapStyle.styleType || DEFAULT_CARTO_STYLE;
  if (styleType.startsWith(CUSTOM_STYLE_ID_PREFIX)) {
    const currentCustomStyle = (_a = config.customBaseMaps) == null ? void 0 : _a.customStyle;
    if (currentCustomStyle) {
      return {
        type: "maplibre",
        props: {
          style: currentCustomStyle.style || currentCustomStyle.url,
          ...mapLibreViewpros(config)
        },
        attribution: currentCustomStyle.customAttribution
      };
    }
  }
  if (CARTO_MAP_STYLES.includes(styleType)) {
    const { visibleLayerGroups } = mapStyle;
    const styleUrl = getStyleUrl(styleType);
    let style = styleUrl;
    let rawStyle = styleUrl;
    if (applyLayerFilters && visibleLayerGroups && someLayerGroupsDisabled(visibleLayerGroups)) {
      rawStyle = await fetchStyle({ styleUrl, errorContext });
      style = applyLayerGroupFilters(rawStyle, visibleLayerGroups);
    }
    return {
      type: "maplibre",
      props: {
        style,
        ...mapLibreViewpros(config)
      },
      visibleLayerGroups,
      rawStyle
    };
  }
  const googleBasemapDef = GOOGLE_BASEMAPS[styleType];
  if (googleBasemapDef) {
    const { mapState } = config;
    return {
      type: "google-maps",
      props: {
        ...googleBasemapDef,
        center: { lat: mapState.latitude, lng: mapState.longitude },
        zoom: mapState.zoom + 1,
        tilt: mapState.pitch,
        heading: mapState.bearing
      }
    };
  }
  return {
    type: "maplibre",
    props: {
      style: getStyleUrl(DEFAULT_CARTO_STYLE),
      ...mapLibreViewpros(config)
    }
  };
}

// dist/api/fetch-map.js
async function _fetchMapDataset(dataset, context) {
  const { aggregationExp, aggregationResLevel, connectionName, columns, format, geoColumn, source, type, queryParameters } = dataset;
  const cache = {};
  const globalOptions = {
    ...context,
    cache,
    connectionName,
    format
  };
  if (type === "tileset") {
    dataset.data = await (0, import_api_client2.vectorTilesetSource)({ ...globalOptions, tableName: source });
  } else {
    const [spatialDataType, spatialDataColumn] = geoColumn ? geoColumn.split(":") : ["geom"];
    if (spatialDataType === "geom") {
      const options = { ...globalOptions, spatialDataColumn };
      if (type === "table") {
        dataset.data = await (0, import_api_client2.vectorTableSource)({ ...options, columns, tableName: source });
      } else if (type === "query") {
        dataset.data = await (0, import_api_client2.vectorQuerySource)({
          ...options,
          columns,
          sqlQuery: source,
          queryParameters
        });
      }
    } else if (spatialDataType === "h3") {
      const options = { ...globalOptions, aggregationExp, aggregationResLevel, spatialDataColumn };
      if (type === "table") {
        dataset.data = await (0, import_api_client2.h3TableSource)({ ...options, tableName: source });
      } else if (type === "query") {
        dataset.data = await (0, import_api_client2.h3QuerySource)({ ...options, sqlQuery: source, queryParameters });
      }
    } else if (spatialDataType === "quadbin") {
      const options = { ...globalOptions, aggregationExp, aggregationResLevel, spatialDataColumn };
      if (type === "table") {
        dataset.data = await (0, import_api_client2.quadbinTableSource)({ ...options, tableName: source });
      } else if (type === "query") {
        dataset.data = await (0, import_api_client2.quadbinQuerySource)({ ...options, sqlQuery: source, queryParameters });
      }
    }
  }
  let cacheChanged = true;
  if (cache.value) {
    cacheChanged = dataset.cache !== cache.value;
    dataset.cache = cache.value;
  }
  return cacheChanged;
}
async function _fetchTilestats(attribute, dataset, context) {
  const { connectionName, data, id: id4, source, type, queryParameters } = dataset;
  const { apiBaseUrl } = context;
  const errorContext = {
    requestType: "Tile stats",
    connection: connectionName,
    type,
    source
  };
  if (!("tilestats" in data)) {
    throw new import_api_client2.CartoAPIError(new Error(`Invalid dataset for tilestats: ${id4}`), errorContext);
  }
  const baseUrl = (0, import_api_client2.buildStatsUrl)({ attribute, apiBaseUrl, ...dataset });
  const client = new URLSearchParams(data.tiles[0]).get("client");
  const headers = { Authorization: `Bearer ${context.accessToken}` };
  const parameters = {};
  if (client) {
    parameters.client = client;
  }
  if (type === "query") {
    parameters.q = source;
    if (queryParameters) {
      parameters.queryParameters = JSON.stringify(queryParameters);
    }
  }
  const stats = await (0, import_api_client2.requestWithParameters)({
    baseUrl,
    headers,
    parameters,
    errorContext,
    maxLengthURL: context.maxLengthURL
  });
  const { attributes } = data.tilestats.layers[0];
  const index = attributes.findIndex((d) => d.attribute === attribute);
  attributes[index] = stats;
  return true;
}
async function fillInMapDatasets({ datasets }, context) {
  const promises = datasets.map((dataset) => _fetchMapDataset(dataset, context));
  return await Promise.all(promises);
}
async function fillInTileStats({ datasets, keplerMapConfig }, context) {
  var _a;
  const attributes = [];
  const { layers } = keplerMapConfig.config.visState;
  for (const layer of layers) {
    for (const channel of Object.keys(layer.visualChannels)) {
      const attribute = (_a = layer.visualChannels[channel]) == null ? void 0 : _a.name;
      if (attribute) {
        const dataset = datasets.find((d) => d.id === layer.config.dataId);
        if (dataset && dataset.type !== "tileset" && dataset.data.tilestats) {
          attributes.push({ attribute, dataset });
        }
      }
    }
  }
  const filteredAttributes = [];
  for (const a of attributes) {
    if (!filteredAttributes.find(({ attribute, dataset }) => attribute === a.attribute && dataset === a.dataset)) {
      filteredAttributes.push(a);
    }
  }
  const promises = filteredAttributes.map(({ attribute, dataset }) => _fetchTilestats(attribute, dataset, context));
  return await Promise.all(promises);
}
async function fetchMap({ accessToken, apiBaseUrl = import_api_client2.DEFAULT_API_BASE_URL, cartoMapId, clientId, headers, autoRefresh, onNewData, maxLengthURL }) {
  assert(cartoMapId, 'Must define CARTO map id: fetchMap({cartoMapId: "XXXX-XXXX-XXXX"})');
  if (accessToken) {
    headers = { Authorization: `Bearer ${accessToken}`, ...headers };
  }
  if (autoRefresh || onNewData) {
    assert(onNewData, "Must define `onNewData` when using autoRefresh");
    assert(typeof onNewData === "function", "`onNewData` must be a function");
    assert(typeof autoRefresh === "number" && autoRefresh > 0, "`autoRefresh` must be a positive number");
  }
  const baseUrl = (0, import_api_client2.buildPublicMapUrl)({ apiBaseUrl, cartoMapId });
  const errorContext = { requestType: "Public map", mapId: cartoMapId };
  const map = await (0, import_api_client2.requestWithParameters)({ baseUrl, headers, errorContext, maxLengthURL });
  const context = {
    accessToken: map.token || accessToken,
    apiBaseUrl,
    clientId,
    headers,
    maxLengthURL
  };
  let stopAutoRefresh;
  if (autoRefresh) {
    const intervalId = setInterval(async () => {
      const changed = await fillInMapDatasets(map, {
        ...context,
        headers: {
          ...headers,
          "If-Modified-Since": new Date().toUTCString()
        }
      });
      if (onNewData && changed.some((v) => v === true)) {
        onNewData(parseMap(map));
      }
    }, autoRefresh * 1e3);
    stopAutoRefresh = () => {
      clearInterval(intervalId);
    };
  }
  const geojsonLayers = map.keplerMapConfig.config.visState.layers.filter(({ type }) => type === "geojson" || type === "point");
  const geojsonDatasetIds = geojsonLayers.map(({ config }) => config.dataId);
  map.datasets.forEach((dataset) => {
    if (geojsonDatasetIds.includes(dataset.id)) {
      const { config } = geojsonLayers.find(({ config: config2 }) => config2.dataId === dataset.id);
      dataset.format = "geojson";
      if (!dataset.geoColumn && config.columns.geojson) {
        dataset.geoColumn = config.columns.geojson;
      }
    }
  });
  const [basemap] = await Promise.all([
    fetchBasemapProps({ config: map.keplerMapConfig.config, errorContext }),
    // Mutates map.datasets so that dataset.data contains data
    fillInMapDatasets(map, context)
  ]);
  await fillInTileStats(map, context);
  const out = { ...parseMap(map), basemap, ...{ stopAutoRefresh } };
  const textLayers = out.layers.filter((layer) => {
    const pointType = layer.props.pointType || "";
    return pointType.includes("text");
  });
  if (textLayers.length && window.FontFace && !document.fonts.check("12px Inter")) {
    const font = new FontFace("Inter", "url(https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2)");
    await font.load().then((f) => document.fonts.add(f));
  }
  return out;
}

// dist/index.js
var import_api_client3 = require("@carto/api-client");
var import_api_client4 = require("@carto/api-client");
var CARTO_LAYERS = {
  ClusterTileLayer: cluster_tile_layer_default,
  H3TileLayer: h3_tile_layer_default,
  HeatmapTileLayer: heatmap_tile_layer_default,
  PointLabelLayer: point_label_layer_default,
  QuadbinTileLayer: quadbin_tile_layer_default,
  RasterTileLayer: raster_tile_layer_default,
  VectorTileLayer: vector_tile_layer_default
};
var CARTO_SOURCES = {
  boundaryQuerySource: import_api_client3.boundaryQuerySource,
  boundaryTableSource: import_api_client3.boundaryTableSource,
  h3QuerySource: import_api_client3.h3QuerySource,
  h3TableSource: import_api_client3.h3TableSource,
  h3TilesetSource: import_api_client3.h3TilesetSource,
  rasterSource: import_api_client3.rasterSource,
  quadbinQuerySource: import_api_client3.quadbinQuerySource,
  quadbinTableSource: import_api_client3.quadbinTableSource,
  quadbinTilesetSource: import_api_client3.quadbinTilesetSource,
  vectorQuerySource: import_api_client3.vectorQuerySource,
  vectorTableSource: import_api_client3.vectorTableSource,
  vectorTilesetSource: import_api_client3.vectorTilesetSource
};
//# sourceMappingURL=index.cjs.map
