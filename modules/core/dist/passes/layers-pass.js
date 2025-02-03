// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import Pass from "./pass.js";
/** A Pass that renders all layers */
export default class LayersPass extends Pass {
    constructor() {
        super(...arguments);
        this._lastRenderIndex = -1;
    }
    render(options) {
        // @ts-expect-error TODO - assuming WebGL context
        const [width, height] = this.device.canvasContext.getDrawingBufferSize();
        // Explicitly specify clearColor and clearDepth, overriding render pass defaults.
        const clearCanvas = options.clearCanvas ?? true;
        const clearColor = options.clearColor ?? (clearCanvas ? [0, 0, 0, 0] : false);
        const clearDepth = clearCanvas ? 1 : false;
        const clearStencil = clearCanvas ? 0 : false;
        const colorMask = options.colorMask ?? 0xf;
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
            clearColor: clearColor,
            clearDepth,
            clearStencil
        });
        try {
            return this._drawLayers(renderPass, options);
        }
        finally {
            renderPass.end();
        }
    }
    /** Draw a list of layers in a list of viewports */
    _drawLayers(renderPass, options) {
        const { target, shaderModuleProps, viewports, views, onViewportActive, clearStack = true } = options;
        options.pass = options.pass || 'unknown';
        if (clearStack) {
            this._lastRenderIndex = -1;
        }
        const renderStats = [];
        for (const viewport of viewports) {
            const view = views && views[viewport.id];
            // Update context to point to this viewport
            onViewportActive?.(viewport);
            const drawLayerParams = this._getDrawLayerParams(viewport, options);
            // render this viewport
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
    _getDrawLayerParams(viewport, { layers, pass, isPicking = false, layerFilter, cullRect, effects, shaderModuleProps }, 
    /** Internal flag, true if only used to determine whether each layer should be drawn */
    evaluateShouldDrawOnly = false) {
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
            // Check if we should draw layer
            const shouldDrawLayer = this._shouldDrawLayer(layer, drawContext, layerFilter, layerFilterCache);
            const layerParam = { shouldDrawLayer };
            if (shouldDrawLayer && !evaluateShouldDrawOnly) {
                layerParam.shouldDrawLayer = true;
                // This is the "logical" index for ordering this layer in the stack
                // used to calculate polygon offsets
                // It can be the same as another layer
                layerParam.layerRenderIndex = indexResolver(layer, shouldDrawLayer);
                layerParam.shaderModuleProps = this._getShaderModuleProps(layer, effects, pass, shaderModuleProps);
                layerParam.layerParameters = {
                    ...layer.context.deck?.props.parameters,
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
        // render layers in normal colors
        const renderStatus = {
            totalCount: layers.length,
            visibleCount: 0,
            compositeCount: 0,
            pickableCount: 0
        };
        renderPass.setParameters({ viewport: glViewport });
        // render layers in normal colors
        for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
            const layer = layers[layerIndex];
            const drawLayerParameters = drawLayerParams[layerIndex];
            const { shouldDrawLayer } = drawLayerParameters;
            // Calculate stats
            if (shouldDrawLayer && layer.props.pickable) {
                renderStatus.pickableCount++;
            }
            if (layer.isComposite) {
                renderStatus.compositeCount++;
            }
            if (layer.isDrawable && drawLayerParameters.shouldDrawLayer) {
                const { layerRenderIndex, shaderModuleProps, layerParameters } = drawLayerParameters;
                // Draw the layer
                renderStatus.visibleCount++;
                this._lastRenderIndex = Math.max(this._lastRenderIndex, layerRenderIndex);
                // overwrite layer.context.viewport with the sub viewport
                if (shaderModuleProps.project) {
                    shaderModuleProps.project.viewport = viewport;
                }
                // TODO v9 - we are sending renderPass both as a parameter and through the context.
                // Long-term, it is likely better not to have user defined layer methods have to access
                // the "global" layer context.
                layer.context.renderPass = renderPass;
                try {
                    layer._drawLayer({
                        renderPass,
                        shaderModuleProps,
                        uniforms: { layerIndex: layerRenderIndex },
                        parameters: layerParameters
                    });
                }
                catch (err) {
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
            // @ts-ignore
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
        // If a layer is drawn, update its viewportChanged flag
        layer.activateViewport(drawContext.viewport);
        return true;
    }
    _getShaderModuleProps(layer, effects, pass, overrides) {
        // @ts-expect-error TODO - assuming WebGL context
        const devicePixelRatio = this.device.canvasContext.cssToDeviceRatio();
        const layerProps = layer.internalState?.propsInTransition || layer.props;
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
                mergeModuleParameters(shaderModuleProps, effect.getShaderModuleProps?.(layer, shaderModuleProps));
            }
        }
        return mergeModuleParameters(shaderModuleProps, this.getShaderModuleProps(layer, effects, shaderModuleProps), overrides);
    }
}
// If the _index prop is defined, return a layer index that's relative to its parent
// Otherwise return the index of the layer among all rendered layers
// This is done recursively, i.e. if the user overrides a layer's default index,
// all its descendants will be resolved relative to that index.
// This implementation assumes that parent layers always appear before its children
// which is true if the layer array comes from the LayerManager
export function layerIndexResolver(startIndex = 0, layerIndices = {}) {
    const resolvers = {};
    const resolveLayerIndex = (layer, isDrawn) => {
        const indexOverride = layer.props._offset;
        const layerId = layer.id;
        const parentId = layer.parent && layer.parent.id;
        let index;
        if (parentId && !(parentId in layerIndices)) {
            // Populate layerIndices with the parent layer's index
            resolveLayerIndex(layer.parent, false);
        }
        if (parentId in resolvers) {
            const resolver = (resolvers[parentId] =
                resolvers[parentId] || layerIndexResolver(layerIndices[parentId], layerIndices));
            index = resolver(layer, isDrawn);
            resolvers[layerId] = resolver;
        }
        else if (Number.isFinite(indexOverride)) {
            index = indexOverride + (layerIndices[parentId] || 0);
            // Mark layer as needing its own resolver
            // We don't actually create it until it's used for the first time
            resolvers[layerId] = null;
        }
        else {
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
// Convert viewport top-left CSS coordinates to bottom up WebGL coordinates
function getGLViewport(device, { shaderModuleProps, target, viewport }) {
    const pixelRatio = shaderModuleProps?.project?.devicePixelRatio ??
        // @ts-expect-error TODO - assuming WebGL context
        device.canvasContext.cssToDeviceRatio();
    // Default framebuffer is used when writing to canvas
    // @ts-expect-error TODO - assuming WebGL context
    const [, drawingBufferHeight] = device.canvasContext.getDrawingBufferSize();
    const height = target ? target.height : drawingBufferHeight;
    // Convert viewport top-left CSS coordinates to bottom up WebGL coordinates
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
                }
                else {
                    target[key] = source[key];
                }
            }
        }
    }
    return target;
}
//# sourceMappingURL=layers-pass.js.map