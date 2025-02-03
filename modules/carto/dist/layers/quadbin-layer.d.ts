import { AccessorFunction, DefaultProps } from '@deck.gl/core';
import { _GeoCellLayer as GeoCellLayer, _GeoCellLayerProps as GeoCellLayerProps } from '@deck.gl/geo-layers';
/** All properties supported by QuadbinLayer. */
export type QuadbinLayerProps<DataT = unknown> = _QuadbinLayerProps<DataT> & GeoCellLayerProps<DataT>;
/** Properties added by QuadbinLayer. */
type _QuadbinLayerProps<DataT> = {
    /**
     * Called for each data object to retrieve the quadbin string identifier.
     *
     * By default, it reads `quadbin` property of data object.
     */
    getQuadbin?: AccessorFunction<DataT, bigint>;
};
export default class QuadbinLayer<DataT = any, ExtraProps extends {} = {}> extends GeoCellLayer<DataT, Required<_QuadbinLayerProps<DataT>> & ExtraProps> {
    static layerName: string;
    static defaultProps: DefaultProps<QuadbinLayerProps<unknown>>;
    indexToBounds(): Partial<GeoCellLayer['props']> | null;
}
export {};
//# sourceMappingURL=quadbin-layer.d.ts.map