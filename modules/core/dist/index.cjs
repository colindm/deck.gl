"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod2) => __copyProps(__defProp({}, "__esModule", { value: true }), mod2);

// dist/index.js
var dist_exports = {};
__export(dist_exports, {
  AmbientLight: () => AmbientLight,
  Attribute: () => Attribute,
  AttributeManager: () => AttributeManager,
  COORDINATE_SYSTEM: () => COORDINATE_SYSTEM,
  CompositeLayer: () => composite_layer_default,
  Controller: () => Controller,
  Deck: () => deck_default,
  DeckRenderer: () => DeckRenderer,
  DirectionalLight: () => DirectionalLight,
  FirstPersonController: () => FirstPersonController,
  FirstPersonView: () => first_person_view_default,
  FirstPersonViewport: () => FirstPersonViewport,
  FlyToInterpolator: () => FlyToInterpolator,
  Layer: () => layer_default,
  LayerExtension: () => layer_extension_default,
  LayerManager: () => LayerManager,
  LightingEffect: () => LightingEffect,
  LinearInterpolator: () => LinearInterpolator,
  MapController: () => MapController,
  MapView: () => map_view_default,
  OPERATION: () => OPERATION,
  OrbitController: () => OrbitController,
  OrbitView: () => orbit_view_default,
  OrbitViewport: () => OrbitViewport,
  OrthographicController: () => OrthographicController,
  OrthographicView: () => orthographic_view_default,
  OrthographicViewport: () => OrthographicViewport,
  PointLight: () => PointLight,
  PostProcessEffect: () => PostProcessEffect,
  TRANSITION_EVENTS: () => TRANSITION_EVENTS,
  Tesselator: () => Tesselator,
  TransitionInterpolator: () => TransitionInterpolator,
  UNIT: () => UNIT,
  VERSION: () => VERSION,
  View: () => View,
  Viewport: () => viewport_default,
  WebMercatorViewport: () => web_mercator_viewport_default,
  _CameraLight: () => CameraLight,
  _Component: () => component_default,
  _ComponentState: () => ComponentState,
  _GlobeController: () => GlobeController,
  _GlobeView: () => globe_view_default,
  _GlobeViewport: () => GlobeViewport,
  _LayersPass: () => LayersPass,
  _PickLayersPass: () => PickLayersPass,
  _SunLight: () => SunLight,
  _applyStyles: () => applyStyles,
  _compareProps: () => compareProps,
  _count: () => count,
  _deepEqual: () => deepEqual,
  _fillArray: () => fillArray,
  _flatten: () => flatten,
  _memoize: () => memoize,
  _mergeShaders: () => mergeShaders,
  _removeStyles: () => removeStyles,
  assert: () => assert,
  createIterable: () => createIterable,
  fp64LowPart: () => fp64LowPart,
  getShaderAssembler: () => getShaderAssembler,
  gouraudLighting: () => import_shadertools4.gouraudLighting,
  log: () => log_default,
  phongLighting: () => import_shadertools4.phongLighting,
  picking: () => picking_default,
  project: () => project_default,
  project32: () => project32_default,
  shadow: () => shadow_default
});
module.exports = __toCommonJS(dist_exports);

// dist/lib/init.js
var import_core = require("@loaders.gl/core");
var import_images = require("@loaders.gl/images");

// dist/utils/log.js
var import_log = require("@probe.gl/log");
var defaultLogger = new import_log.Log({ id: "deck" });
var log_default = defaultLogger;

// dist/debug/loggers.js
var logState = {
  attributeUpdateStart: -1,
  attributeManagerUpdateStart: -1,
  attributeUpdateMessages: []
};
var LOG_LEVEL_MAJOR_UPDATE = 1;
var LOG_LEVEL_MINOR_UPDATE = 2;
var LOG_LEVEL_UPDATE_DETAIL = 3;
var LOG_LEVEL_INFO = 4;
var LOG_LEVEL_DRAW = 2;
var getLoggers = (log) => ({
  /* Layer events */
  "layer.changeFlag": (layer, key, flags) => {
    log.log(LOG_LEVEL_UPDATE_DETAIL, `${layer.id} ${key}: `, flags[key])();
  },
  "layer.initialize": (layer) => {
    log.log(LOG_LEVEL_MAJOR_UPDATE, `Initializing ${layer}`)();
  },
  "layer.update": (layer, needsUpdate) => {
    if (needsUpdate) {
      const flags = layer.getChangeFlags();
      log.log(LOG_LEVEL_MINOR_UPDATE, `Updating ${layer} because: ${Object.keys(flags).filter((key) => flags[key]).join(", ")}`)();
    } else {
      log.log(LOG_LEVEL_INFO, `${layer} does not need update`)();
    }
  },
  "layer.matched": (layer, changed) => {
    if (changed) {
      log.log(LOG_LEVEL_INFO, `Matched ${layer}, state transfered`)();
    }
  },
  "layer.finalize": (layer) => {
    log.log(LOG_LEVEL_MAJOR_UPDATE, `Finalizing ${layer}`)();
  },
  /* CompositeLayer events */
  "compositeLayer.renderLayers": (layer, updated, subLayers) => {
    if (updated) {
      log.log(LOG_LEVEL_MINOR_UPDATE, `Composite layer rendered new subLayers ${layer}`, subLayers)();
    } else {
      log.log(LOG_LEVEL_INFO, `Composite layer reused subLayers ${layer}`, subLayers)();
    }
  },
  /* LayerManager events */
  "layerManager.setLayers": (layerManager, updated, layers) => {
    if (updated) {
      log.log(LOG_LEVEL_MINOR_UPDATE, `Updating ${layers.length} deck layers`)();
    }
  },
  "layerManager.activateViewport": (layerManager, viewport) => {
    log.log(LOG_LEVEL_UPDATE_DETAIL, "Viewport changed", viewport)();
  },
  /* AttributeManager events */
  "attributeManager.invalidate": (attributeManager, trigger, attributeNames) => {
    log.log(LOG_LEVEL_MAJOR_UPDATE, attributeNames ? `invalidated attributes ${attributeNames} (${trigger}) for ${attributeManager.id}` : `invalidated all attributes for ${attributeManager.id}`)();
  },
  "attributeManager.updateStart": (attributeManager) => {
    logState.attributeUpdateMessages.length = 0;
    logState.attributeManagerUpdateStart = Date.now();
  },
  "attributeManager.updateEnd": (attributeManager, numInstances) => {
    const timeMs = Math.round(Date.now() - logState.attributeManagerUpdateStart);
    log.groupCollapsed(LOG_LEVEL_MINOR_UPDATE, `Updated attributes for ${numInstances} instances in ${attributeManager.id} in ${timeMs}ms`)();
    for (const updateMessage of logState.attributeUpdateMessages) {
      log.log(LOG_LEVEL_UPDATE_DETAIL, updateMessage)();
    }
    log.groupEnd(LOG_LEVEL_MINOR_UPDATE)();
  },
  /* Attribute events */
  "attribute.updateStart": (attribute) => {
    logState.attributeUpdateStart = Date.now();
  },
  "attribute.allocate": (attribute, numInstances) => {
    const message = `${attribute.id} allocated ${numInstances}`;
    logState.attributeUpdateMessages.push(message);
  },
  "attribute.updateEnd": (attribute, numInstances) => {
    const timeMs = Math.round(Date.now() - logState.attributeUpdateStart);
    const message = `${attribute.id} updated ${numInstances} in ${timeMs}ms`;
    logState.attributeUpdateMessages.push(message);
  },
  /* Render events */
  "deckRenderer.renderLayers": (deckRenderer, renderStats, opts) => {
    const { pass, redrawReason, stats } = opts;
    for (const status of renderStats) {
      const { totalCount, visibleCount, compositeCount, pickableCount } = status;
      const primitiveCount = totalCount - compositeCount;
      const hiddenCount = primitiveCount - visibleCount;
      log.log(LOG_LEVEL_DRAW, `RENDER #${deckRenderer.renderCount}   ${visibleCount} (of ${totalCount} layers) to ${pass} because ${redrawReason}   (${hiddenCount} hidden, ${compositeCount} composite ${pickableCount} pickable)`)();
      if (stats) {
        stats.get("Redraw Layers").add(visibleCount);
      }
    }
  }
});

// dist/debug/index.js
var loggers = {};
if (true) {
  loggers = getLoggers(log_default);
}
function register(handlers) {
  loggers = handlers;
}
function debug(eventType, arg1, arg2, arg3) {
  if (log_default.level > 0 && loggers[eventType]) {
    loggers[eventType].call(null, arg1, arg2, arg3);
  }
}

// dist/utils/json-loader.js
function isJSON(text) {
  const firstChar = text[0];
  const lastChar = text[text.length - 1];
  return firstChar === "{" && lastChar === "}" || firstChar === "[" && lastChar === "]";
}
var json_loader_default = {
  dataType: null,
  batchType: null,
  id: "JSON",
  name: "JSON",
  module: "",
  version: "",
  options: {},
  extensions: ["json", "geojson"],
  mimeTypes: ["application/json", "application/geo+json"],
  testText: isJSON,
  parseTextSync: JSON.parse
};

// dist/lib/init.js
function checkVersion() {
  const version = true ? "9.1.0-beta.3" : globalThis.DECK_VERSION || "untranspiled source";
  const existingVersion = globalThis.deck && globalThis.deck.VERSION;
  if (existingVersion && existingVersion !== version) {
    throw new Error(`deck.gl - multiple versions detected: ${existingVersion} vs ${version}`);
  }
  if (!existingVersion) {
    log_default.log(1, `deck.gl ${version}`)();
    globalThis.deck = {
      ...globalThis.deck,
      VERSION: version,
      version,
      log: log_default,
      // experimental
      _registerLoggers: register
    };
    (0, import_core.registerLoaders)([
      json_loader_default,
      // @ts-expect-error non-standard Loader format
      [import_images.ImageLoader, { imagebitmap: { premultiplyAlpha: "none" } }]
    ]);
  }
  return version;
}
var VERSION = checkVersion();

// dist/shaderlib/index.js
var import_shadertools3 = require("@luma.gl/shadertools");
var import_shadertools4 = require("@luma.gl/shadertools");

// dist/shaderlib/misc/layer-uniforms.js
var uniformBlock = `uniform layerUniforms {
  uniform float opacity;
} layer;
`;
var layerUniforms = {
  name: "layer",
  vs: uniformBlock,
  fs: uniformBlock,
  getUniforms: (props) => {
    return {
      // apply gamma to opacity to make it visually "linear"
      // TODO - v10: use raw opacity?
      opacity: Math.pow(props.opacity, 1 / 2.2)
    };
  },
  uniformTypes: {
    opacity: "f32"
  }
};

// dist/shaderlib/misc/geometry.js
var defines = "#define SMOOTH_EDGE_RADIUS 0.5";
var vs = `
${defines}

struct VertexGeometry {
  vec4 position;
  vec3 worldPosition;
  vec3 worldPositionAlt;
  vec3 normal;
  vec2 uv;
  vec3 pickingColor;
} geometry = VertexGeometry(
  vec4(0.0, 0.0, 1.0, 0.0),
  vec3(0.0),
  vec3(0.0),
  vec3(0.0),
  vec2(0.0),
  vec3(0.0)
);
`;
var fs = `
${defines}

struct FragmentGeometry {
  vec2 uv;
} geometry;

float smoothedge(float edge, float x) {
  return smoothstep(edge - SMOOTH_EDGE_RADIUS, edge + SMOOTH_EDGE_RADIUS, x);
}
`;
var geometry_default = { name: "geometry", vs, fs };

// dist/shaderlib/project/project.js
var import_shadertools = require("@luma.gl/shadertools");

// dist/lib/constants.js
var import_mjolnir = require("mjolnir.js");
var COORDINATE_SYSTEM = {
  /**
   * `LNGLAT` if rendering into a geospatial viewport, `CARTESIAN` otherwise
   */
  DEFAULT: -1,
  /**
   * Positions are interpreted as [longitude, latitude, elevation]
   * longitude/latitude are in degrees, elevation is in meters.
   * Dimensions are in meters.
   */
  LNGLAT: 1,
  /**
   * Positions are interpreted as [x, y, z] in meter offsets from the coordinate origin.
   * Dimensions are in meters.
   */
  METER_OFFSETS: 2,
  /**
   * Positions are interpreted as [deltaLng, deltaLat, elevation] from the coordinate origin.
   * deltaLng/deltaLat are in degrees, elevation is in meters.
   * Dimensions are in meters.
   */
  LNGLAT_OFFSETS: 3,
  /**
   * Positions and dimensions are in the common units of the viewport.
   */
  CARTESIAN: 0
};
Object.defineProperty(COORDINATE_SYSTEM, "IDENTITY", {
  get: () => {
    log_default.deprecated("COORDINATE_SYSTEM.IDENTITY", "COORDINATE_SYSTEM.CARTESIAN")();
    return 0;
  }
});
var PROJECTION_MODE = {
  /**
   * Render geospatial data in Web Mercator projection
   */
  WEB_MERCATOR: 1,
  /**
   * Render geospatial data as a 3D globe
   */
  GLOBE: 2,
  /**
   * (Internal use only) Web Mercator projection at high zoom
   */
  WEB_MERCATOR_AUTO_OFFSET: 4,
  /**
   * No transformation
   */
  IDENTITY: 0
};
var UNIT = {
  common: 0,
  meters: 1,
  pixels: 2
};
var EVENT_HANDLERS = {
  click: "onClick",
  panstart: "onDragStart",
  panmove: "onDrag",
  panend: "onDragEnd"
};
var RECOGNIZERS = {
  multipan: [import_mjolnir.Pan, { threshold: 10, direction: import_mjolnir.InputDirection.Vertical, pointers: 2 }],
  pinch: [import_mjolnir.Pinch, {}, null, ["multipan"]],
  pan: [import_mjolnir.Pan, { threshold: 1 }, ["pinch"], ["multipan"]],
  dblclick: [import_mjolnir.Tap, { event: "dblclick", taps: 2 }],
  click: [import_mjolnir.Tap, { event: "click" }, null, ["dblclick"]]
};
var OPERATION = {
  DRAW: "draw",
  MASK: "mask",
  TERRAIN: "terrain"
};

// dist/shaderlib/project/project.glsl.js
var COORDINATE_SYSTEM_GLSL_CONSTANTS = Object.keys(COORDINATE_SYSTEM).map((key) => `const int COORDINATE_SYSTEM_${key} = ${COORDINATE_SYSTEM[key]};`).join("");
var PROJECTION_MODE_GLSL_CONSTANTS = Object.keys(PROJECTION_MODE).map((key) => `const int PROJECTION_MODE_${key} = ${PROJECTION_MODE[key]};`).join("");
var UNIT_GLSL_CONSTANTS = Object.keys(UNIT).map((key) => `const int UNIT_${key.toUpperCase()} = ${UNIT[key]};`).join("");
var project_glsl_default = `${COORDINATE_SYSTEM_GLSL_CONSTANTS}
${PROJECTION_MODE_GLSL_CONSTANTS}
${UNIT_GLSL_CONSTANTS}
uniform projectUniforms {
bool wrapLongitude;
int coordinateSystem;
vec3 commonUnitsPerMeter;
int projectionMode;
float scale;
vec3 commonUnitsPerWorldUnit;
vec3 commonUnitsPerWorldUnit2;
vec4 center;
mat4 modelMatrix;
mat4 viewProjectionMatrix;
vec2 viewportSize;
float devicePixelRatio;
float focalDistance;
vec3 cameraPosition;
vec3 coordinateOrigin;
vec3 commonOrigin;
bool pseudoMeters;
} project;
const float TILE_SIZE = 512.0;
const float PI = 3.1415926536;
const float WORLD_SCALE = TILE_SIZE / (PI * 2.0);
const vec3 ZERO_64_LOW = vec3(0.0);
const float EARTH_RADIUS = 6370972.0;
const float GLOBE_RADIUS = 256.0;
float project_size_at_latitude(float lat) {
float y = clamp(lat, -89.9, 89.9);
return 1.0 / cos(radians(y));
}
float project_size() {
if (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR &&
project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT &&
project.pseudoMeters == false) {
if (geometry.position.w == 0.0) {
return project_size_at_latitude(geometry.worldPosition.y);
}
float y = geometry.position.y / TILE_SIZE * 2.0 - 1.0;
float y2 = y * y;
float y4 = y2 * y2;
float y6 = y4 * y2;
return 1.0 + 4.9348 * y2 + 4.0587 * y4 + 1.5642 * y6;
}
return 1.0;
}
float project_size_at_latitude(float meters, float lat) {
return meters * project.commonUnitsPerMeter.z * project_size_at_latitude(lat);
}
float project_size(float meters) {
return meters * project.commonUnitsPerMeter.z * project_size();
}
vec2 project_size(vec2 meters) {
return meters * project.commonUnitsPerMeter.xy * project_size();
}
vec3 project_size(vec3 meters) {
return meters * project.commonUnitsPerMeter * project_size();
}
vec4 project_size(vec4 meters) {
return vec4(meters.xyz * project.commonUnitsPerMeter, meters.w);
}
mat3 project_get_orientation_matrix(vec3 up) {
vec3 uz = normalize(up);
vec3 ux = abs(uz.z) == 1.0 ? vec3(1.0, 0.0, 0.0) : normalize(vec3(uz.y, -uz.x, 0));
vec3 uy = cross(uz, ux);
return mat3(ux, uy, uz);
}
bool project_needs_rotation(vec3 commonPosition, out mat3 transform) {
if (project.projectionMode == PROJECTION_MODE_GLOBE) {
transform = project_get_orientation_matrix(commonPosition);
return true;
}
return false;
}
vec3 project_normal(vec3 vector) {
vec4 normal_modelspace = project.modelMatrix * vec4(vector, 0.0);
vec3 n = normalize(normal_modelspace.xyz * project.commonUnitsPerMeter);
mat3 rotation;
if (project_needs_rotation(geometry.position.xyz, rotation)) {
n = rotation * n;
}
return n;
}
vec4 project_offset_(vec4 offset) {
float dy = offset.y;
vec3 commonUnitsPerWorldUnit = project.commonUnitsPerWorldUnit + project.commonUnitsPerWorldUnit2 * dy;
return vec4(offset.xyz * commonUnitsPerWorldUnit, offset.w);
}
vec2 project_mercator_(vec2 lnglat) {
float x = lnglat.x;
if (project.wrapLongitude) {
x = mod(x + 180., 360.0) - 180.;
}
float y = clamp(lnglat.y, -89.9, 89.9);
return vec2(
radians(x) + PI,
PI + log(tan_fp32(PI * 0.25 + radians(y) * 0.5))
) * WORLD_SCALE;
}
vec3 project_globe_(vec3 lnglatz) {
float lambda = radians(lnglatz.x);
float phi = radians(lnglatz.y);
float cosPhi = cos(phi);
float D = (lnglatz.z / EARTH_RADIUS + 1.0) * GLOBE_RADIUS;
return vec3(
sin(lambda) * cosPhi,
-cos(lambda) * cosPhi,
sin(phi)
) * D;
}
vec4 project_position(vec4 position, vec3 position64Low) {
vec4 position_world = project.modelMatrix * position;
if (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR) {
if (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT) {
return vec4(
project_mercator_(position_world.xy),
project_size_at_latitude(position_world.z, position_world.y),
position_world.w
);
}
if (project.coordinateSystem == COORDINATE_SYSTEM_CARTESIAN) {
position_world.xyz += project.coordinateOrigin;
}
}
if (project.projectionMode == PROJECTION_MODE_GLOBE) {
if (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT) {
return vec4(
project_globe_(position_world.xyz),
position_world.w
);
}
}
if (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR_AUTO_OFFSET) {
if (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT) {
if (abs(position_world.y - project.coordinateOrigin.y) > 0.25) {
return vec4(
project_mercator_(position_world.xy) - project.commonOrigin.xy,
project_size(position_world.z),
position_world.w
);
}
}
}
if (project.projectionMode == PROJECTION_MODE_IDENTITY ||
(project.projectionMode == PROJECTION_MODE_WEB_MERCATOR_AUTO_OFFSET &&
(project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT ||
project.coordinateSystem == COORDINATE_SYSTEM_CARTESIAN))) {
position_world.xyz -= project.coordinateOrigin;
}
return project_offset_(position_world) + project_offset_(project.modelMatrix * vec4(position64Low, 0.0));
}
vec4 project_position(vec4 position) {
return project_position(position, ZERO_64_LOW);
}
vec3 project_position(vec3 position, vec3 position64Low) {
vec4 projected_position = project_position(vec4(position, 1.0), position64Low);
return projected_position.xyz;
}
vec3 project_position(vec3 position) {
vec4 projected_position = project_position(vec4(position, 1.0), ZERO_64_LOW);
return projected_position.xyz;
}
vec2 project_position(vec2 position) {
vec4 projected_position = project_position(vec4(position, 0.0, 1.0), ZERO_64_LOW);
return projected_position.xy;
}
vec4 project_common_position_to_clipspace(vec4 position, mat4 viewProjectionMatrix, vec4 center) {
return viewProjectionMatrix * position + center;
}
vec4 project_common_position_to_clipspace(vec4 position) {
return project_common_position_to_clipspace(position, project.viewProjectionMatrix, project.center);
}
vec2 project_pixel_size_to_clipspace(vec2 pixels) {
vec2 offset = pixels / project.viewportSize * project.devicePixelRatio * 2.0;
return offset * project.focalDistance;
}
float project_size_to_pixel(float meters) {
return project_size(meters) * project.scale;
}
float project_size_to_pixel(float size, int unit) {
if (unit == UNIT_METERS) return project_size_to_pixel(size);
if (unit == UNIT_COMMON) return size * project.scale;
return size;
}
float project_pixel_size(float pixels) {
return pixels / project.scale;
}
vec2 project_pixel_size(vec2 pixels) {
return pixels / project.scale;
}
`;

// dist/shaderlib/project/viewport-uniforms.js
var import_core2 = require("@math.gl/core");

// dist/utils/memoize.js
function isEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (Array.isArray(a)) {
    const len = a.length;
    if (!b || b.length !== len) {
      return false;
    }
    for (let i = 0; i < len; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
  return false;
}
function memoize(compute) {
  let cachedArgs = {};
  let cachedResult;
  return (args) => {
    for (const key in args) {
      if (!isEqual(args[key], cachedArgs[key])) {
        cachedResult = compute(args);
        cachedArgs = args;
        break;
      }
    }
    return cachedResult;
  };
}

// dist/shaderlib/project/viewport-uniforms.js
var ZERO_VECTOR = [0, 0, 0, 0];
var VECTOR_TO_POINT_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
var IDENTITY_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
var DEFAULT_PIXELS_PER_UNIT2 = [0, 0, 0];
var DEFAULT_COORDINATE_ORIGIN = [0, 0, 0];
var getMemoizedViewportUniforms = memoize(calculateViewportUniforms);
function getOffsetOrigin(viewport, coordinateSystem, coordinateOrigin = DEFAULT_COORDINATE_ORIGIN) {
  if (coordinateOrigin.length < 3) {
    coordinateOrigin = [coordinateOrigin[0], coordinateOrigin[1], 0];
  }
  let shaderCoordinateOrigin = coordinateOrigin;
  let geospatialOrigin;
  let offsetMode = true;
  if (coordinateSystem === COORDINATE_SYSTEM.LNGLAT_OFFSETS || coordinateSystem === COORDINATE_SYSTEM.METER_OFFSETS) {
    geospatialOrigin = coordinateOrigin;
  } else {
    geospatialOrigin = viewport.isGeospatial ? (
      // @ts-expect-error longitude and latitude are not defined on the base Viewport, but is expected on geospatial viewports
      [Math.fround(viewport.longitude), Math.fround(viewport.latitude), 0]
    ) : null;
  }
  switch (viewport.projectionMode) {
    case PROJECTION_MODE.WEB_MERCATOR:
      if (coordinateSystem === COORDINATE_SYSTEM.LNGLAT || coordinateSystem === COORDINATE_SYSTEM.CARTESIAN) {
        geospatialOrigin = [0, 0, 0];
        offsetMode = false;
      }
      break;
    case PROJECTION_MODE.WEB_MERCATOR_AUTO_OFFSET:
      if (coordinateSystem === COORDINATE_SYSTEM.LNGLAT) {
        shaderCoordinateOrigin = geospatialOrigin;
      } else if (coordinateSystem === COORDINATE_SYSTEM.CARTESIAN) {
        shaderCoordinateOrigin = [
          Math.fround(viewport.center[0]),
          Math.fround(viewport.center[1]),
          0
        ];
        geospatialOrigin = viewport.unprojectPosition(shaderCoordinateOrigin);
        shaderCoordinateOrigin[0] -= coordinateOrigin[0];
        shaderCoordinateOrigin[1] -= coordinateOrigin[1];
        shaderCoordinateOrigin[2] -= coordinateOrigin[2];
      }
      break;
    case PROJECTION_MODE.IDENTITY:
      shaderCoordinateOrigin = viewport.position.map(Math.fround);
      shaderCoordinateOrigin[2] = shaderCoordinateOrigin[2] || 0;
      break;
    case PROJECTION_MODE.GLOBE:
      offsetMode = false;
      geospatialOrigin = null;
      break;
    default:
      offsetMode = false;
  }
  return { geospatialOrigin, shaderCoordinateOrigin, offsetMode };
}
function calculateMatrixAndOffset(viewport, coordinateSystem, coordinateOrigin) {
  const { viewMatrixUncentered, projectionMatrix } = viewport;
  let { viewMatrix: viewMatrix2, viewProjectionMatrix } = viewport;
  let projectionCenter = ZERO_VECTOR;
  let originCommon = ZERO_VECTOR;
  let cameraPosCommon = viewport.cameraPosition;
  const { geospatialOrigin, shaderCoordinateOrigin, offsetMode } = getOffsetOrigin(viewport, coordinateSystem, coordinateOrigin);
  if (offsetMode) {
    originCommon = viewport.projectPosition(geospatialOrigin || shaderCoordinateOrigin);
    cameraPosCommon = [
      cameraPosCommon[0] - originCommon[0],
      cameraPosCommon[1] - originCommon[1],
      cameraPosCommon[2] - originCommon[2]
    ];
    originCommon[3] = 1;
    projectionCenter = import_core2.vec4.transformMat4([], originCommon, viewProjectionMatrix);
    viewMatrix2 = viewMatrixUncentered || viewMatrix2;
    viewProjectionMatrix = import_core2.mat4.multiply([], projectionMatrix, viewMatrix2);
    viewProjectionMatrix = import_core2.mat4.multiply([], viewProjectionMatrix, VECTOR_TO_POINT_MATRIX);
  }
  return {
    viewMatrix: viewMatrix2,
    viewProjectionMatrix,
    projectionCenter,
    originCommon,
    cameraPosCommon,
    shaderCoordinateOrigin,
    geospatialOrigin
  };
}
function getUniformsFromViewport({
  viewport,
  devicePixelRatio = 1,
  modelMatrix = null,
  // Match Layer.defaultProps
  coordinateSystem = COORDINATE_SYSTEM.DEFAULT,
  coordinateOrigin = DEFAULT_COORDINATE_ORIGIN,
  autoWrapLongitude = false
}) {
  if (coordinateSystem === COORDINATE_SYSTEM.DEFAULT) {
    coordinateSystem = viewport.isGeospatial ? COORDINATE_SYSTEM.LNGLAT : COORDINATE_SYSTEM.CARTESIAN;
  }
  const uniforms = getMemoizedViewportUniforms({
    viewport,
    devicePixelRatio,
    coordinateSystem,
    coordinateOrigin
  });
  uniforms.wrapLongitude = autoWrapLongitude;
  uniforms.modelMatrix = modelMatrix || IDENTITY_MATRIX;
  return uniforms;
}
function calculateViewportUniforms({ viewport, devicePixelRatio, coordinateSystem, coordinateOrigin }) {
  const { projectionCenter, viewProjectionMatrix, originCommon, cameraPosCommon, shaderCoordinateOrigin, geospatialOrigin } = calculateMatrixAndOffset(viewport, coordinateSystem, coordinateOrigin);
  const distanceScales = viewport.getDistanceScales();
  const viewportSize = [
    viewport.width * devicePixelRatio,
    viewport.height * devicePixelRatio
  ];
  const focalDistance = import_core2.vec4.transformMat4([], [0, 0, -viewport.focalDistance, 1], viewport.projectionMatrix)[3] || 1;
  const uniforms = {
    // Projection mode values
    coordinateSystem,
    projectionMode: viewport.projectionMode,
    coordinateOrigin: shaderCoordinateOrigin,
    commonOrigin: originCommon.slice(0, 3),
    center: projectionCenter,
    // Backward compatibility
    // TODO: remove in v9
    // @ts-expect-error _pseudoMeters is only defined on WebMercator viewport
    pseudoMeters: Boolean(viewport._pseudoMeters),
    // Screen size
    viewportSize,
    devicePixelRatio,
    focalDistance,
    commonUnitsPerMeter: distanceScales.unitsPerMeter,
    commonUnitsPerWorldUnit: distanceScales.unitsPerMeter,
    commonUnitsPerWorldUnit2: DEFAULT_PIXELS_PER_UNIT2,
    scale: viewport.scale,
    // This is the mercator scale (2 ** zoom)
    wrapLongitude: false,
    viewProjectionMatrix,
    modelMatrix: IDENTITY_MATRIX,
    // This is for lighting calculations
    cameraPosition: cameraPosCommon
  };
  if (geospatialOrigin) {
    const distanceScalesAtOrigin = viewport.getDistanceScales(geospatialOrigin);
    switch (coordinateSystem) {
      case COORDINATE_SYSTEM.METER_OFFSETS:
        uniforms.commonUnitsPerWorldUnit = distanceScalesAtOrigin.unitsPerMeter;
        uniforms.commonUnitsPerWorldUnit2 = distanceScalesAtOrigin.unitsPerMeter2;
        break;
      case COORDINATE_SYSTEM.LNGLAT:
      case COORDINATE_SYSTEM.LNGLAT_OFFSETS:
        if (!viewport._pseudoMeters) {
          uniforms.commonUnitsPerMeter = distanceScalesAtOrigin.unitsPerMeter;
        }
        uniforms.commonUnitsPerWorldUnit = distanceScalesAtOrigin.unitsPerDegree;
        uniforms.commonUnitsPerWorldUnit2 = distanceScalesAtOrigin.unitsPerDegree2;
        break;
      case COORDINATE_SYSTEM.CARTESIAN:
        uniforms.commonUnitsPerWorldUnit = [1, 1, distanceScalesAtOrigin.unitsPerMeter[2]];
        uniforms.commonUnitsPerWorldUnit2 = [0, 0, distanceScalesAtOrigin.unitsPerMeter2[2]];
        break;
      default:
        break;
    }
  }
  return uniforms;
}

// dist/shaderlib/project/project.js
var INITIAL_MODULE_OPTIONS = {};
function getUniforms(opts = INITIAL_MODULE_OPTIONS) {
  if ("viewport" in opts) {
    return getUniformsFromViewport(opts);
  }
  return {};
}
var project_default = {
  name: "project",
  dependencies: [import_shadertools.fp32, geometry_default],
  vs: project_glsl_default,
  getUniforms,
  uniformTypes: {
    wrapLongitude: "f32",
    coordinateSystem: "i32",
    commonUnitsPerMeter: "vec3<f32>",
    projectionMode: "i32",
    scale: "f32",
    commonUnitsPerWorldUnit: "vec3<f32>",
    commonUnitsPerWorldUnit2: "vec3<f32>",
    center: "vec4<f32>",
    modelMatrix: "mat4x4<f32>",
    viewProjectionMatrix: "mat4x4<f32>",
    viewportSize: "vec2<f32>",
    devicePixelRatio: "f32",
    focalDistance: "f32",
    cameraPosition: "vec3<f32>",
    coordinateOrigin: "vec3<f32>",
    commonOrigin: "vec3<f32>",
    pseudoMeters: "f32"
  }
  // @ts-ignore TODO v9.1
};

// dist/shaderlib/project32/project32.js
var vs2 = `
vec4 project_position_to_clipspace(
  vec3 position, vec3 position64Low, vec3 offset, out vec4 commonPosition
) {
  vec3 projectedPosition = project_position(position, position64Low);
  mat3 rotation;
  if (project_needs_rotation(projectedPosition, rotation)) {
    // offset is specified as ENU
    // when in globe projection, rotate offset so that the ground alighs with the surface of the globe
    offset = rotation * offset;
  }
  commonPosition = vec4(projectedPosition + offset, 1.0);
  return project_common_position_to_clipspace(commonPosition);
}

vec4 project_position_to_clipspace(
  vec3 position, vec3 position64Low, vec3 offset
) {
  vec4 commonPosition;
  return project_position_to_clipspace(position, position64Low, offset, commonPosition);
}
`;
var project32_default = {
  name: "project32",
  dependencies: [project_default],
  vs: vs2
};

// dist/shaderlib/shadow/shadow.js
var import_core3 = require("@math.gl/core");
var import_web_mercator = require("@math.gl/web-mercator");
var uniformBlock2 = (
  /* glsl */
  `
uniform shadowUniforms {
  bool drawShadowMap;
  bool useShadowMap;
  vec4 color;
  highp int lightId;
  float lightCount;
  mat4 viewProjectionMatrix0;
  mat4 viewProjectionMatrix1;
  vec4 projectCenter0;
  vec4 projectCenter1;
} shadow;
`
);
var vertex = (
  /* glsl */
  `
const int max_lights = 2;

out vec3 shadow_vPosition[max_lights];

vec4 shadow_setVertexPosition(vec4 position_commonspace) {
  mat4 viewProjectionMatrices[max_lights];
  viewProjectionMatrices[0] = shadow.viewProjectionMatrix0;
  viewProjectionMatrices[1] = shadow.viewProjectionMatrix1;
  vec4 projectCenters[max_lights];
  projectCenters[0] = shadow.projectCenter0;
  projectCenters[1] = shadow.projectCenter1;

  if (shadow.drawShadowMap) {
    return project_common_position_to_clipspace(position_commonspace, viewProjectionMatrices[shadow.lightId], projectCenters[shadow.lightId]);
  }
  if (shadow.useShadowMap) {
    for (int i = 0; i < max_lights; i++) {
      if(i < int(shadow.lightCount)) {
        vec4 shadowMap_position = project_common_position_to_clipspace(position_commonspace, viewProjectionMatrices[i], projectCenters[i]);
        shadow_vPosition[i] = (shadowMap_position.xyz / shadowMap_position.w + 1.0) / 2.0;
      }
    }
  }
  return gl_Position;
}
`
);
var vs3 = `
${uniformBlock2}
${vertex}
`;
var fragment = (
  /* glsl */
  `
const int max_lights = 2;
uniform sampler2D shadow_uShadowMap0;
uniform sampler2D shadow_uShadowMap1;

in vec3 shadow_vPosition[max_lights];

const vec4 bitPackShift = vec4(1.0, 255.0, 65025.0, 16581375.0);
const vec4 bitUnpackShift = 1.0 / bitPackShift;
const vec4 bitMask = vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0,  0.0);

float shadow_getShadowWeight(vec3 position, sampler2D shadowMap) {
  vec4 rgbaDepth = texture(shadowMap, position.xy);

  float z = dot(rgbaDepth, bitUnpackShift);
  return smoothstep(0.001, 0.01, position.z - z);
}

vec4 shadow_filterShadowColor(vec4 color) {
  if (shadow.drawShadowMap) {
    vec4 rgbaDepth = fract(gl_FragCoord.z * bitPackShift);
    rgbaDepth -= rgbaDepth.gbaa * bitMask;
    return rgbaDepth;
  }
  if (shadow.useShadowMap) {
    float shadowAlpha = 0.0;
    shadowAlpha += shadow_getShadowWeight(shadow_vPosition[0], shadow_uShadowMap0);
    if(shadow.lightCount > 1.0) {
      shadowAlpha += shadow_getShadowWeight(shadow_vPosition[1], shadow_uShadowMap1);
    }
    shadowAlpha *= shadow.color.a / shadow.lightCount;
    float blendedAlpha = shadowAlpha + color.a * (1.0 - shadowAlpha);

    return vec4(
      mix(color.rgb, shadow.color.rgb, shadowAlpha / blendedAlpha),
      blendedAlpha
    );
  }
  return color;
}
`
);
var fs2 = `
${uniformBlock2}
${fragment}
`;
var getMemoizedViewportCenterPosition = memoize(getViewportCenterPosition);
var getMemoizedViewProjectionMatrices = memoize(getViewProjectionMatrices);
var DEFAULT_SHADOW_COLOR = [0, 0, 0, 1];
var VECTOR_TO_POINT_MATRIX2 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
function screenToCommonSpace(xyz, pixelUnprojectionMatrix) {
  const [x, y, z] = xyz;
  const coord = (0, import_web_mercator.pixelsToWorld)([x, y, z], pixelUnprojectionMatrix);
  if (Number.isFinite(z)) {
    return coord;
  }
  return [coord[0], coord[1], 0];
}
function getViewportCenterPosition({ viewport, center }) {
  return new import_core3.Matrix4(viewport.viewProjectionMatrix).invert().transform(center);
}
function getViewProjectionMatrices({ viewport, shadowMatrices }) {
  const projectionMatrices = [];
  const pixelUnprojectionMatrix = viewport.pixelUnprojectionMatrix;
  const farZ = viewport.isGeospatial ? void 0 : 1;
  const corners = [
    [0, 0, farZ],
    // top left ground
    [viewport.width, 0, farZ],
    // top right ground
    [0, viewport.height, farZ],
    // bottom left ground
    [viewport.width, viewport.height, farZ],
    // bottom right ground
    [0, 0, -1],
    // top left near
    [viewport.width, 0, -1],
    // top right near
    [0, viewport.height, -1],
    // bottom left near
    [viewport.width, viewport.height, -1]
    // bottom right near
  ].map((pixel) => (
    // @ts-expect-error z may be undefined
    screenToCommonSpace(pixel, pixelUnprojectionMatrix)
  ));
  for (const shadowMatrix of shadowMatrices) {
    const viewMatrix2 = shadowMatrix.clone().translate(new import_core3.Vector3(viewport.center).negate());
    const positions = corners.map((corner) => viewMatrix2.transform(corner));
    const projectionMatrix = new import_core3.Matrix4().ortho({
      left: Math.min(...positions.map((position) => position[0])),
      right: Math.max(...positions.map((position) => position[0])),
      bottom: Math.min(...positions.map((position) => position[1])),
      top: Math.max(...positions.map((position) => position[1])),
      near: Math.min(...positions.map((position) => -position[2])),
      far: Math.max(...positions.map((position) => -position[2]))
    });
    projectionMatrices.push(projectionMatrix.multiplyRight(shadowMatrix));
  }
  return projectionMatrices;
}
function createShadowUniforms(opts) {
  const { shadowEnabled = true, project: projectProps } = opts;
  if (!shadowEnabled || !projectProps || !opts.shadowMatrices || !opts.shadowMatrices.length) {
    return {
      drawShadowMap: false,
      useShadowMap: false,
      shadow_uShadowMap0: opts.dummyShadowMap,
      shadow_uShadowMap1: opts.dummyShadowMap
    };
  }
  const projectUniforms = project_default.getUniforms(projectProps);
  const center = getMemoizedViewportCenterPosition({
    viewport: projectProps.viewport,
    center: projectUniforms.center
  });
  const projectCenters = [];
  const viewProjectionMatrices = getMemoizedViewProjectionMatrices({
    shadowMatrices: opts.shadowMatrices,
    viewport: projectProps.viewport
  }).slice();
  for (let i = 0; i < opts.shadowMatrices.length; i++) {
    const viewProjectionMatrix = viewProjectionMatrices[i];
    const viewProjectionMatrixCentered = viewProjectionMatrix.clone().translate(new import_core3.Vector3(projectProps.viewport.center).negate());
    if (projectUniforms.coordinateSystem === COORDINATE_SYSTEM.LNGLAT && projectUniforms.projectionMode === PROJECTION_MODE.WEB_MERCATOR) {
      viewProjectionMatrices[i] = viewProjectionMatrixCentered;
      projectCenters[i] = center;
    } else {
      viewProjectionMatrices[i] = viewProjectionMatrix.clone().multiplyRight(VECTOR_TO_POINT_MATRIX2);
      projectCenters[i] = viewProjectionMatrixCentered.transform(center);
    }
  }
  const uniforms = {
    drawShadowMap: Boolean(opts.drawToShadowMap),
    useShadowMap: opts.shadowMaps ? opts.shadowMaps.length > 0 : false,
    color: opts.shadowColor || DEFAULT_SHADOW_COLOR,
    lightId: opts.shadowLightId || 0,
    lightCount: opts.shadowMatrices.length,
    shadow_uShadowMap0: opts.dummyShadowMap,
    shadow_uShadowMap1: opts.dummyShadowMap
  };
  for (let i = 0; i < viewProjectionMatrices.length; i++) {
    uniforms[`viewProjectionMatrix${i}`] = viewProjectionMatrices[i];
    uniforms[`projectCenter${i}`] = projectCenters[i];
  }
  for (let i = 0; i < 2; i++) {
    uniforms[`shadow_uShadowMap${i}`] = opts.shadowMaps && opts.shadowMaps[i] || opts.dummyShadowMap;
  }
  return uniforms;
}
var shadow_default = {
  name: "shadow",
  dependencies: [project_default],
  vs: vs3,
  fs: fs2,
  inject: {
    "vs:DECKGL_FILTER_GL_POSITION": `
    position = shadow_setVertexPosition(geometry.position);
    `,
    "fs:DECKGL_FILTER_COLOR": `
    color = shadow_filterShadowColor(color);
    `
  },
  getUniforms: createShadowUniforms,
  uniformTypes: {
    drawShadowMap: "f32",
    useShadowMap: "f32",
    color: "vec4<f32>",
    lightId: "i32",
    lightCount: "f32",
    viewProjectionMatrix0: "mat4x4<f32>",
    viewProjectionMatrix1: "mat4x4<f32>",
    projectCenter0: "vec4<f32>",
    projectCenter1: "vec4<f32>"
  }
};

// dist/shaderlib/picking/picking.js
var import_shadertools2 = require("@luma.gl/shadertools");
var picking_default = {
  ...import_shadertools2.picking,
  defaultUniforms: { ...import_shadertools2.picking.defaultUniforms, useFloatColors: false },
  inject: {
    "vs:DECKGL_FILTER_GL_POSITION": `
    // for picking depth values
    picking_setPickingAttribute(position.z / position.w);
  `,
    "vs:DECKGL_FILTER_COLOR": `
  picking_setPickingColor(geometry.pickingColor);
  `,
    "fs:DECKGL_FILTER_COLOR": {
      order: 99,
      injection: `
  // use highlight color if this fragment belongs to the selected object.
  color = picking_filterHighlightColor(color);

  // use picking color if rendering to picking FBO.
  color = picking_filterPickingColor(color);
    `
    }
  }
};

// dist/shaderlib/index.js
var DEFAULT_MODULES = [geometry_default];
var SHADER_HOOKS = [
  "vs:DECKGL_FILTER_SIZE(inout vec3 size, VertexGeometry geometry)",
  "vs:DECKGL_FILTER_GL_POSITION(inout vec4 position, VertexGeometry geometry)",
  "vs:DECKGL_FILTER_COLOR(inout vec4 color, VertexGeometry geometry)",
  "fs:DECKGL_FILTER_COLOR(inout vec4 color, FragmentGeometry geometry)"
];
function getShaderAssembler() {
  const shaderAssembler = import_shadertools3.ShaderAssembler.getDefaultShaderAssembler();
  for (const shaderModule of DEFAULT_MODULES) {
    shaderAssembler.addDefaultModule(shaderModule);
  }
  for (const shaderHook of SHADER_HOOKS) {
    shaderAssembler.addShaderHook(shaderHook);
  }
  return shaderAssembler;
}

// dist/effects/lighting/ambient-light.js
var DEFAULT_LIGHT_COLOR = [255, 255, 255];
var DEFAULT_LIGHT_INTENSITY = 1;
var idCount = 0;
var AmbientLight = class {
  constructor(props = {}) {
    this.type = "ambient";
    const { color = DEFAULT_LIGHT_COLOR } = props;
    const { intensity = DEFAULT_LIGHT_INTENSITY } = props;
    this.id = props.id || `ambient-${idCount++}`;
    this.color = color;
    this.intensity = intensity;
  }
};

// dist/effects/lighting/directional-light.js
var import_core4 = require("@math.gl/core");
var DEFAULT_LIGHT_COLOR2 = [255, 255, 255];
var DEFAULT_LIGHT_INTENSITY2 = 1;
var DEFAULT_LIGHT_DIRECTION = [0, 0, -1];
var idCount2 = 0;
var DirectionalLight = class {
  constructor(props = {}) {
    this.type = "directional";
    const { color = DEFAULT_LIGHT_COLOR2 } = props;
    const { intensity = DEFAULT_LIGHT_INTENSITY2 } = props;
    const { direction = DEFAULT_LIGHT_DIRECTION } = props;
    const { _shadow = false } = props;
    this.id = props.id || `directional-${idCount2++}`;
    this.color = color;
    this.intensity = intensity;
    this.type = "directional";
    this.direction = new import_core4.Vector3(direction).normalize().toArray();
    this.shadow = _shadow;
  }
  getProjectedLight(opts) {
    return this;
  }
};

// dist/effects/lighting/lighting-effect.js
var import_core5 = require("@math.gl/core");

// dist/passes/pass.js
var Pass = class {
  /** Create a new Pass instance */
  constructor(device, props = { id: "pass" }) {
    const { id } = props;
    this.id = id;
    this.device = device;
    this.props = { ...props };
  }
  setProps(props) {
    Object.assign(this.props, props);
  }
  render(params) {
  }
  // eslint-disable-line @typescript-eslint/no-empty-function
  cleanup() {
  }
  // eslint-disable-line @typescript-eslint/no-empty-function
};

// dist/passes/layers-pass.js
var LayersPass = class extends Pass {
  constructor() {
    super(...arguments);
    this._lastRenderIndex = -1;
  }
  render(options) {
    const [width, height] = this.device.canvasContext.getDrawingBufferSize();
    const clearCanvas = options.clearCanvas ?? true;
    const clearColor = options.clearColor ?? (clearCanvas ? [0, 0, 0, 0] : false);
    const clearDepth = clearCanvas ? 1 : false;
    const clearStencil = clearCanvas ? 0 : false;
    const colorMask = options.colorMask ?? 15;
    const parameters = { viewport: [0, 0, width, height] };
    if (options.colorMask) {
      parameters.colorMask = colorMask;
    }
    if (options.scissorRect) {
      parameters.scissorRect = options.scissorRect;
    }
    const renderPass = this.device.beginRenderPass({
      framebuffer: options.target,
      parameters,
      clearColor,
      clearDepth,
      clearStencil
    });
    try {
      return this._drawLayers(renderPass, options);
    } finally {
      renderPass.end();
    }
  }
  /** Draw a list of layers in a list of viewports */
  _drawLayers(renderPass, options) {
    const { target, shaderModuleProps, viewports, views, onViewportActive, clearStack = true } = options;
    options.pass = options.pass || "unknown";
    if (clearStack) {
      this._lastRenderIndex = -1;
    }
    const renderStats = [];
    for (const viewport of viewports) {
      const view = views && views[viewport.id];
      onViewportActive == null ? void 0 : onViewportActive(viewport);
      const drawLayerParams = this._getDrawLayerParams(viewport, options);
      const subViewports = viewport.subViewports || [viewport];
      for (const subViewport of subViewports) {
        const stats = this._drawLayersInViewport(renderPass, {
          target,
          shaderModuleProps,
          viewport: subViewport,
          view,
          pass: options.pass,
          layers: options.layers
        }, drawLayerParams);
        renderStats.push(stats);
      }
    }
    return renderStats;
  }
  // When a viewport contains multiple subviewports (e.g. repeated web mercator map),
  // this is only done once for the parent viewport
  /* Resolve the parameters needed to draw each layer */
  _getDrawLayerParams(viewport, { layers, pass, isPicking = false, layerFilter, cullRect, effects, shaderModuleProps }, evaluateShouldDrawOnly = false) {
    var _a;
    const drawLayerParams = [];
    const indexResolver = layerIndexResolver(this._lastRenderIndex + 1);
    const drawContext = {
      layer: layers[0],
      viewport,
      isPicking,
      renderPass: pass,
      cullRect
    };
    const layerFilterCache = {};
    for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
      const layer = layers[layerIndex];
      const shouldDrawLayer = this._shouldDrawLayer(layer, drawContext, layerFilter, layerFilterCache);
      const layerParam = { shouldDrawLayer };
      if (shouldDrawLayer && !evaluateShouldDrawOnly) {
        layerParam.shouldDrawLayer = true;
        layerParam.layerRenderIndex = indexResolver(layer, shouldDrawLayer);
        layerParam.shaderModuleProps = this._getShaderModuleProps(layer, effects, pass, shaderModuleProps);
        layerParam.layerParameters = {
          ...(_a = layer.context.deck) == null ? void 0 : _a.props.parameters,
          ...this.getLayerParameters(layer, layerIndex, viewport)
        };
      }
      drawLayerParams[layerIndex] = layerParam;
    }
    return drawLayerParams;
  }
  // Draws a list of layers in one viewport
  // TODO - when picking we could completely skip rendering viewports that dont
  // intersect with the picking rect
  /* eslint-disable max-depth, max-statements */
  _drawLayersInViewport(renderPass, { layers, shaderModuleProps: globalModuleParameters, pass, target, viewport, view }, drawLayerParams) {
    const glViewport = getGLViewport(this.device, {
      shaderModuleProps: globalModuleParameters,
      target,
      viewport
    });
    if (view && view.props.clear) {
      const clearOpts = view.props.clear === true ? { color: true, depth: true } : view.props.clear;
      const clearRenderPass = this.device.beginRenderPass({
        framebuffer: target,
        parameters: {
          viewport: glViewport,
          scissorRect: glViewport
        },
        clearColor: clearOpts.color ? [0, 0, 0, 0] : false,
        clearDepth: clearOpts.depth ? 1 : false
      });
      clearRenderPass.end();
    }
    const renderStatus = {
      totalCount: layers.length,
      visibleCount: 0,
      compositeCount: 0,
      pickableCount: 0
    };
    renderPass.setParameters({ viewport: glViewport });
    for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
      const layer = layers[layerIndex];
      const drawLayerParameters = drawLayerParams[layerIndex];
      const { shouldDrawLayer } = drawLayerParameters;
      if (shouldDrawLayer && layer.props.pickable) {
        renderStatus.pickableCount++;
      }
      if (layer.isComposite) {
        renderStatus.compositeCount++;
      }
      if (layer.isDrawable && drawLayerParameters.shouldDrawLayer) {
        const { layerRenderIndex, shaderModuleProps, layerParameters } = drawLayerParameters;
        renderStatus.visibleCount++;
        this._lastRenderIndex = Math.max(this._lastRenderIndex, layerRenderIndex);
        if (shaderModuleProps.project) {
          shaderModuleProps.project.viewport = viewport;
        }
        layer.context.renderPass = renderPass;
        try {
          layer._drawLayer({
            renderPass,
            shaderModuleProps,
            uniforms: { layerIndex: layerRenderIndex },
            parameters: layerParameters
          });
        } catch (err) {
          layer.raiseError(err, `drawing ${layer} to ${pass}`);
        }
      }
    }
    return renderStatus;
  }
  /* eslint-enable max-depth, max-statements */
  /* Methods for subclass overrides */
  shouldDrawLayer(layer) {
    return true;
  }
  getShaderModuleProps(layer, effects, otherShaderModuleProps) {
    return null;
  }
  getLayerParameters(layer, layerIndex, viewport) {
    return layer.props.parameters;
  }
  /* Private */
  _shouldDrawLayer(layer, drawContext, layerFilter, layerFilterCache) {
    const shouldDrawLayer = layer.props.visible && this.shouldDrawLayer(layer);
    if (!shouldDrawLayer) {
      return false;
    }
    drawContext.layer = layer;
    let parent = layer.parent;
    while (parent) {
      if (!parent.props.visible || !parent.filterSubLayer(drawContext)) {
        return false;
      }
      drawContext.layer = parent;
      parent = parent.parent;
    }
    if (layerFilter) {
      const rootLayerId = drawContext.layer.id;
      if (!(rootLayerId in layerFilterCache)) {
        layerFilterCache[rootLayerId] = layerFilter(drawContext);
      }
      if (!layerFilterCache[rootLayerId]) {
        return false;
      }
    }
    layer.activateViewport(drawContext.viewport);
    return true;
  }
  _getShaderModuleProps(layer, effects, pass, overrides) {
    var _a, _b;
    const devicePixelRatio = this.device.canvasContext.cssToDeviceRatio();
    const layerProps = ((_a = layer.internalState) == null ? void 0 : _a.propsInTransition) || layer.props;
    const shaderModuleProps = {
      layer: layerProps,
      picking: {
        isActive: false
      },
      project: {
        viewport: layer.context.viewport,
        devicePixelRatio,
        modelMatrix: layerProps.modelMatrix,
        coordinateSystem: layerProps.coordinateSystem,
        coordinateOrigin: layerProps.coordinateOrigin,
        autoWrapLongitude: layer.wrapLongitude
      }
    };
    if (effects) {
      for (const effect of effects) {
        mergeModuleParameters(shaderModuleProps, (_b = effect.getShaderModuleProps) == null ? void 0 : _b.call(effect, layer, shaderModuleProps));
      }
    }
    return mergeModuleParameters(shaderModuleProps, this.getShaderModuleProps(layer, effects, shaderModuleProps), overrides);
  }
};
function layerIndexResolver(startIndex = 0, layerIndices = {}) {
  const resolvers = {};
  const resolveLayerIndex = (layer, isDrawn) => {
    const indexOverride = layer.props._offset;
    const layerId = layer.id;
    const parentId = layer.parent && layer.parent.id;
    let index;
    if (parentId && !(parentId in layerIndices)) {
      resolveLayerIndex(layer.parent, false);
    }
    if (parentId in resolvers) {
      const resolver = resolvers[parentId] = resolvers[parentId] || layerIndexResolver(layerIndices[parentId], layerIndices);
      index = resolver(layer, isDrawn);
      resolvers[layerId] = resolver;
    } else if (Number.isFinite(indexOverride)) {
      index = indexOverride + (layerIndices[parentId] || 0);
      resolvers[layerId] = null;
    } else {
      index = startIndex;
    }
    if (isDrawn && index >= startIndex) {
      startIndex = index + 1;
    }
    layerIndices[layerId] = index;
    return index;
  };
  return resolveLayerIndex;
}
function getGLViewport(device, { shaderModuleProps, target, viewport }) {
  var _a;
  const pixelRatio = ((_a = shaderModuleProps == null ? void 0 : shaderModuleProps.project) == null ? void 0 : _a.devicePixelRatio) ?? // @ts-expect-error TODO - assuming WebGL context
  device.canvasContext.cssToDeviceRatio();
  const [, drawingBufferHeight] = device.canvasContext.getDrawingBufferSize();
  const height = target ? target.height : drawingBufferHeight;
  const dimensions = viewport;
  return [
    dimensions.x * pixelRatio,
    height - (dimensions.y + dimensions.height) * pixelRatio,
    dimensions.width * pixelRatio,
    dimensions.height * pixelRatio
  ];
}
function mergeModuleParameters(target, ...sources) {
  for (const source of sources) {
    if (source) {
      for (const key in source) {
        if (target[key]) {
          Object.assign(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    }
  }
  return target;
}

// dist/passes/shadow-pass.js
var ShadowPass = class extends LayersPass {
  constructor(device, props) {
    super(device, props);
    const shadowMap = device.createTexture({
      format: "rgba8unorm",
      width: 1,
      height: 1,
      sampler: {
        minFilter: "linear",
        magFilter: "linear",
        addressModeU: "clamp-to-edge",
        addressModeV: "clamp-to-edge"
      },
      mipmaps: true
    });
    const depthBuffer = device.createTexture({
      format: "depth16unorm",
      width: 1,
      height: 1,
      mipmaps: false
    });
    this.fbo = device.createFramebuffer({
      id: "shadowmap",
      width: 1,
      height: 1,
      colorAttachments: [shadowMap],
      // Depth attachment has to be specified for depth test to work
      depthStencilAttachment: depthBuffer
    });
  }
  delete() {
    if (this.fbo) {
      this.fbo.destroy();
      this.fbo = null;
    }
  }
  getShadowMap() {
    return this.fbo.colorAttachments[0].texture;
  }
  render(params) {
    const target = this.fbo;
    const pixelRatio = this.device.canvasContext.cssToDeviceRatio();
    const viewport = params.viewports[0];
    const width = viewport.width * pixelRatio;
    const height = viewport.height * pixelRatio;
    const clearColor = [1, 1, 1, 1];
    if (width !== target.width || height !== target.height) {
      target.resize({ width, height });
    }
    super.render({ ...params, clearColor, target, pass: "shadow" });
  }
  getLayerParameters(layer, layerIndex, viewport) {
    return {
      ...layer.props.parameters,
      blend: false,
      depthWriteEnabled: true,
      depthCompare: "less-equal"
    };
  }
  shouldDrawLayer(layer) {
    return layer.props.shadowEnabled !== false;
  }
  getShaderModuleProps(layer, effects, otherShaderModuleProps) {
    return {
      shadow: {
        project: otherShaderModuleProps.project,
        drawToShadowMap: true
      }
    };
  }
};

// dist/effects/lighting/lighting-effect.js
var DEFAULT_AMBIENT_LIGHT_PROPS = {
  color: [255, 255, 255],
  intensity: 1
};
var DEFAULT_DIRECTIONAL_LIGHT_PROPS = [
  {
    color: [255, 255, 255],
    intensity: 1,
    direction: [-1, 3, -1]
  },
  {
    color: [255, 255, 255],
    intensity: 0.9,
    direction: [1, -8, -2.5]
  }
];
var DEFAULT_SHADOW_COLOR2 = [0, 0, 0, 200 / 255];
var LightingEffect = class {
  constructor(props = {}) {
    this.id = "lighting-effect";
    this.shadowColor = DEFAULT_SHADOW_COLOR2;
    this.shadow = false;
    this.directionalLights = [];
    this.pointLights = [];
    this.shadowPasses = [];
    this.dummyShadowMap = null;
    this.setProps(props);
  }
  setup(context) {
    this.context = context;
    const { device, deck } = context;
    if (this.shadow && !this.dummyShadowMap) {
      this._createShadowPasses(device);
      deck._addDefaultShaderModule(shadow_default);
      this.dummyShadowMap = device.createTexture({
        width: 1,
        height: 1
      });
    }
  }
  setProps(props) {
    this.ambientLight = void 0;
    this.directionalLights = [];
    this.pointLights = [];
    for (const key in props) {
      const lightSource = props[key];
      switch (lightSource.type) {
        case "ambient":
          this.ambientLight = lightSource;
          break;
        case "directional":
          this.directionalLights.push(lightSource);
          break;
        case "point":
          this.pointLights.push(lightSource);
          break;
        default:
      }
    }
    this._applyDefaultLights();
    this.shadow = this.directionalLights.some((light) => light.shadow);
    if (this.context) {
      this.setup(this.context);
    }
    this.props = props;
  }
  preRender({ layers, layerFilter, viewports, onViewportActive, views }) {
    if (!this.shadow)
      return;
    this.shadowMatrices = this._calculateMatrices();
    for (let i = 0; i < this.shadowPasses.length; i++) {
      const shadowPass = this.shadowPasses[i];
      shadowPass.render({
        layers,
        layerFilter,
        viewports,
        onViewportActive,
        views,
        shaderModuleProps: {
          shadow: {
            shadowLightId: i,
            dummyShadowMap: this.dummyShadowMap,
            shadowMatrices: this.shadowMatrices
          }
        }
      });
    }
  }
  getShaderModuleProps(layer, otherShaderModuleProps) {
    const shadowProps = this.shadow ? {
      project: otherShaderModuleProps.project,
      shadowMaps: this.shadowPasses.map((shadowPass) => shadowPass.getShadowMap()),
      dummyShadowMap: this.dummyShadowMap,
      shadowColor: this.shadowColor,
      shadowMatrices: this.shadowMatrices
    } : {};
    const lightingProps = {
      enabled: true,
      ambientLight: this.ambientLight,
      directionalLights: this.directionalLights.map((directionalLight) => directionalLight.getProjectedLight({ layer })),
      pointLights: this.pointLights.map((pointLight) => pointLight.getProjectedLight({ layer }))
    };
    const materialProps = layer.props.material;
    return {
      shadow: shadowProps,
      lighting: lightingProps,
      phongMaterial: materialProps,
      gouraudMaterial: materialProps
    };
  }
  cleanup(context) {
    for (const shadowPass of this.shadowPasses) {
      shadowPass.delete();
    }
    this.shadowPasses.length = 0;
    if (this.dummyShadowMap) {
      this.dummyShadowMap.destroy();
      this.dummyShadowMap = null;
      context.deck._removeDefaultShaderModule(shadow_default);
    }
  }
  _calculateMatrices() {
    const lightMatrices = [];
    for (const light of this.directionalLights) {
      const viewMatrix2 = new import_core5.Matrix4().lookAt({
        eye: new import_core5.Vector3(light.direction).negate()
      });
      lightMatrices.push(viewMatrix2);
    }
    return lightMatrices;
  }
  _createShadowPasses(device) {
    for (let i = 0; i < this.directionalLights.length; i++) {
      const shadowPass = new ShadowPass(device);
      this.shadowPasses[i] = shadowPass;
    }
  }
  _applyDefaultLights() {
    const { ambientLight, pointLights, directionalLights } = this;
    if (!ambientLight && pointLights.length === 0 && directionalLights.length === 0) {
      this.ambientLight = new AmbientLight(DEFAULT_AMBIENT_LIGHT_PROPS);
      this.directionalLights.push(new DirectionalLight(DEFAULT_DIRECTIONAL_LIGHT_PROPS[0]), new DirectionalLight(DEFAULT_DIRECTIONAL_LIGHT_PROPS[1]));
    }
  }
};

// dist/utils/typed-array-manager.js
var TypedArrayManager = class {
  constructor(options = {}) {
    this._pool = [];
    this.opts = { overAlloc: 2, poolSize: 100 };
    this.setOptions(options);
  }
  setOptions(options) {
    Object.assign(this.opts, options);
  }
  allocate(typedArray, count2, { size = 1, type, padding = 0, copy = false, initialize = false, maxCount }) {
    const Type = type || typedArray && typedArray.constructor || Float32Array;
    const newSize = count2 * size + padding;
    if (ArrayBuffer.isView(typedArray)) {
      if (newSize <= typedArray.length) {
        return typedArray;
      }
      if (newSize * typedArray.BYTES_PER_ELEMENT <= typedArray.buffer.byteLength) {
        return new Type(typedArray.buffer, 0, newSize);
      }
    }
    let maxSize = Infinity;
    if (maxCount) {
      maxSize = maxCount * size + padding;
    }
    const newArray = this._allocate(Type, newSize, initialize, maxSize);
    if (typedArray && copy) {
      newArray.set(typedArray);
    } else if (!initialize) {
      newArray.fill(0, 0, 4);
    }
    this._release(typedArray);
    return newArray;
  }
  release(typedArray) {
    this._release(typedArray);
  }
  _allocate(Type, size, initialize, maxSize) {
    let sizeToAllocate = Math.max(Math.ceil(size * this.opts.overAlloc), 1);
    if (sizeToAllocate > maxSize) {
      sizeToAllocate = maxSize;
    }
    const pool = this._pool;
    const byteLength = Type.BYTES_PER_ELEMENT * sizeToAllocate;
    const i = pool.findIndex((b) => b.byteLength >= byteLength);
    if (i >= 0) {
      const array = new Type(pool.splice(i, 1)[0], 0, sizeToAllocate);
      if (initialize) {
        array.fill(0);
      }
      return array;
    }
    return new Type(sizeToAllocate);
  }
  _release(typedArray) {
    if (!ArrayBuffer.isView(typedArray)) {
      return;
    }
    const pool = this._pool;
    const { buffer } = typedArray;
    const { byteLength } = buffer;
    const i = pool.findIndex((b) => b.byteLength >= byteLength);
    if (i < 0) {
      pool.push(buffer);
    } else if (i > 0 || pool.length < this.opts.poolSize) {
      pool.splice(i, 0, buffer);
    }
    if (pool.length > this.opts.poolSize) {
      pool.shift();
    }
  }
};
var typed_array_manager_default = new TypedArrayManager();

// dist/utils/math-utils.js
var import_core6 = require("@math.gl/core");
function createMat4() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
function mod(value, divisor) {
  const modulus = value % divisor;
  return modulus < 0 ? divisor + modulus : modulus;
}
function getCameraPosition(viewMatrixInverse) {
  return [viewMatrixInverse[12], viewMatrixInverse[13], viewMatrixInverse[14]];
}
function getFrustumPlanes(viewProjectionMatrix) {
  return {
    left: getFrustumPlane(viewProjectionMatrix[3] + viewProjectionMatrix[0], viewProjectionMatrix[7] + viewProjectionMatrix[4], viewProjectionMatrix[11] + viewProjectionMatrix[8], viewProjectionMatrix[15] + viewProjectionMatrix[12]),
    right: getFrustumPlane(viewProjectionMatrix[3] - viewProjectionMatrix[0], viewProjectionMatrix[7] - viewProjectionMatrix[4], viewProjectionMatrix[11] - viewProjectionMatrix[8], viewProjectionMatrix[15] - viewProjectionMatrix[12]),
    bottom: getFrustumPlane(viewProjectionMatrix[3] + viewProjectionMatrix[1], viewProjectionMatrix[7] + viewProjectionMatrix[5], viewProjectionMatrix[11] + viewProjectionMatrix[9], viewProjectionMatrix[15] + viewProjectionMatrix[13]),
    top: getFrustumPlane(viewProjectionMatrix[3] - viewProjectionMatrix[1], viewProjectionMatrix[7] - viewProjectionMatrix[5], viewProjectionMatrix[11] - viewProjectionMatrix[9], viewProjectionMatrix[15] - viewProjectionMatrix[13]),
    near: getFrustumPlane(viewProjectionMatrix[3] + viewProjectionMatrix[2], viewProjectionMatrix[7] + viewProjectionMatrix[6], viewProjectionMatrix[11] + viewProjectionMatrix[10], viewProjectionMatrix[15] + viewProjectionMatrix[14]),
    far: getFrustumPlane(viewProjectionMatrix[3] - viewProjectionMatrix[2], viewProjectionMatrix[7] - viewProjectionMatrix[6], viewProjectionMatrix[11] - viewProjectionMatrix[10], viewProjectionMatrix[15] - viewProjectionMatrix[14])
  };
}
var scratchVector = new import_core6.Vector3();
function getFrustumPlane(a, b, c, d) {
  scratchVector.set(a, b, c);
  const L = scratchVector.len();
  return { distance: d / L, normal: new import_core6.Vector3(-a / L, -b / L, -c / L) };
}
function fp64LowPart(x) {
  return x - Math.fround(x);
}
var scratchArray;
function toDoublePrecisionArray(typedArray, options) {
  const { size = 1, startIndex = 0 } = options;
  const endIndex = options.endIndex !== void 0 ? options.endIndex : typedArray.length;
  const count2 = (endIndex - startIndex) / size;
  scratchArray = typed_array_manager_default.allocate(scratchArray, count2, {
    type: Float32Array,
    size: size * 2
  });
  let sourceIndex = startIndex;
  let targetIndex = 0;
  while (sourceIndex < endIndex) {
    for (let j = 0; j < size; j++) {
      const value = typedArray[sourceIndex++];
      scratchArray[targetIndex + j] = value;
      scratchArray[targetIndex + j + size] = fp64LowPart(value);
    }
    targetIndex += size * 2;
  }
  return scratchArray.subarray(0, count2 * size * 2);
}
function mergeBounds(boundsList) {
  let mergedBounds = null;
  let isMerged = false;
  for (const bounds of boundsList) {
    if (!bounds)
      continue;
    if (!mergedBounds) {
      mergedBounds = bounds;
    } else {
      if (!isMerged) {
        mergedBounds = [
          [mergedBounds[0][0], mergedBounds[0][1]],
          [mergedBounds[1][0], mergedBounds[1][1]]
        ];
        isMerged = true;
      }
      mergedBounds[0][0] = Math.min(mergedBounds[0][0], bounds[0][0]);
      mergedBounds[0][1] = Math.min(mergedBounds[0][1], bounds[0][1]);
      mergedBounds[1][0] = Math.max(mergedBounds[1][0], bounds[1][0]);
      mergedBounds[1][1] = Math.max(mergedBounds[1][1], bounds[1][1]);
    }
  }
  return mergedBounds;
}

// dist/viewports/viewport.js
var import_core7 = require("@math.gl/core");
var import_web_mercator2 = require("@math.gl/web-mercator");
var DEGREES_TO_RADIANS = Math.PI / 180;
var IDENTITY = createMat4();
var ZERO_VECTOR2 = [0, 0, 0];
var DEFAULT_DISTANCE_SCALES = {
  unitsPerMeter: [1, 1, 1],
  metersPerUnit: [1, 1, 1]
};
function createProjectionMatrix({ width, height, orthographic, fovyRadians, focalDistance, padding, near, far }) {
  const aspect = width / height;
  const matrix = orthographic ? new import_core7.Matrix4().orthographic({ fovy: fovyRadians, aspect, focalDistance, near, far }) : new import_core7.Matrix4().perspective({ fovy: fovyRadians, aspect, near, far });
  if (padding) {
    const { left = 0, right = 0, top = 0, bottom = 0 } = padding;
    const offsetX = (0, import_core7.clamp)((left + width - right) / 2, 0, width) - width / 2;
    const offsetY = (0, import_core7.clamp)((top + height - bottom) / 2, 0, height) - height / 2;
    matrix[8] -= offsetX * 2 / width;
    matrix[9] += offsetY * 2 / height;
  }
  return matrix;
}
var Viewport = class {
  // eslint-disable-next-line complexity
  constructor(opts = {}) {
    this._frustumPlanes = {};
    this.id = opts.id || this.constructor.displayName || "viewport";
    this.x = opts.x || 0;
    this.y = opts.y || 0;
    this.width = opts.width || 1;
    this.height = opts.height || 1;
    this.zoom = opts.zoom || 0;
    this.padding = opts.padding;
    this.distanceScales = opts.distanceScales || DEFAULT_DISTANCE_SCALES;
    this.focalDistance = opts.focalDistance || 1;
    this.position = opts.position || ZERO_VECTOR2;
    this.modelMatrix = opts.modelMatrix || null;
    const { longitude, latitude } = opts;
    this.isGeospatial = Number.isFinite(latitude) && Number.isFinite(longitude);
    this._initProps(opts);
    this._initMatrices(opts);
    this.equals = this.equals.bind(this);
    this.project = this.project.bind(this);
    this.unproject = this.unproject.bind(this);
    this.projectPosition = this.projectPosition.bind(this);
    this.unprojectPosition = this.unprojectPosition.bind(this);
    this.projectFlat = this.projectFlat.bind(this);
    this.unprojectFlat = this.unprojectFlat.bind(this);
  }
  get subViewports() {
    return null;
  }
  get metersPerPixel() {
    return this.distanceScales.metersPerUnit[2] / this.scale;
  }
  get projectionMode() {
    if (this.isGeospatial) {
      return this.zoom < 12 ? PROJECTION_MODE.WEB_MERCATOR : PROJECTION_MODE.WEB_MERCATOR_AUTO_OFFSET;
    }
    return PROJECTION_MODE.IDENTITY;
  }
  // Two viewports are equal if width and height are identical, and if
  // their view and projection matrices are (approximately) equal.
  equals(viewport) {
    if (!(viewport instanceof Viewport)) {
      return false;
    }
    if (this === viewport) {
      return true;
    }
    return viewport.width === this.width && viewport.height === this.height && viewport.scale === this.scale && (0, import_core7.equals)(viewport.projectionMatrix, this.projectionMatrix) && (0, import_core7.equals)(viewport.viewMatrix, this.viewMatrix);
  }
  /**
   * Projects xyz (possibly latitude and longitude) to pixel coordinates in window
   * using viewport projection parameters
   * - [longitude, latitude] to [x, y]
   * - [longitude, latitude, Z] => [x, y, z]
   * Note: By default, returns top-left coordinates for canvas/SVG type render
   *
   * @param {Array} lngLatZ - [lng, lat] or [lng, lat, Z]
   * @param {Object} opts - options
   * @param {Object} opts.topLeft=true - Whether projected coords are top left
   * @return {Array} - [x, y] or [x, y, z] in top left coords
   */
  project(xyz, { topLeft = true } = {}) {
    const worldPosition = this.projectPosition(xyz);
    const coord = (0, import_web_mercator2.worldToPixels)(worldPosition, this.pixelProjectionMatrix);
    const [x, y] = coord;
    const y2 = topLeft ? y : this.height - y;
    return xyz.length === 2 ? [x, y2] : [x, y2, coord[2]];
  }
  /**
   * Unproject pixel coordinates on screen onto world coordinates,
   * (possibly [lon, lat]) on map.
   * - [x, y] => [lng, lat]
   * - [x, y, z] => [lng, lat, Z]
   * @param {Array} xyz -
   * @param {Object} opts - options
   * @param {Object} opts.topLeft=true - Whether origin is top left
   * @return {Array|null} - [lng, lat, Z] or [X, Y, Z]
   */
  unproject(xyz, { topLeft = true, targetZ } = {}) {
    const [x, y, z] = xyz;
    const y2 = topLeft ? y : this.height - y;
    const targetZWorld = targetZ && targetZ * this.distanceScales.unitsPerMeter[2];
    const coord = (0, import_web_mercator2.pixelsToWorld)([x, y2, z], this.pixelUnprojectionMatrix, targetZWorld);
    const [X, Y, Z] = this.unprojectPosition(coord);
    if (Number.isFinite(z)) {
      return [X, Y, Z];
    }
    return Number.isFinite(targetZ) ? [X, Y, targetZ] : [X, Y];
  }
  // NON_LINEAR PROJECTION HOOKS
  // Used for web meractor projection
  projectPosition(xyz) {
    const [X, Y] = this.projectFlat(xyz);
    const Z = (xyz[2] || 0) * this.distanceScales.unitsPerMeter[2];
    return [X, Y, Z];
  }
  unprojectPosition(xyz) {
    const [X, Y] = this.unprojectFlat(xyz);
    const Z = (xyz[2] || 0) * this.distanceScales.metersPerUnit[2];
    return [X, Y, Z];
  }
  /**
   * Project [lng,lat] on sphere onto [x,y] on 512*512 Mercator Zoom 0 tile.
   * Performs the nonlinear part of the web mercator projection.
   * Remaining projection is done with 4x4 matrices which also handles
   * perspective.
   * @param {Array} lngLat - [lng, lat] coordinates
   *   Specifies a point on the sphere to project onto the map.
   * @return {Array} [x,y] coordinates.
   */
  projectFlat(xyz) {
    if (this.isGeospatial) {
      const result = (0, import_web_mercator2.lngLatToWorld)(xyz);
      result[1] = (0, import_core7.clamp)(result[1], -318, 830);
      return result;
    }
    return xyz;
  }
  /**
   * Unproject world point [x,y] on map onto {lat, lon} on sphere
   * @param {object|Vector} xy - object with {x,y} members
   *  representing point on projected map plane
   * @return {GeoCoordinates} - object with {lat,lon} of point on sphere.
   *   Has toArray method if you need a GeoJSON Array.
   *   Per cartographic tradition, lat and lon are specified as degrees.
   */
  unprojectFlat(xyz) {
    if (this.isGeospatial) {
      return (0, import_web_mercator2.worldToLngLat)(xyz);
    }
    return xyz;
  }
  /**
   * Get bounds of the current viewport
   * @return {Array} - [minX, minY, maxX, maxY]
   */
  getBounds(options = {}) {
    const unprojectOption = { targetZ: options.z || 0 };
    const topLeft = this.unproject([0, 0], unprojectOption);
    const topRight = this.unproject([this.width, 0], unprojectOption);
    const bottomLeft = this.unproject([0, this.height], unprojectOption);
    const bottomRight = this.unproject([this.width, this.height], unprojectOption);
    return [
      Math.min(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]),
      Math.min(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1]),
      Math.max(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]),
      Math.max(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1])
    ];
  }
  getDistanceScales(coordinateOrigin) {
    if (coordinateOrigin && this.isGeospatial) {
      return (0, import_web_mercator2.getDistanceScales)({
        longitude: coordinateOrigin[0],
        latitude: coordinateOrigin[1],
        highPrecision: true
      });
    }
    return this.distanceScales;
  }
  containsPixel({ x, y, width = 1, height = 1 }) {
    return x < this.x + this.width && this.x < x + width && y < this.y + this.height && this.y < y + height;
  }
  // Extract frustum planes in common space
  getFrustumPlanes() {
    if (this._frustumPlanes.near) {
      return this._frustumPlanes;
    }
    Object.assign(this._frustumPlanes, getFrustumPlanes(this.viewProjectionMatrix));
    return this._frustumPlanes;
  }
  // EXPERIMENTAL METHODS
  /**
   * Needed by panning and linear transition
   * Pan the viewport to place a given world coordinate at screen point [x, y]
   *
   * @param {Array} coords - world coordinates
   * @param {Array} pixel - [x,y] coordinates on screen
   * @return {Object} props of the new viewport
   */
  panByPosition(coords, pixel) {
    return null;
  }
  // INTERNAL METHODS
  /* eslint-disable complexity, max-statements */
  _initProps(opts) {
    const longitude = opts.longitude;
    const latitude = opts.latitude;
    if (this.isGeospatial) {
      if (!Number.isFinite(opts.zoom)) {
        this.zoom = (0, import_web_mercator2.getMeterZoom)({ latitude }) + Math.log2(this.focalDistance);
      }
      this.distanceScales = opts.distanceScales || (0, import_web_mercator2.getDistanceScales)({ latitude, longitude });
    }
    const scale = Math.pow(2, this.zoom);
    this.scale = scale;
    const { position, modelMatrix } = opts;
    let meterOffset = ZERO_VECTOR2;
    if (position) {
      meterOffset = modelMatrix ? new import_core7.Matrix4(modelMatrix).transformAsVector(position, []) : position;
    }
    if (this.isGeospatial) {
      const center = this.projectPosition([longitude, latitude, 0]);
      this.center = new import_core7.Vector3(meterOffset).scale(this.distanceScales.unitsPerMeter).add(center);
    } else {
      this.center = this.projectPosition(meterOffset);
    }
  }
  /* eslint-enable complexity, max-statements */
  _initMatrices(opts) {
    const {
      // View matrix
      viewMatrix: viewMatrix2 = IDENTITY,
      // Projection matrix
      projectionMatrix = null,
      // Projection matrix parameters, used if projectionMatrix not supplied
      orthographic = false,
      fovyRadians,
      fovy = 75,
      near = 0.1,
      // Distance of near clipping plane
      far = 1e3,
      // Distance of far clipping plane
      padding = null,
      // Center offset in pixels
      focalDistance = 1
    } = opts;
    this.viewMatrixUncentered = viewMatrix2;
    this.viewMatrix = new import_core7.Matrix4().multiplyRight(viewMatrix2).translate(new import_core7.Vector3(this.center).negate());
    this.projectionMatrix = projectionMatrix || createProjectionMatrix({
      width: this.width,
      height: this.height,
      orthographic,
      fovyRadians: fovyRadians || fovy * DEGREES_TO_RADIANS,
      focalDistance,
      padding,
      near,
      far
    });
    const vpm = createMat4();
    import_core7.mat4.multiply(vpm, vpm, this.projectionMatrix);
    import_core7.mat4.multiply(vpm, vpm, this.viewMatrix);
    this.viewProjectionMatrix = vpm;
    this.viewMatrixInverse = import_core7.mat4.invert([], this.viewMatrix) || this.viewMatrix;
    this.cameraPosition = getCameraPosition(this.viewMatrixInverse);
    const viewportMatrix = createMat4();
    const pixelProjectionMatrix = createMat4();
    import_core7.mat4.scale(viewportMatrix, viewportMatrix, [this.width / 2, -this.height / 2, 1]);
    import_core7.mat4.translate(viewportMatrix, viewportMatrix, [1, -1, 0]);
    import_core7.mat4.multiply(pixelProjectionMatrix, viewportMatrix, this.viewProjectionMatrix);
    this.pixelProjectionMatrix = pixelProjectionMatrix;
    this.pixelUnprojectionMatrix = import_core7.mat4.invert(createMat4(), this.pixelProjectionMatrix);
    if (!this.pixelUnprojectionMatrix) {
      log_default.warn("Pixel project matrix not invertible")();
    }
  }
};
Viewport.displayName = "Viewport";
var viewport_default = Viewport;

// dist/viewports/web-mercator-viewport.js
var import_web_mercator3 = require("@math.gl/web-mercator");
var import_core8 = require("@math.gl/core");
var WebMercatorViewport = class extends viewport_default {
  /* eslint-disable complexity, max-statements */
  constructor(opts = {}) {
    const {
      latitude = 0,
      longitude = 0,
      zoom = 0,
      pitch = 0,
      bearing = 0,
      nearZMultiplier = 0.1,
      farZMultiplier = 1.01,
      nearZ,
      farZ,
      orthographic = false,
      projectionMatrix,
      repeat = false,
      worldOffset = 0,
      position,
      padding,
      // backward compatibility
      // TODO: remove in v9
      legacyMeterSizes = false
    } = opts;
    let { width, height, altitude = 1.5 } = opts;
    const scale = Math.pow(2, zoom);
    width = width || 1;
    height = height || 1;
    let fovy;
    let projectionParameters = null;
    if (projectionMatrix) {
      altitude = projectionMatrix[5] / 2;
      fovy = (0, import_web_mercator3.altitudeToFovy)(altitude);
    } else {
      if (opts.fovy) {
        fovy = opts.fovy;
        altitude = (0, import_web_mercator3.fovyToAltitude)(fovy);
      } else {
        fovy = (0, import_web_mercator3.altitudeToFovy)(altitude);
      }
      let offset;
      if (padding) {
        const { top = 0, bottom = 0 } = padding;
        offset = [0, (0, import_core8.clamp)((top + height - bottom) / 2, 0, height) - height / 2];
      }
      projectionParameters = (0, import_web_mercator3.getProjectionParameters)({
        width,
        height,
        scale,
        center: position && [0, 0, position[2] * (0, import_web_mercator3.unitsPerMeter)(latitude)],
        offset,
        pitch,
        fovy,
        nearZMultiplier,
        farZMultiplier
      });
      if (Number.isFinite(nearZ)) {
        projectionParameters.near = nearZ;
      }
      if (Number.isFinite(farZ)) {
        projectionParameters.far = farZ;
      }
    }
    let viewMatrixUncentered = (0, import_web_mercator3.getViewMatrix)({
      height,
      pitch,
      bearing,
      scale,
      altitude
    });
    if (worldOffset) {
      const viewOffset = new import_core8.Matrix4().translate([512 * worldOffset, 0, 0]);
      viewMatrixUncentered = viewOffset.multiplyLeft(viewMatrixUncentered);
    }
    super({
      ...opts,
      // x, y,
      width,
      height,
      // view matrix
      viewMatrix: viewMatrixUncentered,
      longitude,
      latitude,
      zoom,
      // projection matrix parameters
      ...projectionParameters,
      fovy,
      focalDistance: altitude
    });
    this.latitude = latitude;
    this.longitude = longitude;
    this.zoom = zoom;
    this.pitch = pitch;
    this.bearing = bearing;
    this.altitude = altitude;
    this.fovy = fovy;
    this.orthographic = orthographic;
    this._subViewports = repeat ? [] : null;
    this._pseudoMeters = legacyMeterSizes;
    Object.freeze(this);
  }
  /* eslint-enable complexity, max-statements */
  get subViewports() {
    if (this._subViewports && !this._subViewports.length) {
      const bounds = this.getBounds();
      const minOffset = Math.floor((bounds[0] + 180) / 360);
      const maxOffset = Math.ceil((bounds[2] - 180) / 360);
      for (let x = minOffset; x <= maxOffset; x++) {
        const offsetViewport = x ? new WebMercatorViewport({
          ...this,
          worldOffset: x
        }) : this;
        this._subViewports.push(offsetViewport);
      }
    }
    return this._subViewports;
  }
  projectPosition(xyz) {
    if (this._pseudoMeters) {
      return super.projectPosition(xyz);
    }
    const [X, Y] = this.projectFlat(xyz);
    const Z = (xyz[2] || 0) * (0, import_web_mercator3.unitsPerMeter)(xyz[1]);
    return [X, Y, Z];
  }
  unprojectPosition(xyz) {
    if (this._pseudoMeters) {
      return super.unprojectPosition(xyz);
    }
    const [X, Y] = this.unprojectFlat(xyz);
    const Z = (xyz[2] || 0) / (0, import_web_mercator3.unitsPerMeter)(Y);
    return [X, Y, Z];
  }
  /**
   * Add a meter delta to a base lnglat coordinate, returning a new lnglat array
   *
   * Note: Uses simple linear approximation around the viewport center
   * Error increases with size of offset (roughly 1% per 100km)
   *
   * @param {[Number,Number]|[Number,Number,Number]) lngLatZ - base coordinate
   * @param {[Number,Number]|[Number,Number,Number]) xyz - array of meter deltas
   * @return {[Number,Number]|[Number,Number,Number]) array of [lng,lat,z] deltas
   */
  addMetersToLngLat(lngLatZ, xyz) {
    return (0, import_web_mercator3.addMetersToLngLat)(lngLatZ, xyz);
  }
  panByPosition(coords, pixel) {
    const fromLocation = (0, import_web_mercator3.pixelsToWorld)(pixel, this.pixelUnprojectionMatrix);
    const toLocation = this.projectFlat(coords);
    const translate = import_core8.vec2.add([], toLocation, import_core8.vec2.negate([], fromLocation));
    const newCenter = import_core8.vec2.add([], this.center, translate);
    const [longitude, latitude] = this.unprojectFlat(newCenter);
    return { longitude, latitude };
  }
  getBounds(options = {}) {
    const corners = (0, import_web_mercator3.getBounds)(this, options.z || 0);
    return [
      Math.min(corners[0][0], corners[1][0], corners[2][0], corners[3][0]),
      Math.min(corners[0][1], corners[1][1], corners[2][1], corners[3][1]),
      Math.max(corners[0][0], corners[1][0], corners[2][0], corners[3][0]),
      Math.max(corners[0][1], corners[1][1], corners[2][1], corners[3][1])
    ];
  }
  /**
   * Returns a new viewport that fit around the given rectangle.
   * Only supports non-perspective mode.
   */
  fitBounds(bounds, options = {}) {
    const { width, height } = this;
    const { longitude, latitude, zoom } = (0, import_web_mercator3.fitBounds)({ width, height, bounds, ...options });
    return new WebMercatorViewport({ width, height, longitude, latitude, zoom });
  }
};
WebMercatorViewport.displayName = "WebMercatorViewport";
var web_mercator_viewport_default = WebMercatorViewport;

// dist/shaderlib/project/project-functions.js
var import_core9 = require("@math.gl/core");
var import_web_mercator4 = require("@math.gl/web-mercator");
var DEFAULT_COORDINATE_ORIGIN2 = [0, 0, 0];
function lngLatZToWorldPosition(lngLatZ, viewport, offsetMode = false) {
  const p = viewport.projectPosition(lngLatZ);
  if (offsetMode && viewport instanceof web_mercator_viewport_default) {
    const [longitude, latitude, z = 0] = lngLatZ;
    const distanceScales = viewport.getDistanceScales([longitude, latitude]);
    p[2] = z * distanceScales.unitsPerMeter[2];
  }
  return p;
}
function normalizeParameters(opts) {
  const { viewport, modelMatrix, coordinateOrigin } = opts;
  let { coordinateSystem, fromCoordinateSystem, fromCoordinateOrigin } = opts;
  if (coordinateSystem === COORDINATE_SYSTEM.DEFAULT) {
    coordinateSystem = viewport.isGeospatial ? COORDINATE_SYSTEM.LNGLAT : COORDINATE_SYSTEM.CARTESIAN;
  }
  if (fromCoordinateSystem === void 0) {
    fromCoordinateSystem = coordinateSystem;
  }
  if (fromCoordinateOrigin === void 0) {
    fromCoordinateOrigin = coordinateOrigin;
  }
  return {
    viewport,
    coordinateSystem,
    coordinateOrigin,
    modelMatrix,
    fromCoordinateSystem,
    fromCoordinateOrigin
  };
}
function getWorldPosition(position, { viewport, modelMatrix, coordinateSystem, coordinateOrigin, offsetMode }) {
  let [x, y, z = 0] = position;
  if (modelMatrix) {
    [x, y, z] = import_core9.vec4.transformMat4([], [x, y, z, 1], modelMatrix);
  }
  switch (coordinateSystem) {
    case COORDINATE_SYSTEM.LNGLAT:
      return lngLatZToWorldPosition([x, y, z], viewport, offsetMode);
    case COORDINATE_SYSTEM.LNGLAT_OFFSETS:
      return lngLatZToWorldPosition([x + coordinateOrigin[0], y + coordinateOrigin[1], z + (coordinateOrigin[2] || 0)], viewport, offsetMode);
    case COORDINATE_SYSTEM.METER_OFFSETS:
      return lngLatZToWorldPosition((0, import_web_mercator4.addMetersToLngLat)(coordinateOrigin, [x, y, z]), viewport, offsetMode);
    case COORDINATE_SYSTEM.CARTESIAN:
    default:
      return viewport.isGeospatial ? [x + coordinateOrigin[0], y + coordinateOrigin[1], z + coordinateOrigin[2]] : viewport.projectPosition([x, y, z]);
  }
}
function projectPosition(position, params) {
  const { viewport, coordinateSystem, coordinateOrigin, modelMatrix, fromCoordinateSystem, fromCoordinateOrigin } = normalizeParameters(params);
  const { autoOffset = true } = params;
  const { geospatialOrigin = DEFAULT_COORDINATE_ORIGIN2, shaderCoordinateOrigin = DEFAULT_COORDINATE_ORIGIN2, offsetMode = false } = autoOffset ? getOffsetOrigin(viewport, coordinateSystem, coordinateOrigin) : {};
  const worldPosition = getWorldPosition(position, {
    viewport,
    modelMatrix,
    coordinateSystem: fromCoordinateSystem,
    coordinateOrigin: fromCoordinateOrigin,
    offsetMode
  });
  if (offsetMode) {
    const positionCommonSpace = viewport.projectPosition(geospatialOrigin || shaderCoordinateOrigin);
    import_core9.vec3.sub(worldPosition, worldPosition, positionCommonSpace);
  }
  return worldPosition;
}

// dist/effects/lighting/point-light.js
var DEFAULT_LIGHT_COLOR3 = [255, 255, 255];
var DEFAULT_LIGHT_INTENSITY3 = 1;
var DEFAULT_ATTENUATION = [1, 0, 0];
var DEFAULT_LIGHT_POSITION = [0, 0, 1];
var idCount3 = 0;
var PointLight = class {
  constructor(props = {}) {
    this.type = "point";
    const { color = DEFAULT_LIGHT_COLOR3 } = props;
    const { intensity = DEFAULT_LIGHT_INTENSITY3 } = props;
    const { position = DEFAULT_LIGHT_POSITION } = props;
    this.id = props.id || `point-${idCount3++}`;
    this.color = color;
    this.intensity = intensity;
    this.type = "point";
    this.position = position;
    this.attenuation = getAttenuation(props);
    this.projectedLight = { ...this };
  }
  getProjectedLight({ layer }) {
    const { projectedLight } = this;
    const viewport = layer.context.viewport;
    const { coordinateSystem, coordinateOrigin } = layer.props;
    const position = projectPosition(this.position, {
      viewport,
      coordinateSystem,
      coordinateOrigin,
      fromCoordinateSystem: viewport.isGeospatial ? COORDINATE_SYSTEM.LNGLAT : COORDINATE_SYSTEM.CARTESIAN,
      fromCoordinateOrigin: [0, 0, 0]
    });
    projectedLight.color = this.color;
    projectedLight.intensity = this.intensity;
    projectedLight.position = position;
    return projectedLight;
  }
};
function getAttenuation(props) {
  if (props.attenuation) {
    return props.attenuation;
  }
  return DEFAULT_ATTENUATION;
}

// dist/effects/lighting/camera-light.js
var CameraLight = class extends PointLight {
  getProjectedLight({ layer }) {
    const { projectedLight } = this;
    const viewport = layer.context.viewport;
    const { coordinateSystem, coordinateOrigin, modelMatrix } = layer.props;
    const { cameraPosition } = getUniformsFromViewport({
      viewport,
      modelMatrix,
      coordinateSystem,
      coordinateOrigin
    });
    projectedLight.color = this.color;
    projectedLight.intensity = this.intensity;
    projectedLight.position = cameraPosition;
    return projectedLight;
  }
};

// dist/effects/lighting/sun-light.js
var import_sun = require("@math.gl/sun");
var SunLight = class extends DirectionalLight {
  constructor(opts) {
    super(opts);
    this.timestamp = opts.timestamp;
  }
  getProjectedLight({ layer }) {
    const { viewport } = layer.context;
    const isGlobe = viewport.resolution && viewport.resolution > 0;
    if (isGlobe) {
      const [x, y, z] = (0, import_sun.getSunDirection)(this.timestamp, 0, 0);
      this.direction = [x, -z, y];
    } else {
      const { latitude, longitude } = viewport;
      this.direction = (0, import_sun.getSunDirection)(this.timestamp, latitude, longitude);
    }
    return this;
  }
};

// dist/effects/post-process-effect.js
var import_shadertools5 = require("@luma.gl/shadertools");

// dist/passes/screen-pass.js
var import_engine = require("@luma.gl/engine");

// dist/passes/screen-pass-uniforms.js
var uniformBlock3 = `uniform screenUniforms {
  vec2 texSize;
} screen;
`;
var screenUniforms = {
  name: "screen",
  fs: uniformBlock3,
  uniformTypes: {
    texSize: "vec2<f32>"
  }
};

// dist/passes/screen-pass.js
var ScreenPass = class extends Pass {
  constructor(device, props) {
    super(device, props);
    const { module: module2, fs: fs4, id } = props;
    const parameters = { depthWriteEnabled: false, depthCompare: "always" };
    this.model = new import_engine.ClipSpace(device, { id, fs: fs4, modules: [module2, screenUniforms], parameters });
  }
  render(params) {
    this._renderPass(this.device, params);
  }
  delete() {
    this.model.destroy();
    this.model = null;
  }
  // Private methods
  /**
   * Renders the pass.
   * This is an abstract method that should be overridden.
   * @param inputBuffer - Frame buffer that contains the result of the previous pass
   * @param outputBuffer - Frame buffer that serves as the output render target
   */
  _renderPass(device, options) {
    const { clearCanvas, inputBuffer, outputBuffer } = options;
    const texSize = [inputBuffer.width, inputBuffer.height];
    const screenProps = {
      texSrc: inputBuffer.colorAttachments[0],
      texSize
    };
    this.model.shaderInputs.setProps({
      screen: screenProps,
      ...options.moduleProps
    });
    const renderPass = this.device.beginRenderPass({
      framebuffer: outputBuffer,
      parameters: { viewport: [0, 0, ...texSize] },
      clearColor: clearCanvas ? [0, 0, 0, 0] : false,
      clearDepth: 1
    });
    this.model.draw(renderPass);
    renderPass.end();
  }
};

// dist/effects/post-process-effect.js
var PostProcessEffect = class {
  constructor(module2, props) {
    this.id = `${module2.name}-pass`;
    this.props = props;
    (0, import_shadertools5.initializeShaderModule)(module2);
    this.module = module2;
  }
  setup({ device }) {
    this.passes = createPasses(device, this.module, this.id);
  }
  setProps(props) {
    this.props = props;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  preRender() {
  }
  postRender(params) {
    const passes = this.passes;
    const { target } = params;
    let inputBuffer = params.inputBuffer;
    let outputBuffer = params.swapBuffer;
    for (let index = 0; index < passes.length; index++) {
      const isLastPass = index === passes.length - 1;
      const renderToTarget = target !== void 0 && isLastPass;
      if (renderToTarget) {
        outputBuffer = target;
      }
      const clearCanvas = !renderToTarget || Boolean(params.clearCanvas);
      const moduleProps = {};
      const uniforms = this.module.passes[index].uniforms;
      moduleProps[this.module.name] = { ...this.props, ...uniforms };
      passes[index].render({ clearCanvas, inputBuffer, outputBuffer, moduleProps });
      const switchBuffer = outputBuffer;
      outputBuffer = inputBuffer;
      inputBuffer = switchBuffer;
    }
    return inputBuffer;
  }
  cleanup() {
    if (this.passes) {
      for (const pass of this.passes) {
        pass.delete();
      }
      this.passes = void 0;
    }
  }
};
function createPasses(device, module2, id) {
  return module2.passes.map((pass, index) => {
    const fs4 = getFragmentShaderForRenderPass(module2, pass);
    const idn = `${id}-${index}`;
    return new ScreenPass(device, { id: idn, module: module2, fs: fs4 });
  });
}
var FS_TEMPLATE_INPUTS = `#version 300 es
uniform sampler2D texSrc;

in vec2 position;
in vec2 coordinate;
in vec2 uv;

out vec4 fragColor;
`;
var FILTER_FS_TEMPLATE = (func) => `${FS_TEMPLATE_INPUTS}
void main() {
  fragColor = texture(texSrc, coordinate);
  fragColor = ${func}(fragColor, screen.texSize, coordinate);
}
`;
var SAMPLER_FS_TEMPLATE = (func) => `${FS_TEMPLATE_INPUTS}
void main() {
  fragColor = ${func}(texSrc, screen.texSize, coordinate);
}
`;
function getFragmentShaderForRenderPass(module2, pass) {
  if (pass.filter) {
    const func = typeof pass.filter === "string" ? pass.filter : `${module2.name}_filterColor_ext`;
    return FILTER_FS_TEMPLATE(func);
  }
  if (pass.sampler) {
    const func = typeof pass.sampler === "string" ? pass.sampler : `${module2.name}_sampleColor`;
    return SAMPLER_FS_TEMPLATE(func);
  }
  return "";
}

// dist/passes/pick-layers-pass.js
var PICKING_BLENDING = {
  blendColorOperation: "add",
  blendColorSrcFactor: "one",
  blendColorDstFactor: "zero",
  blendAlphaOperation: "add",
  blendAlphaSrcFactor: "constant-alpha",
  blendAlphaDstFactor: "zero"
};
var PickLayersPass = class extends LayersPass {
  constructor() {
    super(...arguments);
    this._colorEncoderState = null;
  }
  render(props) {
    if ("pickingFBO" in props) {
      return this._drawPickingBuffer(props);
    }
    return super.render(props);
  }
  // Private
  // Draws list of layers and viewports into the picking buffer
  // Note: does not sample the buffer, that has to be done by the caller
  _drawPickingBuffer({ layers, layerFilter, views, viewports, onViewportActive, pickingFBO, deviceRect: { x, y, width, height }, cullRect, effects, pass = "picking", pickZ, shaderModuleProps }) {
    this.pickZ = pickZ;
    const colorEncoderState = this._resetColorEncoder(pickZ);
    const scissorRect = [x, y, width, height];
    const renderStatus = super.render({
      target: pickingFBO,
      layers,
      layerFilter,
      views,
      viewports,
      onViewportActive,
      cullRect,
      effects: effects == null ? void 0 : effects.filter((e) => e.useInPicking),
      pass,
      isPicking: true,
      shaderModuleProps,
      clearColor: [0, 0, 0, 0],
      colorMask: 15,
      scissorRect
    });
    this._colorEncoderState = null;
    const decodePickingColor = colorEncoderState && decodeColor.bind(null, colorEncoderState);
    return { decodePickingColor, stats: renderStatus };
  }
  shouldDrawLayer(layer) {
    const { pickable, operation } = layer.props;
    return pickable && operation.includes("draw") || operation.includes("terrain") || operation.includes("mask");
  }
  getShaderModuleProps(layer, effects, otherShaderModuleProps) {
    return {
      picking: {
        isActive: 1,
        isAttribute: this.pickZ
      },
      lighting: { enabled: false }
    };
  }
  getLayerParameters(layer, layerIndex, viewport) {
    const pickParameters = {
      ...layer.props.parameters
    };
    const { pickable, operation } = layer.props;
    if (!this._colorEncoderState || operation.includes("terrain")) {
      pickParameters.blend = false;
    } else if (pickable && operation.includes("draw")) {
      Object.assign(pickParameters, PICKING_BLENDING);
      pickParameters.blend = true;
      pickParameters.blendColor = encodeColor(this._colorEncoderState, layer, viewport);
    }
    return pickParameters;
  }
  _resetColorEncoder(pickZ) {
    this._colorEncoderState = pickZ ? null : {
      byLayer: /* @__PURE__ */ new Map(),
      byAlpha: []
    };
    return this._colorEncoderState;
  }
};
function encodeColor(encoded, layer, viewport) {
  const { byLayer, byAlpha } = encoded;
  let a;
  let entry = byLayer.get(layer);
  if (entry) {
    entry.viewports.push(viewport);
    a = entry.a;
  } else {
    a = byLayer.size + 1;
    if (a <= 255) {
      entry = { a, layer, viewports: [viewport] };
      byLayer.set(layer, entry);
      byAlpha[a] = entry;
    } else {
      log_default.warn("Too many pickable layers, only picking the first 255")();
      a = 0;
    }
  }
  return [0, 0, 0, a / 255];
}
function decodeColor(encoded, pickedColor) {
  const entry = encoded.byAlpha[pickedColor[3]];
  return entry && {
    pickedLayer: entry.layer,
    pickedViewports: entry.viewports,
    pickedObjectIndex: entry.layer.decodePickingColor(pickedColor)
  };
}

// dist/lib/layer-manager.js
var import_engine2 = require("@luma.gl/engine");

// dist/lifecycle/constants.js
var LIFECYCLE = {
  NO_STATE: "Awaiting state",
  MATCHED: "Matched. State transferred from previous layer",
  INITIALIZED: "Initialized",
  AWAITING_GC: "Discarded. Awaiting garbage collection",
  AWAITING_FINALIZATION: "No longer matched. Awaiting garbage collection",
  FINALIZED: "Finalized! Awaiting garbage collection"
};
var COMPONENT_SYMBOL = Symbol.for("component");
var PROP_TYPES_SYMBOL = Symbol.for("propTypes");
var DEPRECATED_PROPS_SYMBOL = Symbol.for("deprecatedProps");
var ASYNC_DEFAULTS_SYMBOL = Symbol.for("asyncPropDefaults");
var ASYNC_ORIGINAL_SYMBOL = Symbol.for("asyncPropOriginal");
var ASYNC_RESOLVED_SYMBOL = Symbol.for("asyncPropResolved");

// dist/utils/flatten.js
function flatten(array, filter = () => true) {
  if (!Array.isArray(array)) {
    return filter(array) ? [array] : [];
  }
  return flattenArray(array, filter, []);
}
function flattenArray(array, filter, result) {
  let index = -1;
  while (++index < array.length) {
    const value = array[index];
    if (Array.isArray(value)) {
      flattenArray(value, filter, result);
    } else if (filter(value)) {
      result.push(value);
    }
  }
  return result;
}
function fillArray({ target, source, start = 0, count: count2 = 1 }) {
  const length = source.length;
  const total = count2 * length;
  let copied = 0;
  for (let i = start; copied < length; copied++) {
    target[i++] = source[copied];
  }
  while (copied < total) {
    if (copied < total - copied) {
      target.copyWithin(start + copied, start, start + copied);
      copied *= 2;
    } else {
      target.copyWithin(start + copied, start, start + total - copied);
      copied = total;
    }
  }
  return target;
}

// dist/lib/layer-manager.js
var import_stats = require("@probe.gl/stats");

// dist/lib/resource/resource.js
var import_core10 = require("@loaders.gl/core");
var Resource = class {
  constructor(id, data, context) {
    this._loadCount = 0;
    this._subscribers = /* @__PURE__ */ new Set();
    this.id = id;
    this.context = context;
    this.setData(data);
  }
  // consumer: {onChange: Function}
  subscribe(consumer) {
    this._subscribers.add(consumer);
  }
  unsubscribe(consumer) {
    this._subscribers.delete(consumer);
  }
  inUse() {
    return this._subscribers.size > 0;
  }
  delete() {
  }
  getData() {
    return this.isLoaded ? this._error ? Promise.reject(this._error) : this._content : this._loader.then(() => this.getData());
  }
  setData(data, forceUpdate) {
    if (data === this._data && !forceUpdate) {
      return;
    }
    this._data = data;
    const loadCount = ++this._loadCount;
    let loader = data;
    if (typeof data === "string") {
      loader = (0, import_core10.load)(data);
    }
    if (loader instanceof Promise) {
      this.isLoaded = false;
      this._loader = loader.then((result) => {
        if (this._loadCount === loadCount) {
          this.isLoaded = true;
          this._error = void 0;
          this._content = result;
        }
      }).catch((error) => {
        if (this._loadCount === loadCount) {
          this.isLoaded = true;
          this._error = error || true;
        }
      });
    } else {
      this.isLoaded = true;
      this._error = void 0;
      this._content = data;
    }
    for (const subscriber of this._subscribers) {
      subscriber.onChange(this.getData());
    }
  }
};

// dist/lib/resource/resource-manager.js
var ResourceManager = class {
  constructor(props) {
    var _a;
    this.protocol = props.protocol || "resource://";
    this._context = {
      device: props.device,
      // @ts-expect-error
      gl: (_a = props.device) == null ? void 0 : _a.gl,
      resourceManager: this
    };
    this._resources = {};
    this._consumers = {};
    this._pruneRequest = null;
  }
  contains(resourceId) {
    if (resourceId.startsWith(this.protocol)) {
      return true;
    }
    return resourceId in this._resources;
  }
  add({ resourceId, data, forceUpdate = false, persistent = true }) {
    let res = this._resources[resourceId];
    if (res) {
      res.setData(data, forceUpdate);
    } else {
      res = new Resource(resourceId, data, this._context);
      this._resources[resourceId] = res;
    }
    res.persistent = persistent;
  }
  remove(resourceId) {
    const res = this._resources[resourceId];
    if (res) {
      res.delete();
      delete this._resources[resourceId];
    }
  }
  unsubscribe({ consumerId }) {
    const consumer = this._consumers[consumerId];
    if (consumer) {
      for (const requestId in consumer) {
        const request = consumer[requestId];
        const resource = this._resources[request.resourceId];
        if (resource) {
          resource.unsubscribe(request);
        }
      }
      delete this._consumers[consumerId];
      this.prune();
    }
  }
  subscribe({ resourceId, onChange, consumerId, requestId = "default" }) {
    const { _resources: resources, protocol } = this;
    if (resourceId.startsWith(protocol)) {
      resourceId = resourceId.replace(protocol, "");
      if (!resources[resourceId]) {
        this.add({ resourceId, data: null, persistent: false });
      }
    }
    const res = resources[resourceId];
    this._track(consumerId, requestId, res, onChange);
    if (res) {
      return res.getData();
    }
    return void 0;
  }
  prune() {
    if (!this._pruneRequest) {
      this._pruneRequest = setTimeout(() => this._prune(), 0);
    }
  }
  finalize() {
    for (const key in this._resources) {
      this._resources[key].delete();
    }
  }
  _track(consumerId, requestId, resource, onChange) {
    const consumers = this._consumers;
    const consumer = consumers[consumerId] = consumers[consumerId] || {};
    let request = consumer[requestId];
    const oldResource = request && request.resourceId && this._resources[request.resourceId];
    if (oldResource) {
      oldResource.unsubscribe(request);
      this.prune();
    }
    if (resource) {
      if (request) {
        request.onChange = onChange;
        request.resourceId = resource.id;
      } else {
        request = {
          onChange,
          resourceId: resource.id
        };
      }
      consumer[requestId] = request;
      resource.subscribe(request);
    }
  }
  _prune() {
    this._pruneRequest = null;
    for (const key of Object.keys(this._resources)) {
      const res = this._resources[key];
      if (!res.persistent && !res.inUse()) {
        res.delete();
        delete this._resources[key];
      }
    }
  }
};

// dist/lib/layer-manager.js
var TRACE_SET_LAYERS = "layerManager.setLayers";
var TRACE_ACTIVATE_VIEWPORT = "layerManager.activateViewport";
var LayerManager = class {
  /**
   * @param device
   * @param param1
   */
  // eslint-disable-next-line
  constructor(device, props) {
    this._lastRenderedLayers = [];
    this._needsRedraw = false;
    this._needsUpdate = false;
    this._nextLayers = null;
    this._debug = false;
    this._defaultShaderModulesChanged = false;
    this.activateViewport = (viewport2) => {
      debug(TRACE_ACTIVATE_VIEWPORT, this, viewport2);
      if (viewport2) {
        this.context.viewport = viewport2;
      }
    };
    const { deck, stats, viewport, timeline } = props || {};
    this.layers = [];
    this.resourceManager = new ResourceManager({ device, protocol: "deck://" });
    this.context = {
      mousePosition: null,
      userData: {},
      layerManager: this,
      device,
      // @ts-expect-error
      gl: device == null ? void 0 : device.gl,
      deck,
      shaderAssembler: getShaderAssembler(),
      defaultShaderModules: [layerUniforms],
      renderPass: void 0,
      stats: stats || new import_stats.Stats({ id: "deck.gl" }),
      // Make sure context.viewport is not empty on the first layer initialization
      viewport: viewport || new viewport_default({ id: "DEFAULT-INITIAL-VIEWPORT" }),
      // Current viewport, exposed to layers for project* function
      timeline: timeline || new import_engine2.Timeline(),
      resourceManager: this.resourceManager,
      onError: void 0
    };
    Object.seal(this);
  }
  /** Method to call when the layer manager is not needed anymore. */
  finalize() {
    this.resourceManager.finalize();
    for (const layer of this.layers) {
      this._finalizeLayer(layer);
    }
  }
  /** Check if a redraw is needed */
  needsRedraw(opts = { clearRedrawFlags: false }) {
    let redraw = this._needsRedraw;
    if (opts.clearRedrawFlags) {
      this._needsRedraw = false;
    }
    for (const layer of this.layers) {
      const layerNeedsRedraw = layer.getNeedsRedraw(opts);
      redraw = redraw || layerNeedsRedraw;
    }
    return redraw;
  }
  /** Check if a deep update of all layers is needed */
  needsUpdate() {
    if (this._nextLayers && this._nextLayers !== this._lastRenderedLayers) {
      return "layers changed";
    }
    if (this._defaultShaderModulesChanged) {
      return "shader modules changed";
    }
    return this._needsUpdate;
  }
  /** Layers will be redrawn (in next animation frame) */
  setNeedsRedraw(reason) {
    this._needsRedraw = this._needsRedraw || reason;
  }
  /** Layers will be updated deeply (in next animation frame)
    Potentially regenerating attributes and sub layers */
  setNeedsUpdate(reason) {
    this._needsUpdate = this._needsUpdate || reason;
  }
  /** Gets a list of currently rendered layers. Optionally filter by id. */
  getLayers({ layerIds } = {}) {
    return layerIds ? this.layers.filter((layer) => layerIds.find((layerId) => layer.id.indexOf(layerId) === 0)) : this.layers;
  }
  /** Set props needed for layer rendering and picking. */
  setProps(props) {
    if ("debug" in props) {
      this._debug = props.debug;
    }
    if ("userData" in props) {
      this.context.userData = props.userData;
    }
    if ("layers" in props) {
      this._nextLayers = props.layers;
    }
    if ("onError" in props) {
      this.context.onError = props.onError;
    }
  }
  /** Supply a new layer list, initiating sublayer generation and layer matching */
  setLayers(newLayers, reason) {
    debug(TRACE_SET_LAYERS, this, reason, newLayers);
    this._lastRenderedLayers = newLayers;
    const flatLayers = flatten(newLayers, Boolean);
    for (const layer of flatLayers) {
      layer.context = this.context;
    }
    this._updateLayers(this.layers, flatLayers);
  }
  /** Update layers from last cycle if `setNeedsUpdate()` has been called */
  updateLayers() {
    const reason = this.needsUpdate();
    if (reason) {
      this.setNeedsRedraw(`updating layers: ${reason}`);
      this.setLayers(this._nextLayers || this._lastRenderedLayers, reason);
    }
    this._nextLayers = null;
  }
  /** Register a default shader module */
  addDefaultShaderModule(module2) {
    const { defaultShaderModules } = this.context;
    if (!defaultShaderModules.find((m) => m.name === module2.name)) {
      defaultShaderModules.push(module2);
      this._defaultShaderModulesChanged = true;
    }
  }
  /** Deregister a default shader module */
  removeDefaultShaderModule(module2) {
    const { defaultShaderModules } = this.context;
    const i = defaultShaderModules.findIndex((m) => m.name === module2.name);
    if (i >= 0) {
      defaultShaderModules.splice(i, 1);
      this._defaultShaderModulesChanged = true;
    }
  }
  _handleError(stage, error, layer) {
    layer.raiseError(error, `${stage} of ${layer}`);
  }
  // TODO - mark layers with exceptions as bad and remove from rendering cycle?
  /** Match all layers, checking for caught errors
    to avoid having an exception in one layer disrupt other layers */
  _updateLayers(oldLayers, newLayers) {
    const oldLayerMap = {};
    for (const oldLayer of oldLayers) {
      if (oldLayerMap[oldLayer.id]) {
        log_default.warn(`Multiple old layers with same id ${oldLayer.id}`)();
      } else {
        oldLayerMap[oldLayer.id] = oldLayer;
      }
    }
    if (this._defaultShaderModulesChanged) {
      for (const layer of oldLayers) {
        layer.setNeedsUpdate();
        layer.setChangeFlags({ extensionsChanged: true });
      }
      this._defaultShaderModulesChanged = false;
    }
    const generatedLayers = [];
    this._updateSublayersRecursively(newLayers, oldLayerMap, generatedLayers);
    this._finalizeOldLayers(oldLayerMap);
    let needsUpdate = false;
    for (const layer of generatedLayers) {
      if (layer.hasUniformTransition()) {
        needsUpdate = `Uniform transition in ${layer}`;
        break;
      }
    }
    this._needsUpdate = needsUpdate;
    this.layers = generatedLayers;
  }
  /* eslint-disable complexity,max-statements */
  // Note: adds generated layers to `generatedLayers` array parameter
  _updateSublayersRecursively(newLayers, oldLayerMap, generatedLayers) {
    for (const newLayer of newLayers) {
      newLayer.context = this.context;
      const oldLayer = oldLayerMap[newLayer.id];
      if (oldLayer === null) {
        log_default.warn(`Multiple new layers with same id ${newLayer.id}`)();
      }
      oldLayerMap[newLayer.id] = null;
      let sublayers = null;
      try {
        if (this._debug && oldLayer !== newLayer) {
          newLayer.validateProps();
        }
        if (!oldLayer) {
          this._initializeLayer(newLayer);
        } else {
          this._transferLayerState(oldLayer, newLayer);
          this._updateLayer(newLayer);
        }
        generatedLayers.push(newLayer);
        sublayers = newLayer.isComposite ? newLayer.getSubLayers() : null;
      } catch (err) {
        this._handleError("matching", err, newLayer);
      }
      if (sublayers) {
        this._updateSublayersRecursively(sublayers, oldLayerMap, generatedLayers);
      }
    }
  }
  /* eslint-enable complexity,max-statements */
  // Finalize any old layers that were not matched
  _finalizeOldLayers(oldLayerMap) {
    for (const layerId in oldLayerMap) {
      const layer = oldLayerMap[layerId];
      if (layer) {
        this._finalizeLayer(layer);
      }
    }
  }
  // / EXCEPTION SAFE LAYER ACCESS
  /** Safely initializes a single layer, calling layer methods */
  _initializeLayer(layer) {
    try {
      layer._initialize();
      layer.lifecycle = LIFECYCLE.INITIALIZED;
    } catch (err) {
      this._handleError("initialization", err, layer);
    }
  }
  /** Transfer state from one layer to a newer version */
  _transferLayerState(oldLayer, newLayer) {
    newLayer._transferState(oldLayer);
    newLayer.lifecycle = LIFECYCLE.MATCHED;
    if (newLayer !== oldLayer) {
      oldLayer.lifecycle = LIFECYCLE.AWAITING_GC;
    }
  }
  /** Safely updates a single layer, cleaning all flags */
  _updateLayer(layer) {
    try {
      layer._update();
    } catch (err) {
      this._handleError("update", err, layer);
    }
  }
  /** Safely finalizes a single layer, removing all resources */
  _finalizeLayer(layer) {
    this._needsRedraw = this._needsRedraw || `finalized ${layer}`;
    layer.lifecycle = LIFECYCLE.AWAITING_FINALIZATION;
    try {
      layer._finalize();
      layer.lifecycle = LIFECYCLE.FINALIZED;
    } catch (err) {
      this._handleError("finalization", err, layer);
    }
  }
};

// dist/utils/deep-equal.js
function deepEqual(a, b, depth) {
  if (a === b) {
    return true;
  }
  if (!depth || !a || !b) {
    return false;
  }
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i], depth - 1)) {
        return false;
      }
    }
    return true;
  }
  if (Array.isArray(b)) {
    return false;
  }
  if (typeof a === "object" && typeof b === "object") {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
      return false;
    }
    for (const key of aKeys) {
      if (!b.hasOwnProperty(key)) {
        return false;
      }
      if (!deepEqual(a[key], b[key], depth - 1)) {
        return false;
      }
    }
    return true;
  }
  return false;
}

// dist/lib/view-manager.js
var ViewManager = class {
  constructor(props) {
    this.views = [];
    this.width = 100;
    this.height = 100;
    this.viewState = {};
    this.controllers = {};
    this.timeline = props.timeline;
    this._viewports = [];
    this._viewportMap = {};
    this._isUpdating = false;
    this._needsRedraw = "First render";
    this._needsUpdate = "Initialize";
    this._eventManager = props.eventManager;
    this._eventCallbacks = {
      onViewStateChange: props.onViewStateChange,
      onInteractionStateChange: props.onInteractionStateChange
    };
    Object.seal(this);
    this.setProps(props);
  }
  /** Remove all resources and event listeners */
  finalize() {
    for (const key in this.controllers) {
      const controller = this.controllers[key];
      if (controller) {
        controller.finalize();
      }
    }
    this.controllers = {};
  }
  /** Check if a redraw is needed */
  needsRedraw(opts = { clearRedrawFlags: false }) {
    const redraw = this._needsRedraw;
    if (opts.clearRedrawFlags) {
      this._needsRedraw = false;
    }
    return redraw;
  }
  /** Mark the manager as dirty. Will rebuild all viewports and update controllers. */
  setNeedsUpdate(reason) {
    this._needsUpdate = this._needsUpdate || reason;
    this._needsRedraw = this._needsRedraw || reason;
  }
  /** Checks each viewport for transition updates */
  updateViewStates() {
    for (const viewId in this.controllers) {
      const controller = this.controllers[viewId];
      if (controller) {
        controller.updateTransition();
      }
    }
  }
  /** Get a set of viewports for a given width and height
   * TODO - Intention is for deck.gl to autodeduce width and height and drop the need for props
   * @param rect (object, optional) - filter the viewports
   *   + not provided - return all viewports
   *   + {x, y} - only return viewports that contain this pixel
   *   + {x, y, width, height} - only return viewports that overlap with this rectangle
   */
  getViewports(rect) {
    if (rect) {
      return this._viewports.filter((viewport) => viewport.containsPixel(rect));
    }
    return this._viewports;
  }
  /** Get a map of all views */
  getViews() {
    const viewMap = {};
    this.views.forEach((view) => {
      viewMap[view.id] = view;
    });
    return viewMap;
  }
  /** Resolves a viewId string to a View */
  getView(viewId) {
    return this.views.find((view) => view.id === viewId);
  }
  /** Returns the viewState for a specific viewId. Matches the viewState by
    1. view.viewStateId
    2. view.id
    3. root viewState
    then applies the view's filter if any */
  getViewState(viewOrViewId) {
    const view = typeof viewOrViewId === "string" ? this.getView(viewOrViewId) : viewOrViewId;
    const viewState = view && this.viewState[view.getViewStateId()] || this.viewState;
    return view ? view.filterViewState(viewState) : viewState;
  }
  getViewport(viewId) {
    return this._viewportMap[viewId];
  }
  /**
   * Unproject pixel coordinates on screen onto world coordinates,
   * (possibly [lon, lat]) on map.
   * - [x, y] => [lng, lat]
   * - [x, y, z] => [lng, lat, Z]
   * @param {Array} xyz -
   * @param {Object} opts - options
   * @param {Object} opts.topLeft=true - Whether origin is top left
   * @return {Array|null} - [lng, lat, Z] or [X, Y, Z]
   */
  unproject(xyz, opts) {
    const viewports = this.getViewports();
    const pixel = { x: xyz[0], y: xyz[1] };
    for (let i = viewports.length - 1; i >= 0; --i) {
      const viewport = viewports[i];
      if (viewport.containsPixel(pixel)) {
        const p = xyz.slice();
        p[0] -= viewport.x;
        p[1] -= viewport.y;
        return viewport.unproject(p, opts);
      }
    }
    return null;
  }
  /** Update the manager with new Deck props */
  setProps(props) {
    if (props.views) {
      this._setViews(props.views);
    }
    if (props.viewState) {
      this._setViewState(props.viewState);
    }
    if ("width" in props || "height" in props) {
      this._setSize(props.width, props.height);
    }
    if (!this._isUpdating) {
      this._update();
    }
  }
  //
  // PRIVATE METHODS
  //
  _update() {
    this._isUpdating = true;
    if (this._needsUpdate) {
      this._needsUpdate = false;
      this._rebuildViewports();
    }
    if (this._needsUpdate) {
      this._needsUpdate = false;
      this._rebuildViewports();
    }
    this._isUpdating = false;
  }
  _setSize(width, height) {
    if (width !== this.width || height !== this.height) {
      this.width = width;
      this.height = height;
      this.setNeedsUpdate("Size changed");
    }
  }
  // Update the view descriptor list and set change flag if needed
  // Does not actually rebuild the `Viewport`s until `getViewports` is called
  _setViews(views) {
    views = flatten(views, Boolean);
    const viewsChanged = this._diffViews(views, this.views);
    if (viewsChanged) {
      this.setNeedsUpdate("views changed");
    }
    this.views = views;
  }
  _setViewState(viewState) {
    if (viewState) {
      const viewStateChanged = !deepEqual(viewState, this.viewState, 3);
      if (viewStateChanged) {
        this.setNeedsUpdate("viewState changed");
      }
      this.viewState = viewState;
    } else {
      log_default.warn("missing `viewState` or `initialViewState`")();
    }
  }
  _createController(view, props) {
    const Controller2 = props.type;
    const controller = new Controller2({
      timeline: this.timeline,
      eventManager: this._eventManager,
      // Set an internal callback that calls the prop callback if provided
      onViewStateChange: this._eventCallbacks.onViewStateChange,
      onStateChange: this._eventCallbacks.onInteractionStateChange,
      makeViewport: (viewState) => {
        var _a;
        return (_a = this.getView(view.id)) == null ? void 0 : _a.makeViewport({
          viewState,
          width: this.width,
          height: this.height
        });
      }
    });
    return controller;
  }
  _updateController(view, viewState, viewport, controller) {
    const controllerProps = view.controller;
    if (controllerProps && viewport) {
      const resolvedProps = {
        ...viewState,
        ...controllerProps,
        id: view.id,
        x: viewport.x,
        y: viewport.y,
        width: viewport.width,
        height: viewport.height
      };
      if (!controller || controller.constructor !== controllerProps.type) {
        controller = this._createController(view, resolvedProps);
      }
      if (controller) {
        controller.setProps(resolvedProps);
      }
      return controller;
    }
    return null;
  }
  // Rebuilds viewports from descriptors towards a certain window size
  _rebuildViewports() {
    const { views } = this;
    const oldControllers = this.controllers;
    this._viewports = [];
    this.controllers = {};
    let invalidateControllers = false;
    for (let i = views.length; i--; ) {
      const view = views[i];
      const viewState = this.getViewState(view);
      const viewport = view.makeViewport({ viewState, width: this.width, height: this.height });
      let oldController = oldControllers[view.id];
      const hasController = Boolean(view.controller);
      if (hasController && !oldController) {
        invalidateControllers = true;
      }
      if ((invalidateControllers || !hasController) && oldController) {
        oldController.finalize();
        oldController = null;
      }
      this.controllers[view.id] = this._updateController(view, viewState, viewport, oldController);
      if (viewport) {
        this._viewports.unshift(viewport);
      }
    }
    for (const id in oldControllers) {
      const oldController = oldControllers[id];
      if (oldController && !this.controllers[id]) {
        oldController.finalize();
      }
    }
    this._buildViewportMap();
  }
  _buildViewportMap() {
    this._viewportMap = {};
    this._viewports.forEach((viewport) => {
      if (viewport.id) {
        this._viewportMap[viewport.id] = this._viewportMap[viewport.id] || viewport;
      }
    });
  }
  // Check if viewport array has changed, returns true if any change
  // Note that descriptors can be the same
  _diffViews(newViews, oldViews) {
    if (newViews.length !== oldViews.length) {
      return true;
    }
    return newViews.some((_, i) => !newViews[i].equals(oldViews[i]));
  }
};

// dist/utils/positions.js
var PERCENT_OR_PIXELS_REGEX = /([0-9]+\.?[0-9]*)(%|px)/;
function parsePosition(value) {
  switch (typeof value) {
    case "number":
      return {
        position: value,
        relative: false
      };
    case "string":
      const match = PERCENT_OR_PIXELS_REGEX.exec(value);
      if (match && match.length >= 3) {
        const relative = match[2] === "%";
        const position = parseFloat(match[1]);
        return {
          position: relative ? position / 100 : position,
          relative
        };
      }
    default:
      throw new Error(`Could not parse position string ${value}`);
  }
}
function getPosition(position, extent) {
  return position.relative ? Math.round(position.position * extent) : position.position;
}

// dist/views/view.js
var View = class {
  constructor(props) {
    const { id, x = 0, y = 0, width = "100%", height = "100%", padding = null } = props;
    this.id = id || this.constructor.displayName || "view";
    this.props = { ...props, id: this.id };
    this._x = parsePosition(x);
    this._y = parsePosition(y);
    this._width = parsePosition(width);
    this._height = parsePosition(height);
    this._padding = padding && {
      left: parsePosition(padding.left || 0),
      right: parsePosition(padding.right || 0),
      top: parsePosition(padding.top || 0),
      bottom: parsePosition(padding.bottom || 0)
    };
    this.equals = this.equals.bind(this);
    Object.seal(this);
  }
  equals(view) {
    if (this === view) {
      return true;
    }
    return this.constructor === view.constructor && deepEqual(this.props, view.props, 2);
  }
  /** Make viewport from canvas dimensions and view state */
  makeViewport({ width, height, viewState }) {
    viewState = this.filterViewState(viewState);
    const viewportDimensions = this.getDimensions({ width, height });
    if (!viewportDimensions.height || !viewportDimensions.width) {
      return null;
    }
    const ViewportType = this.getViewportType(viewState);
    return new ViewportType({ ...viewState, ...this.props, ...viewportDimensions });
  }
  getViewStateId() {
    const { viewState } = this.props;
    if (typeof viewState === "string") {
      return viewState;
    }
    return (viewState == null ? void 0 : viewState.id) || this.id;
  }
  // Allows view to override (or completely define) viewState
  filterViewState(viewState) {
    if (this.props.viewState && typeof this.props.viewState === "object") {
      if (!this.props.viewState.id) {
        return this.props.viewState;
      }
      const newViewState = { ...viewState };
      for (const key in this.props.viewState) {
        if (key !== "id") {
          newViewState[key] = this.props.viewState[key];
        }
      }
      return newViewState;
    }
    return viewState;
  }
  /** Resolve the dimensions of the view from overall canvas dimensions */
  getDimensions({ width, height }) {
    const dimensions = {
      x: getPosition(this._x, width),
      y: getPosition(this._y, height),
      width: getPosition(this._width, width),
      height: getPosition(this._height, height)
    };
    if (this._padding) {
      dimensions.padding = {
        left: getPosition(this._padding.left, width),
        top: getPosition(this._padding.top, height),
        right: getPosition(this._padding.right, width),
        bottom: getPosition(this._padding.bottom, height)
      };
    }
    return dimensions;
  }
  // Used by sub classes to resolve controller props
  get controller() {
    const opts = this.props.controller;
    if (!opts) {
      return null;
    }
    if (opts === true) {
      return { type: this.ControllerType };
    }
    if (typeof opts === "function") {
      return { type: opts };
    }
    return { type: this.ControllerType, ...opts };
  }
};

// dist/controllers/map-controller.js
var import_core13 = require("@math.gl/core");

// dist/transitions/transition.js
var Transition = class {
  /**
   * @params timeline {Timeline}
   */
  constructor(timeline) {
    this._inProgress = false;
    this._handle = null;
    this.time = 0;
    this.settings = {
      duration: 0
    };
    this._timeline = timeline;
  }
  /* Public API */
  get inProgress() {
    return this._inProgress;
  }
  /**
   * (re)start this transition.
   * @params props {object} - optional overriding props. see constructor
   */
  start(settings) {
    var _a, _b;
    this.cancel();
    this.settings = settings;
    this._inProgress = true;
    (_b = (_a = this.settings).onStart) == null ? void 0 : _b.call(_a, this);
  }
  /**
   * end this transition if it is in progress.
   */
  end() {
    var _a, _b;
    if (this._inProgress) {
      this._timeline.removeChannel(this._handle);
      this._handle = null;
      this._inProgress = false;
      (_b = (_a = this.settings).onEnd) == null ? void 0 : _b.call(_a, this);
    }
  }
  /**
   * cancel this transition if it is in progress.
   */
  cancel() {
    var _a, _b;
    if (this._inProgress) {
      (_b = (_a = this.settings).onInterrupt) == null ? void 0 : _b.call(_a, this);
      this._timeline.removeChannel(this._handle);
      this._handle = null;
      this._inProgress = false;
    }
  }
  /**
   * update this transition. Returns `true` if updated.
   */
  update() {
    var _a, _b;
    if (!this._inProgress) {
      return false;
    }
    if (this._handle === null) {
      const { _timeline: timeline, settings } = this;
      this._handle = timeline.addChannel({
        delay: timeline.getTime(),
        duration: settings.duration
      });
    }
    this.time = this._timeline.getTime(this._handle);
    this._onUpdate();
    (_b = (_a = this.settings).onUpdate) == null ? void 0 : _b.call(_a, this);
    if (this._timeline.isFinished(this._handle)) {
      this.end();
    }
    return true;
  }
  /* Private API */
  _onUpdate() {
  }
};

// dist/controllers/transition-manager.js
var noop = () => {
};
var TRANSITION_EVENTS = {
  BREAK: 1,
  SNAP_TO_END: 2,
  IGNORE: 3
};
var DEFAULT_EASING = (t) => t;
var DEFAULT_INTERRUPTION = TRANSITION_EVENTS.BREAK;
var TransitionManager = class {
  constructor(opts) {
    this._onTransitionUpdate = (transition) => {
      const { time, settings: { interpolator, startProps, endProps, duration, easing } } = transition;
      const t = easing(time / duration);
      const viewport = interpolator.interpolateProps(startProps, endProps, t);
      this.propsInTransition = this.getControllerState({
        ...this.props,
        ...viewport
      }).getViewportProps();
      this.onViewStateChange({
        viewState: this.propsInTransition,
        oldViewState: this.props
      });
    };
    this.getControllerState = opts.getControllerState;
    this.propsInTransition = null;
    this.transition = new Transition(opts.timeline);
    this.onViewStateChange = opts.onViewStateChange || noop;
    this.onStateChange = opts.onStateChange || noop;
  }
  finalize() {
    this.transition.cancel();
  }
  // Returns current transitioned viewport.
  getViewportInTransition() {
    return this.propsInTransition;
  }
  // Process the vewiport change, either ignore or trigger a new transition.
  // Return true if a new transition is triggered, false otherwise.
  processViewStateChange(nextProps) {
    let transitionTriggered = false;
    const currentProps = this.props;
    this.props = nextProps;
    if (!currentProps || this._shouldIgnoreViewportChange(currentProps, nextProps)) {
      return false;
    }
    if (this._isTransitionEnabled(nextProps)) {
      let startProps = currentProps;
      if (this.transition.inProgress) {
        const { interruption, endProps } = this.transition.settings;
        startProps = {
          ...currentProps,
          ...interruption === TRANSITION_EVENTS.SNAP_TO_END ? endProps : this.propsInTransition || currentProps
        };
      }
      this._triggerTransition(startProps, nextProps);
      transitionTriggered = true;
    } else {
      this.transition.cancel();
    }
    return transitionTriggered;
  }
  updateTransition() {
    this.transition.update();
  }
  // Helper methods
  _isTransitionEnabled(props) {
    const { transitionDuration, transitionInterpolator } = props;
    return (transitionDuration > 0 || transitionDuration === "auto") && Boolean(transitionInterpolator);
  }
  _isUpdateDueToCurrentTransition(props) {
    if (this.transition.inProgress && this.propsInTransition) {
      return this.transition.settings.interpolator.arePropsEqual(props, this.propsInTransition);
    }
    return false;
  }
  _shouldIgnoreViewportChange(currentProps, nextProps) {
    if (this.transition.inProgress) {
      const transitionSettings = this.transition.settings;
      return transitionSettings.interruption === TRANSITION_EVENTS.IGNORE || // Ignore update if it is due to current active transition.
      this._isUpdateDueToCurrentTransition(nextProps);
    }
    if (this._isTransitionEnabled(nextProps)) {
      return nextProps.transitionInterpolator.arePropsEqual(currentProps, nextProps);
    }
    return true;
  }
  _triggerTransition(startProps, endProps) {
    const startViewstate = this.getControllerState(startProps);
    const endViewStateProps = this.getControllerState(endProps).shortestPathFrom(startViewstate);
    const transitionInterpolator = endProps.transitionInterpolator;
    const duration = transitionInterpolator.getDuration ? transitionInterpolator.getDuration(startProps, endProps) : endProps.transitionDuration;
    if (duration === 0) {
      return;
    }
    const initialProps = transitionInterpolator.initializeProps(startProps, endViewStateProps);
    this.propsInTransition = {};
    const transitionSettings = {
      duration,
      easing: endProps.transitionEasing || DEFAULT_EASING,
      interpolator: transitionInterpolator,
      interruption: endProps.transitionInterruption || DEFAULT_INTERRUPTION,
      startProps: initialProps.start,
      endProps: initialProps.end,
      onStart: endProps.onTransitionStart,
      onUpdate: this._onTransitionUpdate,
      onInterrupt: this._onTransitionEnd(endProps.onTransitionInterrupt),
      onEnd: this._onTransitionEnd(endProps.onTransitionEnd)
    };
    this.transition.start(transitionSettings);
    this.onStateChange({ inTransition: true });
    this.updateTransition();
  }
  _onTransitionEnd(callback) {
    return (transition) => {
      this.propsInTransition = null;
      this.onStateChange({
        inTransition: false,
        isZooming: false,
        isPanning: false,
        isRotating: false
      });
      callback == null ? void 0 : callback(transition);
    };
  }
};

// dist/transitions/transition-interpolator.js
var import_core11 = require("@math.gl/core");

// dist/utils/assert.js
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "deck.gl: assertion failed.");
  }
}

// dist/transitions/transition-interpolator.js
var TransitionInterpolator = class {
  /**
   * @param opts {array|object}
   * @param opts.compare {array} - prop names used in equality check
   * @param opts.extract {array} - prop names needed for interpolation
   * @param opts.required {array} - prop names that must be supplied
   * alternatively, supply one list of prop names as `opts` if all of the above are the same.
   */
  constructor(opts) {
    const { compare, extract, required } = opts;
    this._propsToCompare = compare;
    this._propsToExtract = extract || compare;
    this._requiredProps = required;
  }
  /**
   * Checks if two sets of props need transition in between
   * @param currentProps {object} - a list of viewport props
   * @param nextProps {object} - a list of viewport props
   * @returns {bool} - true if two props are equivalent
   */
  arePropsEqual(currentProps, nextProps) {
    for (const key of this._propsToCompare) {
      if (!(key in currentProps) || !(key in nextProps) || !(0, import_core11.equals)(currentProps[key], nextProps[key])) {
        return false;
      }
    }
    return true;
  }
  /**
   * Called before transition starts to validate/pre-process start and end props
   * @param startProps {object} - a list of starting viewport props
   * @param endProps {object} - a list of target viewport props
   * @returns {Object} {start, end} - start and end props to be passed
   *   to `interpolateProps`
   */
  initializeProps(startProps, endProps) {
    const startViewStateProps = {};
    const endViewStateProps = {};
    for (const key of this._propsToExtract) {
      if (key in startProps || key in endProps) {
        startViewStateProps[key] = startProps[key];
        endViewStateProps[key] = endProps[key];
      }
    }
    this._checkRequiredProps(startViewStateProps);
    this._checkRequiredProps(endViewStateProps);
    return { start: startViewStateProps, end: endViewStateProps };
  }
  /**
   * Returns transition duration
   * @param startProps {object} - a list of starting viewport props
   * @param endProps {object} - a list of target viewport props
   * @returns {Number} - transition duration in milliseconds
   */
  getDuration(startProps, endProps) {
    return endProps.transitionDuration;
  }
  _checkRequiredProps(props) {
    if (!this._requiredProps) {
      return;
    }
    this._requiredProps.forEach((propName) => {
      const value = props[propName];
      assert(Number.isFinite(value) || Array.isArray(value), `${propName} is required for transition`);
    });
  }
};

// dist/transitions/linear-interpolator.js
var import_core12 = require("@math.gl/core");
var DEFAULT_PROPS = ["longitude", "latitude", "zoom", "bearing", "pitch"];
var DEFAULT_REQUIRED_PROPS = ["longitude", "latitude", "zoom"];
var LinearInterpolator = class extends TransitionInterpolator {
  /**
   * @param {Object} opts
   * @param {Array} opts.transitionProps - list of props to apply linear transition to.
   * @param {Array} opts.around - a screen point to zoom/rotate around.
   * @param {Function} opts.makeViewport - construct a viewport instance with given props.
   */
  constructor(opts = {}) {
    const transitionProps = Array.isArray(opts) ? opts : opts.transitionProps;
    const normalizedOpts = Array.isArray(opts) ? {} : opts;
    normalizedOpts.transitionProps = Array.isArray(transitionProps) ? {
      compare: transitionProps,
      required: transitionProps
    } : transitionProps || {
      compare: DEFAULT_PROPS,
      required: DEFAULT_REQUIRED_PROPS
    };
    super(normalizedOpts.transitionProps);
    this.opts = normalizedOpts;
  }
  initializeProps(startProps, endProps) {
    const result = super.initializeProps(startProps, endProps);
    const { makeViewport, around } = this.opts;
    if (makeViewport && around) {
      const startViewport = makeViewport(startProps);
      const endViewport = makeViewport(endProps);
      const aroundPosition = startViewport.unproject(around);
      result.start.around = around;
      Object.assign(result.end, {
        around: endViewport.project(aroundPosition),
        aroundPosition,
        width: endProps.width,
        height: endProps.height
      });
    }
    return result;
  }
  interpolateProps(startProps, endProps, t) {
    const propsInTransition = {};
    for (const key of this._propsToExtract) {
      propsInTransition[key] = (0, import_core12.lerp)(startProps[key] || 0, endProps[key] || 0, t);
    }
    if (endProps.aroundPosition && this.opts.makeViewport) {
      const viewport = this.opts.makeViewport({ ...endProps, ...propsInTransition });
      Object.assign(propsInTransition, viewport.panByPosition(
        endProps.aroundPosition,
        // anchor point in current screen coordinates
        (0, import_core12.lerp)(startProps.around, endProps.around, t)
      ));
    }
    return propsInTransition;
  }
};

// dist/controllers/controller.js
var NO_TRANSITION_PROPS = {
  transitionDuration: 0
};
var DEFAULT_INERTIA = 300;
var INERTIA_EASING = (t) => 1 - (1 - t) * (1 - t);
var EVENT_TYPES = {
  WHEEL: ["wheel"],
  PAN: ["panstart", "panmove", "panend"],
  PINCH: ["pinchstart", "pinchmove", "pinchend"],
  MULTI_PAN: ["multipanstart", "multipanmove", "multipanend"],
  DOUBLE_CLICK: ["dblclick"],
  KEYBOARD: ["keydown"]
};
var pinchEventWorkaround = {};
var Controller = class {
  constructor(opts) {
    this.state = {};
    this._events = {};
    this._interactionState = {
      isDragging: false
    };
    this._customEvents = [];
    this._eventStartBlocked = null;
    this._panMove = false;
    this.invertPan = false;
    this.dragMode = "rotate";
    this.inertia = 0;
    this.scrollZoom = true;
    this.dragPan = true;
    this.dragRotate = true;
    this.doubleClickZoom = true;
    this.touchZoom = true;
    this.touchRotate = false;
    this.keyboard = true;
    this.transitionManager = new TransitionManager({
      ...opts,
      getControllerState: (props) => new this.ControllerState(props),
      onViewStateChange: this._onTransition.bind(this),
      onStateChange: this._setInteractionState.bind(this)
    });
    this.handleEvent = this.handleEvent.bind(this);
    this.eventManager = opts.eventManager;
    this.onViewStateChange = opts.onViewStateChange || (() => {
    });
    this.onStateChange = opts.onStateChange || (() => {
    });
    this.makeViewport = opts.makeViewport;
  }
  set events(customEvents) {
    this.toggleEvents(this._customEvents, false);
    this.toggleEvents(customEvents, true);
    this._customEvents = customEvents;
    if (this.props) {
      this.setProps(this.props);
    }
  }
  finalize() {
    var _a;
    for (const eventName in this._events) {
      if (this._events[eventName]) {
        (_a = this.eventManager) == null ? void 0 : _a.off(eventName, this.handleEvent);
      }
    }
    this.transitionManager.finalize();
  }
  /**
   * Callback for events
   */
  handleEvent(event) {
    this._controllerState = void 0;
    const eventStartBlocked = this._eventStartBlocked;
    switch (event.type) {
      case "panstart":
        return eventStartBlocked ? false : this._onPanStart(event);
      case "panmove":
        return this._onPan(event);
      case "panend":
        return this._onPanEnd(event);
      case "pinchstart":
        return eventStartBlocked ? false : this._onPinchStart(event);
      case "pinchmove":
        return this._onPinch(event);
      case "pinchend":
        return this._onPinchEnd(event);
      case "multipanstart":
        return eventStartBlocked ? false : this._onMultiPanStart(event);
      case "multipanmove":
        return this._onMultiPan(event);
      case "multipanend":
        return this._onMultiPanEnd(event);
      case "dblclick":
        return this._onDoubleClick(event);
      case "wheel":
        return this._onWheel(event);
      case "keydown":
        return this._onKeyDown(event);
      default:
        return false;
    }
  }
  /* Event utils */
  // Event object: http://hammerjs.github.io/api/#event-object
  get controllerState() {
    this._controllerState = this._controllerState || new this.ControllerState({
      makeViewport: this.makeViewport,
      ...this.props,
      ...this.state
    });
    return this._controllerState;
  }
  getCenter(event) {
    const { x, y } = this.props;
    const { offsetCenter } = event;
    return [offsetCenter.x - x, offsetCenter.y - y];
  }
  isPointInBounds(pos, event) {
    const { width, height } = this.props;
    if (event && event.handled) {
      return false;
    }
    const inside = pos[0] >= 0 && pos[0] <= width && pos[1] >= 0 && pos[1] <= height;
    if (inside && event) {
      event.stopPropagation();
    }
    return inside;
  }
  isFunctionKeyPressed(event) {
    const { srcEvent } = event;
    return Boolean(srcEvent.metaKey || srcEvent.altKey || srcEvent.ctrlKey || srcEvent.shiftKey);
  }
  isDragging() {
    return this._interactionState.isDragging || false;
  }
  // When a multi-touch event ends, e.g. pinch, not all pointers are lifted at the same time.
  // This triggers a brief `pan` event.
  // Calling this method will temporarily disable *start events to avoid conflicting transitions.
  blockEvents(timeout) {
    const timer = setTimeout(() => {
      if (this._eventStartBlocked === timer) {
        this._eventStartBlocked = null;
      }
    }, timeout);
    this._eventStartBlocked = timer;
  }
  /**
   * Extract interactivity options
   */
  setProps(props) {
    if (props.dragMode) {
      this.dragMode = props.dragMode;
    }
    this.props = props;
    if (!("transitionInterpolator" in props)) {
      props.transitionInterpolator = this._getTransitionProps().transitionInterpolator;
    }
    this.transitionManager.processViewStateChange(props);
    const { inertia } = props;
    this.inertia = Number.isFinite(inertia) ? inertia : inertia === true ? DEFAULT_INERTIA : 0;
    const { scrollZoom = true, dragPan = true, dragRotate = true, doubleClickZoom = true, touchZoom = true, touchRotate = false, keyboard = true } = props;
    const isInteractive = Boolean(this.onViewStateChange);
    this.toggleEvents(EVENT_TYPES.WHEEL, isInteractive && scrollZoom);
    this.toggleEvents(EVENT_TYPES.PAN, isInteractive);
    this.toggleEvents(EVENT_TYPES.PINCH, isInteractive && (touchZoom || touchRotate));
    this.toggleEvents(EVENT_TYPES.MULTI_PAN, isInteractive && touchRotate);
    this.toggleEvents(EVENT_TYPES.DOUBLE_CLICK, isInteractive && doubleClickZoom);
    this.toggleEvents(EVENT_TYPES.KEYBOARD, isInteractive && keyboard);
    this.scrollZoom = scrollZoom;
    this.dragPan = dragPan;
    this.dragRotate = dragRotate;
    this.doubleClickZoom = doubleClickZoom;
    this.touchZoom = touchZoom;
    this.touchRotate = touchRotate;
    this.keyboard = keyboard;
  }
  updateTransition() {
    this.transitionManager.updateTransition();
  }
  toggleEvents(eventNames, enabled) {
    if (this.eventManager) {
      eventNames.forEach((eventName) => {
        if (this._events[eventName] !== enabled) {
          this._events[eventName] = enabled;
          if (enabled) {
            this.eventManager.on(eventName, this.handleEvent);
          } else {
            this.eventManager.off(eventName, this.handleEvent);
          }
        }
      });
    }
  }
  // Private Methods
  /* Callback util */
  // formats map state and invokes callback function
  updateViewport(newControllerState, extraProps = null, interactionState = {}) {
    const viewState = { ...newControllerState.getViewportProps(), ...extraProps };
    const changed = this.controllerState !== newControllerState;
    this.state = newControllerState.getState();
    this._setInteractionState(interactionState);
    if (changed) {
      const oldViewState = this.controllerState && this.controllerState.getViewportProps();
      if (this.onViewStateChange) {
        this.onViewStateChange({ viewState, interactionState: this._interactionState, oldViewState, viewId: this.props.id });
      }
    }
  }
  _onTransition(params) {
    this.onViewStateChange({ ...params, interactionState: this._interactionState, viewId: this.props.id });
  }
  _setInteractionState(newStates) {
    Object.assign(this._interactionState, newStates);
    this.onStateChange(this._interactionState);
  }
  /* Event handlers */
  // Default handler for the `panstart` event.
  _onPanStart(event) {
    const pos = this.getCenter(event);
    if (!this.isPointInBounds(pos, event)) {
      return false;
    }
    let alternateMode = this.isFunctionKeyPressed(event) || event.rightButton || false;
    if (this.invertPan || this.dragMode === "pan") {
      alternateMode = !alternateMode;
    }
    const newControllerState = this.controllerState[alternateMode ? "panStart" : "rotateStart"]({
      pos
    });
    this._panMove = alternateMode;
    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, { isDragging: true });
    return true;
  }
  // Default handler for the `panmove` and `panend` event.
  _onPan(event) {
    if (!this.isDragging()) {
      return false;
    }
    return this._panMove ? this._onPanMove(event) : this._onPanRotate(event);
  }
  _onPanEnd(event) {
    if (!this.isDragging()) {
      return false;
    }
    return this._panMove ? this._onPanMoveEnd(event) : this._onPanRotateEnd(event);
  }
  // Default handler for panning to move.
  // Called by `_onPan` when panning without function key pressed.
  _onPanMove(event) {
    if (!this.dragPan) {
      return false;
    }
    const pos = this.getCenter(event);
    const newControllerState = this.controllerState.pan({ pos });
    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
      isDragging: true,
      isPanning: true
    });
    return true;
  }
  _onPanMoveEnd(event) {
    const { inertia } = this;
    if (this.dragPan && inertia && event.velocity) {
      const pos = this.getCenter(event);
      const endPos = [
        pos[0] + event.velocityX * inertia / 2,
        pos[1] + event.velocityY * inertia / 2
      ];
      const newControllerState = this.controllerState.pan({ pos: endPos }).panEnd();
      this.updateViewport(newControllerState, {
        ...this._getTransitionProps(),
        transitionDuration: inertia,
        transitionEasing: INERTIA_EASING
      }, {
        isDragging: false,
        isPanning: true
      });
    } else {
      const newControllerState = this.controllerState.panEnd();
      this.updateViewport(newControllerState, null, {
        isDragging: false,
        isPanning: false
      });
    }
    return true;
  }
  // Default handler for panning to rotate.
  // Called by `_onPan` when panning with function key pressed.
  _onPanRotate(event) {
    if (!this.dragRotate) {
      return false;
    }
    const pos = this.getCenter(event);
    const newControllerState = this.controllerState.rotate({ pos });
    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
      isDragging: true,
      isRotating: true
    });
    return true;
  }
  _onPanRotateEnd(event) {
    const { inertia } = this;
    if (this.dragRotate && inertia && event.velocity) {
      const pos = this.getCenter(event);
      const endPos = [
        pos[0] + event.velocityX * inertia / 2,
        pos[1] + event.velocityY * inertia / 2
      ];
      const newControllerState = this.controllerState.rotate({ pos: endPos }).rotateEnd();
      this.updateViewport(newControllerState, {
        ...this._getTransitionProps(),
        transitionDuration: inertia,
        transitionEasing: INERTIA_EASING
      }, {
        isDragging: false,
        isRotating: true
      });
    } else {
      const newControllerState = this.controllerState.rotateEnd();
      this.updateViewport(newControllerState, null, {
        isDragging: false,
        isRotating: false
      });
    }
    return true;
  }
  // Default handler for the `wheel` event.
  _onWheel(event) {
    if (!this.scrollZoom) {
      return false;
    }
    const pos = this.getCenter(event);
    if (!this.isPointInBounds(pos, event)) {
      return false;
    }
    event.srcEvent.preventDefault();
    const { speed = 0.01, smooth = false } = this.scrollZoom === true ? {} : this.scrollZoom;
    const { delta } = event;
    let scale = 2 / (1 + Math.exp(-Math.abs(delta * speed)));
    if (delta < 0 && scale !== 0) {
      scale = 1 / scale;
    }
    const newControllerState = this.controllerState.zoom({ pos, scale });
    this.updateViewport(newControllerState, { ...this._getTransitionProps({ around: pos }), transitionDuration: smooth ? 250 : 1 }, {
      isZooming: true,
      isPanning: true
    });
    return true;
  }
  _onMultiPanStart(event) {
    const pos = this.getCenter(event);
    if (!this.isPointInBounds(pos, event)) {
      return false;
    }
    const newControllerState = this.controllerState.rotateStart({ pos });
    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, { isDragging: true });
    return true;
  }
  _onMultiPan(event) {
    if (!this.touchRotate) {
      return false;
    }
    if (!this.isDragging()) {
      return false;
    }
    const pos = this.getCenter(event);
    pos[0] -= event.deltaX;
    const newControllerState = this.controllerState.rotate({ pos });
    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
      isDragging: true,
      isRotating: true
    });
    return true;
  }
  _onMultiPanEnd(event) {
    if (!this.isDragging()) {
      return false;
    }
    const { inertia } = this;
    if (this.touchRotate && inertia && event.velocityY) {
      const pos = this.getCenter(event);
      const endPos = [pos[0], pos[1] += event.velocityY * inertia / 2];
      const newControllerState = this.controllerState.rotate({ pos: endPos });
      this.updateViewport(newControllerState, {
        ...this._getTransitionProps(),
        transitionDuration: inertia,
        transitionEasing: INERTIA_EASING
      }, {
        isDragging: false,
        isRotating: true
      });
      this.blockEvents(inertia);
    } else {
      const newControllerState = this.controllerState.rotateEnd();
      this.updateViewport(newControllerState, null, {
        isDragging: false,
        isRotating: false
      });
    }
    return true;
  }
  // Default handler for the `pinchstart` event.
  _onPinchStart(event) {
    const pos = this.getCenter(event);
    if (!this.isPointInBounds(pos, event)) {
      return false;
    }
    const newControllerState = this.controllerState.zoomStart({ pos }).rotateStart({ pos });
    pinchEventWorkaround._startPinchRotation = event.rotation;
    pinchEventWorkaround._lastPinchEvent = event;
    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, { isDragging: true });
    return true;
  }
  // Default handler for the `pinchmove` and `pinchend` events.
  _onPinch(event) {
    if (!this.touchZoom && !this.touchRotate) {
      return false;
    }
    if (!this.isDragging()) {
      return false;
    }
    let newControllerState = this.controllerState;
    if (this.touchZoom) {
      const { scale } = event;
      const pos = this.getCenter(event);
      newControllerState = newControllerState.zoom({ pos, scale });
    }
    if (this.touchRotate) {
      const { rotation } = event;
      newControllerState = newControllerState.rotate({
        deltaAngleX: pinchEventWorkaround._startPinchRotation - rotation
      });
    }
    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
      isDragging: true,
      isPanning: this.touchZoom,
      isZooming: this.touchZoom,
      isRotating: this.touchRotate
    });
    pinchEventWorkaround._lastPinchEvent = event;
    return true;
  }
  _onPinchEnd(event) {
    if (!this.isDragging()) {
      return false;
    }
    const { inertia } = this;
    const { _lastPinchEvent } = pinchEventWorkaround;
    if (this.touchZoom && inertia && _lastPinchEvent && event.scale !== _lastPinchEvent.scale) {
      const pos = this.getCenter(event);
      let newControllerState = this.controllerState.rotateEnd();
      const z = Math.log2(event.scale);
      const velocityZ = (z - Math.log2(_lastPinchEvent.scale)) / (event.deltaTime - _lastPinchEvent.deltaTime);
      const endScale = Math.pow(2, z + velocityZ * inertia / 2);
      newControllerState = newControllerState.zoom({ pos, scale: endScale }).zoomEnd();
      this.updateViewport(newControllerState, {
        ...this._getTransitionProps({ around: pos }),
        transitionDuration: inertia,
        transitionEasing: INERTIA_EASING
      }, {
        isDragging: false,
        isPanning: this.touchZoom,
        isZooming: this.touchZoom,
        isRotating: false
      });
      this.blockEvents(inertia);
    } else {
      const newControllerState = this.controllerState.zoomEnd().rotateEnd();
      this.updateViewport(newControllerState, null, {
        isDragging: false,
        isPanning: false,
        isZooming: false,
        isRotating: false
      });
    }
    pinchEventWorkaround._startPinchRotation = null;
    pinchEventWorkaround._lastPinchEvent = null;
    return true;
  }
  // Default handler for the `dblclick` event.
  _onDoubleClick(event) {
    if (!this.doubleClickZoom) {
      return false;
    }
    const pos = this.getCenter(event);
    if (!this.isPointInBounds(pos, event)) {
      return false;
    }
    const isZoomOut = this.isFunctionKeyPressed(event);
    const newControllerState = this.controllerState.zoom({ pos, scale: isZoomOut ? 0.5 : 2 });
    this.updateViewport(newControllerState, this._getTransitionProps({ around: pos }), {
      isZooming: true,
      isPanning: true
    });
    this.blockEvents(100);
    return true;
  }
  // Default handler for the `keydown` event
  _onKeyDown(event) {
    if (!this.keyboard) {
      return false;
    }
    const funcKey = this.isFunctionKeyPressed(event);
    const { zoomSpeed, moveSpeed, rotateSpeedX, rotateSpeedY } = this.keyboard === true ? {} : this.keyboard;
    const { controllerState } = this;
    let newControllerState;
    const interactionState = {};
    switch (event.srcEvent.code) {
      case "Minus":
        newControllerState = funcKey ? controllerState.zoomOut(zoomSpeed).zoomOut(zoomSpeed) : controllerState.zoomOut(zoomSpeed);
        interactionState.isZooming = true;
        break;
      case "Equal":
        newControllerState = funcKey ? controllerState.zoomIn(zoomSpeed).zoomIn(zoomSpeed) : controllerState.zoomIn(zoomSpeed);
        interactionState.isZooming = true;
        break;
      case "ArrowLeft":
        if (funcKey) {
          newControllerState = controllerState.rotateLeft(rotateSpeedX);
          interactionState.isRotating = true;
        } else {
          newControllerState = controllerState.moveLeft(moveSpeed);
          interactionState.isPanning = true;
        }
        break;
      case "ArrowRight":
        if (funcKey) {
          newControllerState = controllerState.rotateRight(rotateSpeedX);
          interactionState.isRotating = true;
        } else {
          newControllerState = controllerState.moveRight(moveSpeed);
          interactionState.isPanning = true;
        }
        break;
      case "ArrowUp":
        if (funcKey) {
          newControllerState = controllerState.rotateUp(rotateSpeedY);
          interactionState.isRotating = true;
        } else {
          newControllerState = controllerState.moveUp(moveSpeed);
          interactionState.isPanning = true;
        }
        break;
      case "ArrowDown":
        if (funcKey) {
          newControllerState = controllerState.rotateDown(rotateSpeedY);
          interactionState.isRotating = true;
        } else {
          newControllerState = controllerState.moveDown(moveSpeed);
          interactionState.isPanning = true;
        }
        break;
      default:
        return false;
    }
    this.updateViewport(newControllerState, this._getTransitionProps(), interactionState);
    return true;
  }
  _getTransitionProps(opts) {
    const { transition } = this;
    if (!transition || !transition.transitionInterpolator) {
      return NO_TRANSITION_PROPS;
    }
    return opts ? {
      ...transition,
      transitionInterpolator: new LinearInterpolator({
        ...opts,
        ...transition.transitionInterpolator.opts,
        makeViewport: this.controllerState.makeViewport
      })
    } : transition;
  }
};

// dist/controllers/view-state.js
var ViewState = class {
  constructor(props, state) {
    this._viewportProps = this.applyConstraints(props);
    this._state = state;
  }
  getViewportProps() {
    return this._viewportProps;
  }
  getState() {
    return this._state;
  }
};

// dist/controllers/map-controller.js
var import_web_mercator5 = require("@math.gl/web-mercator");
var PITCH_MOUSE_THRESHOLD = 5;
var PITCH_ACCEL = 1.2;
var MapState = class extends ViewState {
  constructor(options) {
    const {
      /** Mapbox viewport properties */
      /** The width of the viewport */
      width,
      /** The height of the viewport */
      height,
      /** The latitude at the center of the viewport */
      latitude,
      /** The longitude at the center of the viewport */
      longitude,
      /** The tile zoom level of the map. */
      zoom,
      /** The bearing of the viewport in degrees */
      bearing = 0,
      /** The pitch of the viewport in degrees */
      pitch = 0,
      /**
       * Specify the altitude of the viewport camera
       * Unit: map heights, default 1.5
       * Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137
       */
      altitude = 1.5,
      /** Viewport position */
      position = [0, 0, 0],
      /** Viewport constraints */
      maxZoom = 20,
      minZoom = 0,
      maxPitch = 60,
      minPitch = 0,
      /** Interaction states, required to calculate change during transform */
      /* The point on map being grabbed when the operation first started */
      startPanLngLat,
      /* Center of the zoom when the operation first started */
      startZoomLngLat,
      /* Pointer position when rotation started */
      startRotatePos,
      /** Bearing when current perspective rotate operation started */
      startBearing,
      /** Pitch when current perspective rotate operation started */
      startPitch,
      /** Zoom when current zoom operation started */
      startZoom,
      /** Normalize viewport props to fit map height into viewport */
      normalize = true
    } = options;
    assert(Number.isFinite(longitude));
    assert(Number.isFinite(latitude));
    assert(Number.isFinite(zoom));
    super({
      width,
      height,
      latitude,
      longitude,
      zoom,
      bearing,
      pitch,
      altitude,
      maxZoom,
      minZoom,
      maxPitch,
      minPitch,
      normalize,
      position
    }, {
      startPanLngLat,
      startZoomLngLat,
      startRotatePos,
      startBearing,
      startPitch,
      startZoom
    });
    this.makeViewport = options.makeViewport;
  }
  /**
   * Start panning
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  panStart({ pos }) {
    return this._getUpdatedState({
      startPanLngLat: this._unproject(pos)
    });
  }
  /**
   * Pan
   * @param {[Number, Number]} pos - position on screen where the pointer is
   * @param {[Number, Number], optional} startPos - where the pointer grabbed at
   *   the start of the operation. Must be supplied of `panStart()` was not called
   */
  pan({ pos, startPos }) {
    const startPanLngLat = this.getState().startPanLngLat || this._unproject(startPos);
    if (!startPanLngLat) {
      return this;
    }
    const viewport = this.makeViewport(this.getViewportProps());
    const newProps = viewport.panByPosition(startPanLngLat, pos);
    return this._getUpdatedState(newProps);
  }
  /**
   * End panning
   * Must call if `panStart()` was called
   */
  panEnd() {
    return this._getUpdatedState({
      startPanLngLat: null
    });
  }
  /**
   * Start rotating
   * @param {[Number, Number]} pos - position on screen where the center is
   */
  rotateStart({ pos }) {
    return this._getUpdatedState({
      startRotatePos: pos,
      startBearing: this.getViewportProps().bearing,
      startPitch: this.getViewportProps().pitch
    });
  }
  /**
   * Rotate
   * @param {[Number, Number]} pos - position on screen where the center is
   */
  rotate({ pos, deltaAngleX = 0, deltaAngleY = 0 }) {
    const { startRotatePos, startBearing, startPitch } = this.getState();
    if (!startRotatePos || startBearing === void 0 || startPitch === void 0) {
      return this;
    }
    let newRotation;
    if (pos) {
      newRotation = this._getNewRotation(pos, startRotatePos, startPitch, startBearing);
    } else {
      newRotation = {
        bearing: startBearing + deltaAngleX,
        pitch: startPitch + deltaAngleY
      };
    }
    return this._getUpdatedState(newRotation);
  }
  /**
   * End rotating
   * Must call if `rotateStart()` was called
   */
  rotateEnd() {
    return this._getUpdatedState({
      startBearing: null,
      startPitch: null
    });
  }
  /**
   * Start zooming
   * @param {[Number, Number]} pos - position on screen where the center is
   */
  zoomStart({ pos }) {
    return this._getUpdatedState({
      startZoomLngLat: this._unproject(pos),
      startZoom: this.getViewportProps().zoom
    });
  }
  /**
   * Zoom
   * @param {[Number, Number]} pos - position on screen where the current center is
   * @param {[Number, Number]} startPos - the center position at
   *   the start of the operation. Must be supplied of `zoomStart()` was not called
   * @param {Number} scale - a number between [0, 1] specifying the accumulated
   *   relative scale.
   */
  zoom({ pos, startPos, scale }) {
    let { startZoom, startZoomLngLat } = this.getState();
    if (!startZoomLngLat) {
      startZoom = this.getViewportProps().zoom;
      startZoomLngLat = this._unproject(startPos) || this._unproject(pos);
    }
    if (!startZoomLngLat) {
      return this;
    }
    const { maxZoom, minZoom } = this.getViewportProps();
    let zoom = startZoom + Math.log2(scale);
    zoom = (0, import_core13.clamp)(zoom, minZoom, maxZoom);
    const zoomedViewport = this.makeViewport({ ...this.getViewportProps(), zoom });
    return this._getUpdatedState({
      zoom,
      ...zoomedViewport.panByPosition(startZoomLngLat, pos)
    });
  }
  /**
   * End zooming
   * Must call if `zoomStart()` was called
   */
  zoomEnd() {
    return this._getUpdatedState({
      startZoomLngLat: null,
      startZoom: null
    });
  }
  zoomIn(speed = 2) {
    return this._zoomFromCenter(speed);
  }
  zoomOut(speed = 2) {
    return this._zoomFromCenter(1 / speed);
  }
  moveLeft(speed = 100) {
    return this._panFromCenter([speed, 0]);
  }
  moveRight(speed = 100) {
    return this._panFromCenter([-speed, 0]);
  }
  moveUp(speed = 100) {
    return this._panFromCenter([0, speed]);
  }
  moveDown(speed = 100) {
    return this._panFromCenter([0, -speed]);
  }
  rotateLeft(speed = 15) {
    return this._getUpdatedState({
      bearing: this.getViewportProps().bearing - speed
    });
  }
  rotateRight(speed = 15) {
    return this._getUpdatedState({
      bearing: this.getViewportProps().bearing + speed
    });
  }
  rotateUp(speed = 10) {
    return this._getUpdatedState({
      pitch: this.getViewportProps().pitch + speed
    });
  }
  rotateDown(speed = 10) {
    return this._getUpdatedState({
      pitch: this.getViewportProps().pitch - speed
    });
  }
  shortestPathFrom(viewState) {
    const fromProps = viewState.getViewportProps();
    const props = { ...this.getViewportProps() };
    const { bearing, longitude } = props;
    if (Math.abs(bearing - fromProps.bearing) > 180) {
      props.bearing = bearing < 0 ? bearing + 360 : bearing - 360;
    }
    if (Math.abs(longitude - fromProps.longitude) > 180) {
      props.longitude = longitude < 0 ? longitude + 360 : longitude - 360;
    }
    return props;
  }
  // Apply any constraints (mathematical or defined by _viewportProps) to map state
  applyConstraints(props) {
    const { maxZoom, minZoom, zoom } = props;
    props.zoom = (0, import_core13.clamp)(zoom, minZoom, maxZoom);
    const { maxPitch, minPitch, pitch } = props;
    props.pitch = (0, import_core13.clamp)(pitch, minPitch, maxPitch);
    const { normalize = true } = props;
    if (normalize) {
      Object.assign(props, (0, import_web_mercator5.normalizeViewportProps)(props));
    }
    return props;
  }
  /* Private methods */
  _zoomFromCenter(scale) {
    const { width, height } = this.getViewportProps();
    return this.zoom({
      pos: [width / 2, height / 2],
      scale
    });
  }
  _panFromCenter(offset) {
    const { width, height } = this.getViewportProps();
    return this.pan({
      startPos: [width / 2, height / 2],
      pos: [width / 2 + offset[0], height / 2 + offset[1]]
    });
  }
  _getUpdatedState(newProps) {
    return new this.constructor({
      makeViewport: this.makeViewport,
      ...this.getViewportProps(),
      ...this.getState(),
      ...newProps
    });
  }
  _unproject(pos) {
    const viewport = this.makeViewport(this.getViewportProps());
    return pos && viewport.unproject(pos);
  }
  _getNewRotation(pos, startPos, startPitch, startBearing) {
    const deltaX = pos[0] - startPos[0];
    const deltaY = pos[1] - startPos[1];
    const centerY = pos[1];
    const startY = startPos[1];
    const { width, height } = this.getViewportProps();
    const deltaScaleX = deltaX / width;
    let deltaScaleY = 0;
    if (deltaY > 0) {
      if (Math.abs(height - startY) > PITCH_MOUSE_THRESHOLD) {
        deltaScaleY = deltaY / (startY - height) * PITCH_ACCEL;
      }
    } else if (deltaY < 0) {
      if (startY > PITCH_MOUSE_THRESHOLD) {
        deltaScaleY = 1 - centerY / startY;
      }
    }
    deltaScaleY = (0, import_core13.clamp)(deltaScaleY, -1, 1);
    const { minPitch, maxPitch } = this.getViewportProps();
    const bearing = startBearing + 180 * deltaScaleX;
    let pitch = startPitch;
    if (deltaScaleY > 0) {
      pitch = startPitch + deltaScaleY * (maxPitch - startPitch);
    } else if (deltaScaleY < 0) {
      pitch = startPitch - deltaScaleY * (minPitch - startPitch);
    }
    return {
      pitch,
      bearing
    };
  }
};
var MapController = class extends Controller {
  constructor() {
    super(...arguments);
    this.ControllerState = MapState;
    this.transition = {
      transitionDuration: 300,
      transitionInterpolator: new LinearInterpolator({
        transitionProps: {
          compare: ["longitude", "latitude", "zoom", "bearing", "pitch", "position"],
          required: ["longitude", "latitude", "zoom"]
        }
      })
    };
    this.dragMode = "pan";
  }
  setProps(props) {
    props.position = props.position || [0, 0, 0];
    const oldProps = this.props;
    super.setProps(props);
    const dimensionChanged = !oldProps || oldProps.height !== props.height;
    if (dimensionChanged) {
      this.updateViewport(new this.ControllerState({
        makeViewport: this.makeViewport,
        ...props,
        ...this.state
      }));
    }
  }
};

// dist/views/map-view.js
var MapView = class extends View {
  constructor(props = {}) {
    super(props);
  }
  getViewportType() {
    return web_mercator_viewport_default;
  }
  get ControllerType() {
    return MapController;
  }
};
MapView.displayName = "MapView";
var map_view_default = MapView;

// dist/lib/effect-manager.js
var DEFAULT_LIGHTING_EFFECT = new LightingEffect();
function compareEffects(e1, e2) {
  const o1 = e1.order ?? Infinity;
  const o2 = e2.order ?? Infinity;
  return o1 - o2;
}
var EffectManager = class {
  constructor(context) {
    this._resolvedEffects = [];
    this._defaultEffects = [];
    this.effects = [];
    this._context = context;
    this._needsRedraw = "Initial render";
    this._setEffects([]);
  }
  /**
   * Register a new default effect, i.e. an effect presents regardless of user supplied props.effects
   */
  addDefaultEffect(effect) {
    const defaultEffects = this._defaultEffects;
    if (!defaultEffects.find((e) => e.id === effect.id)) {
      const index = defaultEffects.findIndex((e) => compareEffects(e, effect) > 0);
      if (index < 0) {
        defaultEffects.push(effect);
      } else {
        defaultEffects.splice(index, 0, effect);
      }
      effect.setup(this._context);
      this._setEffects(this.effects);
    }
  }
  setProps(props) {
    if ("effects" in props) {
      if (!deepEqual(props.effects, this.effects, 1)) {
        this._setEffects(props.effects);
      }
    }
  }
  needsRedraw(opts = { clearRedrawFlags: false }) {
    const redraw = this._needsRedraw;
    if (opts.clearRedrawFlags) {
      this._needsRedraw = false;
    }
    return redraw;
  }
  getEffects() {
    return this._resolvedEffects;
  }
  _setEffects(effects) {
    const oldEffectsMap = {};
    for (const effect of this.effects) {
      oldEffectsMap[effect.id] = effect;
    }
    const nextEffects = [];
    for (const effect of effects) {
      const oldEffect = oldEffectsMap[effect.id];
      let effectToAdd = effect;
      if (oldEffect && oldEffect !== effect) {
        if (oldEffect.setProps) {
          oldEffect.setProps(effect.props);
          effectToAdd = oldEffect;
        } else {
          oldEffect.cleanup(this._context);
        }
      } else if (!oldEffect) {
        effect.setup(this._context);
      }
      nextEffects.push(effectToAdd);
      delete oldEffectsMap[effect.id];
    }
    for (const removedEffectId in oldEffectsMap) {
      oldEffectsMap[removedEffectId].cleanup(this._context);
    }
    this.effects = nextEffects;
    this._resolvedEffects = nextEffects.concat(this._defaultEffects);
    if (!effects.some((effect) => effect instanceof LightingEffect)) {
      this._resolvedEffects.push(DEFAULT_LIGHTING_EFFECT);
    }
    this._needsRedraw = "effects changed";
  }
  finalize() {
    for (const effect of this._resolvedEffects) {
      effect.cleanup(this._context);
    }
    this.effects.length = 0;
    this._resolvedEffects.length = 0;
    this._defaultEffects.length = 0;
  }
};

// dist/passes/draw-layers-pass.js
var DrawLayersPass = class extends LayersPass {
  shouldDrawLayer(layer) {
    const { operation } = layer.props;
    return operation.includes("draw") || operation.includes("terrain");
  }
};

// dist/lib/deck-renderer.js
var TRACE_RENDER_LAYERS = "deckRenderer.renderLayers";
var DeckRenderer = class {
  constructor(device) {
    this.device = device;
    this.layerFilter = null;
    this.drawPickingColors = false;
    this.drawLayersPass = new DrawLayersPass(device);
    this.pickLayersPass = new PickLayersPass(device);
    this.renderCount = 0;
    this._needsRedraw = "Initial render";
    this.renderBuffers = [];
    this.lastPostProcessEffect = null;
  }
  setProps(props) {
    if (this.layerFilter !== props.layerFilter) {
      this.layerFilter = props.layerFilter;
      this._needsRedraw = "layerFilter changed";
    }
    if (this.drawPickingColors !== props.drawPickingColors) {
      this.drawPickingColors = props.drawPickingColors;
      this._needsRedraw = "drawPickingColors changed";
    }
  }
  renderLayers(opts) {
    if (!opts.viewports.length) {
      return;
    }
    const layerPass = this.drawPickingColors ? this.pickLayersPass : this.drawLayersPass;
    const renderOpts = {
      layerFilter: this.layerFilter,
      isPicking: this.drawPickingColors,
      ...opts
    };
    if (renderOpts.effects) {
      this._preRender(renderOpts.effects, renderOpts);
    }
    const outputBuffer = this.lastPostProcessEffect ? this.renderBuffers[0] : renderOpts.target;
    if (this.lastPostProcessEffect) {
      renderOpts.clearColor = [0, 0, 0, 0];
      renderOpts.clearCanvas = true;
    }
    const renderStats = layerPass.render({ ...renderOpts, target: outputBuffer });
    if (renderOpts.effects) {
      this._postRender(renderOpts.effects, renderOpts);
    }
    this.renderCount++;
    debug(TRACE_RENDER_LAYERS, this, renderStats, opts);
  }
  needsRedraw(opts = { clearRedrawFlags: false }) {
    const redraw = this._needsRedraw;
    if (opts.clearRedrawFlags) {
      this._needsRedraw = false;
    }
    return redraw;
  }
  finalize() {
    const { renderBuffers } = this;
    for (const buffer of renderBuffers) {
      buffer.delete();
    }
    renderBuffers.length = 0;
  }
  _preRender(effects, opts) {
    this.lastPostProcessEffect = null;
    opts.preRenderStats = opts.preRenderStats || {};
    for (const effect of effects) {
      opts.preRenderStats[effect.id] = effect.preRender(opts);
      if (effect.postRender) {
        this.lastPostProcessEffect = effect.id;
      }
    }
    if (this.lastPostProcessEffect) {
      this._resizeRenderBuffers();
    }
  }
  _resizeRenderBuffers() {
    const { renderBuffers } = this;
    const size = this.device.canvasContext.getDrawingBufferSize();
    if (renderBuffers.length === 0) {
      [0, 1].map((i) => {
        const texture = this.device.createTexture({
          sampler: { minFilter: "linear", magFilter: "linear" }
        });
        renderBuffers.push(this.device.createFramebuffer({
          id: `deck-renderbuffer-${i}`,
          colorAttachments: [texture]
        }));
      });
    }
    for (const buffer of renderBuffers) {
      buffer.resize(size);
    }
  }
  _postRender(effects, opts) {
    const { renderBuffers } = this;
    const params = {
      ...opts,
      inputBuffer: renderBuffers[0],
      swapBuffer: renderBuffers[1]
    };
    for (const effect of effects) {
      if (effect.postRender) {
        params.target = effect.id === this.lastPostProcessEffect ? opts.target : void 0;
        const buffer = effect.postRender(params);
        params.inputBuffer = buffer;
        params.swapBuffer = buffer === renderBuffers[0] ? renderBuffers[1] : renderBuffers[0];
      }
    }
  }
};

// dist/lib/picking/query-object.js
var NO_PICKED_OBJECT = {
  pickedColor: null,
  pickedObjectIndex: -1
};
function getClosestObject({ pickedColors, decodePickingColor, deviceX, deviceY, deviceRadius, deviceRect }) {
  const { x, y, width, height } = deviceRect;
  let minSquareDistanceToCenter = deviceRadius * deviceRadius;
  let closestPixelIndex = -1;
  let i = 0;
  for (let row = 0; row < height; row++) {
    const dy = row + y - deviceY;
    const dy2 = dy * dy;
    if (dy2 > minSquareDistanceToCenter) {
      i += 4 * width;
    } else {
      for (let col = 0; col < width; col++) {
        const pickedLayerIndex = pickedColors[i + 3] - 1;
        if (pickedLayerIndex >= 0) {
          const dx = col + x - deviceX;
          const d2 = dx * dx + dy2;
          if (d2 <= minSquareDistanceToCenter) {
            minSquareDistanceToCenter = d2;
            closestPixelIndex = i;
          }
        }
        i += 4;
      }
    }
  }
  if (closestPixelIndex >= 0) {
    const pickedColor = pickedColors.slice(closestPixelIndex, closestPixelIndex + 4);
    const pickedObject = decodePickingColor(pickedColor);
    if (pickedObject) {
      const dy = Math.floor(closestPixelIndex / 4 / width);
      const dx = closestPixelIndex / 4 - dy * width;
      return {
        ...pickedObject,
        pickedColor,
        pickedX: x + dx,
        pickedY: y + dy
      };
    }
    log_default.error("Picked non-existent layer. Is picking buffer corrupt?")();
  }
  return NO_PICKED_OBJECT;
}
function getUniqueObjects({ pickedColors, decodePickingColor }) {
  const uniqueColors = /* @__PURE__ */ new Map();
  if (pickedColors) {
    for (let i = 0; i < pickedColors.length; i += 4) {
      const pickedLayerIndex = pickedColors[i + 3] - 1;
      if (pickedLayerIndex >= 0) {
        const pickedColor = pickedColors.slice(i, i + 4);
        const colorKey = pickedColor.join(",");
        if (!uniqueColors.has(colorKey)) {
          const pickedObject = decodePickingColor(pickedColor);
          if (pickedObject) {
            uniqueColors.set(colorKey, {
              ...pickedObject,
              color: pickedColor
            });
          } else {
            log_default.error("Picked non-existent layer. Is picking buffer corrupt?")();
          }
        }
      }
    }
  }
  return Array.from(uniqueColors.values());
}

// dist/lib/picking/pick-info.js
function getEmptyPickingInfo({ pickInfo, viewports, pixelRatio, x, y, z }) {
  let pickedViewport = viewports[0];
  if (viewports.length > 1) {
    pickedViewport = getViewportFromCoordinates((pickInfo == null ? void 0 : pickInfo.pickedViewports) || viewports, { x, y });
  }
  let coordinate;
  if (pickedViewport) {
    const point = [x - pickedViewport.x, y - pickedViewport.y];
    if (z !== void 0) {
      point[2] = z;
    }
    coordinate = pickedViewport.unproject(point);
  }
  return {
    color: null,
    layer: null,
    viewport: pickedViewport,
    index: -1,
    picked: false,
    x,
    y,
    pixel: [x, y],
    coordinate,
    devicePixel: pickInfo && "pickedX" in pickInfo ? [pickInfo.pickedX, pickInfo.pickedY] : void 0,
    pixelRatio
  };
}
function processPickInfo(opts) {
  const { pickInfo, lastPickedInfo, mode, layers } = opts;
  const { pickedColor, pickedLayer, pickedObjectIndex } = pickInfo;
  const affectedLayers = pickedLayer ? [pickedLayer] : [];
  if (mode === "hover") {
    const lastPickedPixelIndex = lastPickedInfo.index;
    const lastPickedLayerId = lastPickedInfo.layerId;
    const pickedLayerId = pickedLayer ? pickedLayer.props.id : null;
    if (pickedLayerId !== lastPickedLayerId || pickedObjectIndex !== lastPickedPixelIndex) {
      if (pickedLayerId !== lastPickedLayerId) {
        const lastPickedLayer = layers.find((layer) => layer.props.id === lastPickedLayerId);
        if (lastPickedLayer) {
          affectedLayers.unshift(lastPickedLayer);
        }
      }
      lastPickedInfo.layerId = pickedLayerId;
      lastPickedInfo.index = pickedObjectIndex;
      lastPickedInfo.info = null;
    }
  }
  const baseInfo = getEmptyPickingInfo(opts);
  const infos = /* @__PURE__ */ new Map();
  infos.set(null, baseInfo);
  affectedLayers.forEach((layer) => {
    let info = { ...baseInfo };
    if (layer === pickedLayer) {
      info.color = pickedColor;
      info.index = pickedObjectIndex;
      info.picked = true;
    }
    info = getLayerPickingInfo({ layer, info, mode });
    const rootLayer = info.layer;
    if (layer === pickedLayer && mode === "hover") {
      lastPickedInfo.info = info;
    }
    infos.set(rootLayer.id, info);
    if (mode === "hover") {
      rootLayer.updateAutoHighlight(info);
    }
  });
  return infos;
}
function getLayerPickingInfo({ layer, info, mode }) {
  while (layer && info) {
    const sourceLayer = info.layer || null;
    info.sourceLayer = sourceLayer;
    info.layer = layer;
    info = layer.getPickingInfo({ info, mode, sourceLayer });
    layer = layer.parent;
  }
  return info;
}
function getViewportFromCoordinates(viewports, pixel) {
  for (let i = viewports.length - 1; i >= 0; i--) {
    const viewport = viewports[i];
    if (viewport.containsPixel(pixel)) {
      return viewport;
    }
  }
  return viewports[0];
}

// dist/lib/deck-picker.js
var DeckPicker = class {
  constructor(device) {
    this._pickable = true;
    this.device = device;
    this.pickLayersPass = new PickLayersPass(device);
    this.lastPickedInfo = {
      index: -1,
      layerId: null,
      info: null
    };
  }
  setProps(props) {
    if ("layerFilter" in props) {
      this.layerFilter = props.layerFilter;
    }
    if ("_pickable" in props) {
      this._pickable = props._pickable;
    }
  }
  finalize() {
    if (this.pickingFBO) {
      this.pickingFBO.destroy();
    }
    if (this.depthFBO) {
      this.depthFBO.destroy();
    }
  }
  /** Pick the closest info at given coordinate */
  pickObject(opts) {
    return this._pickClosestObject(opts);
  }
  /** Get all unique infos within a bounding box */
  pickObjects(opts) {
    return this._pickVisibleObjects(opts);
  }
  // Returns a new picking info object by assuming the last picked object is still picked
  getLastPickedObject({ x, y, layers, viewports }, lastPickedInfo = this.lastPickedInfo.info) {
    const lastPickedLayerId = lastPickedInfo && lastPickedInfo.layer && lastPickedInfo.layer.id;
    const lastPickedViewportId = lastPickedInfo && lastPickedInfo.viewport && lastPickedInfo.viewport.id;
    const layer = lastPickedLayerId ? layers.find((l) => l.id === lastPickedLayerId) : null;
    const viewport = lastPickedViewportId && viewports.find((v) => v.id === lastPickedViewportId) || viewports[0];
    const coordinate = viewport && viewport.unproject([x - viewport.x, y - viewport.y]);
    const info = {
      x,
      y,
      viewport,
      coordinate,
      layer
    };
    return { ...lastPickedInfo, ...info };
  }
  // Private
  /** Ensures that picking framebuffer exists and matches the canvas size */
  _resizeBuffer() {
    var _a, _b;
    if (!this.pickingFBO) {
      this.pickingFBO = this.device.createFramebuffer({
        colorAttachments: ["rgba8unorm"],
        depthStencilAttachment: "depth16unorm"
      });
      if (this.device.isTextureFormatRenderable("rgba32float")) {
        const depthFBO = this.device.createFramebuffer({
          colorAttachments: ["rgba32float"],
          depthStencilAttachment: "depth16unorm"
        });
        this.depthFBO = depthFBO;
      }
    }
    const { canvas } = this.device.getDefaultCanvasContext();
    (_a = this.pickingFBO) == null ? void 0 : _a.resize({ width: canvas.width, height: canvas.height });
    (_b = this.depthFBO) == null ? void 0 : _b.resize({ width: canvas.width, height: canvas.height });
  }
  /** Preliminary filtering of the layers list. Skid picking pass if no layer is pickable. */
  _getPickable(layers) {
    if (this._pickable === false) {
      return null;
    }
    const pickableLayers = layers.filter((layer) => this.pickLayersPass.shouldDrawLayer(layer) && !layer.isComposite);
    return pickableLayers.length ? pickableLayers : null;
  }
  /** Pick the closest object at the given coordinate */
  // eslint-disable-next-line max-statements,complexity
  _pickClosestObject({ layers, views, viewports, x, y, radius = 0, depth = 1, mode = "query", unproject3D, onViewportActive, effects }) {
    const pixelRatio = this.device.canvasContext.cssToDeviceRatio();
    const pickableLayers = this._getPickable(layers);
    if (!pickableLayers || viewports.length === 0) {
      return {
        result: [],
        emptyInfo: getEmptyPickingInfo({ viewports, x, y, pixelRatio })
      };
    }
    this._resizeBuffer();
    const devicePixelRange = this.device.canvasContext.cssToDevicePixels([x, y], true);
    const devicePixel = [
      devicePixelRange.x + Math.floor(devicePixelRange.width / 2),
      devicePixelRange.y + Math.floor(devicePixelRange.height / 2)
    ];
    const deviceRadius = Math.round(radius * pixelRatio);
    const { width, height } = this.pickingFBO;
    const deviceRect = this._getPickingRect({
      deviceX: devicePixel[0],
      deviceY: devicePixel[1],
      deviceRadius,
      deviceWidth: width,
      deviceHeight: height
    });
    const cullRect = {
      x: x - radius,
      y: y - radius,
      width: radius * 2 + 1,
      height: radius * 2 + 1
    };
    let infos;
    const result = [];
    const affectedLayers = /* @__PURE__ */ new Set();
    for (let i = 0; i < depth; i++) {
      let pickInfo;
      if (deviceRect) {
        const pickedResult = this._drawAndSample({
          layers: pickableLayers,
          views,
          viewports,
          onViewportActive,
          deviceRect,
          cullRect,
          effects,
          pass: `picking:${mode}`
        });
        pickInfo = getClosestObject({
          ...pickedResult,
          deviceX: devicePixel[0],
          deviceY: devicePixel[1],
          deviceRadius,
          deviceRect
        });
      } else {
        pickInfo = {
          pickedColor: null,
          pickedObjectIndex: -1
        };
      }
      let z;
      if (pickInfo.pickedLayer && unproject3D && this.depthFBO) {
        const { pickedColors: pickedColors2 } = this._drawAndSample({
          layers: [pickInfo.pickedLayer],
          views,
          viewports,
          onViewportActive,
          deviceRect: {
            x: pickInfo.pickedX,
            y: pickInfo.pickedY,
            width: 1,
            height: 1
          },
          cullRect,
          effects,
          pass: `picking:${mode}:z`
        }, true);
        if (pickedColors2[3]) {
          z = pickedColors2[0];
        }
      }
      if (pickInfo.pickedLayer && i + 1 < depth) {
        affectedLayers.add(pickInfo.pickedLayer);
        pickInfo.pickedLayer.disablePickingIndex(pickInfo.pickedObjectIndex);
      }
      infos = processPickInfo({
        pickInfo,
        lastPickedInfo: this.lastPickedInfo,
        mode,
        layers: pickableLayers,
        viewports,
        x,
        y,
        z,
        pixelRatio
      });
      for (const info of infos.values()) {
        if (info.layer) {
          result.push(info);
        }
      }
      if (!pickInfo.pickedColor) {
        break;
      }
    }
    for (const layer of affectedLayers) {
      layer.restorePickingColors();
    }
    return { result, emptyInfo: infos.get(null) };
  }
  /** Pick all objects within the given bounding box */
  _pickVisibleObjects({ layers, views, viewports, x, y, width = 1, height = 1, mode = "query", maxObjects = null, onViewportActive, effects }) {
    const pickableLayers = this._getPickable(layers);
    if (!pickableLayers || viewports.length === 0) {
      return [];
    }
    this._resizeBuffer();
    const pixelRatio = this.device.canvasContext.cssToDeviceRatio();
    const leftTop = this.device.canvasContext.cssToDevicePixels([x, y], true);
    const deviceLeft = leftTop.x;
    const deviceTop = leftTop.y + leftTop.height;
    const rightBottom = this.device.canvasContext.cssToDevicePixels([x + width, y + height], true);
    const deviceRight = rightBottom.x + rightBottom.width;
    const deviceBottom = rightBottom.y;
    const deviceRect = {
      x: deviceLeft,
      y: deviceBottom,
      // deviceTop and deviceRight represent the first pixel outside the desired rect
      width: deviceRight - deviceLeft,
      height: deviceTop - deviceBottom
    };
    const pickedResult = this._drawAndSample({
      layers: pickableLayers,
      views,
      viewports,
      onViewportActive,
      deviceRect,
      cullRect: { x, y, width, height },
      effects,
      pass: `picking:${mode}`
    });
    const pickInfos = getUniqueObjects(pickedResult);
    const uniquePickedObjects = /* @__PURE__ */ new Map();
    const uniqueInfos = [];
    const limitMaxObjects = Number.isFinite(maxObjects);
    for (let i = 0; i < pickInfos.length; i++) {
      if (limitMaxObjects && uniqueInfos.length >= maxObjects) {
        break;
      }
      const pickInfo = pickInfos[i];
      let info = {
        color: pickInfo.pickedColor,
        layer: null,
        index: pickInfo.pickedObjectIndex,
        picked: true,
        x,
        y,
        pixelRatio
      };
      info = getLayerPickingInfo({ layer: pickInfo.pickedLayer, info, mode });
      const pickedLayerId = info.layer.id;
      if (!uniquePickedObjects.has(pickedLayerId)) {
        uniquePickedObjects.set(pickedLayerId, /* @__PURE__ */ new Set());
      }
      const uniqueObjectsInLayer = uniquePickedObjects.get(pickedLayerId);
      const pickedObjectKey = info.object ?? info.index;
      if (!uniqueObjectsInLayer.has(pickedObjectKey)) {
        uniqueObjectsInLayer.add(pickedObjectKey);
        uniqueInfos.push(info);
      }
    }
    return uniqueInfos;
  }
  _drawAndSample({ layers, views, viewports, onViewportActive, deviceRect, cullRect, effects, pass }, pickZ = false) {
    const pickingFBO = pickZ ? this.depthFBO : this.pickingFBO;
    const opts = {
      layers,
      layerFilter: this.layerFilter,
      views,
      viewports,
      onViewportActive,
      pickingFBO,
      deviceRect,
      cullRect,
      effects,
      pass,
      pickZ,
      preRenderStats: {}
    };
    for (const effect of effects) {
      if (effect.useInPicking) {
        opts.preRenderStats[effect.id] = effect.preRender(opts);
      }
    }
    const { decodePickingColor } = this.pickLayersPass.render(opts);
    const { x, y, width, height } = deviceRect;
    const pickedColors = new (pickZ ? Float32Array : Uint8Array)(width * height * 4);
    this.device.readPixelsToArrayWebGL(pickingFBO, {
      sourceX: x,
      sourceY: y,
      sourceWidth: width,
      sourceHeight: height,
      target: pickedColors
    });
    return { pickedColors, decodePickingColor };
  }
  // Calculate a picking rect centered on deviceX and deviceY and clipped to device
  // Returns null if pixel is outside of device
  _getPickingRect({ deviceX, deviceY, deviceRadius, deviceWidth, deviceHeight }) {
    const x = Math.max(0, deviceX - deviceRadius);
    const y = Math.max(0, deviceY - deviceRadius);
    const width = Math.min(deviceWidth, deviceX + deviceRadius + 1) - x;
    const height = Math.min(deviceHeight, deviceY + deviceRadius + 1) - y;
    if (width <= 0 || height <= 0) {
      return null;
    }
    return { x, y, width, height };
  }
};

// dist/lib/widget-manager.js
var PLACEMENTS = {
  "top-left": { top: 0, left: 0 },
  "top-right": { top: 0, right: 0 },
  "bottom-left": { bottom: 0, left: 0 },
  "bottom-right": { bottom: 0, right: 0 },
  fill: { top: 0, left: 0, bottom: 0, right: 0 }
};
var DEFAULT_PLACEMENT = "top-left";
var ROOT_CONTAINER_ID = "__root";
var WidgetManager = class {
  constructor({ deck, parentElement }) {
    this.defaultWidgets = [];
    this.widgets = [];
    this.resolvedWidgets = [];
    this.containers = {};
    this.lastViewports = {};
    this.deck = deck;
    this.parentElement = parentElement;
  }
  getWidgets() {
    return this.resolvedWidgets;
  }
  /** Declarative API to configure widgets */
  setProps(props) {
    if (props.widgets && !deepEqual(props.widgets, this.widgets, 1)) {
      this._setWidgets(props.widgets);
    }
  }
  finalize() {
    for (const widget of this.getWidgets()) {
      this._remove(widget);
    }
    this.defaultWidgets.length = 0;
    this.resolvedWidgets.length = 0;
    for (const id in this.containers) {
      this.containers[id].remove();
    }
  }
  /** Imperative API. Widgets added this way are not affected by the declarative prop. */
  addDefault(widget) {
    if (!this.defaultWidgets.find((w) => w.id === widget.id)) {
      this._add(widget);
      this.defaultWidgets.push(widget);
      this._setWidgets(this.widgets);
    }
  }
  /** Resolve widgets from the declarative prop */
  _setWidgets(nextWidgets) {
    const oldWidgetMap = {};
    for (const widget of this.resolvedWidgets) {
      oldWidgetMap[widget.id] = widget;
    }
    this.resolvedWidgets.length = 0;
    for (const widget of this.defaultWidgets) {
      oldWidgetMap[widget.id] = null;
      this.resolvedWidgets.push(widget);
    }
    for (let widget of nextWidgets) {
      const oldWidget = oldWidgetMap[widget.id];
      if (!oldWidget) {
        this._add(widget);
      } else if (
        // Widget placement changed
        oldWidget.viewId !== widget.viewId || oldWidget.placement !== widget.placement
      ) {
        this._remove(oldWidget);
        this._add(widget);
      } else if (widget !== oldWidget) {
        oldWidget.setProps(widget.props);
        widget = oldWidget;
      }
      oldWidgetMap[widget.id] = null;
      this.resolvedWidgets.push(widget);
    }
    for (const id in oldWidgetMap) {
      const oldWidget = oldWidgetMap[id];
      if (oldWidget) {
        this._remove(oldWidget);
      }
    }
    this.widgets = nextWidgets;
  }
  _add(widget) {
    const { viewId = null, placement = DEFAULT_PLACEMENT } = widget;
    const element = widget.onAdd({ deck: this.deck, viewId });
    if (element) {
      this._getContainer(viewId, placement).append(element);
    }
    widget._element = element;
  }
  _remove(widget) {
    var _a;
    (_a = widget.onRemove) == null ? void 0 : _a.call(widget);
    if (widget._element) {
      widget._element.remove();
    }
    widget._element = void 0;
  }
  /* global document */
  _getContainer(viewId, placement) {
    var _a;
    const containerId = viewId || ROOT_CONTAINER_ID;
    let viewContainer = this.containers[containerId];
    if (!viewContainer) {
      viewContainer = document.createElement("div");
      viewContainer.style.pointerEvents = "none";
      viewContainer.style.position = "absolute";
      viewContainer.style.overflow = "hidden";
      (_a = this.parentElement) == null ? void 0 : _a.append(viewContainer);
      this.containers[containerId] = viewContainer;
    }
    let container = viewContainer.querySelector(`.${placement}`);
    if (!container) {
      container = document.createElement("div");
      container.className = placement;
      container.style.position = "absolute";
      container.style.zIndex = "2";
      Object.assign(container.style, PLACEMENTS[placement]);
      viewContainer.append(container);
    }
    return container;
  }
  _updateContainers() {
    const canvasWidth = this.deck.width;
    const canvasHeight = this.deck.height;
    for (const id in this.containers) {
      const viewport = this.lastViewports[id] || null;
      const visible = id === ROOT_CONTAINER_ID || viewport;
      const container = this.containers[id];
      if (visible) {
        container.style.display = "block";
        container.style.left = `${viewport ? viewport.x : 0}px`;
        container.style.top = `${viewport ? viewport.y : 0}px`;
        container.style.width = `${viewport ? viewport.width : canvasWidth}px`;
        container.style.height = `${viewport ? viewport.height : canvasHeight}px`;
      } else {
        container.style.display = "none";
      }
    }
  }
  onRedraw({ viewports, layers }) {
    var _a, _b;
    const viewportsById = viewports.reduce((acc, v) => {
      acc[v.id] = v;
      return acc;
    }, {});
    for (const widget of this.getWidgets()) {
      const { viewId } = widget;
      if (viewId) {
        const viewport = viewportsById[viewId];
        if (viewport) {
          if (widget.onViewportChange) {
            widget.onViewportChange(viewport);
          }
          (_a = widget.onRedraw) == null ? void 0 : _a.call(widget, { viewports: [viewport], layers });
        }
      } else {
        if (widget.onViewportChange) {
          for (const viewport of viewports) {
            widget.onViewportChange(viewport);
          }
        }
        (_b = widget.onRedraw) == null ? void 0 : _b.call(widget, { viewports, layers });
      }
    }
    this.lastViewports = viewportsById;
    this._updateContainers();
  }
  onHover(info, event) {
    var _a, _b;
    for (const widget of this.getWidgets()) {
      const { viewId } = widget;
      if (!viewId || viewId === ((_a = info.viewport) == null ? void 0 : _a.id)) {
        (_b = widget.onHover) == null ? void 0 : _b.call(widget, info, event);
      }
    }
  }
  onEvent(info, event) {
    var _a, _b;
    const eventHandlerProp = EVENT_HANDLERS[event.type];
    if (!eventHandlerProp) {
      return;
    }
    for (const widget of this.getWidgets()) {
      const { viewId } = widget;
      if (!viewId || viewId === ((_a = info.viewport) == null ? void 0 : _a.id)) {
        (_b = widget[eventHandlerProp]) == null ? void 0 : _b.call(widget, info, event);
      }
    }
  }
};

// dist/lib/tooltip.js
var defaultStyle = {
  zIndex: "1",
  position: "absolute",
  pointerEvents: "none",
  color: "#a0a7b4",
  backgroundColor: "#29323c",
  padding: "10px",
  top: "0",
  left: "0",
  display: "none"
};
var Tooltip = class {
  constructor() {
    this.id = "default-tooltip";
    this.placement = "fill";
    this.props = {};
    this.isVisible = false;
  }
  onAdd({ deck }) {
    const el = document.createElement("div");
    el.className = "deck-tooltip";
    Object.assign(el.style, defaultStyle);
    this.deck = deck;
    this.element = el;
    return el;
  }
  onRemove() {
    this.deck = void 0;
    this.element = void 0;
  }
  setProps() {
  }
  onViewportChange(viewport) {
    var _a;
    if (this.isVisible && viewport.id === ((_a = this.lastViewport) == null ? void 0 : _a.id) && viewport !== this.lastViewport) {
      this.setTooltip(null);
    }
  }
  onHover(info) {
    const { deck } = this;
    const getTooltip = deck && deck.props.getTooltip;
    if (!getTooltip) {
      return;
    }
    const displayInfo = getTooltip(info);
    this.lastViewport = info.viewport;
    this.setTooltip(displayInfo, info.x, info.y);
  }
  setTooltip(displayInfo, x, y) {
    const el = this.element;
    if (!el) {
      return;
    }
    if (typeof displayInfo === "string") {
      el.innerText = displayInfo;
    } else if (!displayInfo) {
      this.isVisible = false;
      el.style.display = "none";
      return;
    } else {
      if (displayInfo.text) {
        el.innerText = displayInfo.text;
      }
      if (displayInfo.html) {
        el.innerHTML = displayInfo.html;
      }
      if (displayInfo.className) {
        el.className = displayInfo.className;
      }
    }
    this.isVisible = true;
    el.style.display = "block";
    el.style.transform = `translate(${x}px, ${y}px)`;
    if (displayInfo && typeof displayInfo === "object" && "style" in displayInfo) {
      Object.assign(el.style, displayInfo.style);
    }
  }
};

// dist/lib/deck.js
var import_core14 = require("@luma.gl/core");
var import_webgl = require("@luma.gl/webgl");
var import_engine3 = require("@luma.gl/engine");
var import_engine4 = require("@luma.gl/engine");
var import_constants9 = require("@luma.gl/constants");
var import_stats2 = require("@probe.gl/stats");
var import_mjolnir2 = require("mjolnir.js");
function noop2() {
}
var getCursor = ({ isDragging }) => isDragging ? "grabbing" : "grab";
var defaultProps = {
  id: "",
  width: "100%",
  height: "100%",
  style: null,
  viewState: null,
  initialViewState: null,
  pickingRadius: 0,
  layerFilter: null,
  parameters: {},
  parent: null,
  device: null,
  deviceProps: { type: "webgl" },
  gl: null,
  canvas: null,
  layers: [],
  effects: [],
  views: null,
  controller: null,
  // Rely on external controller, e.g. react-map-gl
  useDevicePixels: true,
  touchAction: "none",
  eventRecognizerOptions: {},
  _framebuffer: null,
  _animate: false,
  _pickable: true,
  _typedArrayManagerProps: {},
  _customRender: null,
  widgets: [],
  onDeviceInitialized: noop2,
  onWebGLInitialized: noop2,
  onResize: noop2,
  onViewStateChange: noop2,
  onInteractionStateChange: noop2,
  onBeforeRender: noop2,
  onAfterRender: noop2,
  onLoad: noop2,
  onError: (error) => log_default.error(error.message, error.cause)(),
  onHover: null,
  onClick: null,
  onDragStart: null,
  onDrag: null,
  onDragEnd: null,
  _onMetrics: null,
  getCursor,
  getTooltip: null,
  debug: false,
  drawPickingColors: false
};
var Deck = class {
  constructor(props) {
    this.width = 0;
    this.height = 0;
    this.userData = {};
    this.device = null;
    this.canvas = null;
    this.viewManager = null;
    this.layerManager = null;
    this.effectManager = null;
    this.deckRenderer = null;
    this.deckPicker = null;
    this.eventManager = null;
    this.widgetManager = null;
    this.tooltip = null;
    this.animationLoop = null;
    this.cursorState = {
      isHovering: false,
      isDragging: false
    };
    this.stats = new import_stats2.Stats({ id: "deck.gl" });
    this.metrics = {
      fps: 0,
      setPropsTime: 0,
      updateAttributesTime: 0,
      framesRedrawn: 0,
      pickTime: 0,
      pickCount: 0,
      gpuTime: 0,
      gpuTimePerFrame: 0,
      cpuTime: 0,
      cpuTimePerFrame: 0,
      bufferMemory: 0,
      textureMemory: 0,
      renderbufferMemory: 0,
      gpuMemory: 0
    };
    this._metricsCounter = 0;
    this._needsRedraw = "Initial render";
    this._pickRequest = {
      mode: "hover",
      x: -1,
      y: -1,
      radius: 0,
      event: null
    };
    this._lastPointerDownInfo = null;
    this._onPointerMove = (event) => {
      const { _pickRequest } = this;
      if (event.type === "pointerleave") {
        _pickRequest.x = -1;
        _pickRequest.y = -1;
        _pickRequest.radius = 0;
      } else if (event.leftButton || event.rightButton) {
        return;
      } else {
        const pos = event.offsetCenter;
        if (!pos) {
          return;
        }
        _pickRequest.x = pos.x;
        _pickRequest.y = pos.y;
        _pickRequest.radius = this.props.pickingRadius;
      }
      if (this.layerManager) {
        this.layerManager.context.mousePosition = { x: _pickRequest.x, y: _pickRequest.y };
      }
      _pickRequest.event = event;
    };
    this._onEvent = (event) => {
      const eventHandlerProp = EVENT_HANDLERS[event.type];
      const pos = event.offsetCenter;
      if (!eventHandlerProp || !pos || !this.layerManager) {
        return;
      }
      const layers = this.layerManager.getLayers();
      const info = this.deckPicker.getLastPickedObject({
        x: pos.x,
        y: pos.y,
        layers,
        viewports: this.getViewports(pos)
      }, this._lastPointerDownInfo);
      const { layer } = info;
      const layerHandler = layer && (layer[eventHandlerProp] || layer.props[eventHandlerProp]);
      const rootHandler = this.props[eventHandlerProp];
      let handled = false;
      if (layerHandler) {
        handled = layerHandler.call(layer, info, event);
      }
      if (!handled) {
        rootHandler == null ? void 0 : rootHandler(info, event);
        this.widgetManager.onEvent(info, event);
      }
    };
    this._onPointerDown = (event) => {
      const pos = event.offsetCenter;
      const pickedInfo = this._pick("pickObject", "pickObject Time", {
        x: pos.x,
        y: pos.y,
        radius: this.props.pickingRadius
      });
      this._lastPointerDownInfo = pickedInfo.result[0] || pickedInfo.emptyInfo;
    };
    this.props = { ...defaultProps, ...props };
    props = this.props;
    if (props.viewState && props.initialViewState) {
      log_default.warn("View state tracking is disabled. Use either `initialViewState` for auto update or `viewState` for manual update.")();
    }
    this.viewState = this.props.initialViewState;
    if (props.device) {
      this.device = props.device;
    }
    let deviceOrPromise = this.device;
    if (!deviceOrPromise && props.gl) {
      if (props.gl instanceof WebGLRenderingContext) {
        log_default.error("WebGL1 context not supported.")();
      }
      deviceOrPromise = import_webgl.webgl2Adapter.attach(props.gl);
    }
    if (!deviceOrPromise) {
      deviceOrPromise = import_core14.luma.createDevice({
        type: "best-available",
        adapters: [import_webgl.webgl2Adapter],
        ...props.deviceProps,
        createCanvasContext: {
          canvas: this._createCanvas(props),
          useDevicePixels: this.props.useDevicePixels,
          // TODO v9.2 - replace AnimationLoop's `autoResizeDrawingBuffer` with CanvasContext's `autoResize`
          autoResize: false
        }
      });
    }
    this.animationLoop = this._createAnimationLoop(deviceOrPromise, props);
    this.setProps(props);
    if (props._typedArrayManagerProps) {
      typed_array_manager_default.setOptions(props._typedArrayManagerProps);
    }
    this.animationLoop.start();
  }
  /** Stop rendering and dispose all resources */
  finalize() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    (_a = this.animationLoop) == null ? void 0 : _a.stop();
    (_b = this.animationLoop) == null ? void 0 : _b.destroy();
    this.animationLoop = null;
    this._lastPointerDownInfo = null;
    (_c = this.layerManager) == null ? void 0 : _c.finalize();
    this.layerManager = null;
    (_d = this.viewManager) == null ? void 0 : _d.finalize();
    this.viewManager = null;
    (_e = this.effectManager) == null ? void 0 : _e.finalize();
    this.effectManager = null;
    (_f = this.deckRenderer) == null ? void 0 : _f.finalize();
    this.deckRenderer = null;
    (_g = this.deckPicker) == null ? void 0 : _g.finalize();
    this.deckPicker = null;
    (_h = this.eventManager) == null ? void 0 : _h.destroy();
    this.eventManager = null;
    (_i = this.widgetManager) == null ? void 0 : _i.finalize();
    this.widgetManager = null;
    if (!this.props.canvas && !this.props.device && !this.props.gl && this.canvas) {
      (_j = this.canvas.parentElement) == null ? void 0 : _j.removeChild(this.canvas);
      this.canvas = null;
    }
  }
  /** Partially update props */
  setProps(props) {
    var _a;
    this.stats.get("setProps Time").timeStart();
    if ("onLayerHover" in props) {
      log_default.removed("onLayerHover", "onHover")();
    }
    if ("onLayerClick" in props) {
      log_default.removed("onLayerClick", "onClick")();
    }
    if (props.initialViewState && // depth = 3 when comparing viewStates: viewId.position.0
    !deepEqual(this.props.initialViewState, props.initialViewState, 3)) {
      this.viewState = props.initialViewState;
    }
    Object.assign(this.props, props);
    this._setCanvasSize(this.props);
    const resolvedProps = Object.create(this.props);
    Object.assign(resolvedProps, {
      views: this._getViews(),
      width: this.width,
      height: this.height,
      viewState: this._getViewState()
    });
    (_a = this.animationLoop) == null ? void 0 : _a.setProps(resolvedProps);
    if (this.layerManager) {
      this.viewManager.setProps(resolvedProps);
      this.layerManager.activateViewport(this.getViewports()[0]);
      this.layerManager.setProps(resolvedProps);
      this.effectManager.setProps(resolvedProps);
      this.deckRenderer.setProps(resolvedProps);
      this.deckPicker.setProps(resolvedProps);
      this.widgetManager.setProps(resolvedProps);
    }
    this.stats.get("setProps Time").timeEnd();
  }
  // Public API
  /**
   * Check if a redraw is needed
   * @returns `false` or a string summarizing the redraw reason
   */
  needsRedraw(opts = { clearRedrawFlags: false }) {
    if (!this.layerManager) {
      return false;
    }
    if (this.props._animate) {
      return "Deck._animate";
    }
    let redraw = this._needsRedraw;
    if (opts.clearRedrawFlags) {
      this._needsRedraw = false;
    }
    const viewManagerNeedsRedraw = this.viewManager.needsRedraw(opts);
    const layerManagerNeedsRedraw = this.layerManager.needsRedraw(opts);
    const effectManagerNeedsRedraw = this.effectManager.needsRedraw(opts);
    const deckRendererNeedsRedraw = this.deckRenderer.needsRedraw(opts);
    redraw = redraw || viewManagerNeedsRedraw || layerManagerNeedsRedraw || effectManagerNeedsRedraw || deckRendererNeedsRedraw;
    return redraw;
  }
  /**
   * Redraw the GL context
   * @param reason If not provided, only redraw if deemed necessary. Otherwise redraw regardless of internal states.
   * @returns
   */
  redraw(reason) {
    if (!this.layerManager) {
      return;
    }
    let redrawReason = this.needsRedraw({ clearRedrawFlags: true });
    redrawReason = reason || redrawReason;
    if (!redrawReason) {
      return;
    }
    this.stats.get("Redraw Count").incrementCount();
    if (this.props._customRender) {
      this.props._customRender(redrawReason);
    } else {
      this._drawLayers(redrawReason);
    }
  }
  /** Flag indicating that the Deck instance has initialized its resources and it's safe to call public methods. */
  get isInitialized() {
    return this.viewManager !== null;
  }
  /** Get a list of views that are currently rendered */
  getViews() {
    assert(this.viewManager);
    return this.viewManager.views;
  }
  /** Get a list of viewports that are currently rendered.
   * @param rect If provided, only returns viewports within the given bounding box.
   */
  getViewports(rect) {
    assert(this.viewManager);
    return this.viewManager.getViewports(rect);
  }
  /** Get the current canvas element. */
  getCanvas() {
    return this.canvas;
  }
  /** Query the object rendered on top at a given point */
  pickObject(opts) {
    const infos = this._pick("pickObject", "pickObject Time", opts).result;
    return infos.length ? infos[0] : null;
  }
  /* Query all rendered objects at a given point */
  pickMultipleObjects(opts) {
    opts.depth = opts.depth || 10;
    return this._pick("pickObject", "pickMultipleObjects Time", opts).result;
  }
  /* Query all objects rendered on top within a bounding box */
  pickObjects(opts) {
    return this._pick("pickObjects", "pickObjects Time", opts);
  }
  /** Experimental
   * Add a global resource for sharing among layers
   */
  _addResources(resources, forceUpdate = false) {
    for (const id in resources) {
      this.layerManager.resourceManager.add({ resourceId: id, data: resources[id], forceUpdate });
    }
  }
  /** Experimental
   * Remove a global resource
   */
  _removeResources(resourceIds) {
    for (const id of resourceIds) {
      this.layerManager.resourceManager.remove(id);
    }
  }
  /** Experimental
   * Register a default effect. Effects will be sorted by order, those with a low order will be rendered first
   */
  _addDefaultEffect(effect) {
    this.effectManager.addDefaultEffect(effect);
  }
  _addDefaultShaderModule(module2) {
    this.layerManager.addDefaultShaderModule(module2);
  }
  _removeDefaultShaderModule(module2) {
    var _a;
    (_a = this.layerManager) == null ? void 0 : _a.removeDefaultShaderModule(module2);
  }
  _pick(method, statKey, opts) {
    assert(this.deckPicker);
    const { stats } = this;
    stats.get("Pick Count").incrementCount();
    stats.get(statKey).timeStart();
    const infos = this.deckPicker[method]({
      // layerManager, viewManager and effectManager are always defined if deckPicker is
      layers: this.layerManager.getLayers(opts),
      views: this.viewManager.getViews(),
      viewports: this.getViewports(opts),
      onViewportActive: this.layerManager.activateViewport,
      effects: this.effectManager.getEffects(),
      ...opts
    });
    stats.get(statKey).timeEnd();
    return infos;
  }
  /** Resolve props.canvas to element */
  _createCanvas(props) {
    let canvas = props.canvas;
    if (typeof canvas === "string") {
      canvas = document.getElementById(canvas);
      assert(canvas);
    }
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = props.id || "deckgl-overlay";
      const parent = props.parent || document.body;
      parent.appendChild(canvas);
    }
    Object.assign(canvas.style, props.style);
    return canvas;
  }
  /** Updates canvas width and/or height, if provided as props */
  _setCanvasSize(props) {
    var _a;
    if (!this.canvas) {
      return;
    }
    const { width, height } = props;
    if (width || width === 0) {
      const cssWidth = Number.isFinite(width) ? `${width}px` : width;
      this.canvas.style.width = cssWidth;
    }
    if (height || height === 0) {
      const cssHeight = Number.isFinite(height) ? `${height}px` : height;
      this.canvas.style.position = ((_a = props.style) == null ? void 0 : _a.position) || "absolute";
      this.canvas.style.height = cssHeight;
    }
  }
  /** If canvas size has changed, reads out the new size and update */
  _updateCanvasSize() {
    var _a, _b;
    const { canvas } = this;
    if (!canvas) {
      return;
    }
    const newWidth = canvas.clientWidth ?? canvas.width;
    const newHeight = canvas.clientHeight ?? canvas.height;
    if (newWidth !== this.width || newHeight !== this.height) {
      this.width = newWidth;
      this.height = newHeight;
      (_a = this.viewManager) == null ? void 0 : _a.setProps({ width: newWidth, height: newHeight });
      (_b = this.layerManager) == null ? void 0 : _b.activateViewport(this.getViewports()[0]);
      this.props.onResize({ width: newWidth, height: newHeight });
    }
  }
  _createAnimationLoop(deviceOrPromise, props) {
    const {
      // width,
      // height,
      gl,
      // debug,
      onError,
      // onBeforeRender,
      // onAfterRender,
      useDevicePixels
    } = props;
    return new import_engine4.AnimationLoop({
      device: deviceOrPromise,
      useDevicePixels,
      // TODO v9
      autoResizeDrawingBuffer: !gl,
      // do not auto resize external context
      autoResizeViewport: false,
      // @ts-expect-error luma.gl needs to accept Promise<void> return value
      onInitialize: (context) => this._setDevice(context.device),
      onRender: this._onRenderFrame.bind(this),
      // @ts-expect-error typing mismatch: AnimationLoop does not accept onError:null
      onError
      // onBeforeRender,
      // onAfterRender,
    });
  }
  // Get the most relevant view state: props.viewState, if supplied, shadows internal viewState
  // TODO: For backwards compatibility ensure numeric width and height is added to the viewState
  _getViewState() {
    return this.props.viewState || this.viewState;
  }
  // Get the view descriptor list
  _getViews() {
    const { views } = this.props;
    const normalizedViews = Array.isArray(views) ? views : (
      // If null, default to a full screen map view port
      views ? [views] : [new map_view_default({ id: "default-view" })]
    );
    if (normalizedViews.length && this.props.controller) {
      normalizedViews[0].props.controller = this.props.controller;
    }
    return normalizedViews;
  }
  _onContextLost() {
    const { onError } = this.props;
    if (this.animationLoop && onError) {
      onError(new Error("WebGL context is lost"));
    }
  }
  /** Actually run picking */
  _pickAndCallback() {
    var _a, _b, _c;
    const { _pickRequest } = this;
    if (_pickRequest.event) {
      const { result, emptyInfo } = this._pick("pickObject", "pickObject Time", _pickRequest);
      this.cursorState.isHovering = result.length > 0;
      let pickedInfo = emptyInfo;
      let handled = false;
      for (const info of result) {
        pickedInfo = info;
        handled = ((_a = info.layer) == null ? void 0 : _a.onHover(info, _pickRequest.event)) || handled;
      }
      if (!handled) {
        (_c = (_b = this.props).onHover) == null ? void 0 : _c.call(_b, pickedInfo, _pickRequest.event);
        this.widgetManager.onHover(pickedInfo, _pickRequest.event);
      }
      _pickRequest.event = null;
    }
  }
  _updateCursor() {
    const container = this.props.parent || this.canvas;
    if (container) {
      container.style.cursor = this.props.getCursor(this.cursorState);
    }
  }
  _setDevice(device) {
    var _a, _b;
    this.device = device;
    if (!this.animationLoop) {
      return;
    }
    if (!this.canvas) {
      this.canvas = (_a = this.device.canvasContext) == null ? void 0 : _a.canvas;
    }
    if (this.device instanceof import_webgl.WebGLDevice) {
      this.device.setParametersWebGL({
        blend: true,
        blendFunc: [770, 771, 1, 771],
        polygonOffsetFill: true,
        depthTest: true,
        depthFunc: 515
      });
    }
    this.props.onDeviceInitialized(this.device);
    if (this.device instanceof import_webgl.WebGLDevice) {
      this.props.onWebGLInitialized(this.device.gl);
    }
    const timeline = new import_engine3.Timeline();
    timeline.play();
    this.animationLoop.attachTimeline(timeline);
    this.eventManager = new import_mjolnir2.EventManager(this.props.parent || this.canvas, {
      touchAction: this.props.touchAction,
      recognizers: Object.keys(RECOGNIZERS).map((eventName) => {
        var _a2;
        const [RecognizerConstructor, defaultOptions, recognizeWith, requestFailure] = RECOGNIZERS[eventName];
        const optionsOverride = (_a2 = this.props.eventRecognizerOptions) == null ? void 0 : _a2[eventName];
        const options = { ...defaultOptions, ...optionsOverride, event: eventName };
        return {
          recognizer: new RecognizerConstructor(options),
          recognizeWith,
          requestFailure
        };
      }),
      events: {
        pointerdown: this._onPointerDown,
        pointermove: this._onPointerMove,
        pointerleave: this._onPointerMove
      }
    });
    for (const eventType in EVENT_HANDLERS) {
      this.eventManager.on(eventType, this._onEvent);
    }
    this.viewManager = new ViewManager({
      timeline,
      eventManager: this.eventManager,
      onViewStateChange: this._onViewStateChange.bind(this),
      onInteractionStateChange: this._onInteractionStateChange.bind(this),
      views: this._getViews(),
      viewState: this._getViewState(),
      width: this.width,
      height: this.height
    });
    const viewport = this.viewManager.getViewports()[0];
    this.layerManager = new LayerManager(this.device, {
      deck: this,
      stats: this.stats,
      viewport,
      timeline
    });
    this.effectManager = new EffectManager({
      deck: this,
      device: this.device
    });
    this.deckRenderer = new DeckRenderer(this.device);
    this.deckPicker = new DeckPicker(this.device);
    this.widgetManager = new WidgetManager({
      deck: this,
      parentElement: (_b = this.canvas) == null ? void 0 : _b.parentElement
    });
    this.widgetManager.addDefault(new Tooltip());
    this.setProps(this.props);
    this._updateCanvasSize();
    this.props.onLoad();
  }
  /** Internal only: default render function (redraw all layers and views) */
  _drawLayers(redrawReason, renderOptions) {
    var _a;
    const { device, gl } = this.layerManager.context;
    this.props.onBeforeRender({ device, gl });
    const opts = {
      target: this.props._framebuffer,
      layers: this.layerManager.getLayers(),
      viewports: this.viewManager.getViewports(),
      onViewportActive: this.layerManager.activateViewport,
      views: this.viewManager.getViews(),
      pass: "screen",
      effects: this.effectManager.getEffects(),
      ...renderOptions
    };
    (_a = this.deckRenderer) == null ? void 0 : _a.renderLayers(opts);
    if (opts.pass === "screen") {
      this.widgetManager.onRedraw({
        viewports: opts.viewports,
        layers: opts.layers
      });
    }
    this.props.onAfterRender({ device, gl });
  }
  // Callbacks
  _onRenderFrame() {
    this._getFrameStats();
    if (this._metricsCounter++ % 60 === 0) {
      this._getMetrics();
      this.stats.reset();
      log_default.table(4, this.metrics)();
      if (this.props._onMetrics) {
        this.props._onMetrics(this.metrics);
      }
    }
    this._updateCanvasSize();
    this._updateCursor();
    this.layerManager.updateLayers();
    this._pickAndCallback();
    this.redraw();
    if (this.viewManager) {
      this.viewManager.updateViewStates();
    }
  }
  // Callbacks
  _onViewStateChange(params) {
    const viewState = this.props.onViewStateChange(params) || params.viewState;
    if (this.viewState) {
      this.viewState = { ...this.viewState, [params.viewId]: viewState };
      if (!this.props.viewState) {
        if (this.viewManager) {
          this.viewManager.setProps({ viewState: this.viewState });
        }
      }
    }
  }
  _onInteractionStateChange(interactionState) {
    this.cursorState.isDragging = interactionState.isDragging || false;
    this.props.onInteractionStateChange(interactionState);
  }
  _getFrameStats() {
    const { stats } = this;
    stats.get("frameRate").timeEnd();
    stats.get("frameRate").timeStart();
    const animationLoopStats = this.animationLoop.stats;
    stats.get("GPU Time").addTime(animationLoopStats.get("GPU Time").lastTiming);
    stats.get("CPU Time").addTime(animationLoopStats.get("CPU Time").lastTiming);
  }
  _getMetrics() {
    const { metrics, stats } = this;
    metrics.fps = stats.get("frameRate").getHz();
    metrics.setPropsTime = stats.get("setProps Time").time;
    metrics.updateAttributesTime = stats.get("Update Attributes").time;
    metrics.framesRedrawn = stats.get("Redraw Count").count;
    metrics.pickTime = stats.get("pickObject Time").time + stats.get("pickMultipleObjects Time").time + stats.get("pickObjects Time").time;
    metrics.pickCount = stats.get("Pick Count").count;
    metrics.gpuTime = stats.get("GPU Time").time;
    metrics.cpuTime = stats.get("CPU Time").time;
    metrics.gpuTimePerFrame = stats.get("GPU Time").getAverageTime();
    metrics.cpuTimePerFrame = stats.get("CPU Time").getAverageTime();
    const memoryStats = import_core14.luma.stats.get("Memory Usage");
    metrics.bufferMemory = memoryStats.get("Buffer Memory").count;
    metrics.textureMemory = memoryStats.get("Texture Memory").count;
    metrics.renderbufferMemory = memoryStats.get("Renderbuffer Memory").count;
    metrics.gpuMemory = memoryStats.get("GPU Memory").count;
  }
};
Deck.defaultProps = defaultProps;
Deck.VERSION = VERSION;
var deck_default = Deck;

// dist/lib/attribute/data-column.js
var import_core16 = require("@luma.gl/core");

// dist/lib/attribute/gl-utils.js
var import_core15 = require("@luma.gl/core");
function typedArrayFromDataType(type) {
  switch (type) {
    case "float64":
      return Float64Array;
    case "uint8":
    case "unorm8":
      return Uint8ClampedArray;
    default:
      return (0, import_core15.getTypedArrayFromDataType)(type);
  }
}
var dataTypeFromTypedArray = import_core15.getDataTypeFromTypedArray;
function getBufferAttributeLayout(name, accessor) {
  return {
    attribute: name,
    // @ts-expect-error Not all combinations are valid vertex formats; it's up to DataColumn to ensure
    format: accessor.size > 1 ? `${accessor.type}x${accessor.size}` : accessor.type,
    byteOffset: accessor.offset || 0
    // Note stride is set on the top level
  };
}
function getStride(accessor) {
  return accessor.stride || accessor.size * accessor.bytesPerElement;
}
function bufferLayoutEqual(accessor1, accessor2) {
  return accessor1.type === accessor2.type && accessor1.size === accessor2.size && getStride(accessor1) === getStride(accessor2) && (accessor1.offset || 0) === (accessor2.offset || 0);
}

// dist/lib/attribute/data-column.js
function resolveShaderAttribute(baseAccessor, shaderAttributeOptions) {
  if (shaderAttributeOptions.offset) {
    log_default.removed("shaderAttribute.offset", "vertexOffset, elementOffset")();
  }
  const stride = getStride(baseAccessor);
  const vertexOffset = shaderAttributeOptions.vertexOffset !== void 0 ? shaderAttributeOptions.vertexOffset : baseAccessor.vertexOffset || 0;
  const elementOffset = shaderAttributeOptions.elementOffset || 0;
  const offset = (
    // offsets defined by the attribute
    vertexOffset * stride + elementOffset * baseAccessor.bytesPerElement + // offsets defined by external buffers if any
    (baseAccessor.offset || 0)
  );
  return {
    ...shaderAttributeOptions,
    offset,
    stride
  };
}
function resolveDoublePrecisionShaderAttributes(baseAccessor, shaderAttributeOptions) {
  const resolvedOptions = resolveShaderAttribute(baseAccessor, shaderAttributeOptions);
  return {
    high: resolvedOptions,
    low: {
      ...resolvedOptions,
      offset: resolvedOptions.offset + baseAccessor.size * 4
    }
  };
}
var DataColumn = class {
  /* eslint-disable max-statements */
  constructor(device, opts, state) {
    this._buffer = null;
    this.device = device;
    this.id = opts.id || "";
    this.size = opts.size || 1;
    const logicalType = opts.logicalType || opts.type;
    const doublePrecision = logicalType === "float64";
    let { defaultValue } = opts;
    defaultValue = Number.isFinite(defaultValue) ? [defaultValue] : defaultValue || new Array(this.size).fill(0);
    let bufferType;
    if (doublePrecision) {
      bufferType = "float32";
    } else if (!logicalType && opts.isIndexed) {
      bufferType = "uint32";
    } else {
      bufferType = logicalType || "float32";
    }
    let defaultType = typedArrayFromDataType(logicalType || bufferType);
    this.doublePrecision = doublePrecision;
    if (doublePrecision && opts.fp64 === false) {
      defaultType = Float32Array;
    }
    this.value = null;
    this.settings = {
      ...opts,
      defaultType,
      defaultValue,
      logicalType,
      type: bufferType,
      normalized: bufferType.includes("norm"),
      size: this.size,
      bytesPerElement: defaultType.BYTES_PER_ELEMENT
    };
    this.state = {
      ...state,
      externalBuffer: null,
      bufferAccessor: this.settings,
      allocatedValue: null,
      numInstances: 0,
      bounds: null,
      constant: false
    };
  }
  /* eslint-enable max-statements */
  get isConstant() {
    return this.state.constant;
  }
  get buffer() {
    return this._buffer;
  }
  get byteOffset() {
    const accessor = this.getAccessor();
    if (accessor.vertexOffset) {
      return accessor.vertexOffset * getStride(accessor);
    }
    return 0;
  }
  get numInstances() {
    return this.state.numInstances;
  }
  set numInstances(n) {
    this.state.numInstances = n;
  }
  delete() {
    if (this._buffer) {
      this._buffer.delete();
      this._buffer = null;
    }
    typed_array_manager_default.release(this.state.allocatedValue);
  }
  getBuffer() {
    if (this.state.constant) {
      return null;
    }
    return this.state.externalBuffer || this._buffer;
  }
  getValue(attributeName = this.id, options = null) {
    const result = {};
    if (this.state.constant) {
      const value = this.value;
      if (options) {
        const shaderAttributeDef = resolveShaderAttribute(this.getAccessor(), options);
        const offset = shaderAttributeDef.offset / value.BYTES_PER_ELEMENT;
        const size = shaderAttributeDef.size || this.size;
        result[attributeName] = value.subarray(offset, offset + size);
      } else {
        result[attributeName] = value;
      }
    } else {
      result[attributeName] = this.getBuffer();
    }
    if (this.doublePrecision) {
      if (this.value instanceof Float64Array) {
        result[`${attributeName}64Low`] = result[attributeName];
      } else {
        result[`${attributeName}64Low`] = new Float32Array(this.size);
      }
    }
    return result;
  }
  _getBufferLayout(attributeName = this.id, options = null) {
    const accessor = this.getAccessor();
    const attributes = [];
    const result = {
      name: this.id,
      byteStride: getStride(accessor),
      attributes
    };
    if (this.doublePrecision) {
      const doubleShaderAttributeDefs = resolveDoublePrecisionShaderAttributes(accessor, options || {});
      attributes.push(getBufferAttributeLayout(attributeName, { ...accessor, ...doubleShaderAttributeDefs.high }), getBufferAttributeLayout(`${attributeName}64Low`, {
        ...accessor,
        ...doubleShaderAttributeDefs.low
      }));
    } else if (options) {
      const shaderAttributeDef = resolveShaderAttribute(accessor, options);
      attributes.push(getBufferAttributeLayout(attributeName, { ...accessor, ...shaderAttributeDef }));
    } else {
      attributes.push(getBufferAttributeLayout(attributeName, accessor));
    }
    return result;
  }
  setAccessor(accessor) {
    this.state.bufferAccessor = accessor;
  }
  getAccessor() {
    return this.state.bufferAccessor;
  }
  // Returns [min: Array(size), max: Array(size)]
  /* eslint-disable max-depth */
  getBounds() {
    if (this.state.bounds) {
      return this.state.bounds;
    }
    let result = null;
    if (this.state.constant && this.value) {
      const min = Array.from(this.value);
      result = [min, min];
    } else {
      const { value, numInstances, size } = this;
      const len = numInstances * size;
      if (value && len && value.length >= len) {
        const min = new Array(size).fill(Infinity);
        const max = new Array(size).fill(-Infinity);
        for (let i = 0; i < len; ) {
          for (let j = 0; j < size; j++) {
            const v = value[i++];
            if (v < min[j])
              min[j] = v;
            if (v > max[j])
              max[j] = v;
          }
        }
        result = [min, max];
      }
    }
    this.state.bounds = result;
    return result;
  }
  // returns true if success
  // eslint-disable-next-line max-statements
  setData(data) {
    const { state } = this;
    let opts;
    if (ArrayBuffer.isView(data)) {
      opts = { value: data };
    } else if (data instanceof import_core16.Buffer) {
      opts = { buffer: data };
    } else {
      opts = data;
    }
    const accessor = { ...this.settings, ...opts };
    if (ArrayBuffer.isView(opts.value)) {
      if (!opts.type) {
        const is64Bit = this.doublePrecision && opts.value instanceof Float64Array;
        if (is64Bit) {
          accessor.type = "float32";
        } else {
          const type = dataTypeFromTypedArray(opts.value);
          accessor.type = accessor.normalized ? type.replace("int", "norm") : type;
        }
      }
      accessor.bytesPerElement = opts.value.BYTES_PER_ELEMENT;
      accessor.stride = getStride(accessor);
    }
    state.bounds = null;
    if (opts.constant) {
      let value = opts.value;
      value = this._normalizeValue(value, [], 0);
      if (this.settings.normalized) {
        value = this.normalizeConstant(value);
      }
      const hasChanged = !state.constant || !this._areValuesEqual(value, this.value);
      if (!hasChanged) {
        return false;
      }
      state.externalBuffer = null;
      state.constant = true;
      this.value = ArrayBuffer.isView(value) ? value : new Float32Array(value);
    } else if (opts.buffer) {
      const buffer = opts.buffer;
      state.externalBuffer = buffer;
      state.constant = false;
      this.value = opts.value || null;
    } else if (opts.value) {
      this._checkExternalBuffer(opts);
      let value = opts.value;
      state.externalBuffer = null;
      state.constant = false;
      this.value = value;
      let { buffer } = this;
      const stride = getStride(accessor);
      const byteOffset = (accessor.vertexOffset || 0) * stride;
      if (this.doublePrecision && value instanceof Float64Array) {
        value = toDoublePrecisionArray(value, accessor);
      }
      if (this.settings.isIndexed) {
        const ArrayType = this.settings.defaultType;
        if (value.constructor !== ArrayType) {
          value = new ArrayType(value);
        }
      }
      const requiredBufferSize = value.byteLength + byteOffset + stride * 2;
      if (!buffer || buffer.byteLength < requiredBufferSize) {
        buffer = this._createBuffer(requiredBufferSize);
      }
      buffer.write(value, byteOffset);
    }
    this.setAccessor(accessor);
    return true;
  }
  updateSubBuffer(opts = {}) {
    this.state.bounds = null;
    const value = this.value;
    const { startOffset = 0, endOffset } = opts;
    this.buffer.write(this.doublePrecision && value instanceof Float64Array ? toDoublePrecisionArray(value, {
      size: this.size,
      startIndex: startOffset,
      endIndex: endOffset
    }) : value.subarray(startOffset, endOffset), startOffset * value.BYTES_PER_ELEMENT + this.byteOffset);
  }
  allocate(numInstances, copy = false) {
    const { state } = this;
    const oldValue = state.allocatedValue;
    const value = typed_array_manager_default.allocate(oldValue, numInstances + 1, {
      size: this.size,
      type: this.settings.defaultType,
      copy
    });
    this.value = value;
    const { byteOffset } = this;
    let { buffer } = this;
    if (!buffer || buffer.byteLength < value.byteLength + byteOffset) {
      buffer = this._createBuffer(value.byteLength + byteOffset);
      if (copy && oldValue) {
        buffer.write(oldValue instanceof Float64Array ? toDoublePrecisionArray(oldValue, this) : oldValue, byteOffset);
      }
    }
    state.allocatedValue = value;
    state.constant = false;
    state.externalBuffer = null;
    this.setAccessor(this.settings);
    return true;
  }
  // PRIVATE HELPER METHODS
  _checkExternalBuffer(opts) {
    const { value } = opts;
    if (!ArrayBuffer.isView(value)) {
      throw new Error(`Attribute ${this.id} value is not TypedArray`);
    }
    const ArrayType = this.settings.defaultType;
    let illegalArrayType = false;
    if (this.doublePrecision) {
      illegalArrayType = value.BYTES_PER_ELEMENT < 4;
    }
    if (illegalArrayType) {
      throw new Error(`Attribute ${this.id} does not support ${value.constructor.name}`);
    }
    if (!(value instanceof ArrayType) && this.settings.normalized && !("normalized" in opts)) {
      log_default.warn(`Attribute ${this.id} is normalized`)();
    }
  }
  // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
  normalizeConstant(value) {
    switch (this.settings.type) {
      case "snorm8":
        return new Float32Array(value).map((x) => (x + 128) / 255 * 2 - 1);
      case "snorm16":
        return new Float32Array(value).map((x) => (x + 32768) / 65535 * 2 - 1);
      case "unorm8":
        return new Float32Array(value).map((x) => x / 255);
      case "unorm16":
        return new Float32Array(value).map((x) => x / 65535);
      default:
        return value;
    }
  }
  /* check user supplied values and apply fallback */
  _normalizeValue(value, out, start) {
    const { defaultValue, size } = this.settings;
    if (Number.isFinite(value)) {
      out[start] = value;
      return out;
    }
    if (!value) {
      let i = size;
      while (--i >= 0) {
        out[start + i] = defaultValue[i];
      }
      return out;
    }
    switch (size) {
      case 4:
        out[start + 3] = Number.isFinite(value[3]) ? value[3] : defaultValue[3];
      case 3:
        out[start + 2] = Number.isFinite(value[2]) ? value[2] : defaultValue[2];
      case 2:
        out[start + 1] = Number.isFinite(value[1]) ? value[1] : defaultValue[1];
      case 1:
        out[start + 0] = Number.isFinite(value[0]) ? value[0] : defaultValue[0];
        break;
      default:
        let i = size;
        while (--i >= 0) {
          out[start + i] = Number.isFinite(value[i]) ? value[i] : defaultValue[i];
        }
    }
    return out;
  }
  _areValuesEqual(value1, value2) {
    if (!value1 || !value2) {
      return false;
    }
    const { size } = this;
    for (let i = 0; i < size; i++) {
      if (value1[i] !== value2[i]) {
        return false;
      }
    }
    return true;
  }
  _createBuffer(byteLength) {
    var _a;
    if (this._buffer) {
      this._buffer.destroy();
    }
    const { isIndexed, type } = this.settings;
    this._buffer = this.device.createBuffer({
      ...(_a = this._buffer) == null ? void 0 : _a.props,
      id: this.id,
      usage: isIndexed ? import_core16.Buffer.INDEX : import_core16.Buffer.VERTEX,
      indexType: isIndexed ? type : void 0,
      byteLength
    });
    return this._buffer;
  }
};

// dist/utils/iterable-utils.js
var EMPTY_ARRAY = [];
var placeholderArray = [];
function createIterable(data, startRow = 0, endRow = Infinity) {
  let iterable = EMPTY_ARRAY;
  const objectInfo = {
    index: -1,
    data,
    // visitor can optionally utilize this to avoid constructing a new array for every object
    target: []
  };
  if (!data) {
    iterable = EMPTY_ARRAY;
  } else if (typeof data[Symbol.iterator] === "function") {
    iterable = data;
  } else if (data.length > 0) {
    placeholderArray.length = data.length;
    iterable = placeholderArray;
  }
  if (startRow > 0 || Number.isFinite(endRow)) {
    iterable = (Array.isArray(iterable) ? iterable : Array.from(iterable)).slice(startRow, endRow);
    objectInfo.index = startRow - 1;
  }
  return { iterable, objectInfo };
}
function isAsyncIterable(data) {
  return data && data[Symbol.asyncIterator];
}
function getAccessorFromBuffer(typedArray, options) {
  const { size, stride, offset, startIndices, nested } = options;
  const bytesPerElement = typedArray.BYTES_PER_ELEMENT;
  const elementStride = stride ? stride / bytesPerElement : size;
  const elementOffset = offset ? offset / bytesPerElement : 0;
  const vertexCount = Math.floor((typedArray.length - elementOffset) / elementStride);
  return (_, { index, target }) => {
    if (!startIndices) {
      const sourceIndex = index * elementStride + elementOffset;
      for (let j = 0; j < size; j++) {
        target[j] = typedArray[sourceIndex + j];
      }
      return target;
    }
    const startIndex = startIndices[index];
    const endIndex = startIndices[index + 1] || vertexCount;
    let result;
    if (nested) {
      result = new Array(endIndex - startIndex);
      for (let i = startIndex; i < endIndex; i++) {
        const sourceIndex = i * elementStride + elementOffset;
        target = new Array(size);
        for (let j = 0; j < size; j++) {
          target[j] = typedArray[sourceIndex + j];
        }
        result[i - startIndex] = target;
      }
    } else if (elementStride === size) {
      result = typedArray.subarray(startIndex * size + elementOffset, endIndex * size + elementOffset);
    } else {
      result = new typedArray.constructor((endIndex - startIndex) * size);
      let targetIndex = 0;
      for (let i = startIndex; i < endIndex; i++) {
        const sourceIndex = i * elementStride + elementOffset;
        for (let j = 0; j < size; j++) {
          result[targetIndex++] = typedArray[sourceIndex + j];
        }
      }
    }
    return result;
  };
}

// dist/utils/range.js
var EMPTY = [];
var FULL = [[0, Infinity]];
function add(rangeList, range) {
  if (rangeList === FULL) {
    return rangeList;
  }
  if (range[0] < 0) {
    range[0] = 0;
  }
  if (range[0] >= range[1]) {
    return rangeList;
  }
  const newRangeList = [];
  const len = rangeList.length;
  let insertPosition = 0;
  for (let i = 0; i < len; i++) {
    const range0 = rangeList[i];
    if (range0[1] < range[0]) {
      newRangeList.push(range0);
      insertPosition = i + 1;
    } else if (range0[0] > range[1]) {
      newRangeList.push(range0);
    } else {
      range = [Math.min(range0[0], range[0]), Math.max(range0[1], range[1])];
    }
  }
  newRangeList.splice(insertPosition, 0, range);
  return newRangeList;
}

// dist/lib/attribute/transition-settings.js
var DEFAULT_TRANSITION_SETTINGS = {
  interpolation: {
    duration: 0,
    easing: (t) => t
  },
  spring: {
    stiffness: 0.05,
    damping: 0.5
  }
};
function normalizeTransitionSettings(userSettings, layerSettings) {
  if (!userSettings) {
    return null;
  }
  if (Number.isFinite(userSettings)) {
    userSettings = { type: "interpolation", duration: userSettings };
  }
  const type = userSettings.type || "interpolation";
  return {
    ...DEFAULT_TRANSITION_SETTINGS[type],
    ...layerSettings,
    ...userSettings,
    type
  };
}

// dist/lib/attribute/attribute.js
var Attribute = class extends DataColumn {
  constructor(device, opts) {
    super(device, opts, {
      startIndices: null,
      lastExternalBuffer: null,
      binaryValue: null,
      binaryAccessor: null,
      needsUpdate: true,
      needsRedraw: false,
      layoutChanged: false,
      updateRanges: FULL
    });
    this.constant = false;
    this.settings.update = opts.update || (opts.accessor ? this._autoUpdater : void 0);
    Object.seal(this.settings);
    Object.seal(this.state);
    this._validateAttributeUpdaters();
  }
  get startIndices() {
    return this.state.startIndices;
  }
  set startIndices(layout) {
    this.state.startIndices = layout;
  }
  needsUpdate() {
    return this.state.needsUpdate;
  }
  needsRedraw({ clearChangedFlags = false } = {}) {
    const needsRedraw = this.state.needsRedraw;
    this.state.needsRedraw = needsRedraw && !clearChangedFlags;
    return needsRedraw;
  }
  layoutChanged() {
    return this.state.layoutChanged;
  }
  setAccessor(accessor) {
    var _a;
    (_a = this.state).layoutChanged || (_a.layoutChanged = !bufferLayoutEqual(accessor, this.getAccessor()));
    super.setAccessor(accessor);
  }
  getUpdateTriggers() {
    const { accessor } = this.settings;
    return [this.id].concat(typeof accessor !== "function" && accessor || []);
  }
  supportsTransition() {
    return Boolean(this.settings.transition);
  }
  // Resolve transition settings object if transition is enabled, otherwise `null`
  getTransitionSetting(opts) {
    if (!opts || !this.supportsTransition()) {
      return null;
    }
    const { accessor } = this.settings;
    const layerSettings = this.settings.transition;
    const userSettings = Array.isArray(accessor) ? (
      // @ts-ignore
      opts[accessor.find((a) => opts[a])]
    ) : (
      // @ts-ignore
      opts[accessor]
    );
    return normalizeTransitionSettings(userSettings, layerSettings);
  }
  setNeedsUpdate(reason = this.id, dataRange) {
    this.state.needsUpdate = this.state.needsUpdate || reason;
    this.setNeedsRedraw(reason);
    if (dataRange) {
      const { startRow = 0, endRow = Infinity } = dataRange;
      this.state.updateRanges = add(this.state.updateRanges, [startRow, endRow]);
    } else {
      this.state.updateRanges = FULL;
    }
  }
  clearNeedsUpdate() {
    this.state.needsUpdate = false;
    this.state.updateRanges = EMPTY;
  }
  setNeedsRedraw(reason = this.id) {
    this.state.needsRedraw = this.state.needsRedraw || reason;
  }
  allocate(numInstances) {
    const { state, settings } = this;
    if (settings.noAlloc) {
      return false;
    }
    if (settings.update) {
      super.allocate(numInstances, state.updateRanges !== FULL);
      return true;
    }
    return false;
  }
  updateBuffer({ numInstances, data, props, context }) {
    if (!this.needsUpdate()) {
      return false;
    }
    const { state: { updateRanges }, settings: { update, noAlloc } } = this;
    let updated = true;
    if (update) {
      for (const [startRow, endRow] of updateRanges) {
        update.call(context, this, { data, startRow, endRow, props, numInstances });
      }
      if (!this.value) {
      } else if (this.constant || !this.buffer || this.buffer.byteLength < this.value.byteLength + this.byteOffset) {
        this.setData({
          value: this.value,
          constant: this.constant
        });
        this.constant = false;
      } else {
        for (const [startRow, endRow] of updateRanges) {
          const startOffset = Number.isFinite(startRow) ? this.getVertexOffset(startRow) : 0;
          const endOffset = Number.isFinite(endRow) ? this.getVertexOffset(endRow) : noAlloc || !Number.isFinite(numInstances) ? this.value.length : numInstances * this.size;
          super.updateSubBuffer({ startOffset, endOffset });
        }
      }
      this._checkAttributeArray();
    } else {
      updated = false;
    }
    this.clearNeedsUpdate();
    this.setNeedsRedraw();
    return updated;
  }
  // Use generic value
  // Returns true if successful
  setConstantValue(value) {
    if (value === void 0 || typeof value === "function") {
      return false;
    }
    const hasChanged = this.setData({ constant: true, value });
    if (hasChanged) {
      this.setNeedsRedraw();
    }
    this.clearNeedsUpdate();
    return true;
  }
  // Use external buffer
  // Returns true if successful
  // eslint-disable-next-line max-statements
  setExternalBuffer(buffer) {
    const { state } = this;
    if (!buffer) {
      state.lastExternalBuffer = null;
      return false;
    }
    this.clearNeedsUpdate();
    if (state.lastExternalBuffer === buffer) {
      return true;
    }
    state.lastExternalBuffer = buffer;
    this.setNeedsRedraw();
    this.setData(buffer);
    return true;
  }
  // Binary value is a typed array packed from mapping the source data with the accessor
  // If the returned value from the accessor is the same as the attribute value, set it directly
  // Otherwise use the auto updater for transform/normalization
  setBinaryValue(buffer, startIndices = null) {
    const { state, settings } = this;
    if (!buffer) {
      state.binaryValue = null;
      state.binaryAccessor = null;
      return false;
    }
    if (settings.noAlloc) {
      return false;
    }
    if (state.binaryValue === buffer) {
      this.clearNeedsUpdate();
      return true;
    }
    state.binaryValue = buffer;
    this.setNeedsRedraw();
    const needsUpdate = settings.transform || startIndices !== this.startIndices;
    if (needsUpdate) {
      if (ArrayBuffer.isView(buffer)) {
        buffer = { value: buffer };
      }
      const binaryValue = buffer;
      assert(ArrayBuffer.isView(binaryValue.value), `invalid ${settings.accessor}`);
      const needsNormalize = Boolean(binaryValue.size) && binaryValue.size !== this.size;
      state.binaryAccessor = getAccessorFromBuffer(binaryValue.value, {
        size: binaryValue.size || this.size,
        stride: binaryValue.stride,
        offset: binaryValue.offset,
        startIndices,
        nested: needsNormalize
      });
      return false;
    }
    this.clearNeedsUpdate();
    this.setData(buffer);
    return true;
  }
  getVertexOffset(row) {
    const { startIndices } = this;
    const vertexIndex = startIndices ? row < startIndices.length ? startIndices[row] : this.numInstances : row;
    return vertexIndex * this.size;
  }
  getValue() {
    const shaderAttributeDefs = this.settings.shaderAttributes;
    const result = super.getValue();
    if (!shaderAttributeDefs) {
      return result;
    }
    for (const shaderAttributeName in shaderAttributeDefs) {
      Object.assign(result, super.getValue(shaderAttributeName, shaderAttributeDefs[shaderAttributeName]));
    }
    return result;
  }
  /** Generate WebGPU-style buffer layout descriptor from this attribute */
  getBufferLayout(modelInfo) {
    this.state.layoutChanged = false;
    const shaderAttributeDefs = this.settings.shaderAttributes;
    const result = super._getBufferLayout();
    const { stepMode } = this.settings;
    if (stepMode === "dynamic") {
      result.stepMode = modelInfo ? modelInfo.isInstanced ? "instance" : "vertex" : "instance";
    } else {
      result.stepMode = stepMode ?? "vertex";
    }
    if (!shaderAttributeDefs) {
      return result;
    }
    for (const shaderAttributeName in shaderAttributeDefs) {
      const map = super._getBufferLayout(shaderAttributeName, shaderAttributeDefs[shaderAttributeName]);
      result.attributes.push(...map.attributes);
    }
    return result;
  }
  /* eslint-disable max-depth, max-statements */
  _autoUpdater(attribute, { data, startRow, endRow, props, numInstances }) {
    if (attribute.constant) {
      return;
    }
    const { settings, state, value, size, startIndices } = attribute;
    const { accessor, transform } = settings;
    const accessorFunc = state.binaryAccessor || // @ts-ignore
    (typeof accessor === "function" ? accessor : props[accessor]);
    assert(typeof accessorFunc === "function", `accessor "${accessor}" is not a function`);
    let i = attribute.getVertexOffset(startRow);
    const { iterable, objectInfo } = createIterable(data, startRow, endRow);
    for (const object of iterable) {
      objectInfo.index++;
      let objectValue = accessorFunc(object, objectInfo);
      if (transform) {
        objectValue = transform.call(this, objectValue);
      }
      if (startIndices) {
        const numVertices = (objectInfo.index < startIndices.length - 1 ? startIndices[objectInfo.index + 1] : numInstances) - startIndices[objectInfo.index];
        if (objectValue && Array.isArray(objectValue[0])) {
          let startIndex = i;
          for (const item of objectValue) {
            attribute._normalizeValue(item, value, startIndex);
            startIndex += size;
          }
        } else if (objectValue && objectValue.length > size) {
          value.set(objectValue, i);
        } else {
          attribute._normalizeValue(objectValue, objectInfo.target, 0);
          fillArray({
            target: value,
            source: objectInfo.target,
            start: i,
            count: numVertices
          });
        }
        i += numVertices * size;
      } else {
        attribute._normalizeValue(objectValue, value, i);
        i += size;
      }
    }
  }
  /* eslint-enable max-depth, max-statements */
  // Validate deck.gl level fields
  _validateAttributeUpdaters() {
    const { settings } = this;
    const hasUpdater = settings.noAlloc || typeof settings.update === "function";
    if (!hasUpdater) {
      throw new Error(`Attribute ${this.id} missing update or accessor`);
    }
  }
  // check that the first few elements of the attribute are reasonable
  /* eslint-disable no-fallthrough */
  _checkAttributeArray() {
    const { value } = this;
    const limit = Math.min(4, this.size);
    if (value && value.length >= limit) {
      let valid = true;
      switch (limit) {
        case 4:
          valid = valid && Number.isFinite(value[3]);
        case 3:
          valid = valid && Number.isFinite(value[2]);
        case 2:
          valid = valid && Number.isFinite(value[1]);
        case 1:
          valid = valid && Number.isFinite(value[0]);
          break;
        default:
          valid = false;
      }
      if (!valid) {
        throw new Error(`Illegal attribute generated for ${this.id}`);
      }
    }
  }
};

// dist/transitions/gpu-interpolation-transition.js
var import_engine5 = require("@luma.gl/engine");
var import_shadertools6 = require("@luma.gl/shadertools");
var import_constants12 = require("@luma.gl/constants");

// dist/utils/array-utils.js
function padArrayChunk(options) {
  const { source, target, start = 0, size, getData } = options;
  const end = options.end || target.length;
  const sourceLength = source.length;
  const targetLength = end - start;
  if (sourceLength > targetLength) {
    target.set(source.subarray(0, targetLength), start);
    return;
  }
  target.set(source, start);
  if (!getData) {
    return;
  }
  let i = sourceLength;
  while (i < targetLength) {
    const datum = getData(i, source);
    for (let j = 0; j < size; j++) {
      target[start + i] = datum[j] || 0;
      i++;
    }
  }
}
function padArray({ source, target, size, getData, sourceStartIndices, targetStartIndices }) {
  if (!sourceStartIndices || !targetStartIndices) {
    padArrayChunk({
      source,
      target,
      size,
      getData
    });
    return target;
  }
  let sourceIndex = 0;
  let targetIndex = 0;
  const getChunkData = getData && ((i, chunk) => getData(i + targetIndex, chunk));
  const n = Math.min(sourceStartIndices.length, targetStartIndices.length);
  for (let i = 1; i < n; i++) {
    const nextSourceIndex = sourceStartIndices[i] * size;
    const nextTargetIndex = targetStartIndices[i] * size;
    padArrayChunk({
      source: source.subarray(sourceIndex, nextSourceIndex),
      target,
      start: targetIndex,
      end: nextTargetIndex,
      size,
      getData: getChunkData
    });
    sourceIndex = nextSourceIndex;
    targetIndex = nextTargetIndex;
  }
  if (targetIndex < target.length) {
    padArrayChunk({
      // @ts-ignore
      source: [],
      target,
      start: targetIndex,
      size,
      getData: getChunkData
    });
  }
  return target;
}

// dist/transitions/gpu-transition-utils.js
var import_constants11 = require("@luma.gl/constants");
function cloneAttribute(attribute) {
  const { device, settings, value } = attribute;
  const newAttribute = new Attribute(device, settings);
  newAttribute.setData({
    value: value instanceof Float64Array ? new Float64Array(0) : new Float32Array(0),
    normalized: settings.normalized
  });
  return newAttribute;
}
function getAttributeTypeFromSize(size) {
  switch (size) {
    case 1:
      return "float";
    case 2:
      return "vec2";
    case 3:
      return "vec3";
    case 4:
      return "vec4";
    default:
      throw new Error(`No defined attribute type for size "${size}"`);
  }
}
function getFloat32VertexFormat(size) {
  switch (size) {
    case 1:
      return "float32";
    case 2:
      return "float32x2";
    case 3:
      return "float32x3";
    case 4:
      return "float32x4";
    default:
      throw new Error("invalid type size");
  }
}
function cycleBuffers(buffers) {
  buffers.push(buffers.shift());
}
function getAttributeBufferLength(attribute, numInstances) {
  const { doublePrecision, settings, value, size } = attribute;
  const multiplier = doublePrecision && value instanceof Float64Array ? 2 : 1;
  let maxVertexOffset = 0;
  const { shaderAttributes } = attribute.settings;
  if (shaderAttributes) {
    for (const shaderAttribute of Object.values(shaderAttributes)) {
      maxVertexOffset = Math.max(maxVertexOffset, shaderAttribute.vertexOffset ?? 0);
    }
  }
  return (settings.noAlloc ? value.length : (numInstances + maxVertexOffset) * size) * multiplier;
}
function matchBuffer({ device, source, target }) {
  if (!target || target.byteLength < source.byteLength) {
    target == null ? void 0 : target.destroy();
    target = device.createBuffer({
      byteLength: source.byteLength,
      usage: source.usage
    });
  }
  return target;
}
function padBuffer({ device, buffer, attribute, fromLength, toLength, fromStartIndices, getData = (x) => x }) {
  const precisionMultiplier = attribute.doublePrecision && attribute.value instanceof Float64Array ? 2 : 1;
  const size = attribute.size * precisionMultiplier;
  const byteOffset = attribute.byteOffset;
  const targetByteOffset = attribute.settings.bytesPerElement < 4 ? byteOffset / attribute.settings.bytesPerElement * 4 : byteOffset;
  const toStartIndices = attribute.startIndices;
  const hasStartIndices = fromStartIndices && toStartIndices;
  const isConstant = attribute.isConstant;
  if (!hasStartIndices && buffer && fromLength >= toLength) {
    return buffer;
  }
  const ArrayType = attribute.value instanceof Float64Array ? Float32Array : attribute.value.constructor;
  const toData = isConstant ? attribute.value : (
    // TODO(v9.1): Avoid non-portable synchronous reads.
    new ArrayType(attribute.getBuffer().readSyncWebGL(byteOffset, toLength * ArrayType.BYTES_PER_ELEMENT).buffer)
  );
  if (attribute.settings.normalized && !isConstant) {
    const getter = getData;
    getData = (value, chunk) => attribute.normalizeConstant(getter(value, chunk));
  }
  const getMissingData = isConstant ? (i, chunk) => getData(toData, chunk) : (i, chunk) => getData(toData.subarray(i + byteOffset, i + byteOffset + size), chunk);
  const source = buffer ? new Float32Array(buffer.readSyncWebGL(targetByteOffset, fromLength * 4).buffer) : new Float32Array(0);
  const target = new Float32Array(toLength);
  padArray({
    source,
    target,
    sourceStartIndices: fromStartIndices,
    targetStartIndices: toStartIndices,
    size,
    getData: getMissingData
  });
  if (!buffer || buffer.byteLength < target.byteLength + targetByteOffset) {
    buffer == null ? void 0 : buffer.destroy();
    buffer = device.createBuffer({
      byteLength: target.byteLength + targetByteOffset,
      usage: 35050
    });
  }
  buffer.write(target, targetByteOffset);
  return buffer;
}

// dist/transitions/gpu-transition.js
var GPUTransitionBase = class {
  constructor({ device, attribute, timeline }) {
    this.buffers = [];
    this.currentLength = 0;
    this.device = device;
    this.transition = new Transition(timeline);
    this.attribute = attribute;
    this.attributeInTransition = cloneAttribute(attribute);
    this.currentStartIndices = attribute.startIndices;
  }
  get inProgress() {
    return this.transition.inProgress;
  }
  start(transitionSettings, numInstances, duration = Infinity) {
    this.settings = transitionSettings;
    this.currentStartIndices = this.attribute.startIndices;
    this.currentLength = getAttributeBufferLength(this.attribute, numInstances);
    this.transition.start({ ...transitionSettings, duration });
  }
  update() {
    const updated = this.transition.update();
    if (updated) {
      this.onUpdate();
    }
    return updated;
  }
  setBuffer(buffer) {
    this.attributeInTransition.setData({
      buffer,
      normalized: this.attribute.settings.normalized,
      // Retain placeholder value to generate correct shader layout
      value: this.attributeInTransition.value
    });
  }
  cancel() {
    this.transition.cancel();
  }
  delete() {
    this.cancel();
    for (const buffer of this.buffers) {
      buffer.destroy();
    }
    this.buffers.length = 0;
  }
};

// dist/transitions/gpu-interpolation-transition.js
var GPUInterpolationTransition = class extends GPUTransitionBase {
  constructor({ device, attribute, timeline }) {
    super({ device, attribute, timeline });
    this.type = "interpolation";
    this.transform = getTransform(device, attribute);
  }
  start(transitionSettings, numInstances) {
    const prevLength = this.currentLength;
    const prevStartIndices = this.currentStartIndices;
    super.start(transitionSettings, numInstances, transitionSettings.duration);
    if (transitionSettings.duration <= 0) {
      this.transition.cancel();
      return;
    }
    const { buffers, attribute } = this;
    cycleBuffers(buffers);
    buffers[0] = padBuffer({
      device: this.device,
      buffer: buffers[0],
      attribute,
      fromLength: prevLength,
      toLength: this.currentLength,
      fromStartIndices: prevStartIndices,
      getData: transitionSettings.enter
    });
    buffers[1] = matchBuffer({
      device: this.device,
      source: buffers[0],
      target: buffers[1]
    });
    this.setBuffer(buffers[1]);
    const { transform } = this;
    const model = transform.model;
    let vertexCount = Math.floor(this.currentLength / attribute.size);
    if (useFp64(attribute)) {
      vertexCount /= 2;
    }
    model.setVertexCount(vertexCount);
    if (attribute.isConstant) {
      model.setAttributes({ aFrom: buffers[0] });
      model.setConstantAttributes({ aTo: attribute.value });
    } else {
      model.setAttributes({
        aFrom: buffers[0],
        aTo: attribute.getBuffer()
      });
    }
    transform.transformFeedback.setBuffers({ vCurrent: buffers[1] });
  }
  onUpdate() {
    const { duration, easing } = this.settings;
    const { time } = this.transition;
    let t = time / duration;
    if (easing) {
      t = easing(t);
    }
    const { model } = this.transform;
    const interpolationProps = { time: t };
    model.shaderInputs.setProps({ interpolation: interpolationProps });
    this.transform.run({ discard: true });
  }
  delete() {
    super.delete();
    this.transform.destroy();
  }
};
var uniformBlock4 = `uniform interpolationUniforms {
  float time;
} interpolation;
`;
var interpolationUniforms = {
  name: "interpolation",
  vs: uniformBlock4,
  uniformTypes: {
    time: "f32"
  }
};
var vs4 = `#version 300 es
#define SHADER_NAME interpolation-transition-vertex-shader

in ATTRIBUTE_TYPE aFrom;
in ATTRIBUTE_TYPE aTo;
out ATTRIBUTE_TYPE vCurrent;

void main(void) {
  vCurrent = mix(aFrom, aTo, interpolation.time);
  gl_Position = vec4(0.0);
}
`;
var vs64 = `#version 300 es
#define SHADER_NAME interpolation-transition-vertex-shader

in ATTRIBUTE_TYPE aFrom;
in ATTRIBUTE_TYPE aFrom64Low;
in ATTRIBUTE_TYPE aTo;
in ATTRIBUTE_TYPE aTo64Low;
out ATTRIBUTE_TYPE vCurrent;
out ATTRIBUTE_TYPE vCurrent64Low;

vec2 mix_fp64(vec2 a, vec2 b, float x) {
  vec2 range = sub_fp64(b, a);
  return sum_fp64(a, mul_fp64(range, vec2(x, 0.0)));
}

void main(void) {
  for (int i=0; i<ATTRIBUTE_SIZE; i++) {
    vec2 value = mix_fp64(vec2(aFrom[i], aFrom64Low[i]), vec2(aTo[i], aTo64Low[i]), interpolation.time);
    vCurrent[i] = value.x;
    vCurrent64Low[i] = value.y;
  }
  gl_Position = vec4(0.0);
}
`;
function useFp64(attribute) {
  return attribute.doublePrecision && attribute.value instanceof Float64Array;
}
function getTransform(device, attribute) {
  const attributeSize = attribute.size;
  const attributeType = getAttributeTypeFromSize(attributeSize);
  const inputFormat = getFloat32VertexFormat(attributeSize);
  const bufferLayout = attribute.getBufferLayout();
  if (useFp64(attribute)) {
    return new import_engine5.BufferTransform(device, {
      vs: vs64,
      bufferLayout: [
        {
          name: "aFrom",
          byteStride: 8 * attributeSize,
          attributes: [
            { attribute: "aFrom", format: inputFormat, byteOffset: 0 },
            { attribute: "aFrom64Low", format: inputFormat, byteOffset: 4 * attributeSize }
          ]
        },
        {
          name: "aTo",
          byteStride: 8 * attributeSize,
          attributes: [
            { attribute: "aTo", format: inputFormat, byteOffset: 0 },
            { attribute: "aTo64Low", format: inputFormat, byteOffset: 4 * attributeSize }
          ]
        }
      ],
      // @ts-expect-error fp64 module only sets ONE uniform via defaultUniforms
      modules: [import_shadertools6.fp64arithmetic, interpolationUniforms],
      defines: {
        ATTRIBUTE_TYPE: attributeType,
        ATTRIBUTE_SIZE: attributeSize
      },
      // Default uniforms are not set without this
      moduleSettings: {},
      varyings: ["vCurrent", "vCurrent64Low"],
      bufferMode: 35980,
      disableWarnings: true
    });
  }
  return new import_engine5.BufferTransform(device, {
    vs: vs4,
    bufferLayout: [
      { name: "aFrom", format: inputFormat },
      { name: "aTo", format: bufferLayout.attributes[0].format }
    ],
    modules: [interpolationUniforms],
    defines: {
      ATTRIBUTE_TYPE: attributeType
    },
    varyings: ["vCurrent"],
    // TODO investigate why this is needed
    disableWarnings: true
  });
}

// dist/transitions/gpu-spring-transition.js
var import_engine6 = require("@luma.gl/engine");
var GPUSpringTransition = class extends GPUTransitionBase {
  constructor({ device, attribute, timeline }) {
    super({ device, attribute, timeline });
    this.type = "spring";
    this.texture = getTexture(device);
    this.framebuffer = getFramebuffer(device, this.texture);
    this.transform = getTransform2(device, attribute);
  }
  start(transitionSettings, numInstances) {
    const prevLength = this.currentLength;
    const prevStartIndices = this.currentStartIndices;
    super.start(transitionSettings, numInstances);
    const { buffers, attribute } = this;
    for (let i = 0; i < 2; i++) {
      buffers[i] = padBuffer({
        device: this.device,
        buffer: buffers[i],
        attribute,
        fromLength: prevLength,
        toLength: this.currentLength,
        fromStartIndices: prevStartIndices,
        getData: transitionSettings.enter
      });
    }
    buffers[2] = matchBuffer({
      device: this.device,
      source: buffers[0],
      target: buffers[2]
    });
    this.setBuffer(buffers[1]);
    const { model } = this.transform;
    model.setVertexCount(Math.floor(this.currentLength / attribute.size));
    if (attribute.isConstant) {
      model.setConstantAttributes({ aTo: attribute.value });
    } else {
      model.setAttributes({ aTo: attribute.getBuffer() });
    }
  }
  onUpdate() {
    const { buffers, transform, framebuffer, transition } = this;
    const settings = this.settings;
    transform.model.setAttributes({
      aPrev: buffers[0],
      aCur: buffers[1]
    });
    transform.transformFeedback.setBuffers({ vNext: buffers[2] });
    const springProps = {
      stiffness: settings.stiffness,
      damping: settings.damping
    };
    transform.model.shaderInputs.setProps({ spring: springProps });
    transform.run({
      framebuffer,
      discard: false,
      parameters: { viewport: [0, 0, 1, 1] },
      clearColor: [0, 0, 0, 0]
    });
    cycleBuffers(buffers);
    this.setBuffer(buffers[1]);
    const isTransitioning = this.device.readPixelsToArrayWebGL(framebuffer)[0] > 0;
    if (!isTransitioning) {
      transition.end();
    }
  }
  delete() {
    super.delete();
    this.transform.destroy();
    this.texture.destroy();
    this.framebuffer.destroy();
  }
};
var uniformBlock5 = `uniform springUniforms {
  float damping;
  float stiffness;
} spring;
`;
var springUniforms = {
  name: "spring",
  vs: uniformBlock5,
  uniformTypes: {
    damping: "f32",
    stiffness: "f32"
  }
};
var vs5 = `#version 300 es
#define SHADER_NAME spring-transition-vertex-shader

#define EPSILON 0.00001

in ATTRIBUTE_TYPE aPrev;
in ATTRIBUTE_TYPE aCur;
in ATTRIBUTE_TYPE aTo;
out ATTRIBUTE_TYPE vNext;
out float vIsTransitioningFlag;

ATTRIBUTE_TYPE getNextValue(ATTRIBUTE_TYPE cur, ATTRIBUTE_TYPE prev, ATTRIBUTE_TYPE dest) {
  ATTRIBUTE_TYPE velocity = cur - prev;
  ATTRIBUTE_TYPE delta = dest - cur;
  ATTRIBUTE_TYPE force = delta * spring.stiffness;
  ATTRIBUTE_TYPE resistance = velocity * spring.damping;
  return force - resistance + velocity + cur;
}

void main(void) {
  bool isTransitioning = length(aCur - aPrev) > EPSILON || length(aTo - aCur) > EPSILON;
  vIsTransitioningFlag = isTransitioning ? 1.0 : 0.0;

  vNext = getNextValue(aCur, aPrev, aTo);
  gl_Position = vec4(0, 0, 0, 1);
  gl_PointSize = 100.0;
}
`;
var fs3 = `#version 300 es
#define SHADER_NAME spring-transition-is-transitioning-fragment-shader

in float vIsTransitioningFlag;

out vec4 fragColor;

void main(void) {
  if (vIsTransitioningFlag == 0.0) {
    discard;
  }
  fragColor = vec4(1.0);
}`;
function getTransform2(device, attribute) {
  const attributeType = getAttributeTypeFromSize(attribute.size);
  const format = getFloat32VertexFormat(attribute.size);
  return new import_engine6.BufferTransform(device, {
    vs: vs5,
    fs: fs3,
    bufferLayout: [
      { name: "aPrev", format },
      { name: "aCur", format },
      { name: "aTo", format: attribute.getBufferLayout().attributes[0].format }
    ],
    varyings: ["vNext"],
    modules: [springUniforms],
    defines: { ATTRIBUTE_TYPE: attributeType },
    parameters: {
      depthCompare: "always",
      blendColorOperation: "max",
      blendColorSrcFactor: "one",
      blendColorDstFactor: "one",
      blendAlphaOperation: "max",
      blendAlphaSrcFactor: "one",
      blendAlphaDstFactor: "one"
    }
  });
}
function getTexture(device) {
  return device.createTexture({
    data: new Uint8Array(4),
    format: "rgba8unorm",
    mipmaps: false,
    width: 1,
    height: 1
  });
}
function getFramebuffer(device, texture) {
  return device.createFramebuffer({
    id: "spring-transition-is-transitioning-framebuffer",
    width: 1,
    height: 1,
    colorAttachments: [texture]
  });
}

// dist/lib/attribute/attribute-transition-manager.js
var TRANSITION_TYPES = {
  interpolation: GPUInterpolationTransition,
  spring: GPUSpringTransition
};
var AttributeTransitionManager = class {
  constructor(device, { id, timeline }) {
    if (!device)
      throw new Error("AttributeTransitionManager is constructed without device");
    this.id = id;
    this.device = device;
    this.timeline = timeline;
    this.transitions = {};
    this.needsRedraw = false;
    this.numInstances = 1;
  }
  finalize() {
    for (const attributeName in this.transitions) {
      this._removeTransition(attributeName);
    }
  }
  /* Public methods */
  // Called when attribute manager updates
  // Check the latest attributes for updates.
  update({ attributes, transitions, numInstances }) {
    this.numInstances = numInstances || 1;
    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];
      const settings = attribute.getTransitionSetting(transitions);
      if (!settings)
        continue;
      this._updateAttribute(attributeName, attribute, settings);
    }
    for (const attributeName in this.transitions) {
      const attribute = attributes[attributeName];
      if (!attribute || !attribute.getTransitionSetting(transitions)) {
        this._removeTransition(attributeName);
      }
    }
  }
  // Returns `true` if attribute is transition-enabled
  hasAttribute(attributeName) {
    const transition = this.transitions[attributeName];
    return transition && transition.inProgress;
  }
  // Get all the animated attributes
  getAttributes() {
    const animatedAttributes = {};
    for (const attributeName in this.transitions) {
      const transition = this.transitions[attributeName];
      if (transition.inProgress) {
        animatedAttributes[attributeName] = transition.attributeInTransition;
      }
    }
    return animatedAttributes;
  }
  /* eslint-disable max-statements */
  // Called every render cycle, run transform feedback
  // Returns `true` if anything changes
  run() {
    if (this.numInstances === 0) {
      return false;
    }
    for (const attributeName in this.transitions) {
      const updated = this.transitions[attributeName].update();
      if (updated) {
        this.needsRedraw = true;
      }
    }
    const needsRedraw = this.needsRedraw;
    this.needsRedraw = false;
    return needsRedraw;
  }
  /* eslint-enable max-statements */
  /* Private methods */
  _removeTransition(attributeName) {
    this.transitions[attributeName].delete();
    delete this.transitions[attributeName];
  }
  // Check an attributes for updates
  // Returns a transition object if a new transition is triggered.
  _updateAttribute(attributeName, attribute, settings) {
    const transition = this.transitions[attributeName];
    let isNew = !transition || transition.type !== settings.type;
    if (isNew) {
      if (transition) {
        this._removeTransition(attributeName);
      }
      const TransitionType = TRANSITION_TYPES[settings.type];
      if (TransitionType) {
        this.transitions[attributeName] = new TransitionType({
          attribute,
          timeline: this.timeline,
          device: this.device
        });
      } else {
        log_default.error(`unsupported transition type '${settings.type}'`)();
        isNew = false;
      }
    }
    if (isNew || attribute.needsRedraw()) {
      this.needsRedraw = true;
      this.transitions[attributeName].start(settings, this.numInstances);
    }
  }
};

// dist/lib/attribute/attribute-manager.js
var TRACE_INVALIDATE = "attributeManager.invalidate";
var TRACE_UPDATE_START = "attributeManager.updateStart";
var TRACE_UPDATE_END = "attributeManager.updateEnd";
var TRACE_ATTRIBUTE_UPDATE_START = "attribute.updateStart";
var TRACE_ATTRIBUTE_ALLOCATE = "attribute.allocate";
var TRACE_ATTRIBUTE_UPDATE_END = "attribute.updateEnd";
var AttributeManager = class {
  constructor(device, { id = "attribute-manager", stats, timeline } = {}) {
    this.mergeBoundsMemoized = memoize(mergeBounds);
    this.id = id;
    this.device = device;
    this.attributes = {};
    this.updateTriggers = {};
    this.needsRedraw = true;
    this.userData = {};
    this.stats = stats;
    this.attributeTransitionManager = new AttributeTransitionManager(device, {
      id: `${id}-transitions`,
      timeline
    });
    Object.seal(this);
  }
  finalize() {
    for (const attributeName in this.attributes) {
      this.attributes[attributeName].delete();
    }
    this.attributeTransitionManager.finalize();
  }
  // Returns the redraw flag, optionally clearing it.
  // Redraw flag will be set if any attributes attributes changed since
  // flag was last cleared.
  //
  // @param {String} [clearRedrawFlags=false] - whether to clear the flag
  // @return {false|String} - reason a redraw is needed.
  getNeedsRedraw(opts = { clearRedrawFlags: false }) {
    const redraw = this.needsRedraw;
    this.needsRedraw = this.needsRedraw && !opts.clearRedrawFlags;
    return redraw && this.id;
  }
  // Sets the redraw flag.
  // @param {Boolean} redraw=true
  setNeedsRedraw() {
    this.needsRedraw = true;
  }
  // Adds attributes
  add(attributes) {
    this._add(attributes);
  }
  // Adds attributes
  addInstanced(attributes) {
    this._add(attributes, { stepMode: "instance" });
  }
  /**
   * Removes attributes
   * Takes an array of attribute names and delete them from
   * the attribute map if they exists
   *
   * @example
   * attributeManager.remove(['position']);
   *
   * @param {Object} attributeNameArray - attribute name array (see above)
   */
  remove(attributeNameArray) {
    for (const name of attributeNameArray) {
      if (this.attributes[name] !== void 0) {
        this.attributes[name].delete();
        delete this.attributes[name];
      }
    }
  }
  // Marks an attribute for update
  invalidate(triggerName, dataRange) {
    const invalidatedAttributes = this._invalidateTrigger(triggerName, dataRange);
    debug(TRACE_INVALIDATE, this, triggerName, invalidatedAttributes);
  }
  invalidateAll(dataRange) {
    for (const attributeName in this.attributes) {
      this.attributes[attributeName].setNeedsUpdate(attributeName, dataRange);
    }
    debug(TRACE_INVALIDATE, this, "all");
  }
  // Ensure all attribute buffers are updated from props or data.
  // eslint-disable-next-line complexity
  update({ data, numInstances, startIndices = null, transitions, props = {}, buffers = {}, context = {} }) {
    let updated = false;
    debug(TRACE_UPDATE_START, this);
    if (this.stats) {
      this.stats.get("Update Attributes").timeStart();
    }
    for (const attributeName in this.attributes) {
      const attribute = this.attributes[attributeName];
      const accessorName = attribute.settings.accessor;
      attribute.startIndices = startIndices;
      attribute.numInstances = numInstances;
      if (props[attributeName]) {
        log_default.removed(`props.${attributeName}`, `data.attributes.${attributeName}`)();
      }
      if (attribute.setExternalBuffer(buffers[attributeName])) {
      } else if (attribute.setBinaryValue(typeof accessorName === "string" ? buffers[accessorName] : void 0, data.startIndices)) {
      } else if (typeof accessorName === "string" && !buffers[accessorName] && attribute.setConstantValue(props[accessorName])) {
      } else if (attribute.needsUpdate()) {
        updated = true;
        this._updateAttribute({
          attribute,
          numInstances,
          data,
          props,
          context
        });
      }
      this.needsRedraw = this.needsRedraw || attribute.needsRedraw();
    }
    if (updated) {
      debug(TRACE_UPDATE_END, this, numInstances);
    }
    if (this.stats) {
      this.stats.get("Update Attributes").timeEnd();
    }
    this.attributeTransitionManager.update({
      attributes: this.attributes,
      numInstances,
      transitions
    });
  }
  // Update attribute transition to the current timestamp
  // Returns `true` if any transition is in progress
  updateTransition() {
    const { attributeTransitionManager } = this;
    const transitionUpdated = attributeTransitionManager.run();
    this.needsRedraw = this.needsRedraw || transitionUpdated;
    return transitionUpdated;
  }
  /**
   * Returns all attribute descriptors
   * Note: Format matches luma.gl Model/Program.setAttributes()
   * @return {Object} attributes - descriptors
   */
  getAttributes() {
    return { ...this.attributes, ...this.attributeTransitionManager.getAttributes() };
  }
  /**
   * Computes the spatial bounds of a given set of attributes
   */
  getBounds(attributeNames) {
    const bounds = attributeNames.map((attributeName) => {
      var _a;
      return (_a = this.attributes[attributeName]) == null ? void 0 : _a.getBounds();
    });
    return this.mergeBoundsMemoized(bounds);
  }
  /**
   * Returns changed attribute descriptors
   * This indicates which WebGLBuffers need to be updated
   * @return {Object} attributes - descriptors
   */
  getChangedAttributes(opts = { clearChangedFlags: false }) {
    const { attributes, attributeTransitionManager } = this;
    const changedAttributes = { ...attributeTransitionManager.getAttributes() };
    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];
      if (attribute.needsRedraw(opts) && !attributeTransitionManager.hasAttribute(attributeName)) {
        changedAttributes[attributeName] = attribute;
      }
    }
    return changedAttributes;
  }
  /** Generate WebGPU-style buffer layout descriptors from all attributes */
  getBufferLayouts(modelInfo) {
    return Object.values(this.getAttributes()).map((attribute) => attribute.getBufferLayout(modelInfo));
  }
  // PRIVATE METHODS
  /** Register new attributes */
  _add(attributes, overrideOptions) {
    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];
      const props = {
        ...attribute,
        id: attributeName,
        size: attribute.isIndexed && 1 || attribute.size || 1,
        ...overrideOptions
      };
      this.attributes[attributeName] = new Attribute(this.device, props);
    }
    this._mapUpdateTriggersToAttributes();
  }
  // build updateTrigger name to attribute name mapping
  _mapUpdateTriggersToAttributes() {
    const triggers = {};
    for (const attributeName in this.attributes) {
      const attribute = this.attributes[attributeName];
      attribute.getUpdateTriggers().forEach((triggerName) => {
        if (!triggers[triggerName]) {
          triggers[triggerName] = [];
        }
        triggers[triggerName].push(attributeName);
      });
    }
    this.updateTriggers = triggers;
  }
  _invalidateTrigger(triggerName, dataRange) {
    const { attributes, updateTriggers } = this;
    const invalidatedAttributes = updateTriggers[triggerName];
    if (invalidatedAttributes) {
      invalidatedAttributes.forEach((name) => {
        const attribute = attributes[name];
        if (attribute) {
          attribute.setNeedsUpdate(attribute.id, dataRange);
        }
      });
    }
    return invalidatedAttributes;
  }
  _updateAttribute(opts) {
    const { attribute, numInstances } = opts;
    debug(TRACE_ATTRIBUTE_UPDATE_START, attribute);
    if (attribute.constant) {
      attribute.setConstantValue(attribute.value);
      return;
    }
    if (attribute.allocate(numInstances)) {
      debug(TRACE_ATTRIBUTE_ALLOCATE, attribute, numInstances);
    }
    const updated = attribute.updateBuffer(opts);
    if (updated) {
      this.needsRedraw = true;
      debug(TRACE_ATTRIBUTE_UPDATE_END, attribute, numInstances);
    }
  }
};

// dist/lib/layer.js
var import_core19 = require("@luma.gl/core");
var import_webgl2 = require("@luma.gl/webgl");

// dist/transitions/cpu-interpolation-transition.js
var import_core17 = require("@math.gl/core");
var CPUInterpolationTransition = class extends Transition {
  get value() {
    return this._value;
  }
  _onUpdate() {
    const { time, settings: { fromValue, toValue, duration, easing } } = this;
    const t = easing(time / duration);
    this._value = (0, import_core17.lerp)(fromValue, toValue, t);
  }
};

// dist/transitions/cpu-spring-transition.js
var EPSILON = 1e-5;
function updateSpringElement(prev, cur, dest, damping, stiffness) {
  const velocity = cur - prev;
  const delta = dest - cur;
  const spring = delta * stiffness;
  const damper = -velocity * damping;
  return spring + damper + velocity + cur;
}
function updateSpring(prev, cur, dest, damping, stiffness) {
  if (Array.isArray(dest)) {
    const next = [];
    for (let i = 0; i < dest.length; i++) {
      next[i] = updateSpringElement(prev[i], cur[i], dest[i], damping, stiffness);
    }
    return next;
  }
  return updateSpringElement(prev, cur, dest, damping, stiffness);
}
function distance(value1, value2) {
  if (Array.isArray(value1)) {
    let distanceSquare = 0;
    for (let i = 0; i < value1.length; i++) {
      const d = value1[i] - value2[i];
      distanceSquare += d * d;
    }
    return Math.sqrt(distanceSquare);
  }
  return Math.abs(value1 - value2);
}
var CPUSpringTransition = class extends Transition {
  get value() {
    return this._currValue;
  }
  _onUpdate() {
    const { fromValue, toValue, damping, stiffness } = this.settings;
    const { _prevValue = fromValue, _currValue = fromValue } = this;
    let nextValue = updateSpring(_prevValue, _currValue, toValue, damping, stiffness);
    const delta = distance(nextValue, toValue);
    const velocity = distance(nextValue, _currValue);
    if (delta < EPSILON && velocity < EPSILON) {
      nextValue = toValue;
      this.end();
    }
    this._prevValue = _currValue;
    this._currValue = nextValue;
  }
};

// dist/lib/uniform-transition-manager.js
var TRANSITION_TYPES2 = {
  interpolation: CPUInterpolationTransition,
  spring: CPUSpringTransition
};
var UniformTransitionManager = class {
  constructor(timeline) {
    this.transitions = /* @__PURE__ */ new Map();
    this.timeline = timeline;
  }
  get active() {
    return this.transitions.size > 0;
  }
  add(key, fromValue, toValue, settings) {
    const { transitions } = this;
    if (transitions.has(key)) {
      const transition2 = transitions.get(key);
      const { value = transition2.settings.fromValue } = transition2;
      fromValue = value;
      this.remove(key);
    }
    settings = normalizeTransitionSettings(settings);
    if (!settings) {
      return;
    }
    const TransitionType = TRANSITION_TYPES2[settings.type];
    if (!TransitionType) {
      log_default.error(`unsupported transition type '${settings.type}'`)();
      return;
    }
    const transition = new TransitionType(this.timeline);
    transition.start({
      ...settings,
      fromValue,
      toValue
    });
    transitions.set(key, transition);
  }
  remove(key) {
    const { transitions } = this;
    if (transitions.has(key)) {
      transitions.get(key).cancel();
      transitions.delete(key);
    }
  }
  update() {
    const propsInTransition = {};
    for (const [key, transition] of this.transitions) {
      transition.update();
      propsInTransition[key] = transition.value;
      if (!transition.inProgress) {
        this.remove(key);
      }
    }
    return propsInTransition;
  }
  clear() {
    for (const key of this.transitions.keys()) {
      this.remove(key);
    }
  }
};

// dist/lifecycle/props.js
function validateProps(props) {
  const propTypes = props[PROP_TYPES_SYMBOL];
  for (const propName in propTypes) {
    const propType = propTypes[propName];
    const { validate } = propType;
    if (validate && !validate(props[propName], propType)) {
      throw new Error(`Invalid prop ${propName}: ${props[propName]}`);
    }
  }
}
function diffProps(props, oldProps) {
  const propsChangedReason = compareProps({
    newProps: props,
    oldProps,
    propTypes: props[PROP_TYPES_SYMBOL],
    ignoreProps: { data: null, updateTriggers: null, extensions: null, transitions: null }
  });
  const dataChangedReason = diffDataProps(props, oldProps);
  let updateTriggersChangedReason = false;
  if (!dataChangedReason) {
    updateTriggersChangedReason = diffUpdateTriggers(props, oldProps);
  }
  return {
    dataChanged: dataChangedReason,
    propsChanged: propsChangedReason,
    updateTriggersChanged: updateTriggersChangedReason,
    extensionsChanged: diffExtensions(props, oldProps),
    transitionsChanged: diffTransitions(props, oldProps)
  };
}
function diffTransitions(props, oldProps) {
  if (!props.transitions) {
    return false;
  }
  const result = {};
  const propTypes = props[PROP_TYPES_SYMBOL];
  let changed = false;
  for (const key in props.transitions) {
    const propType = propTypes[key];
    const type = propType && propType.type;
    const isTransitionable = type === "number" || type === "color" || type === "array";
    if (isTransitionable && comparePropValues(props[key], oldProps[key], propType)) {
      result[key] = true;
      changed = true;
    }
  }
  return changed ? result : false;
}
function compareProps({ newProps, oldProps, ignoreProps = {}, propTypes = {}, triggerName = "props" }) {
  if (oldProps === newProps) {
    return false;
  }
  if (typeof newProps !== "object" || newProps === null) {
    return `${triggerName} changed shallowly`;
  }
  if (typeof oldProps !== "object" || oldProps === null) {
    return `${triggerName} changed shallowly`;
  }
  for (const key of Object.keys(newProps)) {
    if (!(key in ignoreProps)) {
      if (!(key in oldProps)) {
        return `${triggerName}.${key} added`;
      }
      const changed = comparePropValues(newProps[key], oldProps[key], propTypes[key]);
      if (changed) {
        return `${triggerName}.${key} ${changed}`;
      }
    }
  }
  for (const key of Object.keys(oldProps)) {
    if (!(key in ignoreProps)) {
      if (!(key in newProps)) {
        return `${triggerName}.${key} dropped`;
      }
      if (!Object.hasOwnProperty.call(newProps, key)) {
        const changed = comparePropValues(newProps[key], oldProps[key], propTypes[key]);
        if (changed) {
          return `${triggerName}.${key} ${changed}`;
        }
      }
    }
  }
  return false;
}
function comparePropValues(newProp, oldProp, propType) {
  let equal = propType && propType.equal;
  if (equal && !equal(newProp, oldProp, propType)) {
    return "changed deeply";
  }
  if (!equal) {
    equal = newProp && oldProp && newProp.equals;
    if (equal && !equal.call(newProp, oldProp)) {
      return "changed deeply";
    }
  }
  if (!equal && oldProp !== newProp) {
    return "changed shallowly";
  }
  return null;
}
function diffDataProps(props, oldProps) {
  if (oldProps === null) {
    return "oldProps is null, initial diff";
  }
  let dataChanged = false;
  const { dataComparator, _dataDiff } = props;
  if (dataComparator) {
    if (!dataComparator(props.data, oldProps.data)) {
      dataChanged = "Data comparator detected a change";
    }
  } else if (props.data !== oldProps.data) {
    dataChanged = "A new data container was supplied";
  }
  if (dataChanged && _dataDiff) {
    dataChanged = _dataDiff(props.data, oldProps.data) || dataChanged;
  }
  return dataChanged;
}
function diffUpdateTriggers(props, oldProps) {
  if (oldProps === null) {
    return { all: true };
  }
  if ("all" in props.updateTriggers) {
    const diffReason = diffUpdateTrigger(props, oldProps, "all");
    if (diffReason) {
      return { all: true };
    }
  }
  const reason = {};
  let changed = false;
  for (const triggerName in props.updateTriggers) {
    if (triggerName !== "all") {
      const diffReason = diffUpdateTrigger(props, oldProps, triggerName);
      if (diffReason) {
        reason[triggerName] = true;
        changed = true;
      }
    }
  }
  return changed ? reason : false;
}
function diffExtensions(props, oldProps) {
  if (oldProps === null) {
    return true;
  }
  const oldExtensions = oldProps.extensions;
  const { extensions } = props;
  if (extensions === oldExtensions) {
    return false;
  }
  if (!oldExtensions || !extensions) {
    return true;
  }
  if (extensions.length !== oldExtensions.length) {
    return true;
  }
  for (let i = 0; i < extensions.length; i++) {
    if (!extensions[i].equals(oldExtensions[i])) {
      return true;
    }
  }
  return false;
}
function diffUpdateTrigger(props, oldProps, triggerName) {
  let newTriggers = props.updateTriggers[triggerName];
  newTriggers = newTriggers === void 0 || newTriggers === null ? {} : newTriggers;
  let oldTriggers = oldProps.updateTriggers[triggerName];
  oldTriggers = oldTriggers === void 0 || oldTriggers === null ? {} : oldTriggers;
  const diffReason = compareProps({
    oldProps: oldTriggers,
    newProps: newTriggers,
    triggerName
  });
  return diffReason;
}

// dist/utils/count.js
var ERR_NOT_OBJECT = "count(): argument not an object";
var ERR_NOT_CONTAINER = "count(): argument not a container";
function count(container) {
  if (!isObject(container)) {
    throw new Error(ERR_NOT_OBJECT);
  }
  if (typeof container.count === "function") {
    return container.count();
  }
  if (Number.isFinite(container.size)) {
    return container.size;
  }
  if (Number.isFinite(container.length)) {
    return container.length;
  }
  if (isPlainObject(container)) {
    return Object.keys(container).length;
  }
  throw new Error(ERR_NOT_CONTAINER);
}
function isPlainObject(value) {
  return value !== null && typeof value === "object" && value.constructor === Object;
}
function isObject(value) {
  return value !== null && typeof value === "object";
}

// dist/utils/shader.js
function mergeShaders(target, source) {
  if (!source) {
    return target;
  }
  const result = { ...target, ...source };
  if ("defines" in source) {
    result.defines = { ...target.defines, ...source.defines };
  }
  if ("modules" in source) {
    result.modules = (target.modules || []).concat(source.modules);
    if (source.modules.some((module2) => module2.name === "project64")) {
      const index = result.modules.findIndex((module2) => module2.name === "project32");
      if (index >= 0) {
        result.modules.splice(index, 1);
      }
    }
  }
  if ("inject" in source) {
    if (!target.inject) {
      result.inject = source.inject;
    } else {
      const mergedInjection = { ...target.inject };
      for (const key in source.inject) {
        mergedInjection[key] = (mergedInjection[key] || "") + source.inject[key];
      }
      result.inject = mergedInjection;
    }
  }
  return result;
}

// dist/utils/texture.js
var import_core18 = require("@luma.gl/core");
var DEFAULT_TEXTURE_PARAMETERS = {
  minFilter: "linear",
  mipmapFilter: "linear",
  magFilter: "linear",
  addressModeU: "clamp-to-edge",
  addressModeV: "clamp-to-edge"
};
var internalTextures = {};
function createTexture(owner, device, image, sampler) {
  if (image instanceof import_core18.Texture) {
    return image;
  } else if (image.constructor && image.constructor.name !== "Object") {
    image = { data: image };
  }
  let samplerParameters = null;
  if (image.compressed) {
    samplerParameters = {
      minFilter: "linear",
      mipmapFilter: image.data.length > 1 ? "nearest" : "linear"
    };
  }
  const texture = device.createTexture({
    ...image,
    sampler: {
      ...DEFAULT_TEXTURE_PARAMETERS,
      ...samplerParameters,
      ...sampler
    },
    mipmaps: true
  });
  internalTextures[texture.id] = owner;
  return texture;
}
function destroyTexture(owner, texture) {
  if (!texture || !(texture instanceof import_core18.Texture)) {
    return;
  }
  if (internalTextures[texture.id] === owner) {
    texture.delete();
    delete internalTextures[texture.id];
  }
}

// dist/lifecycle/prop-types.js
var TYPE_DEFINITIONS = {
  boolean: {
    validate(value, propType) {
      return true;
    },
    equal(value1, value2, propType) {
      return Boolean(value1) === Boolean(value2);
    }
  },
  number: {
    validate(value, propType) {
      return Number.isFinite(value) && (!("max" in propType) || value <= propType.max) && (!("min" in propType) || value >= propType.min);
    }
  },
  color: {
    validate(value, propType) {
      return propType.optional && !value || isArray(value) && (value.length === 3 || value.length === 4);
    },
    equal(value1, value2, propType) {
      return deepEqual(value1, value2, 1);
    }
  },
  accessor: {
    validate(value, propType) {
      const valueType = getTypeOf(value);
      return valueType === "function" || valueType === getTypeOf(propType.value);
    },
    equal(value1, value2, propType) {
      if (typeof value2 === "function") {
        return true;
      }
      return deepEqual(value1, value2, 1);
    }
  },
  array: {
    validate(value, propType) {
      return propType.optional && !value || isArray(value);
    },
    equal(value1, value2, propType) {
      const { compare } = propType;
      const depth = Number.isInteger(compare) ? compare : compare ? 1 : 0;
      return compare ? deepEqual(value1, value2, depth) : value1 === value2;
    }
  },
  object: {
    equal(value1, value2, propType) {
      if (propType.ignore) {
        return true;
      }
      const { compare } = propType;
      const depth = Number.isInteger(compare) ? compare : compare ? 1 : 0;
      return compare ? deepEqual(value1, value2, depth) : value1 === value2;
    }
  },
  function: {
    validate(value, propType) {
      return propType.optional && !value || typeof value === "function";
    },
    equal(value1, value2, propType) {
      const shouldIgnore = !propType.compare && propType.ignore !== false;
      return shouldIgnore || value1 === value2;
    }
  },
  data: {
    transform: (value, propType, component) => {
      if (!value) {
        return value;
      }
      const { dataTransform } = component.props;
      if (dataTransform) {
        return dataTransform(value);
      }
      if (typeof value.shape === "string" && value.shape.endsWith("-table") && Array.isArray(value.data)) {
        return value.data;
      }
      return value;
    }
  },
  image: {
    transform: (value, propType, component) => {
      const context = component.context;
      if (!context || !context.device) {
        return null;
      }
      return createTexture(component.id, context.device, value, {
        ...propType.parameters,
        ...component.props.textureParameters
      });
    },
    release: (value, propType, component) => {
      destroyTexture(component.id, value);
    }
  }
};
function parsePropTypes(propDefs) {
  const propTypes = {};
  const defaultProps3 = {};
  const deprecatedProps = {};
  for (const [propName, propDef] of Object.entries(propDefs)) {
    const deprecated = propDef == null ? void 0 : propDef.deprecatedFor;
    if (deprecated) {
      deprecatedProps[propName] = Array.isArray(deprecated) ? deprecated : [deprecated];
    } else {
      const propType = parsePropType(propName, propDef);
      propTypes[propName] = propType;
      defaultProps3[propName] = propType.value;
    }
  }
  return { propTypes, defaultProps: defaultProps3, deprecatedProps };
}
function parsePropType(name, propDef) {
  switch (getTypeOf(propDef)) {
    case "object":
      return normalizePropDefinition(name, propDef);
    case "array":
      return normalizePropDefinition(name, { type: "array", value: propDef, compare: false });
    case "boolean":
      return normalizePropDefinition(name, { type: "boolean", value: propDef });
    case "number":
      return normalizePropDefinition(name, { type: "number", value: propDef });
    case "function":
      return normalizePropDefinition(name, { type: "function", value: propDef, compare: true });
    default:
      return { name, type: "unknown", value: propDef };
  }
}
function normalizePropDefinition(name, propDef) {
  if (!("type" in propDef)) {
    if (!("value" in propDef)) {
      return { name, type: "object", value: propDef };
    }
    return { name, type: getTypeOf(propDef.value), ...propDef };
  }
  return { name, ...TYPE_DEFINITIONS[propDef.type], ...propDef };
}
function isArray(value) {
  return Array.isArray(value) || ArrayBuffer.isView(value);
}
function getTypeOf(value) {
  if (isArray(value)) {
    return "array";
  }
  if (value === null) {
    return "null";
  }
  return typeof value;
}

// dist/lifecycle/create-props.js
function createProps(component, propObjects) {
  let extensions;
  for (let i = propObjects.length - 1; i >= 0; i--) {
    const props = propObjects[i];
    if ("extensions" in props) {
      extensions = props.extensions;
    }
  }
  const propsPrototype = getPropsPrototype(component.constructor, extensions);
  const propsInstance = Object.create(propsPrototype);
  propsInstance[COMPONENT_SYMBOL] = component;
  propsInstance[ASYNC_ORIGINAL_SYMBOL] = {};
  propsInstance[ASYNC_RESOLVED_SYMBOL] = {};
  for (let i = 0; i < propObjects.length; ++i) {
    const props = propObjects[i];
    for (const key in props) {
      propsInstance[key] = props[key];
    }
  }
  Object.freeze(propsInstance);
  return propsInstance;
}
var MergedDefaultPropsCacheKey = "_mergedDefaultProps";
function getPropsPrototype(componentClass, extensions) {
  if (!(componentClass instanceof component_default.constructor))
    return {};
  let cacheKey = MergedDefaultPropsCacheKey;
  if (extensions) {
    for (const extension of extensions) {
      const ExtensionClass = extension.constructor;
      if (ExtensionClass) {
        cacheKey += `:${ExtensionClass.extensionName || ExtensionClass.name}`;
      }
    }
  }
  const defaultProps3 = getOwnProperty(componentClass, cacheKey);
  if (!defaultProps3) {
    return componentClass[cacheKey] = createPropsPrototypeAndTypes(componentClass, extensions || []);
  }
  return defaultProps3;
}
function createPropsPrototypeAndTypes(componentClass, extensions) {
  const parent = componentClass.prototype;
  if (!parent) {
    return null;
  }
  const parentClass = Object.getPrototypeOf(componentClass);
  const parentDefaultProps = getPropsPrototype(parentClass);
  const componentDefaultProps = getOwnProperty(componentClass, "defaultProps") || {};
  const componentPropDefs = parsePropTypes(componentDefaultProps);
  const defaultProps3 = Object.assign(/* @__PURE__ */ Object.create(null), parentDefaultProps, componentPropDefs.defaultProps);
  const propTypes = Object.assign(/* @__PURE__ */ Object.create(null), parentDefaultProps == null ? void 0 : parentDefaultProps[PROP_TYPES_SYMBOL], componentPropDefs.propTypes);
  const deprecatedProps = Object.assign(/* @__PURE__ */ Object.create(null), parentDefaultProps == null ? void 0 : parentDefaultProps[DEPRECATED_PROPS_SYMBOL], componentPropDefs.deprecatedProps);
  for (const extension of extensions) {
    const extensionDefaultProps = getPropsPrototype(extension.constructor);
    if (extensionDefaultProps) {
      Object.assign(defaultProps3, extensionDefaultProps);
      Object.assign(propTypes, extensionDefaultProps[PROP_TYPES_SYMBOL]);
      Object.assign(deprecatedProps, extensionDefaultProps[DEPRECATED_PROPS_SYMBOL]);
    }
  }
  createPropsPrototype(defaultProps3, componentClass);
  addAsyncPropsToPropPrototype(defaultProps3, propTypes);
  addDeprecatedPropsToPropPrototype(defaultProps3, deprecatedProps);
  defaultProps3[PROP_TYPES_SYMBOL] = propTypes;
  defaultProps3[DEPRECATED_PROPS_SYMBOL] = deprecatedProps;
  if (extensions.length === 0 && !hasOwnProperty(componentClass, "_propTypes")) {
    componentClass._propTypes = propTypes;
  }
  return defaultProps3;
}
function createPropsPrototype(defaultProps3, componentClass) {
  const id = getComponentName(componentClass);
  Object.defineProperties(defaultProps3, {
    // `id` is treated specially because layer might need to override it
    id: {
      writable: true,
      value: id
    }
  });
}
function addDeprecatedPropsToPropPrototype(defaultProps3, deprecatedProps) {
  for (const propName in deprecatedProps) {
    Object.defineProperty(defaultProps3, propName, {
      enumerable: false,
      set(newValue) {
        const nameStr = `${this.id}: ${propName}`;
        for (const newPropName of deprecatedProps[propName]) {
          if (!hasOwnProperty(this, newPropName)) {
            this[newPropName] = newValue;
          }
        }
        log_default.deprecated(nameStr, deprecatedProps[propName].join("/"))();
      }
    });
  }
}
function addAsyncPropsToPropPrototype(defaultProps3, propTypes) {
  const defaultValues = {};
  const descriptors = {};
  for (const propName in propTypes) {
    const propType = propTypes[propName];
    const { name, value } = propType;
    if (propType.async) {
      defaultValues[name] = value;
      descriptors[name] = getDescriptorForAsyncProp(name);
    }
  }
  defaultProps3[ASYNC_DEFAULTS_SYMBOL] = defaultValues;
  defaultProps3[ASYNC_ORIGINAL_SYMBOL] = {};
  Object.defineProperties(defaultProps3, descriptors);
}
function getDescriptorForAsyncProp(name) {
  return {
    enumerable: true,
    // Save the provided value for async props in a special map
    set(newValue) {
      if (typeof newValue === "string" || newValue instanceof Promise || isAsyncIterable(newValue)) {
        this[ASYNC_ORIGINAL_SYMBOL][name] = newValue;
      } else {
        this[ASYNC_RESOLVED_SYMBOL][name] = newValue;
      }
    },
    // Only the component's state knows the true value of async prop
    get() {
      if (this[ASYNC_RESOLVED_SYMBOL]) {
        if (name in this[ASYNC_RESOLVED_SYMBOL]) {
          const value = this[ASYNC_RESOLVED_SYMBOL][name];
          return value || this[ASYNC_DEFAULTS_SYMBOL][name];
        }
        if (name in this[ASYNC_ORIGINAL_SYMBOL]) {
          const state = this[COMPONENT_SYMBOL] && this[COMPONENT_SYMBOL].internalState;
          if (state && state.hasAsyncProp(name)) {
            return state.getAsyncProp(name) || this[ASYNC_DEFAULTS_SYMBOL][name];
          }
        }
      }
      return this[ASYNC_DEFAULTS_SYMBOL][name];
    }
  };
}
function hasOwnProperty(object, prop) {
  return Object.prototype.hasOwnProperty.call(object, prop);
}
function getOwnProperty(object, prop) {
  return hasOwnProperty(object, prop) && object[prop];
}
function getComponentName(componentClass) {
  const componentName = componentClass.componentName;
  if (!componentName) {
    log_default.warn(`${componentClass.name}.componentName not specified`)();
  }
  return componentName || componentClass.name;
}

// dist/lifecycle/component.js
var counter = 0;
var Component = class {
  constructor(...propObjects) {
    this.props = createProps(this, propObjects);
    this.id = this.props.id;
    this.count = counter++;
  }
  // clone this layer with modified props
  clone(newProps) {
    const { props } = this;
    const asyncProps = {};
    for (const key in props[ASYNC_DEFAULTS_SYMBOL]) {
      if (key in props[ASYNC_RESOLVED_SYMBOL]) {
        asyncProps[key] = props[ASYNC_RESOLVED_SYMBOL][key];
      } else if (key in props[ASYNC_ORIGINAL_SYMBOL]) {
        asyncProps[key] = props[ASYNC_ORIGINAL_SYMBOL][key];
      }
    }
    return new this.constructor({ ...props, ...asyncProps, ...newProps });
  }
};
Component.componentName = "Component";
Component.defaultProps = {};
var component_default = Component;

// dist/lifecycle/component-state.js
var EMPTY_PROPS = Object.freeze({});
var ComponentState = class {
  constructor(component) {
    this.component = component;
    this.asyncProps = {};
    this.onAsyncPropUpdated = () => {
    };
    this.oldProps = null;
    this.oldAsyncProps = null;
  }
  finalize() {
    for (const propName in this.asyncProps) {
      const asyncProp = this.asyncProps[propName];
      if (asyncProp && asyncProp.type && asyncProp.type.release) {
        asyncProp.type.release(asyncProp.resolvedValue, asyncProp.type, this.component);
      }
    }
    this.asyncProps = {};
    this.component = null;
    this.resetOldProps();
  }
  /* Layer-facing props API */
  getOldProps() {
    return this.oldAsyncProps || this.oldProps || EMPTY_PROPS;
  }
  resetOldProps() {
    this.oldAsyncProps = null;
    this.oldProps = this.component ? this.component.props : null;
  }
  // Checks if a prop is overridden
  hasAsyncProp(propName) {
    return propName in this.asyncProps;
  }
  // Returns value of an overriden prop
  getAsyncProp(propName) {
    const asyncProp = this.asyncProps[propName];
    return asyncProp && asyncProp.resolvedValue;
  }
  isAsyncPropLoading(propName) {
    if (propName) {
      const asyncProp = this.asyncProps[propName];
      return Boolean(asyncProp && asyncProp.pendingLoadCount > 0 && asyncProp.pendingLoadCount !== asyncProp.resolvedLoadCount);
    }
    for (const key in this.asyncProps) {
      if (this.isAsyncPropLoading(key)) {
        return true;
      }
    }
    return false;
  }
  // Without changing the original prop value, swap out the data resolution under the hood
  reloadAsyncProp(propName, value) {
    this._watchPromise(propName, Promise.resolve(value));
  }
  // Updates all async/overridden props (when new props come in)
  // Checks if urls have changed, starts loading, or removes override
  setAsyncProps(props) {
    this.component = props[COMPONENT_SYMBOL] || this.component;
    const resolvedValues = props[ASYNC_RESOLVED_SYMBOL] || {};
    const originalValues = props[ASYNC_ORIGINAL_SYMBOL] || props;
    const defaultValues = props[ASYNC_DEFAULTS_SYMBOL] || {};
    for (const propName in resolvedValues) {
      const value = resolvedValues[propName];
      this._createAsyncPropData(propName, defaultValues[propName]);
      this._updateAsyncProp(propName, value);
      resolvedValues[propName] = this.getAsyncProp(propName);
    }
    for (const propName in originalValues) {
      const value = originalValues[propName];
      this._createAsyncPropData(propName, defaultValues[propName]);
      this._updateAsyncProp(propName, value);
    }
  }
  /* Placeholder methods for subclassing */
  _fetch(propName, url) {
    return null;
  }
  _onResolve(propName, value) {
  }
  // eslint-disable-line @typescript-eslint/no-empty-function
  _onError(propName, error) {
  }
  // eslint-disable-line @typescript-eslint/no-empty-function
  // Intercept strings (URLs) and Promises and activates loading and prop rewriting
  _updateAsyncProp(propName, value) {
    if (!this._didAsyncInputValueChange(propName, value)) {
      return;
    }
    if (typeof value === "string") {
      value = this._fetch(propName, value);
    }
    if (value instanceof Promise) {
      this._watchPromise(propName, value);
      return;
    }
    if (isAsyncIterable(value)) {
      this._resolveAsyncIterable(propName, value);
      return;
    }
    this._setPropValue(propName, value);
  }
  // Whenever async props are changing, we need to make a copy of oldProps
  // otherwise the prop rewriting will affect the value both in props and oldProps.
  // While the copy is relatively expensive, this only happens on load completion.
  _freezeAsyncOldProps() {
    if (!this.oldAsyncProps && this.oldProps) {
      this.oldAsyncProps = Object.create(this.oldProps);
      for (const propName in this.asyncProps) {
        Object.defineProperty(this.oldAsyncProps, propName, {
          enumerable: true,
          value: this.oldProps[propName]
        });
      }
    }
  }
  // Checks if an input value actually changed (to avoid reloading/rewatching promises/urls)
  _didAsyncInputValueChange(propName, value) {
    const asyncProp = this.asyncProps[propName];
    if (value === asyncProp.resolvedValue || value === asyncProp.lastValue) {
      return false;
    }
    asyncProp.lastValue = value;
    return true;
  }
  // Set normal, non-async value
  _setPropValue(propName, value) {
    this._freezeAsyncOldProps();
    const asyncProp = this.asyncProps[propName];
    if (asyncProp) {
      value = this._postProcessValue(asyncProp, value);
      asyncProp.resolvedValue = value;
      asyncProp.pendingLoadCount++;
      asyncProp.resolvedLoadCount = asyncProp.pendingLoadCount;
    }
  }
  // Set a just resolved async value, calling onAsyncPropUpdates if value changes asynchronously
  _setAsyncPropValue(propName, value, loadCount) {
    const asyncProp = this.asyncProps[propName];
    if (asyncProp && loadCount >= asyncProp.resolvedLoadCount && value !== void 0) {
      this._freezeAsyncOldProps();
      asyncProp.resolvedValue = value;
      asyncProp.resolvedLoadCount = loadCount;
      this.onAsyncPropUpdated(propName, value);
    }
  }
  // Tracks a promise, sets the prop when loaded, handles load count
  _watchPromise(propName, promise) {
    const asyncProp = this.asyncProps[propName];
    if (asyncProp) {
      asyncProp.pendingLoadCount++;
      const loadCount = asyncProp.pendingLoadCount;
      promise.then((data) => {
        if (!this.component) {
          return;
        }
        data = this._postProcessValue(asyncProp, data);
        this._setAsyncPropValue(propName, data, loadCount);
        this._onResolve(propName, data);
      }).catch((error) => {
        this._onError(propName, error);
      });
    }
  }
  async _resolveAsyncIterable(propName, iterable) {
    if (propName !== "data") {
      this._setPropValue(propName, iterable);
      return;
    }
    const asyncProp = this.asyncProps[propName];
    if (!asyncProp) {
      return;
    }
    asyncProp.pendingLoadCount++;
    const loadCount = asyncProp.pendingLoadCount;
    let data = [];
    let count2 = 0;
    for await (const chunk of iterable) {
      if (!this.component) {
        return;
      }
      const { dataTransform } = this.component.props;
      if (dataTransform) {
        data = dataTransform(chunk, data);
      } else {
        data = data.concat(chunk);
      }
      Object.defineProperty(data, "__diff", {
        enumerable: false,
        value: [{ startRow: count2, endRow: data.length }]
      });
      count2 = data.length;
      this._setAsyncPropValue(propName, data, loadCount);
    }
    this._onResolve(propName, data);
  }
  // Give the app a chance to post process the loaded data
  _postProcessValue(asyncProp, value) {
    const propType = asyncProp.type;
    if (propType && this.component) {
      if (propType.release) {
        propType.release(asyncProp.resolvedValue, propType, this.component);
      }
      if (propType.transform) {
        return propType.transform(value, propType, this.component);
      }
    }
    return value;
  }
  // Creating an asyncProp record if needed
  _createAsyncPropData(propName, defaultValue) {
    const asyncProp = this.asyncProps[propName];
    if (!asyncProp) {
      const propTypes = this.component && this.component.props[PROP_TYPES_SYMBOL];
      this.asyncProps[propName] = {
        type: propTypes && propTypes[propName],
        lastValue: null,
        resolvedValue: defaultValue,
        pendingLoadCount: 0,
        resolvedLoadCount: 0
      };
    }
  }
};

// dist/lib/layer-state.js
var LayerState = class extends ComponentState {
  constructor({ attributeManager, layer }) {
    super(layer);
    this.attributeManager = attributeManager;
    this.needsRedraw = true;
    this.needsUpdate = true;
    this.subLayers = null;
    this.usesPickingColorCache = false;
  }
  get layer() {
    return this.component;
  }
  /* Override base Component methods with Layer-specific handling */
  _fetch(propName, url) {
    const layer = this.layer;
    const fetch = layer == null ? void 0 : layer.props.fetch;
    if (fetch) {
      return fetch(url, { propName, layer });
    }
    return super._fetch(propName, url);
  }
  _onResolve(propName, value) {
    const layer = this.layer;
    if (layer) {
      const onDataLoad = layer.props.onDataLoad;
      if (propName === "data" && onDataLoad) {
        onDataLoad(value, { propName, layer });
      }
    }
  }
  _onError(propName, error) {
    const layer = this.layer;
    if (layer) {
      layer.raiseError(error, `loading ${propName} of ${this.layer}`);
    }
  }
};

// dist/lib/layer.js
var import_web_mercator6 = require("@math.gl/web-mercator");
var import_core20 = require("@loaders.gl/core");
var TRACE_CHANGE_FLAG = "layer.changeFlag";
var TRACE_INITIALIZE = "layer.initialize";
var TRACE_UPDATE = "layer.update";
var TRACE_FINALIZE = "layer.finalize";
var TRACE_MATCHED = "layer.matched";
var MAX_PICKING_COLOR_CACHE_SIZE = 2 ** 24 - 1;
var EMPTY_ARRAY2 = Object.freeze([]);
var areViewportsEqual = memoize(({ oldViewport, viewport }) => {
  return oldViewport.equals(viewport);
});
var pickingColorCache = new Uint8ClampedArray(0);
var defaultProps2 = {
  // data: Special handling for null, see below
  data: { type: "data", value: EMPTY_ARRAY2, async: true },
  dataComparator: { type: "function", value: null, optional: true },
  _dataDiff: {
    type: "function",
    // @ts-ignore __diff is not defined on data
    value: (data) => data && data.__diff,
    optional: true
  },
  dataTransform: { type: "function", value: null, optional: true },
  onDataLoad: { type: "function", value: null, optional: true },
  onError: { type: "function", value: null, optional: true },
  fetch: {
    type: "function",
    value: (url, { propName, layer, loaders, loadOptions, signal }) => {
      const { resourceManager } = layer.context;
      loadOptions = loadOptions || layer.getLoadOptions();
      loaders = loaders || layer.props.loaders;
      if (signal) {
        loadOptions = {
          ...loadOptions,
          fetch: {
            ...loadOptions == null ? void 0 : loadOptions.fetch,
            signal
          }
        };
      }
      let inResourceManager = resourceManager.contains(url);
      if (!inResourceManager && !loadOptions) {
        resourceManager.add({ resourceId: url, data: (0, import_core20.load)(url, loaders), persistent: false });
        inResourceManager = true;
      }
      if (inResourceManager) {
        return resourceManager.subscribe({
          resourceId: url,
          onChange: (data) => {
            var _a;
            return (_a = layer.internalState) == null ? void 0 : _a.reloadAsyncProp(propName, data);
          },
          consumerId: layer.id,
          requestId: propName
        });
      }
      return (0, import_core20.load)(url, loaders, loadOptions);
    }
  },
  updateTriggers: {},
  // Update triggers: a core change detection mechanism in deck.gl
  visible: true,
  pickable: false,
  opacity: { type: "number", min: 0, max: 1, value: 1 },
  operation: "draw",
  onHover: { type: "function", value: null, optional: true },
  onClick: { type: "function", value: null, optional: true },
  onDragStart: { type: "function", value: null, optional: true },
  onDrag: { type: "function", value: null, optional: true },
  onDragEnd: { type: "function", value: null, optional: true },
  coordinateSystem: COORDINATE_SYSTEM.DEFAULT,
  coordinateOrigin: { type: "array", value: [0, 0, 0], compare: true },
  modelMatrix: { type: "array", value: null, compare: true, optional: true },
  wrapLongitude: false,
  positionFormat: "XYZ",
  colorFormat: "RGBA",
  parameters: { type: "object", value: {}, optional: true, compare: 2 },
  loadOptions: { type: "object", value: null, optional: true, ignore: true },
  transitions: null,
  extensions: [],
  loaders: { type: "array", value: [], optional: true, ignore: true },
  // Offset depth based on layer index to avoid z-fighting.
  // Negative values pull layer towards the camera
  // https://www.opengl.org/archives/resources/faq/technical/polygonoffset.htm
  getPolygonOffset: {
    type: "function",
    value: ({ layerIndex }) => [0, -layerIndex * 100]
  },
  // Selection/Highlighting
  highlightedObjectIndex: null,
  autoHighlight: false,
  highlightColor: { type: "accessor", value: [0, 0, 128, 128] }
};
var Layer = class extends component_default {
  constructor() {
    super(...arguments);
    this.internalState = null;
    this.lifecycle = LIFECYCLE.NO_STATE;
    this.parent = null;
  }
  static get componentName() {
    return Object.prototype.hasOwnProperty.call(this, "layerName") ? this.layerName : "";
  }
  get root() {
    let layer = this;
    while (layer.parent) {
      layer = layer.parent;
    }
    return layer;
  }
  toString() {
    const className = this.constructor.layerName || this.constructor.name;
    return `${className}({id: '${this.props.id}'})`;
  }
  // Public API for users
  /** Projects a point with current view state from the current layer's coordinate system to screen */
  project(xyz) {
    assert(this.internalState);
    const viewport = this.internalState.viewport || this.context.viewport;
    const worldPosition = getWorldPosition(xyz, {
      viewport,
      modelMatrix: this.props.modelMatrix,
      coordinateOrigin: this.props.coordinateOrigin,
      coordinateSystem: this.props.coordinateSystem
    });
    const [x, y, z] = (0, import_web_mercator6.worldToPixels)(worldPosition, viewport.pixelProjectionMatrix);
    return xyz.length === 2 ? [x, y] : [x, y, z];
  }
  /** Unprojects a screen pixel to the current view's default coordinate system
      Note: this does not reverse `project`. */
  unproject(xy) {
    assert(this.internalState);
    const viewport = this.internalState.viewport || this.context.viewport;
    return viewport.unproject(xy);
  }
  /** Projects a point with current view state from the current layer's coordinate system to the world space */
  projectPosition(xyz, params) {
    assert(this.internalState);
    const viewport = this.internalState.viewport || this.context.viewport;
    return projectPosition(xyz, {
      viewport,
      modelMatrix: this.props.modelMatrix,
      coordinateOrigin: this.props.coordinateOrigin,
      coordinateSystem: this.props.coordinateSystem,
      ...params
    });
  }
  // Public API for custom layer implementation
  /** `true` if this layer renders other layers */
  get isComposite() {
    return false;
  }
  /** `true` if the layer renders to screen */
  get isDrawable() {
    return true;
  }
  /** Updates selected state members and marks the layer for redraw */
  setState(partialState) {
    this.setChangeFlags({ stateChanged: true });
    Object.assign(this.state, partialState);
    this.setNeedsRedraw();
  }
  /** Sets the redraw flag for this layer, will trigger a redraw next animation frame */
  setNeedsRedraw() {
    if (this.internalState) {
      this.internalState.needsRedraw = true;
    }
  }
  /** Mark this layer as needs a deep update */
  setNeedsUpdate() {
    if (this.internalState) {
      this.context.layerManager.setNeedsUpdate(String(this));
      this.internalState.needsUpdate = true;
    }
  }
  /** Returns true if all async resources are loaded */
  get isLoaded() {
    return this.internalState ? !this.internalState.isAsyncPropLoading() : false;
  }
  /** Returns true if using shader-based WGS84 longitude wrapping */
  get wrapLongitude() {
    return this.props.wrapLongitude;
  }
  /** @deprecated Returns true if the layer is visible in the picking pass */
  isPickable() {
    return this.props.pickable && this.props.visible;
  }
  /** Returns an array of models used by this layer, can be overriden by layer subclass */
  getModels() {
    const state = this.state;
    return state && (state.models || state.model && [state.model]) || [];
  }
  /** Update shader input parameters */
  setShaderModuleProps(...props) {
    for (const model of this.getModels()) {
      model.shaderInputs.setProps(...props);
    }
  }
  /** Returns the attribute manager of this layer */
  getAttributeManager() {
    return this.internalState && this.internalState.attributeManager;
  }
  /** Returns the most recent layer that matched to this state
    (When reacting to an async event, this layer may no longer be the latest) */
  getCurrentLayer() {
    return this.internalState && this.internalState.layer;
  }
  /** Returns the default parse options for async props */
  getLoadOptions() {
    return this.props.loadOptions;
  }
  use64bitPositions() {
    const { coordinateSystem } = this.props;
    return coordinateSystem === COORDINATE_SYSTEM.DEFAULT || coordinateSystem === COORDINATE_SYSTEM.LNGLAT || coordinateSystem === COORDINATE_SYSTEM.CARTESIAN;
  }
  // Event handling
  onHover(info, pickingEvent) {
    if (this.props.onHover) {
      return this.props.onHover(info, pickingEvent) || false;
    }
    return false;
  }
  onClick(info, pickingEvent) {
    if (this.props.onClick) {
      return this.props.onClick(info, pickingEvent) || false;
    }
    return false;
  }
  // Returns the picking color that doesn't match any subfeature
  // Use if some graphics do not belong to any pickable subfeature
  // @return {Array} - a black color
  nullPickingColor() {
    return [0, 0, 0];
  }
  // Returns the picking color that doesn't match any subfeature
  // Use if some graphics do not belong to any pickable subfeature
  encodePickingColor(i, target = []) {
    target[0] = i + 1 & 255;
    target[1] = i + 1 >> 8 & 255;
    target[2] = i + 1 >> 8 >> 8 & 255;
    return target;
  }
  // Returns the index corresponding to a picking color that doesn't match any subfeature
  // @param {Uint8Array} color - color array to be decoded
  // @return {Array} - the decoded picking color
  decodePickingColor(color) {
    assert(color instanceof Uint8Array);
    const [i1, i2, i3] = color;
    const index = i1 + i2 * 256 + i3 * 65536 - 1;
    return index;
  }
  /** Deduces number of instances. Intention is to support:
    - Explicit setting of numInstances
    - Auto-deduction for ES6 containers that define a size member
    - Auto-deduction for Classic Arrays via the built-in length attribute
    - Auto-deduction via arrays */
  getNumInstances() {
    if (Number.isFinite(this.props.numInstances)) {
      return this.props.numInstances;
    }
    if (this.state && this.state.numInstances !== void 0) {
      return this.state.numInstances;
    }
    return count(this.props.data);
  }
  /** Buffer layout describes how many attribute values are packed for each data object
      The default (null) is one value each object.
      Some data formats (e.g. paths, polygons) have various length. Their buffer layout
      is in the form of [L0, L1, L2, ...] */
  getStartIndices() {
    if (this.props.startIndices) {
      return this.props.startIndices;
    }
    if (this.state && this.state.startIndices) {
      return this.state.startIndices;
    }
    return null;
  }
  // Default implementation
  getBounds() {
    var _a;
    return (_a = this.getAttributeManager()) == null ? void 0 : _a.getBounds(["positions", "instancePositions"]);
  }
  getShaders(shaders) {
    shaders = mergeShaders(shaders, {
      disableWarnings: true,
      modules: this.context.defaultShaderModules
    });
    for (const extension of this.props.extensions) {
      shaders = mergeShaders(shaders, extension.getShaders.call(this, extension));
    }
    return shaders;
  }
  /** Controls if updateState should be called. By default returns true if any prop has changed */
  shouldUpdateState(params) {
    return params.changeFlags.propsOrDataChanged;
  }
  /** Default implementation, all attributes will be invalidated and updated when data changes */
  // eslint-disable-next-line complexity
  updateState(params) {
    const attributeManager = this.getAttributeManager();
    const { dataChanged } = params.changeFlags;
    if (dataChanged && attributeManager) {
      if (Array.isArray(dataChanged)) {
        for (const dataRange of dataChanged) {
          attributeManager.invalidateAll(dataRange);
        }
      } else {
        attributeManager.invalidateAll();
      }
    }
    if (attributeManager) {
      const { props } = params;
      const hasPickingBuffer = this.internalState.hasPickingBuffer;
      const needsPickingBuffer = Number.isInteger(props.highlightedObjectIndex) || props.pickable || props.extensions.some((extension) => extension.getNeedsPickingBuffer.call(this, extension));
      if (hasPickingBuffer !== needsPickingBuffer) {
        this.internalState.hasPickingBuffer = needsPickingBuffer;
        const { pickingColors, instancePickingColors } = attributeManager.attributes;
        const pickingColorsAttribute = pickingColors || instancePickingColors;
        if (pickingColorsAttribute) {
          if (needsPickingBuffer && pickingColorsAttribute.constant) {
            pickingColorsAttribute.constant = false;
            attributeManager.invalidate(pickingColorsAttribute.id);
          }
          if (!pickingColorsAttribute.value && !needsPickingBuffer) {
            pickingColorsAttribute.constant = true;
            pickingColorsAttribute.value = [0, 0, 0];
          }
        }
      }
    }
  }
  /** Called once when layer is no longer matched and state will be discarded. Layers can destroy WebGL resources here. */
  finalizeState(context) {
    for (const model of this.getModels()) {
      model.destroy();
    }
    const attributeManager = this.getAttributeManager();
    if (attributeManager) {
      attributeManager.finalize();
    }
    if (this.context) {
      this.context.resourceManager.unsubscribe({ consumerId: this.id });
    }
    if (this.internalState) {
      this.internalState.uniformTransitions.clear();
      this.internalState.finalize();
    }
  }
  // If state has a model, draw it with supplied uniforms
  draw(opts) {
    for (const model of this.getModels()) {
      model.draw(opts.renderPass);
    }
  }
  // called to populate the info object that is passed to the event handler
  // @return null to cancel event
  getPickingInfo({ info, mode, sourceLayer }) {
    const { index } = info;
    if (index >= 0) {
      if (Array.isArray(this.props.data)) {
        info.object = this.props.data[index];
      }
    }
    return info;
  }
  // END LIFECYCLE METHODS
  // / INTERNAL METHODS - called by LayerManager, DeckRenderer and DeckPicker
  /** (Internal) Propagate an error event through the system */
  raiseError(error, message) {
    var _a, _b, _c, _d;
    if (message) {
      error = new Error(`${message}: ${error.message}`, { cause: error });
    }
    if (!((_b = (_a = this.props).onError) == null ? void 0 : _b.call(_a, error))) {
      (_d = (_c = this.context) == null ? void 0 : _c.onError) == null ? void 0 : _d.call(_c, error, this);
    }
  }
  /** (Internal) Checks if this layer needs redraw */
  getNeedsRedraw(opts = { clearRedrawFlags: false }) {
    return this._getNeedsRedraw(opts);
  }
  /** (Internal) Checks if this layer needs a deep update */
  needsUpdate() {
    if (!this.internalState) {
      return false;
    }
    return this.internalState.needsUpdate || this.hasUniformTransition() || this.shouldUpdateState(this._getUpdateParams());
  }
  /** Checks if this layer has ongoing uniform transition */
  hasUniformTransition() {
    var _a;
    return ((_a = this.internalState) == null ? void 0 : _a.uniformTransitions.active) || false;
  }
  /** Called when this layer is rendered into the given viewport */
  activateViewport(viewport) {
    if (!this.internalState) {
      return;
    }
    const oldViewport = this.internalState.viewport;
    this.internalState.viewport = viewport;
    if (!oldViewport || !areViewportsEqual({ oldViewport, viewport })) {
      this.setChangeFlags({ viewportChanged: true });
      if (this.isComposite) {
        if (this.needsUpdate()) {
          this.setNeedsUpdate();
        }
      } else {
        this._update();
      }
    }
  }
  /** Default implementation of attribute invalidation, can be redefined */
  invalidateAttribute(name = "all") {
    const attributeManager = this.getAttributeManager();
    if (!attributeManager) {
      return;
    }
    if (name === "all") {
      attributeManager.invalidateAll();
    } else {
      attributeManager.invalidate(name);
    }
  }
  /** Send updated attributes to the WebGL model */
  updateAttributes(changedAttributes) {
    let bufferLayoutChanged = false;
    for (const id in changedAttributes) {
      if (changedAttributes[id].layoutChanged()) {
        bufferLayoutChanged = true;
      }
    }
    for (const model of this.getModels()) {
      this._setModelAttributes(model, changedAttributes, bufferLayoutChanged);
    }
  }
  /** Recalculate any attributes if needed */
  _updateAttributes() {
    const attributeManager = this.getAttributeManager();
    if (!attributeManager) {
      return;
    }
    const props = this.props;
    const numInstances = this.getNumInstances();
    const startIndices = this.getStartIndices();
    attributeManager.update({
      data: props.data,
      numInstances,
      startIndices,
      props,
      transitions: props.transitions,
      // @ts-ignore (TS2339) property attribute is not present on some acceptable data types
      buffers: props.data.attributes,
      context: this
    });
    const changedAttributes = attributeManager.getChangedAttributes({ clearChangedFlags: true });
    this.updateAttributes(changedAttributes);
  }
  /** Update attribute transitions. This is called in drawLayer, no model updates required. */
  _updateAttributeTransition() {
    const attributeManager = this.getAttributeManager();
    if (attributeManager) {
      attributeManager.updateTransition();
    }
  }
  /** Update uniform (prop) transitions. This is called in updateState, may result in model updates. */
  _updateUniformTransition() {
    const { uniformTransitions } = this.internalState;
    if (uniformTransitions.active) {
      const propsInTransition = uniformTransitions.update();
      const props = Object.create(this.props);
      for (const key in propsInTransition) {
        Object.defineProperty(props, key, { value: propsInTransition[key] });
      }
      return props;
    }
    return this.props;
  }
  /** Updater for the automatically populated instancePickingColors attribute */
  calculateInstancePickingColors(attribute, { numInstances }) {
    if (attribute.constant) {
      return;
    }
    const cacheSize = Math.floor(pickingColorCache.length / 4);
    this.internalState.usesPickingColorCache = true;
    if (cacheSize < numInstances) {
      if (numInstances > MAX_PICKING_COLOR_CACHE_SIZE) {
        log_default.warn("Layer has too many data objects. Picking might not be able to distinguish all objects.")();
      }
      pickingColorCache = typed_array_manager_default.allocate(pickingColorCache, numInstances, {
        size: 4,
        copy: true,
        maxCount: Math.max(numInstances, MAX_PICKING_COLOR_CACHE_SIZE)
      });
      const newCacheSize = Math.floor(pickingColorCache.length / 4);
      const pickingColor = [0, 0, 0];
      for (let i = cacheSize; i < newCacheSize; i++) {
        this.encodePickingColor(i, pickingColor);
        pickingColorCache[i * 4 + 0] = pickingColor[0];
        pickingColorCache[i * 4 + 1] = pickingColor[1];
        pickingColorCache[i * 4 + 2] = pickingColor[2];
        pickingColorCache[i * 4 + 3] = 0;
      }
    }
    attribute.value = pickingColorCache.subarray(0, numInstances * 4);
  }
  /** Apply changed attributes to model */
  _setModelAttributes(model, changedAttributes, bufferLayoutChanged = false) {
    var _a;
    if (!Object.keys(changedAttributes).length) {
      return;
    }
    if (bufferLayoutChanged) {
      const attributeManager = this.getAttributeManager();
      model.setBufferLayout(attributeManager.getBufferLayouts(model));
      changedAttributes = attributeManager.getAttributes();
    }
    const excludeAttributes = ((_a = model.userData) == null ? void 0 : _a.excludeAttributes) || {};
    const attributeBuffers = {};
    const constantAttributes = {};
    for (const name in changedAttributes) {
      if (excludeAttributes[name]) {
        continue;
      }
      const values = changedAttributes[name].getValue();
      for (const attributeName in values) {
        const value = values[attributeName];
        if (value instanceof import_core19.Buffer) {
          if (changedAttributes[name].settings.isIndexed) {
            model.setIndexBuffer(value);
          } else {
            attributeBuffers[attributeName] = value;
          }
        } else if (value) {
          constantAttributes[attributeName] = value;
        }
      }
    }
    model.setAttributes(attributeBuffers);
    model.setConstantAttributes(constantAttributes);
  }
  /** (Internal) Sets the picking color at the specified index to null picking color. Used for multi-depth picking.
     This method may be overriden by layer implementations */
  disablePickingIndex(objectIndex) {
    const data = this.props.data;
    if (!("attributes" in data)) {
      this._disablePickingIndex(objectIndex);
      return;
    }
    const { pickingColors, instancePickingColors } = this.getAttributeManager().attributes;
    const colors = pickingColors || instancePickingColors;
    const externalColorAttribute = colors && data.attributes && data.attributes[colors.id];
    if (externalColorAttribute && externalColorAttribute.value) {
      const values = externalColorAttribute.value;
      const objectColor = this.encodePickingColor(objectIndex);
      for (let index = 0; index < data.length; index++) {
        const i = colors.getVertexOffset(index);
        if (values[i] === objectColor[0] && values[i + 1] === objectColor[1] && values[i + 2] === objectColor[2]) {
          this._disablePickingIndex(index);
        }
      }
    } else {
      this._disablePickingIndex(objectIndex);
    }
  }
  // TODO - simplify subclassing interface
  _disablePickingIndex(objectIndex) {
    const { pickingColors, instancePickingColors } = this.getAttributeManager().attributes;
    const colors = pickingColors || instancePickingColors;
    if (!colors) {
      return;
    }
    const start = colors.getVertexOffset(objectIndex);
    const end = colors.getVertexOffset(objectIndex + 1);
    colors.buffer.write(new Uint8Array(end - start), start);
  }
  /** (Internal) Re-enable all picking indices after multi-depth picking */
  restorePickingColors() {
    const { pickingColors, instancePickingColors } = this.getAttributeManager().attributes;
    const colors = pickingColors || instancePickingColors;
    if (!colors) {
      return;
    }
    if (
      // @ts-ignore (TS2531) this method is only called internally with internalState defined
      this.internalState.usesPickingColorCache && colors.value.buffer !== pickingColorCache.buffer
    ) {
      colors.value = pickingColorCache.subarray(0, colors.value.length);
    }
    colors.updateSubBuffer({ startOffset: 0 });
  }
  /* eslint-disable max-statements */
  /* (Internal) Called by layer manager when a new layer is found */
  _initialize() {
    assert(!this.internalState);
    assert(Number.isFinite(this.props.coordinateSystem));
    debug(TRACE_INITIALIZE, this);
    const attributeManager = this._getAttributeManager();
    if (attributeManager) {
      attributeManager.addInstanced({
        instancePickingColors: {
          type: "uint8",
          size: 4,
          noAlloc: true,
          // Updaters are always called with `this` pointing to the layer
          // eslint-disable-next-line @typescript-eslint/unbound-method
          update: this.calculateInstancePickingColors
        }
      });
    }
    this.internalState = new LayerState({
      attributeManager,
      layer: this
    });
    this._clearChangeFlags();
    this.state = {};
    Object.defineProperty(this.state, "attributeManager", {
      get: () => {
        log_default.deprecated("layer.state.attributeManager", "layer.getAttributeManager()")();
        return attributeManager;
      }
    });
    this.internalState.uniformTransitions = new UniformTransitionManager(this.context.timeline);
    this.internalState.onAsyncPropUpdated = this._onAsyncPropUpdated.bind(this);
    this.internalState.setAsyncProps(this.props);
    this.initializeState(this.context);
    for (const extension of this.props.extensions) {
      extension.initializeState.call(this, this.context, extension);
    }
    this.setChangeFlags({
      dataChanged: "init",
      propsChanged: "init",
      viewportChanged: true,
      extensionsChanged: true
    });
    this._update();
  }
  /** (Internal) Called by layer manager to transfer state from an old layer */
  _transferState(oldLayer) {
    debug(TRACE_MATCHED, this, this === oldLayer);
    const { state, internalState } = oldLayer;
    if (this === oldLayer) {
      return;
    }
    this.internalState = internalState;
    this.state = state;
    this.internalState.setAsyncProps(this.props);
    this._diffProps(this.props, this.internalState.getOldProps());
  }
  /** (Internal) Called by layer manager when a new layer is added or an existing layer is matched with a new instance */
  _update() {
    const stateNeedsUpdate = this.needsUpdate();
    debug(TRACE_UPDATE, this, stateNeedsUpdate);
    if (!stateNeedsUpdate) {
      return;
    }
    const currentProps = this.props;
    const context = this.context;
    const internalState = this.internalState;
    const currentViewport = context.viewport;
    const propsInTransition = this._updateUniformTransition();
    internalState.propsInTransition = propsInTransition;
    context.viewport = internalState.viewport || currentViewport;
    this.props = propsInTransition;
    try {
      const updateParams = this._getUpdateParams();
      const oldModels = this.getModels();
      if (context.device) {
        this.updateState(updateParams);
      } else {
        try {
          this.updateState(updateParams);
        } catch (error) {
        }
      }
      for (const extension of this.props.extensions) {
        extension.updateState.call(this, updateParams, extension);
      }
      this.setNeedsRedraw();
      this._updateAttributes();
      const modelChanged = this.getModels()[0] !== oldModels[0];
      this._postUpdate(updateParams, modelChanged);
    } finally {
      context.viewport = currentViewport;
      this.props = currentProps;
      this._clearChangeFlags();
      internalState.needsUpdate = false;
      internalState.resetOldProps();
    }
  }
  /* eslint-enable max-statements */
  /** (Internal) Called by manager when layer is about to be disposed
      Note: not guaranteed to be called on application shutdown */
  _finalize() {
    debug(TRACE_FINALIZE, this);
    this.finalizeState(this.context);
    for (const extension of this.props.extensions) {
      extension.finalizeState.call(this, this.context, extension);
    }
  }
  // Calculates uniforms
  _drawLayer({ renderPass, shaderModuleProps = null, uniforms = {}, parameters = {} }) {
    this._updateAttributeTransition();
    const currentProps = this.props;
    const context = this.context;
    this.props = this.internalState.propsInTransition || currentProps;
    try {
      if (shaderModuleProps) {
        this.setShaderModuleProps(shaderModuleProps);
      }
      const { getPolygonOffset } = this.props;
      const offsets = getPolygonOffset && getPolygonOffset(uniforms) || [0, 0];
      if (context.device instanceof import_webgl2.WebGLDevice) {
        context.device.setParametersWebGL({ polygonOffset: offsets });
      }
      for (const model of this.getModels()) {
        model.setParameters(parameters);
      }
      if (context.device instanceof import_webgl2.WebGLDevice) {
        context.device.withParametersWebGL(parameters, () => {
          const opts = { renderPass, shaderModuleProps, uniforms, parameters, context };
          for (const extension of this.props.extensions) {
            extension.draw.call(this, opts, extension);
          }
          this.draw(opts);
        });
      } else {
        const opts = { renderPass, shaderModuleProps, uniforms, parameters, context };
        for (const extension of this.props.extensions) {
          extension.draw.call(this, opts, extension);
        }
        this.draw(opts);
      }
    } finally {
      this.props = currentProps;
    }
  }
  // Helper methods
  /** Returns the current change flags */
  getChangeFlags() {
    var _a;
    return (_a = this.internalState) == null ? void 0 : _a.changeFlags;
  }
  /* eslint-disable complexity */
  /** Dirty some change flags, will be handled by updateLayer */
  setChangeFlags(flags) {
    if (!this.internalState) {
      return;
    }
    const { changeFlags } = this.internalState;
    for (const key in flags) {
      if (flags[key]) {
        let flagChanged = false;
        switch (key) {
          case "dataChanged":
            const dataChangedReason = flags[key];
            const prevDataChangedReason = changeFlags[key];
            if (dataChangedReason && Array.isArray(prevDataChangedReason)) {
              changeFlags.dataChanged = Array.isArray(dataChangedReason) ? prevDataChangedReason.concat(dataChangedReason) : dataChangedReason;
              flagChanged = true;
            }
          default:
            if (!changeFlags[key]) {
              changeFlags[key] = flags[key];
              flagChanged = true;
            }
        }
        if (flagChanged) {
          debug(TRACE_CHANGE_FLAG, this, key, flags);
        }
      }
    }
    const propsOrDataChanged = Boolean(changeFlags.dataChanged || changeFlags.updateTriggersChanged || changeFlags.propsChanged || changeFlags.extensionsChanged);
    changeFlags.propsOrDataChanged = propsOrDataChanged;
    changeFlags.somethingChanged = propsOrDataChanged || changeFlags.viewportChanged || changeFlags.stateChanged;
  }
  /* eslint-enable complexity */
  /** Clear all changeFlags, typically after an update */
  _clearChangeFlags() {
    this.internalState.changeFlags = {
      dataChanged: false,
      propsChanged: false,
      updateTriggersChanged: false,
      viewportChanged: false,
      stateChanged: false,
      extensionsChanged: false,
      propsOrDataChanged: false,
      somethingChanged: false
    };
  }
  /** Compares the layers props with old props from a matched older layer
      and extracts change flags that describe what has change so that state
      can be update correctly with minimal effort */
  _diffProps(newProps, oldProps) {
    var _a;
    const changeFlags = diffProps(newProps, oldProps);
    if (changeFlags.updateTriggersChanged) {
      for (const key in changeFlags.updateTriggersChanged) {
        if (changeFlags.updateTriggersChanged[key]) {
          this.invalidateAttribute(key);
        }
      }
    }
    if (changeFlags.transitionsChanged) {
      for (const key in changeFlags.transitionsChanged) {
        this.internalState.uniformTransitions.add(key, oldProps[key], newProps[key], (_a = newProps.transitions) == null ? void 0 : _a[key]);
      }
    }
    return this.setChangeFlags(changeFlags);
  }
  /** (Internal) called by layer manager to perform extra props validation (in development only) */
  validateProps() {
    validateProps(this.props);
  }
  /** (Internal) Called by deck picker when the hovered object changes to update the auto highlight */
  updateAutoHighlight(info) {
    if (this.props.autoHighlight && !Number.isInteger(this.props.highlightedObjectIndex)) {
      this._updateAutoHighlight(info);
    }
  }
  // May be overriden by subclasses
  // TODO - simplify subclassing interface
  /** Update picking module parameters to highlight the hovered object */
  _updateAutoHighlight(info) {
    const picking2 = {
      // @ts-ignore
      highlightedObjectColor: info.picked ? info.color : null
    };
    const { highlightColor } = this.props;
    if (info.picked && typeof highlightColor === "function") {
      picking2.highlightColor = highlightColor(info);
    }
    this.setShaderModuleProps({ picking: picking2 });
    this.setNeedsRedraw();
  }
  /** Create new attribute manager */
  _getAttributeManager() {
    const context = this.context;
    return new AttributeManager(context.device, {
      id: this.props.id,
      stats: context.stats,
      timeline: context.timeline
    });
  }
  // Private methods
  /** Called after updateState to perform common tasks */
  _postUpdate(updateParams, forceUpdate) {
    const { props, oldProps } = updateParams;
    const model = this.state.model;
    if (model == null ? void 0 : model.isInstanced) {
      model.setInstanceCount(this.getNumInstances());
    }
    const { autoHighlight, highlightedObjectIndex, highlightColor } = props;
    if (forceUpdate || oldProps.autoHighlight !== autoHighlight || oldProps.highlightedObjectIndex !== highlightedObjectIndex || oldProps.highlightColor !== highlightColor) {
      const picking2 = {};
      if (Array.isArray(highlightColor)) {
        picking2.highlightColor = highlightColor;
      }
      if (forceUpdate || oldProps.autoHighlight !== autoHighlight || highlightedObjectIndex !== oldProps.highlightedObjectIndex) {
        picking2.highlightedObjectColor = Number.isFinite(highlightedObjectIndex) && highlightedObjectIndex >= 0 ? this.encodePickingColor(highlightedObjectIndex) : null;
      }
      this.setShaderModuleProps({ picking: picking2 });
    }
  }
  _getUpdateParams() {
    return {
      props: this.props,
      // @ts-ignore TS2531 this method can only be called internally with internalState assigned
      oldProps: this.internalState.getOldProps(),
      context: this.context,
      // @ts-ignore TS2531 this method can only be called internally with internalState assigned
      changeFlags: this.internalState.changeFlags
    };
  }
  /** Checks state of attributes and model */
  _getNeedsRedraw(opts) {
    if (!this.internalState) {
      return false;
    }
    let redraw = false;
    redraw = redraw || this.internalState.needsRedraw && this.id;
    const attributeManager = this.getAttributeManager();
    const attributeManagerNeedsRedraw = attributeManager ? attributeManager.getNeedsRedraw(opts) : false;
    redraw = redraw || attributeManagerNeedsRedraw;
    if (redraw) {
      for (const extension of this.props.extensions) {
        extension.onNeedsRedraw.call(this, extension);
      }
    }
    this.internalState.needsRedraw = this.internalState.needsRedraw && !opts.clearRedrawFlags;
    return redraw;
  }
  /** Callback when asyn prop is loaded */
  _onAsyncPropUpdated() {
    this._diffProps(this.props, this.internalState.getOldProps());
    this.setNeedsUpdate();
  }
};
Layer.defaultProps = defaultProps2;
Layer.layerName = "Layer";
var layer_default = Layer;

// dist/lib/composite-layer.js
var TRACE_RENDER_LAYERS2 = "compositeLayer.renderLayers";
var CompositeLayer = class extends layer_default {
  /** `true` if this layer renders other layers */
  get isComposite() {
    return true;
  }
  /** `true` if the layer renders to screen */
  get isDrawable() {
    return false;
  }
  /** Returns true if all async resources are loaded */
  get isLoaded() {
    return super.isLoaded && this.getSubLayers().every((layer) => layer.isLoaded);
  }
  /** Return last rendered sub layers */
  getSubLayers() {
    return this.internalState && this.internalState.subLayers || [];
  }
  // initializeState is usually not needed for composite layers
  // Provide empty definition to disable check for missing definition
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  initializeState(context) {
  }
  /** Updates selected state members and marks the composite layer to need rerender */
  setState(updateObject) {
    super.setState(updateObject);
    this.setNeedsUpdate();
  }
  /** called to augment the info object that is bubbled up from a sublayer
      override Layer.getPickingInfo() because decoding / setting uniform do
      not apply to a composite layer. */
  getPickingInfo({ info }) {
    const { object } = info;
    const isDataWrapped = object && object.__source && object.__source.parent && object.__source.parent.id === this.id;
    if (!isDataWrapped) {
      return info;
    }
    info.object = object.__source.object;
    info.index = object.__source.index;
    return info;
  }
  /**
   * Filters sub layers at draw time. Return true if the sub layer should be drawn.
   */
  filterSubLayer(context) {
    return true;
  }
  /** Returns true if sub layer needs to be rendered */
  shouldRenderSubLayer(subLayerId, data) {
    return data && data.length;
  }
  /** Returns sub layer class for a specific sublayer */
  getSubLayerClass(subLayerId, DefaultLayerClass) {
    const { _subLayerProps: overridingProps } = this.props;
    return overridingProps && overridingProps[subLayerId] && overridingProps[subLayerId].type || DefaultLayerClass;
  }
  /** When casting user data into another format to pass to sublayers,
      add reference to the original object and object index */
  getSubLayerRow(row, sourceObject, sourceObjectIndex) {
    row.__source = {
      parent: this,
      object: sourceObject,
      index: sourceObjectIndex
    };
    return row;
  }
  /** Some composite layers cast user data into another format before passing to sublayers
    We need to unwrap them before calling the accessor so that they see the original data
    objects */
  getSubLayerAccessor(accessor) {
    if (typeof accessor === "function") {
      const objectInfo = {
        index: -1,
        // @ts-ignore accessing resolved data
        data: this.props.data,
        target: []
      };
      return (x, i) => {
        if (x && x.__source) {
          objectInfo.index = x.__source.index;
          return accessor(x.__source.object, objectInfo);
        }
        return accessor(x, i);
      };
    }
    return accessor;
  }
  /** Returns sub layer props for a specific sublayer */
  // eslint-disable-next-line complexity
  getSubLayerProps(sublayerProps = {}) {
    var _a;
    const { opacity, pickable, visible, parameters, getPolygonOffset, highlightedObjectIndex, autoHighlight, highlightColor, coordinateSystem, coordinateOrigin, wrapLongitude, positionFormat, modelMatrix, extensions, fetch, operation, _subLayerProps: overridingProps } = this.props;
    const newProps = {
      id: "",
      updateTriggers: {},
      opacity,
      pickable,
      visible,
      parameters,
      getPolygonOffset,
      highlightedObjectIndex,
      autoHighlight,
      highlightColor,
      coordinateSystem,
      coordinateOrigin,
      wrapLongitude,
      positionFormat,
      modelMatrix,
      extensions,
      fetch,
      operation
    };
    const overridingSublayerProps = overridingProps && sublayerProps.id && overridingProps[sublayerProps.id];
    const overridingSublayerTriggers = overridingSublayerProps && overridingSublayerProps.updateTriggers;
    const sublayerId = sublayerProps.id || "sublayer";
    if (overridingSublayerProps) {
      const propTypes = this.props[PROP_TYPES_SYMBOL];
      const subLayerPropTypes = sublayerProps.type ? sublayerProps.type._propTypes : {};
      for (const key in overridingSublayerProps) {
        const propType = subLayerPropTypes[key] || propTypes[key];
        if (propType && propType.type === "accessor") {
          overridingSublayerProps[key] = this.getSubLayerAccessor(overridingSublayerProps[key]);
        }
      }
    }
    Object.assign(
      newProps,
      sublayerProps,
      // experimental feature that allows users to override sublayer props via parent layer prop
      overridingSublayerProps
    );
    newProps.id = `${this.props.id}-${sublayerId}`;
    newProps.updateTriggers = {
      all: (_a = this.props.updateTriggers) == null ? void 0 : _a.all,
      ...sublayerProps.updateTriggers,
      ...overridingSublayerTriggers
    };
    for (const extension of extensions) {
      const passThroughProps = extension.getSubLayerProps.call(this, extension);
      if (passThroughProps) {
        Object.assign(newProps, passThroughProps, {
          updateTriggers: Object.assign(newProps.updateTriggers, passThroughProps.updateTriggers)
        });
      }
    }
    return newProps;
  }
  /** Update sub layers to highlight the hovered object */
  _updateAutoHighlight(info) {
    for (const layer of this.getSubLayers()) {
      layer.updateAutoHighlight(info);
    }
  }
  /** Override base Layer method */
  _getAttributeManager() {
    return null;
  }
  /** (Internal) Called after an update to rerender sub layers */
  _postUpdate(updateParams, forceUpdate) {
    let subLayers = this.internalState.subLayers;
    const shouldUpdate = !subLayers || this.needsUpdate();
    if (shouldUpdate) {
      const subLayersList = this.renderLayers();
      subLayers = flatten(subLayersList, Boolean);
      this.internalState.subLayers = subLayers;
    }
    debug(TRACE_RENDER_LAYERS2, this, shouldUpdate, subLayers);
    for (const layer of subLayers) {
      layer.parent = this;
    }
  }
};
CompositeLayer.layerName = "CompositeLayer";
var composite_layer_default = CompositeLayer;

// dist/viewports/globe-viewport.js
var import_core21 = require("@math.gl/core");
var import_web_mercator7 = require("@math.gl/web-mercator");
var import_web_mercator8 = require("@math.gl/web-mercator");
var import_core22 = require("@math.gl/core");
var DEGREES_TO_RADIANS2 = Math.PI / 180;
var RADIANS_TO_DEGREES = 180 / Math.PI;
var EARTH_RADIUS = 6370972;
var GLOBE_RADIUS = 256;
function getDistanceScales2() {
  const unitsPerMeter2 = GLOBE_RADIUS / EARTH_RADIUS;
  const unitsPerDegree = Math.PI / 180 * GLOBE_RADIUS;
  return {
    unitsPerMeter: [unitsPerMeter2, unitsPerMeter2, unitsPerMeter2],
    unitsPerMeter2: [0, 0, 0],
    metersPerUnit: [1 / unitsPerMeter2, 1 / unitsPerMeter2, 1 / unitsPerMeter2],
    unitsPerDegree: [unitsPerDegree, unitsPerDegree, unitsPerMeter2],
    unitsPerDegree2: [0, 0, 0],
    degreesPerUnit: [1 / unitsPerDegree, 1 / unitsPerDegree, 1 / unitsPerMeter2]
  };
}
var GlobeViewport = class extends viewport_default {
  constructor(opts = {}) {
    const {
      longitude = 0,
      zoom = 0,
      // Matches Maplibre defaults
      // https://github.com/maplibre/maplibre-gl-js/blob/f8ab4b48d59ab8fe7b068b102538793bbdd4c848/src/geo/projection/globe_transform.ts#L632-L633
      nearZMultiplier = 0.5,
      farZMultiplier = 1,
      resolution = 10
    } = opts;
    let { latitude = 0, height, altitude = 1.5, fovy } = opts;
    latitude = Math.max(Math.min(latitude, import_web_mercator8.MAX_LATITUDE), -import_web_mercator8.MAX_LATITUDE);
    height = height || 1;
    if (fovy) {
      altitude = (0, import_web_mercator7.fovyToAltitude)(fovy);
    } else {
      fovy = (0, import_web_mercator7.altitudeToFovy)(altitude);
    }
    const scaleAdjust = 1 / Math.PI / Math.cos(latitude * Math.PI / 180);
    const scale = Math.pow(2, zoom) * scaleAdjust;
    const nearZ = opts.nearZ ?? nearZMultiplier;
    const farZ = opts.farZ ?? (altitude + GLOBE_RADIUS * 2 * scale / height) * farZMultiplier;
    const viewMatrix2 = new import_core21.Matrix4().lookAt({ eye: [0, -altitude, 0], up: [0, 0, 1] });
    viewMatrix2.rotateX(latitude * DEGREES_TO_RADIANS2);
    viewMatrix2.rotateZ(-longitude * DEGREES_TO_RADIANS2);
    viewMatrix2.scale(scale / height);
    super({
      ...opts,
      // x, y, width,
      height,
      // view matrix
      viewMatrix: viewMatrix2,
      longitude,
      latitude,
      zoom,
      // projection matrix parameters
      distanceScales: getDistanceScales2(),
      fovy,
      focalDistance: altitude,
      near: nearZ,
      far: farZ
    });
    this.scale = scale;
    this.latitude = latitude;
    this.longitude = longitude;
    this.resolution = resolution;
  }
  get projectionMode() {
    return PROJECTION_MODE.GLOBE;
  }
  getDistanceScales() {
    return this.distanceScales;
  }
  getBounds(options = {}) {
    const unprojectOption = { targetZ: options.z || 0 };
    const left = this.unproject([0, this.height / 2], unprojectOption);
    const top = this.unproject([this.width / 2, 0], unprojectOption);
    const right = this.unproject([this.width, this.height / 2], unprojectOption);
    const bottom = this.unproject([this.width / 2, this.height], unprojectOption);
    if (right[0] < this.longitude)
      right[0] += 360;
    if (left[0] > this.longitude)
      left[0] -= 360;
    return [
      Math.min(left[0], right[0], top[0], bottom[0]),
      Math.min(left[1], right[1], top[1], bottom[1]),
      Math.max(left[0], right[0], top[0], bottom[0]),
      Math.max(left[1], right[1], top[1], bottom[1])
    ];
  }
  unproject(xyz, { topLeft = true, targetZ } = {}) {
    const [x, y, z] = xyz;
    const y2 = topLeft ? y : this.height - y;
    const { pixelUnprojectionMatrix } = this;
    let coord;
    if (Number.isFinite(z)) {
      coord = transformVector(pixelUnprojectionMatrix, [x, y2, z, 1]);
    } else {
      const coord0 = transformVector(pixelUnprojectionMatrix, [x, y2, -1, 1]);
      const coord1 = transformVector(pixelUnprojectionMatrix, [x, y2, 1, 1]);
      const lt = ((targetZ || 0) / EARTH_RADIUS + 1) * GLOBE_RADIUS;
      const lSqr = import_core22.vec3.sqrLen(import_core22.vec3.sub([], coord0, coord1));
      const l0Sqr = import_core22.vec3.sqrLen(coord0);
      const l1Sqr = import_core22.vec3.sqrLen(coord1);
      const sSqr = (4 * l0Sqr * l1Sqr - (lSqr - l0Sqr - l1Sqr) ** 2) / 16;
      const dSqr = 4 * sSqr / lSqr;
      const r0 = Math.sqrt(l0Sqr - dSqr);
      const dr = Math.sqrt(Math.max(0, lt * lt - dSqr));
      const t = (r0 - dr) / Math.sqrt(lSqr);
      coord = import_core22.vec3.lerp([], coord0, coord1, t);
    }
    const [X, Y, Z] = this.unprojectPosition(coord);
    if (Number.isFinite(z)) {
      return [X, Y, Z];
    }
    return Number.isFinite(targetZ) ? [X, Y, targetZ] : [X, Y];
  }
  projectPosition(xyz) {
    const [lng, lat, Z = 0] = xyz;
    const lambda = lng * DEGREES_TO_RADIANS2;
    const phi = lat * DEGREES_TO_RADIANS2;
    const cosPhi = Math.cos(phi);
    const D = (Z / EARTH_RADIUS + 1) * GLOBE_RADIUS;
    return [Math.sin(lambda) * cosPhi * D, -Math.cos(lambda) * cosPhi * D, Math.sin(phi) * D];
  }
  unprojectPosition(xyz) {
    const [x, y, z] = xyz;
    const D = import_core22.vec3.len(xyz);
    const phi = Math.asin(z / D);
    const lambda = Math.atan2(x, -y);
    const lng = lambda * RADIANS_TO_DEGREES;
    const lat = phi * RADIANS_TO_DEGREES;
    const Z = (D / GLOBE_RADIUS - 1) * EARTH_RADIUS;
    return [lng, lat, Z];
  }
  projectFlat(xyz) {
    return xyz;
  }
  unprojectFlat(xyz) {
    return xyz;
  }
  panByPosition(coords, pixel) {
    const fromPosition = this.unproject(pixel);
    return {
      longitude: coords[0] - fromPosition[0] + this.longitude,
      latitude: coords[1] - fromPosition[1] + this.latitude
    };
  }
};
function transformVector(matrix, vector) {
  const result = import_core22.vec4.transformMat4([], vector, matrix);
  import_core22.vec4.scale(result, result, 1 / result[3]);
  return result;
}

// dist/viewports/orbit-viewport.js
var import_core23 = require("@math.gl/core");
var import_web_mercator9 = require("@math.gl/web-mercator");
var DEGREES_TO_RADIANS3 = Math.PI / 180;
function getViewMatrix2({ height, focalDistance, orbitAxis, rotationX, rotationOrbit, zoom }) {
  const up = orbitAxis === "Z" ? [0, 0, 1] : [0, 1, 0];
  const eye = orbitAxis === "Z" ? [0, -focalDistance, 0] : [0, 0, focalDistance];
  const viewMatrix2 = new import_core23.Matrix4().lookAt({ eye, up });
  viewMatrix2.rotateX(rotationX * DEGREES_TO_RADIANS3);
  if (orbitAxis === "Z") {
    viewMatrix2.rotateZ(rotationOrbit * DEGREES_TO_RADIANS3);
  } else {
    viewMatrix2.rotateY(rotationOrbit * DEGREES_TO_RADIANS3);
  }
  const projectionScale = Math.pow(2, zoom) / height;
  viewMatrix2.scale(projectionScale);
  return viewMatrix2;
}
var OrbitViewport = class extends viewport_default {
  constructor(props) {
    const {
      height,
      projectionMatrix,
      fovy = 50,
      // For setting camera position
      orbitAxis = "Z",
      // Orbit axis with 360 degrees rotating freedom, can only be 'Y' or 'Z'
      target = [0, 0, 0],
      // Which point is camera looking at, default origin
      rotationX = 0,
      // Rotating angle around X axis
      rotationOrbit = 0,
      // Rotating angle around orbit axis
      zoom = 0
    } = props;
    const focalDistance = projectionMatrix ? projectionMatrix[5] / 2 : (0, import_web_mercator9.fovyToAltitude)(fovy);
    super({
      ...props,
      // in case viewState contains longitude/latitude values,
      // make sure that the base Viewport class does not treat this as a geospatial viewport
      longitude: void 0,
      viewMatrix: getViewMatrix2({
        height: height || 1,
        focalDistance,
        orbitAxis,
        rotationX,
        rotationOrbit,
        zoom
      }),
      fovy,
      focalDistance,
      position: target,
      zoom
    });
    this.projectedCenter = this.project(this.center);
  }
  unproject(xyz, { topLeft = true } = {}) {
    const [x, y, z = this.projectedCenter[2]] = xyz;
    const y2 = topLeft ? y : this.height - y;
    const [X, Y, Z] = (0, import_web_mercator9.pixelsToWorld)([x, y2, z], this.pixelUnprojectionMatrix);
    return [X, Y, Z];
  }
  panByPosition(coords, pixel) {
    const p0 = this.project(coords);
    const nextCenter = [
      this.width / 2 + p0[0] - pixel[0],
      this.height / 2 + p0[1] - pixel[1],
      this.projectedCenter[2]
    ];
    return {
      target: this.unproject(nextCenter)
    };
  }
};

// dist/viewports/orthographic-viewport.js
var import_core24 = require("@math.gl/core");
var import_web_mercator10 = require("@math.gl/web-mercator");
var viewMatrix = new import_core24.Matrix4().lookAt({ eye: [0, 0, 1] });
function getProjectionMatrix({ width, height, near, far, padding }) {
  let left = -width / 2;
  let right = width / 2;
  let bottom = -height / 2;
  let top = height / 2;
  if (padding) {
    const { left: l = 0, right: r = 0, top: t = 0, bottom: b = 0 } = padding;
    const offsetX = (0, import_core24.clamp)((l + width - r) / 2, 0, width) - width / 2;
    const offsetY = (0, import_core24.clamp)((t + height - b) / 2, 0, height) - height / 2;
    left -= offsetX;
    right -= offsetX;
    bottom += offsetY;
    top += offsetY;
  }
  return new import_core24.Matrix4().ortho({
    left,
    right,
    bottom,
    top,
    near,
    far
  });
}
var OrthographicViewport = class extends viewport_default {
  constructor(props) {
    const { width, height, near = 0.1, far = 1e3, zoom = 0, target = [0, 0, 0], padding = null, flipY = true } = props;
    const zoomX = Array.isArray(zoom) ? zoom[0] : zoom;
    const zoomY = Array.isArray(zoom) ? zoom[1] : zoom;
    const zoom_ = Math.min(zoomX, zoomY);
    const scale = Math.pow(2, zoom_);
    let distanceScales;
    if (zoomX !== zoomY) {
      const scaleX = Math.pow(2, zoomX);
      const scaleY = Math.pow(2, zoomY);
      distanceScales = {
        unitsPerMeter: [scaleX / scale, scaleY / scale, 1],
        metersPerUnit: [scale / scaleX, scale / scaleY, 1]
      };
    }
    super({
      ...props,
      // in case viewState contains longitude/latitude values,
      // make sure that the base Viewport class does not treat this as a geospatial viewport
      longitude: void 0,
      position: target,
      viewMatrix: viewMatrix.clone().scale([scale, scale * (flipY ? -1 : 1), scale]),
      projectionMatrix: getProjectionMatrix({
        width: width || 1,
        height: height || 1,
        padding,
        near,
        far
      }),
      zoom: zoom_,
      distanceScales
    });
  }
  projectFlat([X, Y]) {
    const { unitsPerMeter: unitsPerMeter2 } = this.distanceScales;
    return [X * unitsPerMeter2[0], Y * unitsPerMeter2[1]];
  }
  unprojectFlat([x, y]) {
    const { metersPerUnit } = this.distanceScales;
    return [x * metersPerUnit[0], y * metersPerUnit[1]];
  }
  /* Needed by LinearInterpolator */
  panByPosition(coords, pixel) {
    const fromLocation = (0, import_web_mercator10.pixelsToWorld)(pixel, this.pixelUnprojectionMatrix);
    const toLocation = this.projectFlat(coords);
    const translate = import_core24.vec2.add([], toLocation, import_core24.vec2.negate([], fromLocation));
    const newCenter = import_core24.vec2.add([], this.center, translate);
    return { target: this.unprojectFlat(newCenter) };
  }
};

// dist/viewports/first-person-viewport.js
var import_web_mercator11 = require("@math.gl/web-mercator");
var import_core25 = require("@math.gl/core");
var FirstPersonViewport = class extends viewport_default {
  constructor(props) {
    const { longitude, latitude, modelMatrix, bearing = 0, pitch = 0, up = [0, 0, 1] } = props;
    const spherical = new import_core25._SphericalCoordinates({
      bearing,
      // Avoid "pixel project matrix not invertible" error
      pitch: pitch === -90 ? 1e-4 : 90 + pitch
    });
    const dir = spherical.toVector3().normalize();
    const center = modelMatrix ? new import_core25.Matrix4(modelMatrix).transformAsVector(dir) : dir;
    const zoom = Number.isFinite(latitude) ? (0, import_web_mercator11.getMeterZoom)({ latitude }) : 0;
    const scale = Math.pow(2, zoom);
    const viewMatrix2 = new import_core25.Matrix4().lookAt({ eye: [0, 0, 0], center, up }).scale(scale);
    super({
      ...props,
      zoom,
      viewMatrix: viewMatrix2
    });
    this.latitude = latitude;
    this.longitude = longitude;
  }
};

// dist/controllers/first-person-controller.js
var import_core26 = require("@math.gl/core");
var MOVEMENT_SPEED = 20;
var PAN_SPEED = 500;
var FirstPersonState = class extends ViewState {
  constructor(options) {
    const {
      /* Viewport arguments */
      width,
      // Width of viewport
      height,
      // Height of viewport
      // Position and orientation
      position = [0, 0, 0],
      // typically in meters from anchor point
      bearing = 0,
      // Rotation around y axis
      pitch = 0,
      // Rotation around x axis
      // Geospatial anchor
      longitude = null,
      latitude = null,
      maxPitch = 90,
      minPitch = -90,
      // Model state when the rotate operation first started
      startRotatePos,
      startBearing,
      startPitch,
      startZoomPosition,
      startPanPos,
      startPanPosition
    } = options;
    super({
      width,
      height,
      position,
      bearing,
      pitch,
      longitude,
      latitude,
      maxPitch,
      minPitch
    }, {
      startRotatePos,
      startBearing,
      startPitch,
      startZoomPosition,
      startPanPos,
      startPanPosition
    });
    this.makeViewport = options.makeViewport;
  }
  /* Public API */
  /**
   * Start panning
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  panStart({ pos }) {
    const { position } = this.getViewportProps();
    return this._getUpdatedState({
      startPanPos: pos,
      startPanPosition: position
    });
  }
  /**
   * Pan
   * @param {[Number, Number]} pos - position on screen where the pointer is
   */
  pan({ pos }) {
    if (!pos) {
      return this;
    }
    const { startPanPos = [0, 0], startPanPosition = [0, 0] } = this.getState();
    const { width, height, bearing, pitch } = this.getViewportProps();
    const deltaScaleX = PAN_SPEED * (pos[0] - startPanPos[0]) / width;
    const deltaScaleY = PAN_SPEED * (pos[1] - startPanPos[1]) / height;
    const up = new import_core26._SphericalCoordinates({ bearing, pitch });
    const forward = new import_core26._SphericalCoordinates({ bearing, pitch: -90 });
    const yDirection = up.toVector3().normalize();
    const xDirection = forward.toVector3().cross(yDirection).normalize();
    return this._getUpdatedState({
      position: new import_core26.Vector3(startPanPosition).add(xDirection.scale(deltaScaleX)).add(yDirection.scale(deltaScaleY))
    });
  }
  /**
   * End panning
   * Must call if `panStart()` was called
   */
  panEnd() {
    return this._getUpdatedState({
      startPanPos: null,
      startPanPosition: null
    });
  }
  /**
   * Start rotating
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  rotateStart({ pos }) {
    return this._getUpdatedState({
      startRotatePos: pos,
      startBearing: this.getViewportProps().bearing,
      startPitch: this.getViewportProps().pitch
    });
  }
  /**
   * Rotate
   * @param {[Number, Number]} pos - position on screen where the pointer is
   */
  rotate({ pos, deltaAngleX = 0, deltaAngleY = 0 }) {
    const { startRotatePos, startBearing, startPitch } = this.getState();
    const { width, height } = this.getViewportProps();
    if (!startRotatePos || startBearing === void 0 || startPitch === void 0) {
      return this;
    }
    let newRotation;
    if (pos) {
      const deltaScaleX = (pos[0] - startRotatePos[0]) / width;
      const deltaScaleY = (pos[1] - startRotatePos[1]) / height;
      newRotation = {
        bearing: startBearing - deltaScaleX * 180,
        pitch: startPitch - deltaScaleY * 90
      };
    } else {
      newRotation = {
        bearing: startBearing - deltaAngleX,
        pitch: startPitch - deltaAngleY
      };
    }
    return this._getUpdatedState(newRotation);
  }
  /**
   * End rotating
   * Must call if `rotateStart()` was called
   */
  rotateEnd() {
    return this._getUpdatedState({
      startRotatePos: null,
      startBearing: null,
      startPitch: null
    });
  }
  /**
   * Start zooming
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  zoomStart() {
    return this._getUpdatedState({
      startZoomPosition: this.getViewportProps().position
    });
  }
  /**
   * Zoom
   * @param {[Number, Number]} pos - position on screen where the current center is
   * @param {[Number, Number]} startPos - the center position at
   *   the start of the operation. Must be supplied of `zoomStart()` was not called
   * @param {Number} scale - a number between [0, 1] specifying the accumulated
   *   relative scale.
   */
  zoom({ pos, scale }) {
    const viewportProps = this.getViewportProps();
    const startZoomPosition = this.getState().startZoomPosition || viewportProps.position;
    const viewport = this.makeViewport(viewportProps);
    const { projectionMatrix, width } = viewport;
    const fovxRadians = 2 * Math.atan(1 / projectionMatrix[0]);
    const angle = fovxRadians * (pos[0] / width - 0.5);
    const direction = this.getDirection(true);
    return this._move(direction.rotateZ({ radians: -angle }), Math.log2(scale) * MOVEMENT_SPEED, startZoomPosition);
  }
  /**
   * End zooming
   * Must call if `zoomStart()` was called
   */
  zoomEnd() {
    return this._getUpdatedState({
      startZoomPosition: null
    });
  }
  moveLeft(speed = MOVEMENT_SPEED) {
    const direction = this.getDirection(true);
    return this._move(direction.rotateZ({ radians: Math.PI / 2 }), speed);
  }
  moveRight(speed = MOVEMENT_SPEED) {
    const direction = this.getDirection(true);
    return this._move(direction.rotateZ({ radians: -Math.PI / 2 }), speed);
  }
  // forward
  moveUp(speed = MOVEMENT_SPEED) {
    const direction = this.getDirection(true);
    return this._move(direction, speed);
  }
  // backward
  moveDown(speed = MOVEMENT_SPEED) {
    const direction = this.getDirection(true);
    return this._move(direction.negate(), speed);
  }
  rotateLeft(speed = 15) {
    return this._getUpdatedState({
      bearing: this.getViewportProps().bearing - speed
    });
  }
  rotateRight(speed = 15) {
    return this._getUpdatedState({
      bearing: this.getViewportProps().bearing + speed
    });
  }
  rotateUp(speed = 10) {
    return this._getUpdatedState({
      pitch: this.getViewportProps().pitch + speed
    });
  }
  rotateDown(speed = 10) {
    return this._getUpdatedState({
      pitch: this.getViewportProps().pitch - speed
    });
  }
  zoomIn(speed = MOVEMENT_SPEED) {
    return this._move(new import_core26.Vector3(0, 0, 1), speed);
  }
  zoomOut(speed = MOVEMENT_SPEED) {
    return this._move(new import_core26.Vector3(0, 0, -1), speed);
  }
  // shortest path between two view states
  shortestPathFrom(viewState) {
    const fromProps = viewState.getViewportProps();
    const props = { ...this.getViewportProps() };
    const { bearing, longitude } = props;
    if (Math.abs(bearing - fromProps.bearing) > 180) {
      props.bearing = bearing < 0 ? bearing + 360 : bearing - 360;
    }
    if (longitude !== null && fromProps.longitude !== null && Math.abs(longitude - fromProps.longitude) > 180) {
      props.longitude = longitude < 0 ? longitude + 360 : longitude - 360;
    }
    return props;
  }
  /* Private methods */
  _move(direction, speed, fromPosition = this.getViewportProps().position) {
    const delta = direction.scale(speed);
    return this._getUpdatedState({
      position: new import_core26.Vector3(fromPosition).add(delta)
    });
  }
  getDirection(use2D = false) {
    const spherical = new import_core26._SphericalCoordinates({
      bearing: this.getViewportProps().bearing,
      pitch: use2D ? 90 : 90 + this.getViewportProps().pitch
    });
    const direction = spherical.toVector3().normalize();
    return direction;
  }
  _getUpdatedState(newProps) {
    return new FirstPersonState({
      makeViewport: this.makeViewport,
      ...this.getViewportProps(),
      ...this.getState(),
      ...newProps
    });
  }
  // Apply any constraints (mathematical or defined by _viewportProps) to map state
  applyConstraints(props) {
    const { pitch, maxPitch, minPitch, longitude, bearing } = props;
    props.pitch = (0, import_core26.clamp)(pitch, minPitch, maxPitch);
    if (longitude !== null && (longitude < -180 || longitude > 180)) {
      props.longitude = mod(longitude + 180, 360) - 180;
    }
    if (bearing < -180 || bearing > 180) {
      props.bearing = mod(bearing + 180, 360) - 180;
    }
    return props;
  }
};
var FirstPersonController = class extends Controller {
  constructor() {
    super(...arguments);
    this.ControllerState = FirstPersonState;
    this.transition = {
      transitionDuration: 300,
      transitionInterpolator: new LinearInterpolator(["position", "pitch", "bearing"])
    };
  }
};

// dist/views/first-person-view.js
var FirstPersonView = class extends View {
  constructor(props = {}) {
    super(props);
  }
  getViewportType() {
    return FirstPersonViewport;
  }
  get ControllerType() {
    return FirstPersonController;
  }
};
FirstPersonView.displayName = "FirstPersonView";
var first_person_view_default = FirstPersonView;

// dist/controllers/orbit-controller.js
var import_core27 = require("@math.gl/core");
var OrbitState = class extends ViewState {
  constructor(options) {
    const {
      /* Viewport arguments */
      width,
      // Width of viewport
      height,
      // Height of viewport
      rotationX = 0,
      // Rotation around x axis
      rotationOrbit = 0,
      // Rotation around orbit axis
      target = [0, 0, 0],
      zoom = 0,
      /* Viewport constraints */
      minRotationX = -90,
      maxRotationX = 90,
      minZoom = -Infinity,
      maxZoom = Infinity,
      /** Interaction states, required to calculate change during transform */
      // Model state when the pan operation first started
      startPanPosition,
      // Model state when the rotate operation first started
      startRotatePos,
      startRotationX,
      startRotationOrbit,
      // Model state when the zoom operation first started
      startZoomPosition,
      startZoom
    } = options;
    super({
      width,
      height,
      rotationX,
      rotationOrbit,
      target,
      zoom,
      minRotationX,
      maxRotationX,
      minZoom,
      maxZoom
    }, {
      startPanPosition,
      startRotatePos,
      startRotationX,
      startRotationOrbit,
      startZoomPosition,
      startZoom
    });
    this.makeViewport = options.makeViewport;
  }
  /**
   * Start panning
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  panStart({ pos }) {
    return this._getUpdatedState({
      startPanPosition: this._unproject(pos)
    });
  }
  /**
   * Pan
   * @param {[Number, Number]} pos - position on screen where the pointer is
   */
  pan({ pos, startPosition }) {
    const startPanPosition = this.getState().startPanPosition || startPosition;
    if (!startPanPosition) {
      return this;
    }
    const viewport = this.makeViewport(this.getViewportProps());
    const newProps = viewport.panByPosition(startPanPosition, pos);
    return this._getUpdatedState(newProps);
  }
  /**
   * End panning
   * Must call if `panStart()` was called
   */
  panEnd() {
    return this._getUpdatedState({
      startPanPosition: null
    });
  }
  /**
   * Start rotating
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  rotateStart({ pos }) {
    return this._getUpdatedState({
      startRotatePos: pos,
      startRotationX: this.getViewportProps().rotationX,
      startRotationOrbit: this.getViewportProps().rotationOrbit
    });
  }
  /**
   * Rotate
   * @param {[Number, Number]} pos - position on screen where the pointer is
   */
  rotate({ pos, deltaAngleX = 0, deltaAngleY = 0 }) {
    const { startRotatePos, startRotationX, startRotationOrbit } = this.getState();
    const { width, height } = this.getViewportProps();
    if (!startRotatePos || startRotationX === void 0 || startRotationOrbit === void 0) {
      return this;
    }
    let newRotation;
    if (pos) {
      let deltaScaleX = (pos[0] - startRotatePos[0]) / width;
      const deltaScaleY = (pos[1] - startRotatePos[1]) / height;
      if (startRotationX < -90 || startRotationX > 90) {
        deltaScaleX *= -1;
      }
      newRotation = {
        rotationX: startRotationX + deltaScaleY * 180,
        rotationOrbit: startRotationOrbit + deltaScaleX * 180
      };
    } else {
      newRotation = {
        rotationX: startRotationX + deltaAngleY,
        rotationOrbit: startRotationOrbit + deltaAngleX
      };
    }
    return this._getUpdatedState(newRotation);
  }
  /**
   * End rotating
   * Must call if `rotateStart()` was called
   */
  rotateEnd() {
    return this._getUpdatedState({
      startRotationX: null,
      startRotationOrbit: null
    });
  }
  // shortest path between two view states
  shortestPathFrom(viewState) {
    const fromProps = viewState.getViewportProps();
    const props = { ...this.getViewportProps() };
    const { rotationOrbit } = props;
    if (Math.abs(rotationOrbit - fromProps.rotationOrbit) > 180) {
      props.rotationOrbit = rotationOrbit < 0 ? rotationOrbit + 360 : rotationOrbit - 360;
    }
    return props;
  }
  /**
   * Start zooming
   * @param {[Number, Number]} pos - position on screen where the pointer grabs
   */
  zoomStart({ pos }) {
    return this._getUpdatedState({
      startZoomPosition: this._unproject(pos),
      startZoom: this.getViewportProps().zoom
    });
  }
  /**
   * Zoom
   * @param {[Number, Number]} pos - position on screen where the current target is
   * @param {[Number, Number]} startPos - the target position at
   *   the start of the operation. Must be supplied of `zoomStart()` was not called
   * @param {Number} scale - a number between [0, 1] specifying the accumulated
   *   relative scale.
   */
  zoom({ pos, startPos, scale }) {
    let { startZoom, startZoomPosition } = this.getState();
    if (!startZoomPosition) {
      startZoom = this.getViewportProps().zoom;
      startZoomPosition = this._unproject(startPos) || this._unproject(pos);
    }
    if (!startZoomPosition) {
      return this;
    }
    const newZoom = this._calculateNewZoom({ scale, startZoom });
    const zoomedViewport = this.makeViewport({ ...this.getViewportProps(), zoom: newZoom });
    return this._getUpdatedState({
      zoom: newZoom,
      ...zoomedViewport.panByPosition(startZoomPosition, pos)
    });
  }
  /**
   * End zooming
   * Must call if `zoomStart()` was called
   */
  zoomEnd() {
    return this._getUpdatedState({
      startZoomPosition: null,
      startZoom: null
    });
  }
  zoomIn(speed = 2) {
    return this._getUpdatedState({
      zoom: this._calculateNewZoom({ scale: speed })
    });
  }
  zoomOut(speed = 2) {
    return this._getUpdatedState({
      zoom: this._calculateNewZoom({ scale: 1 / speed })
    });
  }
  moveLeft(speed = 50) {
    return this._panFromCenter([-speed, 0]);
  }
  moveRight(speed = 50) {
    return this._panFromCenter([speed, 0]);
  }
  moveUp(speed = 50) {
    return this._panFromCenter([0, -speed]);
  }
  moveDown(speed = 50) {
    return this._panFromCenter([0, speed]);
  }
  rotateLeft(speed = 15) {
    return this._getUpdatedState({
      rotationOrbit: this.getViewportProps().rotationOrbit - speed
    });
  }
  rotateRight(speed = 15) {
    return this._getUpdatedState({
      rotationOrbit: this.getViewportProps().rotationOrbit + speed
    });
  }
  rotateUp(speed = 10) {
    return this._getUpdatedState({
      rotationX: this.getViewportProps().rotationX - speed
    });
  }
  rotateDown(speed = 10) {
    return this._getUpdatedState({
      rotationX: this.getViewportProps().rotationX + speed
    });
  }
  /* Private methods */
  _unproject(pos) {
    const viewport = this.makeViewport(this.getViewportProps());
    return pos && viewport.unproject(pos);
  }
  // Calculates new zoom
  _calculateNewZoom({ scale, startZoom }) {
    const { maxZoom, minZoom } = this.getViewportProps();
    if (startZoom === void 0) {
      startZoom = this.getViewportProps().zoom;
    }
    const zoom = startZoom + Math.log2(scale);
    return (0, import_core27.clamp)(zoom, minZoom, maxZoom);
  }
  _panFromCenter(offset) {
    const { width, height, target } = this.getViewportProps();
    return this.pan({
      startPosition: target,
      pos: [width / 2 + offset[0], height / 2 + offset[1]]
    });
  }
  _getUpdatedState(newProps) {
    return new this.constructor({
      makeViewport: this.makeViewport,
      ...this.getViewportProps(),
      ...this.getState(),
      ...newProps
    });
  }
  // Apply any constraints (mathematical or defined by _viewportProps) to map state
  applyConstraints(props) {
    const { maxZoom, minZoom, zoom, maxRotationX, minRotationX, rotationOrbit } = props;
    props.zoom = Array.isArray(zoom) ? [(0, import_core27.clamp)(zoom[0], minZoom, maxZoom), (0, import_core27.clamp)(zoom[1], minZoom, maxZoom)] : (0, import_core27.clamp)(zoom, minZoom, maxZoom);
    props.rotationX = (0, import_core27.clamp)(props.rotationX, minRotationX, maxRotationX);
    if (rotationOrbit < -180 || rotationOrbit > 180) {
      props.rotationOrbit = mod(rotationOrbit + 180, 360) - 180;
    }
    return props;
  }
};
var OrbitController = class extends Controller {
  constructor() {
    super(...arguments);
    this.ControllerState = OrbitState;
    this.transition = {
      transitionDuration: 300,
      transitionInterpolator: new LinearInterpolator({
        transitionProps: {
          compare: ["target", "zoom", "rotationX", "rotationOrbit"],
          required: ["target", "zoom"]
        }
      })
    };
  }
};

// dist/views/orbit-view.js
var OrbitView = class extends View {
  constructor(props = {}) {
    super(props);
    this.props.orbitAxis = props.orbitAxis || "Z";
  }
  getViewportType() {
    return OrbitViewport;
  }
  get ControllerType() {
    return OrbitController;
  }
};
OrbitView.displayName = "OrbitView";
var orbit_view_default = OrbitView;

// dist/controllers/orthographic-controller.js
var import_core28 = require("@math.gl/core");
var OrthographicState = class extends OrbitState {
  constructor(props) {
    super(props);
    this.zoomAxis = props.zoomAxis || "all";
  }
  _calculateNewZoom({ scale, startZoom }) {
    const { maxZoom, minZoom } = this.getViewportProps();
    if (startZoom === void 0) {
      startZoom = this.getViewportProps().zoom;
    }
    let deltaZoom = Math.log2(scale);
    if (Array.isArray(startZoom)) {
      let [newZoomX, newZoomY] = startZoom;
      switch (this.zoomAxis) {
        case "X":
          newZoomX = (0, import_core28.clamp)(newZoomX + deltaZoom, minZoom, maxZoom);
          break;
        case "Y":
          newZoomY = (0, import_core28.clamp)(newZoomY + deltaZoom, minZoom, maxZoom);
          break;
        default:
          let z = Math.min(newZoomX + deltaZoom, newZoomY + deltaZoom);
          if (z < minZoom) {
            deltaZoom += minZoom - z;
          }
          z = Math.max(newZoomX + deltaZoom, newZoomY + deltaZoom);
          if (z > maxZoom) {
            deltaZoom += maxZoom - z;
          }
          newZoomX += deltaZoom;
          newZoomY += deltaZoom;
      }
      return [newZoomX, newZoomY];
    }
    return (0, import_core28.clamp)(startZoom + deltaZoom, minZoom, maxZoom);
  }
};
var OrthographicController = class extends Controller {
  constructor() {
    super(...arguments);
    this.ControllerState = OrthographicState;
    this.transition = {
      transitionDuration: 300,
      transitionInterpolator: new LinearInterpolator(["target", "zoom"])
    };
    this.dragMode = "pan";
  }
  _onPanRotate() {
    return false;
  }
};

// dist/views/orthographic-view.js
var OrthographicView = class extends View {
  constructor(props = {}) {
    super(props);
  }
  getViewportType() {
    return OrthographicViewport;
  }
  get ControllerType() {
    return OrthographicController;
  }
};
OrthographicView.displayName = "OrthographicView";
var orthographic_view_default = OrthographicView;

// dist/controllers/globe-controller.js
var import_core29 = require("@math.gl/core");
var import_web_mercator12 = require("@math.gl/web-mercator");
var GlobeState = class extends MapState {
  // Apply any constraints (mathematical or defined by _viewportProps) to map state
  applyConstraints(props) {
    const { maxZoom, minZoom, zoom } = props;
    props.zoom = (0, import_core29.clamp)(zoom, minZoom, maxZoom);
    const { longitude, latitude } = props;
    if (longitude < -180 || longitude > 180) {
      props.longitude = mod(longitude + 180, 360) - 180;
    }
    props.latitude = (0, import_core29.clamp)(latitude, -import_web_mercator12.MAX_LATITUDE, import_web_mercator12.MAX_LATITUDE);
    return props;
  }
};
var GlobeController = class extends Controller {
  constructor() {
    super(...arguments);
    this.ControllerState = GlobeState;
    this.transition = {
      transitionDuration: 300,
      transitionInterpolator: new LinearInterpolator(["longitude", "latitude", "zoom"])
    };
    this.dragMode = "pan";
  }
  setProps(props) {
    super.setProps(props);
    this.dragRotate = false;
    this.touchRotate = false;
  }
};

// dist/views/globe-view.js
var GlobeView = class extends View {
  constructor(props = {}) {
    super(props);
  }
  getViewportType(viewState) {
    return viewState.zoom > 12 ? web_mercator_viewport_default : GlobeViewport;
  }
  get ControllerType() {
    return GlobeController;
  }
};
GlobeView.displayName = "GlobeView";
var globe_view_default = GlobeView;

// dist/lib/layer-extension.js
var LayerExtension = class {
  static get componentName() {
    return Object.prototype.hasOwnProperty.call(this, "extensionName") ? this.extensionName : "";
  }
  constructor(opts) {
    if (opts) {
      this.opts = opts;
    }
  }
  /** Returns true if two extensions are equivalent */
  equals(extension) {
    if (this === extension) {
      return true;
    }
    return this.constructor === extension.constructor && deepEqual(this.opts, extension.opts, 1);
  }
  /** Only called if attached to a primitive layer */
  getShaders(extension) {
    return null;
  }
  /** Only called if attached to a CompositeLayer */
  getSubLayerProps(extension) {
    const { defaultProps: defaultProps3 } = extension.constructor;
    const newProps = {
      updateTriggers: {}
    };
    for (const key in defaultProps3) {
      if (key in this.props) {
        const propDef = defaultProps3[key];
        const propValue = this.props[key];
        newProps[key] = propValue;
        if (propDef && propDef.type === "accessor") {
          newProps.updateTriggers[key] = this.props.updateTriggers[key];
          if (typeof propValue === "function") {
            newProps[key] = this.getSubLayerAccessor(propValue);
          }
        }
      }
    }
    return newProps;
  }
  /* eslint-disable @typescript-eslint/no-empty-function */
  initializeState(context, extension) {
  }
  updateState(params, extension) {
  }
  onNeedsRedraw(extension) {
  }
  getNeedsPickingBuffer(extension) {
    return false;
  }
  draw(params, extension) {
  }
  finalizeState(context, extension) {
  }
};
LayerExtension.defaultProps = {};
LayerExtension.extensionName = "LayerExtension";
var layer_extension_default = LayerExtension;

// dist/transitions/fly-to-interpolator.js
var import_core30 = require("@math.gl/core");
var import_web_mercator13 = require("@math.gl/web-mercator");
var LINEARLY_INTERPOLATED_PROPS = {
  bearing: 0,
  pitch: 0,
  position: [0, 0, 0]
};
var DEFAULT_OPTS = {
  speed: 1.2,
  curve: 1.414
};
var FlyToInterpolator = class extends TransitionInterpolator {
  constructor(opts = {}) {
    super({
      compare: ["longitude", "latitude", "zoom", "bearing", "pitch", "position"],
      extract: ["width", "height", "longitude", "latitude", "zoom", "bearing", "pitch", "position"],
      required: ["width", "height", "latitude", "longitude", "zoom"]
    });
    this.opts = { ...DEFAULT_OPTS, ...opts };
  }
  interpolateProps(startProps, endProps, t) {
    const viewport = (0, import_web_mercator13.flyToViewport)(startProps, endProps, t, this.opts);
    for (const key in LINEARLY_INTERPOLATED_PROPS) {
      viewport[key] = (0, import_core30.lerp)(startProps[key] || LINEARLY_INTERPOLATED_PROPS[key], endProps[key] || LINEARLY_INTERPOLATED_PROPS[key], t);
    }
    return viewport;
  }
  // computes the transition duration
  getDuration(startProps, endProps) {
    let { transitionDuration } = endProps;
    if (transitionDuration === "auto") {
      transitionDuration = (0, import_web_mercator13.getFlyToDuration)(startProps, endProps, this.opts);
    }
    return transitionDuration;
  }
};

// dist/utils/tesselator.js
var import_core31 = require("@luma.gl/core");
var Tesselator = class {
  constructor(opts) {
    this.indexStarts = [0];
    this.vertexStarts = [0];
    this.vertexCount = 0;
    this.instanceCount = 0;
    const { attributes = {} } = opts;
    this.typedArrayManager = typed_array_manager_default;
    this.attributes = {};
    this._attributeDefs = attributes;
    this.opts = opts;
    this.updateGeometry(opts);
  }
  /* Public methods */
  updateGeometry(opts) {
    Object.assign(this.opts, opts);
    const { data, buffers = {}, getGeometry, geometryBuffer, positionFormat, dataChanged, normalize = true } = this.opts;
    this.data = data;
    this.getGeometry = getGeometry;
    this.positionSize = // @ts-ignore (2339) when geometryBuffer is a luma Buffer, size falls back to positionFormat
    geometryBuffer && geometryBuffer.size || (positionFormat === "XY" ? 2 : 3);
    this.buffers = buffers;
    this.normalize = normalize;
    if (geometryBuffer) {
      assert(data.startIndices);
      this.getGeometry = this.getGeometryFromBuffer(geometryBuffer);
      if (!normalize) {
        buffers.vertexPositions = geometryBuffer;
      }
    }
    this.geometryBuffer = buffers.vertexPositions;
    if (Array.isArray(dataChanged)) {
      for (const dataRange of dataChanged) {
        this._rebuildGeometry(dataRange);
      }
    } else {
      this._rebuildGeometry();
    }
  }
  updatePartialGeometry({ startRow, endRow }) {
    this._rebuildGeometry({ startRow, endRow });
  }
  getGeometryFromBuffer(geometryBuffer) {
    const value = geometryBuffer.value || geometryBuffer;
    if (!ArrayBuffer.isView(value)) {
      return null;
    }
    return getAccessorFromBuffer(value, {
      size: this.positionSize,
      offset: geometryBuffer.offset,
      stride: geometryBuffer.stride,
      startIndices: this.data.startIndices
    });
  }
  /* Private utility methods */
  _allocate(instanceCount, copy) {
    const { attributes, buffers, _attributeDefs, typedArrayManager } = this;
    for (const name in _attributeDefs) {
      if (name in buffers) {
        typedArrayManager.release(attributes[name]);
        attributes[name] = null;
      } else {
        const def = _attributeDefs[name];
        def.copy = copy;
        attributes[name] = typedArrayManager.allocate(attributes[name], instanceCount, def);
      }
    }
  }
  /**
   * Visit all objects
   * `data` is expected to be an iterable consistent with the base Layer expectation
   */
  _forEachGeometry(visitor, startRow, endRow) {
    const { data, getGeometry } = this;
    const { iterable, objectInfo } = createIterable(data, startRow, endRow);
    for (const object of iterable) {
      objectInfo.index++;
      const geometry = getGeometry ? getGeometry(object, objectInfo) : null;
      visitor(geometry, objectInfo.index);
    }
  }
  /* eslint-disable complexity,max-statements */
  _rebuildGeometry(dataRange) {
    if (!this.data) {
      return;
    }
    let { indexStarts, vertexStarts, instanceCount } = this;
    const { data, geometryBuffer } = this;
    const { startRow = 0, endRow = Infinity } = dataRange || {};
    const normalizedData = {};
    if (!dataRange) {
      indexStarts = [0];
      vertexStarts = [0];
    }
    if (this.normalize || !geometryBuffer) {
      this._forEachGeometry((geometry, dataIndex) => {
        const normalizedGeometry = geometry && this.normalizeGeometry(geometry);
        normalizedData[dataIndex] = normalizedGeometry;
        vertexStarts[dataIndex + 1] = vertexStarts[dataIndex] + (normalizedGeometry ? this.getGeometrySize(normalizedGeometry) : 0);
      }, startRow, endRow);
      instanceCount = vertexStarts[vertexStarts.length - 1];
    } else {
      vertexStarts = data.startIndices;
      instanceCount = vertexStarts[data.length] || 0;
      if (ArrayBuffer.isView(geometryBuffer)) {
        instanceCount = instanceCount || geometryBuffer.length / this.positionSize;
      } else if (geometryBuffer instanceof import_core31.Buffer) {
        const byteStride = this.positionSize * 4;
        instanceCount = instanceCount || geometryBuffer.byteLength / byteStride;
      } else if (geometryBuffer.buffer) {
        const byteStride = geometryBuffer.stride || this.positionSize * 4;
        instanceCount = instanceCount || geometryBuffer.buffer.byteLength / byteStride;
      } else if (geometryBuffer.value) {
        const bufferValue = geometryBuffer.value;
        const elementStride = (
          // @ts-ignore (2339) if stride is not specified, will fall through to positionSize
          geometryBuffer.stride / bufferValue.BYTES_PER_ELEMENT || this.positionSize
        );
        instanceCount = instanceCount || bufferValue.length / elementStride;
      }
    }
    this._allocate(instanceCount, Boolean(dataRange));
    this.indexStarts = indexStarts;
    this.vertexStarts = vertexStarts;
    this.instanceCount = instanceCount;
    const context = {};
    this._forEachGeometry((geometry, dataIndex) => {
      const normalizedGeometry = normalizedData[dataIndex] || geometry;
      context.vertexStart = vertexStarts[dataIndex];
      context.indexStart = indexStarts[dataIndex];
      const vertexEnd = dataIndex < vertexStarts.length - 1 ? vertexStarts[dataIndex + 1] : instanceCount;
      context.geometrySize = vertexEnd - vertexStarts[dataIndex];
      context.geometryIndex = dataIndex;
      this.updateGeometryAttributes(normalizedGeometry, context);
    }, startRow, endRow);
    this.vertexCount = indexStarts[indexStarts.length - 1];
  }
};

// dist/utils/apply-styles.js
function applyStyles(element, style) {
  if (style) {
    Object.entries(style).map(([key, value]) => {
      if (key.startsWith("--")) {
        element.style.setProperty(key, value);
      } else {
        element.style[key] = value;
      }
    });
  }
}
function removeStyles(element, style) {
  if (style) {
    Object.keys(style).map((key) => {
      if (key.startsWith("--")) {
        element.style.removeProperty(key);
      } else {
        element.style[key] = "";
      }
    });
  }
}
//# sourceMappingURL=index.cjs.map
