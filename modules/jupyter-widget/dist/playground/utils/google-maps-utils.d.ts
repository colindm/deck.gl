export function createGoogleMapsDeckOverlay({ container, onClick, onComplete, getTooltip, googleMapsKey, layers, mapStyle, initialViewState }: {
    container: any;
    onClick: any;
    onComplete: any;
    getTooltip: any;
    googleMapsKey: any;
    layers: any;
    mapStyle?: string | undefined;
    initialViewState?: {
        latitude: number;
        longitude: number;
        zoom: number;
    } | undefined;
}): GoogleMapsOverlay | null;
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
//# sourceMappingURL=google-maps-utils.d.ts.map