precision mediump float;

//
// Shader dependencies.
//
#pragma glslify: computeAttenuation = require('../../light/attenuation')
#pragma glslify: computeDirection = require('../../light/direction')
#pragma glslify: DirectionalLight = require('../../light/DirectionalLight')
#pragma glslify: AmbientLight = require('../../light/AmbientLight')
#pragma glslify: PointLight = require('../../light/PointLight')
#pragma glslify: transpose = require('glsl-transpose')
#pragma glslify: inverse = require('glsl-inverse')
#pragma glslify: orenn = require('glsl-diffuse-oren-nayar')

#pragma glslify: lambert = require('glsl-diffuse-lambert')

#ifndef MAX_AMBIENT_LIGHTS
#define MAX_AMBIENT_LIGHTS 16
#endif

#ifndef MAX_DIRECTIONAL_LIGHTS
#define MAX_DIRECTIONAL_LIGHTS 32
#endif

#ifndef MAX_POINT_LIGHTS
#define MAX_POINT_LIGHTS 128
#endif

#define isinf(n) (n >= 0.0 || n <= 0.0)
#define isnan(n) !isinf(n) && n != n

struct PositionedLight {
  vec4 position;
  vec4 color;
  bool visible;
  float radius;
  float ambient;
  float intensity;
};

PositionedLight
PositionedLightUnpackDirectional(DirectionalLight light) {
  return PositionedLight(
    light.position,
    light.color,
    light.visible,
    light.radius,
    light.ambient,
    light.intensity
  );
}

PositionedLight
PositionedLightUnpackPoint(PointLight light) {
  return PositionedLight(
    light.position,
    light.color,
    light.visible,
    light.radius,
    light.ambient,
    light.intensity
  );
}

void applyPositionedLight(
    PositionedLight light,
    GeometryContext geometry,
    inout vec4 fragColor) {
  if (false == light.visible) {
    return;
  }

  vec3 viewpoint = normalize(eye - geometry.position);
  vec3 direction = computeDirection(light.position, geometry.position);
  vec3 ambient = light.ambient * material.ambient.xyz;

  float attenuation =
    computeAttenuation(
        light.position,
        direction,
        light.radius);

  float diffuse =
    orenn(
        normalize(direction),
        normalize(viewpoint),
        geometry.normal,
        material.roughness,
        material.albedo);

  // clamp coef
  diffuse =
    (diffuse < 0.0 || 0.0 < diffuse || diffuse == 0.0)
    ? diffuse : 0.0;

  //float diffuseCoef = max(0.0, dot(geometry.normal, direction));
  vec3 combined = diffuse * material.color.xyz;

  // sum
  fragColor += vec4(
      ambient
      + attenuation
      * combined
      * light.color.xyz
      * light.intensity
      , 1.0);
}

//
// Shader entry.
//
#pragma glslify: export(main)
void main() {
  GeometryContext geometry = getGeometryContext();
  vec4 fragColor = vec4(0.0);

  // accumulate ambient
  for (int i = 0; i < MAX_AMBIENT_LIGHTS; ++i) {
    if (i >= lightContext.ambient.count) {
      break;
    }

    AmbientLight light = lightContext.ambient.lights[i];
    if (light.visible) {
      fragColor += material.color * light.color * material.ambient;
    }
  }

  // adapted from https://github.com/freeman-lab/gl-lambert-material/blob/master/fragment.glsl
  for (int i = 0; i < MAX_DIRECTIONAL_LIGHTS; ++i) {
    if (i >= lightContext.directional.count) {
      break;
    }

    DirectionalLight light = lightContext.directional.lights[i];
    applyPositionedLight(
      PositionedLightUnpackDirectional(light),
      geometry,
      fragColor);
  }

  for (int i = 0; i < MAX_POINT_LIGHTS; ++i) {
    if (i >= lightContext.point.count) {
      break;
    }

    PointLight light = lightContext.point.lights[i];
    applyPositionedLight(
      PositionedLightUnpackPoint(light),
      geometry,
      fragColor);
  }

  fragColor = fragColor + material.emissive;

  //vec3 gamma = vec3(1.0/2.2);
  //fragColor += vec4(pow(fragColor.xyz, gamma), 1.0);

  gl_FragColor = fragColor;
  gl_FragColor.a = material.opacity;
}
