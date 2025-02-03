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
  BrushingExtension: () => brushing_extension_default,
  ClipExtension: () => clip_extension_default,
  CollisionFilterExtension: () => collision_filter_extension_default,
  DataFilterExtension: () => data_filter_extension_default,
  FillStyleExtension: () => fill_style_extension_default,
  Fp64Extension: () => fp64_extension_default,
  MaskExtension: () => mask_extension_default,
  PathStyleExtension: () => path_style_extension_default,
  _TerrainExtension: () => terrain_extension_default,
  project64: () => project64_default
});
module.exports = __toCommonJS(dist_exports);

// dist/brushing/brushing-extension.js
var import_core2 = require("@deck.gl/core");

// dist/brushing/shader-module.js
var import_core = require("@deck.gl/core");
var uniformBlock = (
  /* glsl */
  `uniform brushingUniforms {
  bool enabled;
  highp int target;
  vec2 mousePos;
  float radius;
} brushing;
`
);
var vertex = (
  /* glsl */
  `
  in vec2 brushingTargets;

  out float brushing_isVisible;

  bool brushing_isPointInRange(vec2 position) {
    if (!brushing.enabled) {
      return true;
    }
    vec2 source_commonspace = project_position(position);
    vec2 target_commonspace = project_position(brushing.mousePos);
    float distance = length((target_commonspace - source_commonspace) / project.commonUnitsPerMeter.xy);

    return distance <= brushing.radius;
  }

  bool brushing_arePointsInRange(vec2 sourcePos, vec2 targetPos) {
    return brushing_isPointInRange(sourcePos) || brushing_isPointInRange(targetPos);
  }

  void brushing_setVisible(bool visible) {
    brushing_isVisible = float(visible);
  }
`
);
var vs = `
${uniformBlock}
${vertex}
`;
var fragment = (
  /* glsl */
  `
  in float brushing_isVisible;
`
);
var fs = `
${uniformBlock}
${fragment}
`;
var TARGET = {
  source: 0,
  target: 1,
  custom: 2,
  source_target: 3
};
var inject = {
  "vs:DECKGL_FILTER_GL_POSITION": (
    /* glsl */
    `
    vec2 brushingTarget;
    vec2 brushingSource;
    if (brushing.target == 3) {
      brushingTarget = geometry.worldPositionAlt.xy;
      brushingSource = geometry.worldPosition.xy;
    } else if (brushing.target == 0) {
      brushingTarget = geometry.worldPosition.xy;
    } else if (brushing.target == 1) {
      brushingTarget = geometry.worldPositionAlt.xy;
    } else {
      brushingTarget = brushingTargets;
    }
    bool visible;
    if (brushing.target == 3) {
      visible = brushing_arePointsInRange(brushingSource, brushingTarget);
    } else {
      visible = brushing_isPointInRange(brushingTarget);
    }
    brushing_setVisible(visible);
  `
  ),
  "fs:DECKGL_FILTER_COLOR": `
    if (brushing.enabled && brushing_isVisible < 0.5) {
      discard;
    }
  `
};
var shader_module_default = {
  name: "brushing",
  dependencies: [import_core.project],
  vs,
  fs,
  inject,
  getUniforms: (opts) => {
    if (!opts || !("viewport" in opts)) {
      return {};
    }
    const { brushingEnabled = true, brushingRadius = 1e4, brushingTarget = "source", mousePosition, viewport } = opts;
    return {
      enabled: Boolean(brushingEnabled && mousePosition && viewport.containsPixel(mousePosition)),
      radius: brushingRadius,
      target: TARGET[brushingTarget] || 0,
      mousePos: mousePosition ? viewport.unproject([mousePosition.x - viewport.x, mousePosition.y - viewport.y]) : [0, 0]
    };
  },
  uniformTypes: {
    enabled: "i32",
    target: "i32",
    mousePos: "vec2<f32>",
    radius: "f32"
  }
};

// dist/brushing/brushing-extension.js
var defaultProps = {
  getBrushingTarget: { type: "accessor", value: [0, 0] },
  brushingTarget: "source",
  brushingEnabled: true,
  brushingRadius: 1e4
};
var BrushingExtension = class extends import_core2.LayerExtension {
  getShaders() {
    return {
      modules: [shader_module_default]
    };
  }
  initializeState(context, extension) {
    const attributeManager = this.getAttributeManager();
    if (attributeManager) {
      attributeManager.add({
        brushingTargets: {
          size: 2,
          stepMode: "dynamic",
          accessor: "getBrushingTarget"
        }
      });
    }
    const onMouseMove = () => {
      var _a;
      (_a = this.getCurrentLayer()) == null ? void 0 : _a.setNeedsRedraw();
    };
    this.state.onMouseMove = onMouseMove;
    if (context.deck) {
      context.deck.eventManager.on({
        pointermove: onMouseMove,
        pointerleave: onMouseMove
      });
    }
  }
  finalizeState(context, extension) {
    if (context.deck) {
      const onMouseMove = this.state.onMouseMove;
      context.deck.eventManager.off({
        pointermove: onMouseMove,
        pointerleave: onMouseMove
      });
    }
  }
  draw(params, extension) {
    const { viewport, mousePosition } = params.context;
    const { brushingEnabled, brushingRadius, brushingTarget } = this.props;
    const brushingProps = {
      viewport,
      mousePosition,
      brushingEnabled,
      brushingRadius,
      brushingTarget
    };
    this.setShaderModuleProps({ brushing: brushingProps });
  }
};
BrushingExtension.defaultProps = defaultProps;
BrushingExtension.extensionName = "BrushingExtension";
var brushing_extension_default = BrushingExtension;

// dist/data-filter/data-filter-extension.js
var import_core3 = require("@deck.gl/core");

// dist/data-filter/shader-module.js
var uniformBlock2 = (
  /* glsl */
  `uniform dataFilterUniforms {
  bool useSoftMargin;
  bool enabled;
  bool transformSize;
  bool transformColor;
#ifdef DATAFILTER_TYPE
  DATAFILTER_TYPE min;
  DATAFILTER_TYPE softMin;
  DATAFILTER_TYPE softMax;
  DATAFILTER_TYPE max;
#ifdef DATAFILTER_DOUBLE
  DATAFILTER_TYPE min64High;
  DATAFILTER_TYPE max64High;
#endif
#endif
#ifdef DATACATEGORY_TYPE
  highp uvec4 categoryBitMask;
#endif
} dataFilter;
`
);
var vertex2 = (
  /* glsl */
  `
#ifdef DATAFILTER_TYPE
  in DATAFILTER_TYPE filterValues;
#ifdef DATAFILTER_DOUBLE
  in DATAFILTER_TYPE filterValues64Low;
#endif
#endif

#ifdef DATACATEGORY_TYPE
  in DATACATEGORY_TYPE filterCategoryValues;
#endif

out float dataFilter_value;

float dataFilter_reduceValue(float value) {
  return value;
}
float dataFilter_reduceValue(vec2 value) {
  return min(value.x, value.y);
}
float dataFilter_reduceValue(vec3 value) {
  return min(min(value.x, value.y), value.z);
}
float dataFilter_reduceValue(vec4 value) {
  return min(min(value.x, value.y), min(value.z, value.w));
}

#ifdef DATAFILTER_TYPE
  void dataFilter_setValue(DATAFILTER_TYPE valueFromMin, DATAFILTER_TYPE valueFromMax) {
    if (dataFilter.useSoftMargin) {
      // smoothstep results are undefined if edge0 \u2265 edge1
      // Fallback to ignore filterSoftRange if it is truncated by filterRange
      DATAFILTER_TYPE leftInRange = mix(
        smoothstep(dataFilter.min, dataFilter.softMin, valueFromMin),
        step(dataFilter.min, valueFromMin),
        step(dataFilter.softMin, dataFilter.min)
      );
      DATAFILTER_TYPE rightInRange = mix(
        1.0 - smoothstep(dataFilter.softMax, dataFilter.max, valueFromMax),
        step(valueFromMax, dataFilter.max),
        step(dataFilter.max, dataFilter.softMax)
      );
      dataFilter_value = dataFilter_reduceValue(leftInRange * rightInRange);
    } else {
      dataFilter_value = dataFilter_reduceValue(
        step(dataFilter.min, valueFromMin) * step(valueFromMax, dataFilter.max)
      );
    }
  }
#endif

#ifdef DATACATEGORY_TYPE
  void dataFilter_setCategoryValue(DATACATEGORY_TYPE category) {
    #if DATACATEGORY_CHANNELS == 1 // One 128-bit mask
    uint dataFilter_masks = dataFilter.categoryBitMask[category / 32u];
    #elif DATACATEGORY_CHANNELS == 2 // Two 64-bit masks
    uvec2 dataFilter_masks = uvec2(
      dataFilter.categoryBitMask[category.x / 32u],
      dataFilter.categoryBitMask[category.y / 32u + 2u]
    );
    #elif DATACATEGORY_CHANNELS == 3 // Three 32-bit masks
    uvec3 dataFilter_masks = dataFilter.categoryBitMask.xyz;
    #else // Four 32-bit masks
    uvec4 dataFilter_masks = dataFilter.categoryBitMask;
    #endif

    // Shift mask and extract relevant bits
    DATACATEGORY_TYPE dataFilter_bits = DATACATEGORY_TYPE(dataFilter_masks) >> (category & 31u);
    dataFilter_bits &= 1u;

    #if DATACATEGORY_CHANNELS == 1
    if(dataFilter_bits == 0u) dataFilter_value = 0.0;
    #else
    if(any(equal(dataFilter_bits, DATACATEGORY_TYPE(0u)))) dataFilter_value = 0.0;
    #endif
  }
#endif
`
);
var vs2 = `
${uniformBlock2}
${vertex2}
`;
var fragment2 = (
  /* glsl */
  `
in float dataFilter_value;
`
);
var fs2 = `
${uniformBlock2}
${fragment2}
`;
function getUniforms(opts) {
  if (!opts || !("extensions" in opts)) {
    return {};
  }
  const { filterRange = [-1, 1], filterEnabled = true, filterTransformSize = true, filterTransformColor = true, categoryBitMask } = opts;
  const filterSoftRange = opts.filterSoftRange || filterRange;
  return {
    ...Number.isFinite(filterRange[0]) ? {
      min: filterRange[0],
      softMin: filterSoftRange[0],
      softMax: filterSoftRange[1],
      max: filterRange[1]
    } : {
      min: filterRange.map((r) => r[0]),
      softMin: filterSoftRange.map((r) => r[0]),
      softMax: filterSoftRange.map((r) => r[1]),
      max: filterRange.map((r) => r[1])
    },
    enabled: filterEnabled,
    useSoftMargin: Boolean(opts.filterSoftRange),
    transformSize: filterEnabled && filterTransformSize,
    transformColor: filterEnabled && filterTransformColor,
    ...categoryBitMask && { categoryBitMask }
  };
}
function getUniforms64(opts) {
  if (!opts || !("extensions" in opts)) {
    return {};
  }
  const uniforms = getUniforms(opts);
  if (Number.isFinite(uniforms.min)) {
    const min64High = Math.fround(uniforms.min);
    uniforms.min -= min64High;
    uniforms.softMin -= min64High;
    uniforms.min64High = min64High;
    const max64High = Math.fround(uniforms.max);
    uniforms.max -= max64High;
    uniforms.softMax -= max64High;
    uniforms.max64High = max64High;
  } else {
    const min64High = uniforms.min.map(Math.fround);
    uniforms.min = uniforms.min.map((x, i) => x - min64High[i]);
    uniforms.softMin = uniforms.softMin.map((x, i) => x - min64High[i]);
    uniforms.min64High = min64High;
    const max64High = uniforms.max.map(Math.fround);
    uniforms.max = uniforms.max.map((x, i) => x - max64High[i]);
    uniforms.softMax = uniforms.softMax.map((x, i) => x - max64High[i]);
    uniforms.max64High = max64High;
  }
  return uniforms;
}
var inject2 = {
  "vs:#main-start": (
    /* glsl */
    `
    dataFilter_value = 1.0;
    if (dataFilter.enabled) {
      #ifdef DATAFILTER_TYPE
        #ifdef DATAFILTER_DOUBLE
          dataFilter_setValue(
            filterValues - dataFilter.min64High + filterValues64Low,
            filterValues - dataFilter.max64High + filterValues64Low
          );
        #else
          dataFilter_setValue(filterValues, filterValues);
        #endif
      #endif

      #ifdef DATACATEGORY_TYPE
        dataFilter_setCategoryValue(filterCategoryValues);
      #endif
    }
  `
  ),
  "vs:#main-end": (
    /* glsl */
    `
    if (dataFilter_value == 0.0) {
      gl_Position = vec4(0.);
    }
  `
  ),
  "vs:DECKGL_FILTER_SIZE": (
    /* glsl */
    `
    if (dataFilter.transformSize) {
      size = size * dataFilter_value;
    }
  `
  ),
  "fs:DECKGL_FILTER_COLOR": (
    /* glsl */
    `
    if (dataFilter_value == 0.0) discard;
    if (dataFilter.transformColor) {
      color.a *= dataFilter_value;
    }
  `
  )
};
function uniformTypesFromOptions(opts) {
  const { categorySize, filterSize, fp64: fp642 } = opts;
  const uniformTypes = {
    useSoftMargin: "i32",
    enabled: "i32",
    transformSize: "i32",
    transformColor: "i32"
  };
  if (filterSize) {
    const uniformFormat = filterSize === 1 ? "f32" : `vec${filterSize}<f32>`;
    uniformTypes.min = uniformFormat;
    uniformTypes.softMin = uniformFormat;
    uniformTypes.softMax = uniformFormat;
    uniformTypes.max = uniformFormat;
    if (fp642) {
      uniformTypes.min64High = uniformFormat;
      uniformTypes.max64High = uniformFormat;
    }
  }
  if (categorySize) {
    uniformTypes.categoryBitMask = "vec4<i32>";
  }
  return uniformTypes;
}
var dataFilter = {
  name: "dataFilter",
  vs: vs2,
  fs: fs2,
  inject: inject2,
  getUniforms,
  uniformTypesFromOptions
};
var dataFilter64 = {
  name: "dataFilter",
  vs: vs2,
  fs: fs2,
  inject: inject2,
  getUniforms: getUniforms64,
  uniformTypesFromOptions
};

// dist/data-filter/aggregator.js
var import_engine = require("@luma.gl/engine");
var AGGREGATE_VS = `#version 300 es
#define SHADER_NAME data-filter-vertex-shader

#ifdef FLOAT_TARGET
  in float filterIndices;
  in float filterPrevIndices;
#else
  in vec2 filterIndices;
  in vec2 filterPrevIndices;
#endif

out vec4 vColor;
const float component = 1.0 / 255.0;

void main() {
  #ifdef FLOAT_TARGET
    dataFilter_value *= float(filterIndices != filterPrevIndices);
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
    vColor = vec4(0.0, 0.0, 0.0, 1.0);
  #else
    // Float texture is not supported: pack result into 4 channels x 256 px x 64px
    dataFilter_value *= float(filterIndices.x != filterPrevIndices.x);
    float col = filterIndices.x;
    float row = filterIndices.y * 4.0;
    float channel = floor(row);
    row = fract(row);
    vColor = component * vec4(bvec4(channel == 0.0, channel == 1.0, channel == 2.0, channel == 3.0));
    gl_Position = vec4(col * 2.0 - 1.0, row * 2.0 - 1.0, 0.0, 1.0);
  #endif
  gl_PointSize = 1.0;
}
`;
var AGGREGATE_FS = `#version 300 es
#define SHADER_NAME data-filter-fragment-shader
precision highp float;

in vec4 vColor;

out vec4 fragColor;

void main() {
  if (dataFilter_value < 0.5) {
    discard;
  }
  fragColor = vColor;
}
`;
var FLOAT_TARGET_FEATURES = [
  "float32-renderable-webgl",
  // ability to render to float texture
  "texture-blend-float-webgl"
  // ability to blend when rendering to float texture
];
function supportsFloatTarget(device) {
  return FLOAT_TARGET_FEATURES.every((feature) => device.features.has(feature));
}
function getFramebuffer(device, useFloatTarget) {
  if (useFloatTarget) {
    return device.createFramebuffer({
      width: 1,
      height: 1,
      colorAttachments: [
        device.createTexture({
          format: "rgba32float",
          mipmaps: false
        })
      ]
    });
  }
  return device.createFramebuffer({
    width: 256,
    height: 64,
    colorAttachments: [device.createTexture({ format: "rgba8unorm", mipmaps: false })]
  });
}
function getModel(device, bufferLayout, shaderOptions, useFloatTarget) {
  shaderOptions.defines.NON_INSTANCED_MODEL = 1;
  if (useFloatTarget) {
    shaderOptions.defines.FLOAT_TARGET = 1;
  }
  return new import_engine.Model(device, {
    id: "data-filter-aggregation-model",
    vertexCount: 1,
    isInstanced: false,
    topology: "point-list",
    disableWarnings: true,
    vs: AGGREGATE_VS,
    fs: AGGREGATE_FS,
    bufferLayout,
    ...shaderOptions
  });
}
var parameters = {
  blend: true,
  blendColorSrcFactor: "one",
  blendColorDstFactor: "one",
  blendAlphaSrcFactor: "one",
  blendAlphaDstFactor: "one",
  blendColorOperation: "add",
  blendAlphaOperation: "add",
  depthCompare: "never"
};

// dist/data-filter/data-filter-extension.js
var defaultProps2 = {
  getFilterValue: { type: "accessor", value: 0 },
  getFilterCategory: { type: "accessor", value: 0 },
  onFilteredItemsChange: { type: "function", value: null, optional: true },
  filterEnabled: true,
  filterRange: [-1, 1],
  filterSoftRange: null,
  filterCategories: [0],
  filterTransformSize: true,
  filterTransformColor: true
};
var defaultOptions = {
  categorySize: 0,
  filterSize: 1,
  fp64: false,
  countItems: false
};
var CATEGORY_TYPE_FROM_SIZE = {
  1: "uint",
  2: "uvec2",
  3: "uvec3",
  4: "uvec4"
};
var DATA_TYPE_FROM_SIZE = {
  1: "float",
  2: "vec2",
  3: "vec3",
  4: "vec4"
};
var DataFilterExtension = class extends import_core3.LayerExtension {
  constructor(opts = {}) {
    super({ ...defaultOptions, ...opts });
  }
  getShaders(extension) {
    const { categorySize, filterSize, fp64: fp642 } = extension.opts;
    const defines = {};
    if (categorySize) {
      defines.DATACATEGORY_TYPE = CATEGORY_TYPE_FROM_SIZE[categorySize];
      defines.DATACATEGORY_CHANNELS = categorySize;
    }
    if (filterSize) {
      defines.DATAFILTER_TYPE = DATA_TYPE_FROM_SIZE[filterSize];
      defines.DATAFILTER_DOUBLE = Boolean(fp642);
    }
    const module2 = fp642 ? dataFilter64 : dataFilter;
    module2.uniformTypes = module2.uniformTypesFromOptions(extension.opts);
    return { modules: [module2], defines };
  }
  initializeState(context, extension) {
    const attributeManager = this.getAttributeManager();
    const { categorySize, filterSize, fp64: fp642 } = extension.opts;
    if (attributeManager) {
      if (filterSize) {
        attributeManager.add({
          filterValues: {
            size: filterSize,
            type: fp642 ? "float64" : "float32",
            stepMode: "dynamic",
            accessor: "getFilterValue"
          }
        });
      }
      if (categorySize) {
        attributeManager.add({
          filterCategoryValues: {
            size: categorySize,
            stepMode: "dynamic",
            accessor: "getFilterCategory",
            type: "uint32",
            transform: categorySize === 1 ? (d) => extension._getCategoryKey.call(this, d, 0) : (d) => d.map((x, i) => extension._getCategoryKey.call(this, x, i))
          }
        });
      }
    }
    const { device } = this.context;
    if (attributeManager && extension.opts.countItems) {
      const useFloatTarget = supportsFloatTarget(device);
      attributeManager.add({
        filterVertexIndices: {
          size: useFloatTarget ? 1 : 2,
          vertexOffset: 1,
          type: "unorm8",
          accessor: (object, { index }) => {
            const i = object && object.__source ? object.__source.index : index;
            return useFloatTarget ? (i + 1) % 255 : [(i + 1) % 255, Math.floor(i / 255) % 255];
          },
          shaderAttributes: {
            filterPrevIndices: {
              vertexOffset: 0
            },
            filterIndices: {
              vertexOffset: 1
            }
          }
        }
      });
      const filterFBO = getFramebuffer(device, useFloatTarget);
      const filterModel = getModel(device, attributeManager.getBufferLayouts({ isInstanced: false }), extension.getShaders.call(this, extension), useFloatTarget);
      this.setState({ filterFBO, filterModel });
    }
  }
  updateState({ props, oldProps, changeFlags }, extension) {
    var _a, _b;
    const attributeManager = this.getAttributeManager();
    const { categorySize } = extension.opts;
    if (this.state.filterModel) {
      const filterNeedsUpdate = (
        // attributeManager must be defined for filterModel to be set
        ((_a = attributeManager.attributes.filterValues) == null ? void 0 : _a.needsUpdate()) || ((_b = attributeManager.attributes.filterCategoryValues) == null ? void 0 : _b.needsUpdate()) || props.filterEnabled !== oldProps.filterEnabled || props.filterRange !== oldProps.filterRange || props.filterSoftRange !== oldProps.filterSoftRange || props.filterCategories !== oldProps.filterCategories
      );
      if (filterNeedsUpdate) {
        this.setState({ filterNeedsUpdate });
      }
    }
    if (attributeManager == null ? void 0 : attributeManager.attributes.filterCategoryValues) {
      const categoryBitMaskNeedsUpdate = attributeManager.attributes.filterCategoryValues.needsUpdate() || !(0, import_core3._deepEqual)(props.filterCategories, oldProps.filterCategories, 2);
      if (categoryBitMaskNeedsUpdate) {
        this.setState({ categoryBitMask: null });
      }
      const resetCategories = changeFlags.dataChanged;
      if (resetCategories) {
        this.setState({
          categoryMap: Array(categorySize).fill(0).map(() => ({}))
        });
        attributeManager.attributes.filterCategoryValues.setNeedsUpdate("categoryMap");
      }
    }
  }
  draw(params, extension) {
    const filterFBO = this.state.filterFBO;
    const filterModel = this.state.filterModel;
    const filterNeedsUpdate = this.state.filterNeedsUpdate;
    if (!this.state.categoryBitMask) {
      extension._updateCategoryBitMask.call(this, params, extension);
    }
    const { onFilteredItemsChange, extensions, filterEnabled, filterRange, filterSoftRange, filterTransformSize, filterTransformColor, filterCategories } = this.props;
    const dataFilterProps = {
      extensions,
      filterEnabled,
      filterRange,
      filterSoftRange,
      filterTransformSize,
      filterTransformColor,
      filterCategories
    };
    if (this.state.categoryBitMask) {
      dataFilterProps.categoryBitMask = this.state.categoryBitMask;
    }
    this.setShaderModuleProps({ dataFilter: dataFilterProps });
    if (filterNeedsUpdate && onFilteredItemsChange && filterModel) {
      const attributeManager = this.getAttributeManager();
      const { attributes: { filterValues, filterCategoryValues, filterVertexIndices } } = attributeManager;
      filterModel.setVertexCount(this.getNumInstances());
      const attributes = {
        ...filterValues == null ? void 0 : filterValues.getValue(),
        ...filterCategoryValues == null ? void 0 : filterCategoryValues.getValue(),
        ...filterVertexIndices == null ? void 0 : filterVertexIndices.getValue()
      };
      filterModel.setAttributes(attributes);
      filterModel.shaderInputs.setProps({
        dataFilter: dataFilterProps
      });
      const viewport = [0, 0, filterFBO.width, filterFBO.height];
      const renderPass = filterModel.device.beginRenderPass({
        id: "data-filter-aggregation",
        framebuffer: filterFBO,
        parameters: { viewport },
        clearColor: [0, 0, 0, 0]
      });
      filterModel.setParameters(parameters);
      filterModel.draw(renderPass);
      renderPass.end();
      const color = filterModel.device.readPixelsToArrayWebGL(filterFBO);
      let count = 0;
      for (let i = 0; i < color.length; i++) {
        count += color[i];
      }
      onFilteredItemsChange({ id: this.id, count });
      this.state.filterNeedsUpdate = false;
    }
  }
  finalizeState() {
    const filterFBO = this.state.filterFBO;
    const filterModel = this.state.filterModel;
    filterFBO == null ? void 0 : filterFBO.destroy();
    filterModel == null ? void 0 : filterModel.destroy();
  }
  /**
   * Updates the bitmask used on the GPU to perform the filter based on the
   * `filterCategories` prop. The mapping between categories and bit in the bitmask
   * is performed by `_getCategoryKey()`
   */
  _updateCategoryBitMask(params, extension) {
    const { categorySize } = extension.opts;
    if (!categorySize)
      return;
    const { filterCategories } = this.props;
    const categoryBitMask = new Uint32Array([0, 0, 0, 0]);
    const categoryFilters = categorySize === 1 ? [filterCategories] : filterCategories;
    const maxCategories = categorySize === 1 ? 128 : categorySize === 2 ? 64 : 32;
    for (let c = 0; c < categoryFilters.length; c++) {
      const categoryFilter = categoryFilters[c];
      for (const category of categoryFilter) {
        const key = extension._getCategoryKey.call(this, category, c);
        if (key < maxCategories) {
          const channel = c * (maxCategories / 32) + Math.floor(key / 32);
          categoryBitMask[channel] += Math.pow(2, key % 32);
        } else {
          import_core3.log.warn(`Exceeded maximum number of categories (${maxCategories})`)();
        }
      }
    }
    this.state.categoryBitMask = categoryBitMask;
  }
  /**
   * Returns an index of bit in the bitmask for a given category. If the category has
   * not yet been assigned a bit, a new one is assigned.
   */
  _getCategoryKey(category, channel) {
    const categoryMap = this.state.categoryMap[channel];
    if (!(category in categoryMap)) {
      categoryMap[category] = Object.keys(categoryMap).length;
    }
    return categoryMap[category];
  }
};
DataFilterExtension.defaultProps = defaultProps2;
DataFilterExtension.extensionName = "DataFilterExtension";
var data_filter_extension_default = DataFilterExtension;

// dist/fp64/fp64-extension.js
var import_core5 = require("@deck.gl/core");

// dist/fp64/project64.js
var import_shadertools = require("@luma.gl/shadertools");
var import_core4 = require("@deck.gl/core");

// dist/fp64/project64.glsl.js
var project64_glsl_default = `const vec2 WORLD_SCALE_FP64 = vec2(81.4873275756836, 0.0000032873668232014097);
uniform project64Uniforms {
vec2 scale;
mat4 viewProjectionMatrix;
mat4 viewProjectionMatrix64Low;
} project64;
void mercatorProject_fp64(vec4 lnglat_fp64, out vec2 out_val[2]) {
#if defined(NVIDIA_FP64_WORKAROUND)
out_val[0] = sum_fp64(radians_fp64(lnglat_fp64.xy), PI_FP64 * ONE);
#else
out_val[0] = sum_fp64(radians_fp64(lnglat_fp64.xy), PI_FP64);
#endif
out_val[1] = sum_fp64(PI_FP64,
log_fp64(tan_fp64(sum_fp64(PI_4_FP64, radians_fp64(lnglat_fp64.zw) / 2.0))));
return;
}
void project_position_fp64(vec4 position_fp64, out vec2 out_val[2]) {
vec2 pos_fp64[2];
mercatorProject_fp64(position_fp64, pos_fp64);
out_val[0] = mul_fp64(pos_fp64[0], WORLD_SCALE_FP64);
out_val[1] = mul_fp64(pos_fp64[1], WORLD_SCALE_FP64);
return;
}
void project_position_fp64(vec2 position, vec2 position64xyLow, out vec2 out_val[2]) {
vec4 position64xy = vec4(
position.x, position64xyLow.x,
position.y, position64xyLow.y);
project_position_fp64(position64xy, out_val);
}
vec4 project_common_position_to_clipspace_fp64(vec2 vertex_pos_modelspace[4]) {
vec2 vertex_pos_clipspace[4];
vec2 viewProjectionMatrixFP64[16];
for (int i = 0; i < 4; i++) {
for (int j = 0; j < 4; j++) {
viewProjectionMatrixFP64[4 * i + j] = vec2(
project64.viewProjectionMatrix[j][i],
project64.viewProjectionMatrix64Low[j][i]
);
}
}
mat4_vec4_mul_fp64(viewProjectionMatrixFP64, vertex_pos_modelspace,
vertex_pos_clipspace);
return vec4(
vertex_pos_clipspace[0].x,
vertex_pos_clipspace[1].x,
vertex_pos_clipspace[2].x,
vertex_pos_clipspace[3].x
);
}
vec4 project_position_to_clipspace(
vec3 position, vec3 position64xyLow, vec3 offset, out vec4 commonPosition
) {
vec2 offset64[4];
vec4_fp64(vec4(offset, 0.0), offset64);
float z = project_size(position.z);
vec2 projectedPosition64xy[2];
project_position_fp64(position.xy, position64xyLow.xy, projectedPosition64xy);
vec2 commonPosition64[4];
commonPosition64[0] = sum_fp64(offset64[0], projectedPosition64xy[0]);
commonPosition64[1] = sum_fp64(offset64[1], projectedPosition64xy[1]);
commonPosition64[2] = sum_fp64(offset64[2], vec2(z, 0.0));
commonPosition64[3] = vec2(1.0, 0.0);
commonPosition = vec4(projectedPosition64xy[0].x, projectedPosition64xy[1].x, z, 1.0);
return project_common_position_to_clipspace_fp64(commonPosition64);
}
vec4 project_position_to_clipspace(
vec3 position, vec3 position64xyLow, vec3 offset
) {
vec4 commonPosition;
return project_position_to_clipspace(
position, position64xyLow, offset, commonPosition
);
}
`;

// dist/fp64/project64.js
var { fp64ify, fp64ifyMatrix4 } = import_shadertools.fp64;
var project64_default = {
  name: "project64",
  dependencies: [import_core4.project, import_shadertools.fp64],
  vs: project64_glsl_default,
  getUniforms: getUniforms2,
  uniformTypes: {
    scale: "vec2<f32>",
    // Cannot pass as vec2[16], so instead split into 2 mat4x4
    viewProjectionMatrix: "mat4x4<f32>",
    viewProjectionMatrix64Low: "mat4x4<f32>"
  }
};
var getMemoizedUniforms = (0, import_core4._memoize)(calculateUniforms);
function getUniforms2(opts) {
  if (opts && "viewport" in opts) {
    const { viewProjectionMatrix, scale } = opts.viewport;
    return getMemoizedUniforms({ viewProjectionMatrix, scale });
  }
  return {};
}
function calculateUniforms({ viewProjectionMatrix, scale }) {
  const glViewProjectionMatrixFP64 = fp64ifyMatrix4(viewProjectionMatrix);
  const viewProjectionMatrix64High = new Float32Array(16);
  const viewProjectionMatrix64Low = new Float32Array(16);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const from = 4 * i + j;
      const to = 4 * j + i;
      viewProjectionMatrix64High[to] = glViewProjectionMatrixFP64[2 * from];
      viewProjectionMatrix64Low[to] = glViewProjectionMatrixFP64[2 * from + 1];
    }
  }
  return {
    scale: fp64ify(scale),
    viewProjectionMatrix: [...viewProjectionMatrix64High],
    viewProjectionMatrix64Low: [...viewProjectionMatrix64Low]
  };
}

// dist/fp64/fp64-extension.js
var Fp64Extension = class extends import_core5.LayerExtension {
  getShaders() {
    const { coordinateSystem } = this.props;
    if (coordinateSystem !== import_core5.COORDINATE_SYSTEM.LNGLAT && coordinateSystem !== import_core5.COORDINATE_SYSTEM.DEFAULT) {
      throw new Error("fp64: coordinateSystem must be LNGLAT");
    }
    return {
      modules: [project64_default]
    };
  }
  draw(params, extension) {
    const { viewport } = params.context;
    this.setShaderModuleProps({ project64: { viewport } });
  }
};
Fp64Extension.extensionName = "Fp64Extension";
var fp64_extension_default = Fp64Extension;

// dist/path-style/path-style-extension.js
var import_core6 = require("@deck.gl/core");
var import_core7 = require("@math.gl/core");

// dist/path-style/shaders.glsl.js
var dashShaders = {
  inject: {
    "vs:#decl": `
in vec2 instanceDashArrays;
in float instanceDashOffsets;
out vec2 vDashArray;
out float vDashOffset;
`,
    "vs:#main-end": `
vDashArray = instanceDashArrays;
vDashOffset = instanceDashOffsets / width.x;
`,
    "fs:#decl": `
uniform pathStyleUniforms {
float dashAlignMode;
bool dashGapPickable;
} pathStyle;
in vec2 vDashArray;
in float vDashOffset;
`,
    // if given position is in the gap part of the dashed line
    // dashArray.x: solid stroke length, relative to width
    // dashArray.y: gap length, relative to width
    // alignMode:
    // 0 - no adjustment
    // o----     ----     ----     ---- o----     -o----     ----     o
    // 1 - stretch to fit, draw half dash at each end for nicer joints
    // o--    ----    ----    ----    --o--      --o--     ----     --o
    "fs:#main-start": `
float solidLength = vDashArray.x;
float gapLength = vDashArray.y;
float unitLength = solidLength + gapLength;
float offset;
if (unitLength > 0.0) {
if (pathStyle.dashAlignMode == 0.0) {
offset = vDashOffset;
} else {
unitLength = vPathLength / round(vPathLength / unitLength);
offset = solidLength / 2.0;
}
float unitOffset = mod(vPathPosition.y + offset, unitLength);
if (gapLength > 0.0 && unitOffset > solidLength) {
if (path.capType <= 0.5) {
if (!(pathStyle.dashGapPickable && bool(picking.isActive))) {
discard;
}
} else {
float distToEnd = length(vec2(
min(unitOffset - solidLength, unitLength - unitOffset),
vPathPosition.x
));
if (distToEnd > 1.0) {
if (!(pathStyle.dashGapPickable && bool(picking.isActive))) {
discard;
}
}
}
}
}
`
  }
};
var offsetShaders = {
  inject: {
    "vs:#decl": `
in float instanceOffsets;
`,
    "vs:DECKGL_FILTER_SIZE": `
float offsetWidth = abs(instanceOffsets * 2.0) + 1.0;
size *= offsetWidth;
`,
    "vs:#main-end": `
float offsetWidth = abs(instanceOffsets * 2.0) + 1.0;
float offsetDir = -sign(instanceOffsets);
vPathPosition.x = (vPathPosition.x + offsetDir) * offsetWidth - offsetDir;
vPathPosition.y *= offsetWidth;
vPathLength *= offsetWidth;
`,
    "fs:#main-start": `
float dist = abs(vPathPosition.x);
float opacity = 1.0 - smoothstep(0.9, 1.1, dist);
`,
    "fs:#main-end": `
fragColor.a *= opacity;
if (fragColor.a < 0.001) {
discard;
}
`
  }
};

// dist/path-style/path-style-extension.js
var defaultProps3 = {
  getDashArray: { type: "accessor", value: [0, 0] },
  getOffset: { type: "accessor", value: 0 },
  dashJustified: false,
  dashGapPickable: false
};
var PathStyleExtension = class extends import_core6.LayerExtension {
  constructor({ dash = false, offset = false, highPrecisionDash = false } = {}) {
    super({ dash: dash || highPrecisionDash, offset, highPrecisionDash });
  }
  isEnabled(layer) {
    return "pathTesselator" in layer.state;
  }
  getShaders(extension) {
    if (!extension.isEnabled(this)) {
      return null;
    }
    let result = {};
    if (extension.opts.dash) {
      result = (0, import_core6._mergeShaders)(result, dashShaders);
    }
    if (extension.opts.offset) {
      result = (0, import_core6._mergeShaders)(result, offsetShaders);
    }
    const { inject: inject6 } = result;
    const pathStyle = {
      name: "pathStyle",
      inject: inject6,
      uniformTypes: {
        dashAlignMode: "f32",
        dashGapPickable: "i32"
      }
    };
    return {
      modules: [pathStyle]
    };
  }
  initializeState(context, extension) {
    const attributeManager = this.getAttributeManager();
    if (!attributeManager || !extension.isEnabled(this)) {
      return;
    }
    if (extension.opts.dash) {
      attributeManager.addInstanced({
        instanceDashArrays: { size: 2, accessor: "getDashArray" },
        instanceDashOffsets: extension.opts.highPrecisionDash ? {
          size: 1,
          accessor: "getPath",
          transform: extension.getDashOffsets.bind(this)
        } : {
          size: 1,
          update: (attribute) => {
            attribute.constant = true;
            attribute.value = [0];
          }
        }
      });
    }
    if (extension.opts.offset) {
      attributeManager.addInstanced({
        instanceOffsets: { size: 1, accessor: "getOffset" }
      });
    }
  }
  updateState(params, extension) {
    if (!extension.isEnabled(this)) {
      return;
    }
    if (extension.opts.dash) {
      const pathStyleProps = {
        dashAlignMode: this.props.dashJustified ? 1 : 0,
        dashGapPickable: Boolean(this.props.dashGapPickable)
      };
      this.setShaderModuleProps({ pathStyle: pathStyleProps });
    }
  }
  getDashOffsets(path) {
    const result = [0];
    const positionSize = this.props.positionFormat === "XY" ? 2 : 3;
    const isNested = Array.isArray(path[0]);
    const geometrySize = isNested ? path.length : path.length / positionSize;
    let p;
    let prevP;
    for (let i = 0; i < geometrySize - 1; i++) {
      p = isNested ? path[i] : path.slice(i * positionSize, i * positionSize + positionSize);
      p = this.projectPosition(p);
      if (i > 0) {
        result[i] = result[i - 1] + import_core7.vec3.dist(prevP, p);
      }
      prevP = p;
    }
    result[geometrySize - 1] = 0;
    return result;
  }
};
PathStyleExtension.defaultProps = defaultProps3;
PathStyleExtension.extensionName = "PathStyleExtension";
var path_style_extension_default = PathStyleExtension;

// dist/fill-style/fill-style-extension.js
var import_core9 = require("@deck.gl/core");

// dist/fill-style/shader-module.js
var import_core8 = require("@deck.gl/core");
var uniformBlock3 = (
  /* glsl */
  `uniform fillUniforms {
  vec2 patternTextureSize;
  bool patternEnabled;
  bool patternMask;
  vec2 uvCoordinateOrigin;
  vec2 uvCoordinateOrigin64Low;
} fill;
`
);
var patternVs = (
  /* glsl */
  `
in vec4 fillPatternFrames;
in float fillPatternScales;
in vec2 fillPatternOffsets;

out vec2 fill_uv;
out vec4 fill_patternBounds;
out vec4 fill_patternPlacement;
`
);
var vs3 = `
${uniformBlock3}
${patternVs}
`;
var patternFs = (
  /* glsl */
  `
uniform sampler2D fill_patternTexture;

in vec4 fill_patternBounds;
in vec4 fill_patternPlacement;
in vec2 fill_uv;

const float FILL_UV_SCALE = 512.0 / 40000000.0;
`
);
var fs3 = `
${uniformBlock3}
${patternFs}
`;
var inject3 = {
  "vs:DECKGL_FILTER_GL_POSITION": (
    /* glsl */
    `
    fill_uv = geometry.position.xy;
  `
  ),
  "vs:DECKGL_FILTER_COLOR": (
    /* glsl */
    `
    if (fill.patternEnabled) {
      fill_patternBounds = fillPatternFrames / vec4(fill.patternTextureSize, fill.patternTextureSize);
      fill_patternPlacement.xy = fillPatternOffsets;
      fill_patternPlacement.zw = fillPatternScales * fillPatternFrames.zw;
    }
  `
  ),
  "fs:DECKGL_FILTER_COLOR": (
    /* glsl */
    `
    if (fill.patternEnabled) {
      vec2 scale = FILL_UV_SCALE * fill_patternPlacement.zw;
      vec2 patternUV = mod(mod(fill.uvCoordinateOrigin, scale) + fill.uvCoordinateOrigin64Low + fill_uv, scale) / scale;
      patternUV = mod(fill_patternPlacement.xy + patternUV, 1.0);

      vec2 texCoords = fill_patternBounds.xy + fill_patternBounds.zw * patternUV;

      vec4 patternColor = texture(fill_patternTexture, texCoords);
      color.a *= patternColor.a;
      if (!fill.patternMask) {
        color.rgb = patternColor.rgb;
      }
    }
  `
  )
};
function getPatternUniforms(opts) {
  if (!opts) {
    return {};
  }
  const uniforms = {};
  if ("fillPatternTexture" in opts) {
    const { fillPatternTexture } = opts;
    uniforms.fill_patternTexture = fillPatternTexture;
    uniforms.patternTextureSize = [fillPatternTexture.width, fillPatternTexture.height];
  }
  if ("project" in opts) {
    const { fillPatternMask = true, fillPatternEnabled = true } = opts;
    const projectUniforms = import_core8.project.getUniforms(opts.project);
    const { commonOrigin: coordinateOriginCommon } = projectUniforms;
    const coordinateOriginCommon64Low = [
      (0, import_core8.fp64LowPart)(coordinateOriginCommon[0]),
      (0, import_core8.fp64LowPart)(coordinateOriginCommon[1])
    ];
    uniforms.uvCoordinateOrigin = coordinateOriginCommon.slice(0, 2);
    uniforms.uvCoordinateOrigin64Low = coordinateOriginCommon64Low;
    uniforms.patternMask = fillPatternMask;
    uniforms.patternEnabled = fillPatternEnabled;
  }
  return uniforms;
}
var patternShaders = {
  name: "fill",
  vs: vs3,
  fs: fs3,
  inject: inject3,
  dependencies: [import_core8.project],
  getUniforms: getPatternUniforms,
  uniformTypes: {
    patternTextureSize: "vec2<f32>",
    patternEnabled: "i32",
    patternMask: "i32",
    uvCoordinateOrigin: "vec2<f32>",
    uvCoordinateOrigin64Low: "vec2<f32>"
  }
};

// dist/fill-style/fill-style-extension.js
var defaultProps4 = {
  fillPatternEnabled: true,
  fillPatternAtlas: {
    type: "image",
    value: null,
    async: true,
    parameters: { lodMaxClamp: 0 }
  },
  fillPatternMapping: { type: "object", value: {}, async: true },
  fillPatternMask: true,
  getFillPattern: { type: "accessor", value: (d) => d.pattern },
  getFillPatternScale: { type: "accessor", value: 1 },
  getFillPatternOffset: { type: "accessor", value: [0, 0] }
};
var FillStyleExtension = class extends import_core9.LayerExtension {
  constructor({ pattern = false } = {}) {
    super({ pattern });
  }
  isEnabled(layer) {
    return layer.getAttributeManager() !== null && !("pathTesselator" in layer.state);
  }
  getShaders(extension) {
    if (!extension.isEnabled(this)) {
      return null;
    }
    return {
      modules: [extension.opts.pattern && patternShaders].filter(Boolean)
    };
  }
  initializeState(context, extension) {
    if (!extension.isEnabled(this)) {
      return;
    }
    const attributeManager = this.getAttributeManager();
    if (extension.opts.pattern) {
      attributeManager.add({
        fillPatternFrames: {
          size: 4,
          stepMode: "dynamic",
          accessor: "getFillPattern",
          transform: extension.getPatternFrame.bind(this)
        },
        fillPatternScales: {
          size: 1,
          stepMode: "dynamic",
          accessor: "getFillPatternScale",
          defaultValue: 1
        },
        fillPatternOffsets: {
          size: 2,
          stepMode: "dynamic",
          accessor: "getFillPatternOffset"
        }
      });
    }
    this.setState({
      emptyTexture: this.context.device.createTexture({
        data: new Uint8Array(4),
        width: 1,
        height: 1
      })
    });
  }
  updateState({ props, oldProps }, extension) {
    if (!extension.isEnabled(this)) {
      return;
    }
    if (props.fillPatternMapping && props.fillPatternMapping !== oldProps.fillPatternMapping) {
      this.getAttributeManager().invalidate("getFillPattern");
    }
  }
  draw(params, extension) {
    if (!extension.isEnabled(this)) {
      return;
    }
    const { fillPatternAtlas, fillPatternEnabled, fillPatternMask } = this.props;
    const fillProps = {
      project: params.shaderModuleProps.project,
      fillPatternEnabled,
      fillPatternMask,
      fillPatternTexture: fillPatternAtlas || this.state.emptyTexture
    };
    this.setShaderModuleProps({ fill: fillProps });
  }
  finalizeState() {
    const emptyTexture = this.state.emptyTexture;
    emptyTexture == null ? void 0 : emptyTexture.delete();
  }
  getPatternFrame(name) {
    const { fillPatternMapping } = this.getCurrentLayer().props;
    const def = fillPatternMapping && fillPatternMapping[name];
    return def ? [def.x, def.y, def.width, def.height] : [0, 0, 0, 0];
  }
};
FillStyleExtension.defaultProps = defaultProps4;
FillStyleExtension.extensionName = "FillStyleExtension";
var fill_style_extension_default = FillStyleExtension;

// dist/clip/clip-extension.js
var import_core10 = require("@deck.gl/core");
var defaultProps5 = {
  clipBounds: [0, 0, 1, 1],
  clipByInstance: void 0
};
var shaderFunction = (
  /* glsl */
  `
uniform clipUniforms {
  vec4 bounds;
} clip;

bool clip_isInBounds(vec2 position) {
  return position.x >= clip.bounds[0] && position.y >= clip.bounds[1] && position.x < clip.bounds[2] && position.y < clip.bounds[3];
}
`
);
var shaderModuleVs = {
  name: "clip",
  vs: shaderFunction,
  uniformTypes: {
    bounds: "vec4<f32>"
  }
};
var injectionVs = {
  "vs:#decl": (
    /* glsl */
    `
out float clip_isVisible;
`
  ),
  "vs:DECKGL_FILTER_GL_POSITION": (
    /* glsl */
    `
  clip_isVisible = float(clip_isInBounds(geometry.worldPosition.xy));
`
  ),
  "fs:#decl": (
    /* glsl */
    `
in float clip_isVisible;
`
  ),
  "fs:DECKGL_FILTER_COLOR": (
    /* glsl */
    `
  if (clip_isVisible < 0.5) discard;
`
  )
};
var shaderModuleFs = {
  name: "clip",
  fs: shaderFunction,
  uniformTypes: {
    bounds: "vec4<f32>"
  }
};
var injectionFs = {
  "vs:#decl": (
    /* glsl */
    `
out vec2 clip_commonPosition;
`
  ),
  "vs:DECKGL_FILTER_GL_POSITION": (
    /* glsl */
    `
  clip_commonPosition = geometry.position.xy;
`
  ),
  "fs:#decl": (
    /* glsl */
    `
in vec2 clip_commonPosition;
`
  ),
  "fs:DECKGL_FILTER_COLOR": (
    /* glsl */
    `
  if (!clip_isInBounds(clip_commonPosition)) discard;
`
  )
};
var ClipExtension = class extends import_core10.LayerExtension {
  getShaders() {
    let clipByInstance = "instancePositions" in this.getAttributeManager().attributes;
    if (this.props.clipByInstance !== void 0) {
      clipByInstance = Boolean(this.props.clipByInstance);
    }
    this.state.clipByInstance = clipByInstance;
    return clipByInstance ? {
      modules: [shaderModuleVs],
      inject: injectionVs
    } : {
      modules: [shaderModuleFs],
      inject: injectionFs
    };
  }
  /* eslint-disable camelcase */
  draw() {
    const { clipBounds } = this.props;
    const clipProps = {};
    if (this.state.clipByInstance) {
      clipProps.bounds = clipBounds;
    } else {
      const corner0 = this.projectPosition([clipBounds[0], clipBounds[1], 0]);
      const corner1 = this.projectPosition([clipBounds[2], clipBounds[3], 0]);
      clipProps.bounds = [
        Math.min(corner0[0], corner1[0]),
        Math.min(corner0[1], corner1[1]),
        Math.max(corner0[0], corner1[0]),
        Math.max(corner0[1], corner1[1])
      ];
    }
    this.setShaderModuleProps({ clip: clipProps });
  }
};
ClipExtension.defaultProps = defaultProps5;
ClipExtension.extensionName = "ClipExtension";
var clip_extension_default = ClipExtension;

// dist/collision-filter/collision-filter-extension.js
var import_core15 = require("@deck.gl/core");

// dist/collision-filter/shader-module.js
var import_core11 = require("@deck.gl/core");
var vs4 = (
  /* glsl */
  `
in float collisionPriorities;

uniform sampler2D collision_texture;

uniform collisionUniforms {
  bool sort;
  bool enabled;
} collision;

vec2 collision_getCoords(vec4 position) {
  vec4 collision_clipspace = project_common_position_to_clipspace(position);
  return (1.0 + collision_clipspace.xy / collision_clipspace.w) / 2.0;
}

float collision_match(vec2 tex, vec3 pickingColor) {
  vec4 collision_pickingColor = texture(collision_texture, tex);
  float delta = dot(abs(collision_pickingColor.rgb - pickingColor), vec3(1.0));
  float e = 0.001;
  return step(delta, e);
}

float collision_isVisible(vec2 texCoords, vec3 pickingColor) {
  if (!collision.enabled) {
    return 1.0;
  }

  // Visibility test, sample area of 5x5 pixels in order to fade in/out.
  // Due to the locality, the lookups will be cached
  // This reduces the flicker present when objects are shown/hidden
  const int N = 2;
  float accumulator = 0.0;
  vec2 step = vec2(1.0 / project.viewportSize);

  const float floatN = float(N);
  vec2 delta = -floatN * step;
  for(int i = -N; i <= N; i++) {
    delta.x = -step.x * floatN;
    for(int j = -N; j <= N; j++) {
      accumulator += collision_match(texCoords + delta, pickingColor);
      delta.x += step.x;
    }
    delta.y += step.y;
  }

  float W = 2.0 * floatN + 1.0;
  return pow(accumulator / (W * W), 2.2);
}
`
);
var inject4 = {
  "vs:#decl": (
    /* glsl */
    `
  float collision_fade = 1.0;
`
  ),
  "vs:DECKGL_FILTER_GL_POSITION": (
    /* glsl */
    `
  if (collision.sort) {
    float collisionPriority = collisionPriorities;
    position.z = -0.001 * collisionPriority * position.w; // Support range -1000 -> 1000
  }

  if (collision.enabled) {
    vec4 collision_common_position = project_position(vec4(geometry.worldPosition, 1.0));
    vec2 collision_texCoords = collision_getCoords(collision_common_position);
    collision_fade = collision_isVisible(collision_texCoords, geometry.pickingColor / 255.0);
    if (collision_fade < 0.0001) {
      // Position outside clip space bounds to discard
      position = vec4(0.0, 0.0, 2.0, 1.0);
    }
  }
  `
  ),
  "vs:DECKGL_FILTER_COLOR": (
    /* glsl */
    `
  color.a *= collision_fade;
  `
  )
};
var getCollisionUniforms = (opts) => {
  if (!opts || !("dummyCollisionMap" in opts)) {
    return {};
  }
  const { enabled, collisionFBO, drawToCollisionMap, dummyCollisionMap } = opts;
  return {
    enabled: enabled && !drawToCollisionMap,
    sort: Boolean(drawToCollisionMap),
    collision_texture: !drawToCollisionMap && collisionFBO ? collisionFBO.colorAttachments[0] : dummyCollisionMap
  };
};
var shader_module_default2 = {
  name: "collision",
  dependencies: [import_core11.project],
  vs: vs4,
  inject: inject4,
  getUniforms: getCollisionUniforms,
  uniformTypes: {
    sort: "i32",
    enabled: "i32"
  }
};

// dist/collision-filter/collision-filter-effect.js
var import_core13 = require("@math.gl/core");
var import_core14 = require("@deck.gl/core");

// dist/collision-filter/collision-filter-pass.js
var import_core12 = require("@deck.gl/core");
var CollisionFilterPass = class extends import_core12._LayersPass {
  renderCollisionMap(target, options) {
    const padding = 1;
    const clearColor = [0, 0, 0, 0];
    const scissorRect = [padding, padding, target.width - 2 * padding, target.height - 2 * padding];
    this.render({ ...options, clearColor, scissorRect, target, pass: "collision" });
  }
  getLayerParameters(layer, layerIndex, viewport) {
    return {
      ...layer.props.parameters,
      blend: false,
      depthWriteEnabled: true,
      depthCompare: "less-equal"
    };
  }
  getShaderModuleProps() {
    return {
      collision: {
        drawToCollisionMap: true
      },
      picking: {
        isActive: 1,
        isAttribute: false
      },
      lighting: { enabled: false }
    };
  }
};

// dist/collision-filter/collision-filter-effect.js
var DOWNSCALE = 2;
var CollisionFilterEffect = class {
  constructor() {
    this.id = "collision-filter-effect";
    this.props = null;
    this.useInPicking = true;
    this.order = 1;
    this.channels = {};
    this.collisionFBOs = {};
  }
  setup(context) {
    this.context = context;
    const { device } = context;
    this.dummyCollisionMap = device.createTexture({ width: 1, height: 1 });
    this.collisionFilterPass = new CollisionFilterPass(device, { id: "default-collision-filter" });
  }
  preRender({ effects: allEffects, layers, layerFilter, viewports, onViewportActive, views, isPicking, preRenderStats = {} }) {
    var _a;
    const { device } = this.context;
    if (isPicking) {
      return;
    }
    const collisionLayers = layers.filter(
      // @ts-ignore
      ({ props: { visible, collisionEnabled } }) => visible && collisionEnabled
    );
    if (collisionLayers.length === 0) {
      this.channels = {};
      return;
    }
    const effects = allEffects == null ? void 0 : allEffects.filter((e) => e.useInPicking && preRenderStats[e.id]);
    const maskEffectRendered = (_a = preRenderStats["mask-effect"]) == null ? void 0 : _a.didRender;
    const channels = this._groupByCollisionGroup(device, collisionLayers);
    const viewport = viewports[0];
    const viewportChanged = !this.lastViewport || !this.lastViewport.equals(viewport) || maskEffectRendered;
    for (const collisionGroup in channels) {
      const collisionFBO = this.collisionFBOs[collisionGroup];
      const renderInfo = channels[collisionGroup];
      const [width, height] = device.canvasContext.getPixelSize();
      collisionFBO.resize({
        width: width / DOWNSCALE,
        height: height / DOWNSCALE
      });
      this._render(renderInfo, {
        effects,
        layerFilter,
        onViewportActive,
        views,
        viewport,
        viewportChanged
      });
    }
  }
  _render(renderInfo, { effects, layerFilter, onViewportActive, views, viewport, viewportChanged }) {
    const { collisionGroup } = renderInfo;
    const oldRenderInfo = this.channels[collisionGroup];
    if (!oldRenderInfo) {
      return;
    }
    const needsRender = viewportChanged || // If render info is new
    renderInfo === oldRenderInfo || // If sublayers have changed
    !(0, import_core14._deepEqual)(oldRenderInfo.layers, renderInfo.layers, 1) || // If a sublayer's bounds have been updated
    renderInfo.layerBounds.some((b, i) => !(0, import_core13.equals)(b, oldRenderInfo.layerBounds[i])) || // If a sublayer's isLoaded state has been updated
    renderInfo.allLayersLoaded !== oldRenderInfo.allLayersLoaded || // Some prop is in transition
    renderInfo.layers.some((layer) => layer.props.transitions);
    this.channels[collisionGroup] = renderInfo;
    if (needsRender) {
      this.lastViewport = viewport;
      const collisionFBO = this.collisionFBOs[collisionGroup];
      this.collisionFilterPass.renderCollisionMap(collisionFBO, {
        pass: "collision-filter",
        isPicking: true,
        layers: renderInfo.layers,
        effects,
        layerFilter,
        viewports: viewport ? [viewport] : [],
        onViewportActive,
        views,
        shaderModuleProps: {
          collision: {
            enabled: true,
            // To avoid feedback loop forming between Framebuffer and active Texture.
            dummyCollisionMap: this.dummyCollisionMap
          },
          project: {
            // @ts-expect-error TODO - assuming WebGL context
            devicePixelRatio: collisionFBO.device.canvasContext.getDevicePixelRatio() / DOWNSCALE
          }
        }
      });
    }
  }
  /**
   * Group layers by collisionGroup
   * Returns a map from collisionGroup to render info
   */
  _groupByCollisionGroup(device, collisionLayers) {
    const channelMap = {};
    for (const layer of collisionLayers) {
      const collisionGroup = layer.props.collisionGroup;
      let channelInfo = channelMap[collisionGroup];
      if (!channelInfo) {
        channelInfo = { collisionGroup, layers: [], layerBounds: [], allLayersLoaded: true };
        channelMap[collisionGroup] = channelInfo;
      }
      channelInfo.layers.push(layer);
      channelInfo.layerBounds.push(layer.getBounds());
      if (!layer.isLoaded) {
        channelInfo.allLayersLoaded = false;
      }
    }
    for (const collisionGroup of Object.keys(channelMap)) {
      if (!this.collisionFBOs[collisionGroup]) {
        this.createFBO(device, collisionGroup);
      }
      if (!this.channels[collisionGroup]) {
        this.channels[collisionGroup] = channelMap[collisionGroup];
      }
    }
    for (const collisionGroup of Object.keys(this.collisionFBOs)) {
      if (!channelMap[collisionGroup]) {
        this.destroyFBO(collisionGroup);
      }
    }
    return channelMap;
  }
  getShaderModuleProps(layer) {
    const { collisionGroup, collisionEnabled } = layer.props;
    const { collisionFBOs, dummyCollisionMap } = this;
    const collisionFBO = collisionFBOs[collisionGroup];
    const enabled = collisionEnabled && Boolean(collisionFBO);
    return {
      collision: {
        enabled,
        collisionFBO,
        dummyCollisionMap
      }
    };
  }
  cleanup() {
    if (this.dummyCollisionMap) {
      this.dummyCollisionMap.delete();
      this.dummyCollisionMap = void 0;
    }
    this.channels = {};
    for (const collisionGroup of Object.keys(this.collisionFBOs)) {
      this.destroyFBO(collisionGroup);
    }
    this.collisionFBOs = {};
    this.lastViewport = void 0;
  }
  createFBO(device, collisionGroup) {
    const { width, height } = device.gl.canvas;
    const collisionMap = device.createTexture({
      format: "rgba8unorm",
      width,
      height,
      sampler: {
        minFilter: "nearest",
        magFilter: "nearest",
        addressModeU: "clamp-to-edge",
        addressModeV: "clamp-to-edge"
      }
    });
    const depthStencilAttachment = device.createTexture({
      format: "depth16unorm",
      width,
      height,
      mipmaps: false
    });
    this.collisionFBOs[collisionGroup] = device.createFramebuffer({
      id: `collision-${collisionGroup}`,
      width,
      height,
      colorAttachments: [collisionMap],
      depthStencilAttachment
    });
  }
  destroyFBO(collisionGroup) {
    var _a, _b;
    const fbo = this.collisionFBOs[collisionGroup];
    (_a = fbo.colorAttachments[0]) == null ? void 0 : _a.destroy();
    (_b = fbo.depthStencilAttachment) == null ? void 0 : _b.destroy();
    fbo.destroy();
    delete this.collisionFBOs[collisionGroup];
  }
};

// dist/collision-filter/collision-filter-extension.js
var defaultProps6 = {
  getCollisionPriority: { type: "accessor", value: 0 },
  collisionEnabled: true,
  collisionGroup: { type: "string", value: "default" },
  collisionTestProps: {}
};
var CollisionFilterExtension = class extends import_core15.LayerExtension {
  getShaders() {
    return { modules: [shader_module_default2] };
  }
  /* eslint-disable camelcase */
  draw({ shaderModuleProps }) {
    var _a;
    if ((_a = shaderModuleProps.collision) == null ? void 0 : _a.drawToCollisionMap) {
      this.props = this.clone(this.props.collisionTestProps).props;
    }
  }
  initializeState(context, extension) {
    var _a;
    if (this.getAttributeManager() === null) {
      return;
    }
    (_a = this.context.deck) == null ? void 0 : _a._addDefaultEffect(new CollisionFilterEffect());
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      collisionPriorities: {
        size: 1,
        stepMode: "dynamic",
        accessor: "getCollisionPriority"
      }
    });
  }
  getNeedsPickingBuffer() {
    return this.props.collisionEnabled;
  }
};
CollisionFilterExtension.defaultProps = defaultProps6;
CollisionFilterExtension.extensionName = "CollisionFilterExtension";
var collision_filter_extension_default = CollisionFilterExtension;

// dist/mask/mask-extension.js
var import_core21 = require("@deck.gl/core");

// dist/mask/shader-module.js
var import_core16 = require("@deck.gl/core");
var uniformBlock4 = (
  /* glsl */
  `uniform maskUniforms {
  vec4 bounds;
  highp int channel;
  bool enabled;
  bool inverted;
  bool maskByInstance;
} mask;
`
);
var vertex3 = (
  /* glsl */
  `
vec2 mask_getCoords(vec4 position) {
  return (position.xy - mask.bounds.xy) / (mask.bounds.zw - mask.bounds.xy);
}
`
);
var vs5 = `
${uniformBlock4}
${vertex3}
`;
var fragment3 = (
  /* glsl */
  `
uniform sampler2D mask_texture;

bool mask_isInBounds(vec2 texCoords) {
  if (!mask.enabled) {
    return true;
  }
  vec4 maskColor = texture(mask_texture, texCoords);
  float maskValue = 1.0;
  if (mask.channel == 0) {
    maskValue = maskColor.r;
  } else if (mask.channel == 1) {
    maskValue = maskColor.g;
  } else if (mask.channel == 2) {
    maskValue = maskColor.b;
  } else if (mask.channel == 3) {
    maskValue = maskColor.a;
  }

  if (mask.inverted) {
    return maskValue >= 0.5;
  } else {
    return maskValue < 0.5;
  }
}
`
);
var fs4 = `
${uniformBlock4}
${fragment3}
`;
var inject5 = {
  "vs:#decl": (
    /* glsl */
    `
out vec2 mask_texCoords;
`
  ),
  "vs:#main-end": (
    /* glsl */
    `
   vec4 mask_common_position;
   if (mask.maskByInstance) {
     mask_common_position = project_position(vec4(geometry.worldPosition, 1.0));
   } else {
     mask_common_position = geometry.position;
   }
   mask_texCoords = mask_getCoords(mask_common_position);
`
  ),
  "fs:#decl": (
    /* glsl */
    `
in vec2 mask_texCoords;
`
  ),
  "fs:#main-start": (
    /* glsl */
    `
  if (mask.enabled) {
    bool mask = mask_isInBounds(mask_texCoords);

    // Debug: show extent of render target
    // fragColor = vec4(mask_texCoords, 0.0, 1.0);
    // fragColor = texture(mask_texture, mask_texCoords);

    if (!mask) discard;
  }
`
  )
};
var getMaskUniforms = (opts) => {
  if (opts && "maskMap" in opts) {
    return {
      mask_texture: opts.maskMap
    };
  }
  return opts || {};
};
var shader_module_default3 = {
  name: "mask",
  dependencies: [import_core16.project],
  vs: vs5,
  fs: fs4,
  inject: inject5,
  getUniforms: getMaskUniforms,
  uniformTypes: {
    bounds: "vec4<f32>",
    channel: "i32",
    enabled: "i32",
    inverted: "i32",
    maskByInstance: "i32"
  }
};

// dist/mask/mask-effect.js
var import_core19 = require("@deck.gl/core");
var import_core20 = require("@math.gl/core");

// dist/mask/mask-pass.js
var import_core17 = require("@deck.gl/core");
var MASK_BLENDING = {
  blendColorOperation: "subtract",
  blendColorSrcFactor: "zero",
  blendColorDstFactor: "one",
  blendAlphaOperation: "subtract",
  blendAlphaSrcFactor: "zero",
  blendAlphaDstFactor: "one"
};
var MaskPass = class extends import_core17._LayersPass {
  constructor(device, props) {
    super(device, props);
    const { mapSize = 2048 } = props;
    this.maskMap = device.createTexture({
      format: "rgba8unorm",
      width: mapSize,
      height: mapSize,
      sampler: {
        minFilter: "linear",
        magFilter: "linear",
        addressModeU: "clamp-to-edge",
        addressModeV: "clamp-to-edge"
      }
    });
    this.fbo = device.createFramebuffer({
      id: "maskmap",
      width: mapSize,
      height: mapSize,
      colorAttachments: [this.maskMap]
    });
  }
  render(options) {
    const colorMask = 2 ** options.channel;
    const clearColor = [255, 255, 255, 255];
    super.render({ ...options, clearColor, colorMask, target: this.fbo, pass: "mask" });
  }
  getLayerParameters(layer, layerIndex, viewport) {
    return {
      ...layer.props.parameters,
      blend: true,
      depthCompare: "always",
      ...MASK_BLENDING
    };
  }
  shouldDrawLayer(layer) {
    return layer.props.operation.includes("mask");
  }
  delete() {
    this.fbo.delete();
    this.maskMap.delete();
  }
};

// dist/utils/projection-utils.js
var import_core18 = require("@deck.gl/core");
function joinLayerBounds(layers, viewport) {
  const bounds = [Infinity, Infinity, -Infinity, -Infinity];
  for (const layer of layers) {
    const layerBounds = layer.getBounds();
    if (layerBounds) {
      const bottomLeftCommon = layer.projectPosition(layerBounds[0], { viewport, autoOffset: false });
      const topRightCommon = layer.projectPosition(layerBounds[1], { viewport, autoOffset: false });
      bounds[0] = Math.min(bounds[0], bottomLeftCommon[0]);
      bounds[1] = Math.min(bounds[1], bottomLeftCommon[1]);
      bounds[2] = Math.max(bounds[2], topRightCommon[0]);
      bounds[3] = Math.max(bounds[3], topRightCommon[1]);
    }
  }
  if (Number.isFinite(bounds[0])) {
    return bounds;
  }
  return null;
}
var MAX_VIEWPORT_SIZE = 2048;
function makeViewport(opts) {
  const { bounds, viewport, border = 0 } = opts;
  const { isGeospatial } = viewport;
  if (bounds[2] <= bounds[0] || bounds[3] <= bounds[1]) {
    return null;
  }
  const centerWorld = viewport.unprojectPosition([
    (bounds[0] + bounds[2]) / 2,
    (bounds[1] + bounds[3]) / 2,
    0
  ]);
  let { width, height, zoom } = opts;
  if (zoom === void 0) {
    width = width - border * 2;
    height = height - border * 2;
    const scale = Math.min(width / (bounds[2] - bounds[0]), height / (bounds[3] - bounds[1]));
    zoom = Math.min(Math.log2(scale), 20);
  } else if (!width || !height) {
    const scale = 2 ** zoom;
    width = Math.round(Math.abs(bounds[2] - bounds[0]) * scale);
    height = Math.round(Math.abs(bounds[3] - bounds[1]) * scale);
    const maxSize = MAX_VIEWPORT_SIZE - border * 2;
    if (width > maxSize || height > maxSize) {
      const r = maxSize / Math.max(width, height);
      width = Math.round(width * r);
      height = Math.round(height * r);
      zoom += Math.log2(r);
    }
  }
  return isGeospatial ? new import_core18.WebMercatorViewport({
    id: viewport.id,
    x: border,
    y: border,
    width,
    height,
    longitude: centerWorld[0],
    latitude: centerWorld[1],
    zoom,
    orthographic: true
  }) : new import_core18.OrthographicViewport({
    id: viewport.id,
    x: border,
    y: border,
    width,
    height,
    target: centerWorld,
    zoom,
    flipY: false
  });
}
function getViewportBounds(viewport, zRange) {
  let viewportBoundsWorld;
  if (zRange && zRange.length === 2) {
    const [minZ, maxZ] = zRange;
    const bounds0 = viewport.getBounds({ z: minZ });
    const bounds1 = viewport.getBounds({ z: maxZ });
    viewportBoundsWorld = [
      Math.min(bounds0[0], bounds1[0]),
      Math.min(bounds0[1], bounds1[1]),
      Math.max(bounds0[2], bounds1[2]),
      Math.max(bounds0[3], bounds1[3])
    ];
  } else {
    viewportBoundsWorld = viewport.getBounds();
  }
  const viewportBottomLeftCommon = viewport.projectPosition(viewportBoundsWorld.slice(0, 2));
  const viewportTopRightCommon = viewport.projectPosition(viewportBoundsWorld.slice(2, 4));
  return [
    viewportBottomLeftCommon[0],
    viewportBottomLeftCommon[1],
    viewportTopRightCommon[0],
    viewportTopRightCommon[1]
  ];
}
function getRenderBounds(layerBounds, viewport, zRange) {
  if (!layerBounds) {
    return [0, 0, 1, 1];
  }
  const viewportBounds = getViewportBounds(viewport, zRange);
  const paddedBounds = doubleBounds(viewportBounds);
  if (layerBounds[2] - layerBounds[0] <= paddedBounds[2] - paddedBounds[0] && layerBounds[3] - layerBounds[1] <= paddedBounds[3] - paddedBounds[1]) {
    return layerBounds;
  }
  return [
    Math.max(layerBounds[0], paddedBounds[0]),
    Math.max(layerBounds[1], paddedBounds[1]),
    Math.min(layerBounds[2], paddedBounds[2]),
    Math.min(layerBounds[3], paddedBounds[3])
  ];
}
function doubleBounds(bounds) {
  const dx = bounds[2] - bounds[0];
  const dy = bounds[3] - bounds[1];
  const centerX = (bounds[0] + bounds[2]) / 2;
  const centerY = (bounds[1] + bounds[3]) / 2;
  return [centerX - dx, centerY - dy, centerX + dx, centerY + dy];
}

// dist/mask/mask-effect.js
var MaskEffect = class {
  constructor() {
    this.id = "mask-effect";
    this.props = null;
    this.useInPicking = true;
    this.order = 0;
    this.channels = [];
    this.masks = null;
  }
  setup({ device }) {
    this.dummyMaskMap = device.createTexture({
      width: 1,
      height: 1
    });
    this.maskPass = new MaskPass(device, { id: "default-mask" });
    this.maskMap = this.maskPass.maskMap;
  }
  preRender({ layers, layerFilter, viewports, onViewportActive, views, isPicking }) {
    let didRender = false;
    if (isPicking) {
      return { didRender };
    }
    const maskLayers = layers.filter((l) => l.props.visible && l.props.operation.includes("mask"));
    if (maskLayers.length === 0) {
      this.masks = null;
      this.channels.length = 0;
      return { didRender };
    }
    this.masks = {};
    const channelMap = this._sortMaskChannels(maskLayers);
    const viewport = viewports[0];
    const viewportChanged = !this.lastViewport || !this.lastViewport.equals(viewport);
    if (viewport.resolution !== void 0) {
      import_core19.log.warn("MaskExtension is not supported in GlobeView")();
      return { didRender };
    }
    for (const maskId in channelMap) {
      const result = this._renderChannel(channelMap[maskId], {
        layerFilter,
        onViewportActive,
        views,
        viewport,
        viewportChanged
      });
      didRender || (didRender = result);
    }
    return { didRender };
  }
  /* eslint-disable-next-line complexity */
  _renderChannel(channelInfo, { layerFilter, onViewportActive, views, viewport, viewportChanged }) {
    let didRender = false;
    const oldChannelInfo = this.channels[channelInfo.index];
    if (!oldChannelInfo) {
      return didRender;
    }
    const maskChanged = (
      // If a channel is new
      channelInfo === oldChannelInfo || // If sublayers have changed
      channelInfo.layers.length !== oldChannelInfo.layers.length || channelInfo.layers.some((layer, i) => (
        // Layer instance is updated
        // Layer props might have changed
        // Undetermined props could have an effect on the output geometry of a mask layer,
        // for example getRadius+updateTriggers, radiusScale, modelMatrix
        layer !== oldChannelInfo.layers[i] || // Some prop is in transition
        layer.props.transitions
      )) || // If a sublayer's positions have been updated, the cached bounds will change shallowly
      channelInfo.layerBounds.some((b, i) => b !== oldChannelInfo.layerBounds[i])
    );
    channelInfo.bounds = oldChannelInfo.bounds;
    channelInfo.maskBounds = oldChannelInfo.maskBounds;
    this.channels[channelInfo.index] = channelInfo;
    if (maskChanged || viewportChanged) {
      this.lastViewport = viewport;
      const layerBounds = joinLayerBounds(channelInfo.layers, viewport);
      channelInfo.bounds = layerBounds && getRenderBounds(layerBounds, viewport);
      if (maskChanged || !(0, import_core20.equals)(channelInfo.bounds, oldChannelInfo.bounds)) {
        const { maskPass, maskMap } = this;
        const maskViewport = layerBounds && makeViewport({
          bounds: channelInfo.bounds,
          viewport,
          width: maskMap.width,
          height: maskMap.height,
          border: 1
        });
        channelInfo.maskBounds = maskViewport ? maskViewport.getBounds() : [0, 0, 1, 1];
        maskPass.render({
          pass: "mask",
          channel: channelInfo.index,
          layers: channelInfo.layers,
          layerFilter,
          viewports: maskViewport ? [maskViewport] : [],
          onViewportActive,
          views,
          shaderModuleProps: {
            project: {
              devicePixelRatio: 1
            }
          }
        });
        didRender = true;
      }
    }
    this.masks[channelInfo.id] = {
      index: channelInfo.index,
      bounds: channelInfo.maskBounds,
      coordinateOrigin: channelInfo.coordinateOrigin,
      coordinateSystem: channelInfo.coordinateSystem
    };
    return didRender;
  }
  /**
   * Find a channel to render each mask into
   * If a maskId already exists, diff and update the existing channel
   * Otherwise replace a removed mask
   * Otherwise create a new channel
   * Returns a map from mask layer id to channel info
   */
  _sortMaskChannels(maskLayers) {
    const channelMap = {};
    let channelCount = 0;
    for (const layer of maskLayers) {
      const { id } = layer.root;
      let channelInfo = channelMap[id];
      if (!channelInfo) {
        if (++channelCount > 4) {
          import_core19.log.warn("Too many mask layers. The max supported is 4")();
          continue;
        }
        channelInfo = {
          id,
          index: this.channels.findIndex((c) => (c == null ? void 0 : c.id) === id),
          layers: [],
          layerBounds: [],
          coordinateOrigin: layer.root.props.coordinateOrigin,
          coordinateSystem: layer.root.props.coordinateSystem
        };
        channelMap[id] = channelInfo;
      }
      channelInfo.layers.push(layer);
      channelInfo.layerBounds.push(layer.getBounds());
    }
    for (let i = 0; i < 4; i++) {
      const channelInfo = this.channels[i];
      if (!channelInfo || !(channelInfo.id in channelMap)) {
        this.channels[i] = null;
      }
    }
    for (const maskId in channelMap) {
      const channelInfo = channelMap[maskId];
      if (channelInfo.index < 0) {
        channelInfo.index = this.channels.findIndex((c) => !c);
        this.channels[channelInfo.index] = channelInfo;
      }
    }
    return channelMap;
  }
  getShaderModuleProps() {
    return {
      mask: {
        maskMap: this.masks ? this.maskMap : this.dummyMaskMap,
        maskChannels: this.masks
      }
    };
  }
  cleanup() {
    if (this.dummyMaskMap) {
      this.dummyMaskMap.delete();
      this.dummyMaskMap = void 0;
    }
    if (this.maskPass) {
      this.maskPass.delete();
      this.maskPass = void 0;
      this.maskMap = void 0;
    }
    this.lastViewport = void 0;
    this.masks = null;
    this.channels.length = 0;
  }
};

// dist/mask/mask-extension.js
var defaultProps7 = {
  maskId: "",
  maskByInstance: void 0,
  maskInverted: false
};
var MaskExtension = class extends import_core21.LayerExtension {
  initializeState() {
    var _a;
    (_a = this.context.deck) == null ? void 0 : _a._addDefaultEffect(new MaskEffect());
  }
  getShaders() {
    let maskByInstance = "instancePositions" in this.getAttributeManager().attributes;
    if (this.props.maskByInstance !== void 0) {
      maskByInstance = Boolean(this.props.maskByInstance);
    }
    this.state.maskByInstance = maskByInstance;
    return {
      modules: [shader_module_default3]
    };
  }
  /* eslint-disable camelcase */
  draw({ context, shaderModuleProps }) {
    const maskProps = {};
    maskProps.maskByInstance = Boolean(this.state.maskByInstance);
    const { maskId, maskInverted } = this.props;
    const { maskChannels } = shaderModuleProps.mask || {};
    const { viewport } = context;
    if (maskChannels && maskChannels[maskId]) {
      const { index, bounds, coordinateOrigin: fromCoordinateOrigin } = maskChannels[maskId];
      let { coordinateSystem: fromCoordinateSystem } = maskChannels[maskId];
      maskProps.enabled = true;
      maskProps.channel = index;
      maskProps.inverted = maskInverted;
      if (fromCoordinateSystem === import_core21.COORDINATE_SYSTEM.DEFAULT) {
        fromCoordinateSystem = viewport.isGeospatial ? import_core21.COORDINATE_SYSTEM.LNGLAT : import_core21.COORDINATE_SYSTEM.CARTESIAN;
      }
      const opts = { modelMatrix: null, fromCoordinateOrigin, fromCoordinateSystem };
      const bl = this.projectPosition([bounds[0], bounds[1], 0], opts);
      const tr = this.projectPosition([bounds[2], bounds[3], 0], opts);
      maskProps.bounds = [bl[0], bl[1], tr[0], tr[1]];
    } else {
      if (maskId) {
        import_core21.log.warn(`Could not find a mask layer with id: ${maskId}`)();
      }
      maskProps.enabled = false;
    }
    this.setShaderModuleProps({ mask: maskProps });
  }
};
MaskExtension.defaultProps = defaultProps7;
MaskExtension.extensionName = "MaskExtension";
var mask_extension_default = MaskExtension;

// dist/terrain/terrain-extension.js
var import_core26 = require("@deck.gl/core");

// dist/terrain/terrain-effect.js
var import_core25 = require("@deck.gl/core");

// dist/terrain/shader-module.js
var import_core22 = require("@deck.gl/core");
var TERRAIN_MODE = {
  NONE: 0,
  /** A terrain layer rendering encoded ground elevation into the height map */
  WRITE_HEIGHT_MAP: 1,
  /** An offset layer reading encoded ground elevation from the height map */
  USE_HEIGHT_MAP: 2,
  /** A terrain layer rendering to screen, using the cover fbo overlaid with its own texture */
  USE_COVER: 3,
  /** A terrain layer rendering to screen, using the cover fbo as texture */
  USE_COVER_ONLY: 4,
  /** Draped layer is rendered into a texture, and never to screen */
  SKIP: 5
};
var TERRAIN_MODE_CONSTANTS = Object.keys(TERRAIN_MODE).map((key) => `const float TERRAIN_MODE_${key} = ${TERRAIN_MODE[key]}.0;`).join("\n");
var uniformBlock5 = (
  // eslint-disable-next-line prefer-template
  TERRAIN_MODE_CONSTANTS + /* glsl */
  `
uniform terrainUniforms {
  float mode;
  vec4 bounds;
} terrain;

uniform sampler2D terrain_map;
`
);
var terrainModule = {
  name: "terrain",
  dependencies: [import_core22.project],
  // eslint-disable-next-line prefer-template
  vs: uniformBlock5 + /* glsl */
  "out vec3 commonPos;",
  // eslint-disable-next-line prefer-template
  fs: uniformBlock5 + /* glsl */
  "in vec3 commonPos;",
  inject: {
    "vs:#main-start": (
      /* glsl */
      `
if (terrain.mode == TERRAIN_MODE_SKIP) {
  gl_Position = vec4(0.0);
  return;
}
`
    ),
    "vs:DECKGL_FILTER_GL_POSITION": (
      /* glsl */
      `
commonPos = geometry.position.xyz;
if (terrain.mode == TERRAIN_MODE_WRITE_HEIGHT_MAP) {
  vec2 texCoords = (commonPos.xy - terrain.bounds.xy) / terrain.bounds.zw;
  position = vec4(texCoords * 2.0 - 1.0, 0.0, 1.0);
  commonPos.z += project.commonOrigin.z;
}
if (terrain.mode == TERRAIN_MODE_USE_HEIGHT_MAP) {
  vec3 anchor = geometry.worldPosition;
  anchor.z = 0.0;
  vec3 anchorCommon = project_position(anchor);
  vec2 texCoords = (anchorCommon.xy - terrain.bounds.xy) / terrain.bounds.zw;
  if (texCoords.x >= 0.0 && texCoords.y >= 0.0 && texCoords.x <= 1.0 && texCoords.y <= 1.0) {
    float terrainZ = texture(terrain_map, texCoords).r;
    geometry.position.z += terrainZ;
    position = project_common_position_to_clipspace(geometry.position);
  }
}
    `
    ),
    "fs:#main-start": (
      /* glsl */
      `
if (terrain.mode == TERRAIN_MODE_WRITE_HEIGHT_MAP) {
  fragColor = vec4(commonPos.z, 0.0, 0.0, 1.0);
  return;
}
    `
    ),
    "fs:DECKGL_FILTER_COLOR": (
      /* glsl */
      `
if ((terrain.mode == TERRAIN_MODE_USE_COVER) || (terrain.mode == TERRAIN_MODE_USE_COVER_ONLY)) {
  vec2 texCoords = (commonPos.xy - terrain.bounds.xy) / terrain.bounds.zw;
  vec4 pixel = texture(terrain_map, texCoords);
  if (terrain.mode == TERRAIN_MODE_USE_COVER_ONLY) {
    color = pixel;
  } else {
    // pixel is premultiplied
    color = pixel + color * (1.0 - pixel.a);
  }
  return;
}
    `
    )
  },
  // eslint-disable-next-line complexity
  getUniforms: (opts = {}) => {
    if ("dummyHeightMap" in opts) {
      const { drawToTerrainHeightMap, heightMap, heightMapBounds, dummyHeightMap, terrainCover, useTerrainHeightMap, terrainSkipRender } = opts;
      const projectUniforms = import_core22.project.getUniforms(opts.project);
      const { commonOrigin } = projectUniforms;
      let mode = terrainSkipRender ? TERRAIN_MODE.SKIP : TERRAIN_MODE.NONE;
      let sampler = dummyHeightMap;
      let bounds = null;
      if (drawToTerrainHeightMap) {
        mode = TERRAIN_MODE.WRITE_HEIGHT_MAP;
        bounds = heightMapBounds;
      } else if (useTerrainHeightMap && heightMap) {
        mode = TERRAIN_MODE.USE_HEIGHT_MAP;
        sampler = heightMap;
        bounds = heightMapBounds;
      } else if (terrainCover) {
        const fbo = opts.isPicking ? terrainCover.getPickingFramebuffer() : terrainCover.getRenderFramebuffer();
        sampler = fbo == null ? void 0 : fbo.colorAttachments[0].texture;
        if (opts.isPicking) {
          mode = TERRAIN_MODE.SKIP;
        }
        if (sampler) {
          mode = mode === TERRAIN_MODE.SKIP ? TERRAIN_MODE.USE_COVER_ONLY : TERRAIN_MODE.USE_COVER;
          bounds = terrainCover.bounds;
        } else {
          sampler = dummyHeightMap;
        }
      }
      return {
        mode,
        terrain_map: sampler,
        // Convert bounds to the common space, as [minX, minY, width, height]
        bounds: bounds ? [
          bounds[0] - commonOrigin[0],
          bounds[1] - commonOrigin[1],
          bounds[2] - bounds[0],
          bounds[3] - bounds[1]
        ] : [0, 0, 0, 0]
      };
    }
    return {};
  },
  uniformTypes: {
    mode: "f32",
    bounds: "vec4<f32>"
  }
};

// dist/terrain/utils.js
var import_constants = require("@luma.gl/constants");
function createRenderTarget(device, opts) {
  return device.createFramebuffer({
    id: opts.id,
    colorAttachments: [
      device.createTexture({
        id: opts.id,
        ...opts.float && {
          format: "rgba32float",
          type: 5126
        },
        mipmaps: false,
        sampler: opts.interpolate === false ? {
          minFilter: "nearest",
          magFilter: "nearest"
        } : {
          minFilter: "linear",
          magFilter: "linear"
        }
      })
    ]
  });
}

// dist/terrain/terrain-cover.js
var TerrainCover = class {
  constructor(targetLayer) {
    this.isDirty = true;
    this.renderViewport = null;
    this.bounds = null;
    this.layers = [];
    this.targetBounds = null;
    this.targetBoundsCommon = null;
    this.targetLayer = targetLayer;
    this.tile = getTile(targetLayer);
  }
  get id() {
    return this.targetLayer.id;
  }
  /** returns true if the target layer is still in use (i.e. not finalized) */
  get isActive() {
    return Boolean(this.targetLayer.getCurrentLayer());
  }
  shouldUpdate({ targetLayer, viewport, layers, layerNeedsRedraw }) {
    if (targetLayer) {
      this.targetLayer = targetLayer;
    }
    const sizeChanged = viewport ? this._updateViewport(viewport) : false;
    let layersChanged = layers ? this._updateLayers(layers) : false;
    if (layerNeedsRedraw) {
      for (const id of this.layers) {
        if (layerNeedsRedraw[id]) {
          layersChanged = true;
          break;
        }
      }
    }
    return layersChanged || sizeChanged;
  }
  /** Compare layers with the last version. Only rerender if necessary. */
  _updateLayers(layers) {
    let needsRedraw = false;
    layers = this.tile ? getIntersectingLayers(this.tile, layers) : layers;
    if (layers.length !== this.layers.length) {
      needsRedraw = true;
    } else {
      for (let i = 0; i < layers.length; i++) {
        const id = layers[i].id;
        if (id !== this.layers[i]) {
          needsRedraw = true;
          break;
        }
      }
    }
    if (needsRedraw) {
      this.layers = layers.map((layer) => layer.id);
    }
    return needsRedraw;
  }
  /** Compare viewport and terrain bounds with the last version. Only rerender if necesary. */
  _updateViewport(viewport) {
    var _a;
    const targetLayer = this.targetLayer;
    let shouldRedraw = false;
    if (this.tile && "boundingBox" in this.tile) {
      if (!this.targetBounds) {
        shouldRedraw = true;
        this.targetBounds = this.tile.boundingBox;
        const bottomLeftCommon = viewport.projectPosition(this.targetBounds[0]);
        const topRightCommon = viewport.projectPosition(this.targetBounds[1]);
        this.targetBoundsCommon = [
          bottomLeftCommon[0],
          bottomLeftCommon[1],
          topRightCommon[0],
          topRightCommon[1]
        ];
      }
    } else if (this.targetBounds !== targetLayer.getBounds()) {
      shouldRedraw = true;
      this.targetBounds = targetLayer.getBounds();
      this.targetBoundsCommon = joinLayerBounds([targetLayer], viewport);
    }
    if (!this.targetBoundsCommon) {
      return false;
    }
    const newZoom = Math.ceil(viewport.zoom + 0.5);
    if (this.tile) {
      this.bounds = this.targetBoundsCommon;
    } else {
      const oldZoom = (_a = this.renderViewport) == null ? void 0 : _a.zoom;
      shouldRedraw = shouldRedraw || newZoom !== oldZoom;
      const newBounds = getRenderBounds(this.targetBoundsCommon, viewport);
      const oldBounds = this.bounds;
      shouldRedraw = shouldRedraw || !oldBounds || newBounds.some((x, i) => x !== oldBounds[i]);
      this.bounds = newBounds;
    }
    if (shouldRedraw) {
      this.renderViewport = makeViewport({
        bounds: this.bounds,
        zoom: newZoom,
        viewport
      });
    }
    return shouldRedraw;
  }
  getRenderFramebuffer() {
    if (!this.renderViewport || this.layers.length === 0) {
      return null;
    }
    if (!this.fbo) {
      this.fbo = createRenderTarget(this.targetLayer.context.device, { id: this.id });
    }
    return this.fbo;
  }
  getPickingFramebuffer() {
    if (!this.renderViewport || this.layers.length === 0 && !this.targetLayer.props.pickable) {
      return null;
    }
    if (!this.pickingFbo) {
      this.pickingFbo = createRenderTarget(this.targetLayer.context.device, {
        id: `${this.id}-picking`,
        interpolate: false
      });
    }
    return this.pickingFbo;
  }
  filterLayers(layers) {
    return layers.filter(({ id }) => this.layers.includes(id));
  }
  delete() {
    const { fbo, pickingFbo } = this;
    if (fbo) {
      fbo.colorAttachments[0].destroy();
      fbo.destroy();
    }
    if (pickingFbo) {
      pickingFbo.colorAttachments[0].destroy();
      pickingFbo.destroy();
    }
  }
};
function getIntersectingLayers(sourceTile, layers) {
  return layers.filter((layer) => {
    const tile = getTile(layer);
    if (tile) {
      return intersect(sourceTile.boundingBox, tile.boundingBox);
    }
    return true;
  });
}
function getTile(layer) {
  while (layer) {
    const { tile } = layer.props;
    if (tile) {
      return tile;
    }
    layer = layer.parent;
  }
  return null;
}
function intersect(b1, b2) {
  if (b1 && b2) {
    return b1[0][0] < b2[1][0] && b2[0][0] < b1[1][0] && b1[0][1] < b2[1][1] && b2[0][1] < b1[1][1];
  }
  return false;
}

// dist/terrain/terrain-pass.js
var import_core23 = require("@deck.gl/core");
var TERRAIN_BLENDING = {
  blendColorOperation: "max",
  blendColorSrcFactor: "one",
  blendColorDstFactor: "one",
  blendAlphaOperation: "max",
  blendAlphaSrcFactor: "one",
  blendAlphaDstFactor: "one"
};
var TerrainPass = class extends import_core23._LayersPass {
  getRenderableLayers(viewport, opts) {
    const { layers } = opts;
    const result = [];
    const drawParamsByIndex = this._getDrawLayerParams(viewport, opts, true);
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (!layer.isComposite && drawParamsByIndex[i].shouldDrawLayer) {
        result.push(layer);
      }
    }
    return result;
  }
  renderHeightMap(heightMap, opts) {
    const target = heightMap.getRenderFramebuffer();
    const viewport = heightMap.renderViewport;
    if (!target || !viewport) {
      return;
    }
    target.resize(viewport);
    this.render({
      ...opts,
      target,
      pass: "terrain-height-map",
      layers: opts.layers,
      viewports: [viewport],
      effects: [],
      clearColor: [0, 0, 0, 0]
    });
  }
  renderTerrainCover(terrainCover, opts) {
    const target = terrainCover.getRenderFramebuffer();
    const viewport = terrainCover.renderViewport;
    if (!target || !viewport) {
      return;
    }
    const layers = terrainCover.filterLayers(opts.layers);
    target.resize(viewport);
    this.render({
      ...opts,
      target,
      pass: `terrain-cover-${terrainCover.id}`,
      layers,
      effects: [],
      viewports: [viewport],
      clearColor: [0, 0, 0, 0]
    });
  }
  getLayerParameters(layer, layerIndex, viewport) {
    return {
      ...layer.props.parameters,
      blend: true,
      depthCompare: "always",
      ...layer.props.operation.includes("terrain") && TERRAIN_BLENDING
    };
  }
  getShaderModuleProps(layer, effects, otherShaderModuleProps) {
    return {
      terrain: {
        project: otherShaderModuleProps.project
      }
    };
  }
};

// dist/terrain/terrain-picking-pass.js
var import_core24 = require("@deck.gl/core");
var TerrainPickingPass = class extends import_core24._PickLayersPass {
  constructor() {
    super(...arguments);
    this.drawParameters = {};
  }
  getRenderableLayers(viewport, opts) {
    const { layers } = opts;
    const result = [];
    this.drawParameters = {};
    this._resetColorEncoder(opts.pickZ);
    const drawParamsByIndex = this._getDrawLayerParams(viewport, opts);
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (!layer.isComposite && drawParamsByIndex[i].shouldDrawLayer) {
        result.push(layer);
        this.drawParameters[layer.id] = drawParamsByIndex[i].layerParameters;
      }
    }
    return result;
  }
  renderTerrainCover(terrainCover, opts) {
    const target = terrainCover.getPickingFramebuffer();
    const viewport = terrainCover.renderViewport;
    if (!target || !viewport) {
      return;
    }
    const layers = terrainCover.filterLayers(opts.layers);
    const terrainLayer = terrainCover.targetLayer;
    if (terrainLayer.props.pickable) {
      layers.unshift(terrainLayer);
    }
    target.resize(viewport);
    this.render({
      ...opts,
      pickingFBO: target,
      pass: `terrain-cover-picking-${terrainCover.id}`,
      layers,
      effects: [],
      viewports: [viewport],
      // Disable the default culling because TileLayer would cull sublayers based on the screen viewport,
      // not the viewport of the terrain cover. Culling is already done by `terrainCover.filterLayers`
      cullRect: void 0,
      deviceRect: viewport,
      pickZ: false
    });
  }
  getLayerParameters(layer, layerIndex, viewport) {
    let parameters2;
    if (this.drawParameters[layer.id]) {
      parameters2 = this.drawParameters[layer.id];
    } else {
      parameters2 = super.getLayerParameters(layer, layerIndex, viewport);
      parameters2.blend = true;
    }
    return { ...parameters2, depthCompare: "always" };
  }
  getShaderModuleProps(layer, effects, otherShaderModuleProps) {
    return {
      terrain: {
        project: otherShaderModuleProps.project
      }
    };
  }
};

// dist/terrain/height-map-builder.js
var MAP_MAX_SIZE = 2048;
var HeightMapBuilder = class {
  static isSupported(device) {
    return device.isTextureFormatRenderable("rgba32float");
  }
  constructor(device) {
    this.renderViewport = null;
    this.bounds = null;
    this.layers = [];
    this.layersBounds = [];
    this.layersBoundsCommon = null;
    this.lastViewport = null;
    this.device = device;
  }
  /** Returns the height map framebuffer for read/write access.
   * Returns null when the texture is invalid.
   */
  getRenderFramebuffer() {
    if (!this.renderViewport) {
      return null;
    }
    if (!this.fbo) {
      this.fbo = createRenderTarget(this.device, { id: "height-map", float: true });
    }
    return this.fbo;
  }
  /** Called every render cycle to check if the framebuffer needs update */
  shouldUpdate({ layers, viewport }) {
    const layersChanged = layers.length !== this.layers.length || layers.some((layer, i) => (
      // Layer instance is updated
      // Layer props might have changed
      // Undetermined props could have an effect on the output geometry of a terrain source,
      // for example getElevation+updateTriggers, elevationScale, modelMatrix
      layer !== this.layers[i] || // Some prop is in transition
      layer.props.transitions || // Layer's geometry bounds have changed
      layer.getBounds() !== this.layersBounds[i]
    ));
    if (layersChanged) {
      this.layers = layers;
      this.layersBounds = layers.map((layer) => layer.getBounds());
      this.layersBoundsCommon = joinLayerBounds(layers, viewport);
    }
    const viewportChanged = !this.lastViewport || !viewport.equals(this.lastViewport);
    if (!this.layersBoundsCommon) {
      this.renderViewport = null;
    } else if (layersChanged || viewportChanged) {
      const bounds = getRenderBounds(this.layersBoundsCommon, viewport);
      if (bounds[2] <= bounds[0] || bounds[3] <= bounds[1]) {
        this.renderViewport = null;
        return false;
      }
      this.bounds = bounds;
      this.lastViewport = viewport;
      const scale = viewport.scale;
      const pixelWidth = (bounds[2] - bounds[0]) * scale;
      const pixelHeight = (bounds[3] - bounds[1]) * scale;
      this.renderViewport = pixelWidth > 0 || pixelHeight > 0 ? makeViewport({
        // It's not important whether the geometry is visible in this viewport, because
        // vertices will not use the standard project_to_clipspace in the DRAW_TO_HEIGHT_MAP shader
        // However the viewport must have the same center and zoom as the screen viewport
        // So that projection uniforms used for calculating z are the same
        bounds: [
          viewport.center[0] - 1,
          viewport.center[1] - 1,
          viewport.center[0] + 1,
          viewport.center[1] + 1
        ],
        zoom: viewport.zoom,
        width: Math.min(pixelWidth, MAP_MAX_SIZE),
        height: Math.min(pixelHeight, MAP_MAX_SIZE),
        viewport
      }) : null;
      return true;
    }
    return false;
  }
  delete() {
    if (this.fbo) {
      this.fbo.colorAttachments[0].delete();
      this.fbo.delete();
    }
  }
};

// dist/terrain/terrain-effect.js
var TerrainEffect = class {
  constructor() {
    this.id = "terrain-effect";
    this.props = null;
    this.useInPicking = true;
    this.isPicking = false;
    this.isDrapingEnabled = false;
    this.terrainCovers = /* @__PURE__ */ new Map();
  }
  setup({ device, deck }) {
    this.dummyHeightMap = device.createTexture({
      width: 1,
      height: 1,
      data: new Uint8Array([0, 0, 0, 0])
    });
    this.terrainPass = new TerrainPass(device, { id: "terrain" });
    this.terrainPickingPass = new TerrainPickingPass(device, { id: "terrain-picking" });
    if (HeightMapBuilder.isSupported(device)) {
      this.heightMap = new HeightMapBuilder(device);
    } else {
      import_core25.log.warn("Terrain offset mode is not supported by this browser")();
    }
    deck._addDefaultShaderModule(terrainModule);
  }
  preRender(opts) {
    if (opts.pickZ) {
      this.isDrapingEnabled = false;
      return;
    }
    const { viewports } = opts;
    const isPicking = opts.pass.startsWith("picking");
    this.isPicking = isPicking;
    this.isDrapingEnabled = true;
    const viewport = viewports[0];
    const layers = (isPicking ? this.terrainPickingPass : this.terrainPass).getRenderableLayers(viewport, opts);
    const terrainLayers = layers.filter((l) => l.props.operation.includes("terrain"));
    if (terrainLayers.length === 0) {
      return;
    }
    if (!isPicking) {
      const offsetLayers = layers.filter((l) => l.state.terrainDrawMode === "offset");
      if (offsetLayers.length > 0) {
        this._updateHeightMap(terrainLayers, viewport, opts);
      }
    }
    const drapeLayers = layers.filter((l) => l.state.terrainDrawMode === "drape");
    this._updateTerrainCovers(terrainLayers, drapeLayers, viewport, opts);
  }
  getShaderModuleProps(layer, otherShaderModuleProps) {
    var _a, _b, _c;
    const { terrainDrawMode } = layer.state;
    return {
      terrain: {
        project: otherShaderModuleProps.project,
        isPicking: this.isPicking,
        heightMap: ((_b = (_a = this.heightMap) == null ? void 0 : _a.getRenderFramebuffer()) == null ? void 0 : _b.colorAttachments[0].texture) || null,
        heightMapBounds: (_c = this.heightMap) == null ? void 0 : _c.bounds,
        dummyHeightMap: this.dummyHeightMap,
        terrainCover: this.isDrapingEnabled ? this.terrainCovers.get(layer.id) : null,
        useTerrainHeightMap: terrainDrawMode === "offset",
        terrainSkipRender: terrainDrawMode === "drape" || !layer.props.operation.includes("draw")
      }
    };
  }
  cleanup({ deck }) {
    if (this.dummyHeightMap) {
      this.dummyHeightMap.delete();
      this.dummyHeightMap = void 0;
    }
    if (this.heightMap) {
      this.heightMap.delete();
      this.heightMap = void 0;
    }
    for (const terrainCover of this.terrainCovers.values()) {
      terrainCover.delete();
    }
    this.terrainCovers.clear();
    deck._removeDefaultShaderModule(terrainModule);
  }
  _updateHeightMap(terrainLayers, viewport, opts) {
    if (!this.heightMap) {
      return;
    }
    const shouldUpdate = this.heightMap.shouldUpdate({ layers: terrainLayers, viewport });
    if (!shouldUpdate) {
      return;
    }
    this.terrainPass.renderHeightMap(this.heightMap, {
      ...opts,
      layers: terrainLayers,
      shaderModuleProps: {
        terrain: {
          heightMapBounds: this.heightMap.bounds,
          dummyHeightMap: this.dummyHeightMap,
          drawToTerrainHeightMap: true
        },
        project: {
          devicePixelRatio: 1
        }
      }
    });
  }
  _updateTerrainCovers(terrainLayers, drapeLayers, viewport, opts) {
    const layerNeedsRedraw = {};
    for (const layer of drapeLayers) {
      if (layer.state.terrainCoverNeedsRedraw) {
        layerNeedsRedraw[layer.id] = true;
        layer.state.terrainCoverNeedsRedraw = false;
      }
    }
    for (const terrainCover of this.terrainCovers.values()) {
      terrainCover.isDirty = terrainCover.isDirty || terrainCover.shouldUpdate({ layerNeedsRedraw });
    }
    for (const layer of terrainLayers) {
      this._updateTerrainCover(layer, drapeLayers, viewport, opts);
    }
    if (!this.isPicking) {
      this._pruneTerrainCovers();
    }
  }
  _updateTerrainCover(terrainLayer, drapeLayers, viewport, opts) {
    const renderPass = this.isPicking ? this.terrainPickingPass : this.terrainPass;
    let terrainCover = this.terrainCovers.get(terrainLayer.id);
    if (!terrainCover) {
      terrainCover = new TerrainCover(terrainLayer);
      this.terrainCovers.set(terrainLayer.id, terrainCover);
    }
    try {
      const isDirty = terrainCover.shouldUpdate({
        targetLayer: terrainLayer,
        viewport,
        layers: drapeLayers
      });
      if (this.isPicking || terrainCover.isDirty || isDirty) {
        renderPass.renderTerrainCover(terrainCover, {
          ...opts,
          layers: drapeLayers,
          shaderModuleProps: {
            terrain: {
              dummyHeightMap: this.dummyHeightMap,
              terrainSkipRender: false
            },
            project: {
              devicePixelRatio: 1
            }
          }
        });
        if (!this.isPicking) {
          terrainCover.isDirty = false;
        }
      }
    } catch (err) {
      terrainLayer.raiseError(err, `Error rendering terrain cover ${terrainCover.id}`);
    }
  }
  _pruneTerrainCovers() {
    const idsToRemove = [];
    for (const [id, terrainCover] of this.terrainCovers) {
      if (!terrainCover.isActive) {
        idsToRemove.push(id);
      }
    }
    for (const id of idsToRemove) {
      this.terrainCovers.delete(id);
    }
  }
};

// dist/terrain/terrain-extension.js
var defaultProps8 = {
  terrainDrawMode: void 0
};
var TerrainExtension = class extends import_core26.LayerExtension {
  getShaders() {
    return {
      modules: [terrainModule]
    };
  }
  initializeState() {
    var _a;
    (_a = this.context.deck) == null ? void 0 : _a._addDefaultEffect(new TerrainEffect());
  }
  updateState(params) {
    var _a;
    const { props, oldProps } = params;
    if (this.state.terrainDrawMode && props.terrainDrawMode === oldProps.terrainDrawMode && // @ts-ignore `extruded` may not exist in props
    props.extruded === oldProps.extruded) {
      return;
    }
    let { terrainDrawMode } = props;
    if (!terrainDrawMode) {
      const is3d = this.props.extruded;
      const attributes = (_a = this.getAttributeManager()) == null ? void 0 : _a.attributes;
      const hasAnchor = attributes && "instancePositions" in attributes;
      terrainDrawMode = is3d || hasAnchor ? "offset" : "drape";
    }
    this.setState({ terrainDrawMode });
  }
  onNeedsRedraw() {
    const state = this.state;
    if (state.terrainDrawMode === "drape") {
      state.terrainCoverNeedsRedraw = true;
    }
  }
};
TerrainExtension.defaultProps = defaultProps8;
TerrainExtension.extensionName = "TerrainExtension";
var terrain_extension_default = TerrainExtension;
//# sourceMappingURL=index.cjs.map
