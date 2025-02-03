// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import LayersPass from "./layers-pass.js";
export default class ShadowPass extends LayersPass {
    constructor(device, props) {
        super(device, props);
        // The shadowMap texture
        const shadowMap = device.createTexture({
            format: 'rgba8unorm',
            width: 1,
            height: 1,
            sampler: {
                minFilter: 'linear',
                magFilter: 'linear',
                addressModeU: 'clamp-to-edge',
                addressModeV: 'clamp-to-edge'
            },
            mipmaps: true
        });
        const depthBuffer = device.createTexture({
            format: 'depth16unorm',
            width: 1,
            height: 1,
            mipmaps: false
        });
        this.fbo = device.createFramebuffer({
            id: 'shadowmap',
            width: 1,
            height: 1,
            colorAttachments: [shadowMap],
            // Depth attachment has to be specified for depth test to work
            depthStencilAttachment: depthBuffer
        });
    }
    delete() {
        if (this.fbo) {
            this.fbo.destroy();
            this.fbo = null;
        }
    }
    getShadowMap() {
        return this.fbo.colorAttachments[0].texture;
    }
    render(params) {
        const target = this.fbo;
        // @ts-expect-error TODO - assuming WebGL context
        const pixelRatio = this.device.canvasContext.cssToDeviceRatio();
        const viewport = params.viewports[0];
        const width = viewport.width * pixelRatio;
        const height = viewport.height * pixelRatio;
        const clearColor = [1, 1, 1, 1];
        if (width !== target.width || height !== target.height) {
            target.resize({ width, height });
        }
        super.render({ ...params, clearColor, target, pass: 'shadow' });
    }
    getLayerParameters(layer, layerIndex, viewport) {
        return {
            ...layer.props.parameters,
            blend: false,
            depthWriteEnabled: true,
            depthCompare: 'less-equal'
        };
    }
    shouldDrawLayer(layer) {
        return layer.props.shadowEnabled !== false;
    }
    getShaderModuleProps(layer, effects, otherShaderModuleProps) {
        return {
            shadow: {
                project: otherShaderModuleProps.project,
                drawToShadowMap: true
            }
        };
    }
}
//# sourceMappingURL=shadow-pass.js.map