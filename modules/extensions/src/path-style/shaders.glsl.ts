// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export const dashShaders = {
  inject: {
    'vs:#decl': `
in vec2 instanceDashArrays;
in float instanceDashOffsets;
out vec2 vDashArray;
out float vDashOffset;
`,

    'vs:#main-end': `
vDashArray = instanceDashArrays;
vDashOffset = instanceDashOffsets / width.x;
`,

    'fs:#decl': `
uniform pathStyleUniforms {
  float dashAlignMode;
  bool dashGapPickable;
} pathStyle;

in vec2 vDashArray;
in float vDashOffset;
`,

    // if given position is in the gap part of the dashed line
    // dashArray.x: solid stroke length, relative to width
    // dashArray.y: gap length, relative to width
    // alignMode:
    // 0 - no adjustment
    // o----     ----     ----     ---- o----     -o----     ----     o
    // 1 - stretch to fit, draw half dash at each end for nicer joints
    // o--    ----    ----    ----    --o--      --o--     ----     --o
    'fs:#main-start': `
  float solidLength = vDashArray.x;
  float gapLength = vDashArray.y;
  float unitLength = solidLength + gapLength;

  float offset;

  if (unitLength > 0.0) {
    if (pathStyle.dashAlignMode == 0.0) {
      offset = vDashOffset;
    } else {
      unitLength = vPathLength / round(vPathLength / unitLength);
      offset = solidLength / 2.0;
    }

    float unitOffset = mod(vPathPosition.y + offset, unitLength);

    if (gapLength > 0.0 && unitOffset > solidLength) {
      if (path.capType <= 0.5) {
        if (!(pathStyle.dashGapPickable && bool(picking.isActive))) {
          discard;
        }
      } else {
        // caps are rounded, test the distance to solid ends
        float distToEnd = length(vec2(
          min(unitOffset - solidLength, unitLength - unitOffset),
          vPathPosition.x
        ));
        if (distToEnd > 1.0) {
          if (!(pathStyle.dashGapPickable && bool(picking.isActive))) {
            discard;
          }
        }
      }
    }
  }
`
  }
};

export const offsetShaders = {
//   inject: {
//     'vs:#decl': `
// in vec2 instanceOffsets;
// `,
//     'vs:DECKGL_FILTER_SIZE': `
//   float offsetWidth = abs(instanceOffsets.y * 2.0) + 1.0;
//   size *= offsetWidth;
// `,
//     'vs:#main-end': `
//   float offsetWidth = abs(instanceOffsets.y * 2.0) + 1.0;
//   float offsetDir = -sign(instanceOffsets.y);
//   vPathPosition.x = (vPathPosition.x + offsetDir) * offsetWidth - offsetDir;
//   vPathPosition.y *= offsetWidth;
//   vPathLength *= offsetWidth;
// `,
//   'fs:#main-start': `
//   float dist = abs(vPathPosition.x);
//   // Smooth transition at the edges (from 0.9 to 1.1 for a slightly wider antialiasing band)
//   float opacity = 1.0 - smoothstep(0.9, 1.1, dist);
// `,
//     'fs:#main-end': `
//   fragColor.a *= opacity;
//   if (fragColor.a < 0.001) {
//     discard;
//   }
// `

inject: {
  'vs:#decl': `
in vec2 instanceOffsets;  // x: min clip value, y: max clip value
out float vPathPositionX;
out float vPathProgress;  // Add this to pass position along path
`,
'vs:DECKGL_FILTER_SIZE': `
float offsetWidth = abs(instanceOffsets.y - instanceOffsets.x);
size *= offsetWidth;
`,
// 'vs:DECKGL_FILTER_SIZE': `
// // size *= instanceOffsets.x + 1.0;
// // Make the line wider by scaling the size
// // size *= 3.0;
// `,
'vs:#main-end': `
// Scale the x position for a wider line
vPathPosition.x *= abs(instanceOffsets.y - instanceOffsets.x);
vPathPositionX = vPathPosition.x;
vPathProgress = vPathPosition.y / vPathLength;  // Calculate progress along path
`,

'fs:#decl': `
in float vPathPositionX;
in float vPathProgress;
`,

    'fs:#main-end': `
float fadeThreshold = 0.5;
// Use progress to interpolate between fading bottom (-1) and top (1)
float topFadeAmount = mix(0.0, 1.0, vPathProgress);
float bottomFadeAmount = mix(1.0, 0.0, vPathProgress);

if (vPathPositionX * topFadeAmount > fadeThreshold) {
    fragColor.a *= 0.0;
}

if (vPathPositionX * -bottomFadeAmount > fadeThreshold) {
    fragColor.a *= 0.0;
}
`
}
};