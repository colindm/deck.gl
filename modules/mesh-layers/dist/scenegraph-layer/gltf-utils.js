// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
export async function waitForGLTFAssets(gltfObjects) {
    const remaining = [];
    gltfObjects.scenes.forEach(scene => {
        scene.traverse((modelNode) => {
            // TODO v9 getUnforms() was removed, hack it with props.uniforms
            Object.values(modelNode.model.uniforms).forEach((uniform) => {
                if (uniform.loaded === false) {
                    remaining.push(uniform);
                }
            });
        });
    });
    return await waitWhileCondition(() => remaining.some(uniform => !uniform.loaded));
}
async function waitWhileCondition(condition) {
    while (condition()) {
        await new Promise(resolve => requestAnimationFrame(resolve));
    }
}
//# sourceMappingURL=gltf-utils.js.map