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
  CompassWidget: () => CompassWidget,
  DeckGL: () => deckgl_default,
  FullscreenWidget: () => FullscreenWidget,
  ZoomWidget: () => ZoomWidget,
  default: () => deckgl_default,
  useWidget: () => useWidget
});
module.exports = __toCommonJS(dist_exports);

// dist/deckgl.js
var React2 = __toESM(require("react"), 1);
var import_react6 = require("react");
var import_core3 = require("@deck.gl/core");

// dist/utils/use-isomorphic-layout-effect.js
var import_react = require("react");
var useIsomorphicLayoutEffect = typeof window !== "undefined" ? import_react.useLayoutEffect : import_react.useEffect;
var use_isomorphic_layout_effect_default = useIsomorphicLayoutEffect;

// dist/utils/extract-jsx-layers.js
var React = __toESM(require("react"), 1);
var import_react3 = require("react");

// dist/utils/inherits-from.js
function inheritsFrom(Type, ParentType) {
  while (Type) {
    if (Type === ParentType) {
      return true;
    }
    Type = Object.getPrototypeOf(Type);
  }
  return false;
}

// dist/utils/extract-jsx-layers.js
var import_core = require("@deck.gl/core");

// dist/utils/evaluate-children.js
var import_react2 = require("react");
var MAP_STYLE = { position: "absolute", zIndex: -1 };
function evaluateChildren(children, childProps) {
  if (typeof children === "function") {
    return children(childProps);
  }
  if (Array.isArray(children)) {
    return children.map((child) => evaluateChildren(child, childProps));
  }
  if (isComponent(children)) {
    if (isReactMap(children)) {
      childProps.style = MAP_STYLE;
      return (0, import_react2.cloneElement)(children, childProps);
    }
    if (needsDeckGLViewProps(children)) {
      return (0, import_react2.cloneElement)(children, childProps);
    }
  }
  return children;
}
function isComponent(child) {
  return child && typeof child === "object" && "type" in child || false;
}
function isReactMap(child) {
  var _a;
  return (_a = child.props) == null ? void 0 : _a.mapStyle;
}
function needsDeckGLViewProps(child) {
  const componentClass = child.type;
  return componentClass && componentClass.deckGLViewProps;
}

// dist/utils/extract-jsx-layers.js
function wrapInView(node) {
  if (typeof node === "function") {
    return (0, import_react3.createElement)(import_core.View, {}, node);
  }
  if (Array.isArray(node)) {
    return node.map(wrapInView);
  }
  if (isComponent(node)) {
    if (node.type === React.Fragment) {
      return wrapInView(node.props.children);
    }
    if (inheritsFrom(node.type, import_core.View)) {
      return node;
    }
  }
  return node;
}
function extractJSXLayers({ children, layers = [], views = null }) {
  const reactChildren = [];
  const jsxLayers = [];
  const jsxViews = {};
  React.Children.forEach(wrapInView(children), (reactElement) => {
    if (isComponent(reactElement)) {
      const ElementType = reactElement.type;
      if (inheritsFrom(ElementType, import_core.Layer)) {
        const layer = createLayer(ElementType, reactElement.props);
        jsxLayers.push(layer);
      } else {
        reactChildren.push(reactElement);
      }
      if (inheritsFrom(ElementType, import_core.View) && ElementType !== import_core.View && reactElement.props.id) {
        const view = new ElementType(reactElement.props);
        jsxViews[view.id] = view;
      }
    } else if (reactElement) {
      reactChildren.push(reactElement);
    }
  });
  if (Object.keys(jsxViews).length > 0) {
    if (Array.isArray(views)) {
      views.forEach((view) => {
        jsxViews[view.id] = view;
      });
    } else if (views) {
      jsxViews[views.id] = views;
    }
    views = Object.values(jsxViews);
  }
  layers = jsxLayers.length > 0 ? [...jsxLayers, ...layers] : layers;
  return { layers, children: reactChildren, views };
}
function createLayer(LayerType, reactProps) {
  const props = {};
  const defaultProps = LayerType.defaultProps || {};
  for (const key in reactProps) {
    if (defaultProps[key] !== reactProps[key]) {
      props[key] = reactProps[key];
    }
  }
  return new LayerType(props);
}

// dist/utils/position-children-under-views.js
var import_react5 = require("react");
var import_core2 = require("@deck.gl/core");

// dist/utils/deckgl-context.js
var import_react4 = require("react");
var DeckGlContext = (0, import_react4.createContext)();

// dist/utils/position-children-under-views.js
function positionChildrenUnderViews({ children, deck, ContextProvider = DeckGlContext.Provider }) {
  const { viewManager } = deck || {};
  if (!viewManager || !viewManager.views.length) {
    return [];
  }
  const views = {};
  const defaultViewId = viewManager.views[0].id;
  for (const child of children) {
    let viewId = defaultViewId;
    let viewChildren = child;
    if (isComponent(child) && inheritsFrom(child.type, import_core2.View)) {
      viewId = child.props.id || defaultViewId;
      viewChildren = child.props.children;
    }
    const viewport = viewManager.getViewport(viewId);
    const viewState = viewManager.getViewState(viewId);
    if (viewport) {
      viewState.padding = viewport.padding;
      const { x, y, width, height } = viewport;
      viewChildren = evaluateChildren(viewChildren, {
        x,
        y,
        width,
        height,
        viewport,
        viewState
      });
      if (!views[viewId]) {
        views[viewId] = {
          viewport,
          children: []
        };
      }
      views[viewId].children.push(viewChildren);
    }
  }
  return Object.keys(views).map((viewId) => {
    const { viewport, children: viewChildren } = views[viewId];
    const { x, y, width, height } = viewport;
    const style = {
      position: "absolute",
      left: x,
      top: y,
      width,
      height
    };
    const key = `view-${viewId}`;
    const viewElement = (0, import_react5.createElement)("div", { key, id: key, style }, ...viewChildren);
    const contextValue = {
      deck,
      viewport,
      // @ts-expect-error accessing protected property
      container: deck.canvas.offsetParent,
      // @ts-expect-error accessing protected property
      eventManager: deck.eventManager,
      onViewStateChange: (params) => {
        params.viewId = viewId;
        deck._onViewStateChange(params);
      },
      widgets: []
    };
    const providerKey = `view-${viewId}-context`;
    return (0, import_react5.createElement)(ContextProvider, { key: providerKey, value: contextValue }, viewElement);
  });
}

// dist/utils/extract-styles.js
var CANVAS_ONLY_STYLES = {
  mixBlendMode: null
};
function extractStyles({ width, height, style }) {
  const containerStyle = {
    position: "absolute",
    zIndex: 0,
    left: 0,
    top: 0,
    width,
    height
  };
  const canvasStyle = {
    left: 0,
    top: 0
  };
  if (style) {
    for (const key in style) {
      if (key in CANVAS_ONLY_STYLES) {
        canvasStyle[key] = style[key];
      } else {
        containerStyle[key] = style[key];
      }
    }
  }
  return { containerStyle, canvasStyle };
}

// dist/deckgl.js
function getRefHandles(thisRef) {
  return {
    get deck() {
      return thisRef.deck;
    },
    // The following method can only be called after ref is available, by which point deck is defined in useEffect
    pickObject: (opts) => thisRef.deck.pickObject(opts),
    pickMultipleObjects: (opts) => thisRef.deck.pickMultipleObjects(opts),
    pickObjects: (opts) => thisRef.deck.pickObjects(opts)
  };
}
function redrawDeck(thisRef) {
  if (thisRef.redrawReason) {
    thisRef.deck._drawLayers(thisRef.redrawReason);
    thisRef.redrawReason = null;
  }
}
function createDeckInstance(thisRef, DeckClass, props) {
  const deck = new DeckClass({
    ...props,
    // The Deck's animation loop is independent from React's render cycle, causing potential
    // synchronization issues. We provide this custom render function to make sure that React
    // and Deck update on the same schedule.
    _customRender: (redrawReason) => {
      thisRef.redrawReason = redrawReason;
      const viewports = deck.getViewports();
      if (thisRef.lastRenderedViewports !== viewports) {
        thisRef.forceUpdate();
      } else {
        redrawDeck(thisRef);
      }
    }
  });
  return deck;
}
function DeckGLWithRef(props, ref) {
  const [version, setVersion] = (0, import_react6.useState)(0);
  const _thisRef = (0, import_react6.useRef)({
    control: null,
    version,
    forceUpdate: () => setVersion((v) => v + 1)
  });
  const thisRef = _thisRef.current;
  const containerRef = (0, import_react6.useRef)(null);
  const canvasRef = (0, import_react6.useRef)(null);
  const jsxProps = (0, import_react6.useMemo)(() => extractJSXLayers(props), [props.layers, props.views, props.children]);
  let inRender = true;
  const handleViewStateChange = (params) => {
    var _a;
    if (inRender && props.viewState) {
      thisRef.viewStateUpdateRequested = params;
      return null;
    }
    thisRef.viewStateUpdateRequested = null;
    return (_a = props.onViewStateChange) == null ? void 0 : _a.call(props, params);
  };
  const handleInteractionStateChange = (params) => {
    var _a;
    if (inRender) {
      thisRef.interactionStateUpdateRequested = params;
    } else {
      thisRef.interactionStateUpdateRequested = null;
      (_a = props.onInteractionStateChange) == null ? void 0 : _a.call(props, params);
    }
  };
  const deckProps = (0, import_react6.useMemo)(() => {
    const forwardProps = {
      widgets: [],
      ...props,
      // Override user styling props. We will set the canvas style in render()
      style: null,
      width: "100%",
      height: "100%",
      parent: containerRef.current,
      canvas: canvasRef.current,
      layers: jsxProps.layers,
      views: jsxProps.views,
      onViewStateChange: handleViewStateChange,
      onInteractionStateChange: handleInteractionStateChange
    };
    delete forwardProps._customRender;
    if (thisRef.deck) {
      thisRef.deck.setProps(forwardProps);
    }
    return forwardProps;
  }, [props]);
  (0, import_react6.useEffect)(() => {
    const DeckClass = props.Deck || import_core3.Deck;
    thisRef.deck = createDeckInstance(thisRef, DeckClass, {
      ...deckProps,
      parent: containerRef.current,
      canvas: canvasRef.current
    });
    return () => {
      var _a;
      return (_a = thisRef.deck) == null ? void 0 : _a.finalize();
    };
  }, []);
  use_isomorphic_layout_effect_default(() => {
    redrawDeck(thisRef);
    const { viewStateUpdateRequested, interactionStateUpdateRequested } = thisRef;
    if (viewStateUpdateRequested) {
      handleViewStateChange(viewStateUpdateRequested);
    }
    if (interactionStateUpdateRequested) {
      handleInteractionStateChange(interactionStateUpdateRequested);
    }
  });
  (0, import_react6.useImperativeHandle)(ref, () => getRefHandles(thisRef), []);
  const currentViewports = thisRef.deck && thisRef.deck.isInitialized ? thisRef.deck.getViewports() : void 0;
  const { ContextProvider, width = "100%", height = "100%", id, style } = props;
  const { containerStyle, canvasStyle } = (0, import_react6.useMemo)(() => extractStyles({ width, height, style }), [width, height, style]);
  if (!thisRef.viewStateUpdateRequested && thisRef.lastRenderedViewports === currentViewports || // case 2
  thisRef.version !== version) {
    thisRef.lastRenderedViewports = currentViewports;
    thisRef.version = version;
    const childrenUnderViews = positionChildrenUnderViews({
      children: jsxProps.children,
      deck: thisRef.deck,
      ContextProvider
    });
    const canvas = (0, import_react6.createElement)("canvas", {
      key: "canvas",
      id: id || "deckgl-overlay",
      ref: canvasRef,
      style: canvasStyle
    });
    thisRef.control = (0, import_react6.createElement)("div", { id: `${id || "deckgl"}-wrapper`, ref: containerRef, style: containerStyle }, [canvas, childrenUnderViews]);
  }
  inRender = false;
  return thisRef.control;
}
var DeckGL = React2.forwardRef(DeckGLWithRef);
var deckgl_default = DeckGL;

// dist/widgets/compass-widget.js
var import_widgets = require("@deck.gl/widgets");

// dist/utils/use-widget.js
var import_react7 = require("react");
var import_core4 = require("@deck.gl/core");
function useWidget(WidgetClass, props) {
  const context = (0, import_react7.useContext)(DeckGlContext);
  const { widgets, deck } = context;
  (0, import_react7.useEffect)(() => {
    const internalWidgets = deck == null ? void 0 : deck.props.widgets;
    if ((widgets == null ? void 0 : widgets.length) && (internalWidgets == null ? void 0 : internalWidgets.length) && !(0, import_core4._deepEqual)(internalWidgets, widgets, 1)) {
      import_core4.log.warn('"widgets" prop will be ignored because React widgets are in use.')();
    }
    return () => {
      const index = widgets == null ? void 0 : widgets.indexOf(widget);
      if (index && index !== -1) {
        widgets == null ? void 0 : widgets.splice(index, 1);
        deck == null ? void 0 : deck.setProps({ widgets });
      }
    };
  }, []);
  const widget = (0, import_react7.useMemo)(() => new WidgetClass(props), [WidgetClass]);
  widgets == null ? void 0 : widgets.push(widget);
  widget.setProps(props);
  (0, import_react7.useEffect)(() => {
    deck == null ? void 0 : deck.setProps({ widgets });
  }, [widgets]);
  return widget;
}

// dist/widgets/compass-widget.js
var CompassWidget = (props = {}) => {
  const widget = useWidget(import_widgets.CompassWidget, props);
  return null;
};

// dist/widgets/fullscreen-widget.js
var import_widgets2 = require("@deck.gl/widgets");
var FullscreenWidget = (props = {}) => {
  const widget = useWidget(import_widgets2.FullscreenWidget, props);
  return null;
};

// dist/widgets/zoom-widget.js
var import_widgets3 = require("@deck.gl/widgets");
var ZoomWidget = (props = {}) => {
  const widget = useWidget(import_widgets3.ZoomWidget, props);
  return null;
};
//# sourceMappingURL=index.cjs.map
