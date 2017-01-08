precision mediump float;

//
// Shader dependencies.
//
#pragma glslify: GeometryContext = require('../../geometry/context')
#pragma glslify: LightContext = require('../../light/context')
#pragma glslify: Map = require('../Map')

//
// Built in material types.
//
#pragma glslify: LambertMaterial = require('../LambertMaterial')
#pragma glslify: FlatMaterial = require('../FlatMaterial')

#ifndef MATERIAL_TYPE
#define MATERIAL_TYPE FlatMaterial
#endif

#define getGeometryContext() GeometryContext(vposition, vnormal, vuv)

//
// Shader IO.
//
varying vec3 vposition;
varying vec3 vnormal;
varying vec2 vuv;

//
// Shader uniforms.
//
uniform MATERIAL_TYPE material;
uniform LightContext lightContext;
uniform vec3 eye;

#ifdef HAS_MAP
uniform Map map;
#endif

//
// Shader entry.
//
#ifdef useLambertMaterial
#pragma glslify: lambert = require('./lambert', material=material, lightContext=lightContext, eye=eye, map=map, getGeometryContext=getGeometryContext, GeometryContext=GeometryContext, model=model)
void main() {
  lambert();
}
#elif defined useFlatMaterial
#pragma glslify: flat = require('./flat', material=material, lightContext=lightContext, eye=eye, map=map, getGeometryContext=getGeometryContext, GeometryContext=GeometryContext, model=model)
void main() {
  flat();
}
#elif defined SHADER_MAIN_BODY
void main() {
  SHADER_MAIN_BODY
}
#else
void main() {
  discard;
}
#endif
