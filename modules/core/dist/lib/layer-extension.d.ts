import type Layer from "./layer.js";
import type CompositeLayer from "./composite-layer.js";
import type { UpdateParameters } from "./layer.js";
import type { LayerContext } from "./layer-manager.js";
export default abstract class LayerExtension<OptionsT = unknown> {
    static defaultProps: {};
    static extensionName: string;
    static get componentName(): string;
    opts: OptionsT;
    constructor(opts?: OptionsT);
    /** Returns true if two extensions are equivalent */
    equals(extension: LayerExtension<OptionsT>): boolean;
    /** Only called if attached to a primitive layer */
    getShaders(this: Layer, extension: this): any;
    /** Only called if attached to a CompositeLayer */
    getSubLayerProps(this: CompositeLayer, extension: this): any;
    initializeState(this: Layer, context: LayerContext, extension: this): void;
    updateState(this: Layer, params: UpdateParameters<Layer>, extension: this): void;
    onNeedsRedraw(this: Layer, extension: this): void;
    getNeedsPickingBuffer(this: Layer, extension: this): boolean;
    draw(this: Layer, params: any, extension: this): void;
    finalizeState(this: Layer, context: LayerContext, extension: this): void;
}
//# sourceMappingURL=layer-extension.d.ts.map