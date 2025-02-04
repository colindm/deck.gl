import { AccessorFunction, DefaultProps } from '@deck.gl/core';
import GeoCellLayer, { GeoCellLayerProps } from "../geo-cell-layer/GeoCellLayer.js";
/** All properties supported by S2Layer. */
export type S2LayerProps<DataT = unknown> = _S2LayerProps<DataT> & GeoCellLayerProps<DataT>;
/** Properties added by S2Layer. */
type _S2LayerProps<DataT> = {
    /**
     * Called for each data object to retrieve the quadkey string identifier.
     *
     * By default, it reads `token` property of data object.
     */
    getS2Token?: AccessorFunction<DataT, string>;
};
/** Render filled and/or stroked polygons based on the [S2](http://s2geometry.io/) geospatial indexing system. */
export default class S2Layer<DataT = any, ExtraProps extends {} = {}> extends GeoCellLayer<DataT, Required<_S2LayerProps<DataT>> & ExtraProps> {
    static layerName: string;
    static defaultProps: DefaultProps<S2LayerProps<unknown>>;
    indexToBounds(): Partial<GeoCellLayer['props']> | null;
}
export {};
//# sourceMappingURL=s2-layer.d.ts.map