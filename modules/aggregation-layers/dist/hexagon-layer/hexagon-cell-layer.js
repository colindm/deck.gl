// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { ColumnLayer } from '@deck.gl/layers';
import { createColorRangeTexture, updateColorRangeTexture } from "../common/utils/color-utils.js";
import vs from "./hexagon-cell-layer-vertex.glsl.js";
import { hexagonUniforms } from "./hexagon-layer-uniforms.js";
class HexagonCellLayer extends ColumnLayer {
    getShaders() {
        const shaders = super.getShaders();
        shaders.modules.push(hexagonUniforms);
        return { ...shaders, vs };
    }
    initializeState() {
        super.initializeState();
        const attributeManager = this.getAttributeManager();
        attributeManager.remove([
            'instanceElevations',
            'instanceFillColors',
            'instanceLineColors',
            'instanceStrokeWidths'
        ]);
        attributeManager.addInstanced({
            instancePositions: {
                size: 2,
                type: 'float32',
                accessor: 'getBin'
            },
            instanceColorValues: {
                size: 1,
                type: 'float32',
                accessor: 'getColorValue'
            },
            instanceElevationValues: {
                size: 1,
                type: 'float32',
                accessor: 'getElevationValue'
            }
        });
    }
    updateState(params) {
        super.updateState(params);
        const { props, oldProps } = params;
        const model = this.state.fillModel;
        if (oldProps.colorRange !== props.colorRange) {
            this.state.colorTexture?.destroy();
            this.state.colorTexture = createColorRangeTexture(this.context.device, props.colorRange, props.colorScaleType);
            const hexagonProps = { colorRange: this.state.colorTexture };
            model.shaderInputs.setProps({ hexagon: hexagonProps });
        }
        else if (oldProps.colorScaleType !== props.colorScaleType) {
            updateColorRangeTexture(this.state.colorTexture, props.colorScaleType);
        }
    }
    finalizeState(context) {
        super.finalizeState(context);
        this.state.colorTexture?.destroy();
    }
    draw({ uniforms }) {
        const { radius, hexOriginCommon, elevationRange, elevationScale, extruded, coverage, colorDomain, elevationDomain } = this.props;
        const colorCutoff = this.props.colorCutoff || [-Infinity, Infinity];
        const elevationCutoff = this.props.elevationCutoff || [-Infinity, Infinity];
        const fillModel = this.state.fillModel;
        if (fillModel.vertexArray.indexBuffer) {
            // indices are for drawing wireframe, disable them
            // TODO - this should be handled in ColumnLayer?
            fillModel.setIndexBuffer(null);
        }
        fillModel.setVertexCount(this.state.fillVertexCount);
        const hexagonProps = {
            colorDomain: [
                Math.max(colorDomain[0], colorCutoff[0]), // instanceColorValue that maps to colorRange[0]
                Math.min(colorDomain[1], colorCutoff[1]), // instanceColorValue that maps to colorRange[colorRange.length - 1]
                Math.max(colorDomain[0] - 1, colorCutoff[0]), // hide cell if instanceColorValue is less than this
                Math.min(colorDomain[1] + 1, colorCutoff[1]) // hide cell if instanceColorValue is greater than this
            ],
            elevationDomain: [
                Math.max(elevationDomain[0], elevationCutoff[0]), // instanceElevationValue that maps to elevationRange[0]
                Math.min(elevationDomain[1], elevationCutoff[1]), // instanceElevationValue that maps to elevationRange[elevationRange.length - 1]
                Math.max(elevationDomain[0] - 1, elevationCutoff[0]), // hide cell if instanceElevationValue is less than this
                Math.min(elevationDomain[1] + 1, elevationCutoff[1]) // hide cell if instanceElevationValue is greater than this
            ],
            elevationRange: [elevationRange[0] * elevationScale, elevationRange[1] * elevationScale],
            originCommon: hexOriginCommon
        };
        fillModel.shaderInputs.setProps({
            column: { extruded, coverage, radius },
            hexagon: hexagonProps
        });
        fillModel.draw(this.context.renderPass);
    }
}
HexagonCellLayer.layerName = 'HexagonCellLayer';
export default HexagonCellLayer;
//# sourceMappingURL=hexagon-cell-layer.js.map