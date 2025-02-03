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
  ArcLayer: () => arc_layer_default,
  BitmapLayer: () => bitmap_layer_default,
  ColumnLayer: () => column_layer_default,
  GeoJsonLayer: () => geojson_layer_default,
  GridCellLayer: () => grid_cell_layer_default,
  IconLayer: () => icon_layer_default,
  LineLayer: () => line_layer_default,
  PathLayer: () => path_layer_default,
  PointCloudLayer: () => point_cloud_layer_default,
  PolygonLayer: () => polygon_layer_default,
  ScatterplotLayer: () => scatterplot_layer_default,
  SolidPolygonLayer: () => solid_polygon_layer_default,
  TextLayer: () => text_layer_default,
  _MultiIconLayer: () => multi_icon_layer_default,
  _TextBackgroundLayer: () => text_background_layer_default
});
module.exports = __toCommonJS(dist_exports);

// dist/arc-layer/arc-layer.js
var import_core = require("@deck.gl/core");
var import_engine = require("@luma.gl/engine");

// dist/arc-layer/arc-layer-uniforms.js
var uniformBlock = `uniform arcUniforms {
  bool greatCircle;
  bool useShortestPath;
  float numSegments;
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  highp int widthUnits;
} arc;
`;
var arcUniforms = {
  name: "arc",
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    greatCircle: "f32",
    useShortestPath: "f32",
    numSegments: "f32",
    widthScale: "f32",
    widthMinPixels: "f32",
    widthMaxPixels: "f32",
    widthUnits: "i32"
  }
};

// dist/arc-layer/arc-layer-vertex.glsl.js
var arc_layer_vertex_glsl_default = `#version 300 es
#define SHADER_NAME arc-layer-vertex-shader
in vec4 instanceSourceColors;
in vec4 instanceTargetColors;
in vec3 instanceSourcePositions;
in vec3 instanceSourcePositions64Low;
in vec3 instanceTargetPositions;
in vec3 instanceTargetPositions64Low;
in vec3 instancePickingColors;
in float instanceWidths;
in float instanceHeights;
in float instanceTilts;
out vec4 vColor;
out vec2 uv;
out float isValid;
float paraboloid(float distance, float sourceZ, float targetZ, float ratio) {
float deltaZ = targetZ - sourceZ;
float dh = distance * instanceHeights;
if (dh == 0.0) {
return sourceZ + deltaZ * ratio;
}
float unitZ = deltaZ / dh;
float p2 = unitZ * unitZ + 1.0;
float dir = step(deltaZ, 0.0);
float z0 = mix(sourceZ, targetZ, dir);
float r = mix(ratio, 1.0 - ratio, dir);
return sqrt(r * (p2 - r)) * dh + z0;
}
vec2 getExtrusionOffset(vec2 line_clipspace, float offset_direction, float width) {
vec2 dir_screenspace = normalize(line_clipspace * project.viewportSize);
dir_screenspace = vec2(-dir_screenspace.y, dir_screenspace.x);
return dir_screenspace * offset_direction * width / 2.0;
}
float getSegmentRatio(float index) {
return smoothstep(0.0, 1.0, index / (arc.numSegments - 1.0));
}
vec3 interpolateFlat(vec3 source, vec3 target, float segmentRatio) {
float distance = length(source.xy - target.xy);
float z = paraboloid(distance, source.z, target.z, segmentRatio);
float tiltAngle = radians(instanceTilts);
vec2 tiltDirection = normalize(target.xy - source.xy);
vec2 tilt = vec2(-tiltDirection.y, tiltDirection.x) * z * sin(tiltAngle);
return vec3(
mix(source.xy, target.xy, segmentRatio) + tilt,
z * cos(tiltAngle)
);
}
float getAngularDist (vec2 source, vec2 target) {
vec2 sourceRadians = radians(source);
vec2 targetRadians = radians(target);
vec2 sin_half_delta = sin((sourceRadians - targetRadians) / 2.0);
vec2 shd_sq = sin_half_delta * sin_half_delta;
float a = shd_sq.y + cos(sourceRadians.y) * cos(targetRadians.y) * shd_sq.x;
return 2.0 * asin(sqrt(a));
}
vec3 interpolateGreatCircle(vec3 source, vec3 target, vec3 source3D, vec3 target3D, float angularDist, float t) {
vec2 lngLat;
if(abs(angularDist - PI) < 0.001) {
lngLat = (1.0 - t) * source.xy + t * target.xy;
} else {
float a = sin((1.0 - t) * angularDist);
float b = sin(t * angularDist);
vec3 p = source3D.yxz * a + target3D.yxz * b;
lngLat = degrees(vec2(atan(p.y, -p.x), atan(p.z, length(p.xy))));
}
float z = paraboloid(angularDist * EARTH_RADIUS, source.z, target.z, t);
return vec3(lngLat, z);
}
void main(void) {
geometry.worldPosition = instanceSourcePositions;
geometry.worldPositionAlt = instanceTargetPositions;
float segmentIndex = float(gl_VertexID / 2);
float segmentSide = mod(float(gl_VertexID), 2.) == 0. ? -1. : 1.;
float segmentRatio = getSegmentRatio(segmentIndex);
float prevSegmentRatio = getSegmentRatio(max(0.0, segmentIndex - 1.0));
float nextSegmentRatio = getSegmentRatio(min(arc.numSegments - 1.0, segmentIndex + 1.0));
float indexDir = mix(-1.0, 1.0, step(segmentIndex, 0.0));
isValid = 1.0;
uv = vec2(segmentRatio, segmentSide);
geometry.uv = uv;
geometry.pickingColor = instancePickingColors;
vec4 curr;
vec4 next;
vec3 source;
vec3 target;
if ((arc.greatCircle || project.projectionMode == PROJECTION_MODE_GLOBE) && project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT) {
source = project_globe_(vec3(instanceSourcePositions.xy, 0.0));
target = project_globe_(vec3(instanceTargetPositions.xy, 0.0));
float angularDist = getAngularDist(instanceSourcePositions.xy, instanceTargetPositions.xy);
vec3 prevPos = interpolateGreatCircle(instanceSourcePositions, instanceTargetPositions, source, target, angularDist, prevSegmentRatio);
vec3 currPos = interpolateGreatCircle(instanceSourcePositions, instanceTargetPositions, source, target, angularDist, segmentRatio);
vec3 nextPos = interpolateGreatCircle(instanceSourcePositions, instanceTargetPositions, source, target, angularDist, nextSegmentRatio);
if (abs(currPos.x - prevPos.x) > 180.0) {
indexDir = -1.0;
isValid = 0.0;
} else if (abs(currPos.x - nextPos.x) > 180.0) {
indexDir = 1.0;
isValid = 0.0;
}
nextPos = indexDir < 0.0 ? prevPos : nextPos;
nextSegmentRatio = indexDir < 0.0 ? prevSegmentRatio : nextSegmentRatio;
if (isValid == 0.0) {
nextPos.x += nextPos.x > 0.0 ? -360.0 : 360.0;
float t = ((currPos.x > 0.0 ? 180.0 : -180.0) - currPos.x) / (nextPos.x - currPos.x);
currPos = mix(currPos, nextPos, t);
segmentRatio = mix(segmentRatio, nextSegmentRatio, t);
}
vec3 currPos64Low = mix(instanceSourcePositions64Low, instanceTargetPositions64Low, segmentRatio);
vec3 nextPos64Low = mix(instanceSourcePositions64Low, instanceTargetPositions64Low, nextSegmentRatio);
curr = project_position_to_clipspace(currPos, currPos64Low, vec3(0.0), geometry.position);
next = project_position_to_clipspace(nextPos, nextPos64Low, vec3(0.0));
} else {
vec3 source_world = instanceSourcePositions;
vec3 target_world = instanceTargetPositions;
if (arc.useShortestPath) {
source_world.x = mod(source_world.x + 180., 360.0) - 180.;
target_world.x = mod(target_world.x + 180., 360.0) - 180.;
float deltaLng = target_world.x - source_world.x;
if (deltaLng > 180.) target_world.x -= 360.;
if (deltaLng < -180.) source_world.x -= 360.;
}
source = project_position(source_world, instanceSourcePositions64Low);
target = project_position(target_world, instanceTargetPositions64Low);
float antiMeridianX = 0.0;
if (arc.useShortestPath) {
if (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR_AUTO_OFFSET) {
antiMeridianX = -(project.coordinateOrigin.x + 180.) / 360. * TILE_SIZE;
}
float thresholdRatio = (antiMeridianX - source.x) / (target.x - source.x);
if (prevSegmentRatio <= thresholdRatio && nextSegmentRatio > thresholdRatio) {
isValid = 0.0;
indexDir = sign(segmentRatio - thresholdRatio);
segmentRatio = thresholdRatio;
}
}
nextSegmentRatio = indexDir < 0.0 ? prevSegmentRatio : nextSegmentRatio;
vec3 currPos = interpolateFlat(source, target, segmentRatio);
vec3 nextPos = interpolateFlat(source, target, nextSegmentRatio);
if (arc.useShortestPath) {
if (nextPos.x < antiMeridianX) {
currPos.x += TILE_SIZE;
nextPos.x += TILE_SIZE;
}
}
curr = project_common_position_to_clipspace(vec4(currPos, 1.0));
next = project_common_position_to_clipspace(vec4(nextPos, 1.0));
geometry.position = vec4(currPos, 1.0);
}
float widthPixels = clamp(
project_size_to_pixel(instanceWidths * arc.widthScale, arc.widthUnits),
arc.widthMinPixels, arc.widthMaxPixels
);
vec3 offset = vec3(
getExtrusionOffset((next.xy - curr.xy) * indexDir, segmentSide, widthPixels),
0.0);
DECKGL_FILTER_SIZE(offset, geometry);
DECKGL_FILTER_GL_POSITION(curr, geometry);
gl_Position = curr + vec4(project_pixel_size_to_clipspace(offset.xy), 0.0, 0.0);
vec4 color = mix(instanceSourceColors, instanceTargetColors, segmentRatio);
vColor = vec4(color.rgb, color.a * layer.opacity);
DECKGL_FILTER_COLOR(vColor, geometry);
}
`;

// dist/arc-layer/arc-layer-fragment.glsl.js
var arc_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME arc-layer-fragment-shader
precision highp float;
in vec4 vColor;
in vec2 uv;
in float isValid;
out vec4 fragColor;
void main(void) {
if (isValid == 0.0) {
discard;
}
fragColor = vColor;
geometry.uv = uv;
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// dist/arc-layer/arc-layer.js
var DEFAULT_COLOR = [0, 0, 0, 255];
var defaultProps = {
  getSourcePosition: { type: "accessor", value: (x) => x.sourcePosition },
  getTargetPosition: { type: "accessor", value: (x) => x.targetPosition },
  getSourceColor: { type: "accessor", value: DEFAULT_COLOR },
  getTargetColor: { type: "accessor", value: DEFAULT_COLOR },
  getWidth: { type: "accessor", value: 1 },
  getHeight: { type: "accessor", value: 1 },
  getTilt: { type: "accessor", value: 0 },
  greatCircle: false,
  numSegments: { type: "number", value: 50, min: 1 },
  widthUnits: "pixels",
  widthScale: { type: "number", value: 1, min: 0 },
  widthMinPixels: { type: "number", value: 0, min: 0 },
  widthMaxPixels: { type: "number", value: Number.MAX_SAFE_INTEGER, min: 0 }
};
var ArcLayer = class extends import_core.Layer {
  getBounds() {
    var _a;
    return (_a = this.getAttributeManager()) == null ? void 0 : _a.getBounds([
      "instanceSourcePositions",
      "instanceTargetPositions"
    ]);
  }
  getShaders() {
    return super.getShaders({ vs: arc_layer_vertex_glsl_default, fs: arc_layer_fragment_glsl_default, modules: [import_core.project32, import_core.picking, arcUniforms] });
  }
  // This layer has its own wrapLongitude logic
  get wrapLongitude() {
    return false;
  }
  initializeState() {
    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instanceSourcePositions: {
        size: 3,
        type: "float64",
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: "getSourcePosition"
      },
      instanceTargetPositions: {
        size: 3,
        type: "float64",
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: "getTargetPosition"
      },
      instanceSourceColors: {
        size: this.props.colorFormat.length,
        type: "unorm8",
        transition: true,
        accessor: "getSourceColor",
        defaultValue: DEFAULT_COLOR
      },
      instanceTargetColors: {
        size: this.props.colorFormat.length,
        type: "unorm8",
        transition: true,
        accessor: "getTargetColor",
        defaultValue: DEFAULT_COLOR
      },
      instanceWidths: {
        size: 1,
        transition: true,
        accessor: "getWidth",
        defaultValue: 1
      },
      instanceHeights: {
        size: 1,
        transition: true,
        accessor: "getHeight",
        defaultValue: 1
      },
      instanceTilts: {
        size: 1,
        transition: true,
        accessor: "getTilt",
        defaultValue: 0
      }
    });
  }
  updateState(params) {
    var _a;
    super.updateState(params);
    if (params.changeFlags.extensionsChanged) {
      (_a = this.state.model) == null ? void 0 : _a.destroy();
      this.state.model = this._getModel();
      this.getAttributeManager().invalidateAll();
    }
  }
  draw({ uniforms }) {
    const { widthUnits, widthScale, widthMinPixels, widthMaxPixels, greatCircle, wrapLongitude, numSegments } = this.props;
    const arcProps = {
      numSegments,
      widthUnits: import_core.UNIT[widthUnits],
      widthScale,
      widthMinPixels,
      widthMaxPixels,
      greatCircle,
      useShortestPath: wrapLongitude
    };
    const model = this.state.model;
    model.shaderInputs.setProps({ arc: arcProps });
    model.setVertexCount(numSegments * 2);
    model.draw(this.context.renderPass);
  }
  _getModel() {
    return new import_engine.Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager().getBufferLayouts(),
      topology: "triangle-strip",
      isInstanced: true
    });
  }
};
ArcLayer.layerName = "ArcLayer";
ArcLayer.defaultProps = defaultProps;
var arc_layer_default = ArcLayer;

// dist/bitmap-layer/bitmap-layer.js
var import_core3 = require("@deck.gl/core");
var import_engine2 = require("@luma.gl/engine");
var import_web_mercator = require("@math.gl/web-mercator");

// dist/bitmap-layer/create-mesh.js
var import_core2 = require("@math.gl/core");
var DEFAULT_INDICES = new Uint32Array([0, 2, 1, 0, 3, 2]);
var DEFAULT_TEX_COORDS = new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]);
function createMesh(bounds, resolution) {
  if (!resolution) {
    return createQuad(bounds);
  }
  const maxXSpan = Math.max(Math.abs(bounds[0][0] - bounds[3][0]), Math.abs(bounds[1][0] - bounds[2][0]));
  const maxYSpan = Math.max(Math.abs(bounds[1][1] - bounds[0][1]), Math.abs(bounds[2][1] - bounds[3][1]));
  const uCount = Math.ceil(maxXSpan / resolution) + 1;
  const vCount = Math.ceil(maxYSpan / resolution) + 1;
  const vertexCount = (uCount - 1) * (vCount - 1) * 6;
  const indices = new Uint32Array(vertexCount);
  const texCoords = new Float32Array(uCount * vCount * 2);
  const positions = new Float64Array(uCount * vCount * 3);
  let vertex = 0;
  let index = 0;
  for (let u = 0; u < uCount; u++) {
    const ut = u / (uCount - 1);
    for (let v = 0; v < vCount; v++) {
      const vt = v / (vCount - 1);
      const p = interpolateQuad(bounds, ut, vt);
      positions[vertex * 3 + 0] = p[0];
      positions[vertex * 3 + 1] = p[1];
      positions[vertex * 3 + 2] = p[2] || 0;
      texCoords[vertex * 2 + 0] = ut;
      texCoords[vertex * 2 + 1] = 1 - vt;
      if (u > 0 && v > 0) {
        indices[index++] = vertex - vCount;
        indices[index++] = vertex - vCount - 1;
        indices[index++] = vertex - 1;
        indices[index++] = vertex - vCount;
        indices[index++] = vertex - 1;
        indices[index++] = vertex;
      }
      vertex++;
    }
  }
  return {
    vertexCount,
    positions,
    indices,
    texCoords
  };
}
function createQuad(bounds) {
  const positions = new Float64Array(12);
  for (let i = 0; i < bounds.length; i++) {
    positions[i * 3 + 0] = bounds[i][0];
    positions[i * 3 + 1] = bounds[i][1];
    positions[i * 3 + 2] = bounds[i][2] || 0;
  }
  return {
    vertexCount: 6,
    positions,
    indices: DEFAULT_INDICES,
    texCoords: DEFAULT_TEX_COORDS
  };
}
function interpolateQuad(quad, ut, vt) {
  return (0, import_core2.lerp)((0, import_core2.lerp)(quad[0], quad[1], vt), (0, import_core2.lerp)(quad[3], quad[2], vt), ut);
}

// dist/bitmap-layer/bitmap-layer-uniforms.js
var uniformBlock2 = `uniform bitmapUniforms {
  vec4 bounds;
  float coordinateConversion;
  float desaturate;
  vec3 tintColor;
  vec4 transparentColor;
} bitmap;
`;
var bitmapUniforms = {
  name: "bitmap",
  vs: uniformBlock2,
  fs: uniformBlock2,
  uniformTypes: {
    bounds: "vec4<f32>",
    coordinateConversion: "f32",
    desaturate: "f32",
    tintColor: "vec3<f32>",
    transparentColor: "vec4<f32>"
  }
};

// dist/bitmap-layer/bitmap-layer-vertex.js
var bitmap_layer_vertex_default = `#version 300 es
#define SHADER_NAME bitmap-layer-vertex-shader

in vec2 texCoords;
in vec3 positions;
in vec3 positions64Low;

out vec2 vTexCoord;
out vec2 vTexPos;

const vec3 pickingColor = vec3(1.0, 0.0, 0.0);

void main(void) {
  geometry.worldPosition = positions;
  geometry.uv = texCoords;
  geometry.pickingColor = pickingColor;

  gl_Position = project_position_to_clipspace(positions, positions64Low, vec3(0.0), geometry.position);
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  vTexCoord = texCoords;

  if (bitmap.coordinateConversion < -0.5) {
    vTexPos = geometry.position.xy + project.commonOrigin.xy;
  } else if (bitmap.coordinateConversion > 0.5) {
    vTexPos = geometry.worldPosition.xy;
  }

  vec4 color = vec4(0.0);
  DECKGL_FILTER_COLOR(color, geometry);
}
`;

// dist/bitmap-layer/bitmap-layer-fragment.js
var packUVsIntoRGB = `
vec3 packUVsIntoRGB(vec2 uv) {
  // Extract the top 8 bits. We want values to be truncated down so we can add a fraction
  vec2 uv8bit = floor(uv * 256.);

  // Calculate the normalized remainders of u and v parts that do not fit into 8 bits
  // Scale and clamp to 0-1 range
  vec2 uvFraction = fract(uv * 256.);
  vec2 uvFraction4bit = floor(uvFraction * 16.);

  // Remainder can be encoded in blue channel, encode as 4 bits for pixel coordinates
  float fractions = uvFraction4bit.x + uvFraction4bit.y * 16.;

  return vec3(uv8bit, fractions) / 255.;
}
`;
var bitmap_layer_fragment_default = `#version 300 es
#define SHADER_NAME bitmap-layer-fragment-shader

#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D bitmapTexture;

in vec2 vTexCoord;
in vec2 vTexPos;

out vec4 fragColor;

/* projection utils */
const float TILE_SIZE = 512.0;
const float PI = 3.1415926536;
const float WORLD_SCALE = TILE_SIZE / PI / 2.0;

// from degrees to Web Mercator
vec2 lnglat_to_mercator(vec2 lnglat) {
  float x = lnglat.x;
  float y = clamp(lnglat.y, -89.9, 89.9);
  return vec2(
    radians(x) + PI,
    PI + log(tan(PI * 0.25 + radians(y) * 0.5))
  ) * WORLD_SCALE;
}

// from Web Mercator to degrees
vec2 mercator_to_lnglat(vec2 xy) {
  xy /= WORLD_SCALE;
  return degrees(vec2(
    xy.x - PI,
    atan(exp(xy.y - PI)) * 2.0 - PI * 0.5
  ));
}
/* End projection utils */

// apply desaturation
vec3 color_desaturate(vec3 color) {
  float luminance = (color.r + color.g + color.b) * 0.333333333;
  return mix(color, vec3(luminance), bitmap.desaturate);
}

// apply tint
vec3 color_tint(vec3 color) {
  return color * bitmap.tintColor;
}

// blend with background color
vec4 apply_opacity(vec3 color, float alpha) {
  if (bitmap.transparentColor.a == 0.0) {
    return vec4(color, alpha);
  }
  float blendedAlpha = alpha + bitmap.transparentColor.a * (1.0 - alpha);
  float highLightRatio = alpha / blendedAlpha;
  vec3 blendedRGB = mix(bitmap.transparentColor.rgb, color, highLightRatio);
  return vec4(blendedRGB, blendedAlpha);
}

vec2 getUV(vec2 pos) {
  return vec2(
    (pos.x - bitmap.bounds[0]) / (bitmap.bounds[2] - bitmap.bounds[0]),
    (pos.y - bitmap.bounds[3]) / (bitmap.bounds[1] - bitmap.bounds[3])
  );
}

${packUVsIntoRGB}

void main(void) {
  vec2 uv = vTexCoord;
  if (bitmap.coordinateConversion < -0.5) {
    vec2 lnglat = mercator_to_lnglat(vTexPos);
    uv = getUV(lnglat);
  } else if (bitmap.coordinateConversion > 0.5) {
    vec2 commonPos = lnglat_to_mercator(vTexPos);
    uv = getUV(commonPos);
  }
  vec4 bitmapColor = texture(bitmapTexture, uv);

  fragColor = apply_opacity(color_tint(color_desaturate(bitmapColor.rgb)), bitmapColor.a * layer.opacity);

  geometry.uv = uv;
  DECKGL_FILTER_COLOR(fragColor, geometry);

  if (bool(picking.isActive) && !bool(picking.isAttribute)) {
    // Since instance information is not used, we can use picking color for pixel index
    fragColor.rgb = packUVsIntoRGB(uv);
  }
}
`;

// dist/bitmap-layer/bitmap-layer.js
var defaultProps2 = {
  image: { type: "image", value: null, async: true },
  bounds: { type: "array", value: [1, 0, 0, 1], compare: true },
  _imageCoordinateSystem: import_core3.COORDINATE_SYSTEM.DEFAULT,
  desaturate: { type: "number", min: 0, max: 1, value: 0 },
  // More context: because of the blending mode we're using for ground imagery,
  // alpha is not effective when blending the bitmap layers with the base map.
  // Instead we need to manually dim/blend rgb values with a background color.
  transparentColor: { type: "color", value: [0, 0, 0, 0] },
  tintColor: { type: "color", value: [255, 255, 255] },
  textureParameters: { type: "object", ignore: true, value: null }
};
var BitmapLayer = class extends import_core3.Layer {
  getShaders() {
    return super.getShaders({ vs: bitmap_layer_vertex_default, fs: bitmap_layer_fragment_default, modules: [import_core3.project32, import_core3.picking, bitmapUniforms] });
  }
  initializeState() {
    const attributeManager = this.getAttributeManager();
    attributeManager.remove(["instancePickingColors"]);
    const noAlloc = true;
    attributeManager.add({
      indices: {
        size: 1,
        isIndexed: true,
        update: (attribute) => attribute.value = this.state.mesh.indices,
        noAlloc
      },
      positions: {
        size: 3,
        type: "float64",
        fp64: this.use64bitPositions(),
        update: (attribute) => attribute.value = this.state.mesh.positions,
        noAlloc
      },
      texCoords: {
        size: 2,
        update: (attribute) => attribute.value = this.state.mesh.texCoords,
        noAlloc
      }
    });
  }
  updateState({ props, oldProps, changeFlags }) {
    var _a;
    const attributeManager = this.getAttributeManager();
    if (changeFlags.extensionsChanged) {
      (_a = this.state.model) == null ? void 0 : _a.destroy();
      this.state.model = this._getModel();
      attributeManager.invalidateAll();
    }
    if (props.bounds !== oldProps.bounds) {
      const oldMesh = this.state.mesh;
      const mesh = this._createMesh();
      this.state.model.setVertexCount(mesh.vertexCount);
      for (const key in mesh) {
        if (oldMesh && oldMesh[key] !== mesh[key]) {
          attributeManager.invalidate(key);
        }
      }
      this.setState({ mesh, ...this._getCoordinateUniforms() });
    } else if (props._imageCoordinateSystem !== oldProps._imageCoordinateSystem) {
      this.setState(this._getCoordinateUniforms());
    }
  }
  getPickingInfo(params) {
    const { image } = this.props;
    const info = params.info;
    if (!info.color || !image) {
      info.bitmap = null;
      return info;
    }
    const { width, height } = image;
    info.index = 0;
    const uv = unpackUVsFromRGB(info.color);
    info.bitmap = {
      size: { width, height },
      uv,
      pixel: [Math.floor(uv[0] * width), Math.floor(uv[1] * height)]
    };
    return info;
  }
  // Override base Layer multi-depth picking logic
  disablePickingIndex() {
    this.setState({ disablePicking: true });
  }
  restorePickingColors() {
    this.setState({ disablePicking: false });
  }
  _updateAutoHighlight(info) {
    super._updateAutoHighlight({
      ...info,
      color: this.encodePickingColor(0)
    });
  }
  _createMesh() {
    const { bounds } = this.props;
    let normalizedBounds = bounds;
    if (isRectangularBounds(bounds)) {
      normalizedBounds = [
        [bounds[0], bounds[1]],
        [bounds[0], bounds[3]],
        [bounds[2], bounds[3]],
        [bounds[2], bounds[1]]
      ];
    }
    return createMesh(normalizedBounds, this.context.viewport.resolution);
  }
  _getModel() {
    return new import_engine2.Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager().getBufferLayouts(),
      topology: "triangle-list",
      isInstanced: false
    });
  }
  draw(opts) {
    const { shaderModuleProps } = opts;
    const { model, coordinateConversion, bounds, disablePicking } = this.state;
    const { image, desaturate, transparentColor, tintColor } = this.props;
    if (shaderModuleProps.picking.isActive && disablePicking) {
      return;
    }
    if (image && model) {
      const bitmapProps = {
        bitmapTexture: image,
        bounds,
        coordinateConversion,
        desaturate,
        tintColor: tintColor.slice(0, 3).map((x) => x / 255),
        transparentColor: transparentColor.map((x) => x / 255)
      };
      model.shaderInputs.setProps({ bitmap: bitmapProps });
      model.draw(this.context.renderPass);
    }
  }
  _getCoordinateUniforms() {
    const { LNGLAT, CARTESIAN, DEFAULT } = import_core3.COORDINATE_SYSTEM;
    let { _imageCoordinateSystem: imageCoordinateSystem } = this.props;
    if (imageCoordinateSystem !== DEFAULT) {
      const { bounds } = this.props;
      if (!isRectangularBounds(bounds)) {
        throw new Error("_imageCoordinateSystem only supports rectangular bounds");
      }
      const defaultImageCoordinateSystem = this.context.viewport.resolution ? LNGLAT : CARTESIAN;
      imageCoordinateSystem = imageCoordinateSystem === LNGLAT ? LNGLAT : CARTESIAN;
      if (imageCoordinateSystem === LNGLAT && defaultImageCoordinateSystem === CARTESIAN) {
        return { coordinateConversion: -1, bounds };
      }
      if (imageCoordinateSystem === CARTESIAN && defaultImageCoordinateSystem === LNGLAT) {
        const bottomLeft = (0, import_web_mercator.lngLatToWorld)([bounds[0], bounds[1]]);
        const topRight = (0, import_web_mercator.lngLatToWorld)([bounds[2], bounds[3]]);
        return {
          coordinateConversion: 1,
          bounds: [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]]
        };
      }
    }
    return {
      coordinateConversion: 0,
      bounds: [0, 0, 0, 0]
    };
  }
};
BitmapLayer.layerName = "BitmapLayer";
BitmapLayer.defaultProps = defaultProps2;
var bitmap_layer_default = BitmapLayer;
function unpackUVsFromRGB(color) {
  const [u, v, fracUV] = color;
  const vFrac = (fracUV & 240) / 256;
  const uFrac = (fracUV & 15) / 16;
  return [(u + uFrac) / 256, (v + vFrac) / 256];
}
function isRectangularBounds(bounds) {
  return Number.isFinite(bounds[0]);
}

// dist/icon-layer/icon-layer.js
var import_core6 = require("@deck.gl/core");
var import_engine3 = require("@luma.gl/engine");

// dist/icon-layer/icon-layer-uniforms.js
var uniformBlock3 = `uniform iconUniforms {
  float sizeScale;
  vec2 iconsTextureDim;
  float sizeMinPixels;
  float sizeMaxPixels;
  bool billboard;
  highp int sizeUnits;
  float alphaCutoff;
} icon;
`;
var iconUniforms = {
  name: "icon",
  vs: uniformBlock3,
  fs: uniformBlock3,
  uniformTypes: {
    sizeScale: "f32",
    iconsTextureDim: "vec2<f32>",
    sizeMinPixels: "f32",
    sizeMaxPixels: "f32",
    billboard: "f32",
    sizeUnits: "i32",
    alphaCutoff: "f32"
  }
};

// dist/icon-layer/icon-layer-vertex.glsl.js
var icon_layer_vertex_glsl_default = `#version 300 es
#define SHADER_NAME icon-layer-vertex-shader
in vec2 positions;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in float instanceSizes;
in float instanceAngles;
in vec4 instanceColors;
in vec3 instancePickingColors;
in vec4 instanceIconFrames;
in float instanceColorModes;
in vec2 instanceOffsets;
in vec2 instancePixelOffset;
out float vColorMode;
out vec4 vColor;
out vec2 vTextureCoords;
out vec2 uv;
vec2 rotate_by_angle(vec2 vertex, float angle) {
float angle_radian = angle * PI / 180.0;
float cos_angle = cos(angle_radian);
float sin_angle = sin(angle_radian);
mat2 rotationMatrix = mat2(cos_angle, -sin_angle, sin_angle, cos_angle);
return rotationMatrix * vertex;
}
void main(void) {
geometry.worldPosition = instancePositions;
geometry.uv = positions;
geometry.pickingColor = instancePickingColors;
uv = positions;
vec2 iconSize = instanceIconFrames.zw;
float sizePixels = clamp(
project_size_to_pixel(instanceSizes * icon.sizeScale, icon.sizeUnits),
icon.sizeMinPixels, icon.sizeMaxPixels
);
float instanceScale = iconSize.y == 0.0 ? 0.0 : sizePixels / iconSize.y;
vec2 pixelOffset = positions / 2.0 * iconSize + instanceOffsets;
pixelOffset = rotate_by_angle(pixelOffset, instanceAngles) * instanceScale;
pixelOffset += instancePixelOffset;
pixelOffset.y *= -1.0;
if (icon.billboard)  {
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
vec3 offset = vec3(pixelOffset, 0.0);
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
} else {
vec3 offset_common = vec3(project_pixel_size(pixelOffset), 0.0);
DECKGL_FILTER_SIZE(offset_common, geometry);
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset_common, geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
}
vTextureCoords = mix(
instanceIconFrames.xy,
instanceIconFrames.xy + iconSize,
(positions.xy + 1.0) / 2.0
) / icon.iconsTextureDim;
vColor = instanceColors;
DECKGL_FILTER_COLOR(vColor, geometry);
vColorMode = instanceColorModes;
}
`;

// dist/icon-layer/icon-layer-fragment.glsl.js
var icon_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME icon-layer-fragment-shader
precision highp float;
uniform sampler2D iconsTexture;
in float vColorMode;
in vec4 vColor;
in vec2 vTextureCoords;
in vec2 uv;
out vec4 fragColor;
void main(void) {
geometry.uv = uv;
vec4 texColor = texture(iconsTexture, vTextureCoords);
vec3 color = mix(texColor.rgb, vColor.rgb, vColorMode);
float a = texColor.a * layer.opacity * vColor.a;
if (a < icon.alphaCutoff) {
discard;
}
fragColor = vec4(color, a);
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// dist/icon-layer/icon-manager.js
var import_core4 = require("@loaders.gl/core");
var import_core5 = require("@deck.gl/core");
var DEFAULT_CANVAS_WIDTH = 1024;
var DEFAULT_BUFFER = 4;
var noop = () => {
};
var DEFAULT_SAMPLER_PARAMETERS = {
  minFilter: "linear",
  mipmapFilter: "linear",
  // LINEAR is the default value but explicitly set it here
  magFilter: "linear",
  // minimize texture boundary artifacts
  addressModeU: "clamp-to-edge",
  addressModeV: "clamp-to-edge"
};
var MISSING_ICON = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
};
function nextPowOfTwo(number) {
  return Math.pow(2, Math.ceil(Math.log2(number)));
}
function resizeImage(ctx, imageData, maxWidth, maxHeight) {
  const resizeRatio = Math.min(maxWidth / imageData.width, maxHeight / imageData.height);
  const width = Math.floor(imageData.width * resizeRatio);
  const height = Math.floor(imageData.height * resizeRatio);
  if (resizeRatio === 1) {
    return { image: imageData, width, height };
  }
  ctx.canvas.height = height;
  ctx.canvas.width = width;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(imageData, 0, 0, imageData.width, imageData.height, 0, 0, width, height);
  return { image: ctx.canvas, width, height };
}
function getIconId(icon) {
  return icon && (icon.id || icon.url);
}
function resizeTexture(texture, width, height, sampler) {
  const { width: oldWidth, height: oldHeight, device } = texture;
  const newTexture = device.createTexture({
    format: "rgba8unorm",
    width,
    height,
    sampler,
    mipmaps: true
  });
  const commandEncoder = device.createCommandEncoder();
  commandEncoder.copyTextureToTexture({
    sourceTexture: texture,
    destinationTexture: newTexture,
    width: oldWidth,
    height: oldHeight
  });
  commandEncoder.finish();
  texture.destroy();
  return newTexture;
}
function buildRowMapping(mapping, columns, yOffset) {
  for (let i = 0; i < columns.length; i++) {
    const { icon, xOffset } = columns[i];
    const id = getIconId(icon);
    mapping[id] = {
      ...icon,
      x: xOffset,
      y: yOffset
    };
  }
}
function buildMapping({ icons, buffer, mapping = {}, xOffset = 0, yOffset = 0, rowHeight = 0, canvasWidth }) {
  let columns = [];
  for (let i = 0; i < icons.length; i++) {
    const icon = icons[i];
    const id = getIconId(icon);
    if (!mapping[id]) {
      const { height, width } = icon;
      if (xOffset + width + buffer > canvasWidth) {
        buildRowMapping(mapping, columns, yOffset);
        xOffset = 0;
        yOffset = rowHeight + yOffset + buffer;
        rowHeight = 0;
        columns = [];
      }
      columns.push({
        icon,
        xOffset
      });
      xOffset = xOffset + width + buffer;
      rowHeight = Math.max(rowHeight, height);
    }
  }
  if (columns.length > 0) {
    buildRowMapping(mapping, columns, yOffset);
  }
  return {
    mapping,
    rowHeight,
    xOffset,
    yOffset,
    canvasWidth,
    canvasHeight: nextPowOfTwo(rowHeight + yOffset + buffer)
  };
}
function getDiffIcons(data, getIcon, cachedIcons) {
  if (!data || !getIcon) {
    return null;
  }
  cachedIcons = cachedIcons || {};
  const icons = {};
  const { iterable, objectInfo } = (0, import_core5.createIterable)(data);
  for (const object of iterable) {
    objectInfo.index++;
    const icon = getIcon(object, objectInfo);
    const id = getIconId(icon);
    if (!icon) {
      throw new Error("Icon is missing.");
    }
    if (!icon.url) {
      throw new Error("Icon url is missing.");
    }
    if (!icons[id] && (!cachedIcons[id] || icon.url !== cachedIcons[id].url)) {
      icons[id] = { ...icon, source: object, sourceIndex: objectInfo.index };
    }
  }
  return icons;
}
var IconManager = class {
  constructor(device, { onUpdate = noop, onError = noop }) {
    this._loadOptions = null;
    this._texture = null;
    this._externalTexture = null;
    this._mapping = {};
    this._samplerParameters = null;
    this._pendingCount = 0;
    this._autoPacking = false;
    this._xOffset = 0;
    this._yOffset = 0;
    this._rowHeight = 0;
    this._buffer = DEFAULT_BUFFER;
    this._canvasWidth = DEFAULT_CANVAS_WIDTH;
    this._canvasHeight = 0;
    this._canvas = null;
    this.device = device;
    this.onUpdate = onUpdate;
    this.onError = onError;
  }
  finalize() {
    var _a;
    (_a = this._texture) == null ? void 0 : _a.delete();
  }
  getTexture() {
    return this._texture || this._externalTexture;
  }
  getIconMapping(icon) {
    const id = this._autoPacking ? getIconId(icon) : icon;
    return this._mapping[id] || MISSING_ICON;
  }
  setProps({ loadOptions, autoPacking, iconAtlas, iconMapping, textureParameters }) {
    var _a;
    if (loadOptions) {
      this._loadOptions = loadOptions;
    }
    if (autoPacking !== void 0) {
      this._autoPacking = autoPacking;
    }
    if (iconMapping) {
      this._mapping = iconMapping;
    }
    if (iconAtlas) {
      (_a = this._texture) == null ? void 0 : _a.delete();
      this._texture = null;
      this._externalTexture = iconAtlas;
    }
    if (textureParameters) {
      this._samplerParameters = textureParameters;
    }
  }
  get isLoaded() {
    return this._pendingCount === 0;
  }
  packIcons(data, getIcon) {
    if (!this._autoPacking || typeof document === "undefined") {
      return;
    }
    const icons = Object.values(getDiffIcons(data, getIcon, this._mapping) || {});
    if (icons.length > 0) {
      const { mapping, xOffset, yOffset, rowHeight, canvasHeight } = buildMapping({
        icons,
        buffer: this._buffer,
        canvasWidth: this._canvasWidth,
        mapping: this._mapping,
        rowHeight: this._rowHeight,
        xOffset: this._xOffset,
        yOffset: this._yOffset
      });
      this._rowHeight = rowHeight;
      this._mapping = mapping;
      this._xOffset = xOffset;
      this._yOffset = yOffset;
      this._canvasHeight = canvasHeight;
      if (!this._texture) {
        this._texture = this.device.createTexture({
          format: "rgba8unorm",
          width: this._canvasWidth,
          height: this._canvasHeight,
          sampler: this._samplerParameters || DEFAULT_SAMPLER_PARAMETERS,
          mipmaps: true
        });
      }
      if (this._texture.height !== this._canvasHeight) {
        this._texture = resizeTexture(this._texture, this._canvasWidth, this._canvasHeight, this._samplerParameters || DEFAULT_SAMPLER_PARAMETERS);
      }
      this.onUpdate();
      this._canvas = this._canvas || document.createElement("canvas");
      this._loadIcons(icons);
    }
  }
  _loadIcons(icons) {
    const ctx = this._canvas.getContext("2d", {
      willReadFrequently: true
    });
    for (const icon of icons) {
      this._pendingCount++;
      (0, import_core4.load)(icon.url, this._loadOptions).then((imageData) => {
        var _a;
        const id = getIconId(icon);
        const iconDef = this._mapping[id];
        const { x, y, width: maxWidth, height: maxHeight } = iconDef;
        const { image, width, height } = resizeImage(ctx, imageData, maxWidth, maxHeight);
        (_a = this._texture) == null ? void 0 : _a.copyExternalImage({
          image,
          x: x + (maxWidth - width) / 2,
          y: y + (maxHeight - height) / 2,
          width,
          height
        });
        iconDef.width = width;
        iconDef.height = height;
        this._texture.generateMipmap();
        this.onUpdate();
      }).catch((error) => {
        this.onError({
          url: icon.url,
          source: icon.source,
          sourceIndex: icon.sourceIndex,
          loadOptions: this._loadOptions,
          error
        });
      }).finally(() => {
        this._pendingCount--;
      });
    }
  }
};

// dist/icon-layer/icon-layer.js
var DEFAULT_COLOR2 = [0, 0, 0, 255];
var defaultProps3 = {
  iconAtlas: { type: "image", value: null, async: true },
  iconMapping: { type: "object", value: {}, async: true },
  sizeScale: { type: "number", value: 1, min: 0 },
  billboard: true,
  sizeUnits: "pixels",
  sizeMinPixels: { type: "number", min: 0, value: 0 },
  //  min point radius in pixels
  sizeMaxPixels: { type: "number", min: 0, value: Number.MAX_SAFE_INTEGER },
  // max point radius in pixels
  alphaCutoff: { type: "number", value: 0.05, min: 0, max: 1 },
  getPosition: { type: "accessor", value: (x) => x.position },
  getIcon: { type: "accessor", value: (x) => x.icon },
  getColor: { type: "accessor", value: DEFAULT_COLOR2 },
  getSize: { type: "accessor", value: 1 },
  getAngle: { type: "accessor", value: 0 },
  getPixelOffset: { type: "accessor", value: [0, 0] },
  onIconError: { type: "function", value: null, optional: true },
  textureParameters: { type: "object", ignore: true, value: null }
};
var IconLayer = class extends import_core6.Layer {
  getShaders() {
    return super.getShaders({ vs: icon_layer_vertex_glsl_default, fs: icon_layer_fragment_glsl_default, modules: [import_core6.project32, import_core6.picking, iconUniforms] });
  }
  initializeState() {
    this.state = {
      iconManager: new IconManager(this.context.device, {
        onUpdate: this._onUpdate.bind(this),
        onError: this._onError.bind(this)
      })
    };
    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instancePositions: {
        size: 3,
        type: "float64",
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: "getPosition"
      },
      instanceSizes: {
        size: 1,
        transition: true,
        accessor: "getSize",
        defaultValue: 1
      },
      instanceOffsets: {
        size: 2,
        accessor: "getIcon",
        // eslint-disable-next-line @typescript-eslint/unbound-method
        transform: this.getInstanceOffset
      },
      instanceIconFrames: {
        size: 4,
        accessor: "getIcon",
        // eslint-disable-next-line @typescript-eslint/unbound-method
        transform: this.getInstanceIconFrame
      },
      instanceColorModes: {
        size: 1,
        type: "uint8",
        accessor: "getIcon",
        // eslint-disable-next-line @typescript-eslint/unbound-method
        transform: this.getInstanceColorMode
      },
      instanceColors: {
        size: this.props.colorFormat.length,
        type: "unorm8",
        transition: true,
        accessor: "getColor",
        defaultValue: DEFAULT_COLOR2
      },
      instanceAngles: {
        size: 1,
        transition: true,
        accessor: "getAngle"
      },
      instancePixelOffset: {
        size: 2,
        transition: true,
        accessor: "getPixelOffset"
      }
    });
  }
  /* eslint-disable max-statements, complexity */
  updateState(params) {
    var _a;
    super.updateState(params);
    const { props, oldProps, changeFlags } = params;
    const attributeManager = this.getAttributeManager();
    const { iconAtlas, iconMapping, data, getIcon, textureParameters } = props;
    const { iconManager } = this.state;
    if (typeof iconAtlas === "string") {
      return;
    }
    const prePacked = iconAtlas || this.internalState.isAsyncPropLoading("iconAtlas");
    iconManager.setProps({
      loadOptions: props.loadOptions,
      autoPacking: !prePacked,
      iconAtlas,
      iconMapping: prePacked ? iconMapping : null,
      textureParameters
    });
    if (prePacked) {
      if (oldProps.iconMapping !== props.iconMapping) {
        attributeManager.invalidate("getIcon");
      }
    } else if (changeFlags.dataChanged || changeFlags.updateTriggersChanged && (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getIcon)) {
      iconManager.packIcons(data, getIcon);
    }
    if (changeFlags.extensionsChanged) {
      (_a = this.state.model) == null ? void 0 : _a.destroy();
      this.state.model = this._getModel();
      attributeManager.invalidateAll();
    }
  }
  /* eslint-enable max-statements, complexity */
  get isLoaded() {
    return super.isLoaded && this.state.iconManager.isLoaded;
  }
  finalizeState(context) {
    super.finalizeState(context);
    this.state.iconManager.finalize();
  }
  draw({ uniforms }) {
    const { sizeScale, sizeMinPixels, sizeMaxPixels, sizeUnits, billboard, alphaCutoff } = this.props;
    const { iconManager } = this.state;
    const iconsTexture = iconManager.getTexture();
    if (iconsTexture) {
      const model = this.state.model;
      const iconProps = {
        iconsTexture,
        iconsTextureDim: [iconsTexture.width, iconsTexture.height],
        sizeUnits: import_core6.UNIT[sizeUnits],
        sizeScale,
        sizeMinPixels,
        sizeMaxPixels,
        billboard,
        alphaCutoff
      };
      model.shaderInputs.setProps({ icon: iconProps });
      model.draw(this.context.renderPass);
    }
  }
  _getModel() {
    const positions = [-1, -1, 1, -1, -1, 1, 1, 1];
    return new import_engine3.Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager().getBufferLayouts(),
      geometry: new import_engine3.Geometry({
        topology: "triangle-strip",
        attributes: {
          // The size must be explicitly passed here otherwise luma.gl
          // will default to assuming that positions are 3D (x,y,z)
          positions: {
            size: 2,
            value: new Float32Array(positions)
          }
        }
      }),
      isInstanced: true
    });
  }
  _onUpdate() {
    this.setNeedsRedraw();
  }
  _onError(evt) {
    var _a;
    const onIconError = (_a = this.getCurrentLayer()) == null ? void 0 : _a.props.onIconError;
    if (onIconError) {
      onIconError(evt);
    } else {
      import_core6.log.error(evt.error.message)();
    }
  }
  getInstanceOffset(icon) {
    const { width, height, anchorX = width / 2, anchorY = height / 2 } = this.state.iconManager.getIconMapping(icon);
    return [width / 2 - anchorX, height / 2 - anchorY];
  }
  getInstanceColorMode(icon) {
    const mapping = this.state.iconManager.getIconMapping(icon);
    return mapping.mask ? 1 : 0;
  }
  getInstanceIconFrame(icon) {
    const { x, y, width, height } = this.state.iconManager.getIconMapping(icon);
    return [x, y, width, height];
  }
};
IconLayer.defaultProps = defaultProps3;
IconLayer.layerName = "IconLayer";
var icon_layer_default = IconLayer;

// dist/line-layer/line-layer.js
var import_core7 = require("@deck.gl/core");
var import_engine4 = require("@luma.gl/engine");
var import_engine5 = require("@luma.gl/engine");

// dist/line-layer/line-layer-uniforms.js
var uniformBlock4 = `uniform lineUniforms {
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  float useShortestPath;
  highp int widthUnits;
} line;
`;
var lineUniforms = {
  name: "line",
  vs: uniformBlock4,
  fs: uniformBlock4,
  uniformTypes: {
    widthScale: "f32",
    widthMinPixels: "f32",
    widthMaxPixels: "f32",
    useShortestPath: "f32",
    widthUnits: "i32"
  }
};

// dist/line-layer/line-layer-vertex.glsl.js
var line_layer_vertex_glsl_default = `#version 300 es
#define SHADER_NAME line-layer-vertex-shader
in vec3 positions;
in vec3 instanceSourcePositions;
in vec3 instanceTargetPositions;
in vec3 instanceSourcePositions64Low;
in vec3 instanceTargetPositions64Low;
in vec4 instanceColors;
in vec3 instancePickingColors;
in float instanceWidths;
out vec4 vColor;
out vec2 uv;
vec2 getExtrusionOffset(vec2 line_clipspace, float offset_direction, float width) {
vec2 dir_screenspace = normalize(line_clipspace * project.viewportSize);
dir_screenspace = vec2(-dir_screenspace.y, dir_screenspace.x);
return dir_screenspace * offset_direction * width / 2.0;
}
vec3 splitLine(vec3 a, vec3 b, float x) {
float t = (x - a.x) / (b.x - a.x);
return vec3(x, mix(a.yz, b.yz, t));
}
void main(void) {
geometry.worldPosition = instanceSourcePositions;
geometry.worldPositionAlt = instanceTargetPositions;
vec3 source_world = instanceSourcePositions;
vec3 target_world = instanceTargetPositions;
vec3 source_world_64low = instanceSourcePositions64Low;
vec3 target_world_64low = instanceTargetPositions64Low;
if (line.useShortestPath > 0.5 || line.useShortestPath < -0.5) {
source_world.x = mod(source_world.x + 180., 360.0) - 180.;
target_world.x = mod(target_world.x + 180., 360.0) - 180.;
float deltaLng = target_world.x - source_world.x;
if (deltaLng * line.useShortestPath > 180.) {
source_world.x += 360. * line.useShortestPath;
source_world = splitLine(source_world, target_world, 180. * line.useShortestPath);
source_world_64low = vec3(0.0);
} else if (deltaLng * line.useShortestPath < -180.) {
target_world.x += 360. * line.useShortestPath;
target_world = splitLine(source_world, target_world, 180. * line.useShortestPath);
target_world_64low = vec3(0.0);
} else if (line.useShortestPath < 0.) {
gl_Position = vec4(0.);
return;
}
}
vec4 source_commonspace;
vec4 target_commonspace;
vec4 source = project_position_to_clipspace(source_world, source_world_64low, vec3(0.), source_commonspace);
vec4 target = project_position_to_clipspace(target_world, target_world_64low, vec3(0.), target_commonspace);
float segmentIndex = positions.x;
vec4 p = mix(source, target, segmentIndex);
geometry.position = mix(source_commonspace, target_commonspace, segmentIndex);
uv = positions.xy;
geometry.uv = uv;
geometry.pickingColor = instancePickingColors;
float widthPixels = clamp(
project_size_to_pixel(instanceWidths * line.widthScale, line.widthUnits),
line.widthMinPixels, line.widthMaxPixels
);
vec3 offset = vec3(
getExtrusionOffset(target.xy - source.xy, positions.y, widthPixels),
0.0);
DECKGL_FILTER_SIZE(offset, geometry);
DECKGL_FILTER_GL_POSITION(p, geometry);
gl_Position = p + vec4(project_pixel_size_to_clipspace(offset.xy), 0.0, 0.0);
vColor = vec4(instanceColors.rgb, instanceColors.a * layer.opacity);
DECKGL_FILTER_COLOR(vColor, geometry);
}
`;

// dist/line-layer/line-layer-fragment.glsl.js
var line_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME line-layer-fragment-shader
precision highp float;
in vec4 vColor;
in vec2 uv;
out vec4 fragColor;
void main(void) {
geometry.uv = uv;
fragColor = vColor;
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// dist/line-layer/line-layer.js
var DEFAULT_COLOR3 = [0, 0, 0, 255];
var defaultProps4 = {
  getSourcePosition: { type: "accessor", value: (x) => x.sourcePosition },
  getTargetPosition: { type: "accessor", value: (x) => x.targetPosition },
  getColor: { type: "accessor", value: DEFAULT_COLOR3 },
  getWidth: { type: "accessor", value: 1 },
  widthUnits: "pixels",
  widthScale: { type: "number", value: 1, min: 0 },
  widthMinPixels: { type: "number", value: 0, min: 0 },
  widthMaxPixels: { type: "number", value: Number.MAX_SAFE_INTEGER, min: 0 }
};
var LineLayer = class extends import_core7.Layer {
  getBounds() {
    var _a;
    return (_a = this.getAttributeManager()) == null ? void 0 : _a.getBounds([
      "instanceSourcePositions",
      "instanceTargetPositions"
    ]);
  }
  getShaders() {
    return super.getShaders({ vs: line_layer_vertex_glsl_default, fs: line_layer_fragment_glsl_default, modules: [import_core7.project32, import_core7.picking, lineUniforms] });
  }
  // This layer has its own wrapLongitude logic
  get wrapLongitude() {
    return false;
  }
  initializeState() {
    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instanceSourcePositions: {
        size: 3,
        type: "float64",
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: "getSourcePosition"
      },
      instanceTargetPositions: {
        size: 3,
        type: "float64",
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: "getTargetPosition"
      },
      instanceColors: {
        size: this.props.colorFormat.length,
        type: "unorm8",
        transition: true,
        accessor: "getColor",
        defaultValue: [0, 0, 0, 255]
      },
      instanceWidths: {
        size: 1,
        transition: true,
        accessor: "getWidth",
        defaultValue: 1
      }
    });
  }
  updateState(params) {
    var _a;
    super.updateState(params);
    if (params.changeFlags.extensionsChanged) {
      (_a = this.state.model) == null ? void 0 : _a.destroy();
      this.state.model = this._getModel();
      this.getAttributeManager().invalidateAll();
    }
  }
  draw({ uniforms }) {
    const { widthUnits, widthScale, widthMinPixels, widthMaxPixels, wrapLongitude } = this.props;
    const model = this.state.model;
    const lineProps = {
      widthUnits: import_core7.UNIT[widthUnits],
      widthScale,
      widthMinPixels,
      widthMaxPixels,
      useShortestPath: wrapLongitude ? 1 : 0
    };
    model.shaderInputs.setProps({ line: lineProps });
    model.draw(this.context.renderPass);
    if (wrapLongitude) {
      model.shaderInputs.setProps({ line: { ...lineProps, useShortestPath: -1 } });
      model.draw(this.context.renderPass);
    }
  }
  _getModel() {
    const positions = [0, -1, 0, 0, 1, 0, 1, -1, 0, 1, 1, 0];
    return new import_engine5.Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager().getBufferLayouts(),
      geometry: new import_engine4.Geometry({
        topology: "triangle-strip",
        attributes: {
          positions: { size: 3, value: new Float32Array(positions) }
        }
      }),
      isInstanced: true
    });
  }
};
LineLayer.layerName = "LineLayer";
LineLayer.defaultProps = defaultProps4;
var line_layer_default = LineLayer;

// dist/point-cloud-layer/point-cloud-layer.js
var import_core8 = require("@deck.gl/core");
var import_engine6 = require("@luma.gl/engine");
var import_shadertools = require("@luma.gl/shadertools");

// dist/point-cloud-layer/point-cloud-layer-uniforms.js
var uniformBlock5 = `uniform pointCloudUniforms {
  float radiusPixels;
  highp int sizeUnits;
} pointCloud;
`;
var pointCloudUniforms = {
  name: "pointCloud",
  vs: uniformBlock5,
  fs: uniformBlock5,
  uniformTypes: {
    radiusPixels: "f32",
    sizeUnits: "i32"
  }
};

// dist/point-cloud-layer/point-cloud-layer-vertex.glsl.js
var point_cloud_layer_vertex_glsl_default = `#version 300 es
#define SHADER_NAME point-cloud-layer-vertex-shader
in vec3 positions;
in vec3 instanceNormals;
in vec4 instanceColors;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in vec3 instancePickingColors;
out vec4 vColor;
out vec2 unitPosition;
void main(void) {
geometry.worldPosition = instancePositions;
geometry.normal = project_normal(instanceNormals);
unitPosition = positions.xy;
geometry.uv = unitPosition;
geometry.pickingColor = instancePickingColors;
vec3 offset = vec3(positions.xy * project_size_to_pixel(pointCloud.radiusPixels, pointCloud.sizeUnits), 0.0);
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.), geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
vec3 lightColor = lighting_getLightColor(instanceColors.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);
vColor = vec4(lightColor, instanceColors.a * layer.opacity);
DECKGL_FILTER_COLOR(vColor, geometry);
}
`;

// dist/point-cloud-layer/point-cloud-layer-fragment.glsl.js
var point_cloud_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME point-cloud-layer-fragment-shader
precision highp float;
in vec4 vColor;
in vec2 unitPosition;
out vec4 fragColor;
void main(void) {
geometry.uv = unitPosition.xy;
float distToCenter = length(unitPosition);
if (distToCenter > 1.0) {
discard;
}
fragColor = vColor;
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// dist/point-cloud-layer/point-cloud-layer.js
var DEFAULT_COLOR4 = [0, 0, 0, 255];
var DEFAULT_NORMAL = [0, 0, 1];
var defaultProps5 = {
  sizeUnits: "pixels",
  pointSize: { type: "number", min: 0, value: 10 },
  //  point radius in pixels
  getPosition: { type: "accessor", value: (x) => x.position },
  getNormal: { type: "accessor", value: DEFAULT_NORMAL },
  getColor: { type: "accessor", value: DEFAULT_COLOR4 },
  material: true,
  // Depreated
  radiusPixels: { deprecatedFor: "pointSize" }
};
function normalizeData(data) {
  const { header, attributes } = data;
  if (!header || !attributes) {
    return;
  }
  data.length = header.vertexCount;
  if (attributes.POSITION) {
    attributes.instancePositions = attributes.POSITION;
  }
  if (attributes.NORMAL) {
    attributes.instanceNormals = attributes.NORMAL;
  }
  if (attributes.COLOR_0) {
    const { size, value } = attributes.COLOR_0;
    attributes.instanceColors = { size, type: "unorm8", value };
  }
}
var PointCloudLayer = class extends import_core8.Layer {
  getShaders() {
    return super.getShaders({
      vs: point_cloud_layer_vertex_glsl_default,
      fs: point_cloud_layer_fragment_glsl_default,
      modules: [import_core8.project32, import_shadertools.gouraudMaterial, import_core8.picking, pointCloudUniforms]
    });
  }
  initializeState() {
    this.getAttributeManager().addInstanced({
      instancePositions: {
        size: 3,
        type: "float64",
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: "getPosition"
      },
      instanceNormals: {
        size: 3,
        transition: true,
        accessor: "getNormal",
        defaultValue: DEFAULT_NORMAL
      },
      instanceColors: {
        size: this.props.colorFormat.length,
        type: "unorm8",
        transition: true,
        accessor: "getColor",
        defaultValue: DEFAULT_COLOR4
      }
    });
  }
  updateState(params) {
    var _a;
    const { changeFlags, props } = params;
    super.updateState(params);
    if (changeFlags.extensionsChanged) {
      (_a = this.state.model) == null ? void 0 : _a.destroy();
      this.state.model = this._getModel();
      this.getAttributeManager().invalidateAll();
    }
    if (changeFlags.dataChanged) {
      normalizeData(props.data);
    }
  }
  draw({ uniforms }) {
    const { pointSize, sizeUnits } = this.props;
    const model = this.state.model;
    const pointCloudProps = {
      sizeUnits: import_core8.UNIT[sizeUnits],
      radiusPixels: pointSize
    };
    model.shaderInputs.setProps({ pointCloud: pointCloudProps });
    model.draw(this.context.renderPass);
  }
  _getModel() {
    const positions = [];
    for (let i = 0; i < 3; i++) {
      const angle = i / 3 * Math.PI * 2;
      positions.push(Math.cos(angle) * 2, Math.sin(angle) * 2, 0);
    }
    return new import_engine6.Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager().getBufferLayouts(),
      geometry: new import_engine6.Geometry({
        topology: "triangle-list",
        attributes: {
          positions: new Float32Array(positions)
        }
      }),
      isInstanced: true
    });
  }
};
PointCloudLayer.layerName = "PointCloudLayer";
PointCloudLayer.defaultProps = defaultProps5;
var point_cloud_layer_default = PointCloudLayer;

// dist/scatterplot-layer/scatterplot-layer.js
var import_core9 = require("@deck.gl/core");
var import_engine7 = require("@luma.gl/engine");
var import_engine8 = require("@luma.gl/engine");

// dist/scatterplot-layer/scatterplot-layer-uniforms.js
var uniformBlock6 = `uniform scatterplotUniforms {
  float radiusScale;
  float radiusMinPixels;
  float radiusMaxPixels;
  float lineWidthScale;
  float lineWidthMinPixels;
  float lineWidthMaxPixels;
  float stroked;
  bool filled;
  bool antialiasing;
  bool billboard;
  highp int radiusUnits;
  highp int lineWidthUnits;
} scatterplot;
`;
var scatterplotUniforms = {
  name: "scatterplot",
  vs: uniformBlock6,
  fs: uniformBlock6,
  uniformTypes: {
    radiusScale: "f32",
    radiusMinPixels: "f32",
    radiusMaxPixels: "f32",
    lineWidthScale: "f32",
    lineWidthMinPixels: "f32",
    lineWidthMaxPixels: "f32",
    stroked: "f32",
    filled: "f32",
    antialiasing: "f32",
    billboard: "f32",
    radiusUnits: "i32",
    lineWidthUnits: "i32"
  }
};

// dist/scatterplot-layer/scatterplot-layer-vertex.glsl.js
var scatterplot_layer_vertex_glsl_default = `#version 300 es
#define SHADER_NAME scatterplot-layer-vertex-shader
in vec3 positions;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in float instanceRadius;
in float instanceLineWidths;
in vec4 instanceFillColors;
in vec4 instanceLineColors;
in vec3 instancePickingColors;
out vec4 vFillColor;
out vec4 vLineColor;
out vec2 unitPosition;
out float innerUnitRadius;
out float outerRadiusPixels;
void main(void) {
geometry.worldPosition = instancePositions;
outerRadiusPixels = clamp(
project_size_to_pixel(scatterplot.radiusScale * instanceRadius, scatterplot.radiusUnits),
scatterplot.radiusMinPixels, scatterplot.radiusMaxPixels
);
float lineWidthPixels = clamp(
project_size_to_pixel(scatterplot.lineWidthScale * instanceLineWidths, scatterplot.lineWidthUnits),
scatterplot.lineWidthMinPixels, scatterplot.lineWidthMaxPixels
);
outerRadiusPixels += scatterplot.stroked * lineWidthPixels / 2.0;
float edgePadding = scatterplot.antialiasing ? (outerRadiusPixels + SMOOTH_EDGE_RADIUS) / outerRadiusPixels : 1.0;
unitPosition = edgePadding * positions.xy;
geometry.uv = unitPosition;
geometry.pickingColor = instancePickingColors;
innerUnitRadius = 1.0 - scatterplot.stroked * lineWidthPixels / outerRadiusPixels;
if (scatterplot.billboard) {
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
vec3 offset = edgePadding * positions * outerRadiusPixels;
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
} else {
vec3 offset = edgePadding * positions * project_pixel_size(outerRadiusPixels);
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset, geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
}
vFillColor = vec4(instanceFillColors.rgb, instanceFillColors.a * layer.opacity);
DECKGL_FILTER_COLOR(vFillColor, geometry);
vLineColor = vec4(instanceLineColors.rgb, instanceLineColors.a * layer.opacity);
DECKGL_FILTER_COLOR(vLineColor, geometry);
}
`;

// dist/scatterplot-layer/scatterplot-layer-fragment.glsl.js
var scatterplot_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME scatterplot-layer-fragment-shader
precision highp float;
in vec4 vFillColor;
in vec4 vLineColor;
in vec2 unitPosition;
in float innerUnitRadius;
in float outerRadiusPixels;
out vec4 fragColor;
void main(void) {
geometry.uv = unitPosition;
float distToCenter = length(unitPosition) * outerRadiusPixels;
float inCircle = scatterplot.antialiasing ?
smoothedge(distToCenter, outerRadiusPixels) :
step(distToCenter, outerRadiusPixels);
if (inCircle == 0.0) {
discard;
}
if (scatterplot.stroked > 0.5) {
float isLine = scatterplot.antialiasing ?
smoothedge(innerUnitRadius * outerRadiusPixels, distToCenter) :
step(innerUnitRadius * outerRadiusPixels, distToCenter);
if (scatterplot.filled) {
fragColor = mix(vFillColor, vLineColor, isLine);
} else {
if (isLine == 0.0) {
discard;
}
fragColor = vec4(vLineColor.rgb, vLineColor.a * isLine);
}
} else if (scatterplot.filled == false) {
discard;
} else {
fragColor = vFillColor;
}
fragColor.a *= inCircle;
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// dist/scatterplot-layer/scatterplot-layer.js
var DEFAULT_COLOR5 = [0, 0, 0, 255];
var defaultProps6 = {
  radiusUnits: "meters",
  radiusScale: { type: "number", min: 0, value: 1 },
  radiusMinPixels: { type: "number", min: 0, value: 0 },
  //  min point radius in pixels
  radiusMaxPixels: { type: "number", min: 0, value: Number.MAX_SAFE_INTEGER },
  // max point radius in pixels
  lineWidthUnits: "meters",
  lineWidthScale: { type: "number", min: 0, value: 1 },
  lineWidthMinPixels: { type: "number", min: 0, value: 0 },
  lineWidthMaxPixels: { type: "number", min: 0, value: Number.MAX_SAFE_INTEGER },
  stroked: false,
  filled: true,
  billboard: false,
  antialiasing: true,
  getPosition: { type: "accessor", value: (x) => x.position },
  getRadius: { type: "accessor", value: 1 },
  getFillColor: { type: "accessor", value: DEFAULT_COLOR5 },
  getLineColor: { type: "accessor", value: DEFAULT_COLOR5 },
  getLineWidth: { type: "accessor", value: 1 },
  // deprecated
  strokeWidth: { deprecatedFor: "getLineWidth" },
  outline: { deprecatedFor: "stroked" },
  getColor: { deprecatedFor: ["getFillColor", "getLineColor"] }
};
var ScatterplotLayer = class extends import_core9.Layer {
  getShaders() {
    return super.getShaders({
      vs: scatterplot_layer_vertex_glsl_default,
      fs: scatterplot_layer_fragment_glsl_default,
      modules: [import_core9.project32, import_core9.picking, scatterplotUniforms]
    });
  }
  initializeState() {
    this.getAttributeManager().addInstanced({
      instancePositions: {
        size: 3,
        type: "float64",
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: "getPosition"
      },
      instanceRadius: {
        size: 1,
        transition: true,
        accessor: "getRadius",
        defaultValue: 1
      },
      instanceFillColors: {
        size: this.props.colorFormat.length,
        transition: true,
        type: "unorm8",
        accessor: "getFillColor",
        defaultValue: [0, 0, 0, 255]
      },
      instanceLineColors: {
        size: this.props.colorFormat.length,
        transition: true,
        type: "unorm8",
        accessor: "getLineColor",
        defaultValue: [0, 0, 0, 255]
      },
      instanceLineWidths: {
        size: 1,
        transition: true,
        accessor: "getLineWidth",
        defaultValue: 1
      }
    });
  }
  updateState(params) {
    var _a;
    super.updateState(params);
    if (params.changeFlags.extensionsChanged) {
      (_a = this.state.model) == null ? void 0 : _a.destroy();
      this.state.model = this._getModel();
      this.getAttributeManager().invalidateAll();
    }
  }
  draw({ uniforms }) {
    const { radiusUnits, radiusScale, radiusMinPixels, radiusMaxPixels, stroked, filled, billboard, antialiasing, lineWidthUnits, lineWidthScale, lineWidthMinPixels, lineWidthMaxPixels } = this.props;
    const scatterplotProps = {
      stroked,
      filled,
      billboard,
      antialiasing,
      radiusUnits: import_core9.UNIT[radiusUnits],
      radiusScale,
      radiusMinPixels,
      radiusMaxPixels,
      lineWidthUnits: import_core9.UNIT[lineWidthUnits],
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels
    };
    const model = this.state.model;
    model.shaderInputs.setProps({ scatterplot: scatterplotProps });
    model.draw(this.context.renderPass);
  }
  _getModel() {
    const positions = [-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0];
    return new import_engine8.Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager().getBufferLayouts(),
      geometry: new import_engine7.Geometry({
        topology: "triangle-strip",
        attributes: {
          positions: { size: 3, value: new Float32Array(positions) }
        }
      }),
      isInstanced: true
    });
  }
};
ScatterplotLayer.defaultProps = defaultProps6;
ScatterplotLayer.layerName = "ScatterplotLayer";
var scatterplot_layer_default = ScatterplotLayer;

// dist/column-layer/column-layer.js
var import_core11 = require("@deck.gl/core");
var import_shadertools2 = require("@luma.gl/shadertools");
var import_engine10 = require("@luma.gl/engine");

// dist/column-layer/column-geometry.js
var import_core10 = require("@deck.gl/core");
var import_engine9 = require("@luma.gl/engine");
var import_polygon = require("@math.gl/polygon");
var ColumnGeometry = class extends import_engine9.Geometry {
  constructor(props) {
    const { indices, attributes } = tesselateColumn(props);
    super({
      ...props,
      indices,
      // @ts-expect-error
      attributes
    });
  }
};
function tesselateColumn(props) {
  const { radius, height = 1, nradial = 10 } = props;
  let { vertices } = props;
  if (vertices) {
    import_core10.log.assert(vertices.length >= nradial);
    vertices = vertices.flatMap((v) => [v[0], v[1]]);
    (0, import_polygon.modifyPolygonWindingDirection)(vertices, import_polygon.WINDING.COUNTER_CLOCKWISE);
  }
  const isExtruded = height > 0;
  const vertsAroundEdge = nradial + 1;
  const numVertices = isExtruded ? vertsAroundEdge * 3 + 1 : nradial;
  const stepAngle = Math.PI * 2 / nradial;
  const indices = new Uint16Array(isExtruded ? nradial * 3 * 2 : 0);
  const positions = new Float32Array(numVertices * 3);
  const normals = new Float32Array(numVertices * 3);
  let i = 0;
  if (isExtruded) {
    for (let j = 0; j < vertsAroundEdge; j++) {
      const a = j * stepAngle;
      const vertexIndex = j % nradial;
      const sin = Math.sin(a);
      const cos = Math.cos(a);
      for (let k = 0; k < 2; k++) {
        positions[i + 0] = vertices ? vertices[vertexIndex * 2] : cos * radius;
        positions[i + 1] = vertices ? vertices[vertexIndex * 2 + 1] : sin * radius;
        positions[i + 2] = (1 / 2 - k) * height;
        normals[i + 0] = vertices ? vertices[vertexIndex * 2] : cos;
        normals[i + 1] = vertices ? vertices[vertexIndex * 2 + 1] : sin;
        i += 3;
      }
    }
    positions[i + 0] = positions[i - 3];
    positions[i + 1] = positions[i - 2];
    positions[i + 2] = positions[i - 1];
    i += 3;
  }
  for (let j = isExtruded ? 0 : 1; j < vertsAroundEdge; j++) {
    const v = Math.floor(j / 2) * Math.sign(0.5 - j % 2);
    const a = v * stepAngle;
    const vertexIndex = (v + nradial) % nradial;
    const sin = Math.sin(a);
    const cos = Math.cos(a);
    positions[i + 0] = vertices ? vertices[vertexIndex * 2] : cos * radius;
    positions[i + 1] = vertices ? vertices[vertexIndex * 2 + 1] : sin * radius;
    positions[i + 2] = height / 2;
    normals[i + 2] = 1;
    i += 3;
  }
  if (isExtruded) {
    let index = 0;
    for (let j = 0; j < nradial; j++) {
      indices[index++] = j * 2 + 0;
      indices[index++] = j * 2 + 2;
      indices[index++] = j * 2 + 0;
      indices[index++] = j * 2 + 1;
      indices[index++] = j * 2 + 1;
      indices[index++] = j * 2 + 3;
    }
  }
  return {
    indices,
    attributes: {
      POSITION: { size: 3, value: positions },
      NORMAL: { size: 3, value: normals }
    }
  };
}

// dist/column-layer/column-layer-uniforms.js
var uniformBlock7 = `uniform columnUniforms {
  float radius;
  float angle;
  vec2 offset;
  bool extruded;
  bool stroked;
  bool isStroke;
  float coverage;
  float elevationScale;
  float edgeDistance;
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  highp int radiusUnits;
  highp int widthUnits;
} column;
`;
var columnUniforms = {
  name: "column",
  vs: uniformBlock7,
  fs: uniformBlock7,
  uniformTypes: {
    radius: "f32",
    angle: "f32",
    offset: "vec2<f32>",
    extruded: "f32",
    stroked: "f32",
    isStroke: "f32",
    coverage: "f32",
    elevationScale: "f32",
    edgeDistance: "f32",
    widthScale: "f32",
    widthMinPixels: "f32",
    widthMaxPixels: "f32",
    radiusUnits: "i32",
    widthUnits: "i32"
  }
};

// dist/column-layer/column-layer-vertex.glsl.js
var column_layer_vertex_glsl_default = `#version 300 es
#define SHADER_NAME column-layer-vertex-shader
in vec3 positions;
in vec3 normals;
in vec3 instancePositions;
in float instanceElevations;
in vec3 instancePositions64Low;
in vec4 instanceFillColors;
in vec4 instanceLineColors;
in float instanceStrokeWidths;
in vec3 instancePickingColors;
out vec4 vColor;
#ifdef FLAT_SHADING
out vec3 cameraPosition;
out vec4 position_commonspace;
#endif
void main(void) {
geometry.worldPosition = instancePositions;
vec4 color = column.isStroke ? instanceLineColors : instanceFillColors;
mat2 rotationMatrix = mat2(cos(column.angle), sin(column.angle), -sin(column.angle), cos(column.angle));
float elevation = 0.0;
float strokeOffsetRatio = 1.0;
if (column.extruded) {
elevation = instanceElevations * (positions.z + 1.0) / 2.0 * column.elevationScale;
} else if (column.stroked) {
float widthPixels = clamp(
project_size_to_pixel(instanceStrokeWidths * column.widthScale, column.widthUnits),
column.widthMinPixels, column.widthMaxPixels) / 2.0;
float halfOffset = project_pixel_size(widthPixels) / project_size(column.edgeDistance * column.coverage * column.radius);
if (column.isStroke) {
strokeOffsetRatio -= sign(positions.z) * halfOffset;
} else {
strokeOffsetRatio -= halfOffset;
}
}
float shouldRender = float(color.a > 0.0 && instanceElevations >= 0.0);
float dotRadius = column.radius * column.coverage * shouldRender;
geometry.pickingColor = instancePickingColors;
vec3 centroidPosition = vec3(instancePositions.xy, instancePositions.z + elevation);
vec3 centroidPosition64Low = instancePositions64Low;
vec2 offset = (rotationMatrix * positions.xy * strokeOffsetRatio + column.offset) * dotRadius;
if (column.radiusUnits == UNIT_METERS) {
offset = project_size(offset);
}
vec3 pos = vec3(offset, 0.);
DECKGL_FILTER_SIZE(pos, geometry);
gl_Position = project_position_to_clipspace(centroidPosition, centroidPosition64Low, pos, geometry.position);
geometry.normal = project_normal(vec3(rotationMatrix * normals.xy, normals.z));
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
if (column.extruded && !column.isStroke) {
#ifdef FLAT_SHADING
cameraPosition = project.cameraPosition;
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

// dist/column-layer/column-layer-fragment.glsl.js
var column_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME column-layer-fragment-shader
precision highp float;
out vec4 fragColor;
in vec4 vColor;
#ifdef FLAT_SHADING
in vec3 cameraPosition;
in vec4 position_commonspace;
#endif
void main(void) {
fragColor = vColor;
geometry.uv = vec2(0.);
#ifdef FLAT_SHADING
if (column.extruded && !column.isStroke && !bool(picking.isActive)) {
vec3 normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
fragColor.rgb = lighting_getLightColor(vColor.rgb, cameraPosition, position_commonspace.xyz, normal);
}
#endif
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// dist/column-layer/column-layer.js
var DEFAULT_COLOR6 = [0, 0, 0, 255];
var defaultProps7 = {
  diskResolution: { type: "number", min: 4, value: 20 },
  vertices: null,
  radius: { type: "number", min: 0, value: 1e3 },
  angle: { type: "number", value: 0 },
  offset: { type: "array", value: [0, 0] },
  coverage: { type: "number", min: 0, max: 1, value: 1 },
  elevationScale: { type: "number", min: 0, value: 1 },
  radiusUnits: "meters",
  lineWidthUnits: "meters",
  lineWidthScale: 1,
  lineWidthMinPixels: 0,
  lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
  extruded: true,
  wireframe: false,
  filled: true,
  stroked: false,
  flatShading: false,
  getPosition: { type: "accessor", value: (x) => x.position },
  getFillColor: { type: "accessor", value: DEFAULT_COLOR6 },
  getLineColor: { type: "accessor", value: DEFAULT_COLOR6 },
  getLineWidth: { type: "accessor", value: 1 },
  getElevation: { type: "accessor", value: 1e3 },
  material: true,
  getColor: { deprecatedFor: ["getFillColor", "getLineColor"] }
};
var ColumnLayer = class extends import_core11.Layer {
  getShaders() {
    const defines = {};
    const { flatShading } = this.props;
    if (flatShading) {
      defines.FLAT_SHADING = 1;
    }
    return super.getShaders({
      vs: column_layer_vertex_glsl_default,
      fs: column_layer_fragment_glsl_default,
      defines,
      modules: [import_core11.project32, flatShading ? import_shadertools2.phongMaterial : import_shadertools2.gouraudMaterial, import_core11.picking, columnUniforms]
    });
  }
  /**
   * DeckGL calls initializeState when GL context is available
   * Essentially a deferred constructor
   */
  initializeState() {
    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instancePositions: {
        size: 3,
        type: "float64",
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: "getPosition"
      },
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
        defaultValue: DEFAULT_COLOR6
      },
      instanceLineColors: {
        size: this.props.colorFormat.length,
        type: "unorm8",
        transition: true,
        accessor: "getLineColor",
        defaultValue: DEFAULT_COLOR6
      },
      instanceStrokeWidths: {
        size: 1,
        accessor: "getLineWidth",
        transition: true
      }
    });
  }
  updateState(params) {
    var _a;
    super.updateState(params);
    const { props, oldProps, changeFlags } = params;
    const regenerateModels = changeFlags.extensionsChanged || props.flatShading !== oldProps.flatShading;
    if (regenerateModels) {
      (_a = this.state.models) == null ? void 0 : _a.forEach((model) => model.destroy());
      this.setState(this._getModels());
      this.getAttributeManager().invalidateAll();
    }
    const instanceCount = this.getNumInstances();
    this.state.fillModel.setInstanceCount(instanceCount);
    this.state.wireframeModel.setInstanceCount(instanceCount);
    if (regenerateModels || props.diskResolution !== oldProps.diskResolution || props.vertices !== oldProps.vertices || (props.extruded || props.stroked) !== (oldProps.extruded || oldProps.stroked)) {
      this._updateGeometry(props);
    }
  }
  getGeometry(diskResolution, vertices, hasThinkness) {
    const geometry = new ColumnGeometry({
      radius: 1,
      height: hasThinkness ? 2 : 0,
      vertices,
      nradial: diskResolution
    });
    let meanVertexDistance = 0;
    if (vertices) {
      for (let i = 0; i < diskResolution; i++) {
        const p = vertices[i];
        const d = Math.sqrt(p[0] * p[0] + p[1] * p[1]);
        meanVertexDistance += d / diskResolution;
      }
    } else {
      meanVertexDistance = 1;
    }
    this.setState({
      edgeDistance: Math.cos(Math.PI / diskResolution) * meanVertexDistance
    });
    return geometry;
  }
  _getModels() {
    const shaders = this.getShaders();
    const bufferLayout = this.getAttributeManager().getBufferLayouts();
    const fillModel = new import_engine10.Model(this.context.device, {
      ...shaders,
      id: `${this.props.id}-fill`,
      bufferLayout,
      isInstanced: true
    });
    const wireframeModel = new import_engine10.Model(this.context.device, {
      ...shaders,
      id: `${this.props.id}-wireframe`,
      bufferLayout,
      isInstanced: true
    });
    return {
      fillModel,
      wireframeModel,
      models: [wireframeModel, fillModel]
    };
  }
  _updateGeometry({ diskResolution, vertices, extruded, stroked }) {
    const geometry = this.getGeometry(diskResolution, vertices, extruded || stroked);
    this.setState({
      fillVertexCount: geometry.attributes.POSITION.value.length / 3
    });
    const fillModel = this.state.fillModel;
    const wireframeModel = this.state.wireframeModel;
    fillModel.setGeometry(geometry);
    fillModel.setTopology("triangle-strip");
    fillModel.setIndexBuffer(null);
    wireframeModel.setGeometry(geometry);
    wireframeModel.setTopology("line-list");
  }
  draw({ uniforms }) {
    const { lineWidthUnits, lineWidthScale, lineWidthMinPixels, lineWidthMaxPixels, radiusUnits, elevationScale, extruded, filled, stroked, wireframe, offset, coverage, radius, angle } = this.props;
    const fillModel = this.state.fillModel;
    const wireframeModel = this.state.wireframeModel;
    const { fillVertexCount, edgeDistance } = this.state;
    const columnProps = {
      radius,
      angle: angle / 180 * Math.PI,
      offset,
      extruded,
      stroked,
      coverage,
      elevationScale,
      edgeDistance,
      radiusUnits: import_core11.UNIT[radiusUnits],
      widthUnits: import_core11.UNIT[lineWidthUnits],
      widthScale: lineWidthScale,
      widthMinPixels: lineWidthMinPixels,
      widthMaxPixels: lineWidthMaxPixels
    };
    if (extruded && wireframe) {
      wireframeModel.shaderInputs.setProps({
        column: {
          ...columnProps,
          isStroke: true
        }
      });
      wireframeModel.draw(this.context.renderPass);
    }
    if (filled) {
      fillModel.setVertexCount(fillVertexCount);
      fillModel.shaderInputs.setProps({
        column: {
          ...columnProps,
          isStroke: false
        }
      });
      fillModel.draw(this.context.renderPass);
    }
    if (!extruded && stroked) {
      fillModel.setVertexCount(fillVertexCount * 2 / 3);
      fillModel.shaderInputs.setProps({
        column: {
          ...columnProps,
          isStroke: true
        }
      });
      fillModel.draw(this.context.renderPass);
    }
  }
};
ColumnLayer.layerName = "ColumnLayer";
ColumnLayer.defaultProps = defaultProps7;
var column_layer_default = ColumnLayer;

// dist/column-layer/grid-cell-layer.js
var import_core12 = require("@deck.gl/core");
var import_engine11 = require("@luma.gl/engine");
var defaultProps8 = {
  cellSize: { type: "number", min: 0, value: 1e3 },
  offset: { type: "array", value: [1, 1] }
};
var GridCellLayer = class extends column_layer_default {
  _updateGeometry() {
    const geometry = new import_engine11.CubeGeometry();
    this.state.fillModel.setGeometry(geometry);
  }
  draw({ uniforms }) {
    const { elevationScale, extruded, offset, coverage, cellSize, angle, radiusUnits } = this.props;
    const fillModel = this.state.fillModel;
    const columnProps = {
      radius: cellSize / 2,
      radiusUnits: import_core12.UNIT[radiusUnits],
      angle,
      offset,
      extruded,
      stroked: false,
      coverage,
      elevationScale,
      edgeDistance: 1,
      isStroke: false,
      widthUnits: 0,
      widthScale: 0,
      widthMinPixels: 0,
      widthMaxPixels: 0
    };
    fillModel.shaderInputs.setProps({ column: columnProps });
    fillModel.draw(this.context.renderPass);
  }
};
GridCellLayer.layerName = "GridCellLayer";
GridCellLayer.defaultProps = defaultProps8;
var grid_cell_layer_default = GridCellLayer;

// dist/path-layer/path-layer.js
var import_core14 = require("@deck.gl/core");
var import_engine12 = require("@luma.gl/engine");
var import_engine13 = require("@luma.gl/engine");

// dist/path-layer/path-tesselator.js
var import_core13 = require("@deck.gl/core");

// dist/path-layer/path.js
var import_polygon2 = require("@math.gl/polygon");
function normalizePath(path, size, gridResolution, wrapLongitude) {
  let flatPath;
  if (Array.isArray(path[0])) {
    const length = path.length * size;
    flatPath = new Array(length);
    for (let i = 0; i < path.length; i++) {
      for (let j = 0; j < size; j++) {
        flatPath[i * size + j] = path[i][j] || 0;
      }
    }
  } else {
    flatPath = path;
  }
  if (gridResolution) {
    return (0, import_polygon2.cutPolylineByGrid)(flatPath, { size, gridResolution });
  }
  if (wrapLongitude) {
    return (0, import_polygon2.cutPolylineByMercatorBounds)(flatPath, { size });
  }
  return flatPath;
}

// dist/path-layer/path-tesselator.js
var START_CAP = 1;
var END_CAP = 2;
var INVALID = 4;
var PathTesselator = class extends import_core13.Tesselator {
  constructor(opts) {
    super({
      ...opts,
      attributes: {
        // Padding covers shaderAttributes for last segment in largest case fp64
        // additional vertex + hi & low parts, 3 * 6
        positions: {
          size: 3,
          padding: 18,
          initialize: true,
          type: opts.fp64 ? Float64Array : Float32Array
        },
        segmentTypes: { size: 1, type: Uint8ClampedArray }
      }
    });
  }
  /** Get packed attribute by name */
  get(attributeName) {
    return this.attributes[attributeName];
  }
  /* Implement base Tesselator interface */
  getGeometryFromBuffer(buffer) {
    if (this.normalize) {
      return super.getGeometryFromBuffer(buffer);
    }
    return null;
  }
  /* Implement base Tesselator interface */
  normalizeGeometry(path) {
    if (this.normalize) {
      return normalizePath(path, this.positionSize, this.opts.resolution, this.opts.wrapLongitude);
    }
    return path;
  }
  /* Implement base Tesselator interface */
  getGeometrySize(path) {
    if (isCut(path)) {
      let size = 0;
      for (const subPath of path) {
        size += this.getGeometrySize(subPath);
      }
      return size;
    }
    const numPoints = this.getPathLength(path);
    if (numPoints < 2) {
      return 0;
    }
    if (this.isClosed(path)) {
      return numPoints < 3 ? 0 : numPoints + 2;
    }
    return numPoints;
  }
  /* Implement base Tesselator interface */
  updateGeometryAttributes(path, context) {
    if (context.geometrySize === 0) {
      return;
    }
    if (path && isCut(path)) {
      for (const subPath of path) {
        const geometrySize = this.getGeometrySize(subPath);
        context.geometrySize = geometrySize;
        this.updateGeometryAttributes(subPath, context);
        context.vertexStart += geometrySize;
      }
    } else {
      this._updateSegmentTypes(path, context);
      this._updatePositions(path, context);
    }
  }
  _updateSegmentTypes(path, context) {
    const segmentTypes = this.attributes.segmentTypes;
    const isPathClosed = path ? this.isClosed(path) : false;
    const { vertexStart, geometrySize } = context;
    segmentTypes.fill(0, vertexStart, vertexStart + geometrySize);
    if (isPathClosed) {
      segmentTypes[vertexStart] = INVALID;
      segmentTypes[vertexStart + geometrySize - 2] = INVALID;
    } else {
      segmentTypes[vertexStart] += START_CAP;
      segmentTypes[vertexStart + geometrySize - 2] += END_CAP;
    }
    segmentTypes[vertexStart + geometrySize - 1] = INVALID;
  }
  _updatePositions(path, context) {
    const { positions } = this.attributes;
    if (!positions || !path) {
      return;
    }
    const { vertexStart, geometrySize } = context;
    const p = new Array(3);
    for (let i = vertexStart, ptIndex = 0; ptIndex < geometrySize; i++, ptIndex++) {
      this.getPointOnPath(path, ptIndex, p);
      positions[i * 3] = p[0];
      positions[i * 3 + 1] = p[1];
      positions[i * 3 + 2] = p[2];
    }
  }
  // Utilities
  /** Returns the number of points in the path */
  getPathLength(path) {
    return path.length / this.positionSize;
  }
  /** Returns a point on the path at the specified index */
  getPointOnPath(path, index, target = []) {
    const { positionSize } = this;
    if (index * positionSize >= path.length) {
      index += 1 - path.length / positionSize;
    }
    const i = index * positionSize;
    target[0] = path[i];
    target[1] = path[i + 1];
    target[2] = positionSize === 3 && path[i + 2] || 0;
    return target;
  }
  // Returns true if the first and last points are identical
  isClosed(path) {
    if (!this.normalize) {
      return Boolean(this.opts.loop);
    }
    const { positionSize } = this;
    const lastPointIndex = path.length - positionSize;
    return path[0] === path[lastPointIndex] && path[1] === path[lastPointIndex + 1] && (positionSize === 2 || path[2] === path[lastPointIndex + 2]);
  }
};
function isCut(path) {
  return Array.isArray(path[0]);
}

// dist/path-layer/path-layer-uniforms.js
var uniformBlock8 = `uniform pathUniforms {
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  float jointType;
  float capType;
  float miterLimit;
  bool billboard;
  highp int widthUnits;
} path;
`;
var pathUniforms = {
  name: "path",
  vs: uniformBlock8,
  fs: uniformBlock8,
  uniformTypes: {
    widthScale: "f32",
    widthMinPixels: "f32",
    widthMaxPixels: "f32",
    jointType: "f32",
    capType: "f32",
    miterLimit: "f32",
    billboard: "f32",
    widthUnits: "i32"
  }
};

// dist/path-layer/path-layer-vertex.glsl.js
var path_layer_vertex_glsl_default = `#version 300 es
#define SHADER_NAME path-layer-vertex-shader
in vec2 positions;
in float instanceTypes;
in vec3 instanceStartPositions;
in vec3 instanceEndPositions;
in vec3 instanceLeftPositions;
in vec3 instanceRightPositions;
in vec3 instanceLeftPositions64Low;
in vec3 instanceStartPositions64Low;
in vec3 instanceEndPositions64Low;
in vec3 instanceRightPositions64Low;
in float instanceStrokeWidths;
in vec4 instanceColors;
in vec3 instancePickingColors;
uniform float opacity;
out vec4 vColor;
out vec2 vCornerOffset;
out float vMiterLength;
out vec2 vPathPosition;
out float vPathLength;
out float vJointType;
const float EPSILON = 0.001;
const vec3 ZERO_OFFSET = vec3(0.0);
float flipIfTrue(bool flag) {
return -(float(flag) * 2. - 1.);
}
vec3 getLineJoinOffset(
vec3 prevPoint, vec3 currPoint, vec3 nextPoint,
vec2 width
) {
bool isEnd = positions.x > 0.0;
float sideOfPath = positions.y;
float isJoint = float(sideOfPath == 0.0);
vec3 deltaA3 = (currPoint - prevPoint);
vec3 deltaB3 = (nextPoint - currPoint);
mat3 rotationMatrix;
bool needsRotation = !path.billboard && project_needs_rotation(currPoint, rotationMatrix);
if (needsRotation) {
deltaA3 = deltaA3 * rotationMatrix;
deltaB3 = deltaB3 * rotationMatrix;
}
vec2 deltaA = deltaA3.xy / width;
vec2 deltaB = deltaB3.xy / width;
float lenA = length(deltaA);
float lenB = length(deltaB);
vec2 dirA = lenA > 0. ? normalize(deltaA) : vec2(0.0, 0.0);
vec2 dirB = lenB > 0. ? normalize(deltaB) : vec2(0.0, 0.0);
vec2 perpA = vec2(-dirA.y, dirA.x);
vec2 perpB = vec2(-dirB.y, dirB.x);
vec2 tangent = dirA + dirB;
tangent = length(tangent) > 0. ? normalize(tangent) : perpA;
vec2 miterVec = vec2(-tangent.y, tangent.x);
vec2 dir = isEnd ? dirA : dirB;
vec2 perp = isEnd ? perpA : perpB;
float L = isEnd ? lenA : lenB;
float sinHalfA = abs(dot(miterVec, perp));
float cosHalfA = abs(dot(dirA, miterVec));
float turnDirection = flipIfTrue(dirA.x * dirB.y >= dirA.y * dirB.x);
float cornerPosition = sideOfPath * turnDirection;
float miterSize = 1.0 / max(sinHalfA, EPSILON);
miterSize = mix(
min(miterSize, max(lenA, lenB) / max(cosHalfA, EPSILON)),
miterSize,
step(0.0, cornerPosition)
);
vec2 offsetVec = mix(miterVec * miterSize, perp, step(0.5, cornerPosition))
* (sideOfPath + isJoint * turnDirection);
bool isStartCap = lenA == 0.0 || (!isEnd && (instanceTypes == 1.0 || instanceTypes == 3.0));
bool isEndCap = lenB == 0.0 || (isEnd && (instanceTypes == 2.0 || instanceTypes == 3.0));
bool isCap = isStartCap || isEndCap;
if (isCap) {
offsetVec = mix(perp * sideOfPath, dir * path.capType * 4.0 * flipIfTrue(isStartCap), isJoint);
vJointType = path.capType;
} else {
vJointType = path.jointType;
}
vPathLength = L;
vCornerOffset = offsetVec;
vMiterLength = dot(vCornerOffset, miterVec * turnDirection);
vMiterLength = isCap ? isJoint : vMiterLength;
vec2 offsetFromStartOfPath = vCornerOffset + deltaA * float(isEnd);
vPathPosition = vec2(
dot(offsetFromStartOfPath, perp),
dot(offsetFromStartOfPath, dir)
);
geometry.uv = vPathPosition;
float isValid = step(instanceTypes, 3.5);
vec3 offset = vec3(offsetVec * width * isValid, 0.0);
if (needsRotation) {
offset = rotationMatrix * offset;
}
return offset;
}
void clipLine(inout vec4 position, vec4 refPosition) {
if (position.w < EPSILON) {
float r = (EPSILON - refPosition.w) / (position.w - refPosition.w);
position = refPosition + (position - refPosition) * r;
}
}
void main() {
geometry.pickingColor = instancePickingColors;
vColor = vec4(instanceColors.rgb, instanceColors.a * layer.opacity);
float isEnd = positions.x;
vec3 prevPosition = mix(instanceLeftPositions, instanceStartPositions, isEnd);
vec3 prevPosition64Low = mix(instanceLeftPositions64Low, instanceStartPositions64Low, isEnd);
vec3 currPosition = mix(instanceStartPositions, instanceEndPositions, isEnd);
vec3 currPosition64Low = mix(instanceStartPositions64Low, instanceEndPositions64Low, isEnd);
vec3 nextPosition = mix(instanceEndPositions, instanceRightPositions, isEnd);
vec3 nextPosition64Low = mix(instanceEndPositions64Low, instanceRightPositions64Low, isEnd);
geometry.worldPosition = currPosition;
vec2 widthPixels = vec2(clamp(
project_size_to_pixel(instanceStrokeWidths * path.widthScale, path.widthUnits),
path.widthMinPixels, path.widthMaxPixels) / 2.0);
vec3 width;
if (path.billboard) {
vec4 prevPositionScreen = project_position_to_clipspace(prevPosition, prevPosition64Low, ZERO_OFFSET);
vec4 currPositionScreen = project_position_to_clipspace(currPosition, currPosition64Low, ZERO_OFFSET, geometry.position);
vec4 nextPositionScreen = project_position_to_clipspace(nextPosition, nextPosition64Low, ZERO_OFFSET);
clipLine(prevPositionScreen, currPositionScreen);
clipLine(nextPositionScreen, currPositionScreen);
clipLine(currPositionScreen, mix(nextPositionScreen, prevPositionScreen, isEnd));
width = vec3(widthPixels, 0.0);
DECKGL_FILTER_SIZE(width, geometry);
vec3 offset = getLineJoinOffset(
prevPositionScreen.xyz / prevPositionScreen.w,
currPositionScreen.xyz / currPositionScreen.w,
nextPositionScreen.xyz / nextPositionScreen.w,
project_pixel_size_to_clipspace(width.xy)
);
DECKGL_FILTER_GL_POSITION(currPositionScreen, geometry);
gl_Position = vec4(currPositionScreen.xyz + offset * currPositionScreen.w, currPositionScreen.w);
} else {
prevPosition = project_position(prevPosition, prevPosition64Low);
currPosition = project_position(currPosition, currPosition64Low);
nextPosition = project_position(nextPosition, nextPosition64Low);
width = vec3(project_pixel_size(widthPixels), 0.0);
DECKGL_FILTER_SIZE(width, geometry);
vec3 offset = getLineJoinOffset(prevPosition, currPosition, nextPosition, width.xy);
geometry.position = vec4(currPosition + offset, 1.0);
gl_Position = project_common_position_to_clipspace(geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
}
DECKGL_FILTER_COLOR(vColor, geometry);
}
`;

// dist/path-layer/path-layer-fragment.glsl.js
var path_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME path-layer-fragment-shader
precision highp float;
in vec4 vColor;
in vec2 vCornerOffset;
in float vMiterLength;
in vec2 vPathPosition;
in float vPathLength;
in float vJointType;
out vec4 fragColor;
void main(void) {
geometry.uv = vPathPosition;
if (vPathPosition.y < 0.0 || vPathPosition.y > vPathLength) {
if (vJointType > 0.5 && length(vCornerOffset) > 1.0) {
discard;
}
if (vJointType < 0.5 && vMiterLength > path.miterLimit + 1.0) {
discard;
}
}
fragColor = vColor;
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// dist/path-layer/path-layer.js
var DEFAULT_COLOR7 = [0, 0, 0, 255];
var defaultProps9 = {
  widthUnits: "meters",
  widthScale: { type: "number", min: 0, value: 1 },
  widthMinPixels: { type: "number", min: 0, value: 0 },
  widthMaxPixels: { type: "number", min: 0, value: Number.MAX_SAFE_INTEGER },
  jointRounded: false,
  capRounded: false,
  miterLimit: { type: "number", min: 0, value: 4 },
  billboard: false,
  _pathType: null,
  getPath: { type: "accessor", value: (object) => object.path },
  getColor: { type: "accessor", value: DEFAULT_COLOR7 },
  getWidth: { type: "accessor", value: 1 },
  // deprecated props
  rounded: { deprecatedFor: ["jointRounded", "capRounded"] }
};
var ATTRIBUTE_TRANSITION = {
  enter: (value, chunk) => {
    return chunk.length ? chunk.subarray(chunk.length - value.length) : value;
  }
};
var PathLayer = class extends import_core14.Layer {
  getShaders() {
    return super.getShaders({ vs: path_layer_vertex_glsl_default, fs: path_layer_fragment_glsl_default, modules: [import_core14.project32, import_core14.picking, pathUniforms] });
  }
  get wrapLongitude() {
    return false;
  }
  getBounds() {
    var _a;
    return (_a = this.getAttributeManager()) == null ? void 0 : _a.getBounds(["vertexPositions"]);
  }
  initializeState() {
    const noAlloc = true;
    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      vertexPositions: {
        size: 3,
        // Start filling buffer from 1 vertex in
        vertexOffset: 1,
        type: "float64",
        fp64: this.use64bitPositions(),
        transition: ATTRIBUTE_TRANSITION,
        accessor: "getPath",
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this.calculatePositions,
        noAlloc,
        shaderAttributes: {
          instanceLeftPositions: {
            vertexOffset: 0
          },
          instanceStartPositions: {
            vertexOffset: 1
          },
          instanceEndPositions: {
            vertexOffset: 2
          },
          instanceRightPositions: {
            vertexOffset: 3
          }
        }
      },
      instanceTypes: {
        size: 1,
        type: "uint8",
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this.calculateSegmentTypes,
        noAlloc
      },
      instanceStrokeWidths: {
        size: 1,
        accessor: "getWidth",
        transition: ATTRIBUTE_TRANSITION,
        defaultValue: 1
      },
      instanceColors: {
        size: this.props.colorFormat.length,
        type: "unorm8",
        accessor: "getColor",
        transition: ATTRIBUTE_TRANSITION,
        defaultValue: DEFAULT_COLOR7
      },
      instancePickingColors: {
        size: 4,
        type: "uint8",
        accessor: (object, { index, target: value }) => this.encodePickingColor(object && object.__source ? object.__source.index : index, value)
      }
    });
    this.setState({
      pathTesselator: new PathTesselator({
        fp64: this.use64bitPositions()
      })
    });
  }
  updateState(params) {
    var _a;
    super.updateState(params);
    const { props, changeFlags } = params;
    const attributeManager = this.getAttributeManager();
    const geometryChanged = changeFlags.dataChanged || changeFlags.updateTriggersChanged && (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getPath);
    if (geometryChanged) {
      const { pathTesselator } = this.state;
      const buffers = props.data.attributes || {};
      pathTesselator.updateGeometry({
        data: props.data,
        geometryBuffer: buffers.getPath,
        buffers,
        normalize: !props._pathType,
        loop: props._pathType === "loop",
        getGeometry: props.getPath,
        positionFormat: props.positionFormat,
        wrapLongitude: props.wrapLongitude,
        // TODO - move the flag out of the viewport
        resolution: this.context.viewport.resolution,
        dataChanged: changeFlags.dataChanged
      });
      this.setState({
        numInstances: pathTesselator.instanceCount,
        startIndices: pathTesselator.vertexStarts
      });
      if (!changeFlags.dataChanged) {
        attributeManager.invalidateAll();
      }
    }
    if (changeFlags.extensionsChanged) {
      (_a = this.state.model) == null ? void 0 : _a.destroy();
      this.state.model = this._getModel();
      attributeManager.invalidateAll();
    }
  }
  getPickingInfo(params) {
    const info = super.getPickingInfo(params);
    const { index } = info;
    const data = this.props.data;
    if (data[0] && data[0].__source) {
      info.object = data.find((d) => d.__source.index === index);
    }
    return info;
  }
  /** Override base Layer method */
  disablePickingIndex(objectIndex) {
    const data = this.props.data;
    if (data[0] && data[0].__source) {
      for (let i = 0; i < data.length; i++) {
        if (data[i].__source.index === objectIndex) {
          this._disablePickingIndex(i);
        }
      }
    } else {
      super.disablePickingIndex(objectIndex);
    }
  }
  draw({ uniforms }) {
    const { jointRounded, capRounded, billboard, miterLimit, widthUnits, widthScale, widthMinPixels, widthMaxPixels } = this.props;
    const model = this.state.model;
    const pathProps = {
      jointType: Number(jointRounded),
      capType: Number(capRounded),
      billboard,
      widthUnits: import_core14.UNIT[widthUnits],
      widthScale,
      miterLimit,
      widthMinPixels,
      widthMaxPixels
    };
    model.shaderInputs.setProps({ path: pathProps });
    model.draw(this.context.renderPass);
  }
  _getModel() {
    const SEGMENT_INDICES = [
      // start corner
      0,
      1,
      2,
      // body
      1,
      4,
      2,
      1,
      3,
      4,
      // end corner
      3,
      5,
      4
    ];
    const SEGMENT_POSITIONS = [
      // bevel start corner
      0,
      0,
      // start inner corner
      0,
      -1,
      // start outer corner
      0,
      1,
      // end inner corner
      1,
      -1,
      // end outer corner
      1,
      1,
      // bevel end corner
      1,
      0
    ];
    return new import_engine13.Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager().getBufferLayouts(),
      geometry: new import_engine12.Geometry({
        topology: "triangle-list",
        attributes: {
          indices: new Uint16Array(SEGMENT_INDICES),
          positions: { value: new Float32Array(SEGMENT_POSITIONS), size: 2 }
        }
      }),
      isInstanced: true
    });
  }
  calculatePositions(attribute) {
    const { pathTesselator } = this.state;
    attribute.startIndices = pathTesselator.vertexStarts;
    attribute.value = pathTesselator.get("positions");
  }
  calculateSegmentTypes(attribute) {
    const { pathTesselator } = this.state;
    attribute.startIndices = pathTesselator.vertexStarts;
    attribute.value = pathTesselator.get("segmentTypes");
  }
};
PathLayer.defaultProps = defaultProps9;
PathLayer.layerName = "PathLayer";
var path_layer_default = PathLayer;

// dist/polygon-layer/polygon-layer.js
var import_core17 = require("@deck.gl/core");

// dist/solid-polygon-layer/solid-polygon-layer.js
var import_core16 = require("@deck.gl/core");
var import_engine14 = require("@luma.gl/engine");
var import_shadertools3 = require("@luma.gl/shadertools");

// dist/solid-polygon-layer/polygon.js
var import_earcut = __toESM(require("earcut"), 1);
var import_polygon3 = require("@math.gl/polygon");
var OUTER_POLYGON_WINDING = import_polygon3.WINDING.CLOCKWISE;
var HOLE_POLYGON_WINDING = import_polygon3.WINDING.COUNTER_CLOCKWISE;
var windingOptions = {
  isClosed: true
};
function validate(polygon) {
  polygon = polygon && polygon.positions || polygon;
  if (!Array.isArray(polygon) && !ArrayBuffer.isView(polygon)) {
    throw new Error("invalid polygon");
  }
}
function getPositions(polygon) {
  return "positions" in polygon ? polygon.positions : polygon;
}
function getHoleIndices(polygon) {
  return "holeIndices" in polygon ? polygon.holeIndices : null;
}
function isNested(polygon) {
  return Array.isArray(polygon[0]);
}
function isSimple(polygon) {
  return polygon.length >= 1 && polygon[0].length >= 2 && Number.isFinite(polygon[0][0]);
}
function isNestedRingClosed(simplePolygon) {
  const p0 = simplePolygon[0];
  const p1 = simplePolygon[simplePolygon.length - 1];
  return p0[0] === p1[0] && p0[1] === p1[1] && p0[2] === p1[2];
}
function isFlatRingClosed(positions, size, startIndex, endIndex) {
  for (let i = 0; i < size; i++) {
    if (positions[startIndex + i] !== positions[endIndex - size + i]) {
      return false;
    }
  }
  return true;
}
function copyNestedRing(target, targetStartIndex, simplePolygon, size, windingDirection) {
  let targetIndex = targetStartIndex;
  const len = simplePolygon.length;
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < size; j++) {
      target[targetIndex++] = simplePolygon[i][j] || 0;
    }
  }
  if (!isNestedRingClosed(simplePolygon)) {
    for (let j = 0; j < size; j++) {
      target[targetIndex++] = simplePolygon[0][j] || 0;
    }
  }
  windingOptions.start = targetStartIndex;
  windingOptions.end = targetIndex;
  windingOptions.size = size;
  (0, import_polygon3.modifyPolygonWindingDirection)(target, windingDirection, windingOptions);
  return targetIndex;
}
function copyFlatRing(target, targetStartIndex, positions, size, srcStartIndex = 0, srcEndIndex, windingDirection) {
  srcEndIndex = srcEndIndex || positions.length;
  const srcLength = srcEndIndex - srcStartIndex;
  if (srcLength <= 0) {
    return targetStartIndex;
  }
  let targetIndex = targetStartIndex;
  for (let i = 0; i < srcLength; i++) {
    target[targetIndex++] = positions[srcStartIndex + i];
  }
  if (!isFlatRingClosed(positions, size, srcStartIndex, srcEndIndex)) {
    for (let i = 0; i < size; i++) {
      target[targetIndex++] = positions[srcStartIndex + i];
    }
  }
  windingOptions.start = targetStartIndex;
  windingOptions.end = targetIndex;
  windingOptions.size = size;
  (0, import_polygon3.modifyPolygonWindingDirection)(target, windingDirection, windingOptions);
  return targetIndex;
}
function normalize(polygon, positionSize) {
  validate(polygon);
  const positions = [];
  const holeIndices = [];
  if ("positions" in polygon) {
    const { positions: srcPositions, holeIndices: srcHoleIndices } = polygon;
    if (srcHoleIndices) {
      let targetIndex = 0;
      for (let i = 0; i <= srcHoleIndices.length; i++) {
        targetIndex = copyFlatRing(positions, targetIndex, srcPositions, positionSize, srcHoleIndices[i - 1], srcHoleIndices[i], i === 0 ? OUTER_POLYGON_WINDING : HOLE_POLYGON_WINDING);
        holeIndices.push(targetIndex);
      }
      holeIndices.pop();
      return { positions, holeIndices };
    }
    polygon = srcPositions;
  }
  if (!isNested(polygon)) {
    copyFlatRing(positions, 0, polygon, positionSize, 0, positions.length, OUTER_POLYGON_WINDING);
    return positions;
  }
  if (!isSimple(polygon)) {
    let targetIndex = 0;
    for (const [polygonIndex, simplePolygon] of polygon.entries()) {
      targetIndex = copyNestedRing(positions, targetIndex, simplePolygon, positionSize, polygonIndex === 0 ? OUTER_POLYGON_WINDING : HOLE_POLYGON_WINDING);
      holeIndices.push(targetIndex);
    }
    holeIndices.pop();
    return { positions, holeIndices };
  }
  copyNestedRing(positions, 0, polygon, positionSize, OUTER_POLYGON_WINDING);
  return positions;
}
function getPlaneArea(positions, xIndex, yIndex) {
  const numVerts = positions.length / 3;
  let area = 0;
  for (let i = 0; i < numVerts; i++) {
    const j = (i + 1) % numVerts;
    area += positions[i * 3 + xIndex] * positions[j * 3 + yIndex];
    area -= positions[j * 3 + xIndex] * positions[i * 3 + yIndex];
  }
  return Math.abs(area / 2);
}
function permutePositions(positions, xIndex, yIndex, zIndex) {
  const numVerts = positions.length / 3;
  for (let i = 0; i < numVerts; i++) {
    const o = i * 3;
    const x = positions[o + 0];
    const y = positions[o + 1];
    const z = positions[o + 2];
    positions[o + xIndex] = x;
    positions[o + yIndex] = y;
    positions[o + zIndex] = z;
  }
}
function getSurfaceIndices(polygon, positionSize, preproject, full3d) {
  let holeIndices = getHoleIndices(polygon);
  if (holeIndices) {
    holeIndices = holeIndices.map((positionIndex) => positionIndex / positionSize);
  }
  let positions = getPositions(polygon);
  const is3d = full3d && positionSize === 3;
  if (preproject) {
    const n = positions.length;
    positions = positions.slice();
    const p = [];
    for (let i = 0; i < n; i += positionSize) {
      p[0] = positions[i];
      p[1] = positions[i + 1];
      if (is3d) {
        p[2] = positions[i + 2];
      }
      const xy = preproject(p);
      positions[i] = xy[0];
      positions[i + 1] = xy[1];
      if (is3d) {
        positions[i + 2] = xy[2];
      }
    }
  }
  if (is3d) {
    const xyArea = getPlaneArea(positions, 0, 1);
    const xzArea = getPlaneArea(positions, 0, 2);
    const yzArea = getPlaneArea(positions, 1, 2);
    if (!xyArea && !xzArea && !yzArea) {
      return [];
    }
    if (xyArea > xzArea && xyArea > yzArea) {
    } else if (xzArea > yzArea) {
      if (!preproject) {
        positions = positions.slice();
      }
      permutePositions(positions, 0, 2, 1);
    } else {
      if (!preproject) {
        positions = positions.slice();
      }
      permutePositions(positions, 2, 0, 1);
    }
  }
  return (0, import_earcut.default)(positions, holeIndices, positionSize);
}

// dist/solid-polygon-layer/polygon-tesselator.js
var import_core15 = require("@deck.gl/core");
var import_polygon4 = require("@math.gl/polygon");
var PolygonTesselator = class extends import_core15.Tesselator {
  constructor(opts) {
    const { fp64, IndexType = Uint32Array } = opts;
    super({
      ...opts,
      attributes: {
        positions: { size: 3, type: fp64 ? Float64Array : Float32Array },
        vertexValid: { type: Uint16Array, size: 1 },
        indices: { type: IndexType, size: 1 }
      }
    });
  }
  /** Get attribute by name */
  get(attributeName) {
    const { attributes } = this;
    if (attributeName === "indices") {
      return attributes.indices && attributes.indices.subarray(0, this.vertexCount);
    }
    return attributes[attributeName];
  }
  /** Override base Tesselator method */
  updateGeometry(opts) {
    super.updateGeometry(opts);
    const externalIndices = this.buffers.indices;
    if (externalIndices) {
      this.vertexCount = (externalIndices.value || externalIndices).length;
    } else if (this.data && !this.getGeometry) {
      throw new Error("missing indices buffer");
    }
  }
  /** Implement base Tesselator interface */
  normalizeGeometry(polygon) {
    if (this.normalize) {
      const normalizedPolygon = normalize(polygon, this.positionSize);
      if (this.opts.resolution) {
        return (0, import_polygon4.cutPolygonByGrid)(getPositions(normalizedPolygon), getHoleIndices(normalizedPolygon), {
          size: this.positionSize,
          gridResolution: this.opts.resolution,
          edgeTypes: true
        });
      }
      if (this.opts.wrapLongitude) {
        return (0, import_polygon4.cutPolygonByMercatorBounds)(getPositions(normalizedPolygon), getHoleIndices(normalizedPolygon), {
          size: this.positionSize,
          maxLatitude: 86,
          edgeTypes: true
        });
      }
      return normalizedPolygon;
    }
    return polygon;
  }
  /** Implement base Tesselator interface */
  getGeometrySize(polygon) {
    if (isCut2(polygon)) {
      let size = 0;
      for (const subPolygon of polygon) {
        size += this.getGeometrySize(subPolygon);
      }
      return size;
    }
    return getPositions(polygon).length / this.positionSize;
  }
  /** Override base Tesselator method */
  getGeometryFromBuffer(buffer) {
    if (this.normalize || !this.buffers.indices) {
      return super.getGeometryFromBuffer(buffer);
    }
    return null;
  }
  /** Implement base Tesselator interface */
  updateGeometryAttributes(polygon, context) {
    if (polygon && isCut2(polygon)) {
      for (const subPolygon of polygon) {
        const geometrySize = this.getGeometrySize(subPolygon);
        context.geometrySize = geometrySize;
        this.updateGeometryAttributes(subPolygon, context);
        context.vertexStart += geometrySize;
        context.indexStart = this.indexStarts[context.geometryIndex + 1];
      }
    } else {
      const normalizedPolygon = polygon;
      this._updateIndices(normalizedPolygon, context);
      this._updatePositions(normalizedPolygon, context);
      this._updateVertexValid(normalizedPolygon, context);
    }
  }
  // Flatten the indices array
  _updateIndices(polygon, { geometryIndex, vertexStart: offset, indexStart }) {
    const { attributes, indexStarts, typedArrayManager } = this;
    let target = attributes.indices;
    if (!target || !polygon) {
      return;
    }
    let i = indexStart;
    const indices = getSurfaceIndices(polygon, this.positionSize, this.opts.preproject, this.opts.full3d);
    target = typedArrayManager.allocate(target, indexStart + indices.length, {
      copy: true
    });
    for (let j = 0; j < indices.length; j++) {
      target[i++] = indices[j] + offset;
    }
    indexStarts[geometryIndex + 1] = indexStart + indices.length;
    attributes.indices = target;
  }
  // Flatten out all the vertices of all the sub subPolygons
  _updatePositions(polygon, { vertexStart, geometrySize }) {
    const { attributes: { positions }, positionSize } = this;
    if (!positions || !polygon) {
      return;
    }
    const polygonPositions = getPositions(polygon);
    for (let i = vertexStart, j = 0; j < geometrySize; i++, j++) {
      const x = polygonPositions[j * positionSize];
      const y = polygonPositions[j * positionSize + 1];
      const z = positionSize > 2 ? polygonPositions[j * positionSize + 2] : 0;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
  }
  _updateVertexValid(polygon, { vertexStart, geometrySize }) {
    const { positionSize } = this;
    const vertexValid = this.attributes.vertexValid;
    const holeIndices = polygon && getHoleIndices(polygon);
    if (polygon && polygon.edgeTypes) {
      vertexValid.set(polygon.edgeTypes, vertexStart);
    } else {
      vertexValid.fill(1, vertexStart, vertexStart + geometrySize);
    }
    if (holeIndices) {
      for (let j = 0; j < holeIndices.length; j++) {
        vertexValid[vertexStart + holeIndices[j] / positionSize - 1] = 0;
      }
    }
    vertexValid[vertexStart + geometrySize - 1] = 0;
  }
};
function isCut2(polygon) {
  return Array.isArray(polygon) && polygon.length > 0 && !Number.isFinite(polygon[0]);
}

// dist/solid-polygon-layer/solid-polygon-layer-uniforms.js
var uniformBlock9 = `uniform solidPolygonUniforms {
  bool extruded;
  bool isWireframe;
  float elevationScale;
} solidPolygon;
`;
var solidPolygonUniforms = {
  name: "solidPolygon",
  vs: uniformBlock9,
  fs: uniformBlock9,
  uniformTypes: {
    extruded: "f32",
    isWireframe: "f32",
    elevationScale: "f32"
  }
};

// dist/solid-polygon-layer/solid-polygon-layer-vertex-main.glsl.js
var solid_polygon_layer_vertex_main_glsl_default = `in vec4 fillColors;
in vec4 lineColors;
in vec3 pickingColors;
out vec4 vColor;
struct PolygonProps {
vec3 positions;
vec3 positions64Low;
vec3 normal;
float elevations;
};
vec3 project_offset_normal(vec3 vector) {
if (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT ||
project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT_OFFSETS) {
return normalize(vector * project.commonUnitsPerWorldUnit);
}
return project_normal(vector);
}
void calculatePosition(PolygonProps props) {
vec3 pos = props.positions;
vec3 pos64Low = props.positions64Low;
vec3 normal = props.normal;
vec4 colors = solidPolygon.isWireframe ? lineColors : fillColors;
geometry.worldPosition = props.positions;
geometry.pickingColor = pickingColors;
if (solidPolygon.extruded) {
pos.z += props.elevations * solidPolygon.elevationScale;
}
gl_Position = project_position_to_clipspace(pos, pos64Low, vec3(0.), geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
if (solidPolygon.extruded) {
#ifdef IS_SIDE_VERTEX
normal = project_offset_normal(normal);
#else
normal = project_normal(normal);
#endif
geometry.normal = normal;
vec3 lightColor = lighting_getLightColor(colors.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);
vColor = vec4(lightColor, colors.a * layer.opacity);
} else {
vColor = vec4(colors.rgb, colors.a * layer.opacity);
}
DECKGL_FILTER_COLOR(vColor, geometry);
}
`;

// dist/solid-polygon-layer/solid-polygon-layer-vertex-top.glsl.js
var solid_polygon_layer_vertex_top_glsl_default = `#version 300 es
#define SHADER_NAME solid-polygon-layer-vertex-shader
in vec3 vertexPositions;
in vec3 vertexPositions64Low;
in float elevations;
${solid_polygon_layer_vertex_main_glsl_default}
void main(void) {
PolygonProps props;
props.positions = vertexPositions;
props.positions64Low = vertexPositions64Low;
props.elevations = elevations;
props.normal = vec3(0.0, 0.0, 1.0);
calculatePosition(props);
}
`;

// dist/solid-polygon-layer/solid-polygon-layer-vertex-side.glsl.js
var solid_polygon_layer_vertex_side_glsl_default = `#version 300 es
#define SHADER_NAME solid-polygon-layer-vertex-shader-side
#define IS_SIDE_VERTEX
in vec2 positions;
in vec3 vertexPositions;
in vec3 nextVertexPositions;
in vec3 vertexPositions64Low;
in vec3 nextVertexPositions64Low;
in float elevations;
in float instanceVertexValid;
${solid_polygon_layer_vertex_main_glsl_default}
void main(void) {
if(instanceVertexValid < 0.5){
gl_Position = vec4(0.);
return;
}
PolygonProps props;
vec3 pos;
vec3 pos64Low;
vec3 nextPos;
vec3 nextPos64Low;
#if RING_WINDING_ORDER_CW == 1
pos = vertexPositions;
pos64Low = vertexPositions64Low;
nextPos = nextVertexPositions;
nextPos64Low = nextVertexPositions64Low;
#else
pos = nextVertexPositions;
pos64Low = nextVertexPositions64Low;
nextPos = vertexPositions;
nextPos64Low = vertexPositions64Low;
#endif
props.positions = mix(pos, nextPos, positions.x);
props.positions64Low = mix(pos64Low, nextPos64Low, positions.x);
props.normal = vec3(
pos.y - nextPos.y + (pos64Low.y - nextPos64Low.y),
nextPos.x - pos.x + (nextPos64Low.x - pos64Low.x),
0.0);
props.elevations = elevations * positions.y;
calculatePosition(props);
}
`;

// dist/solid-polygon-layer/solid-polygon-layer-fragment.glsl.js
var solid_polygon_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME solid-polygon-layer-fragment-shader
precision highp float;
in vec4 vColor;
out vec4 fragColor;
void main(void) {
fragColor = vColor;
geometry.uv = vec2(0.);
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// dist/solid-polygon-layer/solid-polygon-layer.js
var DEFAULT_COLOR8 = [0, 0, 0, 255];
var defaultProps10 = {
  filled: true,
  extruded: false,
  wireframe: false,
  _normalize: true,
  _windingOrder: "CW",
  _full3d: false,
  elevationScale: { type: "number", min: 0, value: 1 },
  getPolygon: { type: "accessor", value: (f) => f.polygon },
  getElevation: { type: "accessor", value: 1e3 },
  getFillColor: { type: "accessor", value: DEFAULT_COLOR8 },
  getLineColor: { type: "accessor", value: DEFAULT_COLOR8 },
  material: true
};
var ATTRIBUTE_TRANSITION2 = {
  enter: (value, chunk) => {
    return chunk.length ? chunk.subarray(chunk.length - value.length) : value;
  }
};
var SolidPolygonLayer = class extends import_core16.Layer {
  getShaders(type) {
    return super.getShaders({
      vs: type === "top" ? solid_polygon_layer_vertex_top_glsl_default : solid_polygon_layer_vertex_side_glsl_default,
      fs: solid_polygon_layer_fragment_glsl_default,
      defines: {
        RING_WINDING_ORDER_CW: !this.props._normalize && this.props._windingOrder === "CCW" ? 0 : 1
      },
      modules: [import_core16.project32, import_shadertools3.gouraudMaterial, import_core16.picking, solidPolygonUniforms]
    });
  }
  get wrapLongitude() {
    return false;
  }
  getBounds() {
    var _a;
    return (_a = this.getAttributeManager()) == null ? void 0 : _a.getBounds(["vertexPositions"]);
  }
  initializeState() {
    const { viewport } = this.context;
    let { coordinateSystem } = this.props;
    const { _full3d } = this.props;
    if (viewport.isGeospatial && coordinateSystem === import_core16.COORDINATE_SYSTEM.DEFAULT) {
      coordinateSystem = import_core16.COORDINATE_SYSTEM.LNGLAT;
    }
    let preproject;
    if (coordinateSystem === import_core16.COORDINATE_SYSTEM.LNGLAT) {
      if (_full3d) {
        preproject = viewport.projectPosition.bind(viewport);
      } else {
        preproject = viewport.projectFlat.bind(viewport);
      }
    }
    this.setState({
      numInstances: 0,
      polygonTesselator: new PolygonTesselator({
        // Lnglat coordinates are usually projected non-linearly, which affects tesselation results
        // Provide a preproject function if the coordinates are in lnglat
        preproject,
        fp64: this.use64bitPositions(),
        IndexType: Uint32Array
      })
    });
    const attributeManager = this.getAttributeManager();
    const noAlloc = true;
    attributeManager.remove(["instancePickingColors"]);
    attributeManager.add({
      indices: {
        size: 1,
        isIndexed: true,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this.calculateIndices,
        noAlloc
      },
      vertexPositions: {
        size: 3,
        type: "float64",
        stepMode: "dynamic",
        fp64: this.use64bitPositions(),
        transition: ATTRIBUTE_TRANSITION2,
        accessor: "getPolygon",
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this.calculatePositions,
        noAlloc,
        shaderAttributes: {
          nextVertexPositions: {
            vertexOffset: 1
          }
        }
      },
      instanceVertexValid: {
        size: 1,
        type: "uint16",
        stepMode: "instance",
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this.calculateVertexValid,
        noAlloc
      },
      elevations: {
        size: 1,
        stepMode: "dynamic",
        transition: ATTRIBUTE_TRANSITION2,
        accessor: "getElevation"
      },
      fillColors: {
        size: this.props.colorFormat.length,
        type: "unorm8",
        stepMode: "dynamic",
        transition: ATTRIBUTE_TRANSITION2,
        accessor: "getFillColor",
        defaultValue: DEFAULT_COLOR8
      },
      lineColors: {
        size: this.props.colorFormat.length,
        type: "unorm8",
        stepMode: "dynamic",
        transition: ATTRIBUTE_TRANSITION2,
        accessor: "getLineColor",
        defaultValue: DEFAULT_COLOR8
      },
      pickingColors: {
        size: 4,
        type: "uint8",
        stepMode: "dynamic",
        accessor: (object, { index, target: value }) => this.encodePickingColor(object && object.__source ? object.__source.index : index, value)
      }
    });
  }
  getPickingInfo(params) {
    const info = super.getPickingInfo(params);
    const { index } = info;
    const data = this.props.data;
    if (data[0] && data[0].__source) {
      info.object = data.find((d) => d.__source.index === index);
    }
    return info;
  }
  disablePickingIndex(objectIndex) {
    const data = this.props.data;
    if (data[0] && data[0].__source) {
      for (let i = 0; i < data.length; i++) {
        if (data[i].__source.index === objectIndex) {
          this._disablePickingIndex(i);
        }
      }
    } else {
      super.disablePickingIndex(objectIndex);
    }
  }
  draw({ uniforms }) {
    const { extruded, filled, wireframe, elevationScale } = this.props;
    const { topModel, sideModel, wireframeModel, polygonTesselator } = this.state;
    const renderUniforms = {
      extruded: Boolean(extruded),
      elevationScale,
      isWireframe: false
    };
    if (wireframeModel && wireframe) {
      wireframeModel.setInstanceCount(polygonTesselator.instanceCount - 1);
      wireframeModel.shaderInputs.setProps({ solidPolygon: { ...renderUniforms, isWireframe: true } });
      wireframeModel.draw(this.context.renderPass);
    }
    if (sideModel && filled) {
      sideModel.setInstanceCount(polygonTesselator.instanceCount - 1);
      sideModel.shaderInputs.setProps({ solidPolygon: renderUniforms });
      sideModel.draw(this.context.renderPass);
    }
    if (topModel && filled) {
      topModel.setVertexCount(polygonTesselator.vertexCount);
      topModel.shaderInputs.setProps({ solidPolygon: renderUniforms });
      topModel.draw(this.context.renderPass);
    }
  }
  updateState(updateParams) {
    var _a;
    super.updateState(updateParams);
    this.updateGeometry(updateParams);
    const { props, oldProps, changeFlags } = updateParams;
    const attributeManager = this.getAttributeManager();
    const regenerateModels = changeFlags.extensionsChanged || props.filled !== oldProps.filled || props.extruded !== oldProps.extruded;
    if (regenerateModels) {
      (_a = this.state.models) == null ? void 0 : _a.forEach((model) => model.destroy());
      this.setState(this._getModels());
      attributeManager.invalidateAll();
    }
  }
  updateGeometry({ props, oldProps, changeFlags }) {
    const geometryConfigChanged = changeFlags.dataChanged || changeFlags.updateTriggersChanged && (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getPolygon);
    if (geometryConfigChanged) {
      const { polygonTesselator } = this.state;
      const buffers = props.data.attributes || {};
      polygonTesselator.updateGeometry({
        data: props.data,
        normalize: props._normalize,
        geometryBuffer: buffers.getPolygon,
        buffers,
        getGeometry: props.getPolygon,
        positionFormat: props.positionFormat,
        wrapLongitude: props.wrapLongitude,
        // TODO - move the flag out of the viewport
        resolution: this.context.viewport.resolution,
        fp64: this.use64bitPositions(),
        dataChanged: changeFlags.dataChanged,
        full3d: props._full3d
      });
      this.setState({
        numInstances: polygonTesselator.instanceCount,
        startIndices: polygonTesselator.vertexStarts
      });
      if (!changeFlags.dataChanged) {
        this.getAttributeManager().invalidateAll();
      }
    }
  }
  _getModels() {
    const { id, filled, extruded } = this.props;
    let topModel;
    let sideModel;
    let wireframeModel;
    if (filled) {
      const shaders = this.getShaders("top");
      shaders.defines.NON_INSTANCED_MODEL = 1;
      const bufferLayout = this.getAttributeManager().getBufferLayouts({ isInstanced: false });
      topModel = new import_engine14.Model(this.context.device, {
        ...shaders,
        id: `${id}-top`,
        topology: "triangle-list",
        bufferLayout,
        isIndexed: true,
        userData: {
          excludeAttributes: { instanceVertexValid: true }
        }
      });
    }
    if (extruded) {
      const bufferLayout = this.getAttributeManager().getBufferLayouts({ isInstanced: true });
      sideModel = new import_engine14.Model(this.context.device, {
        ...this.getShaders("side"),
        id: `${id}-side`,
        bufferLayout,
        geometry: new import_engine14.Geometry({
          topology: "triangle-strip",
          attributes: {
            // top right - top left - bottom right - bottom left
            positions: {
              size: 2,
              value: new Float32Array([1, 0, 0, 0, 1, 1, 0, 1])
            }
          }
        }),
        isInstanced: true,
        userData: {
          excludeAttributes: { indices: true }
        }
      });
      wireframeModel = new import_engine14.Model(this.context.device, {
        ...this.getShaders("side"),
        id: `${id}-wireframe`,
        bufferLayout,
        geometry: new import_engine14.Geometry({
          topology: "line-strip",
          attributes: {
            // top right - top left - bottom left - bottom right
            positions: {
              size: 2,
              value: new Float32Array([1, 0, 0, 0, 0, 1, 1, 1])
            }
          }
        }),
        isInstanced: true,
        userData: {
          excludeAttributes: { indices: true }
        }
      });
    }
    return {
      models: [sideModel, wireframeModel, topModel].filter(Boolean),
      topModel,
      sideModel,
      wireframeModel
    };
  }
  calculateIndices(attribute) {
    const { polygonTesselator } = this.state;
    attribute.startIndices = polygonTesselator.indexStarts;
    attribute.value = polygonTesselator.get("indices");
  }
  calculatePositions(attribute) {
    const { polygonTesselator } = this.state;
    attribute.startIndices = polygonTesselator.vertexStarts;
    attribute.value = polygonTesselator.get("positions");
  }
  calculateVertexValid(attribute) {
    attribute.value = this.state.polygonTesselator.get("vertexValid");
  }
};
SolidPolygonLayer.defaultProps = defaultProps10;
SolidPolygonLayer.layerName = "SolidPolygonLayer";
var solid_polygon_layer_default = SolidPolygonLayer;

// dist/utils.js
function replaceInRange({ data, getIndex, dataRange, replace }) {
  const { startRow = 0, endRow = Infinity } = dataRange;
  const count = data.length;
  let replaceStart = count;
  let replaceEnd = count;
  for (let i = 0; i < count; i++) {
    const row = getIndex(data[i]);
    if (replaceStart > i && row >= startRow) {
      replaceStart = i;
    }
    if (row >= endRow) {
      replaceEnd = i;
      break;
    }
  }
  let index = replaceStart;
  const dataLengthChanged = replaceEnd - replaceStart !== replace.length;
  const endChunk = dataLengthChanged ? data.slice(replaceEnd) : void 0;
  for (let i = 0; i < replace.length; i++) {
    data[index++] = replace[i];
  }
  if (endChunk) {
    for (let i = 0; i < endChunk.length; i++) {
      data[index++] = endChunk[i];
    }
    data.length = index;
  }
  return {
    startRow: replaceStart,
    endRow: replaceStart + replace.length
  };
}

// dist/polygon-layer/polygon-layer.js
var defaultLineColor = [0, 0, 0, 255];
var defaultFillColor = [0, 0, 0, 255];
var defaultProps11 = {
  stroked: true,
  filled: true,
  extruded: false,
  elevationScale: 1,
  wireframe: false,
  _normalize: true,
  _windingOrder: "CW",
  lineWidthUnits: "meters",
  lineWidthScale: 1,
  lineWidthMinPixels: 0,
  lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
  lineJointRounded: false,
  lineMiterLimit: 4,
  getPolygon: { type: "accessor", value: (f) => f.polygon },
  // Polygon fill color
  getFillColor: { type: "accessor", value: defaultFillColor },
  // Point, line and polygon outline color
  getLineColor: { type: "accessor", value: defaultLineColor },
  // Line and polygon outline accessors
  getLineWidth: { type: "accessor", value: 1 },
  // Polygon extrusion accessor
  getElevation: { type: "accessor", value: 1e3 },
  // Optional material for 'lighting' shader module
  material: true
};
var PolygonLayer = class extends import_core17.CompositeLayer {
  initializeState() {
    this.state = {
      paths: [],
      pathsDiff: null
    };
    if (this.props.getLineDashArray) {
      import_core17.log.removed("getLineDashArray", "PathStyleExtension")();
    }
  }
  updateState({ changeFlags }) {
    const geometryChanged = changeFlags.dataChanged || changeFlags.updateTriggersChanged && (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getPolygon);
    if (geometryChanged && Array.isArray(changeFlags.dataChanged)) {
      const paths = this.state.paths.slice();
      const pathsDiff = changeFlags.dataChanged.map((dataRange) => replaceInRange({
        data: paths,
        getIndex: (p) => p.__source.index,
        dataRange,
        replace: this._getPaths(dataRange)
      }));
      this.setState({ paths, pathsDiff });
    } else if (geometryChanged) {
      this.setState({
        paths: this._getPaths(),
        pathsDiff: null
      });
    }
  }
  _getPaths(dataRange = {}) {
    const { data, getPolygon, positionFormat, _normalize } = this.props;
    const paths = [];
    const positionSize = positionFormat === "XY" ? 2 : 3;
    const { startRow, endRow } = dataRange;
    const { iterable, objectInfo } = (0, import_core17.createIterable)(data, startRow, endRow);
    for (const object of iterable) {
      objectInfo.index++;
      let polygon = getPolygon(object, objectInfo);
      if (_normalize) {
        polygon = normalize(polygon, positionSize);
      }
      const { holeIndices } = polygon;
      const positions = polygon.positions || polygon;
      if (holeIndices) {
        for (let i = 0; i <= holeIndices.length; i++) {
          const path = positions.slice(holeIndices[i - 1] || 0, holeIndices[i] || positions.length);
          paths.push(this.getSubLayerRow({ path }, object, objectInfo.index));
        }
      } else {
        paths.push(this.getSubLayerRow({ path: positions }, object, objectInfo.index));
      }
    }
    return paths;
  }
  /* eslint-disable complexity */
  renderLayers() {
    const { data, _dataDiff, stroked, filled, extruded, wireframe, _normalize, _windingOrder, elevationScale, transitions, positionFormat } = this.props;
    const { lineWidthUnits, lineWidthScale, lineWidthMinPixels, lineWidthMaxPixels, lineJointRounded, lineMiterLimit, lineDashJustified } = this.props;
    const { getFillColor, getLineColor, getLineWidth, getLineDashArray, getElevation, getPolygon, updateTriggers, material } = this.props;
    const { paths, pathsDiff } = this.state;
    const FillLayer = this.getSubLayerClass("fill", solid_polygon_layer_default);
    const StrokeLayer = this.getSubLayerClass("stroke", path_layer_default);
    const polygonLayer = this.shouldRenderSubLayer("fill", paths) && new FillLayer({
      _dataDiff,
      extruded,
      elevationScale,
      filled,
      wireframe,
      _normalize,
      _windingOrder,
      getElevation,
      getFillColor,
      getLineColor: extruded && wireframe ? getLineColor : defaultLineColor,
      material,
      transitions
    }, this.getSubLayerProps({
      id: "fill",
      updateTriggers: updateTriggers && {
        getPolygon: updateTriggers.getPolygon,
        getElevation: updateTriggers.getElevation,
        getFillColor: updateTriggers.getFillColor,
        // using a legacy API to invalid lineColor attributes
        // if (extruded && wireframe) has changed
        lineColors: extruded && wireframe,
        getLineColor: updateTriggers.getLineColor
      }
    }), {
      data,
      positionFormat,
      getPolygon
    });
    const polygonLineLayer = !extruded && stroked && this.shouldRenderSubLayer("stroke", paths) && new StrokeLayer({
      _dataDiff: pathsDiff && (() => pathsDiff),
      widthUnits: lineWidthUnits,
      widthScale: lineWidthScale,
      widthMinPixels: lineWidthMinPixels,
      widthMaxPixels: lineWidthMaxPixels,
      jointRounded: lineJointRounded,
      miterLimit: lineMiterLimit,
      dashJustified: lineDashJustified,
      // Already normalized
      _pathType: "loop",
      transitions: transitions && {
        getWidth: transitions.getLineWidth,
        getColor: transitions.getLineColor,
        getPath: transitions.getPolygon
      },
      getColor: this.getSubLayerAccessor(getLineColor),
      getWidth: this.getSubLayerAccessor(getLineWidth),
      getDashArray: this.getSubLayerAccessor(getLineDashArray)
    }, this.getSubLayerProps({
      id: "stroke",
      updateTriggers: updateTriggers && {
        getWidth: updateTriggers.getLineWidth,
        getColor: updateTriggers.getLineColor,
        getDashArray: updateTriggers.getLineDashArray
      }
    }), {
      data: paths,
      positionFormat,
      getPath: (x) => x.path
    });
    return [
      // If not extruded: flat fill layer is drawn below outlines
      !extruded && polygonLayer,
      polygonLineLayer,
      // If extruded: draw fill layer last for correct blending behavior
      extruded && polygonLayer
    ];
  }
};
PolygonLayer.layerName = "PolygonLayer";
PolygonLayer.defaultProps = defaultProps11;
var polygon_layer_default = PolygonLayer;

// dist/geojson-layer/geojson-layer.js
var import_core24 = require("@deck.gl/core");

// dist/geojson-layer/geojson-binary.js
function binaryToFeatureForAccesor(data, index) {
  if (!data) {
    return null;
  }
  const featureIndex = "startIndices" in data ? data.startIndices[index] : index;
  const geometryIndex = data.featureIds.value[featureIndex];
  if (featureIndex !== -1) {
    return getPropertiesForIndex(data, geometryIndex, featureIndex);
  }
  return null;
}
function getPropertiesForIndex(data, propertiesIndex, numericPropsIndex) {
  const feature = {
    properties: { ...data.properties[propertiesIndex] }
  };
  for (const prop in data.numericProps) {
    feature.properties[prop] = data.numericProps[prop].value[numericPropsIndex];
  }
  return feature;
}
function calculatePickingColors(geojsonBinary, encodePickingColor) {
  const pickingColors = {
    points: null,
    lines: null,
    polygons: null
  };
  for (const key in pickingColors) {
    const featureIds = geojsonBinary[key].globalFeatureIds.value;
    pickingColors[key] = new Uint8ClampedArray(featureIds.length * 4);
    const pickingColor = [];
    for (let i = 0; i < featureIds.length; i++) {
      encodePickingColor(featureIds[i], pickingColor);
      pickingColors[key][i * 4 + 0] = pickingColor[0];
      pickingColors[key][i * 4 + 1] = pickingColor[1];
      pickingColors[key][i * 4 + 2] = pickingColor[2];
      pickingColors[key][i * 4 + 3] = 255;
    }
  }
  return pickingColors;
}

// dist/text-layer/text-layer.js
var import_core22 = require("@deck.gl/core");

// dist/text-layer/multi-icon-layer/multi-icon-layer.js
var import_core18 = require("@deck.gl/core");

// dist/text-layer/multi-icon-layer/sdf-uniforms.js
var uniformBlock10 = `uniform sdfUniforms {
  float gamma;
  bool enabled;
  float buffer;
  float outlineBuffer;
  vec4 outlineColor;
} sdf;
`;
var sdfUniforms = {
  name: "sdf",
  vs: uniformBlock10,
  fs: uniformBlock10,
  uniformTypes: {
    gamma: "f32",
    enabled: "f32",
    buffer: "f32",
    outlineBuffer: "f32",
    outlineColor: "vec4<f32>"
  }
};

// dist/text-layer/multi-icon-layer/multi-icon-layer-fragment.glsl.js
var multi_icon_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME multi-icon-layer-fragment-shader
precision highp float;
uniform sampler2D iconsTexture;
in vec4 vColor;
in vec2 vTextureCoords;
in vec2 uv;
out vec4 fragColor;
void main(void) {
geometry.uv = uv;
if (!bool(picking.isActive)) {
float alpha = texture(iconsTexture, vTextureCoords).a;
vec4 color = vColor;
if (sdf.enabled) {
float distance = alpha;
alpha = smoothstep(sdf.buffer - sdf.gamma, sdf.buffer + sdf.gamma, distance);
if (sdf.outlineBuffer > 0.0) {
float inFill = alpha;
float inBorder = smoothstep(sdf.outlineBuffer - sdf.gamma, sdf.outlineBuffer + sdf.gamma, distance);
color = mix(sdf.outlineColor, vColor, inFill);
alpha = inBorder;
}
}
float a = alpha * color.a;
if (a < icon.alphaCutoff) {
discard;
}
fragColor = vec4(color.rgb, a * layer.opacity);
}
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// dist/text-layer/multi-icon-layer/multi-icon-layer.js
var DEFAULT_BUFFER2 = 192 / 256;
var EMPTY_ARRAY = [];
var defaultProps12 = {
  getIconOffsets: { type: "accessor", value: (x) => x.offsets },
  alphaCutoff: 1e-3,
  smoothing: 0.1,
  outlineWidth: 0,
  outlineColor: { type: "color", value: [0, 0, 0, 255] }
};
var MultiIconLayer = class extends icon_layer_default {
  getShaders() {
    const shaders = super.getShaders();
    return { ...shaders, modules: [...shaders.modules, sdfUniforms], fs: multi_icon_layer_fragment_glsl_default };
  }
  initializeState() {
    super.initializeState();
    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instanceOffsets: {
        size: 2,
        accessor: "getIconOffsets"
      },
      instancePickingColors: {
        type: "uint8",
        size: 3,
        accessor: (object, { index, target: value }) => this.encodePickingColor(index, value)
      }
    });
  }
  updateState(params) {
    super.updateState(params);
    const { props, oldProps } = params;
    let { outlineColor } = props;
    if (outlineColor !== oldProps.outlineColor) {
      outlineColor = outlineColor.map((x) => x / 255);
      outlineColor[3] = Number.isFinite(outlineColor[3]) ? outlineColor[3] : 1;
      this.setState({
        outlineColor
      });
    }
    if (!props.sdf && props.outlineWidth) {
      import_core18.log.warn(`${this.id}: fontSettings.sdf is required to render outline`)();
    }
  }
  draw(params) {
    const { sdf, smoothing, outlineWidth } = this.props;
    const { outlineColor } = this.state;
    const outlineBuffer = outlineWidth ? Math.max(smoothing, DEFAULT_BUFFER2 * (1 - outlineWidth)) : -1;
    const model = this.state.model;
    const sdfProps = {
      buffer: DEFAULT_BUFFER2,
      outlineBuffer,
      gamma: smoothing,
      enabled: Boolean(sdf),
      outlineColor
    };
    model.shaderInputs.setProps({ sdf: sdfProps });
    super.draw(params);
    if (sdf && outlineWidth) {
      const { iconManager } = this.state;
      const iconsTexture = iconManager.getTexture();
      if (iconsTexture) {
        model.shaderInputs.setProps({ sdf: { ...sdfProps, outlineBuffer: DEFAULT_BUFFER2 } });
        model.draw(this.context.renderPass);
      }
    }
  }
  getInstanceOffset(icons) {
    return icons ? Array.from(icons).flatMap((icon) => super.getInstanceOffset(icon)) : EMPTY_ARRAY;
  }
  getInstanceColorMode(icons) {
    return 1;
  }
  getInstanceIconFrame(icons) {
    return icons ? Array.from(icons).flatMap((icon) => super.getInstanceIconFrame(icon)) : EMPTY_ARRAY;
  }
};
MultiIconLayer.defaultProps = defaultProps12;
MultiIconLayer.layerName = "MultiIconLayer";
var multi_icon_layer_default = MultiIconLayer;

// dist/text-layer/font-atlas-manager.js
var import_tiny_sdf = __toESM(require("@mapbox/tiny-sdf"), 1);
var import_core20 = require("@deck.gl/core");

// dist/text-layer/utils.js
var import_core19 = require("@deck.gl/core");
var MISSING_CHAR_WIDTH = 32;
var SINGLE_LINE = [];
function nextPowOfTwo2(number) {
  return Math.pow(2, Math.ceil(Math.log2(number)));
}
function buildMapping2({ characterSet, getFontWidth, fontHeight, buffer, maxCanvasWidth, mapping = {}, xOffset = 0, yOffset = 0 }) {
  let row = 0;
  let x = xOffset;
  const rowHeight = fontHeight + buffer * 2;
  for (const char of characterSet) {
    if (!mapping[char]) {
      const width = getFontWidth(char);
      if (x + width + buffer * 2 > maxCanvasWidth) {
        x = 0;
        row++;
      }
      mapping[char] = {
        x: x + buffer,
        y: yOffset + row * rowHeight + buffer,
        width,
        height: rowHeight,
        layoutWidth: width,
        layoutHeight: fontHeight
      };
      x += width + buffer * 2;
    }
  }
  return {
    mapping,
    xOffset: x,
    yOffset: yOffset + row * rowHeight,
    canvasHeight: nextPowOfTwo2(yOffset + (row + 1) * rowHeight)
  };
}
function getTextWidth(text, startIndex, endIndex, mapping) {
  var _a;
  let width = 0;
  for (let i = startIndex; i < endIndex; i++) {
    const character = text[i];
    width += ((_a = mapping[character]) == null ? void 0 : _a.layoutWidth) || 0;
  }
  return width;
}
function breakAll(text, startIndex, endIndex, maxWidth, iconMapping, target) {
  let rowStartCharIndex = startIndex;
  let rowOffsetLeft = 0;
  for (let i = startIndex; i < endIndex; i++) {
    const textWidth = getTextWidth(text, i, i + 1, iconMapping);
    if (rowOffsetLeft + textWidth > maxWidth) {
      if (rowStartCharIndex < i) {
        target.push(i);
      }
      rowStartCharIndex = i;
      rowOffsetLeft = 0;
    }
    rowOffsetLeft += textWidth;
  }
  return rowOffsetLeft;
}
function breakWord(text, startIndex, endIndex, maxWidth, iconMapping, target) {
  let rowStartCharIndex = startIndex;
  let groupStartCharIndex = startIndex;
  let groupEndCharIndex = startIndex;
  let rowOffsetLeft = 0;
  for (let i = startIndex; i < endIndex; i++) {
    if (text[i] === " ") {
      groupEndCharIndex = i + 1;
    } else if (text[i + 1] === " " || i + 1 === endIndex) {
      groupEndCharIndex = i + 1;
    }
    if (groupEndCharIndex > groupStartCharIndex) {
      let groupWidth = getTextWidth(text, groupStartCharIndex, groupEndCharIndex, iconMapping);
      if (rowOffsetLeft + groupWidth > maxWidth) {
        if (rowStartCharIndex < groupStartCharIndex) {
          target.push(groupStartCharIndex);
          rowStartCharIndex = groupStartCharIndex;
          rowOffsetLeft = 0;
        }
        if (groupWidth > maxWidth) {
          groupWidth = breakAll(text, groupStartCharIndex, groupEndCharIndex, maxWidth, iconMapping, target);
          rowStartCharIndex = target[target.length - 1];
        }
      }
      groupStartCharIndex = groupEndCharIndex;
      rowOffsetLeft += groupWidth;
    }
  }
  return rowOffsetLeft;
}
function autoWrapping(text, wordBreak, maxWidth, iconMapping, startIndex = 0, endIndex) {
  if (endIndex === void 0) {
    endIndex = text.length;
  }
  const result = [];
  if (wordBreak === "break-all") {
    breakAll(text, startIndex, endIndex, maxWidth, iconMapping, result);
  } else {
    breakWord(text, startIndex, endIndex, maxWidth, iconMapping, result);
  }
  return result;
}
function transformRow(line, startIndex, endIndex, iconMapping, leftOffsets, rowSize) {
  let x = 0;
  let rowHeight = 0;
  for (let i = startIndex; i < endIndex; i++) {
    const character = line[i];
    const frame = iconMapping[character];
    if (frame) {
      if (!rowHeight) {
        rowHeight = frame.layoutHeight;
      }
      leftOffsets[i] = x + frame.layoutWidth / 2;
      x += frame.layoutWidth;
    } else {
      import_core19.log.warn(`Missing character: ${character} (${character.codePointAt(0)})`)();
      leftOffsets[i] = x;
      x += MISSING_CHAR_WIDTH;
    }
  }
  rowSize[0] = x;
  rowSize[1] = rowHeight;
}
function transformParagraph(paragraph, lineHeight, wordBreak, maxWidth, iconMapping) {
  var _a;
  const characters = Array.from(paragraph);
  const numCharacters = characters.length;
  const x = new Array(numCharacters);
  const y = new Array(numCharacters);
  const rowWidth = new Array(numCharacters);
  const autoWrappingEnabled = (wordBreak === "break-word" || wordBreak === "break-all") && isFinite(maxWidth) && maxWidth > 0;
  const size = [0, 0];
  const rowSize = [0, 0];
  let rowOffsetTop = 0;
  let lineStartIndex = 0;
  let lineEndIndex = 0;
  for (let i = 0; i <= numCharacters; i++) {
    const char = characters[i];
    if (char === "\n" || i === numCharacters) {
      lineEndIndex = i;
    }
    if (lineEndIndex > lineStartIndex) {
      const rows = autoWrappingEnabled ? autoWrapping(characters, wordBreak, maxWidth, iconMapping, lineStartIndex, lineEndIndex) : SINGLE_LINE;
      for (let rowIndex = 0; rowIndex <= rows.length; rowIndex++) {
        const rowStart = rowIndex === 0 ? lineStartIndex : rows[rowIndex - 1];
        const rowEnd = rowIndex < rows.length ? rows[rowIndex] : lineEndIndex;
        transformRow(characters, rowStart, rowEnd, iconMapping, x, rowSize);
        for (let j = rowStart; j < rowEnd; j++) {
          const char2 = characters[j];
          const layoutOffsetY = ((_a = iconMapping[char2]) == null ? void 0 : _a.layoutOffsetY) || 0;
          y[j] = rowOffsetTop + rowSize[1] / 2 + layoutOffsetY;
          rowWidth[j] = rowSize[0];
        }
        rowOffsetTop = rowOffsetTop + rowSize[1] * lineHeight;
        size[0] = Math.max(size[0], rowSize[0]);
      }
      lineStartIndex = lineEndIndex;
    }
    if (char === "\n") {
      x[lineStartIndex] = 0;
      y[lineStartIndex] = 0;
      rowWidth[lineStartIndex] = 0;
      lineStartIndex++;
    }
  }
  size[1] = rowOffsetTop;
  return { x, y, rowWidth, size };
}
function getTextFromBuffer({ value, length, stride, offset, startIndices, characterSet }) {
  const bytesPerElement = value.BYTES_PER_ELEMENT;
  const elementStride = stride ? stride / bytesPerElement : 1;
  const elementOffset = offset ? offset / bytesPerElement : 0;
  const characterCount = startIndices[length] || Math.ceil((value.length - elementOffset) / elementStride);
  const autoCharacterSet = characterSet && /* @__PURE__ */ new Set();
  const texts = new Array(length);
  let codes = value;
  if (elementStride > 1 || elementOffset > 0) {
    const ArrayType = value.constructor;
    codes = new ArrayType(characterCount);
    for (let i = 0; i < characterCount; i++) {
      codes[i] = value[i * elementStride + elementOffset];
    }
  }
  for (let index = 0; index < length; index++) {
    const startIndex = startIndices[index];
    const endIndex = startIndices[index + 1] || characterCount;
    const codesAtIndex = codes.subarray(startIndex, endIndex);
    texts[index] = String.fromCodePoint.apply(null, codesAtIndex);
    if (autoCharacterSet) {
      codesAtIndex.forEach(autoCharacterSet.add, autoCharacterSet);
    }
  }
  if (autoCharacterSet) {
    for (const charCode of autoCharacterSet) {
      characterSet.add(String.fromCodePoint(charCode));
    }
  }
  return { texts, characterCount };
}

// dist/text-layer/lru-cache.js
var LRUCache = class {
  constructor(limit = 5) {
    this._cache = {};
    this._order = [];
    this.limit = limit;
  }
  get(key) {
    const value = this._cache[key];
    if (value) {
      this._deleteOrder(key);
      this._appendOrder(key);
    }
    return value;
  }
  set(key, value) {
    if (!this._cache[key]) {
      if (Object.keys(this._cache).length === this.limit) {
        this.delete(this._order[0]);
      }
      this._cache[key] = value;
      this._appendOrder(key);
    } else {
      this.delete(key);
      this._cache[key] = value;
      this._appendOrder(key);
    }
  }
  delete(key) {
    const value = this._cache[key];
    if (value) {
      delete this._cache[key];
      this._deleteOrder(key);
    }
  }
  _deleteOrder(key) {
    const index = this._order.indexOf(key);
    if (index >= 0) {
      this._order.splice(index, 1);
    }
  }
  _appendOrder(key) {
    this._order.push(key);
  }
};

// dist/text-layer/font-atlas-manager.js
function getDefaultCharacterSet() {
  const charSet = [];
  for (let i = 32; i < 128; i++) {
    charSet.push(String.fromCharCode(i));
  }
  return charSet;
}
var DEFAULT_FONT_SETTINGS = {
  fontFamily: "Monaco, monospace",
  fontWeight: "normal",
  characterSet: getDefaultCharacterSet(),
  fontSize: 64,
  buffer: 4,
  sdf: false,
  cutoff: 0.25,
  radius: 12,
  smoothing: 0.1
};
var MAX_CANVAS_WIDTH = 1024;
var BASELINE_SCALE = 0.9;
var HEIGHT_SCALE = 1.2;
var CACHE_LIMIT = 3;
var cache = new LRUCache(CACHE_LIMIT);
function getNewChars(cacheKey, characterSet) {
  let newCharSet;
  if (typeof characterSet === "string") {
    newCharSet = new Set(Array.from(characterSet));
  } else {
    newCharSet = new Set(characterSet);
  }
  const cachedFontAtlas = cache.get(cacheKey);
  if (!cachedFontAtlas) {
    return newCharSet;
  }
  for (const char in cachedFontAtlas.mapping) {
    if (newCharSet.has(char)) {
      newCharSet.delete(char);
    }
  }
  return newCharSet;
}
function populateAlphaChannel(alphaChannel, imageData) {
  for (let i = 0; i < alphaChannel.length; i++) {
    imageData.data[4 * i + 3] = alphaChannel[i];
  }
}
function setTextStyle(ctx, fontFamily, fontSize, fontWeight) {
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = "#000";
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
}
function setFontAtlasCacheLimit(limit) {
  import_core20.log.assert(Number.isFinite(limit) && limit >= CACHE_LIMIT, "Invalid cache limit");
  cache = new LRUCache(limit);
}
var FontAtlasManager = class {
  constructor() {
    this.props = { ...DEFAULT_FONT_SETTINGS };
  }
  get atlas() {
    return this._atlas;
  }
  // TODO - cut during v9 porting as types reveal this is not correct
  // get texture(): Texture | undefined {
  //   return this._atlas;
  // }
  get mapping() {
    return this._atlas && this._atlas.mapping;
  }
  get scale() {
    const { fontSize, buffer } = this.props;
    return (fontSize * HEIGHT_SCALE + buffer * 2) / fontSize;
  }
  setProps(props = {}) {
    Object.assign(this.props, props);
    this._key = this._getKey();
    const charSet = getNewChars(this._key, this.props.characterSet);
    const cachedFontAtlas = cache.get(this._key);
    if (cachedFontAtlas && charSet.size === 0) {
      if (this._atlas !== cachedFontAtlas) {
        this._atlas = cachedFontAtlas;
      }
      return;
    }
    const fontAtlas = this._generateFontAtlas(charSet, cachedFontAtlas);
    this._atlas = fontAtlas;
    cache.set(this._key, fontAtlas);
  }
  // eslint-disable-next-line max-statements
  _generateFontAtlas(characterSet, cachedFontAtlas) {
    const { fontFamily, fontWeight, fontSize, buffer, sdf, radius, cutoff } = this.props;
    let canvas = cachedFontAtlas && cachedFontAtlas.data;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.width = MAX_CANVAS_WIDTH;
    }
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    setTextStyle(ctx, fontFamily, fontSize, fontWeight);
    const { mapping, canvasHeight, xOffset, yOffset } = buildMapping2({
      getFontWidth: (char) => ctx.measureText(char).width,
      fontHeight: fontSize * HEIGHT_SCALE,
      buffer,
      characterSet,
      maxCanvasWidth: MAX_CANVAS_WIDTH,
      ...cachedFontAtlas && {
        mapping: cachedFontAtlas.mapping,
        xOffset: cachedFontAtlas.xOffset,
        yOffset: cachedFontAtlas.yOffset
      }
    });
    if (canvas.height !== canvasHeight) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.height = canvasHeight;
      ctx.putImageData(imageData, 0, 0);
    }
    setTextStyle(ctx, fontFamily, fontSize, fontWeight);
    if (sdf) {
      const tinySDF = new import_tiny_sdf.default({
        fontSize,
        buffer,
        radius,
        cutoff,
        fontFamily,
        fontWeight: `${fontWeight}`
      });
      for (const char of characterSet) {
        const { data, width, height, glyphTop } = tinySDF.draw(char);
        mapping[char].width = width;
        mapping[char].layoutOffsetY = fontSize * BASELINE_SCALE - glyphTop;
        const imageData = ctx.createImageData(width, height);
        populateAlphaChannel(data, imageData);
        ctx.putImageData(imageData, mapping[char].x, mapping[char].y);
      }
    } else {
      for (const char of characterSet) {
        ctx.fillText(char, mapping[char].x, mapping[char].y + buffer + fontSize * BASELINE_SCALE);
      }
    }
    return {
      xOffset,
      yOffset,
      mapping,
      data: canvas,
      width: canvas.width,
      height: canvas.height
    };
  }
  _getKey() {
    const { fontFamily, fontWeight, fontSize, buffer, sdf, radius, cutoff } = this.props;
    if (sdf) {
      return `${fontFamily} ${fontWeight} ${fontSize} ${buffer} ${radius} ${cutoff}`;
    }
    return `${fontFamily} ${fontWeight} ${fontSize} ${buffer}`;
  }
};

// dist/text-layer/text-background-layer/text-background-layer.js
var import_core21 = require("@deck.gl/core");
var import_engine15 = require("@luma.gl/engine");
var import_engine16 = require("@luma.gl/engine");

// dist/text-layer/text-background-layer/text-background-layer-uniforms.js
var uniformBlock11 = `uniform textBackgroundUniforms {
  bool billboard;
  float sizeScale;
  float sizeMinPixels;
  float sizeMaxPixels;
  vec4 padding;
  highp int sizeUnits;
  bool stroked;
} textBackground;
`;
var textBackgroundUniforms = {
  name: "textBackground",
  vs: uniformBlock11,
  fs: uniformBlock11,
  uniformTypes: {
    billboard: "f32",
    sizeScale: "f32",
    sizeMinPixels: "f32",
    sizeMaxPixels: "f32",
    padding: "vec4<f32>",
    sizeUnits: "i32",
    stroked: "f32"
  }
};

// dist/text-layer/text-background-layer/text-background-layer-vertex.glsl.js
var text_background_layer_vertex_glsl_default = `#version 300 es
#define SHADER_NAME text-background-layer-vertex-shader
in vec2 positions;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in vec4 instanceRects;
in float instanceSizes;
in float instanceAngles;
in vec2 instancePixelOffsets;
in float instanceLineWidths;
in vec4 instanceFillColors;
in vec4 instanceLineColors;
in vec3 instancePickingColors;
out vec4 vFillColor;
out vec4 vLineColor;
out float vLineWidth;
out vec2 uv;
out vec2 dimensions;
vec2 rotate_by_angle(vec2 vertex, float angle) {
float angle_radian = radians(angle);
float cos_angle = cos(angle_radian);
float sin_angle = sin(angle_radian);
mat2 rotationMatrix = mat2(cos_angle, -sin_angle, sin_angle, cos_angle);
return rotationMatrix * vertex;
}
void main(void) {
geometry.worldPosition = instancePositions;
geometry.uv = positions;
geometry.pickingColor = instancePickingColors;
uv = positions;
vLineWidth = instanceLineWidths;
float sizePixels = clamp(
project_size_to_pixel(instanceSizes * textBackground.sizeScale, textBackground.sizeUnits),
textBackground.sizeMinPixels, textBackground.sizeMaxPixels
);
dimensions = instanceRects.zw * sizePixels + textBackground.padding.xy + textBackground.padding.zw;
vec2 pixelOffset = (positions * instanceRects.zw + instanceRects.xy) * sizePixels + mix(-textBackground.padding.xy, textBackground.padding.zw, positions);
pixelOffset = rotate_by_angle(pixelOffset, instanceAngles);
pixelOffset += instancePixelOffsets;
pixelOffset.y *= -1.0;
if (textBackground.billboard)  {
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
vec3 offset = vec3(pixelOffset, 0.0);
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
} else {
vec3 offset_common = vec3(project_pixel_size(pixelOffset), 0.0);
DECKGL_FILTER_SIZE(offset_common, geometry);
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset_common, geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
}
vFillColor = vec4(instanceFillColors.rgb, instanceFillColors.a * layer.opacity);
DECKGL_FILTER_COLOR(vFillColor, geometry);
vLineColor = vec4(instanceLineColors.rgb, instanceLineColors.a * layer.opacity);
DECKGL_FILTER_COLOR(vLineColor, geometry);
}
`;

// dist/text-layer/text-background-layer/text-background-layer-fragment.glsl.js
var text_background_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME text-background-layer-fragment-shader
precision highp float;
in vec4 vFillColor;
in vec4 vLineColor;
in float vLineWidth;
in vec2 uv;
in vec2 dimensions;
out vec4 fragColor;
void main(void) {
geometry.uv = uv;
vec2 pixelPosition = uv * dimensions;
if (textBackground.stroked) {
float distToEdge = min(
min(pixelPosition.x, dimensions.x - pixelPosition.x),
min(pixelPosition.y, dimensions.y - pixelPosition.y)
);
float isBorder = smoothedge(distToEdge, vLineWidth);
fragColor = mix(vFillColor, vLineColor, isBorder);
} else {
fragColor = vFillColor;
}
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// dist/text-layer/text-background-layer/text-background-layer.js
var defaultProps13 = {
  billboard: true,
  sizeScale: 1,
  sizeUnits: "pixels",
  sizeMinPixels: 0,
  sizeMaxPixels: Number.MAX_SAFE_INTEGER,
  padding: { type: "array", value: [0, 0, 0, 0] },
  getPosition: { type: "accessor", value: (x) => x.position },
  getSize: { type: "accessor", value: 1 },
  getAngle: { type: "accessor", value: 0 },
  getPixelOffset: { type: "accessor", value: [0, 0] },
  getBoundingRect: { type: "accessor", value: [0, 0, 0, 0] },
  getFillColor: { type: "accessor", value: [0, 0, 0, 255] },
  getLineColor: { type: "accessor", value: [0, 0, 0, 255] },
  getLineWidth: { type: "accessor", value: 1 }
};
var TextBackgroundLayer = class extends import_core21.Layer {
  getShaders() {
    return super.getShaders({ vs: text_background_layer_vertex_glsl_default, fs: text_background_layer_fragment_glsl_default, modules: [import_core21.project32, import_core21.picking, textBackgroundUniforms] });
  }
  initializeState() {
    this.getAttributeManager().addInstanced({
      instancePositions: {
        size: 3,
        type: "float64",
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: "getPosition"
      },
      instanceSizes: {
        size: 1,
        transition: true,
        accessor: "getSize",
        defaultValue: 1
      },
      instanceAngles: {
        size: 1,
        transition: true,
        accessor: "getAngle"
      },
      instanceRects: {
        size: 4,
        accessor: "getBoundingRect"
      },
      instancePixelOffsets: {
        size: 2,
        transition: true,
        accessor: "getPixelOffset"
      },
      instanceFillColors: {
        size: 4,
        transition: true,
        type: "unorm8",
        accessor: "getFillColor",
        defaultValue: [0, 0, 0, 255]
      },
      instanceLineColors: {
        size: 4,
        transition: true,
        type: "unorm8",
        accessor: "getLineColor",
        defaultValue: [0, 0, 0, 255]
      },
      instanceLineWidths: {
        size: 1,
        transition: true,
        accessor: "getLineWidth",
        defaultValue: 1
      }
    });
  }
  updateState(params) {
    var _a;
    super.updateState(params);
    const { changeFlags } = params;
    if (changeFlags.extensionsChanged) {
      (_a = this.state.model) == null ? void 0 : _a.destroy();
      this.state.model = this._getModel();
      this.getAttributeManager().invalidateAll();
    }
  }
  draw({ uniforms }) {
    const { billboard, sizeScale, sizeUnits, sizeMinPixels, sizeMaxPixels, getLineWidth } = this.props;
    let { padding } = this.props;
    if (padding.length < 4) {
      padding = [padding[0], padding[1], padding[0], padding[1]];
    }
    const model = this.state.model;
    const textBackgroundProps = {
      billboard,
      stroked: Boolean(getLineWidth),
      padding,
      sizeUnits: import_core21.UNIT[sizeUnits],
      sizeScale,
      sizeMinPixels,
      sizeMaxPixels
    };
    model.shaderInputs.setProps({ textBackground: textBackgroundProps });
    model.draw(this.context.renderPass);
  }
  _getModel() {
    const positions = [0, 0, 1, 0, 0, 1, 1, 1];
    return new import_engine16.Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager().getBufferLayouts(),
      geometry: new import_engine15.Geometry({
        topology: "triangle-strip",
        vertexCount: 4,
        attributes: {
          positions: { size: 2, value: new Float32Array(positions) }
        }
      }),
      isInstanced: true
    });
  }
};
TextBackgroundLayer.defaultProps = defaultProps13;
TextBackgroundLayer.layerName = "TextBackgroundLayer";
var text_background_layer_default = TextBackgroundLayer;

// dist/text-layer/text-layer.js
var TEXT_ANCHOR = {
  start: 1,
  middle: 0,
  end: -1
};
var ALIGNMENT_BASELINE = {
  top: 1,
  center: 0,
  bottom: -1
};
var DEFAULT_COLOR9 = [0, 0, 0, 255];
var DEFAULT_LINE_HEIGHT = 1;
var defaultProps14 = {
  billboard: true,
  sizeScale: 1,
  sizeUnits: "pixels",
  sizeMinPixels: 0,
  sizeMaxPixels: Number.MAX_SAFE_INTEGER,
  background: false,
  getBackgroundColor: { type: "accessor", value: [255, 255, 255, 255] },
  getBorderColor: { type: "accessor", value: DEFAULT_COLOR9 },
  getBorderWidth: { type: "accessor", value: 0 },
  backgroundPadding: { type: "array", value: [0, 0, 0, 0] },
  characterSet: { type: "object", value: DEFAULT_FONT_SETTINGS.characterSet },
  fontFamily: DEFAULT_FONT_SETTINGS.fontFamily,
  fontWeight: DEFAULT_FONT_SETTINGS.fontWeight,
  lineHeight: DEFAULT_LINE_HEIGHT,
  outlineWidth: { type: "number", value: 0, min: 0 },
  outlineColor: { type: "color", value: DEFAULT_COLOR9 },
  fontSettings: { type: "object", value: {}, compare: 1 },
  // auto wrapping options
  wordBreak: "break-word",
  maxWidth: { type: "number", value: -1 },
  getText: { type: "accessor", value: (x) => x.text },
  getPosition: { type: "accessor", value: (x) => x.position },
  getColor: { type: "accessor", value: DEFAULT_COLOR9 },
  getSize: { type: "accessor", value: 32 },
  getAngle: { type: "accessor", value: 0 },
  getTextAnchor: { type: "accessor", value: "middle" },
  getAlignmentBaseline: { type: "accessor", value: "center" },
  getPixelOffset: { type: "accessor", value: [0, 0] },
  // deprecated
  backgroundColor: { deprecatedFor: ["background", "getBackgroundColor"] }
};
var TextLayer = class extends import_core22.CompositeLayer {
  constructor() {
    super(...arguments);
    this.getBoundingRect = (object, objectInfo) => {
      let { size: [width, height] } = this.transformParagraph(object, objectInfo);
      const { fontSize } = this.state.fontAtlasManager.props;
      width /= fontSize;
      height /= fontSize;
      const { getTextAnchor, getAlignmentBaseline } = this.props;
      const anchorX = TEXT_ANCHOR[typeof getTextAnchor === "function" ? getTextAnchor(object, objectInfo) : getTextAnchor];
      const anchorY = ALIGNMENT_BASELINE[typeof getAlignmentBaseline === "function" ? getAlignmentBaseline(object, objectInfo) : getAlignmentBaseline];
      return [(anchorX - 1) * width / 2, (anchorY - 1) * height / 2, width, height];
    };
    this.getIconOffsets = (object, objectInfo) => {
      const { getTextAnchor, getAlignmentBaseline } = this.props;
      const { x, y, rowWidth, size: [width, height] } = this.transformParagraph(object, objectInfo);
      const anchorX = TEXT_ANCHOR[typeof getTextAnchor === "function" ? getTextAnchor(object, objectInfo) : getTextAnchor];
      const anchorY = ALIGNMENT_BASELINE[typeof getAlignmentBaseline === "function" ? getAlignmentBaseline(object, objectInfo) : getAlignmentBaseline];
      const numCharacters = x.length;
      const offsets = new Array(numCharacters * 2);
      let index = 0;
      for (let i = 0; i < numCharacters; i++) {
        const rowOffset = (1 - anchorX) * (width - rowWidth[i]) / 2;
        offsets[index++] = (anchorX - 1) * width / 2 + rowOffset + x[i];
        offsets[index++] = (anchorY - 1) * height / 2 + y[i];
      }
      return offsets;
    };
  }
  initializeState() {
    this.state = {
      styleVersion: 0,
      fontAtlasManager: new FontAtlasManager()
    };
    if (this.props.maxWidth > 0) {
      import_core22.log.warn("v8.9 breaking change: TextLayer maxWidth is now relative to text size")();
    }
  }
  // eslint-disable-next-line complexity
  updateState(params) {
    const { props, oldProps, changeFlags } = params;
    const textChanged = changeFlags.dataChanged || changeFlags.updateTriggersChanged && (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getText);
    if (textChanged) {
      this._updateText();
    }
    const fontChanged = this._updateFontAtlas();
    const styleChanged = fontChanged || props.lineHeight !== oldProps.lineHeight || props.wordBreak !== oldProps.wordBreak || props.maxWidth !== oldProps.maxWidth;
    if (styleChanged) {
      this.setState({
        styleVersion: this.state.styleVersion + 1
      });
    }
  }
  getPickingInfo({ info }) {
    info.object = info.index >= 0 ? this.props.data[info.index] : null;
    return info;
  }
  /** Returns true if font has changed */
  _updateFontAtlas() {
    const { fontSettings, fontFamily, fontWeight } = this.props;
    const { fontAtlasManager, characterSet } = this.state;
    const fontProps = {
      ...fontSettings,
      characterSet,
      fontFamily,
      fontWeight
    };
    if (!fontAtlasManager.mapping) {
      fontAtlasManager.setProps(fontProps);
      return true;
    }
    for (const key in fontProps) {
      if (fontProps[key] !== fontAtlasManager.props[key]) {
        fontAtlasManager.setProps(fontProps);
        return true;
      }
    }
    return false;
  }
  // Text strings are variable width objects
  // Count characters and start offsets
  _updateText() {
    var _a;
    const { data, characterSet } = this.props;
    const textBuffer = (_a = data.attributes) == null ? void 0 : _a.getText;
    let { getText } = this.props;
    let startIndices = data.startIndices;
    let numInstances;
    const autoCharacterSet = characterSet === "auto" && /* @__PURE__ */ new Set();
    if (textBuffer && startIndices) {
      const { texts, characterCount } = getTextFromBuffer({
        ...ArrayBuffer.isView(textBuffer) ? { value: textBuffer } : textBuffer,
        // @ts-ignore if data.attribute is defined then length is expected
        length: data.length,
        startIndices,
        characterSet: autoCharacterSet
      });
      numInstances = characterCount;
      getText = (_, { index }) => texts[index];
    } else {
      const { iterable, objectInfo } = (0, import_core22.createIterable)(data);
      startIndices = [0];
      numInstances = 0;
      for (const object of iterable) {
        objectInfo.index++;
        const text = Array.from(getText(object, objectInfo) || "");
        if (autoCharacterSet) {
          text.forEach(autoCharacterSet.add, autoCharacterSet);
        }
        numInstances += text.length;
        startIndices.push(numInstances);
      }
    }
    this.setState({
      getText,
      startIndices,
      numInstances,
      characterSet: autoCharacterSet || characterSet
    });
  }
  /** There are two size systems in this layer:
  
      + Pixel size: user-specified text size, via getSize, sizeScale, sizeUnits etc.
        The layer roughly matches the output of the layer to CSS pixels, e.g. getSize: 12, sizeScale: 2
        in layer props is roughly equivalent to font-size: 24px in CSS.
      + Texture size: internally, character positions in a text blob are calculated using the sizes of iconMapping,
        which depends on how large each character is drawn into the font atlas. This is controlled by
        fontSettings.fontSize (default 64) and most users do not set it manually.
        These numbers are intended to be used in the vertex shader and never to be exposed to the end user.
  
      All surfaces exposed to the user should either use the pixel size or a multiplier relative to the pixel size. */
  /** Calculate the size and position of each character in a text string.
   * Values are in texture size */
  transformParagraph(object, objectInfo) {
    const { fontAtlasManager } = this.state;
    const iconMapping = fontAtlasManager.mapping;
    const getText = this.state.getText;
    const { wordBreak, lineHeight, maxWidth } = this.props;
    const paragraph = getText(object, objectInfo) || "";
    return transformParagraph(paragraph, lineHeight, wordBreak, maxWidth * fontAtlasManager.props.fontSize, iconMapping);
  }
  renderLayers() {
    const { startIndices, numInstances, getText, fontAtlasManager: { scale, atlas, mapping }, styleVersion } = this.state;
    const { data, _dataDiff, getPosition, getColor, getSize, getAngle, getPixelOffset, getBackgroundColor, getBorderColor, getBorderWidth, backgroundPadding, background, billboard, fontSettings, outlineWidth, outlineColor, sizeScale, sizeUnits, sizeMinPixels, sizeMaxPixels, transitions, updateTriggers } = this.props;
    const CharactersLayerClass = this.getSubLayerClass("characters", multi_icon_layer_default);
    const BackgroundLayerClass = this.getSubLayerClass("background", text_background_layer_default);
    return [
      background && new BackgroundLayerClass({
        // background props
        getFillColor: getBackgroundColor,
        getLineColor: getBorderColor,
        getLineWidth: getBorderWidth,
        padding: backgroundPadding,
        // props shared with characters layer
        getPosition,
        getSize,
        getAngle,
        getPixelOffset,
        billboard,
        sizeScale,
        sizeUnits,
        sizeMinPixels,
        sizeMaxPixels,
        transitions: transitions && {
          getPosition: transitions.getPosition,
          getAngle: transitions.getAngle,
          getSize: transitions.getSize,
          getFillColor: transitions.getBackgroundColor,
          getLineColor: transitions.getBorderColor,
          getLineWidth: transitions.getBorderWidth,
          getPixelOffset: transitions.getPixelOffset
        }
      }, this.getSubLayerProps({
        id: "background",
        updateTriggers: {
          getPosition: updateTriggers.getPosition,
          getAngle: updateTriggers.getAngle,
          getSize: updateTriggers.getSize,
          getFillColor: updateTriggers.getBackgroundColor,
          getLineColor: updateTriggers.getBorderColor,
          getLineWidth: updateTriggers.getBorderWidth,
          getPixelOffset: updateTriggers.getPixelOffset,
          getBoundingRect: {
            getText: updateTriggers.getText,
            getTextAnchor: updateTriggers.getTextAnchor,
            getAlignmentBaseline: updateTriggers.getAlignmentBaseline,
            styleVersion
          }
        }
      }), {
        data: (
          // @ts-ignore (2339) attribute is not defined on all data types
          data.attributes && data.attributes.background ? (
            // @ts-ignore (2339) attribute is not defined on all data types
            { length: data.length, attributes: data.attributes.background }
          ) : data
        ),
        _dataDiff,
        // Maintain the same background behavior as <=8.3. Remove in v9?
        autoHighlight: false,
        getBoundingRect: this.getBoundingRect
      }),
      new CharactersLayerClass({
        sdf: fontSettings.sdf,
        smoothing: Number.isFinite(fontSettings.smoothing) ? fontSettings.smoothing : DEFAULT_FONT_SETTINGS.smoothing,
        outlineWidth: outlineWidth / (fontSettings.radius || DEFAULT_FONT_SETTINGS.radius),
        outlineColor,
        iconAtlas: atlas,
        iconMapping: mapping,
        getPosition,
        getColor,
        getSize,
        getAngle,
        getPixelOffset,
        billboard,
        sizeScale: sizeScale * scale,
        sizeUnits,
        sizeMinPixels: sizeMinPixels * scale,
        sizeMaxPixels: sizeMaxPixels * scale,
        transitions: transitions && {
          getPosition: transitions.getPosition,
          getAngle: transitions.getAngle,
          getColor: transitions.getColor,
          getSize: transitions.getSize,
          getPixelOffset: transitions.getPixelOffset
        }
      }, this.getSubLayerProps({
        id: "characters",
        updateTriggers: {
          all: updateTriggers.getText,
          getPosition: updateTriggers.getPosition,
          getAngle: updateTriggers.getAngle,
          getColor: updateTriggers.getColor,
          getSize: updateTriggers.getSize,
          getPixelOffset: updateTriggers.getPixelOffset,
          getIconOffsets: {
            getTextAnchor: updateTriggers.getTextAnchor,
            getAlignmentBaseline: updateTriggers.getAlignmentBaseline,
            styleVersion
          }
        }
      }), {
        data,
        _dataDiff,
        startIndices,
        numInstances,
        getIconOffsets: this.getIconOffsets,
        getIcon: getText
      })
    ];
  }
  static set fontAtlasCacheLimit(limit) {
    setFontAtlasCacheLimit(limit);
  }
};
TextLayer.defaultProps = defaultProps14;
TextLayer.layerName = "TextLayer";
var text_layer_default = TextLayer;

// dist/geojson-layer/sub-layer-map.js
var POINT_LAYER = {
  circle: {
    type: scatterplot_layer_default,
    props: {
      filled: "filled",
      stroked: "stroked",
      lineWidthMaxPixels: "lineWidthMaxPixels",
      lineWidthMinPixels: "lineWidthMinPixels",
      lineWidthScale: "lineWidthScale",
      lineWidthUnits: "lineWidthUnits",
      pointRadiusMaxPixels: "radiusMaxPixels",
      pointRadiusMinPixels: "radiusMinPixels",
      pointRadiusScale: "radiusScale",
      pointRadiusUnits: "radiusUnits",
      pointAntialiasing: "antialiasing",
      pointBillboard: "billboard",
      getFillColor: "getFillColor",
      getLineColor: "getLineColor",
      getLineWidth: "getLineWidth",
      getPointRadius: "getRadius"
    }
  },
  icon: {
    type: icon_layer_default,
    props: {
      iconAtlas: "iconAtlas",
      iconMapping: "iconMapping",
      iconSizeMaxPixels: "sizeMaxPixels",
      iconSizeMinPixels: "sizeMinPixels",
      iconSizeScale: "sizeScale",
      iconSizeUnits: "sizeUnits",
      iconAlphaCutoff: "alphaCutoff",
      iconBillboard: "billboard",
      getIcon: "getIcon",
      getIconAngle: "getAngle",
      getIconColor: "getColor",
      getIconPixelOffset: "getPixelOffset",
      getIconSize: "getSize"
    }
  },
  text: {
    type: text_layer_default,
    props: {
      textSizeMaxPixels: "sizeMaxPixels",
      textSizeMinPixels: "sizeMinPixels",
      textSizeScale: "sizeScale",
      textSizeUnits: "sizeUnits",
      textBackground: "background",
      textBackgroundPadding: "backgroundPadding",
      textFontFamily: "fontFamily",
      textFontWeight: "fontWeight",
      textLineHeight: "lineHeight",
      textMaxWidth: "maxWidth",
      textOutlineColor: "outlineColor",
      textOutlineWidth: "outlineWidth",
      textWordBreak: "wordBreak",
      textCharacterSet: "characterSet",
      textBillboard: "billboard",
      textFontSettings: "fontSettings",
      getText: "getText",
      getTextAngle: "getAngle",
      getTextColor: "getColor",
      getTextPixelOffset: "getPixelOffset",
      getTextSize: "getSize",
      getTextAnchor: "getTextAnchor",
      getTextAlignmentBaseline: "getAlignmentBaseline",
      getTextBackgroundColor: "getBackgroundColor",
      getTextBorderColor: "getBorderColor",
      getTextBorderWidth: "getBorderWidth"
    }
  }
};
var LINE_LAYER = {
  type: path_layer_default,
  props: {
    lineWidthUnits: "widthUnits",
    lineWidthScale: "widthScale",
    lineWidthMinPixels: "widthMinPixels",
    lineWidthMaxPixels: "widthMaxPixels",
    lineJointRounded: "jointRounded",
    lineCapRounded: "capRounded",
    lineMiterLimit: "miterLimit",
    lineBillboard: "billboard",
    getLineColor: "getColor",
    getLineWidth: "getWidth"
  }
};
var POLYGON_LAYER = {
  type: solid_polygon_layer_default,
  props: {
    extruded: "extruded",
    filled: "filled",
    wireframe: "wireframe",
    elevationScale: "elevationScale",
    material: "material",
    _full3d: "_full3d",
    getElevation: "getElevation",
    getFillColor: "getFillColor",
    getLineColor: "getLineColor"
  }
};
function getDefaultProps({ type, props }) {
  const result = {};
  for (const key in props) {
    result[key] = type.defaultProps[props[key]];
  }
  return result;
}
function forwardProps(layer, mapping) {
  const { transitions, updateTriggers } = layer.props;
  const result = {
    updateTriggers: {},
    transitions: transitions && {
      getPosition: transitions.geometry
    }
  };
  for (const sourceKey in mapping) {
    const targetKey = mapping[sourceKey];
    let value = layer.props[sourceKey];
    if (sourceKey.startsWith("get")) {
      value = layer.getSubLayerAccessor(value);
      result.updateTriggers[targetKey] = updateTriggers[sourceKey];
      if (transitions) {
        result.transitions[targetKey] = transitions[sourceKey];
      }
    }
    result[targetKey] = value;
  }
  return result;
}

// dist/geojson-layer/geojson.js
var import_core23 = require("@deck.gl/core");
function getGeojsonFeatures(geojson) {
  if (Array.isArray(geojson)) {
    return geojson;
  }
  import_core23.log.assert(geojson.type, "GeoJSON does not have type");
  switch (geojson.type) {
    case "Feature":
      return [geojson];
    case "FeatureCollection":
      import_core23.log.assert(Array.isArray(geojson.features), "GeoJSON does not have features array");
      return geojson.features;
    default:
      return [{ geometry: geojson }];
  }
}
function separateGeojsonFeatures(features, wrapFeature, dataRange = {}) {
  const separated = {
    pointFeatures: [],
    lineFeatures: [],
    polygonFeatures: [],
    polygonOutlineFeatures: []
  };
  const { startRow = 0, endRow = features.length } = dataRange;
  for (let featureIndex = startRow; featureIndex < endRow; featureIndex++) {
    const feature = features[featureIndex];
    const { geometry } = feature;
    if (!geometry) {
      continue;
    }
    if (geometry.type === "GeometryCollection") {
      import_core23.log.assert(Array.isArray(geometry.geometries), "GeoJSON does not have geometries array");
      const { geometries } = geometry;
      for (let i = 0; i < geometries.length; i++) {
        const subGeometry = geometries[i];
        separateGeometry(subGeometry, separated, wrapFeature, feature, featureIndex);
      }
    } else {
      separateGeometry(geometry, separated, wrapFeature, feature, featureIndex);
    }
  }
  return separated;
}
function separateGeometry(geometry, separated, wrapFeature, sourceFeature, sourceFeatureIndex) {
  const { type, coordinates } = geometry;
  const { pointFeatures, lineFeatures, polygonFeatures, polygonOutlineFeatures } = separated;
  if (!validateGeometry(type, coordinates)) {
    import_core23.log.warn(`${type} coordinates are malformed`)();
    return;
  }
  switch (type) {
    case "Point":
      pointFeatures.push(wrapFeature({
        geometry
      }, sourceFeature, sourceFeatureIndex));
      break;
    case "MultiPoint":
      coordinates.forEach((point) => {
        pointFeatures.push(wrapFeature({
          geometry: { type: "Point", coordinates: point }
        }, sourceFeature, sourceFeatureIndex));
      });
      break;
    case "LineString":
      lineFeatures.push(wrapFeature({
        geometry
      }, sourceFeature, sourceFeatureIndex));
      break;
    case "MultiLineString":
      coordinates.forEach((path) => {
        lineFeatures.push(wrapFeature({
          geometry: { type: "LineString", coordinates: path }
        }, sourceFeature, sourceFeatureIndex));
      });
      break;
    case "Polygon":
      polygonFeatures.push(wrapFeature({
        geometry
      }, sourceFeature, sourceFeatureIndex));
      coordinates.forEach((path) => {
        polygonOutlineFeatures.push(wrapFeature({
          geometry: { type: "LineString", coordinates: path }
        }, sourceFeature, sourceFeatureIndex));
      });
      break;
    case "MultiPolygon":
      coordinates.forEach((polygon) => {
        polygonFeatures.push(wrapFeature({
          geometry: { type: "Polygon", coordinates: polygon }
        }, sourceFeature, sourceFeatureIndex));
        polygon.forEach((path) => {
          polygonOutlineFeatures.push(wrapFeature({
            geometry: { type: "LineString", coordinates: path }
          }, sourceFeature, sourceFeatureIndex));
        });
      });
      break;
    default:
  }
}
var COORDINATE_NEST_LEVEL = {
  Point: 1,
  MultiPoint: 2,
  LineString: 2,
  MultiLineString: 3,
  Polygon: 3,
  MultiPolygon: 4
};
function validateGeometry(type, coordinates) {
  let nestLevel = COORDINATE_NEST_LEVEL[type];
  import_core23.log.assert(nestLevel, `Unknown GeoJSON type ${type}`);
  while (coordinates && --nestLevel > 0) {
    coordinates = coordinates[0];
  }
  return coordinates && Number.isFinite(coordinates[0]);
}

// dist/geojson-layer/geojson-layer-props.js
function createEmptyLayerProps() {
  return {
    points: {},
    lines: {},
    polygons: {},
    polygonsOutline: {}
  };
}
function getCoordinates(f) {
  return f.geometry.coordinates;
}
function createLayerPropsFromFeatures(features, featuresDiff) {
  const layerProps = createEmptyLayerProps();
  const { pointFeatures, lineFeatures, polygonFeatures, polygonOutlineFeatures } = features;
  layerProps.points.data = pointFeatures;
  layerProps.points._dataDiff = featuresDiff.pointFeatures && (() => featuresDiff.pointFeatures);
  layerProps.points.getPosition = getCoordinates;
  layerProps.lines.data = lineFeatures;
  layerProps.lines._dataDiff = featuresDiff.lineFeatures && (() => featuresDiff.lineFeatures);
  layerProps.lines.getPath = getCoordinates;
  layerProps.polygons.data = polygonFeatures;
  layerProps.polygons._dataDiff = featuresDiff.polygonFeatures && (() => featuresDiff.polygonFeatures);
  layerProps.polygons.getPolygon = getCoordinates;
  layerProps.polygonsOutline.data = polygonOutlineFeatures;
  layerProps.polygonsOutline._dataDiff = featuresDiff.polygonOutlineFeatures && (() => featuresDiff.polygonOutlineFeatures);
  layerProps.polygonsOutline.getPath = getCoordinates;
  return layerProps;
}
function createLayerPropsFromBinary(geojsonBinary, encodePickingColor) {
  const layerProps = createEmptyLayerProps();
  const { points, lines, polygons } = geojsonBinary;
  const customPickingColors = calculatePickingColors(geojsonBinary, encodePickingColor);
  layerProps.points.data = {
    length: points.positions.value.length / points.positions.size,
    attributes: {
      ...points.attributes,
      getPosition: points.positions,
      instancePickingColors: {
        size: 4,
        value: customPickingColors.points
      }
    },
    properties: points.properties,
    numericProps: points.numericProps,
    featureIds: points.featureIds
  };
  layerProps.lines.data = {
    length: lines.pathIndices.value.length - 1,
    startIndices: lines.pathIndices.value,
    attributes: {
      ...lines.attributes,
      getPath: lines.positions,
      instancePickingColors: {
        size: 4,
        value: customPickingColors.lines
      }
    },
    properties: lines.properties,
    numericProps: lines.numericProps,
    featureIds: lines.featureIds
  };
  layerProps.lines._pathType = "open";
  layerProps.polygons.data = {
    length: polygons.polygonIndices.value.length - 1,
    startIndices: polygons.polygonIndices.value,
    attributes: {
      ...polygons.attributes,
      getPolygon: polygons.positions,
      pickingColors: {
        size: 4,
        value: customPickingColors.polygons
      }
    },
    properties: polygons.properties,
    numericProps: polygons.numericProps,
    featureIds: polygons.featureIds
  };
  layerProps.polygons._normalize = false;
  if (polygons.triangles) {
    layerProps.polygons.data.attributes.indices = polygons.triangles.value;
  }
  layerProps.polygonsOutline.data = {
    length: polygons.primitivePolygonIndices.value.length - 1,
    startIndices: polygons.primitivePolygonIndices.value,
    attributes: {
      ...polygons.attributes,
      getPath: polygons.positions,
      instancePickingColors: {
        size: 4,
        value: customPickingColors.polygons
      }
    },
    properties: polygons.properties,
    numericProps: polygons.numericProps,
    featureIds: polygons.featureIds
  };
  layerProps.polygonsOutline._pathType = "open";
  return layerProps;
}

// dist/geojson-layer/geojson-layer.js
var FEATURE_TYPES = ["points", "linestrings", "polygons"];
var defaultProps15 = {
  ...getDefaultProps(POINT_LAYER.circle),
  ...getDefaultProps(POINT_LAYER.icon),
  ...getDefaultProps(POINT_LAYER.text),
  ...getDefaultProps(LINE_LAYER),
  ...getDefaultProps(POLYGON_LAYER),
  // Overwrite sub layer defaults
  stroked: true,
  filled: true,
  extruded: false,
  wireframe: false,
  _full3d: false,
  iconAtlas: { type: "object", value: null },
  iconMapping: { type: "object", value: {} },
  getIcon: { type: "accessor", value: (f) => f.properties.icon },
  getText: { type: "accessor", value: (f) => f.properties.text },
  // Self props
  pointType: "circle",
  // TODO: deprecated, remove in v9
  getRadius: { deprecatedFor: "getPointRadius" }
};
var GeoJsonLayer = class extends import_core24.CompositeLayer {
  initializeState() {
    this.state = {
      layerProps: {},
      features: {},
      featuresDiff: {}
    };
  }
  updateState({ props, changeFlags }) {
    if (!changeFlags.dataChanged) {
      return;
    }
    const { data } = this.props;
    const binary = data && "points" in data && "polygons" in data && "lines" in data;
    this.setState({ binary });
    if (binary) {
      this._updateStateBinary({ props, changeFlags });
    } else {
      this._updateStateJSON({ props, changeFlags });
    }
  }
  _updateStateBinary({ props, changeFlags }) {
    const layerProps = createLayerPropsFromBinary(props.data, this.encodePickingColor);
    this.setState({ layerProps });
  }
  _updateStateJSON({ props, changeFlags }) {
    const features = getGeojsonFeatures(props.data);
    const wrapFeature = this.getSubLayerRow.bind(this);
    let newFeatures = {};
    const featuresDiff = {};
    if (Array.isArray(changeFlags.dataChanged)) {
      const oldFeatures = this.state.features;
      for (const key in oldFeatures) {
        newFeatures[key] = oldFeatures[key].slice();
        featuresDiff[key] = [];
      }
      for (const dataRange of changeFlags.dataChanged) {
        const partialFeatures = separateGeojsonFeatures(features, wrapFeature, dataRange);
        for (const key in oldFeatures) {
          featuresDiff[key].push(replaceInRange({
            data: newFeatures[key],
            getIndex: (f) => f.__source.index,
            dataRange,
            replace: partialFeatures[key]
          }));
        }
      }
    } else {
      newFeatures = separateGeojsonFeatures(features, wrapFeature);
    }
    const layerProps = createLayerPropsFromFeatures(newFeatures, featuresDiff);
    this.setState({
      features: newFeatures,
      featuresDiff,
      layerProps
    });
  }
  getPickingInfo(params) {
    const info = super.getPickingInfo(params);
    const { index, sourceLayer } = info;
    info.featureType = FEATURE_TYPES.find((ft) => sourceLayer.id.startsWith(`${this.id}-${ft}-`));
    if (index >= 0 && sourceLayer.id.startsWith(`${this.id}-points-text`) && this.state.binary) {
      info.index = this.props.data.points.globalFeatureIds.value[index];
    }
    return info;
  }
  _updateAutoHighlight(info) {
    const pointLayerIdPrefix = `${this.id}-points-`;
    const sourceIsPoints = info.featureType === "points";
    for (const layer of this.getSubLayers()) {
      if (layer.id.startsWith(pointLayerIdPrefix) === sourceIsPoints) {
        layer.updateAutoHighlight(info);
      }
    }
  }
  _renderPolygonLayer() {
    var _a;
    const { extruded, wireframe } = this.props;
    const { layerProps } = this.state;
    const id = "polygons-fill";
    const PolygonFillLayer = this.shouldRenderSubLayer(id, (_a = layerProps.polygons) == null ? void 0 : _a.data) && this.getSubLayerClass(id, POLYGON_LAYER.type);
    if (PolygonFillLayer) {
      const forwardedProps = forwardProps(this, POLYGON_LAYER.props);
      const useLineColor = extruded && wireframe;
      if (!useLineColor) {
        delete forwardedProps.getLineColor;
      }
      forwardedProps.updateTriggers.lineColors = useLineColor;
      return new PolygonFillLayer(forwardedProps, this.getSubLayerProps({
        id,
        updateTriggers: forwardedProps.updateTriggers
      }), layerProps.polygons);
    }
    return null;
  }
  _renderLineLayers() {
    var _a, _b;
    const { extruded, stroked } = this.props;
    const { layerProps } = this.state;
    const polygonStrokeLayerId = "polygons-stroke";
    const lineStringsLayerId = "linestrings";
    const PolygonStrokeLayer = !extruded && stroked && this.shouldRenderSubLayer(polygonStrokeLayerId, (_a = layerProps.polygonsOutline) == null ? void 0 : _a.data) && this.getSubLayerClass(polygonStrokeLayerId, LINE_LAYER.type);
    const LineStringsLayer = this.shouldRenderSubLayer(lineStringsLayerId, (_b = layerProps.lines) == null ? void 0 : _b.data) && this.getSubLayerClass(lineStringsLayerId, LINE_LAYER.type);
    if (PolygonStrokeLayer || LineStringsLayer) {
      const forwardedProps = forwardProps(this, LINE_LAYER.props);
      return [
        PolygonStrokeLayer && new PolygonStrokeLayer(forwardedProps, this.getSubLayerProps({
          id: polygonStrokeLayerId,
          updateTriggers: forwardedProps.updateTriggers
        }), layerProps.polygonsOutline),
        LineStringsLayer && new LineStringsLayer(forwardedProps, this.getSubLayerProps({
          id: lineStringsLayerId,
          updateTriggers: forwardedProps.updateTriggers
        }), layerProps.lines)
      ];
    }
    return null;
  }
  _renderPointLayers() {
    var _a;
    const { pointType } = this.props;
    const { layerProps, binary } = this.state;
    let { highlightedObjectIndex } = this.props;
    if (!binary && Number.isFinite(highlightedObjectIndex)) {
      highlightedObjectIndex = layerProps.points.data.findIndex((d) => d.__source.index === highlightedObjectIndex);
    }
    const types = new Set(pointType.split("+"));
    const pointLayers = [];
    for (const type of types) {
      const id = `points-${type}`;
      const PointLayerMapping = POINT_LAYER[type];
      const PointsLayer = PointLayerMapping && this.shouldRenderSubLayer(id, (_a = layerProps.points) == null ? void 0 : _a.data) && this.getSubLayerClass(id, PointLayerMapping.type);
      if (PointsLayer) {
        const forwardedProps = forwardProps(this, PointLayerMapping.props);
        let pointsLayerProps = layerProps.points;
        if (type === "text" && binary) {
          const { instancePickingColors, ...rest } = pointsLayerProps.data.attributes;
          pointsLayerProps = {
            ...pointsLayerProps,
            // @ts-expect-error TODO - type binary data
            data: { ...pointsLayerProps.data, attributes: rest }
          };
        }
        pointLayers.push(new PointsLayer(forwardedProps, this.getSubLayerProps({
          id,
          updateTriggers: forwardedProps.updateTriggers,
          highlightedObjectIndex
        }), pointsLayerProps));
      }
    }
    return pointLayers;
  }
  renderLayers() {
    const { extruded } = this.props;
    const polygonFillLayer = this._renderPolygonLayer();
    const lineLayers = this._renderLineLayers();
    const pointLayers = this._renderPointLayers();
    return [
      // If not extruded: flat fill layer is drawn below outlines
      !extruded && polygonFillLayer,
      lineLayers,
      pointLayers,
      // If extruded: draw fill layer last for correct blending behavior
      extruded && polygonFillLayer
    ];
  }
  getSubLayerAccessor(accessor) {
    const { binary } = this.state;
    if (!binary || typeof accessor !== "function") {
      return super.getSubLayerAccessor(accessor);
    }
    return (object, info) => {
      const { data, index } = info;
      const feature = binaryToFeatureForAccesor(data, index);
      return accessor(feature, info);
    };
  }
};
GeoJsonLayer.layerName = "GeoJsonLayer";
GeoJsonLayer.defaultProps = defaultProps15;
var geojson_layer_default = GeoJsonLayer;
//# sourceMappingURL=index.cjs.map
