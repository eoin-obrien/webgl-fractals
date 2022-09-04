import { Vector2, Vector2Tuple, Vector3Tuple } from "three";
import { glslComplex } from "./complex";

export const baseUniforms = {
  resolution: [0, 0] as Vector2Tuple,
  center: [0, 0] as Vector2Tuple,
  parameter: [0, 0] as Vector2Tuple,
  exponent: 2,
  zoom: 1,
  gamma: 1,
  bailout: 256,
  maxIterations: 1000,
  supersample: 1,

  paletteOffset: 0,
  paletteA: [0.5, 0.5, 0.5] as Vector3Tuple,
  paletteB: [0.5, 0.5, 0.5] as Vector3Tuple,
  paletteC: [1.0, 1.0, 1.0] as Vector3Tuple,
  paletteD: [0.2, 0.1, 0.0] as Vector3Tuple,
};

export const baseVertexShader = /*glsl*/ `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
  `;

export const baseFragmentShader = /*glsl*/ `
  ${glslComplex}

  uniform vec2 resolution;
  uniform vec2 center;
  uniform vec2 parameter;
  uniform float exponent;
  uniform float zoom;
  uniform float gamma;
  uniform float bailout;
  uniform int maxIterations;
  uniform int supersample;

  uniform float paletteOffset;
  uniform vec3 paletteA;
  uniform vec3 paletteB;
  uniform vec3 paletteC;
  uniform vec3 paletteD;

  // prototype for fractal rendering algorithm
  float render(vec2);

  // cosine based palette, 4 vec3 params
  vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
  {
    return a + b*cos( 6.28318*(c*t+d) );
  }

  vec3 toColor(float k) {
    if (k >= 0.0) {
      return palette(pow(k, gamma) + paletteOffset, paletteA, paletteB, paletteC, paletteD);
    } else {
      return vec3(0.0);
    }
  }

  void main() {
    float scale = 1.0 / zoom / min(resolution.x, resolution.y);
    vec2 p = center + (gl_FragCoord.xy - 0.5 * resolution) * scale;

    float subpixel = scale / float(supersample);
    vec3 color = vec3(0.0);
    vec2 origin = p - 0.5 * scale;
    for (int i = 0; i < supersample; i++) {
      for (int j = 0; j < supersample; j++) {
        float k = render(vec2(
          origin.x + (float(i) + 0.5) * subpixel,
          origin.y + (float(j) + 0.5) * subpixel
        ));

        // Sum square of RGB values
        vec3 subpixelColor = toColor(k);
        color += subpixelColor * subpixelColor;
      }
    }

    // Find average RGB from sum of squares
    color = sqrt(color / pow(float(supersample), 2.0));

    gl_FragColor = vec4(color, 1.0);
  }
  `;
