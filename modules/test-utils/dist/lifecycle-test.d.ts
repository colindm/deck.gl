import { makeSpy } from '@probe.gl/test-utils';
import type { Layer, Viewport } from '@deck.gl/core';
import type { Timeline } from '@luma.gl/engine';
type InitializeLayerTestOptions = {
    /** The layer instance to test */
    layer: Layer;
    /** The initial viewport
     * @default WebMercatorViewport
     */
    viewport?: Viewport;
    /** Callback if any error is thrown */
    onError?: (error: unknown, title: string) => void;
};
/** Test that initializing a layer does not throw.
 * Use `testInitializeLayerAsync` if the layer's initialization flow contains async operations.
 */
export declare function testInitializeLayer(opts: InitializeLayerTestOptions & {
    /** Automatically finalize the layer and release all resources after the test */
    finalize?: true;
}): null;
export declare function testInitializeLayer(opts: InitializeLayerTestOptions & {
    /** Automatically finalize the layer and release all resources after the test */
    finalize: false;
}): {
    /** Finalize the layer and release all resources */
    finalize: () => void;
};
/** Test that initializing a layer does not throw.
 * Resolves when the layer's isLoaded flag becomes true.
 */
export declare function testInitializeLayerAsync(opts: InitializeLayerTestOptions & {
    /** Automatically finalize the layer and release all resources after the test */
    finalize?: true;
}): Promise<null>;
export declare function testInitializeLayerAsync(opts: InitializeLayerTestOptions & {
    /** Automatically finalize the layer and release all resources after the test */
    finalize: false;
}): Promise<{
    /** Finalize the layer and release all resources */
    finalize: () => void;
}>;
type Spy = ReturnType<typeof makeSpy>;
export type LayerClass<LayerT extends Layer> = {
    new (...args: any[]): LayerT;
    layerName: string;
    defaultProps: any;
};
export type LayerTestCase<LayerT extends Layer> = {
    title: string;
    viewport?: Viewport;
    /** Reset the props of the test layer instance */
    props?: Partial<LayerT['props']>;
    /** Update the given props of the test layer instance */
    updateProps?: Partial<LayerT['props']>;
    /** List of layer method names to watch */
    spies?: string[];
    /** Called before layer updates */
    onBeforeUpdate?: (params: {
        layer: Layer;
        testCase: LayerTestCase<LayerT>;
    }) => void;
    /** Called after layer is updated */
    onAfterUpdate?: (params: {
        testCase: LayerTestCase<LayerT>;
        layer: LayerT;
        oldState: any;
        subLayers: Layer[];
        subLayer: Layer | null;
        spies: Record<string, Spy>;
    }) => void;
};
/**
 * Initialize and updates a layer over a sequence of scenarios (test cases).
 * Use `testLayerAsync` if the layer's update flow contains async operations.
 */
export declare function testLayer<LayerT extends Layer>(opts: {
    /** The layer class to test against */
    Layer: LayerClass<LayerT>;
    /** The initial viewport
     * @default WebMercatorViewport
     */
    viewport?: Viewport;
    /**
     * If provided, used to controls time progression. Useful for testing transitions and animations.
     */
    timeline?: Timeline;
    testCases?: LayerTestCase<LayerT>[];
    /**
     * List of layer method names to watch
     */
    spies?: string[];
    /** Callback if any error is thrown */
    onError?: (error: Error, title: string) => void;
}): void;
/**
 * Initialize and updates a layer over a sequence of scenarios (test cases).
 * Each test case is awaited until the layer's isLoaded flag is true.
 */
export declare function testLayerAsync<LayerT extends Layer>(opts: {
    /** The layer class to test against */
    Layer: LayerClass<LayerT>;
    /** The initial viewport
     * @default WebMercatorViewport
     */
    viewport?: Viewport;
    /**
     * If provided, used to controls time progression. Useful for testing transitions and animations.
     */
    timeline?: Timeline;
    testCases?: LayerTestCase<LayerT>[];
    /**
     * List of layer method names to watch
     */
    spies?: string[];
    /** Callback if any error is thrown */
    onError?: (error: Error, title: string) => void;
}): Promise<void>;
export {};
//# sourceMappingURL=lifecycle-test.d.ts.map