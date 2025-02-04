// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { CompositeLayer, AttributeManager, _compareProps as compareProps } from '@deck.gl/core';
import { filterProps } from "../common/utils/prop-utils.js";
/** Legacy AggregationLayer, to be removed in v9.1 */
class AggregationLayer extends CompositeLayer {
    initializeAggregationLayer(dimensions) {
        super.initializeState(this.context);
        this.setState({
            // Layer props , when changed doesn't require updating aggregation
            ignoreProps: filterProps(this.constructor._propTypes, dimensions.data.props),
            dimensions
        });
    }
    updateState(opts) {
        super.updateState(opts);
        const { changeFlags } = opts;
        if (changeFlags.extensionsChanged) {
            const shaders = this.getShaders({});
            if (shaders && shaders.defines) {
                shaders.defines.NON_INSTANCED_MODEL = 1;
            }
            this.updateShaders(shaders);
        }
        // Explictly call to update attributes as 'CompositeLayer' doesn't call this
        this._updateAttributes();
    }
    updateAttributes(changedAttributes) {
        // Super classes, can refer to state.changedAttributes to determine what
        // attributes changed
        this.setState({ changedAttributes });
    }
    getAttributes() {
        return this.getAttributeManager().getAttributes();
    }
    getModuleSettings() {
        // For regular layer draw this happens during draw cycle (_drawLayersInViewport) not during update cycle
        // For aggregation layers this is called during updateState to update aggregation data
        // NOTE: it is similar to LayerPass._getShaderModuleProps() but doesn't inlcude `effects` it is not needed for aggregation
        const { viewport, mousePosition, device } = this.context;
        const moduleSettings = Object.assign(Object.create(this.props), {
            viewport,
            mousePosition,
            picking: {
                isActive: 0
            },
            // @ts-expect-error TODO - assuming WebGL context
            devicePixelRatio: device.canvasContext.cssToDeviceRatio()
        });
        return moduleSettings;
    }
    updateShaders(shaders) {
        // Default implemention is empty, subclasses can update their Model objects if needed
    }
    /**
     * Checks if aggregation is dirty
     * @param {Object} updateOpts - object {props, oldProps, changeFlags}
     * @param {Object} params - object {dimension, compareAll}
     * @param {Object} params.dimension - {props, accessors} array of props and/or accessors
     * @param {Boolean} params.compareAll - when `true` it will include non layer props for comparision
     * @returns {Boolean} - returns true if dimensions' prop or accessor is changed
     **/
    isAggregationDirty(updateOpts, params = {}) {
        const { props, oldProps, changeFlags } = updateOpts;
        const { compareAll = false, dimension } = params;
        const { ignoreProps } = this.state;
        const { props: dataProps, accessors = [] } = dimension;
        const { updateTriggersChanged } = changeFlags;
        if (changeFlags.dataChanged) {
            return true;
        }
        if (updateTriggersChanged) {
            if (updateTriggersChanged.all) {
                return true;
            }
            for (const accessor of accessors) {
                if (updateTriggersChanged[accessor]) {
                    return true;
                }
            }
        }
        if (compareAll) {
            if (changeFlags.extensionsChanged) {
                return true;
            }
            // Compare non layer props too (like extension props)
            // ignoreprops refers to all Layer props other than aggregation props that need to be comapred
            return compareProps({
                oldProps,
                newProps: props,
                ignoreProps,
                propTypes: this.constructor._propTypes
            });
        }
        // Compare props of the dimension
        for (const name of dataProps) {
            if (props[name] !== oldProps[name]) {
                return true;
            }
        }
        return false;
    }
    /**
     * Checks if an attribute is changed
     * @param {String} name - name of the attribute
     * @returns {Boolean} - `true` if attribute `name` is changed, `false` otherwise,
     *                       If `name` is not passed or `undefiend`, `true` if any attribute is changed, `false` otherwise
     **/
    isAttributeChanged(name) {
        const { changedAttributes } = this.state;
        if (!name) {
            // if name not specified return true if any attribute is changed
            return !isObjectEmpty(changedAttributes);
        }
        return changedAttributes && changedAttributes[name] !== undefined;
    }
    // Private
    // override Composite layer private method to create AttributeManager instance
    _getAttributeManager() {
        return new AttributeManager(this.context.device, {
            id: this.props.id,
            stats: this.context.stats
        });
    }
}
AggregationLayer.layerName = 'AggregationLayer';
export default AggregationLayer;
// Helper methods
// Returns true if given object is empty, false otherwise.
function isObjectEmpty(obj) {
    let isEmpty = true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const key in obj) {
        isEmpty = false;
        break;
    }
    return isEmpty;
}
//# sourceMappingURL=aggregation-layer.js.map