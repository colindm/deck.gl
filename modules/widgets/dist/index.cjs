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
  CompassWidget: () => CompassWidget,
  DarkGlassTheme: () => DarkGlassTheme,
  DarkTheme: () => DarkTheme,
  FullscreenWidget: () => FullscreenWidget,
  LightGlassTheme: () => LightGlassTheme,
  LightTheme: () => LightTheme,
  ZoomWidget: () => ZoomWidget
});
module.exports = __toCommonJS(dist_exports);

// dist/fullscreen-widget.js
var import_jsx_runtime2 = require("preact/jsx-runtime");
var import_core = require("@deck.gl/core");
var import_preact = require("preact");

// dist/components.js
var import_jsx_runtime = require("preact/jsx-runtime");
var IconButton = (props) => {
  const { className, label, onClick } = props;
  return (0, import_jsx_runtime.jsx)("div", { className: "deck-widget-button", children: (0, import_jsx_runtime.jsx)("button", { className: `deck-widget-icon-button ${className}`, type: "button", onClick, title: label, children: (0, import_jsx_runtime.jsx)("div", { className: "deck-widget-icon" }) }) });
};
var ButtonGroup = (props) => {
  const { children, orientation } = props;
  return (0, import_jsx_runtime.jsx)("div", { className: `deck-widget-button-group ${orientation}`, children });
};
var GroupedIconButton = (props) => {
  const { className, label, onClick } = props;
  return (0, import_jsx_runtime.jsx)("button", { className: `deck-widget-icon-button ${className}`, type: "button", onClick, title: label, children: (0, import_jsx_runtime.jsx)("div", { className: "deck-widget-icon" }) });
};

// dist/fullscreen-widget.js
var FullscreenWidget = class {
  constructor(props) {
    this.id = "fullscreen";
    this.placement = "top-left";
    this.fullscreen = false;
    this.id = props.id ?? this.id;
    this.placement = props.placement ?? this.placement;
    this.props = {
      ...props,
      enterLabel: props.enterLabel ?? "Enter Fullscreen",
      exitLabel: props.exitLabel ?? "Exit Fullscreen",
      style: props.style ?? {}
    };
  }
  onAdd({ deck }) {
    const { style, className } = this.props;
    const el = document.createElement("div");
    el.classList.add("deck-widget", "deck-widget-fullscreen");
    if (className)
      el.classList.add(className);
    (0, import_core._applyStyles)(el, style);
    this.deck = deck;
    this.element = el;
    this.update();
    document.addEventListener("fullscreenchange", this.onFullscreenChange.bind(this));
    return el;
  }
  onRemove() {
    this.deck = void 0;
    this.element = void 0;
    document.removeEventListener("fullscreenchange", this.onFullscreenChange.bind(this));
  }
  update() {
    const { enterLabel, exitLabel } = this.props;
    const element = this.element;
    if (!element) {
      return;
    }
    const ui = (0, import_jsx_runtime2.jsx)(IconButton, { onClick: this.handleClick.bind(this), label: this.fullscreen ? exitLabel : enterLabel, className: this.fullscreen ? "deck-widget-fullscreen-exit" : "deck-widget-fullscreen-enter" });
    (0, import_preact.render)(ui, element);
  }
  setProps(props) {
    this.placement = props.placement ?? this.placement;
    const oldProps = this.props;
    const el = this.element;
    if (el) {
      if (oldProps.className !== props.className) {
        if (oldProps.className)
          el.classList.remove(oldProps.className);
        if (props.className)
          el.classList.add(props.className);
      }
      if (!(0, import_core._deepEqual)(oldProps.style, props.style, 1)) {
        (0, import_core._removeStyles)(el, oldProps.style);
        (0, import_core._applyStyles)(el, props.style);
      }
    }
    Object.assign(this.props, props);
    this.update();
  }
  getContainer() {
    var _a, _b;
    return this.props.container || ((_b = (_a = this.deck) == null ? void 0 : _a.getCanvas()) == null ? void 0 : _b.parentElement);
  }
  onFullscreenChange() {
    const prevFullscreen = this.fullscreen;
    const fullscreen = document.fullscreenElement === this.getContainer();
    if (prevFullscreen !== fullscreen) {
      this.fullscreen = !this.fullscreen;
    }
    this.update();
  }
  async handleClick() {
    if (this.fullscreen) {
      await this.exitFullscreen();
    } else {
      await this.requestFullscreen();
    }
    this.update();
  }
  async requestFullscreen() {
    const container = this.getContainer();
    if (container == null ? void 0 : container.requestFullscreen) {
      await container.requestFullscreen({ navigationUI: "hide" });
    } else {
      this.togglePseudoFullscreen();
    }
  }
  async exitFullscreen() {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else {
      this.togglePseudoFullscreen();
    }
  }
  togglePseudoFullscreen() {
    var _a;
    (_a = this.getContainer()) == null ? void 0 : _a.classList.toggle("deck-pseudo-fullscreen");
  }
};

// dist/compass-widget.js
var import_jsx_runtime3 = require("preact/jsx-runtime");
var import_core2 = require("@deck.gl/core");
var import_preact2 = require("preact");
var CompassWidget = class {
  constructor(props) {
    this.id = "compass";
    this.placement = "top-left";
    this.viewId = null;
    this.viewports = {};
    this.id = props.id ?? this.id;
    this.viewId = props.viewId ?? this.viewId;
    this.placement = props.placement ?? this.placement;
    this.props = {
      ...props,
      transitionDuration: props.transitionDuration ?? 200,
      label: props.label ?? "Reset Compass",
      style: props.style ?? {}
    };
  }
  setProps(props) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    const oldProps = this.props;
    const el = this.element;
    if (el) {
      if (oldProps.className !== props.className) {
        if (oldProps.className)
          el.classList.remove(oldProps.className);
        if (props.className)
          el.classList.add(props.className);
      }
      if (!(0, import_core2._deepEqual)(oldProps.style, props.style, 1)) {
        (0, import_core2._removeStyles)(el, oldProps.style);
        (0, import_core2._applyStyles)(el, props.style);
      }
    }
    Object.assign(this.props, props);
    this.update();
  }
  onViewportChange(viewport) {
    if (!viewport.equals(this.viewports[viewport.id])) {
      this.viewports[viewport.id] = viewport;
      this.update();
    }
  }
  onAdd({ deck }) {
    const { style, className } = this.props;
    const element = document.createElement("div");
    element.classList.add("deck-widget", "deck-widget-compass");
    if (className)
      element.classList.add(className);
    (0, import_core2._applyStyles)(element, style);
    this.deck = deck;
    this.element = element;
    this.update();
    return element;
  }
  getRotation(viewport) {
    if (viewport instanceof import_core2.WebMercatorViewport) {
      return [-viewport.bearing, viewport.pitch];
    } else if (viewport instanceof import_core2._GlobeViewport) {
      return [0, Math.max(-80, Math.min(80, viewport.latitude))];
    }
    return [0, 0];
  }
  update() {
    var _a;
    const viewId = this.viewId || ((_a = Object.values(this.viewports)[0]) == null ? void 0 : _a.id) || "default-view";
    const viewport = this.viewports[viewId];
    const [rz, rx] = this.getRotation(viewport);
    const element = this.element;
    if (!element) {
      return;
    }
    const ui = (0, import_jsx_runtime3.jsx)("div", { className: "deck-widget-button", style: { perspective: 100 }, children: (0, import_jsx_runtime3.jsx)("button", { type: "button", onClick: () => {
      for (const viewport2 of Object.values(this.viewports)) {
        this.handleCompassReset(viewport2);
      }
    }, title: this.props.label, style: { transform: `rotateX(${rx}deg)` }, children: (0, import_jsx_runtime3.jsx)("svg", { fill: "none", width: "100%", height: "100%", viewBox: "0 0 26 26", children: (0, import_jsx_runtime3.jsxs)("g", { transform: `rotate(${rz},13,13)`, children: [(0, import_jsx_runtime3.jsx)("path", { d: "M10 13.0001L12.9999 5L15.9997 13.0001H10Z", fill: "var(--icon-compass-north-color, #F05C44)" }), (0, import_jsx_runtime3.jsx)("path", { d: "M16.0002 12.9999L13.0004 21L10.0005 12.9999H16.0002Z", fill: "var(--icon-compass-south-color, #C2C2CC)" })] }) }) }) });
    (0, import_preact2.render)(ui, element);
  }
  onRemove() {
    this.deck = void 0;
    this.element = void 0;
  }
  handleCompassReset(viewport) {
    const viewId = this.viewId || viewport.id || "default-view";
    if (viewport instanceof import_core2.WebMercatorViewport) {
      const nextViewState = {
        ...viewport,
        bearing: 0,
        ...this.getRotation(viewport)[0] === 0 ? { pitch: 0 } : {},
        transitionDuration: this.props.transitionDuration,
        transitionInterpolator: new import_core2.FlyToInterpolator()
      };
      this.deck._onViewStateChange({ viewId, viewState: nextViewState, interactionState: {} });
    }
  }
};

// dist/zoom-widget.js
var import_jsx_runtime4 = require("preact/jsx-runtime");
var import_core3 = require("@deck.gl/core");
var import_preact3 = require("preact");
var ZoomWidget = class {
  constructor(props) {
    this.id = "zoom";
    this.placement = "top-left";
    this.viewId = null;
    this.viewports = {};
    this.id = props.id ?? this.id;
    this.viewId = props.viewId ?? this.viewId;
    this.placement = props.placement ?? this.placement;
    this.props = {
      ...props,
      orientation: props.orientation ?? "vertical",
      transitionDuration: props.transitionDuration ?? 200,
      zoomInLabel: props.zoomInLabel ?? "Zoom In",
      zoomOutLabel: props.zoomOutLabel ?? "Zoom Out",
      style: props.style ?? {}
    };
  }
  onAdd({ deck }) {
    const { style, className } = this.props;
    const element = document.createElement("div");
    element.classList.add("deck-widget", "deck-widget-zoom");
    if (className)
      element.classList.add(className);
    (0, import_core3._applyStyles)(element, style);
    this.deck = deck;
    this.element = element;
    this.update();
    return element;
  }
  onRemove() {
    this.deck = void 0;
    this.element = void 0;
  }
  setProps(props) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    const oldProps = this.props;
    const el = this.element;
    if (el) {
      if (oldProps.className !== props.className) {
        if (oldProps.className)
          el.classList.remove(oldProps.className);
        if (props.className)
          el.classList.add(props.className);
      }
      if (!(0, import_core3._deepEqual)(oldProps.style, props.style, 1)) {
        (0, import_core3._removeStyles)(el, oldProps.style);
        (0, import_core3._applyStyles)(el, props.style);
      }
    }
    Object.assign(this.props, props);
    this.update();
  }
  onViewportChange(viewport) {
    this.viewports[viewport.id] = viewport;
  }
  handleZoom(viewport, nextZoom) {
    const viewId = this.viewId || (viewport == null ? void 0 : viewport.id) || "default-view";
    const nextViewState = {
      ...viewport,
      zoom: nextZoom,
      transitionDuration: this.props.transitionDuration,
      transitionInterpolator: new import_core3.FlyToInterpolator()
    };
    this.deck._onViewStateChange({ viewId, viewState: nextViewState, interactionState: {} });
  }
  handleZoomIn() {
    for (const viewport of Object.values(this.viewports)) {
      this.handleZoom(viewport, viewport.zoom + 1);
    }
  }
  handleZoomOut() {
    for (const viewport of Object.values(this.viewports)) {
      this.handleZoom(viewport, viewport.zoom - 1);
    }
  }
  update() {
    const element = this.element;
    if (!element) {
      return;
    }
    const ui = (0, import_jsx_runtime4.jsxs)(ButtonGroup, { orientation: this.props.orientation, children: [(0, import_jsx_runtime4.jsx)(GroupedIconButton, { onClick: () => this.handleZoomIn(), label: this.props.zoomInLabel, className: "deck-widget-zoom-in" }), (0, import_jsx_runtime4.jsx)(GroupedIconButton, { onClick: () => this.handleZoomOut(), label: this.props.zoomOutLabel, className: "deck-widget-zoom-out" })] });
    (0, import_preact3.render)(ui, element);
  }
};

// dist/themes.js
var LightTheme = {
  "--button-background": "#fff",
  "--button-stroke": "rgba(255, 255, 255, 0.3)",
  "--button-inner-stroke": "unset",
  "--button-shadow": "0px 0px 8px 0px rgba(0, 0, 0, 0.25)",
  "--button-backdrop-filter": "unset",
  "--button-icon-idle": "rgba(97, 97, 102, 1)",
  "--button-icon-hover": "rgba(24, 24, 26, 1)",
  "--icon-compass-north-color": "#F05C44",
  "--icon-compass-south-color": "#C2C2CC"
};
var DarkTheme = {
  "--button-background": "rgba(18, 18, 20, 1)",
  "--button-stroke": "rgba(18, 18, 20, 0.30)",
  "--button-inner-stroke": "unset",
  "--button-shadow": "0px 0px 8px 0px rgba(0, 0, 0, 0.25)",
  "--button-backdrop-filter": "unset",
  "--button-icon-idle": "rgba(158, 157, 168, 1)",
  "--button-icon-hover": "rgba(215, 214, 229, 1)",
  "--icon-compass-north-color": "#F05C44",
  "--icon-compass-south-color": "#C2C2CC"
};
var LightGlassTheme = {
  "--button-background": "rgba(255, 255, 255, 0.6)",
  "--button-stroke": "rgba(255, 255, 255, 0.3)",
  "--button-inner-stroke": "1px solid rgba(255, 255, 255, 0.6)",
  "--button-shadow": "0px 0px 8px 0px rgba(0, 0, 0, 0.25), 0px 0px 8px 0px rgba(0, 0, 0, 0.1) inset",
  "--button-backdrop-filter": "blur(4px)",
  "--button-icon-idle": "rgba(97, 97, 102, 1)",
  "--button-icon-hover": "rgba(24, 24, 26, 1)",
  "--icon-compass-north-color": "#F05C44",
  "--icon-compass-south-color": "#C2C2CC"
};
var DarkGlassTheme = {
  "--button-background": "rgba(18, 18, 20, 0.75)",
  "--button-stroke": "rgba(18, 18, 20, 0.30)",
  "--button-inner-stroke": "1px solid rgba(18, 18, 20, 0.75)",
  "--button-shadow": "0px 0px 8px 0px rgba(0, 0, 0, 0.25), 0px 0px 8px 0px rgba(0, 0, 0, 0.1) inset",
  "--button-backdrop-filter": "blur(4px)",
  "--button-icon-idle": "rgba(158, 157, 168, 1)",
  "--button-icon-hover": "rgba(215, 214, 229, 1)",
  "--icon-compass-north-color": "#F05C44",
  "--icon-compass-south-color": "#C2C2CC"
};
//# sourceMappingURL=index.cjs.map
