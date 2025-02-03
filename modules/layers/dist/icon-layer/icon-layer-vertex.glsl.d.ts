declare const _default: "#version 300 es\n#define SHADER_NAME icon-layer-vertex-shader\n\nin vec2 positions;\n\nin vec3 instancePositions;\nin vec3 instancePositions64Low;\nin float instanceSizes;\nin float instanceAngles;\nin vec4 instanceColors;\nin vec3 instancePickingColors;\nin vec4 instanceIconFrames;\nin float instanceColorModes;\nin vec2 instanceOffsets;\nin vec2 instancePixelOffset;\n\nout float vColorMode;\nout vec4 vColor;\nout vec2 vTextureCoords;\nout vec2 uv;\n\nvec2 rotate_by_angle(vec2 vertex, float angle) {\n  float angle_radian = angle * PI / 180.0;\n  float cos_angle = cos(angle_radian);\n  float sin_angle = sin(angle_radian);\n  mat2 rotationMatrix = mat2(cos_angle, -sin_angle, sin_angle, cos_angle);\n  return rotationMatrix * vertex;\n}\n\nvoid main(void) {\n  geometry.worldPosition = instancePositions;\n  geometry.uv = positions;\n  geometry.pickingColor = instancePickingColors;\n  uv = positions;\n\n  vec2 iconSize = instanceIconFrames.zw;\n  // convert size in meters to pixels, then scaled and clamp\n \n  // project meters to pixels and clamp to limits \n  float sizePixels = clamp(\n    project_size_to_pixel(instanceSizes * icon.sizeScale, icon.sizeUnits),\n    icon.sizeMinPixels, icon.sizeMaxPixels\n  );\n\n  // scale icon height to match instanceSize\n  float instanceScale = iconSize.y == 0.0 ? 0.0 : sizePixels / iconSize.y;\n\n  // scale and rotate vertex in \"pixel\" value and convert back to fraction in clipspace\n  vec2 pixelOffset = positions / 2.0 * iconSize + instanceOffsets;\n  pixelOffset = rotate_by_angle(pixelOffset, instanceAngles) * instanceScale;\n  pixelOffset += instancePixelOffset;\n  pixelOffset.y *= -1.0;\n\n  if (icon.billboard)  {\n    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);\n    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);\n    vec3 offset = vec3(pixelOffset, 0.0);\n    DECKGL_FILTER_SIZE(offset, geometry);\n    gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);\n\n  } else {\n    vec3 offset_common = vec3(project_pixel_size(pixelOffset), 0.0);\n    DECKGL_FILTER_SIZE(offset_common, geometry);\n    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset_common, geometry.position); \n    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);\n  }\n\n  vTextureCoords = mix(\n    instanceIconFrames.xy,\n    instanceIconFrames.xy + iconSize,\n    (positions.xy + 1.0) / 2.0\n  ) / icon.iconsTextureDim;\n\n  vColor = instanceColors;\n  DECKGL_FILTER_COLOR(vColor, geometry);\n\n  vColorMode = instanceColorModes;\n}\n";
export default _default;
//# sourceMappingURL=icon-layer-vertex.glsl.d.ts.map