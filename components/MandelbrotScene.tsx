import { ScreenQuad, shaderMaterial } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { FC, useRef } from "react";
import { Vector2, Vector2Tuple } from "three";
import { glslComplex } from "../shaders/complex";
import {
  baseFragmentShader,
  baseUniforms,
  baseVertexShader,
} from "../shaders/utils";

const Mandelbrot = shaderMaterial(
  {
    ...baseUniforms,
  },
  baseVertexShader,
  /*glsl*/ `
    ${baseFragmentShader}

    float render(vec2 point) {
      vec2 c = isJulia ? parameter : point;
      vec2 z = isJulia ? point : parameter;

      // Optimizations for z0 = 0 + 0i only
      if (!isJulia && parameter == vec2(0.0, 0.0) && exponent == 2.0) {
        // optimize main cardioid
        float q = pow(c.x - 0.25, 2.0) + pow(c.y, 2.0);
        if (q * (q + (c.x - 0.25)) < 0.25 * pow(c.y, 2.0)) {
          return -1.0;
        }

        // optimize period-2 bulb
        if (pow(c.x + 1.0, 2.0) + pow(c.y, 2.0) < 0.0625) {
          return -1.0;
        }
      }

      float n = 0.0;
      for( int i=0; i<maxIterations; i++ )
      {
        z = c_pow(z, exponent) + c;
        if( length(z) > bailout ) {
          if (exponent == 2.0) {
            // Optimized for z = z² + c
            return n - log2(log2(dot(z,z))) + 4.0;
          } else {
            return n - log(log(length(z)) / log(bailout)) / log(exponent);
          }
        };
        n += 1.0;
      }

      return -1.0;
    }
    `
);

extend({ Mandelbrot });

type MandelbrotImpl = Partial<typeof baseUniforms> &
  JSX.IntrinsicElements["shaderMaterial"];

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mandelbrot: MandelbrotImpl;
    }
  }
}

interface MandelbrotSceneProps extends Partial<MandelbrotImpl> {}

export const MandelbrotScene: FC<MandelbrotSceneProps> = (props) => {
  const size = useThree((state) => state.size);
  const dpr = useThree((state) => state.viewport.dpr);
  const ref = useRef<MandelbrotImpl>(null!);

  return (
    <ScreenQuad>
      <mandelbrot
        ref={ref as any}
        {...props}
        resolution={[size.width * dpr, size.height * dpr]}
      />
    </ScreenQuad>
  );
};
