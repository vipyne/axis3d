precision highp float;

//
// Shader dependcies.
//
#pragma glslify: linevoffset = require('screen-projected-lines')
#pragma glslify: random = require('glsl-random')

//
// Shader uniforms.
//
uniform float aspect;
uniform float wireframeThickness;
uniform bool wireframe;
uniform mat4 projection;
uniform mat4 model;
uniform mat3 modelNormal;
uniform mat4 view;
uniform float time;

//
// Shader IO.
//
#ifdef HAS_NEXT_POSITIONS
attribute vec3 nextPosition;
#endif

#ifdef HAS_DIRECTIONS
attribute float direction;
#endif

#ifdef HAS_POSITIONS
attribute vec3 position;
#endif

#ifdef HAS_NORMALS
attribute vec3 normal;
#endif

#ifdef HAS_UVS
attribute vec2 uv;
#endif

varying vec3 vposition;
varying vec3 vnormal;
varying vec2 vuv;

mat4 rotationMatrix(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;

  return mat4(
      oc * axis.x * axis.x + c,
      oc * axis.x * axis.y - axis.z * s,
      oc * axis.z * axis.x + axis.y * s,
      0.0,

      oc * axis.x * axis.y + axis.z * s,
      oc * axis.y * axis.y + c,
      oc * axis.y * axis.z - axis.x * s,
      0.0,

      oc * axis.z * axis.x - axis.y * s,
      oc * axis.y * axis.z + axis.x * s,
      oc * axis.z * axis.z + c,
      0.0,

      0.0,
      0.0,
      0.0,
      1.0);
}

vec3 lerp(vec3 a, vec3 b, float t) {
  return vec3(
    a.x + t * (b.x - a.x),
    a.y + t * (b.y - a.y),
    a.z + t * (b.z - a.z)
  );
}

//
// Shader entry.
//
#pragma glslify: export(main)
void main() {
  vec3 pos = position;
  // @TODO(werle) - abstract to geomorping interface
  //float p = random(position.xy);
  //vec3 pos = lerp(position, position + vec3(p, p, p), cos(time));

#if defined(HAS_NEXT_POSITIONS)
  if (wireframe) {
    vec3 npos = nextPosition;
    // @TODO(werle) - abstract to geomorping interface
    //float np = random(nextPosition.yz);
    //vec3 npos = lerp(nextPosition, nextPosition + vec3(np, np, np), sin(0.1*time));
    vec4 p = projection * view * model * vec4(pos, 1.0);
    vec4 n = projection * view * model * vec4(npos, 1.0);
    vec4 off = linevoffset(p, n, direction, aspect);
    gl_Position = p + off*wireframeThickness;
  } else
#endif
  {
#if defined HAS_POSITIONS
    gl_Position = projection * view * model * vec4(pos, 1.0);
#endif
  }

#if defined HAS_POSITIONS
  vposition = (model * vec4(pos, 1.0)).xyz;
#endif

#ifdef HAS_NORMALS
  vnormal = normalize(modelNormal * normal);
#endif

#ifdef HAS_UVS
  vuv = uv;
#endif
}
