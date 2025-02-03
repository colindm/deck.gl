// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
/**
 * Extract uniform values set for a Layer in the underlying UniformBlock store
 */
export function getLayerUniforms(layer, blockName) {
    const uniforms = {};
    const uniformStore = layer.getModels()[0]._uniformStore;
    const uniformBlocks = blockName
        ? [uniformStore.uniformBlocks.get(blockName)]
        : uniformStore.uniformBlocks.values();
    for (const block of uniformBlocks) {
        Object.assign(uniforms, block.uniforms);
    }
    return uniforms;
}
//# sourceMappingURL=layer.js.map