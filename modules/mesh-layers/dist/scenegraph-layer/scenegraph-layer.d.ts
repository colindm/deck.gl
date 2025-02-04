import { Layer } from '@deck.gl/core';
import type { Device } from '@luma.gl/core';
import { GroupNode, Model } from '@luma.gl/engine';
import { GLTFAnimator, PBREnvironment } from '@luma.gl/gltf';
import { UpdateParameters, LayerContext, LayerProps, LayerDataSource, Position, Color, Accessor, DefaultProps } from '@deck.gl/core';
export type ScenegraphLayerProps<DataT = unknown> = _ScenegraphLayerProps<DataT> & LayerProps;
type _ScenegraphLayerProps<DataT> = {
    data: LayerDataSource<DataT>;
    /**
     * A url for a glTF model or scenegraph loaded via a [scenegraph loader](https://loaders.gl/docs/specifications/category-scenegraph)
     */
    scenegraph: any;
    /**
     * Create a luma.gl GroupNode from the resolved scenegraph prop
     */
    getScene?: (scenegraph: any, context: {
        device?: Device;
        layer: ScenegraphLayer<DataT>;
    }) => GroupNode;
    /**
     * Create a luma.gl GLTFAnimator from the resolved scenegraph prop
     */
    getAnimator?: (scenegraph: any, context: {
        device?: Device;
        layer: ScenegraphLayer<DataT>;
    }) => GLTFAnimator;
    /**
     * (Experimental) animation configurations. Requires `_animate` on deck object.
     */
    _animations?: {
        [name: number | string | '*']: {
            /** If the animation is playing */
            playing?: boolean;
            /** Start time of the animation, default `0` */
            startTime?: number;
            /** Speed multiplier of the animation, default `1` */
            speed?: number;
        };
    } | null;
    /**
     * (Experimental) lighting mode
     * @default 'flat'
     */
    _lighting?: 'flat' | 'pbr';
    /**
     * (Experimental) lighting environment. Requires `_lighting` to be `'pbr'`.
     */
    _imageBasedLightingEnvironment?: PBREnvironment | ((context: {
        gl: WebGL2RenderingContext;
        layer: ScenegraphLayer<DataT>;
    }) => PBREnvironment);
    /** Anchor position accessor. */
    getPosition?: Accessor<DataT, Position>;
    /** Color value or accessor.
     * @default [255, 255, 255, 255]
     */
    getColor?: Accessor<DataT, Color>;
    /**
     * Orientation in [pitch, yaw, roll] in degrees.
     * @see https://en.wikipedia.org/wiki/Euler_angles
     * @default [0, 0, 0]
     */
    getOrientation?: Accessor<DataT, [number, number, number]>;
    /**
     * Scaling factor of the model along each axis.
     * @default [1, 1, 1]
     */
    getScale?: Accessor<DataT, [number, number, number]>;
    /**
     * Translation from the anchor point, [x, y, z] in meters.
     * @default [0, 0, 0]
     */
    getTranslation?: Accessor<DataT, [number, number, number]>;
    /**
     * TransformMatrix. If specified, `getOrientation`, `getScale` and `getTranslation` are ignored.
     */
    getTransformMatrix?: Accessor<DataT, number[]>;
    /**
     * Multiplier to scale each geometry by.
     * @default 1
     */
    sizeScale?: number;
    /**
     * The minimum size in pixels for one unit of the scene.
     * @default 0
     */
    sizeMinPixels?: number;
    /**
     * The maximum size in pixels for one unit of the scene.
     * @default Number.MAX_SAFE_INTEGER
     */
    sizeMaxPixels?: number;
};
/** Render a number of instances of a complete glTF scenegraph. */
export default class ScenegraphLayer<DataT = any, ExtraPropsT extends {} = {}> extends Layer<ExtraPropsT & Required<_ScenegraphLayerProps<DataT>>> {
    static defaultProps: DefaultProps<ScenegraphLayerProps<unknown>>;
    static layerName: string;
    state: {
        scenegraph: GroupNode;
        animator: GLTFAnimator;
        models: Model[];
    };
    getShaders(): any;
    initializeState(): void;
    updateState(params: UpdateParameters<this>): void;
    finalizeState(context: LayerContext): void;
    get isLoaded(): boolean;
    private _updateScenegraph;
    private _applyAnimationsProp;
    private _getModelOptions;
    draw({ context }: {
        context: any;
    }): void;
}
export {};
//# sourceMappingURL=scenegraph-layer.d.ts.map