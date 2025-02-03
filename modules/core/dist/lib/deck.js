// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import LayerManager from "./layer-manager.js";
import ViewManager from "./view-manager.js";
import MapView from "../views/map-view.js";
import EffectManager from "./effect-manager.js";
import DeckRenderer from "./deck-renderer.js";
import DeckPicker from "./deck-picker.js";
import { WidgetManager } from "./widget-manager.js";
import Tooltip from "./tooltip.js";
import log from "../utils/log.js";
import { deepEqual } from "../utils/deep-equal.js";
import typedArrayManager from "../utils/typed-array-manager.js";
import { VERSION } from "./init.js";
import { luma } from '@luma.gl/core';
import { WebGLDevice, webgl2Adapter } from '@luma.gl/webgl';
import { Timeline } from '@luma.gl/engine';
import { AnimationLoop } from '@luma.gl/engine';
import { GL } from '@luma.gl/constants';
import { Stats } from '@probe.gl/stats';
import { EventManager } from 'mjolnir.js';
import assert from "../utils/assert.js";
import { EVENT_HANDLERS, RECOGNIZERS } from "./constants.js";
/* global document */
// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() { }
const getCursor = ({ isDragging }) => (isDragging ? 'grabbing' : 'grab');
const defaultProps = {
    id: '',
    width: '100%',
    height: '100%',
    style: null,
    viewState: null,
    initialViewState: null,
    pickingRadius: 0,
    layerFilter: null,
    parameters: {},
    parent: null,
    device: null,
    deviceProps: { type: 'webgl' },
    gl: null,
    canvas: null,
    layers: [],
    effects: [],
    views: null,
    controller: null, // Rely on external controller, e.g. react-map-gl
    useDevicePixels: true,
    touchAction: 'none',
    eventRecognizerOptions: {},
    _framebuffer: null,
    _animate: false,
    _pickable: true,
    _typedArrayManagerProps: {},
    _customRender: null,
    widgets: [],
    onDeviceInitialized: noop,
    onWebGLInitialized: noop,
    onResize: noop,
    onViewStateChange: noop,
    onInteractionStateChange: noop,
    onBeforeRender: noop,
    onAfterRender: noop,
    onLoad: noop,
    onError: (error) => log.error(error.message, error.cause)(),
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
/* eslint-disable max-statements */
class Deck {
    constructor(props) {
        this.width = 0;
        this.height = 0;
        // Allows attaching arbitrary data to the instance
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
        this.stats = new Stats({ id: 'deck.gl' });
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
        this._needsRedraw = 'Initial render';
        this._pickRequest = {
            mode: 'hover',
            x: -1,
            y: -1,
            radius: 0,
            event: null
        };
        /**
         * Pick and store the object under the pointer on `pointerdown`.
         * This object is reused for subsequent `onClick` and `onDrag*` callbacks.
         */
        this._lastPointerDownInfo = null;
        // The `pointermove` event may fire multiple times in between two animation frames,
        // it's a waste of time to run picking without rerender. Instead we save the last pick
        // request and only do it once on the next animation frame.
        /** Internal use only: event handler for pointerdown */
        this._onPointerMove = (event) => {
            const { _pickRequest } = this;
            if (event.type === 'pointerleave') {
                _pickRequest.x = -1;
                _pickRequest.y = -1;
                _pickRequest.radius = 0;
            }
            else if (event.leftButton || event.rightButton) {
                // Do not trigger onHover callbacks if mouse button is down.
                return;
            }
            else {
                const pos = event.offsetCenter;
                // Do not trigger callbacks when click/hover position is invalid. Doing so will cause a
                // assertion error when attempting to unproject the position.
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
        /** Internal use only: event handler for click & drag */
        this._onEvent = (event) => {
            const eventHandlerProp = EVENT_HANDLERS[event.type];
            const pos = event.offsetCenter;
            if (!eventHandlerProp || !pos || !this.layerManager) {
                return;
            }
            // Reuse last picked object
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
                rootHandler?.(info, event);
                this.widgetManager.onEvent(info, event);
            }
        };
        /** Internal use only: evnet handler for pointerdown */
        this._onPointerDown = (event) => {
            const pos = event.offsetCenter;
            const pickedInfo = this._pick('pickObject', 'pickObject Time', {
                x: pos.x,
                y: pos.y,
                radius: this.props.pickingRadius
            });
            this._lastPointerDownInfo = pickedInfo.result[0] || pickedInfo.emptyInfo;
        };
        // @ts-ignore views
        this.props = { ...defaultProps, ...props };
        props = this.props;
        if (props.viewState && props.initialViewState) {
            log.warn('View state tracking is disabled. Use either `initialViewState` for auto update or `viewState` for manual update.')();
        }
        this.viewState = this.props.initialViewState;
        // See if we already have a device
        if (props.device) {
            this.device = props.device;
        }
        let deviceOrPromise = this.device;
        // Attach a new luma.gl device to a WebGL2 context if supplied
        if (!deviceOrPromise && props.gl) {
            if (props.gl instanceof WebGLRenderingContext) {
                log.error('WebGL1 context not supported.')();
            }
            deviceOrPromise = webgl2Adapter.attach(props.gl);
        }
        // Create a new device
        if (!deviceOrPromise) {
            // Create the "best" device supported from the registered adapters
            deviceOrPromise = luma.createDevice({
                type: 'best-available',
                adapters: [webgl2Adapter],
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
        // UNSAFE/experimental prop: only set at initialization to avoid performance hit
        if (props._typedArrayManagerProps) {
            typedArrayManager.setOptions(props._typedArrayManagerProps);
        }
        this.animationLoop.start();
    }
    /** Stop rendering and dispose all resources */
    finalize() {
        this.animationLoop?.stop();
        this.animationLoop?.destroy();
        this.animationLoop = null;
        this._lastPointerDownInfo = null;
        this.layerManager?.finalize();
        this.layerManager = null;
        this.viewManager?.finalize();
        this.viewManager = null;
        this.effectManager?.finalize();
        this.effectManager = null;
        this.deckRenderer?.finalize();
        this.deckRenderer = null;
        this.deckPicker?.finalize();
        this.deckPicker = null;
        this.eventManager?.destroy();
        this.eventManager = null;
        this.widgetManager?.finalize();
        this.widgetManager = null;
        if (!this.props.canvas && !this.props.device && !this.props.gl && this.canvas) {
            // remove internally created canvas
            this.canvas.parentElement?.removeChild(this.canvas);
            this.canvas = null;
        }
    }
    /** Partially update props */
    setProps(props) {
        this.stats.get('setProps Time').timeStart();
        if ('onLayerHover' in props) {
            log.removed('onLayerHover', 'onHover')();
        }
        if ('onLayerClick' in props) {
            log.removed('onLayerClick', 'onClick')();
        }
        if (props.initialViewState &&
            // depth = 3 when comparing viewStates: viewId.position.0
            !deepEqual(this.props.initialViewState, props.initialViewState, 3)) {
            // Overwrite internal view state
            this.viewState = props.initialViewState;
        }
        // Merge with existing props
        Object.assign(this.props, props);
        // Update CSS size of canvas
        this._setCanvasSize(this.props);
        // We need to overwrite CSS style width and height with actual, numeric values
        const resolvedProps = Object.create(this.props);
        Object.assign(resolvedProps, {
            views: this._getViews(),
            width: this.width,
            height: this.height,
            viewState: this._getViewState()
        });
        // Update the animation loop
        this.animationLoop?.setProps(resolvedProps);
        // If initialized, update sub manager props
        if (this.layerManager) {
            this.viewManager.setProps(resolvedProps);
            // Make sure that any new layer gets initialized with the current viewport
            this.layerManager.activateViewport(this.getViewports()[0]);
            this.layerManager.setProps(resolvedProps);
            this.effectManager.setProps(resolvedProps);
            this.deckRenderer.setProps(resolvedProps);
            this.deckPicker.setProps(resolvedProps);
            this.widgetManager.setProps(resolvedProps);
        }
        this.stats.get('setProps Time').timeEnd();
    }
    // Public API
    /**
     * Check if a redraw is needed
     * @returns `false` or a string summarizing the redraw reason
     */
    needsRedraw(opts = { clearRedrawFlags: false }) {
        if (!this.layerManager) {
            // Not initialized or already finalized
            return false;
        }
        if (this.props._animate) {
            return 'Deck._animate';
        }
        let redraw = this._needsRedraw;
        if (opts.clearRedrawFlags) {
            this._needsRedraw = false;
        }
        const viewManagerNeedsRedraw = this.viewManager.needsRedraw(opts);
        const layerManagerNeedsRedraw = this.layerManager.needsRedraw(opts);
        const effectManagerNeedsRedraw = this.effectManager.needsRedraw(opts);
        const deckRendererNeedsRedraw = this.deckRenderer.needsRedraw(opts);
        redraw =
            redraw ||
                viewManagerNeedsRedraw ||
                layerManagerNeedsRedraw ||
                effectManagerNeedsRedraw ||
                deckRendererNeedsRedraw;
        return redraw;
    }
    /**
     * Redraw the GL context
     * @param reason If not provided, only redraw if deemed necessary. Otherwise redraw regardless of internal states.
     * @returns
     */
    redraw(reason) {
        if (!this.layerManager) {
            // Not yet initialized
            return;
        }
        // Check if we need to redraw
        let redrawReason = this.needsRedraw({ clearRedrawFlags: true });
        // User-supplied should take precedent, however the redraw flags get cleared regardless
        redrawReason = reason || redrawReason;
        if (!redrawReason) {
            return;
        }
        this.stats.get('Redraw Count').incrementCount();
        if (this.props._customRender) {
            this.props._customRender(redrawReason);
        }
        else {
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
        const infos = this._pick('pickObject', 'pickObject Time', opts).result;
        return infos.length ? infos[0] : null;
    }
    /* Query all rendered objects at a given point */
    pickMultipleObjects(opts) {
        opts.depth = opts.depth || 10;
        return this._pick('pickObject', 'pickMultipleObjects Time', opts).result;
    }
    /* Query all objects rendered on top within a bounding box */
    pickObjects(opts) {
        return this._pick('pickObjects', 'pickObjects Time', opts);
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
    _addDefaultShaderModule(module) {
        this.layerManager.addDefaultShaderModule(module);
    }
    _removeDefaultShaderModule(module) {
        this.layerManager?.removeDefaultShaderModule(module);
    }
    _pick(method, statKey, opts) {
        assert(this.deckPicker);
        const { stats } = this;
        stats.get('Pick Count').incrementCount();
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
        // TODO EventManager should accept element id
        if (typeof canvas === 'string') {
            canvas = document.getElementById(canvas);
            assert(canvas);
        }
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = props.id || 'deckgl-overlay';
            const parent = props.parent || document.body;
            parent.appendChild(canvas);
        }
        Object.assign(canvas.style, props.style);
        return canvas;
    }
    /** Updates canvas width and/or height, if provided as props */
    _setCanvasSize(props) {
        if (!this.canvas) {
            return;
        }
        const { width, height } = props;
        // Set size ONLY if props are being provided, otherwise let canvas be layouted freely
        if (width || width === 0) {
            const cssWidth = Number.isFinite(width) ? `${width}px` : width;
            this.canvas.style.width = cssWidth;
        }
        if (height || height === 0) {
            const cssHeight = Number.isFinite(height) ? `${height}px` : height;
            // Note: position==='absolute' required for height 100% to work
            this.canvas.style.position = props.style?.position || 'absolute';
            this.canvas.style.height = cssHeight;
        }
    }
    /** If canvas size has changed, reads out the new size and update */
    _updateCanvasSize() {
        const { canvas } = this;
        if (!canvas) {
            return;
        }
        // Fallback to width/height when clientWidth/clientHeight are undefined (OffscreenCanvas).
        const newWidth = canvas.clientWidth ?? canvas.width;
        const newHeight = canvas.clientHeight ?? canvas.height;
        if (newWidth !== this.width || newHeight !== this.height) {
            // @ts-expect-error private assign to read-only property
            this.width = newWidth;
            // @ts-expect-error private assign to read-only property
            this.height = newHeight;
            this.viewManager?.setProps({ width: newWidth, height: newHeight });
            // Make sure that any new layer gets initialized with the current viewport
            this.layerManager?.activateViewport(this.getViewports()[0]);
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
        useDevicePixels } = props;
        return new AnimationLoop({
            device: deviceOrPromise,
            useDevicePixels,
            // TODO v9
            autoResizeDrawingBuffer: !gl, // do not auto resize external context
            autoResizeViewport: false,
            // @ts-expect-error luma.gl needs to accept Promise<void> return value
            onInitialize: context => this._setDevice(context.device),
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
        const normalizedViews = Array.isArray(views)
            ? views
            : // If null, default to a full screen map view port
                views
                    ? [views]
                    : [new MapView({ id: 'default-view' })];
        if (normalizedViews.length && this.props.controller) {
            // Backward compatibility: support controller prop
            normalizedViews[0].props.controller = this.props.controller;
        }
        return normalizedViews;
    }
    _onContextLost() {
        const { onError } = this.props;
        if (this.animationLoop && onError) {
            onError(new Error('WebGL context is lost'));
        }
    }
    /** Actually run picking */
    _pickAndCallback() {
        const { _pickRequest } = this;
        if (_pickRequest.event) {
            // Perform picking
            const { result, emptyInfo } = this._pick('pickObject', 'pickObject Time', _pickRequest);
            this.cursorState.isHovering = result.length > 0;
            // There are 4 possible scenarios:
            // result is [outInfo, pickedInfo] (moved from one pickable layer to another)
            // result is [outInfo] (moved outside of a pickable layer)
            // result is [pickedInfo] (moved into or over a pickable layer)
            // result is [] (nothing is or was picked)
            //
            // `layer.props.onHover` should be called on all affected layers (out/over)
            // `deck.props.onHover` should be called with the picked info if any, or empty info otherwise
            // `deck.props.getTooltip` should be called with the picked info if any, or empty info otherwise
            // Execute callbacks
            let pickedInfo = emptyInfo;
            let handled = false;
            for (const info of result) {
                pickedInfo = info;
                handled = info.layer?.onHover(info, _pickRequest.event) || handled;
            }
            if (!handled) {
                this.props.onHover?.(pickedInfo, _pickRequest.event);
                this.widgetManager.onHover(pickedInfo, _pickRequest.event);
            }
            // Clear pending pickRequest
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
        this.device = device;
        if (!this.animationLoop) {
            // finalize() has been called
            return;
        }
        // if external context...
        if (!this.canvas) {
            this.canvas = this.device.canvasContext?.canvas;
            // TODO v9
            // ts-expect-error - Currently luma.gl v9 does not expose these options
            // All WebGLDevice contexts are instrumented, but it seems the device
            // should have a method to start state tracking even if not enabled?
            // instrumentGLContext(this.device.gl, {enable: true, copyState: true});
        }
        if (this.device instanceof WebGLDevice) {
            this.device.setParametersWebGL({
                blend: true,
                blendFunc: [770, 771, 1, 771],
                polygonOffsetFill: true,
                depthTest: true,
                depthFunc: 515
            });
        }
        this.props.onDeviceInitialized(this.device);
        if (this.device instanceof WebGLDevice) {
            // Legacy callback - warn?
            this.props.onWebGLInitialized(this.device.gl);
        }
        // timeline for transitions
        const timeline = new Timeline();
        timeline.play();
        this.animationLoop.attachTimeline(timeline);
        this.eventManager = new EventManager(this.props.parent || this.canvas, {
            touchAction: this.props.touchAction,
            recognizers: Object.keys(RECOGNIZERS).map((eventName) => {
                // Resolve recognizer settings
                const [RecognizerConstructor, defaultOptions, recognizeWith, requestFailure] = RECOGNIZERS[eventName];
                const optionsOverride = this.props.eventRecognizerOptions?.[eventName];
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
        // viewManager must be initialized before layerManager
        // layerManager depends on viewport created by viewManager.
        const viewport = this.viewManager.getViewports()[0];
        // Note: avoid React setState due GL animation loop / setState timing issue
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
            parentElement: this.canvas?.parentElement
        });
        this.widgetManager.addDefault(new Tooltip());
        this.setProps(this.props);
        this._updateCanvasSize();
        this.props.onLoad();
    }
    /** Internal only: default render function (redraw all layers and views) */
    _drawLayers(redrawReason, renderOptions) {
        const { device, gl } = this.layerManager.context;
        this.props.onBeforeRender({ device, gl });
        const opts = {
            target: this.props._framebuffer,
            layers: this.layerManager.getLayers(),
            viewports: this.viewManager.getViewports(),
            onViewportActive: this.layerManager.activateViewport,
            views: this.viewManager.getViews(),
            pass: 'screen',
            effects: this.effectManager.getEffects(),
            ...renderOptions
        };
        this.deckRenderer?.renderLayers(opts);
        if (opts.pass === 'screen') {
            // This method could be called when drawing to picking buffer, texture etc.
            // Only when drawing to screen, update all widgets (UI components)
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
        // Log perf stats every second
        if (this._metricsCounter++ % 60 === 0) {
            this._getMetrics();
            this.stats.reset();
            log.table(4, this.metrics)();
            // Experimental: report metrics
            if (this.props._onMetrics) {
                this.props._onMetrics(this.metrics);
            }
        }
        this._updateCanvasSize();
        this._updateCursor();
        // Update layers if needed (e.g. some async prop has loaded)
        // Note: This can trigger a redraw
        this.layerManager.updateLayers();
        // Perform picking request if any
        this._pickAndCallback();
        // Redraw if necessary
        this.redraw();
        // Update viewport transition if needed
        // Note: this can trigger `onViewStateChange`, and affect layers
        // We want to defer these changes to the next frame
        if (this.viewManager) {
            this.viewManager.updateViewStates();
        }
    }
    // Callbacks
    _onViewStateChange(params) {
        // Let app know that view state is changing, and give it a chance to change it
        const viewState = this.props.onViewStateChange(params) || params.viewState;
        // If initialViewState was set on creation, auto track position
        if (this.viewState) {
            this.viewState = { ...this.viewState, [params.viewId]: viewState };
            if (!this.props.viewState) {
                // Apply internal view state
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
        stats.get('frameRate').timeEnd();
        stats.get('frameRate').timeStart();
        // Get individual stats from luma.gl so reset works
        const animationLoopStats = this.animationLoop.stats;
        stats.get('GPU Time').addTime(animationLoopStats.get('GPU Time').lastTiming);
        stats.get('CPU Time').addTime(animationLoopStats.get('CPU Time').lastTiming);
    }
    _getMetrics() {
        const { metrics, stats } = this;
        metrics.fps = stats.get('frameRate').getHz();
        metrics.setPropsTime = stats.get('setProps Time').time;
        metrics.updateAttributesTime = stats.get('Update Attributes').time;
        metrics.framesRedrawn = stats.get('Redraw Count').count;
        metrics.pickTime =
            stats.get('pickObject Time').time +
                stats.get('pickMultipleObjects Time').time +
                stats.get('pickObjects Time').time;
        metrics.pickCount = stats.get('Pick Count').count;
        // Luma stats
        metrics.gpuTime = stats.get('GPU Time').time;
        metrics.cpuTime = stats.get('CPU Time').time;
        metrics.gpuTimePerFrame = stats.get('GPU Time').getAverageTime();
        metrics.cpuTimePerFrame = stats.get('CPU Time').getAverageTime();
        const memoryStats = luma.stats.get('Memory Usage');
        metrics.bufferMemory = memoryStats.get('Buffer Memory').count;
        metrics.textureMemory = memoryStats.get('Texture Memory').count;
        metrics.renderbufferMemory = memoryStats.get('Renderbuffer Memory').count;
        metrics.gpuMemory = memoryStats.get('GPU Memory').count;
    }
}
Deck.defaultProps = defaultProps;
// This is used to defeat tree shaking of init.js
// https://github.com/visgl/deck.gl/issues/3213
Deck.VERSION = VERSION;
export default Deck;
//# sourceMappingURL=deck.js.map