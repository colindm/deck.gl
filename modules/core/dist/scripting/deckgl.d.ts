import Deck, { DeckProps } from "../lib/deck.js";
type DeckGLProps = DeckProps & {
    /** DOM element to add deck.gl canvas to */
    container?: Element;
    /** base map library, mapboxgl or maplibregl */
    map?: any;
    /** URL to base map style JSON, see Mapbox/Maplibre documentation */
    mapStyle?: string;
    /** Access token if using Mapbox */
    mapboxApiAccessToken?: string;
    /** Directly passed to Map class constructor */
    mapOptions?: any;
};
/**
 * This is the scripting interface with additional logic to sync Deck with a mapbox-compatible base map
 * This class is intentionally NOT exported by package root (index.ts) to keep the core module
 * base map provider neutral.
 * Only exposed via the pre-built deck.gl bundle
 */
export default class DeckGL extends Deck {
    /** Base map instance */
    private _map;
    constructor(props: DeckGLProps);
    getMapboxMap(): any;
    finalize(): void;
    setProps(props: any): void;
    _drawLayers(redrawReason: string, options: any): void;
}
export {};
//# sourceMappingURL=deckgl.d.ts.map