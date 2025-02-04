import { Layer, CompositeLayer, CompositeLayerProps, UpdateParameters, DefaultProps, Viewport } from '@deck.gl/core';
import type { ImageSourceMetadata, ImageType } from '@loaders.gl/loader-utils';
import type { ImageServiceType } from '@loaders.gl/wms';
import { ImageSource } from '@loaders.gl/wms';
/** All props supported by the TileLayer */
export type WMSLayerProps = CompositeLayerProps & _WMSLayerProps;
/** Props added by the TileLayer */
type _WMSLayerProps = {
    data: string | ImageSource;
    serviceType?: ImageServiceType | 'auto';
    layers?: string[];
    srs?: 'EPSG:4326' | 'EPSG:3857' | 'auto';
    onMetadataLoad?: (metadata: ImageSourceMetadata) => void;
    onMetadataLoadError?: (error: Error) => void;
    onImageLoadStart?: (requestId: unknown) => void;
    onImageLoad?: (requestId: unknown) => void;
    onImageLoadError?: (requestId: unknown, error: Error) => void;
};
/**
 * The layer is used in Hex Tile layer in order to properly discard invisible elements during animation
 */
export declare class WMSLayer<ExtraPropsT extends {} = {}> extends CompositeLayer<ExtraPropsT & Required<_WMSLayerProps>> {
    static layerName: string;
    static defaultProps: DefaultProps;
    state: {
        imageSource: ImageSource;
        image: ImageType;
        bounds: [number, number, number, number];
        lastRequestParameters: {
            bbox: [number, number, number, number];
            layers: string[];
            srs: 'EPSG:4326' | 'EPSG:3857';
            width: number;
            height: number;
        };
        lastRequestId: number;
        _nextRequestId: number;
        /** TODO: Change any => setTimeout return type. Different between Node and browser... */
        _timeoutId: any;
        loadCounter: number;
    };
    /** Returns true if all async resources are loaded */
    get isLoaded(): boolean;
    /** Lets deck.gl know that we want viewport change events */
    shouldUpdateState(): boolean;
    initializeState(): void;
    updateState({ changeFlags, props, oldProps }: UpdateParameters<this>): void;
    finalizeState(): void;
    renderLayers(): Layer;
    getFeatureInfoText(x: number, y: number): Promise<string | null>;
    _createImageSource(props: WMSLayerProps): ImageSource;
    /** Run a getMetadata on the image service */
    _loadMetadata(): Promise<void>;
    /** Load an image */
    loadImage(viewport: Viewport, reason: string): Promise<void>;
    /** Global counter for issuing unique request ids */
    private getRequestId;
    /** Runs an action in the future, cancels it if the new action is issued before it executes */
    private debounce;
}
export {};
//# sourceMappingURL=wms-layer.d.ts.map