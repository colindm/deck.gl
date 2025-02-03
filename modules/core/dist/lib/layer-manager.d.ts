import type { Device, RenderPass } from '@luma.gl/core';
import { Timeline } from '@luma.gl/engine';
import type { ShaderAssembler, ShaderModule } from '@luma.gl/shadertools';
import { Stats } from '@probe.gl/stats';
import ResourceManager from "./resource/resource-manager.js";
import Viewport from "../viewports/viewport.js";
import type Layer from "./layer.js";
import type Deck from "./deck.js";
export type LayerContext = {
    layerManager: LayerManager;
    resourceManager: ResourceManager;
    deck?: Deck<any>;
    device: Device;
    shaderAssembler: ShaderAssembler;
    defaultShaderModules: ShaderModule[];
    renderPass: RenderPass;
    stats: Stats;
    viewport: Viewport;
    timeline: Timeline;
    mousePosition: {
        x: number;
        y: number;
    } | null;
    userData: any;
    onError?: <PropsT extends {}>(error: Error, source: Layer<PropsT>) => void;
    /** @deprecated Use context.device */
    gl: WebGL2RenderingContext;
};
export type LayersList = (Layer | undefined | false | null | LayersList)[];
export type LayerManagerProps = {
    deck?: Deck<any>;
    stats?: Stats;
    viewport?: Viewport;
    timeline?: Timeline;
};
export default class LayerManager {
    layers: Layer[];
    context: LayerContext;
    resourceManager: ResourceManager;
    private _lastRenderedLayers;
    private _needsRedraw;
    private _needsUpdate;
    private _nextLayers;
    private _debug;
    private _defaultShaderModulesChanged;
    /**
     * @param device
     * @param param1
     */
    constructor(device: Device, props: LayerManagerProps);
    /** Method to call when the layer manager is not needed anymore. */
    finalize(): void;
    /** Check if a redraw is needed */
    needsRedraw(opts?: {
        /** Reset redraw flags to false after the call */
        clearRedrawFlags: boolean;
    }): string | false;
    /** Check if a deep update of all layers is needed */
    needsUpdate(): string | false;
    /** Layers will be redrawn (in next animation frame) */
    setNeedsRedraw(reason: string): void;
    /** Layers will be updated deeply (in next animation frame)
      Potentially regenerating attributes and sub layers */
    setNeedsUpdate(reason: string): void;
    /** Gets a list of currently rendered layers. Optionally filter by id. */
    getLayers({ layerIds }?: {
        layerIds?: string[];
    }): Layer[];
    /** Set props needed for layer rendering and picking. */
    setProps(props: any): void;
    /** Supply a new layer list, initiating sublayer generation and layer matching */
    setLayers(newLayers: LayersList, reason?: string): void;
    /** Update layers from last cycle if `setNeedsUpdate()` has been called */
    updateLayers(): void;
    /** Make a viewport "current" in layer context, updating viewportChanged flags */
    activateViewport: (viewport: Viewport) => void;
    /** Register a default shader module */
    addDefaultShaderModule(module: ShaderModule): void;
    /** Deregister a default shader module */
    removeDefaultShaderModule(module: ShaderModule): void;
    private _handleError;
    /** Match all layers, checking for caught errors
      to avoid having an exception in one layer disrupt other layers */
    private _updateLayers;
    private _updateSublayersRecursively;
    private _finalizeOldLayers;
    /** Safely initializes a single layer, calling layer methods */
    private _initializeLayer;
    /** Transfer state from one layer to a newer version */
    private _transferLayerState;
    /** Safely updates a single layer, cleaning all flags */
    private _updateLayer;
    /** Safely finalizes a single layer, removing all resources */
    private _finalizeLayer;
}
//# sourceMappingURL=layer-manager.d.ts.map