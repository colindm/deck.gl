import { H3Index } from 'h3-js';
import { AccessorFunction, CompositeLayer, Layer, LayersList, UpdateParameters, DefaultProps } from '@deck.gl/core';
import { PolygonLayerProps } from '@deck.gl/layers';
/** All properties supported by H3HexagonLayer */
export type H3HexagonLayerProps<DataT = unknown> = _H3HexagonLayerProps<DataT> & PolygonLayerProps<DataT>;
/** Props added by the H3HexagonLayer */
type _H3HexagonLayerProps<DataT> = {
    /**
     * Whether or not draw hexagons with high precision.
     * @default 'auto'
     */
    highPrecision?: boolean | 'auto';
    /**
     * Coverage of hexagon in cell.
     * @default 1
     */
    coverage?: number;
    /**
     * Center hexagon that best represents the shape of the set. If not specified, the hexagon closest to the center of the viewport is used.
     */
    centerHexagon?: H3Index | null;
    /**
     * Called for each data object to retrieve the quadkey string identifier.
     *
     * By default, it reads `hexagon` property of data object.
     */
    getHexagon?: AccessorFunction<DataT, string>;
    /**
     * Whether to extrude polygons.
     * @default true
     */
    extruded?: boolean;
};
/**
 * Render hexagons from the [H3](https://h3geo.org/) geospatial indexing system.
 */
export default class H3HexagonLayer<DataT = any, ExtraPropsT extends {} = {}> extends CompositeLayer<ExtraPropsT & Required<H3HexagonLayerProps<DataT>>> {
    static defaultProps: DefaultProps<H3HexagonLayerProps<unknown>>;
    static layerName: string;
    static _checkH3Lib: () => void;
    initializeState(): void;
    state: {
        centerHex?: H3Index;
        edgeLengthKM: number;
        hasMultipleRes?: boolean;
        hasPentagon?: boolean;
        resolution: number;
        vertices?: number[][];
    };
    shouldUpdateState({ changeFlags }: UpdateParameters<this>): boolean;
    updateState({ props, changeFlags }: UpdateParameters<this>): void;
    private _calculateH3DataProps;
    private _shouldUseHighPrecision;
    private _updateVertices;
    renderLayers(): Layer | null | LayersList;
    private _getForwardProps;
    private _renderPolygonLayer;
    private _renderColumnLayer;
}
export {};
//# sourceMappingURL=h3-hexagon-layer.d.ts.map