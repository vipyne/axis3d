precision mediump float;

//
// Shader dependencies.
//

//
// Shader entry.
//
#pragma glslify: export(main)
void main() {
  GeometryContext geometry = getGeometryContext();
  if (map.resolution.x > 0.0 && map.resolution.y > 0.0) {
    gl_FragColor = texture2D(map.data, 1.0 - geometry.uv);
  } else {
    gl_FragColor = material.color;
  }

  if (material.color.a < 1.0) {
    gl_FragColor.a = material.color.a;
  } else {
    gl_FragColor.a = material.opacity;
  }
}
