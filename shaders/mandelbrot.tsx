import { ScreenQuad, shaderMaterial } from '@react-three/drei'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { FC, useRef } from 'react'
import { Vector2, Vector2Tuple } from 'three'

const Mandelbrot = shaderMaterial(
  {
    time: 0,
    resolution: new Vector2(),
    maxIterations: 100,
    supersample: 1,
    gamma: 1,
    center: new Vector2(),
    zoom: 1
  },
  /*glsl*/`
    void main() {
      gl_Position = vec4(position, 1.0);
    }
    `,
  /*glsl*/`
    uniform float time;
    uniform vec2 resolution;
    uniform vec2 center;
    uniform float zoom;
    uniform float gamma;
    uniform int maxIterations;
    uniform int supersample;

    // cosine based palette, 4 vec3 params
    vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
    {
      return a + b*cos( 6.28318*(c*t+d) );
    }

    float mandelbrot(vec2 c) {
      const float B = 256.0;

      float n = 0.0;
      vec2 z  = vec2(0.0);
      for( int i=0; i<maxIterations; i++ )
      {
          z = vec2( z.x*z.x - z.y*z.y, 2.0*z.x*z.y ) + c; // z = z² + c
          if( dot(z,z)>(B*B) ) {
            return n - log2(log2(dot(z,z))) + 4.0;
          };
          n += 1.0;
      }

      return float(maxIterations);
    }

    vec3 toColor(float k) {
      if (k < float(maxIterations)) {
        return palette(pow(k, gamma), vec3(0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5), vec3(1.0, 1.0, 1.0),	vec3(0.20, 0.10, 0.00));
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
          float k = mandelbrot(vec2(
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
    `
)

extend({ Mandelbrot })

type MandelbrotImpl = {
  resolution: Vector2Tuple
  center?: Vector2Tuple
  zoom?: number
  gamma?: number
  maxIterations?: number
  supersample?: number
} & JSX.IntrinsicElements['shaderMaterial']

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mandelbrot: MandelbrotImpl
    }
  }
}

interface MandelbrotSceneProps extends Partial<MandelbrotImpl> {}

export const MandelbrotScene: FC<MandelbrotSceneProps> = (props) => {
  const size = useThree((state) => state.size);
  const dpr = useThree((state) => state.viewport.dpr);
  const ref = useRef<MandelbrotImpl>(null!)
  useFrame((state) => {
    if (ref.current.uniforms) {
      ref.current.uniforms.time.value = state.clock.elapsedTime
    }
  })

  return (
    <ScreenQuad>
      <mandelbrot
        ref={ref as any}
        {...props}
        resolution={[size.width * dpr, size.height * dpr]} />
    </ScreenQuad>
  );
}
