import { Deck } from '@deck.gl/core';
import type { Map, IControl, ControlPosition } from "./types.js";
import type { DeckProps } from '@deck.gl/core';
export type MapboxOverlayProps = Omit<DeckProps, 'width' | 'height' | 'gl' | 'parent' | 'canvas' | '_customRender' | 'viewState' | 'initialViewState' | 'controller'> & {
    interleaved?: boolean;
};
/**
 * Implements Mapbox [IControl](https://docs.mapbox.com/mapbox-gl-js/api/markers/#icontrol) interface
 * Renders deck.gl layers over the base map and automatically synchronizes with the map's camera
 */
export default class MapboxOverlay implements IControl {
    private _props;
    private _deck?;
    private _map?;
    private _container?;
    private _interleaved;
    private _lastMouseDownPoint?;
    constructor(props: MapboxOverlayProps);
    /** Update (partial) props of the underlying Deck instance. */
    setProps(props: MapboxOverlayProps): void;
    /** Called when the control is added to a map */
    onAdd(map: Map): HTMLDivElement;
    private _onAddOverlaid;
    private _onAddInterleaved;
    /** Called when the control is removed from a map */
    onRemove(): void;
    private _onRemoveOverlaid;
    private _onRemoveInterleaved;
    getDefaultPosition(): ControlPosition;
    /** Forwards the Deck.pickObject method */
    pickObject(params: Parameters<Deck['pickObject']>[0]): ReturnType<Deck['pickObject']>;
    /** Forwards the Deck.pickMultipleObjects method */
    pickMultipleObjects(params: Parameters<Deck['pickMultipleObjects']>[0]): ReturnType<Deck['pickMultipleObjects']>;
    /** Forwards the Deck.pickObjects method */
    pickObjects(params: Parameters<Deck['pickObjects']>[0]): ReturnType<Deck['pickObjects']>;
    /** Remove from map and releases all resources */
    finalize(): void;
    /** If interleaved: true, returns base map's canvas, otherwise forwards the Deck.getCanvas method. */
    getCanvas(): HTMLCanvasElement | null;
    private _handleStyleChange;
    private _updateContainerSize;
    private _updateViewState;
    private _handleMouseEvent;
}
//# sourceMappingURL=mapbox-overlay.d.ts.map