// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { ShaderAssembler } from '@luma.gl/shadertools';
import { gouraudLighting, phongLighting } from '@luma.gl/shadertools';
import { layerUniforms } from "./misc/layer-uniforms.js";
import geometry from "./misc/geometry.js";
import project from "./project/project.js";
import project32 from "./project32/project32.js";
import shadow from "./shadow/shadow.js";
import picking from "./picking/picking.js";
const DEFAULT_MODULES = [geometry];
const SHADER_HOOKS = [
    'vs:DECKGL_FILTER_SIZE(inout vec3 size, VertexGeometry geometry)',
    'vs:DECKGL_FILTER_GL_POSITION(inout vec4 position, VertexGeometry geometry)',
    'vs:DECKGL_FILTER_COLOR(inout vec4 color, VertexGeometry geometry)',
    'fs:DECKGL_FILTER_COLOR(inout vec4 color, FragmentGeometry geometry)'
];
export function getShaderAssembler() {
    const shaderAssembler = ShaderAssembler.getDefaultShaderAssembler();
    for (const shaderModule of DEFAULT_MODULES) {
        shaderAssembler.addDefaultModule(shaderModule);
    }
    for (const shaderHook of SHADER_HOOKS) {
        shaderAssembler.addShaderHook(shaderHook);
    }
    return shaderAssembler;
}
export { layerUniforms, picking, project, project32, gouraudLighting, phongLighting, shadow };
//# sourceMappingURL=index.js.map