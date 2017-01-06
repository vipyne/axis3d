#pragma glslify: export(LambertMaterial)
struct LambertMaterial {
  float opacity;
  vec4 color;
  float type;

  float roughness;
  vec4 emissive;
  vec4 ambient;
  float albedo;
};
