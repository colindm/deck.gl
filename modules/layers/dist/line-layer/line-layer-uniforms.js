// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const uniformBlock = `\
uniform lineUniforms {
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  float useShortestPath;
  highp int widthUnits;
} line;
`;
export const lineUniforms = {
    name: 'line',
    vs: uniformBlock,
    fs: uniformBlock,
    uniformTypes: {
        widthScale: 'f32',
        widthMinPixels: 'f32',
        widthMaxPixels: 'f32',
        useShortestPath: 'f32',
        widthUnits: 'i32'
    }
};
//# sourceMappingURL=line-layer-uniforms.js.map