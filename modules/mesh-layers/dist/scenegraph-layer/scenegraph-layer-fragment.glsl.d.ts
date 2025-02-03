declare const _default: "#version 300 es\n\n#define SHADER_NAME scenegraph-layer-fragment-shader\n\n// Varying\nin vec4 vColor;\n\nout vec4 fragColor;\n\n// pbrMaterial contains all the varying definitions needed\n#ifndef LIGHTING_PBR\n  #if defined(HAS_UV) && defined(HAS_BASECOLORMAP)\n    in vec2 vTEXCOORD_0;\n    uniform sampler2D pbr_baseColorSampler;\n  #endif\n#endif\n\nvoid main(void) {\n  #ifdef LIGHTING_PBR\n    fragColor = vColor * pbr_filterColor(vec4(0));\n    geometry.uv = pbr_vUV;\n  #else\n    #if defined(HAS_UV) && defined(HAS_BASECOLORMAP)\n      fragColor = vColor * texture(pbr_baseColorSampler, vTEXCOORD_0);\n      geometry.uv = vTEXCOORD_0;\n    #else\n      fragColor = vColor;\n    #endif\n  #endif\n\n  fragColor.a *= layer.opacity;\n  DECKGL_FILTER_COLOR(fragColor, geometry);\n}\n";
export default _default;
//# sourceMappingURL=scenegraph-layer-fragment.glsl.d.ts.map