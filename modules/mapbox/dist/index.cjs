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
  MapboxOverlay: () => MapboxOverlay
});
module.exports = __toCommonJS(dist_exports);

// dist/mapbox-overlay.js
var import_core3 = require("@deck.gl/core");

// dist/deck-utils.js
var import_core = require("@deck.gl/core");
var import_web_mercator = require("@math.gl/web-mercator");
var TILE_SIZE = 512;
var DEGREES_TO_RADIANS = Math.PI / 180;
function getDeckInstance({ map, gl, deck }) {
  if (map.__deck) {
    return map.__deck;
  }
  const customRender = deck == null ? void 0 : deck.props._customRender;
  const onLoad = deck == null ? void 0 : deck.props.onLoad;
  const deckProps = {
    ...deck == null ? void 0 : deck.props,
    _customRender: () => {
      map.triggerRepaint();
      customRender == null ? void 0 : customRender("");
    }
  };
  deckProps.parameters = { ...getDefaultParameters(map, true), ...deckProps.parameters };
  deckProps.views || (deckProps.views = getDefaultView(map));
  let deckInstance;
  if (!deck || deck.props.gl === gl) {
    Object.assign(deckProps, {
      gl,
      width: null,
      height: null,
      touchAction: "unset",
      viewState: getViewState(map)
    });
    if (deck == null ? void 0 : deck.isInitialized) {
      watchMapMove(deck, map);
    } else {
      deckProps.onLoad = () => {
        onLoad == null ? void 0 : onLoad();
        watchMapMove(deckInstance, map);
      };
    }
  }
  if (deck) {
    deckInstance = deck;
    deck.setProps(deckProps);
    deck.userData.isExternal = true;
  } else {
    deckInstance = new import_core.Deck(deckProps);
    map.on("remove", () => {
      removeDeckInstance(map);
    });
  }
  deckInstance.userData.mapboxLayers = /* @__PURE__ */ new Set();
  map.__deck = deckInstance;
  map.on("render", () => {
    if (deckInstance.isInitialized)
      afterRender(deckInstance, map);
  });
  return deckInstance;
}
function watchMapMove(deck, map) {
  const _handleMapMove = () => {
    if (deck.isInitialized) {
      onMapMove(deck, map);
    } else {
      map.off("move", _handleMapMove);
    }
  };
  map.on("move", _handleMapMove);
}
function removeDeckInstance(map) {
  var _a;
  (_a = map.__deck) == null ? void 0 : _a.finalize();
  map.__deck = null;
}
function getDefaultParameters(map, interleaved) {
  const result = interleaved ? {
    depthWriteEnabled: true,
    depthCompare: "less-equal",
    depthBias: 0,
    blend: true,
    blendColorSrcFactor: "src-alpha",
    blendColorDstFactor: "one-minus-src-alpha",
    blendAlphaSrcFactor: "one",
    blendAlphaDstFactor: "one-minus-src-alpha",
    blendColorOperation: "add",
    blendAlphaOperation: "add"
  } : {};
  if (getProjection(map) === "globe") {
    result.cullMode = "back";
  }
  return result;
}
function addLayer(deck, layer) {
  deck.userData.mapboxLayers.add(layer);
  updateLayers(deck);
}
function removeLayer(deck, layer) {
  deck.userData.mapboxLayers.delete(layer);
  updateLayers(deck);
}
function updateLayer(deck, layer) {
  updateLayers(deck);
}
function drawLayer(deck, map, layer, renderParameters) {
  let { currentViewport } = deck.userData;
  let clearStack = false;
  if (!currentViewport) {
    currentViewport = getViewport(deck, map, renderParameters);
    deck.userData.currentViewport = currentViewport;
    clearStack = true;
  }
  if (!deck.isInitialized) {
    return;
  }
  deck._drawLayers("mapbox-repaint", {
    viewports: [currentViewport],
    layerFilter: ({ layer: deckLayer }) => layer.id === deckLayer.id || deckLayer.props.operation.includes("terrain"),
    clearStack,
    clearCanvas: false
  });
}
function getProjection(map) {
  var _a;
  const projection = (_a = map.getProjection) == null ? void 0 : _a.call(map);
  const type = (
    // maplibre projection spec
    (projection == null ? void 0 : projection.type) || // mapbox projection spec
    (projection == null ? void 0 : projection.name)
  );
  if (type === "globe") {
    return "globe";
  }
  if (type && type !== "mercator") {
    throw new Error("Unsupported projection");
  }
  return "mercator";
}
function getDefaultView(map) {
  if (getProjection(map) === "globe") {
    return new import_core._GlobeView({ id: "mapbox" });
  }
  return new import_core.MapView({ id: "mapbox" });
}
function getViewState(map) {
  var _a;
  const { lng, lat } = map.getCenter();
  const viewState = {
    // Longitude returned by getCenter can be outside of [-180, 180] when zooming near the anti meridian
    // https://github.com/visgl/deck.gl/issues/6894
    longitude: (lng + 540) % 360 - 180,
    latitude: lat,
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
    padding: map.getPadding(),
    repeat: map.getRenderWorldCopies()
  };
  if ((_a = map.getTerrain) == null ? void 0 : _a.call(map)) {
    centerCameraOnTerrain(map, viewState);
  }
  return viewState;
}
function centerCameraOnTerrain(map, viewState) {
  if (map.getFreeCameraOptions) {
    const { position } = map.getFreeCameraOptions();
    if (!position || position.z === void 0) {
      return;
    }
    const height = map.transform.height;
    const { longitude, latitude, pitch } = viewState;
    const cameraX = position.x * TILE_SIZE;
    const cameraY = (1 - position.y) * TILE_SIZE;
    const cameraZ = position.z * TILE_SIZE;
    const center = (0, import_web_mercator.lngLatToWorld)([longitude, latitude]);
    const dx = cameraX - center[0];
    const dy = cameraY - center[1];
    const cameraToCenterDistanceGround = Math.sqrt(dx * dx + dy * dy);
    const pitchRadians = pitch * DEGREES_TO_RADIANS;
    const altitudePixels = 1.5 * height;
    const scale = pitchRadians < 1e-3 ? (
      // Pitch angle too small to deduce the look at point, assume elevation is 0
      altitudePixels * Math.cos(pitchRadians) / cameraZ
    ) : altitudePixels * Math.sin(pitchRadians) / cameraToCenterDistanceGround;
    viewState.zoom = Math.log2(scale);
    const cameraZFromSurface = altitudePixels * Math.cos(pitchRadians) / scale;
    const surfaceElevation = cameraZ - cameraZFromSurface;
    viewState.position = [0, 0, surfaceElevation / (0, import_web_mercator.unitsPerMeter)(latitude)];
  } else if (typeof map.transform.elevation === "number") {
    viewState.position = [0, 0, map.transform.elevation];
  }
}
function getViewport(deck, map, renderParameters) {
  const viewState = getViewState(map);
  const view = getDefaultView(map);
  if (renderParameters) {
    view.props.nearZMultiplier = 0.2;
  }
  const nearZ = (renderParameters == null ? void 0 : renderParameters.nearZ) ?? map.transform._nearZ;
  const farZ = (renderParameters == null ? void 0 : renderParameters.farZ) ?? map.transform._farZ;
  if (Number.isFinite(nearZ)) {
    viewState.nearZ = nearZ / map.transform.height;
    viewState.farZ = farZ / map.transform.height;
  }
  return view.makeViewport({
    width: deck.width,
    height: deck.height,
    viewState
  });
}
function afterRender(deck, map) {
  const { mapboxLayers, isExternal } = deck.userData;
  if (isExternal) {
    const mapboxLayerIds = Array.from(mapboxLayers, (layer) => layer.id);
    const deckLayers = (0, import_core._flatten)(deck.props.layers, Boolean);
    const hasNonMapboxLayers = deckLayers.some((layer) => layer && !mapboxLayerIds.includes(layer.id));
    let viewports = deck.getViewports();
    const mapboxViewportIdx = viewports.findIndex((vp) => vp.id === "mapbox");
    const hasNonMapboxViews = viewports.length > 1 || mapboxViewportIdx < 0;
    if (hasNonMapboxLayers || hasNonMapboxViews) {
      if (mapboxViewportIdx >= 0) {
        viewports = viewports.slice();
        viewports[mapboxViewportIdx] = getViewport(deck, map);
      }
      deck._drawLayers("mapbox-repaint", {
        viewports,
        layerFilter: (params) => (!deck.props.layerFilter || deck.props.layerFilter(params)) && (params.viewport.id !== "mapbox" || !mapboxLayerIds.includes(params.layer.id)),
        clearCanvas: false
      });
    }
  }
  deck.userData.currentViewport = null;
}
function onMapMove(deck, map) {
  deck.setProps({
    viewState: getViewState(map)
  });
  deck.needsRedraw({ clearRedrawFlags: true });
}
function updateLayers(deck) {
  if (deck.userData.isExternal) {
    return;
  }
  const layers = [];
  deck.userData.mapboxLayers.forEach((deckLayer) => {
    const LayerType = deckLayer.props.type;
    const layer = new LayerType(deckLayer.props);
    layers.push(layer);
  });
  deck.setProps({ layers });
}

// dist/mapbox-overlay.js
var import_core4 = require("@deck.gl/core");

// dist/resolve-layers.js
var import_core2 = require("@deck.gl/core");

// dist/mapbox-layer.js
var MapboxLayer = class {
  /* eslint-disable no-this-before-super */
  constructor(props) {
    if (!props.id) {
      throw new Error("Layer must have an unique id");
    }
    this.id = props.id;
    this.type = "custom";
    this.renderingMode = props.renderingMode || "3d";
    this.map = null;
    this.deck = null;
    this.props = props;
  }
  /* Mapbox custom layer methods */
  onAdd(map, gl) {
    this.map = map;
    this.deck = getDeckInstance({ map, gl, deck: this.props.deck });
    addLayer(this.deck, this);
  }
  onRemove() {
    if (this.deck) {
      removeLayer(this.deck, this);
    }
  }
  setProps(props) {
    Object.assign(this.props, props, { id: this.id });
    if (this.deck) {
      updateLayer(this.deck, this);
    }
  }
  render(gl, renderParameters) {
    drawLayer(this.deck, this.map, this, renderParameters);
  }
};

// dist/resolve-layers.js
var UNDEFINED_BEFORE_ID = "__UNDEFINED__";
function resolveLayers(map, deck, oldLayers, newLayers) {
  if (!map || !deck || !map.style || !map.style._loaded) {
    return;
  }
  const layers = (0, import_core2._flatten)(newLayers, Boolean);
  if (oldLayers !== newLayers) {
    const prevLayers = (0, import_core2._flatten)(oldLayers, Boolean);
    const prevLayerIds = new Set(prevLayers.map((l) => l.id));
    for (const layer of layers) {
      prevLayerIds.delete(layer.id);
    }
    for (const id of prevLayerIds) {
      if (map.getLayer(id)) {
        map.removeLayer(id);
      }
    }
  }
  for (const layer of layers) {
    const mapboxLayer = map.getLayer(layer.id);
    if (mapboxLayer) {
      const layerInstance = mapboxLayer.implementation || mapboxLayer;
      layerInstance.setProps(layer.props);
    } else {
      map.addLayer(
        new MapboxLayer({ id: layer.id, deck }),
        // @ts-expect-error beforeId is not defined in LayerProps
        layer.props.beforeId
      );
    }
  }
  const mapLayers = map.style._order;
  const layerGroups = {};
  for (const layer of layers) {
    let { beforeId } = layer.props;
    if (!beforeId || !mapLayers.includes(beforeId)) {
      beforeId = UNDEFINED_BEFORE_ID;
    }
    layerGroups[beforeId] = layerGroups[beforeId] || [];
    layerGroups[beforeId].push(layer.id);
  }
  for (const beforeId in layerGroups) {
    const layerGroup = layerGroups[beforeId];
    let lastLayerIndex = beforeId === UNDEFINED_BEFORE_ID ? mapLayers.length : mapLayers.indexOf(beforeId);
    let lastLayerId = beforeId === UNDEFINED_BEFORE_ID ? void 0 : beforeId;
    for (let i = layerGroup.length - 1; i >= 0; i--) {
      const layerId = layerGroup[i];
      const layerIndex = mapLayers.indexOf(layerId);
      if (layerIndex !== lastLayerIndex - 1) {
        map.moveLayer(layerId, lastLayerId);
        if (layerIndex > lastLayerIndex) {
          lastLayerIndex++;
        }
      }
      lastLayerIndex--;
      lastLayerId = layerId;
    }
  }
}

// dist/mapbox-overlay.js
var MapboxOverlay = class {
  constructor(props) {
    this._handleStyleChange = () => {
      resolveLayers(this._map, this._deck, this._props.layers, this._props.layers);
    };
    this._updateContainerSize = () => {
      if (this._map && this._container) {
        const { clientWidth, clientHeight } = this._map.getContainer();
        Object.assign(this._container.style, {
          width: `${clientWidth}px`,
          height: `${clientHeight}px`
        });
      }
    };
    this._updateViewState = () => {
      const deck = this._deck;
      const map = this._map;
      if (deck && map) {
        deck.setProps({
          views: this._props.views || getDefaultView(map),
          viewState: getViewState(map)
        });
        if (deck.isInitialized) {
          deck.redraw();
        }
      }
    };
    this._handleMouseEvent = (event) => {
      const deck = this._deck;
      if (!deck || !deck.isInitialized) {
        return;
      }
      const mockEvent = {
        type: event.type,
        offsetCenter: event.point,
        srcEvent: event
      };
      const lastDown = this._lastMouseDownPoint;
      if (!event.point && lastDown) {
        mockEvent.deltaX = event.originalEvent.clientX - lastDown.clientX;
        mockEvent.deltaY = event.originalEvent.clientY - lastDown.clientY;
        mockEvent.offsetCenter = {
          x: lastDown.x + mockEvent.deltaX,
          y: lastDown.y + mockEvent.deltaY
        };
      }
      switch (mockEvent.type) {
        case "mousedown":
          deck._onPointerDown(mockEvent);
          this._lastMouseDownPoint = {
            ...event.point,
            clientX: event.originalEvent.clientX,
            clientY: event.originalEvent.clientY
          };
          break;
        case "dragstart":
          mockEvent.type = "panstart";
          deck._onEvent(mockEvent);
          break;
        case "drag":
          mockEvent.type = "panmove";
          deck._onEvent(mockEvent);
          break;
        case "dragend":
          mockEvent.type = "panend";
          deck._onEvent(mockEvent);
          break;
        case "click":
          mockEvent.tapCount = 1;
          deck._onEvent(mockEvent);
          break;
        case "dblclick":
          mockEvent.type = "click";
          mockEvent.tapCount = 2;
          deck._onEvent(mockEvent);
          break;
        case "mousemove":
          mockEvent.type = "pointermove";
          deck._onPointerMove(mockEvent);
          break;
        case "mouseout":
          mockEvent.type = "pointerleave";
          deck._onPointerMove(mockEvent);
          break;
        default:
          return;
      }
    };
    const { interleaved = false, ...otherProps } = props;
    this._interleaved = interleaved;
    this._props = otherProps;
  }
  /** Update (partial) props of the underlying Deck instance. */
  setProps(props) {
    if (this._interleaved && props.layers) {
      resolveLayers(this._map, this._deck, this._props.layers, props.layers);
    }
    Object.assign(this._props, props);
    if (this._deck && this._map) {
      this._deck.setProps({
        ...this._props,
        parameters: {
          ...getDefaultParameters(this._map, this._interleaved),
          ...this._props.parameters
        }
      });
    }
  }
  /** Called when the control is added to a map */
  onAdd(map) {
    this._map = map;
    return this._interleaved ? this._onAddInterleaved(map) : this._onAddOverlaid(map);
  }
  _onAddOverlaid(map) {
    const container = document.createElement("div");
    Object.assign(container.style, {
      position: "absolute",
      left: 0,
      top: 0,
      textAlign: "initial",
      pointerEvents: "none"
    });
    this._container = container;
    this._deck = new import_core3.Deck({
      ...this._props,
      parent: container,
      parameters: { ...getDefaultParameters(map, false), ...this._props.parameters },
      views: this._props.views || getDefaultView(map),
      viewState: getViewState(map)
    });
    map.on("resize", this._updateContainerSize);
    map.on("render", this._updateViewState);
    map.on("mousedown", this._handleMouseEvent);
    map.on("dragstart", this._handleMouseEvent);
    map.on("drag", this._handleMouseEvent);
    map.on("dragend", this._handleMouseEvent);
    map.on("mousemove", this._handleMouseEvent);
    map.on("mouseout", this._handleMouseEvent);
    map.on("click", this._handleMouseEvent);
    map.on("dblclick", this._handleMouseEvent);
    this._updateContainerSize();
    return container;
  }
  _onAddInterleaved(map) {
    const gl = map.painter.context.gl;
    if (gl instanceof WebGLRenderingContext) {
      import_core4.log.warn("Incompatible basemap library. See: https://deck.gl/docs/api-reference/mapbox/overview#compatibility")();
    }
    this._deck = getDeckInstance({
      map,
      gl,
      deck: new import_core3.Deck({
        ...this._props,
        gl
      })
    });
    map.on("styledata", this._handleStyleChange);
    resolveLayers(map, this._deck, [], this._props.layers);
    return document.createElement("div");
  }
  /** Called when the control is removed from a map */
  onRemove() {
    const map = this._map;
    if (map) {
      if (this._interleaved) {
        this._onRemoveInterleaved(map);
      } else {
        this._onRemoveOverlaid(map);
      }
    }
    this._deck = void 0;
    this._map = void 0;
    this._container = void 0;
  }
  _onRemoveOverlaid(map) {
    var _a;
    map.off("resize", this._updateContainerSize);
    map.off("render", this._updateViewState);
    map.off("mousedown", this._handleMouseEvent);
    map.off("dragstart", this._handleMouseEvent);
    map.off("drag", this._handleMouseEvent);
    map.off("dragend", this._handleMouseEvent);
    map.off("mousemove", this._handleMouseEvent);
    map.off("mouseout", this._handleMouseEvent);
    map.off("click", this._handleMouseEvent);
    map.off("dblclick", this._handleMouseEvent);
    (_a = this._deck) == null ? void 0 : _a.finalize();
  }
  _onRemoveInterleaved(map) {
    map.off("styledata", this._handleStyleChange);
    resolveLayers(map, this._deck, this._props.layers, []);
    removeDeckInstance(map);
  }
  getDefaultPosition() {
    return "top-left";
  }
  /** Forwards the Deck.pickObject method */
  pickObject(params) {
    (0, import_core3.assert)(this._deck);
    return this._deck.pickObject(params);
  }
  /** Forwards the Deck.pickMultipleObjects method */
  pickMultipleObjects(params) {
    (0, import_core3.assert)(this._deck);
    return this._deck.pickMultipleObjects(params);
  }
  /** Forwards the Deck.pickObjects method */
  pickObjects(params) {
    (0, import_core3.assert)(this._deck);
    return this._deck.pickObjects(params);
  }
  /** Remove from map and releases all resources */
  finalize() {
    if (this._map) {
      this._map.removeControl(this);
    }
  }
  /** If interleaved: true, returns base map's canvas, otherwise forwards the Deck.getCanvas method. */
  getCanvas() {
    if (!this._map) {
      return null;
    }
    return this._interleaved ? this._map.getCanvas() : this._deck.getCanvas();
  }
};
//# sourceMappingURL=index.cjs.map
