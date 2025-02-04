// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { CompositeLayer } from '@deck.gl/core';
import { replaceInRange } from "../utils.js";
import { binaryToFeatureForAccesor } from "./geojson-binary.js";
import { POINT_LAYER, LINE_LAYER, POLYGON_LAYER, getDefaultProps, forwardProps } from "./sub-layer-map.js";
import { getGeojsonFeatures, separateGeojsonFeatures } from "./geojson.js";
import { createLayerPropsFromFeatures, createLayerPropsFromBinary } from "./geojson-layer-props.js";
const FEATURE_TYPES = ['points', 'linestrings', 'polygons'];
const defaultProps = {
    ...getDefaultProps(POINT_LAYER.circle),
    ...getDefaultProps(POINT_LAYER.icon),
    ...getDefaultProps(POINT_LAYER.text),
    ...getDefaultProps(LINE_LAYER),
    ...getDefaultProps(POLYGON_LAYER),
    // Overwrite sub layer defaults
    stroked: true,
    filled: true,
    extruded: false,
    wireframe: false,
    _full3d: false,
    iconAtlas: { type: 'object', value: null },
    iconMapping: { type: 'object', value: {} },
    getIcon: { type: 'accessor', value: f => f.properties.icon },
    getText: { type: 'accessor', value: f => f.properties.text },
    // Self props
    pointType: 'circle',
    // TODO: deprecated, remove in v9
    getRadius: { deprecatedFor: 'getPointRadius' }
};
/** Render GeoJSON formatted data as polygons, lines and points (circles, icons and/or texts). */
class GeoJsonLayer extends CompositeLayer {
    initializeState() {
        this.state = {
            layerProps: {},
            features: {},
            featuresDiff: {}
        };
    }
    updateState({ props, changeFlags }) {
        if (!changeFlags.dataChanged) {
            return;
        }
        const { data } = this.props;
        const binary = data && 'points' in data && 'polygons' in data && 'lines' in data;
        this.setState({ binary });
        if (binary) {
            this._updateStateBinary({ props, changeFlags });
        }
        else {
            this._updateStateJSON({ props, changeFlags });
        }
    }
    _updateStateBinary({ props, changeFlags }) {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        const layerProps = createLayerPropsFromBinary(props.data, this.encodePickingColor);
        this.setState({ layerProps });
    }
    _updateStateJSON({ props, changeFlags }) {
        const features = getGeojsonFeatures(props.data);
        const wrapFeature = this.getSubLayerRow.bind(this);
        let newFeatures = {};
        const featuresDiff = {};
        if (Array.isArray(changeFlags.dataChanged)) {
            const oldFeatures = this.state.features;
            for (const key in oldFeatures) {
                newFeatures[key] = oldFeatures[key].slice();
                featuresDiff[key] = [];
            }
            for (const dataRange of changeFlags.dataChanged) {
                const partialFeatures = separateGeojsonFeatures(features, wrapFeature, dataRange);
                for (const key in oldFeatures) {
                    featuresDiff[key].push(replaceInRange({
                        data: newFeatures[key],
                        getIndex: f => f.__source.index,
                        dataRange,
                        replace: partialFeatures[key]
                    }));
                }
            }
        }
        else {
            newFeatures = separateGeojsonFeatures(features, wrapFeature);
        }
        const layerProps = createLayerPropsFromFeatures(newFeatures, featuresDiff);
        this.setState({
            features: newFeatures,
            featuresDiff,
            layerProps
        });
    }
    getPickingInfo(params) {
        const info = super.getPickingInfo(params);
        const { index, sourceLayer } = info;
        info.featureType = FEATURE_TYPES.find(ft => sourceLayer.id.startsWith(`${this.id}-${ft}-`));
        if (index >= 0 && sourceLayer.id.startsWith(`${this.id}-points-text`) && this.state.binary) {
            info.index = this.props.data.points.globalFeatureIds.value[index];
        }
        return info;
    }
    _updateAutoHighlight(info) {
        // All sub layers except the points layer use source feature index to encode the picking color
        // The points layer uses indices from the points data array.
        const pointLayerIdPrefix = `${this.id}-points-`;
        const sourceIsPoints = info.featureType === 'points';
        for (const layer of this.getSubLayers()) {
            if (layer.id.startsWith(pointLayerIdPrefix) === sourceIsPoints) {
                layer.updateAutoHighlight(info);
            }
        }
    }
    _renderPolygonLayer() {
        const { extruded, wireframe } = this.props;
        const { layerProps } = this.state;
        const id = 'polygons-fill';
        const PolygonFillLayer = this.shouldRenderSubLayer(id, layerProps.polygons?.data) &&
            this.getSubLayerClass(id, POLYGON_LAYER.type);
        if (PolygonFillLayer) {
            const forwardedProps = forwardProps(this, POLYGON_LAYER.props);
            // Avoid building the lineColors attribute if wireframe is off
            const useLineColor = extruded && wireframe;
            if (!useLineColor) {
                delete forwardedProps.getLineColor;
            }
            // using a legacy API to invalid lineColor attributes
            forwardedProps.updateTriggers.lineColors = useLineColor;
            return new PolygonFillLayer(forwardedProps, this.getSubLayerProps({
                id,
                updateTriggers: forwardedProps.updateTriggers
            }), layerProps.polygons);
        }
        return null;
    }
    _renderLineLayers() {
        const { extruded, stroked } = this.props;
        const { layerProps } = this.state;
        const polygonStrokeLayerId = 'polygons-stroke';
        const lineStringsLayerId = 'linestrings';
        const PolygonStrokeLayer = !extruded &&
            stroked &&
            this.shouldRenderSubLayer(polygonStrokeLayerId, layerProps.polygonsOutline?.data) &&
            this.getSubLayerClass(polygonStrokeLayerId, LINE_LAYER.type);
        const LineStringsLayer = this.shouldRenderSubLayer(lineStringsLayerId, layerProps.lines?.data) &&
            this.getSubLayerClass(lineStringsLayerId, LINE_LAYER.type);
        if (PolygonStrokeLayer || LineStringsLayer) {
            const forwardedProps = forwardProps(this, LINE_LAYER.props);
            return [
                PolygonStrokeLayer &&
                    new PolygonStrokeLayer(forwardedProps, this.getSubLayerProps({
                        id: polygonStrokeLayerId,
                        updateTriggers: forwardedProps.updateTriggers
                    }), layerProps.polygonsOutline),
                LineStringsLayer &&
                    new LineStringsLayer(forwardedProps, this.getSubLayerProps({
                        id: lineStringsLayerId,
                        updateTriggers: forwardedProps.updateTriggers
                    }), layerProps.lines)
            ];
        }
        return null;
    }
    _renderPointLayers() {
        const { pointType } = this.props;
        const { layerProps, binary } = this.state;
        let { highlightedObjectIndex } = this.props;
        if (!binary && Number.isFinite(highlightedObjectIndex)) {
            // @ts-expect-error TODO - type non-binary data
            highlightedObjectIndex = layerProps.points.data.findIndex(d => d.__source.index === highlightedObjectIndex);
        }
        // Avoid duplicate sub layer ids
        const types = new Set(pointType.split('+'));
        const pointLayers = [];
        for (const type of types) {
            const id = `points-${type}`;
            const PointLayerMapping = POINT_LAYER[type];
            const PointsLayer = PointLayerMapping &&
                this.shouldRenderSubLayer(id, layerProps.points?.data) &&
                this.getSubLayerClass(id, PointLayerMapping.type);
            if (PointsLayer) {
                const forwardedProps = forwardProps(this, PointLayerMapping.props);
                let pointsLayerProps = layerProps.points;
                if (type === 'text' && binary) {
                    // Picking colors are per-point but for text per-character are required
                    // getPickingInfo() maps back to the correct index
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    // @ts-expect-error TODO - type binary data
                    const { instancePickingColors, ...rest } = pointsLayerProps.data.attributes;
                    pointsLayerProps = {
                        ...pointsLayerProps,
                        // @ts-expect-error TODO - type binary data
                        data: { ...pointsLayerProps.data, attributes: rest }
                    };
                }
                pointLayers.push(new PointsLayer(forwardedProps, this.getSubLayerProps({
                    id,
                    updateTriggers: forwardedProps.updateTriggers,
                    highlightedObjectIndex
                }), pointsLayerProps));
            }
        }
        return pointLayers;
    }
    renderLayers() {
        const { extruded } = this.props;
        const polygonFillLayer = this._renderPolygonLayer();
        const lineLayers = this._renderLineLayers();
        const pointLayers = this._renderPointLayers();
        return [
            // If not extruded: flat fill layer is drawn below outlines
            !extruded && polygonFillLayer,
            lineLayers,
            pointLayers,
            // If extruded: draw fill layer last for correct blending behavior
            extruded && polygonFillLayer
        ];
    }
    getSubLayerAccessor(accessor) {
        const { binary } = this.state;
        if (!binary || typeof accessor !== 'function') {
            return super.getSubLayerAccessor(accessor);
        }
        return (object, info) => {
            const { data, index } = info;
            const feature = binaryToFeatureForAccesor(data, index);
            // @ts-ignore (TS2349) accessor is always function
            return accessor(feature, info);
        };
    }
}
GeoJsonLayer.layerName = 'GeoJsonLayer';
GeoJsonLayer.defaultProps = defaultProps;
export default GeoJsonLayer;
//# sourceMappingURL=geojson-layer.js.map