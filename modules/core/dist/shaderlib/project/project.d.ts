import type { ProjectProps } from "./viewport-uniforms.js";
declare function getUniforms(opts?: ProjectProps | {}): {};
declare const _default: {
    readonly name: "project";
    readonly dependencies: [{
        name: string;
        vs: string;
    }, {
        readonly name: "geometry";
        readonly vs: "\n#define SMOOTH_EDGE_RADIUS 0.5\n\nstruct VertexGeometry {\n  vec4 position;\n  vec3 worldPosition;\n  vec3 worldPositionAlt;\n  vec3 normal;\n  vec2 uv;\n  vec3 pickingColor;\n} geometry = VertexGeometry(\n  vec4(0.0, 0.0, 1.0, 0.0),\n  vec3(0.0),\n  vec3(0.0),\n  vec3(0.0),\n  vec2(0.0),\n  vec3(0.0)\n);\n";
        readonly fs: "\n#define SMOOTH_EDGE_RADIUS 0.5\n\nstruct FragmentGeometry {\n  vec2 uv;\n} geometry;\n\nfloat smoothedge(float edge, float x) {\n  return smoothstep(edge - SMOOTH_EDGE_RADIUS, edge + SMOOTH_EDGE_RADIUS, x);\n}\n";
    }];
    readonly vs: string;
    readonly getUniforms: typeof getUniforms;
    readonly uniformTypes: {
        readonly wrapLongitude: "f32";
        readonly coordinateSystem: "i32";
        readonly commonUnitsPerMeter: "vec3<f32>";
        readonly projectionMode: "i32";
        readonly scale: "f32";
        readonly commonUnitsPerWorldUnit: "vec3<f32>";
        readonly commonUnitsPerWorldUnit2: "vec3<f32>";
        readonly center: "vec4<f32>";
        readonly modelMatrix: "mat4x4<f32>";
        readonly viewProjectionMatrix: "mat4x4<f32>";
        readonly viewportSize: "vec2<f32>";
        readonly devicePixelRatio: "f32";
        readonly focalDistance: "f32";
        readonly cameraPosition: "vec3<f32>";
        readonly coordinateOrigin: "vec3<f32>";
        readonly commonOrigin: "vec3<f32>";
        readonly pseudoMeters: "f32";
    };
};
export default _default;
//# sourceMappingURL=project.d.ts.map