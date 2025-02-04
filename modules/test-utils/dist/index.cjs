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
  InteractionTestRunner: () => InteractionTestRunner,
  SnapshotTestRunner: () => SnapshotTestRunner,
  TestRunner: () => TestRunner,
  device: () => device,
  generateLayerTests: () => generateLayerTests,
  getLayerUniforms: () => getLayerUniforms,
  gl: () => gl,
  testInitializeLayer: () => testInitializeLayer,
  testInitializeLayerAsync: () => testInitializeLayerAsync,
  testLayer: () => testLayer,
  testLayerAsync: () => testLayerAsync,
  toLowPrecision: () => toLowPrecision
});
module.exports = __toCommonJS(dist_exports);

// dist/utils/layer.js
function getLayerUniforms(layer, blockName) {
  const uniforms = {};
  const uniformStore = layer.getModels()[0]._uniformStore;
  const uniformBlocks = blockName ? [uniformStore.uniformBlocks.get(blockName)] : uniformStore.uniformBlocks.values();
  for (const block of uniformBlocks) {
    Object.assign(uniforms, block.uniforms);
  }
  return uniforms;
}

// dist/utils/precision.js
function toLowPrecision(input, precision = 11) {
  if (typeof input === "number") {
    return Number(input.toPrecision(precision));
  }
  if (Array.isArray(input)) {
    return input.map((item) => toLowPrecision(item, precision));
  }
  if (typeof input === "object") {
    for (const key in input) {
      input[key] = toLowPrecision(input[key], precision);
    }
  }
  return input;
}

// dist/utils/setup-gl.js
var import_test_utils = require("@luma.gl/test-utils");
var device = import_test_utils.webglDevice || new import_test_utils.NullDevice({});
var _a;
var gl = ((_a = import_test_utils.webglDevice) == null ? void 0 : _a.gl) || 1;
globalThis.glContext = globalThis.glContext || gl;

// dist/lifecycle-test.js
var import_core = require("@deck.gl/core");
var import_test_utils2 = require("@probe.gl/test-utils");
var testViewport = new import_core.MapView({}).makeViewport({
  width: 100,
  height: 100,
  viewState: { longitude: 0, latitude: 0, zoom: 1 }
});
function defaultOnError(error, title) {
  if (error) {
    throw error;
  }
}
function initializeLayerManager({ layer, viewport = testViewport, onError = defaultOnError }) {
  const layerManager = new import_core.LayerManager(device, { viewport });
  layerManager.setProps({
    onError: (error) => onError(error, `initializing ${layer.id}`)
  });
  layerManager.setLayers([layer]);
  return layerManager;
}
function testInitializeLayer(opts) {
  const layerManager = initializeLayerManager(opts);
  if (opts.finalize === false) {
    return {
      finalize: () => layerManager.finalize()
    };
  }
  layerManager.finalize();
  return null;
}
async function testInitializeLayerAsync(opts) {
  const layerManager = initializeLayerManager(opts);
  const deckRenderer = new import_core.DeckRenderer(device);
  while (!opts.layer.isLoaded) {
    await update({ layerManager, deckRenderer, oldResourceCounts: {} });
  }
  if (opts.finalize === false) {
    return {
      finalize: () => layerManager.finalize()
    };
  }
  layerManager.finalize();
  return null;
}
function testLayer(opts) {
  const { Layer, testCases = [], spies = [], onError = defaultOnError } = opts;
  const resources = setupLayerTests(`testing ${Layer.layerName}`, opts);
  let layer = new Layer();
  for (const testCase of testCases) {
    const oldState = { ...layer.state };
    const { layer: newLayer, spyMap } = runLayerTestUpdate(testCase, resources, layer, spies);
    runLayerTestPostUpdateCheck(testCase, newLayer, oldState, spyMap);
    Object.keys(spyMap).forEach((k) => spyMap[k].reset());
    layer = newLayer;
  }
  const error = cleanupAfterLayerTests(resources);
  if (error) {
    onError(error, `${Layer.layerName} should delete all resources`);
  }
}
async function testLayerAsync(opts) {
  const { Layer, testCases = [], spies = [], onError = defaultOnError } = opts;
  const resources = setupLayerTests(`testing ${Layer.layerName}`, opts);
  let layer = new Layer();
  for (const testCase of testCases) {
    const oldState = { ...layer.state };
    const { layer: newLayer, spyMap } = runLayerTestUpdate(testCase, resources, layer, spies);
    runLayerTestPostUpdateCheck(testCase, newLayer, oldState, spyMap);
    while (!newLayer.isLoaded) {
      await update(resources);
      runLayerTestPostUpdateCheck(testCase, newLayer, oldState, spyMap);
    }
    Object.keys(spyMap).forEach((k) => spyMap[k].reset());
    layer = newLayer;
  }
  const error = cleanupAfterLayerTests(resources);
  if (error) {
    onError(error, `${Layer.layerName} should delete all resources`);
  }
}
function setupLayerTests(testTitle, { viewport = testViewport, timeline, onError = defaultOnError }) {
  const oldResourceCounts = getResourceCounts();
  const layerManager = new import_core.LayerManager(device, { viewport, timeline });
  const deckRenderer = new import_core.DeckRenderer(device);
  const props = {
    layerFilter: null,
    drawPickingColors: false,
    onError: (error) => onError(error, testTitle)
  };
  layerManager.setProps(props);
  deckRenderer.setProps(props);
  return { layerManager, deckRenderer, oldResourceCounts };
}
function cleanupAfterLayerTests({ layerManager, deckRenderer, oldResourceCounts }) {
  layerManager.setLayers([]);
  layerManager.finalize();
  deckRenderer.finalize();
  const resourceCounts = getResourceCounts();
  for (const resourceName in resourceCounts) {
    if (resourceCounts[resourceName] !== oldResourceCounts[resourceName]) {
      return new Error(`${resourceCounts[resourceName] - oldResourceCounts[resourceName]} ${resourceName}s`);
    }
  }
  return null;
}
function getResourceCounts() {
  const resourceStats = luma.stats.get("Resource Counts");
  return {
    Texture2D: resourceStats.get("Texture2Ds Active").count,
    Buffer: resourceStats.get("Buffers Active").count
  };
}
function injectSpies(layer, spies) {
  const spyMap = {};
  if (spies) {
    for (const functionName of spies) {
      spyMap[functionName] = (0, import_test_utils2.makeSpy)(Object.getPrototypeOf(layer), functionName);
    }
  }
  return spyMap;
}
function runLayerTestPostUpdateCheck(testCase, newLayer, oldState, spyMap) {
  if (testCase.onAfterUpdate) {
    const subLayers = newLayer.isComposite ? newLayer.getSubLayers() : [];
    const subLayer = subLayers.length ? subLayers[0] : null;
    testCase.onAfterUpdate({
      testCase,
      layer: newLayer,
      oldState,
      subLayers,
      subLayer,
      spies: spyMap
    });
  }
}
function runLayerTestUpdate(testCase, { layerManager, deckRenderer }, layer, spies) {
  const { props, updateProps, onBeforeUpdate, viewport = layerManager.context.viewport } = testCase;
  if (onBeforeUpdate) {
    onBeforeUpdate({ layer, testCase });
  }
  if (props) {
    layer = new layer.constructor(props);
  } else if (updateProps) {
    layer = layer.clone(updateProps);
  }
  spies = testCase.spies || spies;
  const spyMap = injectSpies(layer, spies);
  const drawLayers = () => {
    deckRenderer.renderLayers({
      pass: "test",
      views: {},
      effects: [],
      viewports: [viewport],
      layers: layerManager.getLayers(),
      onViewportActive: layerManager.activateViewport
    });
  };
  layerManager.setLayers([layer]);
  drawLayers();
  if (layerManager.needsUpdate()) {
    layerManager.updateLayers();
    drawLayers();
  }
  return { layer, spyMap };
}
function update({ layerManager, deckRenderer }) {
  return new Promise((resolve) => {
    const onAnimationFrame = () => {
      if (layerManager.needsUpdate()) {
        layerManager.updateLayers();
        deckRenderer.renderLayers({
          pass: "test",
          views: {},
          effects: [],
          viewports: [layerManager.context.viewport],
          layers: layerManager.getLayers(),
          onViewportActive: layerManager.activateViewport
        });
        resolve();
        return;
      }
      setTimeout(onAnimationFrame, 50);
    };
    onAnimationFrame();
  });
}

// dist/generate-layer-tests.js
var import_core2 = require("@deck.gl/core");
function noop() {
}
function defaultAssert(condition, comment) {
  if (!condition) {
    throw new Error(comment);
  }
}
function generateLayerTests({ Layer, sampleProps = {}, assert = defaultAssert, onBeforeUpdate = noop, onAfterUpdate = noop, runDefaultAsserts = true }) {
  assert(Layer.layerName, "Layer should have display name");
  function wrapTestCaseTitle(title) {
    return `${Layer.layerName}#${title}`;
  }
  const testCases = [
    {
      title: "Empty props",
      props: {}
    },
    {
      title: "Null data",
      // @ts-expect-error null may not be an expected data type
      updateProps: { data: null }
    },
    {
      title: "Sample data",
      updateProps: sampleProps
    }
  ];
  try {
    new Layer({});
  } catch (error) {
    assert(false, `Construct ${Layer.layerName} throws: ${error.message}`);
  }
  const { _propTypes: propTypes, _mergedDefaultProps: defaultProps } = Layer;
  testCases.push(...makeAltDataTestCases(sampleProps, propTypes));
  for (const propName in Layer.defaultProps) {
    if (!(propName in sampleProps)) {
      const newTestCase = makeAltPropTestCase({ propName, propTypes, defaultProps, sampleProps, assert }) || [];
      testCases.push(...newTestCase);
    }
  }
  testCases.forEach((testCase) => {
    testCase.title = wrapTestCaseTitle(testCase.title);
    const beforeFunc = testCase.onBeforeUpdate || noop;
    const afterFunc = testCase.onAfterUpdate || noop;
    testCase.onBeforeUpdate = (params) => {
      beforeFunc(params);
      onBeforeUpdate(params);
    };
    testCase.onAfterUpdate = (params) => {
      afterFunc(params);
      onAfterUpdate(params);
      if (runDefaultAsserts) {
        if (params.layer.isComposite) {
          const { data } = params.layer.props;
          if (data && typeof data === "object" && (0, import_core2._count)(data)) {
            assert(params.subLayers.length, "Layer should have sublayers");
          }
        } else {
          assert(params.layer.getModels().length, "Layer should have models");
        }
      }
    };
  });
  return testCases;
}
function makeAltPropTestCase({ propName, propTypes, defaultProps, sampleProps, assert }) {
  const newProps = { ...sampleProps };
  const propDef = propTypes[propName];
  if (!propDef) {
    return null;
  }
  switch (propDef.type) {
    case "boolean":
      newProps[propName] = !defaultProps[propName];
      return [
        {
          title: `${propName}: ${String(newProps[propName])}`,
          props: newProps
        }
      ];
    case "number":
      if ("max" in propDef) {
        newProps[propName] = propDef.max;
      } else if ("min" in propDef) {
        newProps[propName] = propDef.min;
      } else {
        newProps[propName] = defaultProps[propName] + 1;
      }
      return [
        {
          title: `${propName}: ${String(newProps[propName])}`,
          props: newProps
        }
      ];
    case "accessor": {
      if (typeof defaultProps[propName] === "function") {
        return null;
      }
      let callCount = 0;
      newProps[propName] = () => {
        callCount++;
        return defaultProps[propName];
      };
      newProps.updateTriggers = {
        [propName]: "function"
      };
      const onBeforeUpdate = () => callCount = 0;
      const onAfterUpdate = () => assert(callCount > 0, "accessor function is called");
      return [
        {
          title: `${propName}: () => ${defaultProps[propName]}`,
          props: newProps,
          onBeforeUpdate,
          onAfterUpdate
        },
        {
          title: `${propName}: updateTrigger`,
          updateProps: {
            updateTriggers: {
              [propName]: "function+trigger"
            }
          },
          onBeforeUpdate,
          onAfterUpdate
        }
      ];
    }
    default:
      return null;
  }
}
function makeAltDataTestCases(props, propTypes) {
  const originalData = props.data;
  if (!Array.isArray(originalData)) {
    return [];
  }
  const partialUpdateProps = {
    data: originalData.slice(),
    _dataDiff: () => [{ startRow: 0, endRow: 2 }]
  };
  const genIterableProps = {
    data: new Set(originalData),
    _dataDiff: null
  };
  const nonIterableProps = {
    data: {
      length: originalData.length
    }
  };
  for (const propName in props) {
    if (propTypes[propName].type === "accessor") {
      nonIterableProps[propName] = (_, info) => props[propName](originalData[info.index], info);
    }
  }
  return [
    {
      title: "Partial update",
      updateProps: partialUpdateProps
    },
    {
      title: "Generic iterable data",
      updateProps: genIterableProps
    },
    {
      title: "non-iterable data",
      updateProps: nonIterableProps
    }
  ];
}

// dist/test-runner.js
var import_core3 = require("@deck.gl/core");
var DEFAULT_DECK_PROPS = {
  ...import_core3.Deck.defaultProps,
  id: "deckgl-render-test",
  width: 800,
  height: 450,
  style: { position: "absolute", left: "0px", top: "0px" },
  views: [new import_core3.MapView({})],
  useDevicePixels: false,
  debug: true
};
var DEFAULT_TEST_OPTIONS = {
  // test lifecycle callback
  onTestStart: (testCase) => console.log(`# ${testCase.name}`),
  onTestPass: (testCase) => console.log(`ok ${testCase.name} passed`),
  onTestFail: (testCase) => console.log(`not ok ${testCase.name} failed`),
  // milliseconds to wait for each test case before aborting
  timeout: 2e3
};
var TestRunner = class {
  /**
   * props
   *   Deck props
   */
  constructor(props = {}, options) {
    this.deck = null;
    this.isRunning = false;
    this._testCases = [];
    this._currentTestCase = null;
    this._testCaseData = null;
    this.props = { ...DEFAULT_DECK_PROPS, ...props };
    this.isHeadless = Boolean(window.browserTestDriver_isHeadless);
    this.testOptions = { ...DEFAULT_TEST_OPTIONS, ...options };
  }
  get defaultTestCase() {
    throw new Error("Not implemented");
  }
  /**
   * Add testCase(s)
   */
  add(testCases) {
    if (!Array.isArray(testCases)) {
      testCases = [testCases];
    }
    for (const testCase of testCases) {
      this._testCases.push(testCase);
    }
    return this;
  }
  /**
   * Returns a promise that resolves when all the test cases are done
   */
  run(options = {}) {
    Object.assign(this.testOptions, options);
    return new Promise((resolve, reject) => {
      this.deck = new import_core3.Deck({
        ...this.props,
        onDeviceInitialized: this._onDeviceInitialized.bind(this),
        onLoad: resolve
      });
      this.isRunning = true;
      this._currentTestCase = null;
    }).then(() => {
      let promise = Promise.resolve();
      this._testCases.forEach((testCase) => {
        promise = promise.then(() => this._runTest(testCase));
      });
      return promise;
    }).catch((error) => {
      this.fail({ error: error.message });
    }).finally(() => {
      this.deck.finalize();
      this.deck = null;
    });
  }
  /* Lifecycle methods for subclassing */
  initTestCase(testCase) {
    for (const key in this.defaultTestCase) {
      if (!(key in testCase)) {
        testCase[key] = this.defaultTestCase[key];
      }
    }
    this.testOptions.onTestStart(testCase);
  }
  /* Utilities */
  pass(result) {
    this.testOptions.onTestPass(this._currentTestCase, result);
  }
  fail(result) {
    this.testOptions.onTestFail(this._currentTestCase, result);
  }
  /* Private Methods */
  _onDeviceInitialized(device2) {
    this.gpuVendor = device2.info.vendor;
  }
  async _runTest(testCase) {
    this._currentTestCase = testCase;
    this.initTestCase(testCase);
    const timeout = testCase.timeout || this.testOptions.timeout;
    const task = this.runTestCase(testCase);
    const timeoutTask = new Promise((_, reject) => {
      setTimeout(() => {
        reject("Timeout");
      }, timeout);
    });
    try {
      await Promise.race([task, timeoutTask]);
      await this.assert(testCase);
    } catch (err) {
      if (err === "Timeout") {
        this.fail({ error: "Timeout" });
      }
    }
  }
};

// dist/utils/dom.js
function getBoundingBoxInPage(domElement) {
  const bbox = domElement.getBoundingClientRect();
  return {
    x: window.scrollX + bbox.x,
    y: window.scrollY + bbox.y,
    width: bbox.width,
    height: bbox.height
  };
}

// dist/snapshot-test-runner.js
var DEFAULT_TEST_OPTIONS2 = {
  imageDiffOptions: {}
};
var DEFAULT_TEST_CASE = {
  name: "Unnamed snapshot test",
  props: {},
  onBeforeRender: ({ deck, layers }) => {
  },
  onAfterRender: ({ deck, layers, done }) => {
    var _a2;
    if (
      // @ts-expect-error accessing private
      !((_a2 = deck.layerManager) == null ? void 0 : _a2.needsUpdate()) && layers.every((layer) => layer.isLoaded)
    ) {
      done();
    }
  },
  goldenImage: ""
};
var SnapshotTestRunner = class extends TestRunner {
  constructor(props) {
    super(props, DEFAULT_TEST_OPTIONS2);
    this._isDiffing = false;
    this._isDiffing = false;
  }
  get defaultTestCase() {
    return DEFAULT_TEST_CASE;
  }
  initTestCase(testCase) {
    super.initTestCase(testCase);
    if (!testCase.goldenImage) {
      throw new Error(`Test case ${testCase.name} does not have golden image`);
    }
  }
  runTestCase(testCase) {
    const deck = this.deck;
    return new Promise((resolve) => {
      deck.setProps({
        ...this.props,
        ...testCase,
        onBeforeRender: () => {
          testCase.onBeforeRender({
            deck,
            // @ts-expect-error Accessing protected layerManager
            layers: this.deck.layerManager.getLayers()
          });
        },
        onAfterRender: () => {
          testCase.onAfterRender({
            deck,
            // @ts-expect-error Accessing protected layerManager
            layers: this.deck.layerManager.getLayers(),
            done: resolve
          });
        }
      });
    });
  }
  async assert(testCase) {
    var _a2, _b;
    if (this._isDiffing) {
      return;
    }
    this._isDiffing = true;
    const diffOptions = {
      ...this.testOptions.imageDiffOptions,
      ...testCase.imageDiffOptions,
      goldenImage: testCase.goldenImage,
      region: getBoundingBoxInPage(this.deck.getCanvas())
    };
    const result = await window.browserTestDriver_captureAndDiffScreen(diffOptions);
    let resultOverride;
    const platform = (_b = (_a2 = this.testOptions.imageDiffOptions) == null ? void 0 : _a2.platform) == null ? void 0 : _b.toLowerCase();
    if (!result.success) {
      diffOptions.goldenImage = diffOptions.goldenImage.replace("golden-images/", `golden-images/platform-overrides/${platform}/`);
      resultOverride = await window.browserTestDriver_captureAndDiffScreen(diffOptions);
    }
    if (result.success || resultOverride.success) {
      this.pass(result);
    } else {
      this.fail(result);
    }
    this._isDiffing = false;
  }
};

// dist/interaction-test-runner.js
var DEFAULT_TEST_CASE2 = {
  name: "Unnamed interaction test",
  events: [],
  onBeforeEvents: ({ deck }) => {
  },
  onAfterEvents: ({ deck, layers, context }) => {
  }
};
function sleep(timeout) {
  return new Promise((resolve) => window.setTimeout(resolve, timeout));
}
var InteractionTestRunner = class extends TestRunner {
  get defaultTestCase() {
    return DEFAULT_TEST_CASE2;
  }
  // chain events
  async runTestCase(testCase) {
    testCase.context = testCase.onBeforeEvents({
      deck: this.deck
    });
    for (const event of testCase.events) {
      if (event.wait) {
        await sleep(event.wait);
      } else {
        await window.browserTestDriver_emulateInput(event);
      }
    }
  }
  async assert(testCase) {
    testCase.onAfterEvents({
      deck: this.deck,
      // @ts-expect-error Accessing protected layerManager
      layers: this.deck.layerManager.getLayers(),
      context: testCase.context
    });
  }
};
//# sourceMappingURL=index.cjs.map
