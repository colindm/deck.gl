// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { joinLayerBounds, getRenderBounds, makeViewport } from "../utils/projection-utils.js";
import { createRenderTarget } from "./utils.js";
const MAP_MAX_SIZE = 2048;
/**
 * Manages the lifecycle of the height map (a framebuffer that encodes elevation).
 * One instance of height map is is shared across all layers. It is updated when the viewport changes
 * or when some terrain source layer's data changes.
 * During the draw call of any terrainDrawMode:offset layers,
 * the vertex shader reads from this framebuffer to retrieve its z offset.
 */
export class HeightMapBuilder {
    static isSupported(device) {
        return device.isTextureFormatRenderable('rgba32float');
    }
    constructor(device) {
        /** Viewport used to draw into the texture */
        this.renderViewport = null;
        /** Bounds of the height map texture, in cartesian space */
        this.bounds = null;
        /** Last rendered layers */
        this.layers = [];
        /** Last layer.getBounds() */
        this.layersBounds = [];
        /** The union of layersBounds in cartesian space */
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
            this.fbo = createRenderTarget(this.device, { id: 'height-map', float: true });
        }
        return this.fbo;
    }
    /** Called every render cycle to check if the framebuffer needs update */
    shouldUpdate({ layers, viewport }) {
        const layersChanged = layers.length !== this.layers.length ||
            layers.some((layer, i) => 
            // Layer instance is updated
            // Layer props might have changed
            // Undetermined props could have an effect on the output geometry of a terrain source,
            // for example getElevation+updateTriggers, elevationScale, modelMatrix
            layer !== this.layers[i] ||
                // Some prop is in transition
                layer.props.transitions ||
                // Layer's geometry bounds have changed
                layer.getBounds() !== this.layersBounds[i]);
        if (layersChanged) {
            // Recalculate cached bounds
            this.layers = layers;
            this.layersBounds = layers.map(layer => layer.getBounds());
            this.layersBoundsCommon = joinLayerBounds(layers, viewport);
        }
        const viewportChanged = !this.lastViewport || !viewport.equals(this.lastViewport);
        if (!this.layersBoundsCommon) {
            this.renderViewport = null;
        }
        else if (layersChanged || viewportChanged) {
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
            this.renderViewport =
                pixelWidth > 0 || pixelHeight > 0
                    ? makeViewport({
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
                    })
                    : null;
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
}
//# sourceMappingURL=height-map-builder.js.map