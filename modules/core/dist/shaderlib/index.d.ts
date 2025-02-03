import { ShaderAssembler } from '@luma.gl/shadertools';
import { gouraudLighting, phongLighting } from '@luma.gl/shadertools';
import { layerUniforms } from "./misc/layer-uniforms.js";
import project from "./project/project.js";
import project32 from "./project32/project32.js";
import shadow from "./shadow/shadow.js";
import picking from "./picking/picking.js";
export declare function getShaderAssembler(): ShaderAssembler;
export { layerUniforms, picking, project, project32, gouraudLighting, phongLighting, shadow };
export type { ProjectProps, ProjectUniforms } from "./project/viewport-uniforms.js";
export type PickingUniforms = {
    picking_uActive: boolean;
    picking_uAttribute: boolean;
    picking_uSelectedColor: [number, number, number];
    picking_uSelectedColorValid: boolean;
    picking_uHighlightColor: [number, number, number, number];
};
export type LightingModuleSettings = {
    material: boolean | {
        ambient?: number;
        diffuse?: number;
        shininess?: number;
        specularColor?: [number, number, number];
    };
};
//# sourceMappingURL=index.d.ts.map