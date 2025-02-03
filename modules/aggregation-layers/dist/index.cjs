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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// dist/index.js
var dist_exports = {};
__export(dist_exports, {
  CPUAggregator: () => CPUAggregator,
  ContourLayer: () => contour_layer_default,
  GridLayer: () => grid_layer_default,
  HeatmapLayer: () => heatmap_layer_default,
  HexagonLayer: () => hexagon_layer_default,
  ScreenGridLayer: () => screen_grid_layer_default,
  WebGLAggregator: () => WebGLAggregator,
  _AggregationLayer: () => aggregation_layer_default
});
module.exports = __toCommonJS(dist_exports);

// dist/screen-grid-layer/screen-grid-layer.js
var import_core5 = require("@deck.gl/core");

// dist/common/aggregator/cpu-aggregator/cpu-aggregator.js
var import_core = require("@deck.gl/core");

// dist/common/aggregator/cpu-aggregator/sort-bins.js
function sortBins({ pointCount, getBinId }) {
  const binsById = /* @__PURE__ */ new Map();
  for (let i = 0; i < pointCount; i++) {
    const id = getBinId(i);
    if (id === null) {
      continue;
    }
    let bin = binsById.get(String(id));
    if (bin) {
      bin.points.push(i);
    } else {
      bin = {
        id,
        index: binsById.size,
        points: [i]
      };
      binsById.set(String(id), bin);
    }
  }
  return Array.from(binsById.values());
}
function packBinIds({ bins, dimensions, target }) {
  const targetLength = bins.length * dimensions;
  if (!target || target.length < targetLength) {
    target = new Float32Array(targetLength);
  }
  for (let i = 0; i < bins.length; i++) {
    const { id } = bins[i];
    if (Array.isArray(id)) {
      target.set(id, i * dimensions);
    } else {
      target[i] = id;
    }
  }
  return target;
}

// dist/common/aggregator/cpu-aggregator/aggregate.js
var count = (pointIndices) => {
  return pointIndices.length;
};
var sum = (pointIndices, getValue) => {
  let result = 0;
  for (const i of pointIndices) {
    result += getValue(i);
  }
  return result;
};
var mean = (pointIndices, getValue) => {
  if (pointIndices.length === 0) {
    return NaN;
  }
  return sum(pointIndices, getValue) / pointIndices.length;
};
var min = (pointIndices, getValue) => {
  let result = Infinity;
  for (const i of pointIndices) {
    const value = getValue(i);
    if (value < result) {
      result = value;
    }
  }
  return result;
};
var max = (pointIndices, getValue) => {
  let result = -Infinity;
  for (const i of pointIndices) {
    const value = getValue(i);
    if (value > result) {
      result = value;
    }
  }
  return result;
};
var BUILT_IN_OPERATIONS = {
  COUNT: count,
  SUM: sum,
  MEAN: mean,
  MIN: min,
  MAX: max
};
function aggregate({ bins, getValue, operation, target }) {
  if (!target || target.length < bins.length) {
    target = new Float32Array(bins.length);
  }
  let min2 = Infinity;
  let max2 = -Infinity;
  for (let j = 0; j < bins.length; j++) {
    const { points } = bins[j];
    target[j] = operation(points, getValue);
    if (target[j] < min2)
      min2 = target[j];
    if (target[j] > max2)
      max2 = target[j];
  }
  return { value: target, domain: [min2, max2] };
}

// dist/common/aggregator/cpu-aggregator/vertex-accessor.js
function evaluateVertexAccessor(accessor, attributes, options) {
  const vertexReaders = {};
  for (const id of accessor.sources || []) {
    const attribute = attributes[id];
    if (attribute) {
      vertexReaders[id] = getVertexReader(attribute);
    } else {
      throw new Error(`Cannot find attribute ${id}`);
    }
  }
  const data = {};
  return (vertexIndex) => {
    for (const id in vertexReaders) {
      data[id] = vertexReaders[id](vertexIndex);
    }
    return accessor.getValue(data, vertexIndex, options);
  };
}
function getVertexReader(attribute) {
  const value = attribute.value;
  const { offset = 0, stride, size } = attribute.getAccessor();
  const bytesPerElement = value.BYTES_PER_ELEMENT;
  const elementOffset = offset / bytesPerElement;
  const elementStride = stride ? stride / bytesPerElement : size;
  if (size === 1) {
    if (attribute.isConstant) {
      return () => value[0];
    }
    return (vertexIndex) => {
      const i = elementOffset + elementStride * vertexIndex;
      return value[i];
    };
  }
  let result;
  if (attribute.isConstant) {
    result = Array.from(value);
    return () => result;
  }
  result = new Array(size);
  return (vertexIndex) => {
    const i = elementOffset + elementStride * vertexIndex;
    for (let j = 0; j < size; j++) {
      result[j] = value[i + j];
    }
    return result;
  };
}

// dist/common/aggregator/cpu-aggregator/cpu-aggregator.js
var CPUAggregator = class {
  constructor(props) {
    this.bins = [];
    this.binIds = null;
    this.results = [];
    this.dimensions = props.dimensions;
    this.channelCount = props.getValue.length;
    this.props = {
      ...props,
      binOptions: {},
      pointCount: 0,
      operations: [],
      customOperations: [],
      attributes: {}
    };
    this.needsUpdate = true;
    this.setProps(props);
  }
  destroy() {
  }
  get binCount() {
    return this.bins.length;
  }
  /** Update aggregation props */
  setProps(props) {
    const oldProps = this.props;
    if (props.binOptions) {
      if (!(0, import_core._deepEqual)(props.binOptions, oldProps.binOptions, 2)) {
        this.setNeedsUpdate();
      }
    }
    if (props.operations) {
      for (let channel = 0; channel < this.channelCount; channel++) {
        if (props.operations[channel] !== oldProps.operations[channel]) {
          this.setNeedsUpdate(channel);
        }
      }
    }
    if (props.customOperations) {
      for (let channel = 0; channel < this.channelCount; channel++) {
        if (Boolean(props.customOperations[channel]) !== Boolean(oldProps.customOperations[channel])) {
          this.setNeedsUpdate(channel);
        }
      }
    }
    if (props.pointCount !== void 0 && props.pointCount !== oldProps.pointCount) {
      this.setNeedsUpdate();
    }
    if (props.attributes) {
      props.attributes = { ...oldProps.attributes, ...props.attributes };
    }
    Object.assign(this.props, props);
  }
  /** Flags a channel to need update
   * This is called internally by setProps() if certain props change
   * Users of this class still need to manually set the dirty flag sometimes, because even if no props changed
   * the underlying buffers could have been updated and require rerunning the aggregation
   * @param {number} channel - mark the given channel as dirty. If not provided, all channels will be updated.
   */
  setNeedsUpdate(channel) {
    if (channel === void 0) {
      this.needsUpdate = true;
    } else if (this.needsUpdate !== true) {
      this.needsUpdate = this.needsUpdate || [];
      this.needsUpdate[channel] = true;
    }
  }
  /** Run aggregation */
  update() {
    var _a, _b, _c, _d;
    if (this.needsUpdate === true) {
      this.bins = sortBins({
        pointCount: this.props.pointCount,
        getBinId: evaluateVertexAccessor(this.props.getBin, this.props.attributes, this.props.binOptions)
      });
      const value = packBinIds({
        bins: this.bins,
        dimensions: this.dimensions,
        // Reuse allocated typed array
        target: (_a = this.binIds) == null ? void 0 : _a.value
      });
      this.binIds = { value, type: "float32", size: this.dimensions };
    }
    for (let channel = 0; channel < this.channelCount; channel++) {
      if (this.needsUpdate === true || this.needsUpdate[channel]) {
        const operation = this.props.customOperations[channel] || BUILT_IN_OPERATIONS[this.props.operations[channel]];
        const { value, domain } = aggregate({
          bins: this.bins,
          getValue: evaluateVertexAccessor(this.props.getValue[channel], this.props.attributes, void 0),
          operation,
          // Reuse allocated typed array
          target: (_b = this.results[channel]) == null ? void 0 : _b.value
        });
        this.results[channel] = { value, domain, type: "float32", size: 1 };
        (_d = (_c = this.props).onUpdate) == null ? void 0 : _d.call(_c, { channel });
      }
    }
    this.needsUpdate = false;
  }
  preDraw() {
  }
  /** Returns an accessor to the bins. */
  getBins() {
    return this.binIds;
  }
  /** Returns an accessor to the output for a given channel. */
  getResult(channel) {
    return this.results[channel];
  }
  /** Returns the [min, max] of aggregated values for a given channel. */
  getResultDomain(channel) {
    var _a;
    return ((_a = this.results[channel]) == null ? void 0 : _a.domain) ?? [Infinity, -Infinity];
  }
  /** Returns the information for a given bin. */
  getBin(index) {
    const bin = this.bins[index];
    if (!bin) {
      return null;
    }
    const value = new Array(this.channelCount);
    for (let i = 0; i < value.length; i++) {
      const result = this.results[i];
      value[i] = result == null ? void 0 : result.value[index];
    }
    return {
      id: bin.id,
      value,
      count: bin.points.length,
      pointIndices: bin.points
    };
  }
};

// dist/common/aggregator/gpu-aggregator/webgl-bin-sorter.js
var import_engine = require("@luma.gl/engine");

// dist/common/aggregator/gpu-aggregator/utils.js
function createRenderTarget(device, width, height) {
  return device.createFramebuffer({
    width,
    height,
    colorAttachments: [
      device.createTexture({
        width,
        height,
        format: "rgba32float",
        mipmaps: false,
        sampler: {
          minFilter: "nearest",
          magFilter: "nearest"
        }
      })
    ]
  });
}

// dist/common/aggregator/gpu-aggregator/bin-sorter-uniforms.js
var uniformBlock = (
  /* glsl */
  `uniform binSorterUniforms {
  ivec4 binIdRange;
  ivec2 targetSize;
} binSorter;
`
);
var binSorterUniforms = {
  name: "binSorter",
  vs: uniformBlock,
  uniformTypes: {
    binIdRange: "vec4<i32>",
    targetSize: "vec2<i32>"
  }
};

// dist/common/aggregator/gpu-aggregator/webgl-bin-sorter.js
var COLOR_CHANNELS = [1, 2, 4, 8];
var MAX_FLOAT32 = 3e38;
var EMPTY_MASKS = { SUM: 0, MEAN: 0, MIN: 0, MAX: 0, COUNT: 0 };
var TEXTURE_WIDTH = 1024;
var WebGLBinSorter = class {
  constructor(device, props) {
    this.binsFBO = null;
    this.device = device;
    this.model = createModel(device, props);
  }
  get texture() {
    return this.binsFBO ? this.binsFBO.colorAttachments[0].texture : null;
  }
  destroy() {
    var _a, _b;
    this.model.destroy();
    (_a = this.binsFBO) == null ? void 0 : _a.colorAttachments[0].texture.destroy();
    (_b = this.binsFBO) == null ? void 0 : _b.destroy();
  }
  getBinValues(index) {
    if (!this.binsFBO) {
      return null;
    }
    const x = index % TEXTURE_WIDTH;
    const y = Math.floor(index / TEXTURE_WIDTH);
    const buffer = this.device.readPixelsToArrayWebGL(this.binsFBO, {
      sourceX: x,
      sourceY: y,
      sourceWidth: 1,
      sourceHeight: 1
    }).buffer;
    return new Float32Array(buffer);
  }
  setDimensions(binCount, binIdRange) {
    var _a, _b;
    const width = TEXTURE_WIDTH;
    const height = Math.ceil(binCount / width);
    if (!this.binsFBO) {
      this.binsFBO = createRenderTarget(this.device, width, height);
    } else if (this.binsFBO.height < height) {
      this.binsFBO.resize({ width, height });
    }
    const binSorterProps = {
      binIdRange: [
        binIdRange[0][0],
        binIdRange[0][1],
        ((_a = binIdRange[1]) == null ? void 0 : _a[0]) || 0,
        ((_b = binIdRange[1]) == null ? void 0 : _b[1]) || 0
      ],
      targetSize: [this.binsFBO.width, this.binsFBO.height]
    };
    this.model.shaderInputs.setProps({ binSorter: binSorterProps });
  }
  setModelProps(props) {
    const model = this.model;
    if (props.attributes) {
      model.setAttributes(props.attributes);
    }
    if (props.constantAttributes) {
      model.setConstantAttributes(props.constantAttributes);
    }
    if (props.vertexCount !== void 0) {
      model.setVertexCount(props.vertexCount);
    }
    if (props.shaderModuleProps) {
      model.shaderInputs.setProps(props.shaderModuleProps);
    }
  }
  /** Update aggregation */
  update(operations) {
    if (!this.binsFBO) {
      return;
    }
    const masks = getMaskByOperation(operations);
    this._updateBins("SUM", masks.SUM + masks.MEAN);
    this._updateBins("MIN", masks.MIN);
    this._updateBins("MAX", masks.MAX);
  }
  /** Recalculate aggregation on the given channels using the given operation */
  _updateBins(operation, colorMask) {
    if (colorMask === 0) {
      return;
    }
    colorMask |= COLOR_CHANNELS[3];
    const model = this.model;
    const target = this.binsFBO;
    const initialValue = operation === "MAX" ? -MAX_FLOAT32 : operation === "MIN" ? MAX_FLOAT32 : 0;
    const renderPass = this.device.beginRenderPass({
      id: `gpu-aggregation-${operation}`,
      framebuffer: target,
      parameters: {
        viewport: [0, 0, target.width, target.height],
        colorMask
      },
      clearColor: [initialValue, initialValue, initialValue, 0],
      clearDepth: false,
      clearStencil: false
    });
    model.setParameters({
      blend: true,
      blendColorSrcFactor: "one",
      blendColorDstFactor: "one",
      blendAlphaSrcFactor: "one",
      blendAlphaDstFactor: "one",
      blendColorOperation: operation === "MAX" ? "max" : operation === "MIN" ? "min" : "add",
      blendAlphaOperation: "add"
    });
    model.draw(renderPass);
    renderPass.end();
  }
};
function getMaskByOperation(operations) {
  const result = { ...EMPTY_MASKS };
  for (let channel = 0; channel < operations.length; channel++) {
    const op = operations[channel];
    if (op) {
      result[op] += COLOR_CHANNELS[channel];
    }
  }
  return result;
}
function createModel(device, props) {
  let userVs = props.vs;
  if (props.dimensions === 2) {
    userVs += /* glsl */
    `
void getBin(out int binId) {
  ivec2 binId2;
  getBin(binId2);
  if (binId2.x < binSorter.binIdRange.x || binId2.x >= binSorter.binIdRange.y) {
    binId = -1;
  } else {
    binId = (binId2.y - binSorter.binIdRange.z) * (binSorter.binIdRange.y - binSorter.binIdRange.x) + binId2.x;
  }
}
`;
  }
  const vs = `#version 300 es
#define SHADER_NAME gpu-aggregation-sort-bins-vertex

${userVs}

out vec3 v_Value;

void main() {
  int binIndex;
  getBin(binIndex);
  binIndex = binIndex - binSorter.binIdRange.x;
  if (binIndex < 0) {
    gl_Position = vec4(0.);
    return;
  }
  int row = binIndex / binSorter.targetSize.x;
  int col = binIndex - row * binSorter.targetSize.x;
  vec2 position = (vec2(col, row) + 0.5) / vec2(binSorter.targetSize) * 2.0 - 1.0;
  gl_Position = vec4(position, 0.0, 1.0);
  gl_PointSize = 1.0;

#if NUM_CHANNELS == 3
  getValue(v_Value);
#elif NUM_CHANNELS == 2
  getValue(v_Value.xy);
#else
  getValue(v_Value.x);
#endif
}
`;
  const fs = (
    /* glsl */
    `#version 300 es
#define SHADER_NAME gpu-aggregation-sort-bins-fragment

precision highp float;

in vec3 v_Value;
out vec4 fragColor;

void main() {
  fragColor.xyz = v_Value;

  #ifdef MODULE_GEOMETRY
  geometry.uv = vec2(0.);
  DECKGL_FILTER_COLOR(fragColor, geometry);
  #endif

  fragColor.w = 1.0;
}
`
  );
  const model = new import_engine.Model(device, {
    bufferLayout: props.bufferLayout,
    modules: [...props.modules || [], binSorterUniforms],
    defines: { ...props.defines, NON_INSTANCED_MODEL: 1, NUM_CHANNELS: props.channelCount },
    isInstanced: false,
    vs,
    fs,
    topology: "point-list",
    disableWarnings: true
  });
  return model;
}

// dist/common/aggregator/gpu-aggregator/webgl-aggregation-transform.js
var import_engine2 = require("@luma.gl/engine");

// dist/common/aggregator/gpu-aggregator/aggregation-transform-uniforms.js
var uniformBlock2 = (
  /* glsl */
  `uniform aggregatorTransformUniforms {
  ivec4 binIdRange;
  bvec3 isCount;
  bvec3 isMean;
  float naN;
} aggregatorTransform;
`
);
var aggregatorTransformUniforms = {
  name: "aggregatorTransform",
  vs: uniformBlock2,
  uniformTypes: {
    binIdRange: "vec4<i32>",
    isCount: "vec3<f32>",
    isMean: "vec3<f32>"
  }
};

// dist/common/aggregator/gpu-aggregator/webgl-aggregation-transform.js
var MAX_FLOAT322 = 3e38;
var WebGLAggregationTransform = class {
  constructor(device, props) {
    this.binBuffer = null;
    this.valueBuffer = null;
    this._domains = null;
    this.device = device;
    this.channelCount = props.channelCount;
    this.transform = createTransform(device, props);
    this.domainFBO = createRenderTarget(device, 2, 1);
  }
  destroy() {
    var _a, _b;
    this.transform.destroy();
    (_a = this.binBuffer) == null ? void 0 : _a.destroy();
    (_b = this.valueBuffer) == null ? void 0 : _b.destroy();
    this.domainFBO.colorAttachments[0].texture.destroy();
    this.domainFBO.destroy();
  }
  get domains() {
    if (!this._domains) {
      const buffer = this.device.readPixelsToArrayWebGL(this.domainFBO).buffer;
      const domain = new Float32Array(buffer);
      this._domains = [
        [-domain[4], domain[0]],
        [-domain[5], domain[1]],
        [-domain[6], domain[2]]
      ].slice(0, this.channelCount);
    }
    return this._domains;
  }
  setDimensions(binCount, binIdRange) {
    var _a, _b, _c, _d;
    const { model, transformFeedback } = this.transform;
    model.setVertexCount(binCount);
    const aggregatorTransformProps = {
      binIdRange: [
        binIdRange[0][0],
        binIdRange[0][1],
        ((_a = binIdRange[1]) == null ? void 0 : _a[0]) || 0,
        ((_b = binIdRange[1]) == null ? void 0 : _b[1]) || 0
      ]
    };
    model.shaderInputs.setProps({ aggregatorTransform: aggregatorTransformProps });
    const binBufferByteLength = binCount * binIdRange.length * 4;
    if (!this.binBuffer || this.binBuffer.byteLength < binBufferByteLength) {
      (_c = this.binBuffer) == null ? void 0 : _c.destroy();
      this.binBuffer = this.device.createBuffer({ byteLength: binBufferByteLength });
      transformFeedback.setBuffer("binIds", this.binBuffer);
    }
    const valueBufferByteLength = binCount * this.channelCount * 4;
    if (!this.valueBuffer || this.valueBuffer.byteLength < valueBufferByteLength) {
      (_d = this.valueBuffer) == null ? void 0 : _d.destroy();
      this.valueBuffer = this.device.createBuffer({ byteLength: valueBufferByteLength });
      transformFeedback.setBuffer("values", this.valueBuffer);
    }
  }
  update(bins, operations) {
    if (!bins) {
      return;
    }
    const transform = this.transform;
    const target = this.domainFBO;
    const isCount = [0, 1, 2].map((i) => operations[i] === "COUNT" ? 1 : 0);
    const isMean = [0, 1, 2].map((i) => operations[i] === "MEAN" ? 1 : 0);
    const aggregatorTransformProps = {
      isCount,
      isMean,
      bins
    };
    transform.model.shaderInputs.setProps({ aggregatorTransform: aggregatorTransformProps });
    transform.run({
      id: "gpu-aggregation-domain",
      framebuffer: target,
      parameters: {
        viewport: [0, 0, 2, 1]
      },
      clearColor: [-MAX_FLOAT322, -MAX_FLOAT322, -MAX_FLOAT322, 0],
      clearDepth: false,
      clearStencil: false
    });
    this._domains = null;
  }
};
function createTransform(device, props) {
  const vs = (
    /* glsl */
    `#version 300 es
#define SHADER_NAME gpu-aggregation-domain-vertex

uniform sampler2D bins;

#if NUM_DIMS == 1
out float binIds;
#else
out vec2 binIds;
#endif

#if NUM_CHANNELS == 1
flat out float values;
#elif NUM_CHANNELS == 2
flat out vec2 values;
#else
flat out vec3 values;
#endif

const float NAN = intBitsToFloat(-1);

void main() {
  int row = gl_VertexID / SAMPLER_WIDTH;
  int col = gl_VertexID - row * SAMPLER_WIDTH;
  vec4 weights = texelFetch(bins, ivec2(col, row), 0);
  vec3 value3 = mix(
    mix(weights.rgb, vec3(weights.a), aggregatorTransform.isCount),
    weights.rgb / max(weights.a, 1.0),
    aggregatorTransform.isMean
  );
  if (weights.a == 0.0) {
    value3 = vec3(NAN);
  }

#if NUM_DIMS == 1
  binIds = float(gl_VertexID + aggregatorTransform.binIdRange.x);
#else
  int y = gl_VertexID / (aggregatorTransform.binIdRange.y - aggregatorTransform.binIdRange.x);
  int x = gl_VertexID - y * (aggregatorTransform.binIdRange.y - aggregatorTransform.binIdRange.x);
  binIds.y = float(y + aggregatorTransform.binIdRange.z);
  binIds.x = float(x + aggregatorTransform.binIdRange.x);
#endif

#if NUM_CHANNELS == 3
  values = value3;
#elif NUM_CHANNELS == 2
  values = value3.xy;
#else
  values = value3.x;
#endif

  gl_Position = vec4(0., 0., 0., 1.);
  // This model renders into a 2x1 texture to obtain min and max simultaneously.
  // See comments in fragment shader
  gl_PointSize = 2.0;
}
`
  );
  const fs = (
    /* glsl */
    `#version 300 es
#define SHADER_NAME gpu-aggregation-domain-fragment

precision highp float;

#if NUM_CHANNELS == 1
flat in float values;
#elif NUM_CHANNELS == 2
flat in vec2 values;
#else
flat in vec3 values;
#endif

out vec4 fragColor;

void main() {
  vec3 value3;
#if NUM_CHANNELS == 3
  value3 = values;
#elif NUM_CHANNELS == 2
  value3.xy = values;
#else
  value3.x = values;
#endif
  if (isnan(value3.x)) discard;
  // This shader renders into a 2x1 texture with blending=max
  // The left pixel yields the max value of each channel
  // The right pixel yields the min value of each channel
  if (gl_FragCoord.x < 1.0) {
    fragColor = vec4(value3, 1.0);
  } else {
    fragColor = vec4(-value3, 1.0);
  }
}
`
  );
  return new import_engine2.BufferTransform(device, {
    vs,
    fs,
    topology: "point-list",
    modules: [aggregatorTransformUniforms],
    parameters: {
      blend: true,
      blendColorSrcFactor: "one",
      blendColorDstFactor: "one",
      blendColorOperation: "max",
      blendAlphaSrcFactor: "one",
      blendAlphaDstFactor: "one",
      blendAlphaOperation: "max"
    },
    defines: {
      NUM_DIMS: props.dimensions,
      NUM_CHANNELS: props.channelCount,
      SAMPLER_WIDTH: TEXTURE_WIDTH
    },
    varyings: ["binIds", "values"],
    disableWarnings: true
  });
}

// dist/common/aggregator/gpu-aggregator/webgl-aggregator.js
var import_core2 = require("@deck.gl/core");
var WebGLAggregator = class {
  /** Checks if the current device supports GPU aggregation */
  static isSupported(device) {
    return device.features.has("float32-renderable-webgl") && device.features.has("texture-blend-float-webgl");
  }
  constructor(device, props) {
    this.binCount = 0;
    this.binIds = null;
    this.results = [];
    this.device = device;
    this.dimensions = props.dimensions;
    this.channelCount = props.channelCount;
    this.props = {
      ...props,
      pointCount: 0,
      binIdRange: [[0, 0]],
      operations: [],
      attributes: {},
      binOptions: {}
    };
    this.needsUpdate = new Array(this.channelCount).fill(true);
    this.binSorter = new WebGLBinSorter(device, props);
    this.aggregationTransform = new WebGLAggregationTransform(device, props);
    this.setProps(props);
  }
  getBins() {
    var _a;
    const buffer = this.aggregationTransform.binBuffer;
    if (!buffer) {
      return null;
    }
    if (((_a = this.binIds) == null ? void 0 : _a.buffer) !== buffer) {
      this.binIds = { buffer, type: "float32", size: this.dimensions };
    }
    return this.binIds;
  }
  /** Returns an accessor to the output for a given channel. */
  getResult(channel) {
    var _a;
    const buffer = this.aggregationTransform.valueBuffer;
    if (!buffer || channel >= this.channelCount) {
      return null;
    }
    if (((_a = this.results[channel]) == null ? void 0 : _a.buffer) !== buffer) {
      this.results[channel] = {
        buffer,
        type: "float32",
        size: 1,
        stride: this.channelCount * 4,
        offset: channel * 4
      };
    }
    return this.results[channel];
  }
  /** Returns the [min, max] of aggregated values for a given channel. */
  getResultDomain(channel) {
    return this.aggregationTransform.domains[channel];
  }
  /** Returns the information for a given bin. */
  getBin(index) {
    if (index < 0 || index >= this.binCount) {
      return null;
    }
    const { binIdRange } = this.props;
    let id;
    if (this.dimensions === 1) {
      id = [index + binIdRange[0][0]];
    } else {
      const [[x0, x1], [y0]] = binIdRange;
      const width = x1 - x0;
      id = [index % width + x0, Math.floor(index / width) + y0];
    }
    const pixel = this.binSorter.getBinValues(index);
    if (!pixel) {
      return null;
    }
    const count2 = pixel[3];
    const value = [];
    for (let channel = 0; channel < this.channelCount; channel++) {
      const operation = this.props.operations[channel];
      if (operation === "COUNT") {
        value[channel] = count2;
      } else if (count2 === 0) {
        value[channel] = NaN;
      } else {
        value[channel] = operation === "MEAN" ? pixel[channel] / count2 : pixel[channel];
      }
    }
    return { id, value, count: count2 };
  }
  /** Release GPU resources */
  destroy() {
    this.binSorter.destroy();
    this.aggregationTransform.destroy();
  }
  /** Update aggregation props. Normalize prop values and set change flags. */
  setProps(props) {
    const oldProps = this.props;
    if ("binIdRange" in props && !(0, import_core2._deepEqual)(props.binIdRange, oldProps.binIdRange, 2)) {
      const binIdRange = props.binIdRange;
      import_core2.log.assert(binIdRange.length === this.dimensions);
      if (this.dimensions === 1) {
        const [[x0, x1]] = binIdRange;
        this.binCount = x1 - x0;
      } else {
        const [[x0, x1], [y0, y1]] = binIdRange;
        this.binCount = (x1 - x0) * (y1 - y0);
      }
      this.binSorter.setDimensions(this.binCount, binIdRange);
      this.aggregationTransform.setDimensions(this.binCount, binIdRange);
      this.setNeedsUpdate();
    }
    if (props.operations) {
      for (let channel = 0; channel < this.channelCount; channel++) {
        if (props.operations[channel] !== oldProps.operations[channel]) {
          this.setNeedsUpdate(channel);
        }
      }
    }
    if (props.pointCount !== void 0 && props.pointCount !== oldProps.pointCount) {
      this.binSorter.setModelProps({ vertexCount: props.pointCount });
      this.setNeedsUpdate();
    }
    if (props.binOptions) {
      if (!(0, import_core2._deepEqual)(props.binOptions, oldProps.binOptions, 2)) {
        this.setNeedsUpdate();
      }
      this.binSorter.model.shaderInputs.setProps({ binOptions: props.binOptions });
    }
    if (props.attributes) {
      const attributeBuffers = {};
      const constantAttributes = {};
      for (const attribute of Object.values(props.attributes)) {
        for (const [attributeName, value] of Object.entries(attribute.getValue())) {
          if (ArrayBuffer.isView(value)) {
            constantAttributes[attributeName] = value;
          } else if (value) {
            attributeBuffers[attributeName] = value;
          }
        }
      }
      this.binSorter.setModelProps({ attributes: attributeBuffers, constantAttributes });
    }
    if (props.shaderModuleProps) {
      this.binSorter.setModelProps({ shaderModuleProps: props.shaderModuleProps });
    }
    Object.assign(this.props, props);
  }
  /** Flags a channel to need update.
   * This is called internally by setProps() if certain props change
   * Users of this class still need to manually set the dirty flag sometimes, because even if no props changed
   * the underlying buffers could have been updated and require rerunning the aggregation
   * @param {number} channel - mark the given channel as dirty. If not provided, all channels will be updated.
   */
  setNeedsUpdate(channel) {
    if (channel === void 0) {
      this.needsUpdate.fill(true);
    } else {
      this.needsUpdate[channel] = true;
    }
  }
  update() {
  }
  /** Run aggregation */
  preDraw() {
    var _a, _b;
    if (!this.needsUpdate.some(Boolean)) {
      return;
    }
    const { operations } = this.props;
    const operationsToUpdate = this.needsUpdate.map((needsUpdate, i) => needsUpdate ? operations[i] : null);
    this.binSorter.update(operationsToUpdate);
    this.aggregationTransform.update(this.binSorter.texture, operations);
    for (let i = 0; i < this.channelCount; i++) {
      if (this.needsUpdate[i]) {
        this.needsUpdate[i] = false;
        (_b = (_a = this.props).onUpdate) == null ? void 0 : _b.call(_a, { channel: i });
      }
    }
  }
};

// dist/common/aggregation-layer.js
var import_core3 = require("@deck.gl/core");
var AggregationLayer = class extends import_core3.CompositeLayer {
  /** Allow this layer to participates in the draw cycle */
  get isDrawable() {
    return true;
  }
  initializeState() {
    this.getAttributeManager().remove(["instancePickingColors"]);
  }
  // Extend Layer.updateState to update the Aggregator instance
  // returns true if aggregator is changed
  updateState(params) {
    var _a, _b;
    super.updateState(params);
    const aggregatorType = this.getAggregatorType();
    if (params.changeFlags.extensionsChanged || this.state.aggregatorType !== aggregatorType) {
      (_a = this.state.aggregator) == null ? void 0 : _a.destroy();
      const aggregator = this.createAggregator(aggregatorType);
      aggregator.setProps({
        attributes: (_b = this.getAttributeManager()) == null ? void 0 : _b.attributes
      });
      this.setState({ aggregator, aggregatorType });
      return true;
    }
    return false;
  }
  // Override Layer.finalizeState to dispose the Aggregator instance
  finalizeState(context) {
    super.finalizeState(context);
    this.state.aggregator.destroy();
  }
  // Override Layer.updateAttributes to update the aggregator
  updateAttributes(changedAttributes) {
    const { aggregator } = this.state;
    aggregator.setProps({
      attributes: changedAttributes
    });
    for (const id in changedAttributes) {
      this.onAttributeChange(id);
    }
    aggregator.update();
  }
  draw({ shaderModuleProps }) {
    const { aggregator } = this.state;
    aggregator.setProps({ shaderModuleProps });
    aggregator.preDraw();
  }
  // override CompositeLayer._getAttributeManager to create AttributeManager instance
  _getAttributeManager() {
    return new import_core3.AttributeManager(this.context.device, {
      id: this.props.id,
      stats: this.context.stats
    });
  }
};
AggregationLayer.layerName = "AggregationLayer";
var aggregation_layer_default = AggregationLayer;

// dist/screen-grid-layer/screen-grid-cell-layer.js
var import_engine3 = require("@luma.gl/engine");
var import_core4 = require("@deck.gl/core");

// dist/common/utils/color-utils.js
var defaultColorRange = [
  [255, 255, 178],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [240, 59, 32],
  [189, 0, 38]
];
function colorRangeToFlatArray(colorRange, normalize = false, ArrayType = Float32Array) {
  let flatArray;
  if (Number.isFinite(colorRange[0])) {
    flatArray = new ArrayType(colorRange);
  } else {
    flatArray = new ArrayType(colorRange.length * 4);
    let index = 0;
    for (let i = 0; i < colorRange.length; i++) {
      const color = colorRange[i];
      flatArray[index++] = color[0];
      flatArray[index++] = color[1];
      flatArray[index++] = color[2];
      flatArray[index++] = Number.isFinite(color[3]) ? color[3] : 255;
    }
  }
  if (normalize) {
    for (let i = 0; i < flatArray.length; i++) {
      flatArray[i] /= 255;
    }
  }
  return flatArray;
}
var COLOR_RANGE_FILTER = {
  linear: "linear",
  quantile: "nearest",
  quantize: "nearest",
  ordinal: "nearest"
};
function updateColorRangeTexture(texture, type) {
  texture.setSampler({
    minFilter: COLOR_RANGE_FILTER[type],
    magFilter: COLOR_RANGE_FILTER[type]
  });
}
function createColorRangeTexture(device, colorRange, type = "linear") {
  const colors = colorRangeToFlatArray(colorRange, false, Uint8Array);
  return device.createTexture({
    format: "rgba8unorm",
    mipmaps: false,
    sampler: {
      minFilter: COLOR_RANGE_FILTER[type],
      magFilter: COLOR_RANGE_FILTER[type],
      addressModeU: "clamp-to-edge",
      addressModeV: "clamp-to-edge"
    },
    data: colors,
    width: colors.length / 4,
    height: 1
  });
}

// dist/screen-grid-layer/screen-grid-layer-vertex.glsl.js
var screen_grid_layer_vertex_glsl_default = (
  /* glsl */
  `#version 300 es
#define SHADER_NAME screen-grid-layer-vertex-shader
#define RANGE_COUNT 6
in vec2 positions;
in vec2 instancePositions;
in float instanceWeights;
in vec3 instancePickingColors;
uniform sampler2D colorRange;
out vec4 vColor;
vec4 interp(float value, vec2 domain, sampler2D range) {
float r = (value - domain.x) / (domain.y - domain.x);
return texture(range, vec2(r, 0.5));
}
void main(void) {
if (isnan(instanceWeights)) {
gl_Position = vec4(0.);
return;
}
vec2 pos = instancePositions * screenGrid.gridSizeClipspace + positions * screenGrid.cellSizeClipspace;
pos.x = pos.x - 1.0;
pos.y = 1.0 - pos.y;
gl_Position = vec4(pos, 0., 1.);
vColor = interp(instanceWeights, screenGrid.colorDomain, colorRange);
vColor.a *= layer.opacity;
picking_setPickingColor(instancePickingColors);
}
`
);

// dist/screen-grid-layer/screen-grid-layer-fragment.glsl.js
var screen_grid_layer_fragment_glsl_default = (
  /* glsl */
  `#version 300 es
#define SHADER_NAME screen-grid-layer-fragment-shader
precision highp float;
in vec4 vColor;
out vec4 fragColor;
void main(void) {
fragColor = vColor;
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`
);

// dist/screen-grid-layer/screen-grid-layer-uniforms.js
var uniformBlock3 = (
  /* glsl */
  `uniform screenGridUniforms {
  vec2 cellSizeClipspace;
  vec2 gridSizeClipspace;
  vec2 colorDomain;
} screenGrid;
`
);
var screenGridUniforms = {
  name: "screenGrid",
  vs: uniformBlock3,
  uniformTypes: {
    cellSizeClipspace: "vec2<f32>",
    gridSizeClipspace: "vec2<f32>",
    colorDomain: "vec2<f32>"
  }
};

// dist/screen-grid-layer/screen-grid-cell-layer.js
var ScreenGridCellLayer = class extends import_core4.Layer {
  getShaders() {
    return super.getShaders({ vs: screen_grid_layer_vertex_glsl_default, fs: screen_grid_layer_fragment_glsl_default, modules: [import_core4.picking, screenGridUniforms] });
  }
  initializeState() {
    this.getAttributeManager().addInstanced({
      instancePositions: {
        size: 2,
        type: "float32",
        accessor: "getBin"
      },
      instanceWeights: {
        size: 1,
        type: "float32",
        accessor: "getWeight"
      }
    });
    this.state.model = this._getModel();
  }
  updateState(params) {
    var _a;
    super.updateState(params);
    const { props, oldProps, changeFlags } = params;
    const model = this.state.model;
    if (oldProps.colorRange !== props.colorRange) {
      (_a = this.state.colorTexture) == null ? void 0 : _a.destroy();
      this.state.colorTexture = createColorRangeTexture(this.context.device, props.colorRange, props.colorScaleType);
      const screenGridProps = { colorRange: this.state.colorTexture };
      model.shaderInputs.setProps({ screenGrid: screenGridProps });
    } else if (oldProps.colorScaleType !== props.colorScaleType) {
      updateColorRangeTexture(this.state.colorTexture, props.colorScaleType);
    }
    if (oldProps.cellMarginPixels !== props.cellMarginPixels || oldProps.cellSizePixels !== props.cellSizePixels || changeFlags.viewportChanged) {
      const { width, height } = this.context.viewport;
      const { cellSizePixels: gridSize, cellMarginPixels } = this.props;
      const cellSize = Math.max(gridSize - cellMarginPixels, 0);
      const screenGridProps = {
        gridSizeClipspace: [gridSize / width * 2, gridSize / height * 2],
        cellSizeClipspace: [cellSize / width * 2, cellSize / height * 2]
      };
      model.shaderInputs.setProps({ screenGrid: screenGridProps });
    }
  }
  finalizeState(context) {
    var _a;
    super.finalizeState(context);
    (_a = this.state.colorTexture) == null ? void 0 : _a.destroy();
  }
  draw({ uniforms }) {
    const colorDomain = this.props.colorDomain();
    const model = this.state.model;
    const screenGridProps = { colorDomain };
    model.shaderInputs.setProps({ screenGrid: screenGridProps });
    model.draw(this.context.renderPass);
  }
  // Private Methods
  _getModel() {
    return new import_engine3.Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager().getBufferLayouts(),
      geometry: new import_engine3.Geometry({
        topology: "triangle-strip",
        attributes: {
          positions: {
            value: new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]),
            size: 2
          }
        }
      }),
      isInstanced: true
    });
  }
};
ScreenGridCellLayer.layerName = "ScreenGridCellLayer";
var screen_grid_cell_layer_default = ScreenGridCellLayer;

// dist/screen-grid-layer/bin-options-uniforms.js
var uniformBlock4 = (
  /* glsl */
  `uniform binOptionsUniforms {
  float cellSizePixels;
} binOptions;
`
);
var binOptionsUniforms = {
  name: "binOptions",
  vs: uniformBlock4,
  uniformTypes: {
    cellSizePixels: "f32"
  }
};

// dist/screen-grid-layer/screen-grid-layer.js
var defaultProps = {
  cellSizePixels: { type: "number", value: 100, min: 1 },
  cellMarginPixels: { type: "number", value: 2, min: 0 },
  colorRange: defaultColorRange,
  colorScaleType: "linear",
  getPosition: { type: "accessor", value: (d) => d.position },
  getWeight: { type: "accessor", value: 1 },
  gpuAggregation: true,
  aggregation: "SUM"
};
var ScreenGridLayer = class extends aggregation_layer_default {
  getAggregatorType() {
    return this.props.gpuAggregation && WebGLAggregator.isSupported(this.context.device) ? "gpu" : "cpu";
  }
  createAggregator(type) {
    if (type === "cpu" || !WebGLAggregator.isSupported(this.context.device)) {
      return new CPUAggregator({
        dimensions: 2,
        getBin: {
          sources: ["positions"],
          getValue: ({ positions }, index, opts) => {
            const viewport = this.context.viewport;
            const p = viewport.project(positions);
            const cellSizePixels = opts.cellSizePixels;
            if (p[0] < 0 || p[0] >= viewport.width || p[1] < 0 || p[1] >= viewport.height) {
              return null;
            }
            return [Math.floor(p[0] / cellSizePixels), Math.floor(p[1] / cellSizePixels)];
          }
        },
        getValue: [{ sources: ["counts"], getValue: ({ counts }) => counts }]
      });
    }
    return new WebGLAggregator(this.context.device, {
      dimensions: 2,
      channelCount: 1,
      bufferLayout: this.getAttributeManager().getBufferLayouts({ isInstanced: false }),
      ...super.getShaders({
        modules: [import_core5.project32, binOptionsUniforms],
        vs: `
  in vec3 positions;
  in vec3 positions64Low;
  in float counts;
  
  void getBin(out ivec2 binId) {
    vec4 pos = project_position_to_clipspace(positions, positions64Low, vec3(0.0));
    vec2 screenCoords = vec2(pos.x / pos.w + 1.0, 1.0 - pos.y / pos.w) / 2.0 * project.viewportSize / project.devicePixelRatio;
    vec2 gridCoords = floor(screenCoords / binOptions.cellSizePixels);
    binId = ivec2(gridCoords);
  }
  void getValue(out float weight) {
    weight = counts;
  }
  `
      })
    });
  }
  initializeState() {
    super.initializeState();
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: {
        size: 3,
        accessor: "getPosition",
        type: "float64",
        fp64: this.use64bitPositions()
      },
      // this attribute is used in gpu aggregation path only
      counts: { size: 1, accessor: "getWeight" }
    });
  }
  shouldUpdateState({ changeFlags }) {
    return changeFlags.somethingChanged;
  }
  updateState(params) {
    const aggregatorChanged = super.updateState(params);
    const { props, oldProps, changeFlags } = params;
    const { cellSizePixels, aggregation } = props;
    if (aggregatorChanged || changeFlags.dataChanged || changeFlags.updateTriggersChanged || changeFlags.viewportChanged || aggregation !== oldProps.aggregation || cellSizePixels !== oldProps.cellSizePixels) {
      const { width, height } = this.context.viewport;
      const { aggregator } = this.state;
      if (aggregator instanceof WebGLAggregator) {
        aggregator.setProps({
          binIdRange: [
            [0, Math.ceil(width / cellSizePixels)],
            [0, Math.ceil(height / cellSizePixels)]
          ]
        });
      }
      aggregator.setProps({
        pointCount: this.getNumInstances(),
        operations: [aggregation],
        binOptions: {
          cellSizePixels
        }
      });
    }
    if (changeFlags.viewportChanged) {
      this.state.aggregator.setNeedsUpdate();
    }
    return aggregatorChanged;
  }
  onAttributeChange(id) {
    const { aggregator } = this.state;
    switch (id) {
      case "positions":
        aggregator.setNeedsUpdate();
        break;
      case "counts":
        aggregator.setNeedsUpdate(0);
        break;
      default:
    }
  }
  renderLayers() {
    const { aggregator } = this.state;
    const CellLayerClass = this.getSubLayerClass("cells", screen_grid_cell_layer_default);
    const binAttribute = aggregator.getBins();
    const weightAttribute = aggregator.getResult(0);
    return new CellLayerClass(this.props, this.getSubLayerProps({
      id: "cell-layer"
    }), {
      data: {
        length: aggregator.binCount,
        attributes: {
          getBin: binAttribute,
          getWeight: weightAttribute
        }
      },
      // Data has changed shallowly, but we likely don't need to update the attributes
      dataComparator: (data, oldData) => data.length === oldData.length,
      updateTriggers: {
        getBin: [binAttribute],
        getWeight: [weightAttribute]
      },
      parameters: {
        depthWriteEnabled: false,
        ...this.props.parameters
      },
      // Evaluate domain at draw() time
      colorDomain: () => this.props.colorDomain || aggregator.getResultDomain(0),
      // Extensions are already handled by the GPUAggregator, do not pass it down
      extensions: []
    });
  }
  getPickingInfo(params) {
    const info = params.info;
    const { index } = info;
    if (index >= 0) {
      const bin = this.state.aggregator.getBin(index);
      let object;
      if (bin) {
        object = {
          col: bin.id[0],
          row: bin.id[1],
          value: bin.value[0],
          count: bin.count
        };
        if (bin.pointIndices) {
          object.pointIndices = bin.pointIndices;
          object.points = Array.isArray(this.props.data) ? bin.pointIndices.map((i) => this.props.data[i]) : [];
        }
      }
      info.object = object;
    }
    return info;
  }
};
ScreenGridLayer.layerName = "ScreenGridLayer";
ScreenGridLayer.defaultProps = defaultProps;
var screen_grid_layer_default = ScreenGridLayer;

// dist/hexagon-layer/hexagon-layer.js
var import_core6 = require("@deck.gl/core");

// dist/common/utils/scale-utils.js
var AttributeWithScale = class {
  constructor(input, inputLength) {
    this.props = {
      scaleType: "linear",
      lowerPercentile: 0,
      upperPercentile: 100
    };
    this.domain = null;
    this.cutoff = null;
    this.input = input;
    this.inputLength = inputLength;
    this.attribute = input;
  }
  getScalePercentile() {
    if (!this._percentile) {
      const value = getAttributeValue(this.input, this.inputLength);
      this._percentile = applyScaleQuantile(value);
    }
    return this._percentile;
  }
  getScaleOrdinal() {
    if (!this._ordinal) {
      const value = getAttributeValue(this.input, this.inputLength);
      this._ordinal = applyScaleOrdinal(value);
    }
    return this._ordinal;
  }
  /** Returns the [lowerCutoff, upperCutoff] of scaled values, or null if not applicable */
  getCutoff({ scaleType, lowerPercentile, upperPercentile }) {
    if (scaleType === "quantile") {
      return [lowerPercentile, upperPercentile - 1];
    }
    if (lowerPercentile > 0 || upperPercentile < 100) {
      const { domain: thresholds } = this.getScalePercentile();
      let lowValue = thresholds[Math.floor(lowerPercentile) - 1] ?? -Infinity;
      let highValue = thresholds[Math.floor(upperPercentile) - 1] ?? Infinity;
      if (scaleType === "ordinal") {
        const { domain: sortedUniqueValues } = this.getScaleOrdinal();
        lowValue = sortedUniqueValues.findIndex((x) => x >= lowValue);
        highValue = sortedUniqueValues.findIndex((x) => x > highValue) - 1;
        if (highValue === -2) {
          highValue = sortedUniqueValues.length - 1;
        }
      }
      return [lowValue, highValue];
    }
    return null;
  }
  update(props) {
    const oldProps = this.props;
    if (props.scaleType !== oldProps.scaleType) {
      switch (props.scaleType) {
        case "quantile": {
          const { attribute } = this.getScalePercentile();
          this.attribute = attribute;
          this.domain = [0, 99];
          break;
        }
        case "ordinal": {
          const { attribute, domain } = this.getScaleOrdinal();
          this.attribute = attribute;
          this.domain = [0, domain.length - 1];
          break;
        }
        default:
          this.attribute = this.input;
          this.domain = null;
      }
    }
    if (props.scaleType !== oldProps.scaleType || props.lowerPercentile !== oldProps.lowerPercentile || props.upperPercentile !== oldProps.upperPercentile) {
      this.cutoff = this.getCutoff(props);
    }
    this.props = props;
    return this;
  }
};
function applyScaleOrdinal(values) {
  const uniqueValues = /* @__PURE__ */ new Set();
  for (const x of values) {
    if (Number.isFinite(x)) {
      uniqueValues.add(x);
    }
  }
  const sortedUniqueValues = Array.from(uniqueValues).sort();
  const domainMap = /* @__PURE__ */ new Map();
  for (let i = 0; i < sortedUniqueValues.length; i++) {
    domainMap.set(sortedUniqueValues[i], i);
  }
  return {
    attribute: {
      value: values.map((x) => Number.isFinite(x) ? domainMap.get(x) : NaN),
      type: "float32",
      size: 1
    },
    domain: sortedUniqueValues
  };
}
function applyScaleQuantile(values, rangeLength = 100) {
  const sortedValues = Array.from(values).filter(Number.isFinite).sort(ascending);
  let i = 0;
  const n = Math.max(1, rangeLength);
  const thresholds = new Array(n - 1);
  while (++i < n) {
    thresholds[i - 1] = threshold(sortedValues, i / n);
  }
  return {
    attribute: {
      value: values.map((x) => Number.isFinite(x) ? bisectRight(thresholds, x) : NaN),
      type: "float32",
      size: 1
    },
    domain: thresholds
  };
}
function getAttributeValue(attribute, length) {
  var _a;
  const elementStride = (attribute.stride ?? 4) / 4;
  const elementOffset = (attribute.offset ?? 0) / 4;
  let value = attribute.value;
  if (!value) {
    const bytes = (_a = attribute.buffer) == null ? void 0 : _a.readSyncWebGL(0, elementStride * 4 * length);
    if (bytes) {
      value = new Float32Array(bytes.buffer);
      attribute.value = value;
    }
  }
  if (elementStride === 1) {
    return value.subarray(0, length);
  }
  const result = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    result[i] = value[i * elementStride + elementOffset];
  }
  return result;
}
function ascending(a, b) {
  return a - b;
}
function threshold(domain, fraction) {
  const domainLength = domain.length;
  if (fraction <= 0 || domainLength < 2) {
    return domain[0];
  }
  if (fraction >= 1) {
    return domain[domainLength - 1];
  }
  const domainFraction = (domainLength - 1) * fraction;
  const lowIndex = Math.floor(domainFraction);
  const low = domain[lowIndex];
  const high = domain[lowIndex + 1];
  return low + (high - low) * (domainFraction - lowIndex);
}
function bisectRight(a, x) {
  let lo = 0;
  let hi = a.length;
  while (lo < hi) {
    const mid = lo + hi >>> 1;
    if (a[mid] > x) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return lo;
}

// dist/common/utils/bounds-utils.js
function getBinIdRange({ dataBounds, getBinId, padding = 0 }) {
  const corners = [
    dataBounds[0],
    dataBounds[1],
    [dataBounds[0][0], dataBounds[1][1]],
    [dataBounds[1][0], dataBounds[0][1]]
  ].map((p) => getBinId(p));
  const minX = Math.min(...corners.map((p) => p[0])) - padding;
  const minY = Math.min(...corners.map((p) => p[1])) - padding;
  const maxX = Math.max(...corners.map((p) => p[0])) + padding + 1;
  const maxY = Math.max(...corners.map((p) => p[1])) + padding + 1;
  return [
    [minX, maxX],
    [minY, maxY]
  ];
}

// dist/hexagon-layer/hexagon-cell-layer.js
var import_layers = require("@deck.gl/layers");

// dist/hexagon-layer/hexbin.js
var THIRD_PI = Math.PI / 3;
var DIST_X = 2 * Math.sin(THIRD_PI);
var DIST_Y = 1.5;
var HexbinVertices = Array.from({ length: 6 }, (_, i) => {
  const angle = i * THIRD_PI;
  return [Math.sin(angle), -Math.cos(angle)];
});
function pointToHexbin([px, py], radius) {
  let pj = Math.round(py = py / radius / DIST_Y);
  let pi = Math.round(px = px / radius / DIST_X - (pj & 1) / 2);
  const py1 = py - pj;
  if (Math.abs(py1) * 3 > 1) {
    const px1 = px - pi;
    const pi2 = pi + (px < pi ? -1 : 1) / 2;
    const pj2 = pj + (py < pj ? -1 : 1);
    const px2 = px - pi2;
    const py2 = py - pj2;
    if (px1 * px1 + py1 * py1 > px2 * px2 + py2 * py2) {
      pi = pi2 + (pj & 1 ? 1 : -1) / 2;
      pj = pj2;
    }
  }
  return [pi, pj];
}
var pointToHexbinGLSL = (
  /* glsl */
  `
const vec2 DIST = vec2(${DIST_X}, ${DIST_Y});

ivec2 pointToHexbin(vec2 p, float radius) {
  p /= radius * DIST;
  float pj = round(p.y);
  float pjm2 = mod(pj, 2.0);
  p.x -= pjm2 * 0.5;
  float pi = round(p.x);
  vec2 d1 = p - vec2(pi, pj);

  if (abs(d1.y) * 3. > 1.) {
    vec2 v2 = step(0.0, d1) - 0.5;
    v2.y *= 2.0;
    vec2 d2 = d1 - v2;
    if (dot(d1, d1) > dot(d2, d2)) {
      pi += v2.x + pjm2 - 0.5;
      pj += v2.y;
    }
  }
  return ivec2(pi, pj);
}
`
);
function getHexbinCentroid([i, j], radius) {
  return [(i + (j & 1) / 2) * radius * DIST_X, j * radius * DIST_Y];
}
var getHexbinCentroidGLSL = `
const vec2 DIST = vec2(${DIST_X}, ${DIST_Y});

vec2 hexbinCentroid(vec2 binId, float radius) {
  binId.x += fract(binId.y * 0.5);
  return binId * DIST * radius;
}
`;

// dist/hexagon-layer/hexagon-cell-layer-vertex.glsl.js
var hexagon_cell_layer_vertex_glsl_default = (
  /* glsl */
  `#version 300 es
#define SHADER_NAME hexagon-cell-layer-vertex-shader
in vec3 positions;
in vec3 normals;
in vec2 instancePositions;
in float instanceElevationValues;
in float instanceColorValues;
in vec3 instancePickingColors;
uniform sampler2D colorRange;
out vec4 vColor;
${getHexbinCentroidGLSL}
float interp(float value, vec2 domain, vec2 range) {
float r = min(max((value - domain.x) / (domain.y - domain.x), 0.), 1.);
return mix(range.x, range.y, r);
}
vec4 interp(float value, vec2 domain, sampler2D range) {
float r = (value - domain.x) / (domain.y - domain.x);
return texture(range, vec2(r, 0.5));
}
void main(void) {
geometry.pickingColor = instancePickingColors;
if (isnan(instanceColorValues) ||
instanceColorValues < hexagon.colorDomain.z ||
instanceColorValues > hexagon.colorDomain.w ||
instanceElevationValues < hexagon.elevationDomain.z ||
instanceElevationValues > hexagon.elevationDomain.w
) {
gl_Position = vec4(0.);
return;
}
vec2 commonPosition = hexbinCentroid(instancePositions, column.radius) + (hexagon.originCommon - project.commonOrigin.xy);
commonPosition += positions.xy * column.radius * column.coverage;
geometry.position = vec4(commonPosition, 0.0, 1.0);
geometry.normal = project_normal(normals);
float elevation = 0.0;
if (column.extruded) {
elevation = interp(instanceElevationValues, hexagon.elevationDomain.xy, hexagon.elevationRange);
elevation = project_size(elevation);
geometry.position.z = (positions.z + 1.0) / 2.0 * elevation;
}
gl_Position = project_common_position_to_clipspace(geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
vColor = interp(instanceColorValues, hexagon.colorDomain.xy, colorRange);
vColor.a *= layer.opacity;
if (column.extruded) {
vColor.rgb = lighting_getLightColor(vColor.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);
}
DECKGL_FILTER_COLOR(vColor, geometry);
}
`
);

// dist/hexagon-layer/hexagon-layer-uniforms.js
var uniformBlock5 = (
  /* glsl */
  `uniform hexagonUniforms {
  vec4 colorDomain;
  vec4 elevationDomain;
  vec2 elevationRange;
  vec2 originCommon;
} hexagon;
`
);
var hexagonUniforms = {
  name: "hexagon",
  vs: uniformBlock5,
  uniformTypes: {
    colorDomain: "vec4<f32>",
    elevationDomain: "vec4<f32>",
    elevationRange: "vec2<f32>",
    originCommon: "vec2<f32>"
  }
};

// dist/hexagon-layer/hexagon-cell-layer.js
var HexagonCellLayer = class extends import_layers.ColumnLayer {
  getShaders() {
    const shaders = super.getShaders();
    shaders.modules.push(hexagonUniforms);
    return { ...shaders, vs: hexagon_cell_layer_vertex_glsl_default };
  }
  initializeState() {
    super.initializeState();
    const attributeManager = this.getAttributeManager();
    attributeManager.remove([
      "instanceElevations",
      "instanceFillColors",
      "instanceLineColors",
      "instanceStrokeWidths"
    ]);
    attributeManager.addInstanced({
      instancePositions: {
        size: 2,
        type: "float32",
        accessor: "getBin"
      },
      instanceColorValues: {
        size: 1,
        type: "float32",
        accessor: "getColorValue"
      },
      instanceElevationValues: {
        size: 1,
        type: "float32",
        accessor: "getElevationValue"
      }
    });
  }
  updateState(params) {
    var _a;
    super.updateState(params);
    const { props, oldProps } = params;
    const model = this.state.fillModel;
    if (oldProps.colorRange !== props.colorRange) {
      (_a = this.state.colorTexture) == null ? void 0 : _a.destroy();
      this.state.colorTexture = createColorRangeTexture(this.context.device, props.colorRange, props.colorScaleType);
      const hexagonProps = { colorRange: this.state.colorTexture };
      model.shaderInputs.setProps({ hexagon: hexagonProps });
    } else if (oldProps.colorScaleType !== props.colorScaleType) {
      updateColorRangeTexture(this.state.colorTexture, props.colorScaleType);
    }
  }
  finalizeState(context) {
    var _a;
    super.finalizeState(context);
    (_a = this.state.colorTexture) == null ? void 0 : _a.destroy();
  }
  draw({ uniforms }) {
    const { radius, hexOriginCommon, elevationRange, elevationScale, extruded, coverage, colorDomain, elevationDomain } = this.props;
    const colorCutoff = this.props.colorCutoff || [-Infinity, Infinity];
    const elevationCutoff = this.props.elevationCutoff || [-Infinity, Infinity];
    const fillModel = this.state.fillModel;
    if (fillModel.vertexArray.indexBuffer) {
      fillModel.setIndexBuffer(null);
    }
    fillModel.setVertexCount(this.state.fillVertexCount);
    const hexagonProps = {
      colorDomain: [
        Math.max(colorDomain[0], colorCutoff[0]),
        // instanceColorValue that maps to colorRange[0]
        Math.min(colorDomain[1], colorCutoff[1]),
        // instanceColorValue that maps to colorRange[colorRange.length - 1]
        Math.max(colorDomain[0] - 1, colorCutoff[0]),
        // hide cell if instanceColorValue is less than this
        Math.min(colorDomain[1] + 1, colorCutoff[1])
        // hide cell if instanceColorValue is greater than this
      ],
      elevationDomain: [
        Math.max(elevationDomain[0], elevationCutoff[0]),
        // instanceElevationValue that maps to elevationRange[0]
        Math.min(elevationDomain[1], elevationCutoff[1]),
        // instanceElevationValue that maps to elevationRange[elevationRange.length - 1]
        Math.max(elevationDomain[0] - 1, elevationCutoff[0]),
        // hide cell if instanceElevationValue is less than this
        Math.min(elevationDomain[1] + 1, elevationCutoff[1])
        // hide cell if instanceElevationValue is greater than this
      ],
      elevationRange: [elevationRange[0] * elevationScale, elevationRange[1] * elevationScale],
      originCommon: hexOriginCommon
    };
    fillModel.shaderInputs.setProps({
      column: { extruded, coverage, radius },
      hexagon: hexagonProps
    });
    fillModel.draw(this.context.renderPass);
  }
};
HexagonCellLayer.layerName = "HexagonCellLayer";
var hexagon_cell_layer_default = HexagonCellLayer;

// dist/hexagon-layer/bin-options-uniforms.js
var uniformBlock6 = (
  /* glsl */
  `uniform binOptionsUniforms {
  vec2 hexOriginCommon;
  float radiusCommon;
} binOptions;
`
);
var binOptionsUniforms2 = {
  name: "binOptions",
  vs: uniformBlock6,
  uniformTypes: {
    hexOriginCommon: "vec2<f32>",
    radiusCommon: "f32"
  }
};

// dist/hexagon-layer/hexagon-layer.js
function noop() {
}
var defaultProps2 = {
  gpuAggregation: true,
  // color
  colorDomain: null,
  colorRange: defaultColorRange,
  getColorValue: { type: "accessor", value: null },
  // default value is calculated from `getColorWeight` and `colorAggregation`
  getColorWeight: { type: "accessor", value: 1 },
  colorAggregation: "SUM",
  lowerPercentile: { type: "number", min: 0, max: 100, value: 0 },
  upperPercentile: { type: "number", min: 0, max: 100, value: 100 },
  colorScaleType: "quantize",
  onSetColorDomain: noop,
  // elevation
  elevationDomain: null,
  elevationRange: [0, 1e3],
  getElevationValue: { type: "accessor", value: null },
  // default value is calculated from `getElevationWeight` and `elevationAggregation`
  getElevationWeight: { type: "accessor", value: 1 },
  elevationAggregation: "SUM",
  elevationScale: { type: "number", min: 0, value: 1 },
  elevationLowerPercentile: { type: "number", min: 0, max: 100, value: 0 },
  elevationUpperPercentile: { type: "number", min: 0, max: 100, value: 100 },
  elevationScaleType: "linear",
  onSetElevationDomain: noop,
  // hexbin
  radius: { type: "number", min: 1, value: 1e3 },
  coverage: { type: "number", min: 0, max: 1, value: 1 },
  getPosition: { type: "accessor", value: (x) => x.position },
  hexagonAggregator: { type: "function", optional: true, value: null },
  extruded: false,
  // Optional material for 'lighting' shader module
  material: true
};
var HexagonLayer = class extends aggregation_layer_default {
  getAggregatorType() {
    const { gpuAggregation, hexagonAggregator, getColorValue, getElevationValue } = this.props;
    if (gpuAggregation && (hexagonAggregator || getColorValue || getElevationValue)) {
      import_core6.log.warn("Features not supported by GPU aggregation, falling back to CPU")();
      return "cpu";
    }
    if (
      // GPU aggregation is requested
      gpuAggregation && // GPU aggregation is supported by the device
      WebGLAggregator.isSupported(this.context.device)
    ) {
      return "gpu";
    }
    return "cpu";
  }
  createAggregator(type) {
    if (type === "cpu") {
      const { hexagonAggregator, radius } = this.props;
      return new CPUAggregator({
        dimensions: 2,
        getBin: {
          sources: ["positions"],
          getValue: ({ positions }, index, opts) => {
            if (hexagonAggregator) {
              return hexagonAggregator(positions, radius);
            }
            const viewport = this.state.aggregatorViewport;
            const p = viewport.projectPosition(positions);
            const { radiusCommon, hexOriginCommon } = opts;
            return pointToHexbin([p[0] - hexOriginCommon[0], p[1] - hexOriginCommon[1]], radiusCommon);
          }
        },
        getValue: [
          { sources: ["colorWeights"], getValue: ({ colorWeights }) => colorWeights },
          { sources: ["elevationWeights"], getValue: ({ elevationWeights }) => elevationWeights }
        ]
      });
    }
    return new WebGLAggregator(this.context.device, {
      dimensions: 2,
      channelCount: 2,
      bufferLayout: this.getAttributeManager().getBufferLayouts({ isInstanced: false }),
      ...super.getShaders({
        modules: [import_core6.project32, binOptionsUniforms2],
        vs: (
          /* glsl */
          `
  in vec3 positions;
  in vec3 positions64Low;
  in float colorWeights;
  in float elevationWeights;
  
  ${pointToHexbinGLSL}

  void getBin(out ivec2 binId) {
    vec3 positionCommon = project_position(positions, positions64Low);
    binId = pointToHexbin(positionCommon.xy, binOptions.radiusCommon);
  }
  void getValue(out vec2 value) {
    value = vec2(colorWeights, elevationWeights);
  }
  `
        )
      })
    });
  }
  initializeState() {
    super.initializeState();
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: {
        size: 3,
        accessor: "getPosition",
        type: "float64",
        fp64: this.use64bitPositions()
      },
      colorWeights: { size: 1, accessor: "getColorWeight" },
      elevationWeights: { size: 1, accessor: "getElevationWeight" }
    });
  }
  updateState(params) {
    const aggregatorChanged = super.updateState(params);
    const { props, oldProps, changeFlags } = params;
    const { aggregator } = this.state;
    if ((changeFlags.dataChanged || !this.state.dataAsArray) && (props.getColorValue || props.getElevationValue)) {
      this.state.dataAsArray = Array.from((0, import_core6.createIterable)(props.data).iterable);
    }
    if (aggregatorChanged || changeFlags.dataChanged || props.radius !== oldProps.radius || props.getColorValue !== oldProps.getColorValue || props.getElevationValue !== oldProps.getElevationValue || props.colorAggregation !== oldProps.colorAggregation || props.elevationAggregation !== oldProps.elevationAggregation) {
      this._updateBinOptions();
      const { radiusCommon, hexOriginCommon, binIdRange, dataAsArray } = this.state;
      aggregator.setProps({
        // @ts-expect-error only used by GPUAggregator
        binIdRange,
        pointCount: this.getNumInstances(),
        operations: [props.colorAggregation, props.elevationAggregation],
        binOptions: {
          radiusCommon,
          hexOriginCommon
        },
        onUpdate: this._onAggregationUpdate.bind(this)
      });
      if (dataAsArray) {
        const { getColorValue, getElevationValue } = this.props;
        aggregator.setProps({
          // @ts-expect-error only used by CPUAggregator
          customOperations: [
            getColorValue && ((indices) => getColorValue(indices.map((i) => dataAsArray[i]), { indices, data: props.data })),
            getElevationValue && ((indices) => getElevationValue(indices.map((i) => dataAsArray[i]), { indices, data: props.data }))
          ]
        });
      }
    }
    if (changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.getColorValue) {
      aggregator.setNeedsUpdate(0);
    }
    if (changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.getElevationValue) {
      aggregator.setNeedsUpdate(1);
    }
    return aggregatorChanged;
  }
  _updateBinOptions() {
    const bounds = this.getBounds();
    let radiusCommon = 1;
    let hexOriginCommon = [0, 0];
    let binIdRange = [
      [0, 1],
      [0, 1]
    ];
    let viewport = this.context.viewport;
    if (bounds && Number.isFinite(bounds[0][0])) {
      let centroid = [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2];
      const { radius } = this.props;
      const { unitsPerMeter } = viewport.getDistanceScales(centroid);
      radiusCommon = unitsPerMeter[0] * radius;
      const centerHex = pointToHexbin(viewport.projectFlat(centroid), radiusCommon);
      centroid = viewport.unprojectFlat(getHexbinCentroid(centerHex, radiusCommon));
      const ViewportType = viewport.constructor;
      viewport = viewport.isGeospatial ? new ViewportType({ longitude: centroid[0], latitude: centroid[1], zoom: 12 }) : new import_core6.Viewport({ position: [centroid[0], centroid[1], 0], zoom: 12 });
      hexOriginCommon = [Math.fround(viewport.center[0]), Math.fround(viewport.center[1])];
      binIdRange = getBinIdRange({
        dataBounds: bounds,
        getBinId: (p) => {
          const positionCommon = viewport.projectFlat(p);
          positionCommon[0] -= hexOriginCommon[0];
          positionCommon[1] -= hexOriginCommon[1];
          return pointToHexbin(positionCommon, radiusCommon);
        },
        padding: 1
      });
    }
    this.setState({ radiusCommon, hexOriginCommon, binIdRange, aggregatorViewport: viewport });
  }
  draw(opts) {
    if (opts.shaderModuleProps.project) {
      opts.shaderModuleProps.project.viewport = this.state.aggregatorViewport;
    }
    super.draw(opts);
  }
  _onAggregationUpdate({ channel }) {
    const props = this.getCurrentLayer().props;
    const { aggregator } = this.state;
    if (channel === 0) {
      const result = aggregator.getResult(0);
      this.setState({
        colors: new AttributeWithScale(result, aggregator.binCount)
      });
      props.onSetColorDomain(aggregator.getResultDomain(0));
    } else if (channel === 1) {
      const result = aggregator.getResult(1);
      this.setState({
        elevations: new AttributeWithScale(result, aggregator.binCount)
      });
      props.onSetElevationDomain(aggregator.getResultDomain(1));
    }
  }
  onAttributeChange(id) {
    const { aggregator } = this.state;
    switch (id) {
      case "positions":
        aggregator.setNeedsUpdate();
        this._updateBinOptions();
        const { radiusCommon, hexOriginCommon, binIdRange } = this.state;
        aggregator.setProps({
          // @ts-expect-error only used by GPUAggregator
          binIdRange,
          binOptions: {
            radiusCommon,
            hexOriginCommon
          }
        });
        break;
      case "colorWeights":
        aggregator.setNeedsUpdate(0);
        break;
      case "elevationWeights":
        aggregator.setNeedsUpdate(1);
        break;
      default:
    }
  }
  renderLayers() {
    var _a, _b;
    const { aggregator, radiusCommon, hexOriginCommon } = this.state;
    const { elevationScale, colorRange, elevationRange, extruded, coverage, material, transitions, colorScaleType, lowerPercentile, upperPercentile, colorDomain, elevationScaleType, elevationLowerPercentile, elevationUpperPercentile, elevationDomain } = this.props;
    const CellLayerClass = this.getSubLayerClass("cells", hexagon_cell_layer_default);
    const binAttribute = aggregator.getBins();
    const colors = (_a = this.state.colors) == null ? void 0 : _a.update({
      scaleType: colorScaleType,
      lowerPercentile,
      upperPercentile
    });
    const elevations = (_b = this.state.elevations) == null ? void 0 : _b.update({
      scaleType: elevationScaleType,
      lowerPercentile: elevationLowerPercentile,
      upperPercentile: elevationUpperPercentile
    });
    if (!colors || !elevations) {
      return null;
    }
    return new CellLayerClass(this.getSubLayerProps({
      id: "cells"
    }), {
      data: {
        length: aggregator.binCount,
        attributes: {
          getBin: binAttribute,
          getColorValue: colors.attribute,
          getElevationValue: elevations.attribute
        }
      },
      // Data has changed shallowly, but we likely don't need to update the attributes
      dataComparator: (data, oldData) => data.length === oldData.length,
      updateTriggers: {
        getBin: [binAttribute],
        getColorValue: [colors.attribute],
        getElevationValue: [elevations.attribute]
      },
      diskResolution: 6,
      vertices: HexbinVertices,
      radius: radiusCommon,
      hexOriginCommon,
      elevationScale,
      colorRange,
      colorScaleType,
      elevationRange,
      extruded,
      coverage,
      material,
      colorDomain: colors.domain || colorDomain || aggregator.getResultDomain(0),
      elevationDomain: elevations.domain || elevationDomain || aggregator.getResultDomain(1),
      colorCutoff: colors.cutoff,
      elevationCutoff: elevations.cutoff,
      transitions: transitions && {
        getFillColor: transitions.getColorValue || transitions.getColorWeight,
        getElevation: transitions.getElevationValue || transitions.getElevationWeight
      },
      // Extensions are already handled by the GPUAggregator, do not pass it down
      extensions: []
    });
  }
  getPickingInfo(params) {
    const info = params.info;
    const { index } = info;
    if (index >= 0) {
      const bin = this.state.aggregator.getBin(index);
      let object;
      if (bin) {
        const centroidCommon = getHexbinCentroid(bin.id, this.state.radiusCommon);
        const centroid = this.context.viewport.unprojectFlat(centroidCommon);
        object = {
          col: bin.id[0],
          row: bin.id[1],
          position: centroid,
          colorValue: bin.value[0],
          elevationValue: bin.value[1],
          count: bin.count
        };
        if (bin.pointIndices) {
          object.pointIndices = bin.pointIndices;
          object.points = Array.isArray(this.props.data) ? bin.pointIndices.map((i) => this.props.data[i]) : [];
        }
      }
      info.object = object;
    }
    return info;
  }
};
HexagonLayer.layerName = "HexagonLayer";
HexagonLayer.defaultProps = defaultProps2;
var hexagon_layer_default = HexagonLayer;

// dist/contour-layer/contour-layer.js
var import_core7 = require("@deck.gl/core");
var import_layers2 = require("@deck.gl/layers");

// dist/contour-layer/marching-squares-codes.js
var HALF = 0.5;
var ONE6TH = 1 / 6;
var OFFSET = {
  N: [0, HALF],
  // NORTH
  E: [HALF, 0],
  // EAST
  S: [0, -HALF],
  // SOUTH
  W: [-HALF, 0],
  // WEST
  // CORNERS
  NE: [HALF, HALF],
  NW: [-HALF, HALF],
  SE: [HALF, -HALF],
  SW: [-HALF, -HALF]
};
var SW_TRIANGLE = [OFFSET.W, OFFSET.SW, OFFSET.S];
var SE_TRIANGLE = [OFFSET.S, OFFSET.SE, OFFSET.E];
var NE_TRIANGLE = [OFFSET.E, OFFSET.NE, OFFSET.N];
var NW_TRIANGLE = [OFFSET.NW, OFFSET.W, OFFSET.N];
var SW_TRAPEZOID = [
  [-HALF, ONE6TH],
  [-HALF, -ONE6TH],
  [-ONE6TH, -HALF],
  [ONE6TH, -HALF]
];
var SE_TRAPEZOID = [
  [-ONE6TH, -HALF],
  [ONE6TH, -HALF],
  [HALF, -ONE6TH],
  [HALF, ONE6TH]
];
var NE_TRAPEZOID = [
  [HALF, -ONE6TH],
  [HALF, ONE6TH],
  [ONE6TH, HALF],
  [-ONE6TH, HALF]
];
var NW_TRAPEZOID = [
  [-HALF, ONE6TH],
  [-HALF, -ONE6TH],
  [ONE6TH, HALF],
  [-ONE6TH, HALF]
];
var S_RECTANGLE = [OFFSET.W, OFFSET.SW, OFFSET.SE, OFFSET.E];
var E_RECTANGLE = [OFFSET.S, OFFSET.SE, OFFSET.NE, OFFSET.N];
var N_RECTANGLE = [OFFSET.NW, OFFSET.W, OFFSET.E, OFFSET.NE];
var W_RECTANGLE = [OFFSET.NW, OFFSET.SW, OFFSET.S, OFFSET.N];
var EW_RECTANGEL = [
  [-HALF, ONE6TH],
  [-HALF, -ONE6TH],
  [HALF, -ONE6TH],
  [HALF, ONE6TH]
];
var SN_RECTANGEL = [
  [-ONE6TH, -HALF],
  [ONE6TH, -HALF],
  [ONE6TH, HALF],
  [-ONE6TH, HALF]
];
var SQUARE = [OFFSET.NW, OFFSET.SW, OFFSET.SE, OFFSET.NE];
var SW_PENTAGON = [OFFSET.NW, OFFSET.SW, OFFSET.SE, OFFSET.E, OFFSET.N];
var SE_PENTAGON = [OFFSET.W, OFFSET.SW, OFFSET.SE, OFFSET.NE, OFFSET.N];
var NE_PENTAGON = [OFFSET.NW, OFFSET.W, OFFSET.S, OFFSET.SE, OFFSET.NE];
var NW_PENTAGON = [OFFSET.NW, OFFSET.SW, OFFSET.S, OFFSET.E, OFFSET.NE];
var NW_N_PENTAGON = [OFFSET.NW, OFFSET.W, [HALF, -ONE6TH], [HALF, ONE6TH], OFFSET.N];
var NE_E_PENTAGON = [[-ONE6TH, -HALF], [ONE6TH, -HALF], OFFSET.E, OFFSET.NE, OFFSET.N];
var SE_S_PENTAGON = [[-HALF, ONE6TH], [-HALF, -ONE6TH], OFFSET.S, OFFSET.SE, OFFSET.E];
var SW_W_PENTAGON = [OFFSET.W, OFFSET.SW, OFFSET.S, [ONE6TH, HALF], [-ONE6TH, HALF]];
var NW_W_PENTAGON = [OFFSET.NW, OFFSET.W, [-ONE6TH, -HALF], [ONE6TH, -HALF], OFFSET.N];
var NE_N_PENTAGON = [[-HALF, ONE6TH], [-HALF, -ONE6TH], OFFSET.E, OFFSET.NE, OFFSET.N];
var SE_E_PENTAGON = [OFFSET.S, OFFSET.SE, OFFSET.E, [ONE6TH, HALF], [-ONE6TH, HALF]];
var SW_S_PENTAGON = [OFFSET.W, OFFSET.SW, OFFSET.S, [HALF, -ONE6TH], [HALF, ONE6TH]];
var S_HEXAGON = [OFFSET.W, OFFSET.SW, OFFSET.SE, OFFSET.E, [ONE6TH, HALF], [-ONE6TH, HALF]];
var E_HEXAGON = [[-HALF, ONE6TH], [-HALF, -ONE6TH], OFFSET.S, OFFSET.SE, OFFSET.NE, OFFSET.N];
var N_HEXAGON = [OFFSET.NW, OFFSET.W, [-ONE6TH, -HALF], [ONE6TH, -HALF], OFFSET.E, OFFSET.NE];
var W_HEXAGON = [OFFSET.NW, OFFSET.SW, OFFSET.S, [HALF, -ONE6TH], [HALF, ONE6TH], OFFSET.N];
var SW_NE_HEXAGON = [OFFSET.W, OFFSET.SW, OFFSET.S, OFFSET.E, OFFSET.NE, OFFSET.N];
var NW_SE_HEXAGON = [OFFSET.NW, OFFSET.W, OFFSET.S, OFFSET.SE, OFFSET.E, OFFSET.N];
var NE_HEPTAGON = [
  [-HALF, ONE6TH],
  [-HALF, -ONE6TH],
  [-ONE6TH, -HALF],
  [ONE6TH, -HALF],
  OFFSET.E,
  OFFSET.NE,
  OFFSET.N
];
var SW_HEPTAGON = [
  OFFSET.W,
  OFFSET.SW,
  OFFSET.S,
  [HALF, -ONE6TH],
  [HALF, ONE6TH],
  [ONE6TH, HALF],
  [-ONE6TH, HALF]
];
var NW_HEPTAGON = [
  OFFSET.NW,
  OFFSET.W,
  [-ONE6TH, -HALF],
  [ONE6TH, -HALF],
  [HALF, -ONE6TH],
  [HALF, ONE6TH],
  OFFSET.N
];
var SE_HEPTAGON = [
  [-HALF, ONE6TH],
  [-HALF, -ONE6TH],
  OFFSET.S,
  OFFSET.SE,
  OFFSET.E,
  [ONE6TH, HALF],
  [-ONE6TH, HALF]
];
var OCTAGON = [
  [-HALF, ONE6TH],
  [-HALF, -ONE6TH],
  [-ONE6TH, -HALF],
  [ONE6TH, -HALF],
  [HALF, -ONE6TH],
  [HALF, ONE6TH],
  [ONE6TH, HALF],
  [-ONE6TH, HALF]
];
var ISOLINES_CODE_OFFSET_MAP = {
  // key is equal to the code of 4 vertices (invert the code specified in wiki)
  // value can be an array or an Object
  // Array : [line] or [line, line], where each line is [start-point, end-point], and each point is [x, y]
  // Object : to handle saddle cases, whos output depends on mean value of all 4 corners
  //  key: code of mean value (0 or 1)
  //  value: Array , as above defines one or two line segments
  0: [],
  1: [[OFFSET.W, OFFSET.S]],
  2: [[OFFSET.S, OFFSET.E]],
  3: [[OFFSET.W, OFFSET.E]],
  4: [[OFFSET.N, OFFSET.E]],
  5: {
    0: [
      [OFFSET.W, OFFSET.S],
      [OFFSET.N, OFFSET.E]
    ],
    1: [
      [OFFSET.W, OFFSET.N],
      [OFFSET.S, OFFSET.E]
    ]
  },
  6: [[OFFSET.N, OFFSET.S]],
  7: [[OFFSET.W, OFFSET.N]],
  8: [[OFFSET.W, OFFSET.N]],
  9: [[OFFSET.N, OFFSET.S]],
  10: {
    0: [
      [OFFSET.W, OFFSET.N],
      [OFFSET.S, OFFSET.E]
    ],
    1: [
      [OFFSET.W, OFFSET.S],
      [OFFSET.N, OFFSET.E]
    ]
  },
  11: [[OFFSET.N, OFFSET.E]],
  12: [[OFFSET.W, OFFSET.E]],
  13: [[OFFSET.S, OFFSET.E]],
  14: [[OFFSET.W, OFFSET.S]],
  15: []
};
function ternaryToIndex(ternary) {
  return parseInt(ternary, 4);
}
var ISOBANDS_CODE_OFFSET_MAP = {
  // Below list of cases, follow the same order as in above mentioned wiki page.
  // Each case has its code on first commented line // T,TR,R,C
  // where T: Top, TR: Top-right, R: Right and C: current, each will be either 0, 1 or 2
  // final code is binary representation of above code , where takes 2 digits
  // for example:  code 2-2-2-1 => 10-10-10-01 => 10101001 => 169
  // no contours
  [ternaryToIndex("0000")]: [],
  [ternaryToIndex("2222")]: [],
  // single triangle
  [ternaryToIndex("2221")]: [SW_TRIANGLE],
  [ternaryToIndex("2212")]: [SE_TRIANGLE],
  [ternaryToIndex("2122")]: [NE_TRIANGLE],
  [ternaryToIndex("1222")]: [NW_TRIANGLE],
  [ternaryToIndex("0001")]: [SW_TRIANGLE],
  [ternaryToIndex("0010")]: [SE_TRIANGLE],
  [ternaryToIndex("0100")]: [NE_TRIANGLE],
  [ternaryToIndex("1000")]: [NW_TRIANGLE],
  // single trapezoid
  [ternaryToIndex("2220")]: [SW_TRAPEZOID],
  [ternaryToIndex("2202")]: [SE_TRAPEZOID],
  [ternaryToIndex("2022")]: [NE_TRAPEZOID],
  [ternaryToIndex("0222")]: [NW_TRAPEZOID],
  [ternaryToIndex("0002")]: [SW_TRAPEZOID],
  [ternaryToIndex("0020")]: [SE_TRAPEZOID],
  [ternaryToIndex("0200")]: [NE_TRAPEZOID],
  [ternaryToIndex("2000")]: [NW_TRAPEZOID],
  // single rectangle
  [ternaryToIndex("0011")]: [S_RECTANGLE],
  [ternaryToIndex("0110")]: [E_RECTANGLE],
  [ternaryToIndex("1100")]: [N_RECTANGLE],
  [ternaryToIndex("1001")]: [W_RECTANGLE],
  [ternaryToIndex("2211")]: [S_RECTANGLE],
  [ternaryToIndex("2112")]: [E_RECTANGLE],
  [ternaryToIndex("1122")]: [N_RECTANGLE],
  [ternaryToIndex("1221")]: [W_RECTANGLE],
  [ternaryToIndex("2200")]: [EW_RECTANGEL],
  [ternaryToIndex("2002")]: [SN_RECTANGEL],
  [ternaryToIndex("0022")]: [EW_RECTANGEL],
  [ternaryToIndex("0220")]: [SN_RECTANGEL],
  // single square
  // 1111
  [ternaryToIndex("1111")]: [SQUARE],
  // single pentagon
  [ternaryToIndex("1211")]: [SW_PENTAGON],
  [ternaryToIndex("2111")]: [SE_PENTAGON],
  [ternaryToIndex("1112")]: [NE_PENTAGON],
  [ternaryToIndex("1121")]: [NW_PENTAGON],
  [ternaryToIndex("1011")]: [SW_PENTAGON],
  [ternaryToIndex("0111")]: [SE_PENTAGON],
  [ternaryToIndex("1110")]: [NE_PENTAGON],
  [ternaryToIndex("1101")]: [NW_PENTAGON],
  [ternaryToIndex("1200")]: [NW_N_PENTAGON],
  [ternaryToIndex("0120")]: [NE_E_PENTAGON],
  [ternaryToIndex("0012")]: [SE_S_PENTAGON],
  [ternaryToIndex("2001")]: [SW_W_PENTAGON],
  [ternaryToIndex("1022")]: [NW_N_PENTAGON],
  [ternaryToIndex("2102")]: [NE_E_PENTAGON],
  [ternaryToIndex("2210")]: [SE_S_PENTAGON],
  [ternaryToIndex("0221")]: [SW_W_PENTAGON],
  [ternaryToIndex("1002")]: [NW_W_PENTAGON],
  [ternaryToIndex("2100")]: [NE_N_PENTAGON],
  [ternaryToIndex("0210")]: [SE_E_PENTAGON],
  [ternaryToIndex("0021")]: [SW_S_PENTAGON],
  [ternaryToIndex("1220")]: [NW_W_PENTAGON],
  [ternaryToIndex("0122")]: [NE_N_PENTAGON],
  [ternaryToIndex("2012")]: [SE_E_PENTAGON],
  [ternaryToIndex("2201")]: [SW_S_PENTAGON],
  // single hexagon
  [ternaryToIndex("0211")]: [S_HEXAGON],
  [ternaryToIndex("2110")]: [E_HEXAGON],
  [ternaryToIndex("1102")]: [N_HEXAGON],
  [ternaryToIndex("1021")]: [W_HEXAGON],
  [ternaryToIndex("2011")]: [S_HEXAGON],
  [ternaryToIndex("0112")]: [E_HEXAGON],
  [ternaryToIndex("1120")]: [N_HEXAGON],
  [ternaryToIndex("1201")]: [W_HEXAGON],
  [ternaryToIndex("2101")]: [SW_NE_HEXAGON],
  [ternaryToIndex("0121")]: [SW_NE_HEXAGON],
  [ternaryToIndex("1012")]: [NW_SE_HEXAGON],
  [ternaryToIndex("1210")]: [NW_SE_HEXAGON],
  // 6-sided polygons based on mean weight
  // NOTE: merges mean value codes for extreme changes (as per above Wiki doc)
  [ternaryToIndex("0101")]: {
    0: [SW_TRIANGLE, NE_TRIANGLE],
    1: [SW_NE_HEXAGON],
    2: [SW_NE_HEXAGON]
  },
  [ternaryToIndex("1010")]: {
    0: [NW_TRIANGLE, SE_TRIANGLE],
    1: [NW_SE_HEXAGON],
    2: [NW_SE_HEXAGON]
  },
  [ternaryToIndex("2121")]: {
    0: [SW_NE_HEXAGON],
    1: [SW_NE_HEXAGON],
    2: [SW_TRIANGLE, NE_TRIANGLE]
  },
  [ternaryToIndex("1212")]: {
    0: [NW_SE_HEXAGON],
    1: [NW_SE_HEXAGON],
    2: [NW_TRIANGLE, SE_TRIANGLE]
  },
  // 7-sided polygons based on mean weight
  [ternaryToIndex("2120")]: {
    0: [NE_HEPTAGON],
    1: [NE_HEPTAGON],
    2: [SW_TRAPEZOID, NE_TRIANGLE]
  },
  [ternaryToIndex("2021")]: {
    0: [SW_HEPTAGON],
    1: [SW_HEPTAGON],
    2: [SW_TRIANGLE, NE_TRAPEZOID]
  },
  [ternaryToIndex("1202")]: {
    0: [NW_HEPTAGON],
    1: [NW_HEPTAGON],
    2: [NW_TRIANGLE, SE_TRAPEZOID]
  },
  [ternaryToIndex("0212")]: {
    0: [SE_HEPTAGON],
    1: [SE_HEPTAGON],
    2: [SE_TRIANGLE, NW_TRAPEZOID]
  },
  [ternaryToIndex("0102")]: {
    0: [SW_TRAPEZOID, NE_TRIANGLE],
    1: [NE_HEPTAGON],
    2: [NE_HEPTAGON]
  },
  [ternaryToIndex("0201")]: {
    0: [SW_TRIANGLE, NE_TRAPEZOID],
    1: [SW_HEPTAGON],
    2: [SW_HEPTAGON]
  },
  [ternaryToIndex("1020")]: {
    0: [NW_TRIANGLE, SE_TRAPEZOID],
    1: [NW_HEPTAGON],
    2: [NW_HEPTAGON]
  },
  [ternaryToIndex("2010")]: {
    0: [SE_TRIANGLE, NW_TRAPEZOID],
    1: [SE_HEPTAGON],
    2: [SE_HEPTAGON]
  },
  // 8-sided polygons based on mean weight
  [ternaryToIndex("2020")]: {
    0: [NW_TRAPEZOID, SE_TRAPEZOID],
    1: [OCTAGON],
    2: [SW_TRAPEZOID, NE_TRAPEZOID]
  },
  [ternaryToIndex("0202")]: {
    0: [NE_TRAPEZOID, SW_TRAPEZOID],
    1: [OCTAGON],
    2: [NW_TRAPEZOID, SE_TRAPEZOID]
  }
};

// dist/contour-layer/marching-squares.js
function getVertexCode(weight, threshold2) {
  if (Number.isNaN(weight)) {
    return 0;
  }
  if (Array.isArray(threshold2)) {
    if (weight < threshold2[0]) {
      return 0;
    }
    return weight < threshold2[1] ? 1 : 2;
  }
  return weight >= threshold2 ? 1 : 0;
}
function getCode(opts) {
  const { x, y, xRange, yRange, getValue, threshold: threshold2 } = opts;
  const isLeftBoundary = x < xRange[0];
  const isRightBoundary = x >= xRange[1] - 1;
  const isBottomBoundary = y < yRange[0];
  const isTopBoundary = y >= yRange[1] - 1;
  const isBoundary = isLeftBoundary || isRightBoundary || isBottomBoundary || isTopBoundary;
  let weights = 0;
  let current;
  let right;
  let top;
  let topRight;
  if (isLeftBoundary || isTopBoundary) {
    top = 0;
  } else {
    const w = getValue(x, y + 1);
    top = getVertexCode(w, threshold2);
    weights += w;
  }
  if (isRightBoundary || isTopBoundary) {
    topRight = 0;
  } else {
    const w = getValue(x + 1, y + 1);
    topRight = getVertexCode(w, threshold2);
    weights += w;
  }
  if (isRightBoundary || isBottomBoundary) {
    right = 0;
  } else {
    const w = getValue(x + 1, y);
    right = getVertexCode(w, threshold2);
    weights += w;
  }
  if (isLeftBoundary || isBottomBoundary) {
    current = 0;
  } else {
    const w = getValue(x, y);
    current = getVertexCode(w, threshold2);
    weights += w;
  }
  let code = -1;
  if (Number.isFinite(threshold2)) {
    code = top << 3 | topRight << 2 | right << 1 | current;
  }
  if (Array.isArray(threshold2)) {
    code = top << 6 | topRight << 4 | right << 2 | current;
  }
  let meanCode = 0;
  if (!isBoundary) {
    meanCode = getVertexCode(weights / 4, threshold2);
  }
  return { code, meanCode };
}
function getPolygons(opts) {
  const { x, y, z, code, meanCode } = opts;
  let offsets = ISOBANDS_CODE_OFFSET_MAP[code];
  if (!Array.isArray(offsets)) {
    offsets = offsets[meanCode];
  }
  const rX = x + 1;
  const rY = y + 1;
  const polygons = [];
  offsets.forEach((polygonOffsets) => {
    const polygon = [];
    polygonOffsets.forEach((xyOffset) => {
      const vX = rX + xyOffset[0];
      const vY = rY + xyOffset[1];
      polygon.push([vX, vY, z]);
    });
    polygons.push(polygon);
  });
  return polygons;
}
function getLines(opts) {
  const { x, y, z, code, meanCode } = opts;
  let offsets = ISOLINES_CODE_OFFSET_MAP[code];
  if (!Array.isArray(offsets)) {
    offsets = offsets[meanCode];
  }
  const rX = x + 1;
  const rY = y + 1;
  const lines = [];
  offsets.forEach((xyOffsets) => {
    xyOffsets.forEach((offset) => {
      const vX = rX + offset[0];
      const vY = rY + offset[1];
      lines.push([vX, vY, z]);
    });
  });
  return lines;
}

// dist/contour-layer/contour-utils.js
function generateContours({ contours, getValue, xRange, yRange }) {
  const contourLines = [];
  const contourPolygons = [];
  let segmentIndex = 0;
  let polygonIndex = 0;
  for (let i = 0; i < contours.length; i++) {
    const contour = contours[i];
    const z = contour.zIndex ?? i;
    const { threshold: threshold2 } = contour;
    for (let x = xRange[0] - 1; x < xRange[1]; x++) {
      for (let y = yRange[0] - 1; y < yRange[1]; y++) {
        const { code, meanCode } = getCode({
          getValue,
          threshold: threshold2,
          x,
          y,
          xRange,
          yRange
        });
        const opts = {
          x,
          y,
          z,
          code,
          meanCode
        };
        if (Array.isArray(threshold2)) {
          const polygons = getPolygons(opts);
          for (const polygon of polygons) {
            contourPolygons[polygonIndex++] = {
              vertices: polygon,
              contour
            };
          }
        } else {
          const path = getLines(opts);
          if (path.length > 0) {
            contourLines[segmentIndex++] = {
              vertices: path,
              contour
            };
          }
        }
      }
    }
  }
  return { lines: contourLines, polygons: contourPolygons };
}

// dist/contour-layer/value-reader.js
function getAggregatorValueReader(opts) {
  var _a, _b, _c;
  const { aggregator, binIdRange, channel } = opts;
  if (aggregator instanceof WebGLAggregator) {
    const buffer = (_a = aggregator.getResult(channel)) == null ? void 0 : _a.buffer;
    if (buffer) {
      const values = new Float32Array(buffer.readSyncWebGL().buffer);
      return getWebGLAggregatorValueReader(values, binIdRange);
    }
  }
  if (aggregator instanceof CPUAggregator) {
    const values = (_b = aggregator.getResult(channel)) == null ? void 0 : _b.value;
    const ids = (_c = aggregator.getBins()) == null ? void 0 : _c.value;
    if (ids && values) {
      return getCPUAggregatorValueReader(values, ids, aggregator.binCount);
    }
  }
  return null;
}
function getWebGLAggregatorValueReader(values, binIdRange) {
  const [[minX, maxX], [minY, maxY]] = binIdRange;
  const width = maxX - minX;
  const height = maxY - minY;
  return (x, y) => {
    x -= minX;
    y -= minY;
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return NaN;
    }
    return values[y * width + x];
  };
}
function getCPUAggregatorValueReader(values, ids, count2) {
  const idMap = {};
  for (let i = 0; i < count2; i++) {
    const x = ids[i * 2];
    const y = ids[i * 2 + 1];
    idMap[x] = idMap[x] || {};
    idMap[x][y] = values[i];
  }
  return (x, y) => {
    var _a;
    return ((_a = idMap[x]) == null ? void 0 : _a[y]) ?? NaN;
  };
}

// dist/contour-layer/contour-layer.js
var import_core8 = require("@math.gl/core");

// dist/contour-layer/bin-options-uniforms.js
var uniformBlock7 = (
  /* glsl */
  `uniform binOptionsUniforms {
  vec2 cellOriginCommon;
  vec2 cellSizeCommon;
} binOptions;
`
);
var binOptionsUniforms3 = {
  name: "binOptions",
  vs: uniformBlock7,
  uniformTypes: {
    cellOriginCommon: "vec2<f32>",
    cellSizeCommon: "vec2<f32>"
  }
};

// dist/contour-layer/contour-layer.js
var DEFAULT_COLOR = [255, 255, 255, 255];
var DEFAULT_STROKE_WIDTH = 1;
var defaultProps3 = {
  // grid aggregation
  cellSize: { type: "number", min: 1, value: 1e3 },
  gridOrigin: { type: "array", compare: true, value: [0, 0] },
  getPosition: { type: "accessor", value: (x) => x.position },
  getWeight: { type: "accessor", value: 1 },
  gpuAggregation: true,
  aggregation: "SUM",
  // contour lines
  contours: {
    type: "object",
    value: [{ threshold: 1 }],
    optional: true,
    compare: 3
  },
  zOffset: 5e-3
};
var GridLayer = class extends aggregation_layer_default {
  getAggregatorType() {
    return this.props.gpuAggregation && WebGLAggregator.isSupported(this.context.device) ? "gpu" : "cpu";
  }
  createAggregator(type) {
    if (type === "cpu") {
      return new CPUAggregator({
        dimensions: 2,
        getBin: {
          sources: ["positions"],
          getValue: ({ positions }, index, opts) => {
            const viewport = this.state.aggregatorViewport;
            const p = viewport.projectPosition(positions);
            const { cellSizeCommon, cellOriginCommon } = opts;
            return [
              Math.floor((p[0] - cellOriginCommon[0]) / cellSizeCommon[0]),
              Math.floor((p[1] - cellOriginCommon[1]) / cellSizeCommon[1])
            ];
          }
        },
        getValue: [{ sources: ["counts"], getValue: ({ counts }) => counts }],
        onUpdate: this._onAggregationUpdate.bind(this)
      });
    }
    return new WebGLAggregator(this.context.device, {
      dimensions: 2,
      channelCount: 1,
      bufferLayout: this.getAttributeManager().getBufferLayouts({ isInstanced: false }),
      ...super.getShaders({
        modules: [import_core7.project32, binOptionsUniforms3],
        vs: (
          /* glsl */
          `
  in vec3 positions;
  in vec3 positions64Low;
  in float counts;

  void getBin(out ivec2 binId) {
    vec3 positionCommon = project_position(positions, positions64Low);
    vec2 gridCoords = floor(positionCommon.xy / binOptions.cellSizeCommon);
    binId = ivec2(gridCoords);
  }
  void getValue(out float value) {
    value = counts;
  }
  `
        )
      }),
      onUpdate: this._onAggregationUpdate.bind(this)
    });
  }
  initializeState() {
    super.initializeState();
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: {
        size: 3,
        accessor: "getPosition",
        type: "float64",
        fp64: this.use64bitPositions()
      },
      counts: { size: 1, accessor: "getWeight" }
    });
  }
  updateState(params) {
    const aggregatorChanged = super.updateState(params);
    const { props, oldProps, changeFlags } = params;
    const { aggregator } = this.state;
    if (aggregatorChanged || changeFlags.dataChanged || props.cellSize !== oldProps.cellSize || !(0, import_core7._deepEqual)(props.gridOrigin, oldProps.gridOrigin, 1) || props.aggregation !== oldProps.aggregation) {
      this._updateBinOptions();
      const { cellSizeCommon, cellOriginCommon, binIdRange } = this.state;
      aggregator.setProps({
        // @ts-expect-error only used by GPUAggregator
        binIdRange,
        pointCount: this.getNumInstances(),
        operations: [props.aggregation],
        binOptions: {
          cellSizeCommon,
          cellOriginCommon
        }
      });
    }
    if (!(0, import_core7._deepEqual)(oldProps.contours, props.contours, 2)) {
      this.setState({ contourData: null });
    }
    return aggregatorChanged;
  }
  _updateBinOptions() {
    const bounds = this.getBounds();
    const cellSizeCommon = [1, 1];
    let cellOriginCommon = [0, 0];
    let binIdRange = [
      [0, 1],
      [0, 1]
    ];
    let viewport = this.context.viewport;
    if (bounds && Number.isFinite(bounds[0][0])) {
      let centroid = [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2];
      const { cellSize, gridOrigin } = this.props;
      const { unitsPerMeter } = viewport.getDistanceScales(centroid);
      cellSizeCommon[0] = unitsPerMeter[0] * cellSize;
      cellSizeCommon[1] = unitsPerMeter[1] * cellSize;
      const centroidCommon = viewport.projectFlat(centroid);
      cellOriginCommon = [
        Math.floor((centroidCommon[0] - gridOrigin[0]) / cellSizeCommon[0]) * cellSizeCommon[0] + gridOrigin[0],
        Math.floor((centroidCommon[1] - gridOrigin[1]) / cellSizeCommon[1]) * cellSizeCommon[1] + gridOrigin[1]
      ];
      centroid = viewport.unprojectFlat(cellOriginCommon);
      const ViewportType = viewport.constructor;
      viewport = viewport.isGeospatial ? new ViewportType({ longitude: centroid[0], latitude: centroid[1], zoom: 12 }) : new import_core7.Viewport({ position: [centroid[0], centroid[1], 0], zoom: 12 });
      cellOriginCommon = [Math.fround(viewport.center[0]), Math.fround(viewport.center[1])];
      binIdRange = getBinIdRange({
        dataBounds: bounds,
        getBinId: (p) => {
          const positionCommon = viewport.projectFlat(p);
          return [
            Math.floor((positionCommon[0] - cellOriginCommon[0]) / cellSizeCommon[0]),
            Math.floor((positionCommon[1] - cellOriginCommon[1]) / cellSizeCommon[1])
          ];
        }
      });
    }
    this.setState({ cellSizeCommon, cellOriginCommon, binIdRange, aggregatorViewport: viewport });
  }
  draw(opts) {
    if (opts.shaderModuleProps.project) {
      opts.shaderModuleProps.project.viewport = this.state.aggregatorViewport;
    }
    super.draw(opts);
  }
  _onAggregationUpdate() {
    const { aggregator, binIdRange } = this.state;
    this.setState({
      aggregatedValueReader: getAggregatorValueReader({ aggregator, binIdRange, channel: 0 }),
      contourData: null
    });
  }
  _getContours() {
    const { aggregatedValueReader } = this.state;
    if (!aggregatedValueReader) {
      return null;
    }
    if (!this.state.contourData) {
      const { binIdRange } = this.state;
      const { contours } = this.props;
      const contourData = generateContours({
        contours,
        getValue: aggregatedValueReader,
        xRange: binIdRange[0],
        yRange: binIdRange[1]
      });
      this.state.contourData = contourData;
    }
    return this.state.contourData;
  }
  onAttributeChange(id) {
    const { aggregator } = this.state;
    switch (id) {
      case "positions":
        aggregator.setNeedsUpdate();
        this._updateBinOptions();
        const { cellSizeCommon, cellOriginCommon, binIdRange } = this.state;
        aggregator.setProps({
          // @ts-expect-error only used by GPUAggregator
          binIdRange,
          binOptions: {
            cellSizeCommon,
            cellOriginCommon
          }
        });
        break;
      case "counts":
        aggregator.setNeedsUpdate(0);
        break;
      default:
    }
  }
  renderLayers() {
    const contourData = this._getContours();
    if (!contourData) {
      return null;
    }
    const { lines, polygons } = contourData;
    const { zOffset } = this.props;
    const { cellOriginCommon, cellSizeCommon } = this.state;
    const LinesSubLayerClass = this.getSubLayerClass("lines", import_layers2.PathLayer);
    const BandsSubLayerClass = this.getSubLayerClass("bands", import_layers2.SolidPolygonLayer);
    const modelMatrix = new import_core8.Matrix4().translate([cellOriginCommon[0], cellOriginCommon[1], 0]).scale([cellSizeCommon[0], cellSizeCommon[1], zOffset]);
    const lineLayer = lines && lines.length > 0 && new LinesSubLayerClass(this.getSubLayerProps({
      id: "lines"
    }), {
      data: lines,
      coordinateSystem: import_core7.COORDINATE_SYSTEM.CARTESIAN,
      modelMatrix,
      getPath: (d) => d.vertices,
      getColor: (d) => d.contour.color ?? DEFAULT_COLOR,
      getWidth: (d) => d.contour.strokeWidth ?? DEFAULT_STROKE_WIDTH,
      widthUnits: "pixels"
    });
    const bandsLayer = polygons && polygons.length > 0 && new BandsSubLayerClass(this.getSubLayerProps({
      id: "bands"
    }), {
      data: polygons,
      coordinateSystem: import_core7.COORDINATE_SYSTEM.CARTESIAN,
      modelMatrix,
      getPolygon: (d) => d.vertices,
      getFillColor: (d) => d.contour.color ?? DEFAULT_COLOR
    });
    return [lineLayer, bandsLayer];
  }
  getPickingInfo(params) {
    const info = params.info;
    const { object } = info;
    if (object) {
      info.object = {
        contour: object.contour
      };
    }
    return info;
  }
};
GridLayer.layerName = "ContourLayer";
GridLayer.defaultProps = defaultProps3;
var contour_layer_default = GridLayer;

// dist/grid-layer/grid-layer.js
var import_core9 = require("@deck.gl/core");

// dist/grid-layer/grid-cell-layer.js
var import_layers3 = require("@deck.gl/layers");
var import_engine4 = require("@luma.gl/engine");

// dist/grid-layer/grid-cell-layer-vertex.glsl.js
var grid_cell_layer_vertex_glsl_default = (
  /* glsl */
  `#version 300 es
#define SHADER_NAME grid-cell-layer-vertex-shader
in vec3 positions;
in vec3 normals;
in vec2 instancePositions;
in float instanceElevationValues;
in float instanceColorValues;
in vec3 instancePickingColors;
uniform sampler2D colorRange;
out vec4 vColor;
float interp(float value, vec2 domain, vec2 range) {
float r = min(max((value - domain.x) / (domain.y - domain.x), 0.), 1.);
return mix(range.x, range.y, r);
}
vec4 interp(float value, vec2 domain, sampler2D range) {
float r = (value - domain.x) / (domain.y - domain.x);
return texture(range, vec2(r, 0.5));
}
void main(void) {
geometry.pickingColor = instancePickingColors;
if (isnan(instanceColorValues) ||
instanceColorValues < grid.colorDomain.z ||
instanceColorValues > grid.colorDomain.w ||
instanceElevationValues < grid.elevationDomain.z ||
instanceElevationValues > grid.elevationDomain.w
) {
gl_Position = vec4(0.);
return;
}
vec2 commonPosition = (instancePositions + (positions.xy + 1.0) / 2.0 * column.coverage) * grid.sizeCommon + grid.originCommon - project.commonOrigin.xy;
geometry.position = vec4(commonPosition, 0.0, 1.0);
geometry.normal = project_normal(normals);
float elevation = 0.0;
if (column.extruded) {
elevation = interp(instanceElevationValues, grid.elevationDomain.xy, grid.elevationRange);
elevation = project_size(elevation);
geometry.position.z = (positions.z + 1.0) / 2.0 * elevation;
}
gl_Position = project_common_position_to_clipspace(geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
vColor = interp(instanceColorValues, grid.colorDomain.xy, colorRange);
vColor.a *= layer.opacity;
if (column.extruded) {
vColor.rgb = lighting_getLightColor(vColor.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);
}
DECKGL_FILTER_COLOR(vColor, geometry);
}
`
);

// dist/grid-layer/grid-layer-uniforms.js
var uniformBlock8 = (
  /* glsl */
  `uniform gridUniforms {
  vec4 colorDomain;
  vec4 elevationDomain;
  vec2 elevationRange;
  vec2 originCommon;
  vec2 sizeCommon;
} grid;
`
);
var gridUniforms = {
  name: "grid",
  vs: uniformBlock8,
  uniformTypes: {
    colorDomain: "vec4<f32>",
    elevationDomain: "vec4<f32>",
    elevationRange: "vec2<f32>",
    originCommon: "vec2<f32>",
    sizeCommon: "vec2<f32>"
  }
};

// dist/grid-layer/grid-cell-layer.js
var GridCellLayer = class extends import_layers3.ColumnLayer {
  getShaders() {
    const shaders = super.getShaders();
    shaders.modules.push(gridUniforms);
    return { ...shaders, vs: grid_cell_layer_vertex_glsl_default };
  }
  initializeState() {
    super.initializeState();
    const attributeManager = this.getAttributeManager();
    attributeManager.remove([
      "instanceElevations",
      "instanceFillColors",
      "instanceLineColors",
      "instanceStrokeWidths"
    ]);
    attributeManager.addInstanced({
      instancePositions: {
        size: 2,
        type: "float32",
        accessor: "getBin"
      },
      instanceColorValues: {
        size: 1,
        type: "float32",
        accessor: "getColorValue"
      },
      instanceElevationValues: {
        size: 1,
        type: "float32",
        accessor: "getElevationValue"
      }
    });
  }
  updateState(params) {
    var _a;
    super.updateState(params);
    const { props, oldProps } = params;
    const model = this.state.fillModel;
    if (oldProps.colorRange !== props.colorRange) {
      (_a = this.state.colorTexture) == null ? void 0 : _a.destroy();
      this.state.colorTexture = createColorRangeTexture(this.context.device, props.colorRange, props.colorScaleType);
      const gridProps = { colorRange: this.state.colorTexture };
      model.shaderInputs.setProps({ grid: gridProps });
    } else if (oldProps.colorScaleType !== props.colorScaleType) {
      updateColorRangeTexture(this.state.colorTexture, props.colorScaleType);
    }
  }
  finalizeState(context) {
    var _a;
    super.finalizeState(context);
    (_a = this.state.colorTexture) == null ? void 0 : _a.destroy();
  }
  _updateGeometry() {
    const geometry = new import_engine4.CubeGeometry();
    this.state.fillModel.setGeometry(geometry);
  }
  draw({ uniforms }) {
    const { cellOriginCommon, cellSizeCommon, elevationRange, elevationScale, extruded, coverage, colorDomain, elevationDomain } = this.props;
    const colorCutoff = this.props.colorCutoff || [-Infinity, Infinity];
    const elevationCutoff = this.props.elevationCutoff || [-Infinity, Infinity];
    const fillModel = this.state.fillModel;
    const gridProps = {
      colorDomain: [
        Math.max(colorDomain[0], colorCutoff[0]),
        // instanceColorValue that maps to colorRange[0]
        Math.min(colorDomain[1], colorCutoff[1]),
        // instanceColorValue that maps to colorRange[colorRange.length - 1]
        Math.max(colorDomain[0] - 1, colorCutoff[0]),
        // hide cell if instanceColorValue is less than this
        Math.min(colorDomain[1] + 1, colorCutoff[1])
        // hide cell if instanceColorValue is greater than this
      ],
      elevationDomain: [
        Math.max(elevationDomain[0], elevationCutoff[0]),
        // instanceElevationValue that maps to elevationRange[0]
        Math.min(elevationDomain[1], elevationCutoff[1]),
        // instanceElevationValue that maps to elevationRange[elevationRange.length - 1]
        Math.max(elevationDomain[0] - 1, elevationCutoff[0]),
        // hide cell if instanceElevationValue is less than this
        Math.min(elevationDomain[1] + 1, elevationCutoff[1])
        // hide cell if instanceElevationValue is greater than this
      ],
      elevationRange: [elevationRange[0] * elevationScale, elevationRange[1] * elevationScale],
      originCommon: cellOriginCommon,
      sizeCommon: cellSizeCommon
    };
    fillModel.shaderInputs.setProps({
      column: { extruded, coverage },
      grid: gridProps
    });
    fillModel.draw(this.context.renderPass);
  }
};
GridCellLayer.layerName = "GridCellLayer";

// dist/grid-layer/bin-options-uniforms.js
var uniformBlock9 = (
  /* glsl */
  `uniform binOptionsUniforms {
  vec2 cellOriginCommon;
  vec2 cellSizeCommon;
} binOptions;
`
);
var binOptionsUniforms4 = {
  name: "binOptions",
  vs: uniformBlock9,
  uniformTypes: {
    cellOriginCommon: "vec2<f32>",
    cellSizeCommon: "vec2<f32>"
  }
};

// dist/grid-layer/grid-layer.js
function noop2() {
}
var defaultProps4 = {
  gpuAggregation: true,
  // color
  colorDomain: null,
  colorRange: defaultColorRange,
  getColorValue: { type: "accessor", value: null },
  // default value is calculated from `getColorWeight` and `colorAggregation`
  getColorWeight: { type: "accessor", value: 1 },
  colorAggregation: "SUM",
  lowerPercentile: { type: "number", min: 0, max: 100, value: 0 },
  upperPercentile: { type: "number", min: 0, max: 100, value: 100 },
  colorScaleType: "quantize",
  onSetColorDomain: noop2,
  // elevation
  elevationDomain: null,
  elevationRange: [0, 1e3],
  getElevationValue: { type: "accessor", value: null },
  // default value is calculated from `getElevationWeight` and `elevationAggregation`
  getElevationWeight: { type: "accessor", value: 1 },
  elevationAggregation: "SUM",
  elevationScale: { type: "number", min: 0, value: 1 },
  elevationLowerPercentile: { type: "number", min: 0, max: 100, value: 0 },
  elevationUpperPercentile: { type: "number", min: 0, max: 100, value: 100 },
  elevationScaleType: "linear",
  onSetElevationDomain: noop2,
  // grid
  cellSize: { type: "number", min: 0, value: 1e3 },
  coverage: { type: "number", min: 0, max: 1, value: 1 },
  getPosition: { type: "accessor", value: (x) => x.position },
  gridAggregator: { type: "function", optional: true, value: null },
  extruded: false,
  // Optional material for 'lighting' shader module
  material: true
};
var GridLayer2 = class extends aggregation_layer_default {
  getAggregatorType() {
    const { gpuAggregation, gridAggregator, getColorValue, getElevationValue } = this.props;
    if (gpuAggregation && (gridAggregator || getColorValue || getElevationValue)) {
      import_core9.log.warn("Features not supported by GPU aggregation, falling back to CPU")();
      return "cpu";
    }
    if (
      // GPU aggregation is requested
      gpuAggregation && // GPU aggregation is supported by the device
      WebGLAggregator.isSupported(this.context.device)
    ) {
      return "gpu";
    }
    return "cpu";
  }
  createAggregator(type) {
    if (type === "cpu") {
      const { gridAggregator, cellSize } = this.props;
      return new CPUAggregator({
        dimensions: 2,
        getBin: {
          sources: ["positions"],
          getValue: ({ positions }, index, opts) => {
            if (gridAggregator) {
              return gridAggregator(positions, cellSize);
            }
            const viewport = this.state.aggregatorViewport;
            const p = viewport.projectPosition(positions);
            const { cellSizeCommon, cellOriginCommon } = opts;
            return [
              Math.floor((p[0] - cellOriginCommon[0]) / cellSizeCommon[0]),
              Math.floor((p[1] - cellOriginCommon[1]) / cellSizeCommon[1])
            ];
          }
        },
        getValue: [
          { sources: ["colorWeights"], getValue: ({ colorWeights }) => colorWeights },
          { sources: ["elevationWeights"], getValue: ({ elevationWeights }) => elevationWeights }
        ]
      });
    }
    return new WebGLAggregator(this.context.device, {
      dimensions: 2,
      channelCount: 2,
      bufferLayout: this.getAttributeManager().getBufferLayouts({ isInstanced: false }),
      ...super.getShaders({
        modules: [import_core9.project32, binOptionsUniforms4],
        vs: (
          /* glsl */
          `
  in vec3 positions;
  in vec3 positions64Low;
  in float colorWeights;
  in float elevationWeights;

  void getBin(out ivec2 binId) {
    vec3 positionCommon = project_position(positions, positions64Low);
    vec2 gridCoords = floor(positionCommon.xy / binOptions.cellSizeCommon);
    binId = ivec2(gridCoords);
  }
  void getValue(out vec2 value) {
    value = vec2(colorWeights, elevationWeights);
  }
  `
        )
      })
    });
  }
  initializeState() {
    super.initializeState();
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: {
        size: 3,
        accessor: "getPosition",
        type: "float64",
        fp64: this.use64bitPositions()
      },
      colorWeights: { size: 1, accessor: "getColorWeight" },
      elevationWeights: { size: 1, accessor: "getElevationWeight" }
    });
  }
  updateState(params) {
    const aggregatorChanged = super.updateState(params);
    const { props, oldProps, changeFlags } = params;
    const { aggregator } = this.state;
    if ((changeFlags.dataChanged || !this.state.dataAsArray) && (props.getColorValue || props.getElevationValue)) {
      this.state.dataAsArray = Array.from((0, import_core9.createIterable)(props.data).iterable);
    }
    if (aggregatorChanged || changeFlags.dataChanged || props.cellSize !== oldProps.cellSize || props.getColorValue !== oldProps.getColorValue || props.getElevationValue !== oldProps.getElevationValue || props.colorAggregation !== oldProps.colorAggregation || props.elevationAggregation !== oldProps.elevationAggregation) {
      this._updateBinOptions();
      const { cellSizeCommon, cellOriginCommon, binIdRange, dataAsArray } = this.state;
      aggregator.setProps({
        // @ts-expect-error only used by GPUAggregator
        binIdRange,
        pointCount: this.getNumInstances(),
        operations: [props.colorAggregation, props.elevationAggregation],
        binOptions: {
          cellSizeCommon,
          cellOriginCommon
        },
        onUpdate: this._onAggregationUpdate.bind(this)
      });
      if (dataAsArray) {
        const { getColorValue, getElevationValue } = this.props;
        aggregator.setProps({
          // @ts-expect-error only used by CPUAggregator
          customOperations: [
            getColorValue && ((indices) => getColorValue(indices.map((i) => dataAsArray[i]), { indices, data: props.data })),
            getElevationValue && ((indices) => getElevationValue(indices.map((i) => dataAsArray[i]), { indices, data: props.data }))
          ]
        });
      }
    }
    if (changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.getColorValue) {
      aggregator.setNeedsUpdate(0);
    }
    if (changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.getElevationValue) {
      aggregator.setNeedsUpdate(1);
    }
    return aggregatorChanged;
  }
  _updateBinOptions() {
    const bounds = this.getBounds();
    const cellSizeCommon = [1, 1];
    let cellOriginCommon = [0, 0];
    let binIdRange = [
      [0, 1],
      [0, 1]
    ];
    let viewport = this.context.viewport;
    if (bounds && Number.isFinite(bounds[0][0])) {
      let centroid = [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2];
      const { cellSize } = this.props;
      const { unitsPerMeter } = viewport.getDistanceScales(centroid);
      cellSizeCommon[0] = unitsPerMeter[0] * cellSize;
      cellSizeCommon[1] = unitsPerMeter[1] * cellSize;
      const centroidCommon = viewport.projectFlat(centroid);
      cellOriginCommon = [
        Math.floor(centroidCommon[0] / cellSizeCommon[0]) * cellSizeCommon[0],
        Math.floor(centroidCommon[1] / cellSizeCommon[1]) * cellSizeCommon[1]
      ];
      centroid = viewport.unprojectFlat(cellOriginCommon);
      const ViewportType = viewport.constructor;
      viewport = viewport.isGeospatial ? new ViewportType({ longitude: centroid[0], latitude: centroid[1], zoom: 12 }) : new import_core9.Viewport({ position: [centroid[0], centroid[1], 0], zoom: 12 });
      cellOriginCommon = [Math.fround(viewport.center[0]), Math.fround(viewport.center[1])];
      binIdRange = getBinIdRange({
        dataBounds: bounds,
        getBinId: (p) => {
          const positionCommon = viewport.projectFlat(p);
          return [
            Math.floor((positionCommon[0] - cellOriginCommon[0]) / cellSizeCommon[0]),
            Math.floor((positionCommon[1] - cellOriginCommon[1]) / cellSizeCommon[1])
          ];
        }
      });
    }
    this.setState({ cellSizeCommon, cellOriginCommon, binIdRange, aggregatorViewport: viewport });
  }
  draw(opts) {
    if (opts.shaderModuleProps.project) {
      opts.shaderModuleProps.project.viewport = this.state.aggregatorViewport;
    }
    super.draw(opts);
  }
  _onAggregationUpdate({ channel }) {
    const props = this.getCurrentLayer().props;
    const { aggregator } = this.state;
    if (channel === 0) {
      const result = aggregator.getResult(0);
      this.setState({
        colors: new AttributeWithScale(result, aggregator.binCount)
      });
      props.onSetColorDomain(aggregator.getResultDomain(0));
    } else if (channel === 1) {
      const result = aggregator.getResult(1);
      this.setState({
        elevations: new AttributeWithScale(result, aggregator.binCount)
      });
      props.onSetElevationDomain(aggregator.getResultDomain(1));
    }
  }
  onAttributeChange(id) {
    const { aggregator } = this.state;
    switch (id) {
      case "positions":
        aggregator.setNeedsUpdate();
        this._updateBinOptions();
        const { cellSizeCommon, cellOriginCommon, binIdRange } = this.state;
        aggregator.setProps({
          // @ts-expect-error only used by GPUAggregator
          binIdRange,
          binOptions: {
            cellSizeCommon,
            cellOriginCommon
          }
        });
        break;
      case "colorWeights":
        aggregator.setNeedsUpdate(0);
        break;
      case "elevationWeights":
        aggregator.setNeedsUpdate(1);
        break;
      default:
    }
  }
  renderLayers() {
    var _a, _b;
    const { aggregator, cellOriginCommon, cellSizeCommon } = this.state;
    const { elevationScale, colorRange, elevationRange, extruded, coverage, material, transitions, colorScaleType, lowerPercentile, upperPercentile, colorDomain, elevationScaleType, elevationLowerPercentile, elevationUpperPercentile, elevationDomain } = this.props;
    const CellLayerClass = this.getSubLayerClass("cells", GridCellLayer);
    const binAttribute = aggregator.getBins();
    const colors = (_a = this.state.colors) == null ? void 0 : _a.update({
      scaleType: colorScaleType,
      lowerPercentile,
      upperPercentile
    });
    const elevations = (_b = this.state.elevations) == null ? void 0 : _b.update({
      scaleType: elevationScaleType,
      lowerPercentile: elevationLowerPercentile,
      upperPercentile: elevationUpperPercentile
    });
    if (!colors || !elevations) {
      return null;
    }
    return new CellLayerClass(this.getSubLayerProps({
      id: "cells"
    }), {
      data: {
        length: aggregator.binCount,
        attributes: {
          getBin: binAttribute,
          getColorValue: colors.attribute,
          getElevationValue: elevations.attribute
        }
      },
      // Data has changed shallowly, but we likely don't need to update the attributes
      dataComparator: (data, oldData) => data.length === oldData.length,
      updateTriggers: {
        getBin: [binAttribute],
        getColorValue: [colors.attribute],
        getElevationValue: [elevations.attribute]
      },
      cellOriginCommon,
      cellSizeCommon,
      elevationScale,
      colorRange,
      colorScaleType,
      elevationRange,
      extruded,
      coverage,
      material,
      colorDomain: colors.domain || colorDomain || aggregator.getResultDomain(0),
      elevationDomain: elevations.domain || elevationDomain || aggregator.getResultDomain(1),
      colorCutoff: colors.cutoff,
      elevationCutoff: elevations.cutoff,
      transitions: transitions && {
        getFillColor: transitions.getColorValue || transitions.getColorWeight,
        getElevation: transitions.getElevationValue || transitions.getElevationWeight
      },
      // Extensions are already handled by the GPUAggregator, do not pass it down
      extensions: []
    });
  }
  getPickingInfo(params) {
    const info = params.info;
    const { index } = info;
    if (index >= 0) {
      const bin = this.state.aggregator.getBin(index);
      let object;
      if (bin) {
        object = {
          col: bin.id[0],
          row: bin.id[1],
          colorValue: bin.value[0],
          elevationValue: bin.value[1],
          count: bin.count
        };
        if (bin.pointIndices) {
          object.pointIndices = bin.pointIndices;
          object.points = Array.isArray(this.props.data) ? bin.pointIndices.map((i) => this.props.data[i]) : [];
        }
      }
      info.object = object;
    }
    return info;
  }
};
GridLayer2.layerName = "GridLayer";
GridLayer2.defaultProps = defaultProps4;
var grid_layer_default = GridLayer2;

// dist/heatmap-layer/heatmap-layer-utils.js
function getBounds(points) {
  const x = points.map((p) => p[0]);
  const y = points.map((p) => p[1]);
  const xMin = Math.min.apply(null, x);
  const xMax = Math.max.apply(null, x);
  const yMin = Math.min.apply(null, y);
  const yMax = Math.max.apply(null, y);
  return [xMin, yMin, xMax, yMax];
}
function boundsContain(currentBounds, targetBounds) {
  if (targetBounds[0] >= currentBounds[0] && targetBounds[2] <= currentBounds[2] && targetBounds[1] >= currentBounds[1] && targetBounds[3] <= currentBounds[3]) {
    return true;
  }
  return false;
}
var scratchArray = new Float32Array(12);
function packVertices(points, dimensions = 2) {
  let index = 0;
  for (const point of points) {
    for (let i = 0; i < dimensions; i++) {
      scratchArray[index++] = point[i] || 0;
    }
  }
  return scratchArray;
}
function scaleToAspectRatio(boundingBox, width, height) {
  const [xMin, yMin, xMax, yMax] = boundingBox;
  const currentWidth = xMax - xMin;
  const currentHeight = yMax - yMin;
  let newWidth = currentWidth;
  let newHeight = currentHeight;
  if (currentWidth / currentHeight < width / height) {
    newWidth = width / height * currentHeight;
  } else {
    newHeight = height / width * currentWidth;
  }
  if (newWidth < width) {
    newWidth = width;
    newHeight = height;
  }
  const xCenter = (xMax + xMin) / 2;
  const yCenter = (yMax + yMin) / 2;
  return [
    xCenter - newWidth / 2,
    yCenter - newHeight / 2,
    xCenter + newWidth / 2,
    yCenter + newHeight / 2
  ];
}
function getTextureCoordinates(point, bounds) {
  const [xMin, yMin, xMax, yMax] = bounds;
  return [(point[0] - xMin) / (xMax - xMin), (point[1] - yMin) / (yMax - yMin)];
}

// dist/heatmap-layer/heatmap-layer.js
var import_engine6 = require("@luma.gl/engine");
var import_core12 = require("@deck.gl/core");

// dist/heatmap-layer/triangle-layer.js
var import_engine5 = require("@luma.gl/engine");
var import_core10 = require("@deck.gl/core");

// dist/heatmap-layer/triangle-layer-vertex.glsl.js
var triangle_layer_vertex_glsl_default = `#version 300 es
#define SHADER_NAME heatp-map-layer-vertex-shader
uniform sampler2D maxTexture;
in vec3 positions;
in vec2 texCoords;
out vec2 vTexCoords;
out float vIntensityMin;
out float vIntensityMax;
void main(void) {
gl_Position = project_position_to_clipspace(positions, vec3(0.0), vec3(0.0));
vTexCoords = texCoords;
vec4 maxTexture = texture(maxTexture, vec2(0.5));
float maxValue = triangle.aggregationMode < 0.5 ? maxTexture.r : maxTexture.g;
float minValue = maxValue * triangle.threshold;
if (triangle.colorDomain[1] > 0.) {
maxValue = triangle.colorDomain[1];
minValue = triangle.colorDomain[0];
}
vIntensityMax = triangle.intensity / maxValue;
vIntensityMin = triangle.intensity / minValue;
}
`;

// dist/heatmap-layer/triangle-layer-fragment.glsl.js
var triangle_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME triangle-layer-fragment-shader
precision highp float;
uniform sampler2D weightsTexture;
uniform sampler2D colorTexture;
in vec2 vTexCoords;
in float vIntensityMin;
in float vIntensityMax;
out vec4 fragColor;
vec4 getLinearColor(float value) {
float factor = clamp(value * vIntensityMax, 0., 1.);
vec4 color = texture(colorTexture, vec2(factor, 0.5));
color.a *= min(value * vIntensityMin, 1.0);
return color;
}
void main(void) {
vec4 weights = texture(weightsTexture, vTexCoords);
float weight = weights.r;
if (triangle.aggregationMode > 0.5) {
weight /= max(1.0, weights.a);
}
if (weight <= 0.) {
discard;
}
vec4 linearColor = getLinearColor(weight);
linearColor.a *= layer.opacity;
fragColor = linearColor;
}
`;

// dist/heatmap-layer/triangle-layer-uniforms.js
var uniformBlock10 = `uniform triangleUniforms {
  float aggregationMode;
  vec2 colorDomain;
  float intensity;
  float threshold;
} triangle;
`;
var triangleUniforms = {
  name: "triangle",
  vs: uniformBlock10,
  fs: uniformBlock10,
  uniformTypes: {
    aggregationMode: "f32",
    colorDomain: "vec2<f32>",
    intensity: "f32",
    threshold: "f32"
  }
};

// dist/heatmap-layer/triangle-layer.js
var TriangleLayer = class extends import_core10.Layer {
  getShaders() {
    return super.getShaders({ vs: triangle_layer_vertex_glsl_default, fs: triangle_layer_fragment_glsl_default, modules: [import_core10.project32, triangleUniforms] });
  }
  initializeState({ device }) {
    this.setState({ model: this._getModel(device) });
  }
  _getModel(device) {
    const { vertexCount, data } = this.props;
    return new import_engine5.Model(device, {
      ...this.getShaders(),
      id: this.props.id,
      attributes: data.attributes,
      bufferLayout: [
        { name: "positions", format: "float32x3" },
        { name: "texCoords", format: "float32x2" }
      ],
      topology: "triangle-strip",
      vertexCount
    });
  }
  draw() {
    const { model } = this.state;
    const { aggregationMode, colorDomain, intensity, threshold: threshold2, colorTexture, maxTexture, weightsTexture } = this.props;
    const triangleProps = {
      aggregationMode,
      colorDomain,
      intensity,
      threshold: threshold2,
      colorTexture,
      maxTexture,
      weightsTexture
    };
    model.shaderInputs.setProps({ triangle: triangleProps });
    model.draw(this.context.renderPass);
  }
};
TriangleLayer.layerName = "TriangleLayer";
var triangle_layer_default = TriangleLayer;

// dist/heatmap-layer/aggregation-layer.js
var import_core11 = require("@deck.gl/core");

// dist/common/utils/prop-utils.js
function filterProps(props, filterKeys) {
  const filteredProps = {};
  for (const key in props) {
    if (!filterKeys.includes(key)) {
      filteredProps[key] = props[key];
    }
  }
  return filteredProps;
}

// dist/heatmap-layer/aggregation-layer.js
var AggregationLayer2 = class extends import_core11.CompositeLayer {
  initializeAggregationLayer(dimensions) {
    super.initializeState(this.context);
    this.setState({
      // Layer props , when changed doesn't require updating aggregation
      ignoreProps: filterProps(this.constructor._propTypes, dimensions.data.props),
      dimensions
    });
  }
  updateState(opts) {
    super.updateState(opts);
    const { changeFlags } = opts;
    if (changeFlags.extensionsChanged) {
      const shaders = this.getShaders({});
      if (shaders && shaders.defines) {
        shaders.defines.NON_INSTANCED_MODEL = 1;
      }
      this.updateShaders(shaders);
    }
    this._updateAttributes();
  }
  updateAttributes(changedAttributes) {
    this.setState({ changedAttributes });
  }
  getAttributes() {
    return this.getAttributeManager().getAttributes();
  }
  getModuleSettings() {
    const { viewport, mousePosition, device } = this.context;
    const moduleSettings = Object.assign(Object.create(this.props), {
      viewport,
      mousePosition,
      picking: {
        isActive: 0
      },
      // @ts-expect-error TODO - assuming WebGL context
      devicePixelRatio: device.canvasContext.cssToDeviceRatio()
    });
    return moduleSettings;
  }
  updateShaders(shaders) {
  }
  /**
   * Checks if aggregation is dirty
   * @param {Object} updateOpts - object {props, oldProps, changeFlags}
   * @param {Object} params - object {dimension, compareAll}
   * @param {Object} params.dimension - {props, accessors} array of props and/or accessors
   * @param {Boolean} params.compareAll - when `true` it will include non layer props for comparision
   * @returns {Boolean} - returns true if dimensions' prop or accessor is changed
   **/
  isAggregationDirty(updateOpts, params = {}) {
    const { props, oldProps, changeFlags } = updateOpts;
    const { compareAll = false, dimension } = params;
    const { ignoreProps } = this.state;
    const { props: dataProps, accessors = [] } = dimension;
    const { updateTriggersChanged } = changeFlags;
    if (changeFlags.dataChanged) {
      return true;
    }
    if (updateTriggersChanged) {
      if (updateTriggersChanged.all) {
        return true;
      }
      for (const accessor of accessors) {
        if (updateTriggersChanged[accessor]) {
          return true;
        }
      }
    }
    if (compareAll) {
      if (changeFlags.extensionsChanged) {
        return true;
      }
      return (0, import_core11._compareProps)({
        oldProps,
        newProps: props,
        ignoreProps,
        propTypes: this.constructor._propTypes
      });
    }
    for (const name of dataProps) {
      if (props[name] !== oldProps[name]) {
        return true;
      }
    }
    return false;
  }
  /**
   * Checks if an attribute is changed
   * @param {String} name - name of the attribute
   * @returns {Boolean} - `true` if attribute `name` is changed, `false` otherwise,
   *                       If `name` is not passed or `undefiend`, `true` if any attribute is changed, `false` otherwise
   **/
  isAttributeChanged(name) {
    const { changedAttributes } = this.state;
    if (!name) {
      return !isObjectEmpty(changedAttributes);
    }
    return changedAttributes && changedAttributes[name] !== void 0;
  }
  // Private
  // override Composite layer private method to create AttributeManager instance
  _getAttributeManager() {
    return new import_core11.AttributeManager(this.context.device, {
      id: this.props.id,
      stats: this.context.stats
    });
  }
};
AggregationLayer2.layerName = "AggregationLayer";
var aggregation_layer_default2 = AggregationLayer2;
function isObjectEmpty(obj) {
  let isEmpty = true;
  for (const key in obj) {
    isEmpty = false;
    break;
  }
  return isEmpty;
}

// dist/heatmap-layer/weights-vs.glsl.js
var weights_vs_glsl_default = `#version 300 es
in vec3 positions;
in vec3 positions64Low;
in float weights;
out vec4 weightsTexture;
void main()
{
weightsTexture = vec4(weights * weight.weightsScale, 0., 0., 1.);
float radiusTexels = project_pixel_size(weight.radiusPixels) * weight.textureWidth / (weight.commonBounds.z - weight.commonBounds.x);
gl_PointSize = radiusTexels * 2.;
vec3 commonPosition = project_position(positions, positions64Low);
gl_Position.xy = (commonPosition.xy - weight.commonBounds.xy) / (weight.commonBounds.zw - weight.commonBounds.xy) ;
gl_Position.xy = (gl_Position.xy * 2.) - (1.);
gl_Position.w = 1.0;
}
`;

// dist/heatmap-layer/weights-fs.glsl.js
var weights_fs_glsl_default = `#version 300 es
in vec4 weightsTexture;
out vec4 fragColor;
float gaussianKDE(float u){
return pow(2.71828, -u*u/0.05555)/(1.77245385*0.166666);
}
void main()
{
float dist = length(gl_PointCoord - vec2(0.5, 0.5));
if (dist > 0.5) {
discard;
}
fragColor = weightsTexture * gaussianKDE(2. * dist);
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// dist/heatmap-layer/max-vs.glsl.js
var max_vs_glsl_default = `#version 300 es
uniform sampler2D inTexture;
out vec4 outTexture;
void main()
{
int yIndex = gl_VertexID / int(maxWeight.textureSize);
int xIndex = gl_VertexID - (yIndex * int(maxWeight.textureSize));
vec2 uv = (0.5 + vec2(float(xIndex), float(yIndex))) / maxWeight.textureSize;
outTexture = texture(inTexture, uv);
gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
gl_PointSize = 1.0;
}
`;

// dist/heatmap-layer/max-fs.glsl.js
var max_fs_glsl_default = `#version 300 es
in vec4 outTexture;
out vec4 fragColor;
void main() {
fragColor = outTexture;
fragColor.g = outTexture.r / max(1.0, outTexture.a);
}
`;

// dist/heatmap-layer/heatmap-layer-uniforms.js
var uniformBlock11 = `uniform weightUniforms {
  vec4 commonBounds;
  float radiusPixels;
  float textureWidth;
  float weightsScale;
} weight;
`;
var weightUniforms = {
  name: "weight",
  vs: uniformBlock11,
  uniformTypes: {
    commonBounds: "vec4<f32>",
    radiusPixels: "f32",
    textureWidth: "f32",
    weightsScale: "f32"
  }
};
var maxWeightUniforms = {
  name: "maxWeight",
  vs: `uniform maxWeightUniforms {
  float textureSize;
} maxWeight;
`,
  uniformTypes: {
    textureSize: "f32"
  }
};

// dist/heatmap-layer/heatmap-layer.js
var RESOLUTION = 2;
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
var DEFAULT_COLOR_DOMAIN = [0, 0];
var AGGREGATION_MODE = {
  SUM: 0,
  MEAN: 1
};
var defaultProps5 = {
  getPosition: { type: "accessor", value: (x) => x.position },
  getWeight: { type: "accessor", value: 1 },
  intensity: { type: "number", min: 0, value: 1 },
  radiusPixels: { type: "number", min: 1, max: 100, value: 50 },
  colorRange: defaultColorRange,
  threshold: { type: "number", min: 0, max: 1, value: 0.05 },
  colorDomain: { type: "array", value: null, optional: true },
  // 'SUM' or 'MEAN'
  aggregation: "SUM",
  weightsTextureSize: { type: "number", min: 128, max: 2048, value: 2048 },
  debounceTimeout: { type: "number", min: 0, max: 1e3, value: 500 }
};
var FLOAT_TARGET_FEATURES = [
  "float32-renderable-webgl",
  // ability to render to float texture
  "texture-blend-float-webgl"
  // ability to blend when rendering to float texture
];
var DIMENSIONS = {
  data: {
    props: ["radiusPixels"]
  }
};
var HeatmapLayer = class extends aggregation_layer_default2 {
  getShaders(shaders) {
    let modules = [import_core12.project32];
    if (shaders.modules) {
      modules = [...modules, ...shaders.modules];
    }
    return super.getShaders({ ...shaders, modules });
  }
  initializeState() {
    super.initializeAggregationLayer(DIMENSIONS);
    this.setState({ colorDomain: DEFAULT_COLOR_DOMAIN });
    this._setupTextureParams();
    this._setupAttributes();
    this._setupResources();
  }
  shouldUpdateState({ changeFlags }) {
    return changeFlags.somethingChanged;
  }
  /* eslint-disable max-statements,complexity */
  updateState(opts) {
    super.updateState(opts);
    this._updateHeatmapState(opts);
  }
  _updateHeatmapState(opts) {
    const { props, oldProps } = opts;
    const changeFlags = this._getChangeFlags(opts);
    if (changeFlags.dataChanged || changeFlags.viewportChanged) {
      changeFlags.boundsChanged = this._updateBounds(changeFlags.dataChanged);
      this._updateTextureRenderingBounds();
    }
    if (changeFlags.dataChanged || changeFlags.boundsChanged) {
      clearTimeout(this.state.updateTimer);
      this.setState({ isWeightMapDirty: true });
    } else if (changeFlags.viewportZoomChanged) {
      this._debouncedUpdateWeightmap();
    }
    if (props.colorRange !== oldProps.colorRange) {
      this._updateColorTexture(opts);
    }
    if (this.state.isWeightMapDirty) {
      this._updateWeightmap();
    }
    this.setState({ zoom: opts.context.viewport.zoom });
  }
  renderLayers() {
    const { weightsTexture, triPositionBuffer, triTexCoordBuffer, maxWeightsTexture, colorTexture, colorDomain } = this.state;
    const { updateTriggers, intensity, threshold: threshold2, aggregation } = this.props;
    const TriangleLayerClass = this.getSubLayerClass("triangle", triangle_layer_default);
    return new TriangleLayerClass(this.getSubLayerProps({
      id: "triangle-layer",
      updateTriggers
    }), {
      // position buffer is filled with world coordinates generated from viewport.unproject
      // i.e. LNGLAT if geospatial, CARTESIAN otherwise
      coordinateSystem: import_core12.COORDINATE_SYSTEM.DEFAULT,
      data: {
        attributes: {
          positions: triPositionBuffer,
          texCoords: triTexCoordBuffer
        }
      },
      vertexCount: 4,
      maxTexture: maxWeightsTexture,
      colorTexture,
      aggregationMode: AGGREGATION_MODE[aggregation] || 0,
      weightsTexture,
      intensity,
      threshold: threshold2,
      colorDomain
    });
  }
  finalizeState(context) {
    super.finalizeState(context);
    const { weightsTransform, weightsTexture, maxWeightTransform, maxWeightsTexture, triPositionBuffer, triTexCoordBuffer, colorTexture, updateTimer } = this.state;
    weightsTransform == null ? void 0 : weightsTransform.destroy();
    weightsTexture == null ? void 0 : weightsTexture.destroy();
    maxWeightTransform == null ? void 0 : maxWeightTransform.destroy();
    maxWeightsTexture == null ? void 0 : maxWeightsTexture.destroy();
    triPositionBuffer == null ? void 0 : triPositionBuffer.destroy();
    triTexCoordBuffer == null ? void 0 : triTexCoordBuffer.destroy();
    colorTexture == null ? void 0 : colorTexture.destroy();
    if (updateTimer) {
      clearTimeout(updateTimer);
    }
  }
  // PRIVATE
  // override Composite layer private method to create AttributeManager instance
  _getAttributeManager() {
    return new import_core12.AttributeManager(this.context.device, {
      id: this.props.id,
      stats: this.context.stats
    });
  }
  _getChangeFlags(opts) {
    const changeFlags = {};
    const { dimensions } = this.state;
    changeFlags.dataChanged = this.isAttributeChanged() && "attribute changed" || // if any attribute is changed
    this.isAggregationDirty(opts, {
      compareAll: true,
      dimension: dimensions.data
    }) && "aggregation is dirty";
    changeFlags.viewportChanged = opts.changeFlags.viewportChanged;
    const { zoom } = this.state;
    if (!opts.context.viewport || opts.context.viewport.zoom !== zoom) {
      changeFlags.viewportZoomChanged = true;
    }
    return changeFlags;
  }
  _createTextures() {
    const { textureSize, format } = this.state;
    this.setState({
      weightsTexture: this.context.device.createTexture({
        ...TEXTURE_PROPS,
        width: textureSize,
        height: textureSize,
        format
      }),
      maxWeightsTexture: this.context.device.createTexture({
        ...TEXTURE_PROPS,
        width: 1,
        height: 1,
        format
      })
    });
  }
  _setupAttributes() {
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: { size: 3, type: "float64", accessor: "getPosition" },
      weights: { size: 1, accessor: "getWeight" }
    });
    this.setState({ positionAttributeName: "positions" });
  }
  _setupTextureParams() {
    const { device } = this.context;
    const { weightsTextureSize } = this.props;
    const textureSize = Math.min(weightsTextureSize, device.limits.maxTextureDimension2D);
    const floatTargetSupport = FLOAT_TARGET_FEATURES.every((feature) => device.features.has(feature));
    const format = floatTargetSupport ? "rgba32float" : "rgba8unorm";
    const weightsScale = floatTargetSupport ? 1 : 1 / 255;
    this.setState({ textureSize, format, weightsScale });
    if (!floatTargetSupport) {
      import_core12.log.warn(`HeatmapLayer: ${this.id} rendering to float texture not supported, falling back to low precision format`)();
    }
  }
  _createWeightsTransform(shaders) {
    let { weightsTransform } = this.state;
    const { weightsTexture } = this.state;
    const attributeManager = this.getAttributeManager();
    weightsTransform == null ? void 0 : weightsTransform.destroy();
    weightsTransform = new import_engine6.TextureTransform(this.context.device, {
      id: `${this.id}-weights-transform`,
      bufferLayout: attributeManager.getBufferLayouts(),
      vertexCount: 1,
      targetTexture: weightsTexture,
      parameters: {
        depthWriteEnabled: false,
        blendColorOperation: "add",
        blendColorSrcFactor: "one",
        blendColorDstFactor: "one",
        blendAlphaSrcFactor: "one",
        blendAlphaDstFactor: "one"
      },
      topology: "point-list",
      ...shaders,
      modules: [...shaders.modules, weightUniforms]
    });
    this.setState({ weightsTransform });
  }
  _setupResources() {
    this._createTextures();
    const { device } = this.context;
    const { textureSize, weightsTexture, maxWeightsTexture } = this.state;
    const weightsTransformShaders = this.getShaders({
      vs: weights_vs_glsl_default,
      fs: weights_fs_glsl_default
    });
    this._createWeightsTransform(weightsTransformShaders);
    const maxWeightsTransformShaders = this.getShaders({
      vs: max_vs_glsl_default,
      fs: max_fs_glsl_default,
      modules: [maxWeightUniforms]
    });
    const maxWeightTransform = new import_engine6.TextureTransform(device, {
      id: `${this.id}-max-weights-transform`,
      targetTexture: maxWeightsTexture,
      ...maxWeightsTransformShaders,
      vertexCount: textureSize * textureSize,
      topology: "point-list",
      parameters: {
        depthWriteEnabled: false,
        blendColorOperation: "max",
        blendAlphaOperation: "max",
        blendColorSrcFactor: "one",
        blendColorDstFactor: "one",
        blendAlphaSrcFactor: "one",
        blendAlphaDstFactor: "one"
      }
    });
    const maxWeightProps = { inTexture: weightsTexture, textureSize };
    maxWeightTransform.model.shaderInputs.setProps({
      maxWeight: maxWeightProps
    });
    this.setState({
      weightsTexture,
      maxWeightsTexture,
      maxWeightTransform,
      zoom: null,
      triPositionBuffer: device.createBuffer({ byteLength: 48 }),
      triTexCoordBuffer: device.createBuffer({ byteLength: 48 })
    });
  }
  // overwrite super class method to update transform model
  updateShaders(shaderOptions) {
    this._createWeightsTransform({
      vs: weights_vs_glsl_default,
      fs: weights_fs_glsl_default,
      ...shaderOptions
    });
  }
  _updateMaxWeightValue() {
    const { maxWeightTransform } = this.state;
    maxWeightTransform.run({
      parameters: { viewport: [0, 0, 1, 1] },
      clearColor: [0, 0, 0, 0]
    });
  }
  // Computes world bounds area that needs to be processed for generate heatmap
  _updateBounds(forceUpdate = false) {
    const { viewport } = this.context;
    const viewportCorners = [
      viewport.unproject([0, 0]),
      viewport.unproject([viewport.width, 0]),
      viewport.unproject([0, viewport.height]),
      viewport.unproject([viewport.width, viewport.height])
    ].map((p) => p.map(Math.fround));
    const visibleWorldBounds = getBounds(viewportCorners);
    const newState = { visibleWorldBounds, viewportCorners };
    let boundsChanged = false;
    if (forceUpdate || !this.state.worldBounds || !boundsContain(this.state.worldBounds, visibleWorldBounds)) {
      const scaledCommonBounds = this._worldToCommonBounds(visibleWorldBounds);
      const worldBounds = this._commonToWorldBounds(scaledCommonBounds);
      if (this.props.coordinateSystem === import_core12.COORDINATE_SYSTEM.LNGLAT) {
        worldBounds[1] = Math.max(worldBounds[1], -85.051129);
        worldBounds[3] = Math.min(worldBounds[3], 85.051129);
        worldBounds[0] = Math.max(worldBounds[0], -360);
        worldBounds[2] = Math.min(worldBounds[2], 360);
      }
      const normalizedCommonBounds = this._worldToCommonBounds(worldBounds);
      newState.worldBounds = worldBounds;
      newState.normalizedCommonBounds = normalizedCommonBounds;
      boundsChanged = true;
    }
    this.setState(newState);
    return boundsChanged;
  }
  _updateTextureRenderingBounds() {
    const { triPositionBuffer, triTexCoordBuffer, normalizedCommonBounds, viewportCorners } = this.state;
    const { viewport } = this.context;
    triPositionBuffer.write(packVertices(viewportCorners, 3));
    const textureBounds = viewportCorners.map((p) => getTextureCoordinates(viewport.projectPosition(p), normalizedCommonBounds));
    triTexCoordBuffer.write(packVertices(textureBounds, 2));
  }
  _updateColorTexture(opts) {
    const { colorRange } = opts.props;
    let { colorTexture } = this.state;
    const colors = colorRangeToFlatArray(colorRange, false, Uint8Array);
    if (colorTexture && (colorTexture == null ? void 0 : colorTexture.width) === colorRange.length) {
      colorTexture.setTexture2DData({ data: colors });
    } else {
      colorTexture == null ? void 0 : colorTexture.destroy();
      colorTexture = this.context.device.createTexture({
        ...TEXTURE_PROPS,
        data: colors,
        width: colorRange.length,
        height: 1
      });
    }
    this.setState({ colorTexture });
  }
  _updateWeightmap() {
    const { radiusPixels, colorDomain, aggregation } = this.props;
    const { worldBounds, textureSize, weightsScale, weightsTexture } = this.state;
    const weightsTransform = this.state.weightsTransform;
    this.state.isWeightMapDirty = false;
    const commonBounds = this._worldToCommonBounds(worldBounds, {
      useLayerCoordinateSystem: true
    });
    if (colorDomain && aggregation === "SUM") {
      const { viewport: viewport2 } = this.context;
      const metersPerPixel = viewport2.distanceScales.metersPerUnit[2] * (commonBounds[2] - commonBounds[0]) / textureSize;
      this.state.colorDomain = colorDomain.map((x) => x * metersPerPixel * weightsScale);
    } else {
      this.state.colorDomain = colorDomain || DEFAULT_COLOR_DOMAIN;
    }
    const attributeManager = this.getAttributeManager();
    const attributes = attributeManager.getAttributes();
    const moduleSettings = this.getModuleSettings();
    this._setModelAttributes(weightsTransform.model, attributes);
    weightsTransform.model.setVertexCount(this.getNumInstances());
    const weightProps = {
      radiusPixels,
      commonBounds,
      textureWidth: textureSize,
      weightsScale,
      weightsTexture
    };
    const { viewport, devicePixelRatio, coordinateSystem, coordinateOrigin } = moduleSettings;
    const { modelMatrix } = this.props;
    weightsTransform.model.shaderInputs.setProps({
      project: { viewport, devicePixelRatio, modelMatrix, coordinateSystem, coordinateOrigin },
      weight: weightProps
    });
    weightsTransform.run({
      parameters: { viewport: [0, 0, textureSize, textureSize] },
      clearColor: [0, 0, 0, 0]
    });
    this._updateMaxWeightValue();
  }
  _debouncedUpdateWeightmap(fromTimer = false) {
    let { updateTimer } = this.state;
    const { debounceTimeout } = this.props;
    if (fromTimer) {
      updateTimer = null;
      this._updateBounds(true);
      this._updateTextureRenderingBounds();
      this.setState({ isWeightMapDirty: true });
    } else {
      this.setState({ isWeightMapDirty: false });
      clearTimeout(updateTimer);
      updateTimer = setTimeout(this._debouncedUpdateWeightmap.bind(this, true), debounceTimeout);
    }
    this.setState({ updateTimer });
  }
  // input: worldBounds: [minLong, minLat, maxLong, maxLat]
  // input: opts.useLayerCoordinateSystem : layers coordiante system is used
  // optput: commonBounds: [minX, minY, maxX, maxY] scaled to fit the current texture
  _worldToCommonBounds(worldBounds, opts = {}) {
    const { useLayerCoordinateSystem = false } = opts;
    const [minLong, minLat, maxLong, maxLat] = worldBounds;
    const { viewport } = this.context;
    const { textureSize } = this.state;
    const { coordinateSystem } = this.props;
    const offsetMode = useLayerCoordinateSystem && (coordinateSystem === import_core12.COORDINATE_SYSTEM.LNGLAT_OFFSETS || coordinateSystem === import_core12.COORDINATE_SYSTEM.METER_OFFSETS);
    const offsetOriginCommon = offsetMode ? viewport.projectPosition(this.props.coordinateOrigin) : [0, 0];
    const size = textureSize * RESOLUTION / viewport.scale;
    let bottomLeftCommon;
    let topRightCommon;
    if (useLayerCoordinateSystem && !offsetMode) {
      bottomLeftCommon = this.projectPosition([minLong, minLat, 0]);
      topRightCommon = this.projectPosition([maxLong, maxLat, 0]);
    } else {
      bottomLeftCommon = viewport.projectPosition([minLong, minLat, 0]);
      topRightCommon = viewport.projectPosition([maxLong, maxLat, 0]);
    }
    return scaleToAspectRatio([
      bottomLeftCommon[0] - offsetOriginCommon[0],
      bottomLeftCommon[1] - offsetOriginCommon[1],
      topRightCommon[0] - offsetOriginCommon[0],
      topRightCommon[1] - offsetOriginCommon[1]
    ], size, size);
  }
  // input commonBounds: [xMin, yMin, xMax, yMax]
  // output worldBounds: [minLong, minLat, maxLong, maxLat]
  _commonToWorldBounds(commonBounds) {
    const [xMin, yMin, xMax, yMax] = commonBounds;
    const { viewport } = this.context;
    const bottomLeftWorld = viewport.unprojectPosition([xMin, yMin]);
    const topRightWorld = viewport.unprojectPosition([xMax, yMax]);
    return bottomLeftWorld.slice(0, 2).concat(topRightWorld.slice(0, 2));
  }
};
HeatmapLayer.layerName = "HeatmapLayer";
HeatmapLayer.defaultProps = defaultProps5;
var heatmap_layer_default = HeatmapLayer;
//# sourceMappingURL=index.cjs.map
