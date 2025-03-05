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

export const multiOffsetShaders = {
  // out float unusedBottom; // The area at the bottom of the line that's unused
  // Ex: if the offset is [0, 1] then the extra size created under -0.5 (0 is the middle minus the line width of 0.5) is unused
  // So the unusedBottom would be -0.5

  inject: {
    'vs:#decl': `
in vec2 instanceOffsets;  // x: start offset, y: end offset
out float vPathPositionX;
out float vPathProgress;  // Add this to pass position along path
out vec2 vInstanceOffsets;  // Add this to pass instanceOffsets to fragment shader
out float vSizeMultiplier;
`,
    'vs:DECKGL_FILTER_SIZE': `
    // Scale size to accommodate both offsets
    float maxOffset = max(abs(instanceOffsets.x), abs(instanceOffsets.y));

    // No clue why these numbers are what they are
    float sizeMultiplier = 3.0;
    if (instanceOffsets.y == 2.0) {
      sizeMultiplier = 2.5;
    } else if (instanceOffsets.y == 3.0) {
      sizeMultiplier = 2.33;
    }

    size *= (sizeMultiplier) * maxOffset;
    vInstanceOffsets = instanceOffsets;  // Pass instanceOffsets to fragment shader
    vSizeMultiplier = sizeMultiplier;
    `,
    'vs:#main-end': `
    // Scale the x position for a wider line
    vPathPosition.x *= instanceOffsets.y + (instanceOffsets.x * 1.5);
    vPathPositionX = vPathPosition.x;
    vPathProgress = vPathPosition.y / vPathLength;  // Calculate progress along path
    `,

    'fs:#decl': `
in float vPathPositionX;
in float vPathProgress;
in float unusedBottom;
in vec2 vInstanceOffsets;  // Receive instanceOffsets in fragment shader
in float vSizeMultiplier;
`,
    // TODO: For the train paths make it so that it highlights areas with vPathProgress between say 0.1 and 0.5
    'fs:#main-end': `
    float lineWidth = 1.0 / vSizeMultiplier;
    if (vInstanceOffsets.x == 1.0) {
      lineWidth *= 0.5;
    }

    float extraBottomPadding = 0.0;
    // No clue why these numbers are what they are
    if (vInstanceOffsets.x == 1.0) {
      extraBottomPadding = 0.9;
    } else if (vInstanceOffsets.x == 2.0) {
      extraBottomPadding = 0.625;
    }

    // Needed to keep things aligned when the start offset isn't 0
    float unusedBottom = -lineWidth + extraBottomPadding;

    // Remove the unused bottom of the line
    if (vPathPositionX < unusedBottom) {
      fragColor.a *= 0.5;
    }

    // No clue why these numbers are what they are
    float vAngleMultiplier = 1.5;
    if (vInstanceOffsets.y == 2.0 && vInstanceOffsets.x == 0.0) {
      vAngleMultiplier = 0.625;
    } else if (vInstanceOffsets.y == 2.0 && vInstanceOffsets.x == 1.0) {
      vAngleMultiplier = 0.7;
    } else if (vInstanceOffsets.y == 3.0 && vInstanceOffsets.x == 0.0) {
      vAngleMultiplier = 0.39;
    } else if (vInstanceOffsets.y == 3.0 && vInstanceOffsets.x == 1.0) {
      vAngleMultiplier = 0.43;
    }

    // Remove the bottom triangle of the line
    if ((vPathPositionX + (vInstanceOffsets.x * -extraBottomPadding)) < ((vPathProgress / vAngleMultiplier) - lineWidth)) {
      fragColor.a *= 0.5;
    }

    // No clue why these numbers are what they are
    float topTriangleMultiplier = 0.0;
    if (vInstanceOffsets.x == 1.0 && vInstanceOffsets.y == 2.0) {
      topTriangleMultiplier = 1.85;
    } else if (vInstanceOffsets.x == 1.0 && vInstanceOffsets.y == 3.0) {
      topTriangleMultiplier = 1.95;
    }
    // Remove the top triangle of the line
    if ((vPathPositionX + (vInstanceOffsets.x * -topTriangleMultiplier)) > ((vPathProgress / vAngleMultiplier) + lineWidth)) {
      fragColor.a *= 0.5;
    }
`
  }
};

export const singleOffsetShaders = {
  inject: {
    'vs:#decl': `
in float instanceOffsets;
`,
    'vs:DECKGL_FILTER_SIZE': `
  float offsetWidth = abs(instanceOffsets * 2.0) + 1.0;
  size *= offsetWidth;
`,
    'vs:#main-end': `
  float offsetWidth = abs(instanceOffsets * 2.0) + 1.0;
  float offsetDir = sign(instanceOffsets);
  vPathPosition.x = (vPathPosition.x + offsetDir) * offsetWidth - offsetDir;
  vPathPosition.y *= offsetWidth;
  vPathLength *= offsetWidth;
`,
    'fs:#main-start': `
  float dist = abs(vPathPosition.x);
  // Smooth transition at the edges (from 0.8 to 1.2 for a slightly wider antialiasing band)
  float opacity = 1.0 - smoothstep(0.8, 1.2, dist);
  if (opacity < 0.001) {
    discard;
  }
`,
    'fs:#main-end': `
  fragColor.a *= opacity;
`
  }
};

export const variableOffsetShaders = {
  inject: {
    'vs:#decl': `
      in float instanceOffsets;  // The segment-specific offset value
      in float instanceSegmentIndices;
      flat out float vSegmentIndex;
      flat out float vSegmentNum;
    `,
    'vs:DECKGL_FILTER_SIZE': `
      // Use the segment-specific offset directly
      float offsetWidth = abs(instanceOffsets * 2.0) + 1.0;
      size *= offsetWidth;
    `,
    'vs:#main-end': `
      vSegmentIndex = instanceSegmentIndices;
      
      // Use the segment-specific offset directly
      float offsetWidth = abs(instanceOffsets * 2.0) + 1.0;
      float offsetDir = sign(instanceOffsets);
      vPathPosition.x = (vPathPosition.x + offsetDir) * offsetWidth - offsetDir;
    `,
    'fs:#decl': `
      uniform pathStyleUniforms {
        float debug;
      } pathStyle;
      flat in float vSegmentIndex;
      flat in float vSegmentNum;
    `,
    'fs:#main-start': `
      float isInside = step(-1.0, vPathPosition.x) * step(vPathPosition.x, 1.0);
      if (isInside == 0.0) {
        discard;
      }
    `,
    'fs:#main-end': `
      // Apply opacity to all segments
      fragColor.a *= 0.5;
    `
  }
};
