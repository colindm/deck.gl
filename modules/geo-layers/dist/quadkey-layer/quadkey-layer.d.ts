import { AccessorFunction, DefaultProps } from '@deck.gl/core';
import GeoCellLayer, { GeoCellLayerProps } from "../geo-cell-layer/GeoCellLayer.js";
/** All properties supported by QuadkeyLayer. */
export type QuadkeyLayerProps<DataT = unknown> = _QuadkeyLayerProps<DataT> & GeoCellLayerProps<DataT>;
/** Properties added by QuadkeyLayer. */
type _QuadkeyLayerProps<DataT> = {
    /**
     * Called for each data object to retrieve the quadkey string identifier.
     *
     * By default, it reads `quadkey` property of data object.
     */
    getQuadkey?: AccessorFunction<DataT, string>;
};
/** Render filled and/or stroked polygons based on the [Quadkey](https://towardsdatascience.com/geospatial-indexing-with-quadkeys-d933dff01496) geospatial indexing system. */
export default class QuadkeyLayer<DataT = any, ExtraProps extends {} = {}> extends GeoCellLayer<DataT, Required<_QuadkeyLayerProps<DataT>> & ExtraProps> {
    static layerName: string;
    static defaultProps: DefaultProps<QuadkeyLayerProps<unknown>>;
    indexToBounds(): Partial<GeoCellLayer['props']> | null;
}
export {};
//# sourceMappingURL=quadkey-layer.d.ts.map