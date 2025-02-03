// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { project } from '@deck.gl/core';
/** A model can have one of the following modes */
export const TERRAIN_MODE = {
    NONE: 0,
    /** A terrain layer rendering encoded ground elevation into the height map */
    WRITE_HEIGHT_MAP: 1,
    /** An offset layer reading encoded ground elevation from the height map */
    USE_HEIGHT_MAP: 2,
    /** A terrain layer rendering to screen, using the cover fbo overlaid with its own texture */
    USE_COVER: 3,
    /** A terrain layer rendering to screen, using the cover fbo as texture */
    USE_COVER_ONLY: 4,
    /** Draped layer is rendered into a texture, and never to screen */
    SKIP: 5
};
const TERRAIN_MODE_CONSTANTS = Object.keys(TERRAIN_MODE)
    .map(key => `const float TERRAIN_MODE_${key} = ${TERRAIN_MODE[key]}.0;`)
    .join('\n');
const uniformBlock = 
// eslint-disable-next-line prefer-template
TERRAIN_MODE_CONSTANTS +
    /* glsl */ `
uniform terrainUniforms {
  float mode;
  vec4 bounds;
} terrain;

uniform sampler2D terrain_map;
`;
export const terrainModule = {
    name: 'terrain',
    dependencies: [project],
    // eslint-disable-next-line prefer-template
    vs: uniformBlock + /* glsl */ 'out vec3 commonPos;',
    // eslint-disable-next-line prefer-template
    fs: uniformBlock + /* glsl */ 'in vec3 commonPos;',
    inject: {
        'vs:#main-start': /* glsl */ `
if (terrain.mode == TERRAIN_MODE_SKIP) {
  gl_Position = vec4(0.0);
  return;
}
`,
        'vs:DECKGL_FILTER_GL_POSITION': /* glsl */ `
commonPos = geometry.position.xyz;
if (terrain.mode == TERRAIN_MODE_WRITE_HEIGHT_MAP) {
  vec2 texCoords = (commonPos.xy - terrain.bounds.xy) / terrain.bounds.zw;
  position = vec4(texCoords * 2.0 - 1.0, 0.0, 1.0);
  commonPos.z += project.commonOrigin.z;
}
if (terrain.mode == TERRAIN_MODE_USE_HEIGHT_MAP) {
  vec3 anchor = geometry.worldPosition;
  anchor.z = 0.0;
  vec3 anchorCommon = project_position(anchor);
  vec2 texCoords = (anchorCommon.xy - terrain.bounds.xy) / terrain.bounds.zw;
  if (texCoords.x >= 0.0 && texCoords.y >= 0.0 && texCoords.x <= 1.0 && texCoords.y <= 1.0) {
    float terrainZ = texture(terrain_map, texCoords).r;
    geometry.position.z += terrainZ;
    position = project_common_position_to_clipspace(geometry.position);
  }
}
    `,
        'fs:#main-start': /* glsl */ `
if (terrain.mode == TERRAIN_MODE_WRITE_HEIGHT_MAP) {
  fragColor = vec4(commonPos.z, 0.0, 0.0, 1.0);
  return;
}
    `,
        'fs:DECKGL_FILTER_COLOR': /* glsl */ `
if ((terrain.mode == TERRAIN_MODE_USE_COVER) || (terrain.mode == TERRAIN_MODE_USE_COVER_ONLY)) {
  vec2 texCoords = (commonPos.xy - terrain.bounds.xy) / terrain.bounds.zw;
  vec4 pixel = texture(terrain_map, texCoords);
  if (terrain.mode == TERRAIN_MODE_USE_COVER_ONLY) {
    color = pixel;
  } else {
    // pixel is premultiplied
    color = pixel + color * (1.0 - pixel.a);
  }
  return;
}
    `
    },
    // eslint-disable-next-line complexity
    getUniforms: (opts = {}) => {
        if ('dummyHeightMap' in opts) {
            const { drawToTerrainHeightMap, heightMap, heightMapBounds, dummyHeightMap, terrainCover, useTerrainHeightMap, terrainSkipRender } = opts;
            const projectUniforms = project.getUniforms(opts.project);
            const { commonOrigin } = projectUniforms;
            let mode = terrainSkipRender ? TERRAIN_MODE.SKIP : TERRAIN_MODE.NONE;
            // height map if case USE_HEIGHT_MAP, terrain cover if USE_COVER, otherwise empty
            let sampler = dummyHeightMap;
            // height map bounds if case USE_HEIGHT_MAP, terrain cover bounds if USE_COVER, otherwise null
            let bounds = null;
            if (drawToTerrainHeightMap) {
                mode = TERRAIN_MODE.WRITE_HEIGHT_MAP;
                bounds = heightMapBounds;
            }
            else if (useTerrainHeightMap && heightMap) {
                mode = TERRAIN_MODE.USE_HEIGHT_MAP;
                sampler = heightMap;
                bounds = heightMapBounds;
            }
            else if (terrainCover) {
                // This is a terrain layer
                const fbo = opts.isPicking
                    ? terrainCover.getPickingFramebuffer()
                    : terrainCover.getRenderFramebuffer();
                sampler = fbo?.colorAttachments[0].texture;
                if (opts.isPicking) {
                    // Never render the layer itself in picking pass
                    mode = TERRAIN_MODE.SKIP;
                }
                if (sampler) {
                    mode = mode === TERRAIN_MODE.SKIP ? TERRAIN_MODE.USE_COVER_ONLY : TERRAIN_MODE.USE_COVER;
                    bounds = terrainCover.bounds;
                }
                else {
                    sampler = dummyHeightMap;
                }
            }
            /* eslint-disable camelcase */
            return {
                mode,
                terrain_map: sampler,
                // Convert bounds to the common space, as [minX, minY, width, height]
                bounds: bounds
                    ? [
                        bounds[0] - commonOrigin[0],
                        bounds[1] - commonOrigin[1],
                        bounds[2] - bounds[0],
                        bounds[3] - bounds[1]
                    ]
                    : [0, 0, 0, 0]
            };
        }
        return {};
    },
    uniformTypes: {
        mode: 'f32',
        bounds: 'vec4<f32>'
    }
};
//# sourceMappingURL=shader-module.js.map