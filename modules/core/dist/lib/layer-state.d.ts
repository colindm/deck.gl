import ComponentState from "../lifecycle/component-state.js";
import type Layer from "./layer.js";
import type AttributeManager from "./attribute/attribute-manager.js";
import type Viewport from "../viewports/viewport.js";
import type UniformTransitionManager from "./uniform-transition-manager.js";
export type ChangeFlags = {
    dataChanged: string | false | {
        startRow: number;
        endRow?: number;
    }[];
    propsChanged: string | false;
    updateTriggersChanged: Record<string, true> | false;
    extensionsChanged: boolean;
    viewportChanged: boolean;
    stateChanged: boolean;
    propsOrDataChanged: boolean;
    somethingChanged: boolean;
};
export default class LayerState<LayerT extends Layer> extends ComponentState<LayerT> {
    attributeManager: AttributeManager | null;
    needsRedraw: boolean;
    needsUpdate: boolean;
    /**
     * Sublayers rendered in a previous cycle
     */
    subLayers: Layer[] | null;
    /**
     * If the layer is using the shared instancedPickingColors buffer
     */
    usesPickingColorCache: boolean;
    /**
     * If the layer has picking buffer (pickingColors or instancePickingColors)
     */
    hasPickingBuffer?: boolean;
    /**
     * Dirty flags of the layer's props and state
     */
    changeFlags: ChangeFlags;
    /** The last viewport rendered by this layer */
    viewport?: Viewport;
    uniformTransitions: UniformTransitionManager;
    /** Populated during uniform transition to replace user-supplied values */
    propsInTransition?: LayerT['props'];
    constructor({ attributeManager, layer }: {
        attributeManager: AttributeManager | null;
        layer: LayerT;
    });
    get layer(): LayerT | null;
    protected _fetch(propName: any, url: string): any;
    protected _onResolve(propName: string, value: any): void;
    protected _onError(propName: string, error: Error): void;
}
//# sourceMappingURL=layer-state.d.ts.map