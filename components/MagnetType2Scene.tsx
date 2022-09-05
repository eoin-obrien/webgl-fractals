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

const MagnetType2 = shaderMaterial(
  {
    ...baseUniforms,
  },
  baseVertexShader,
  /*glsl*/ `
    ${baseFragmentShader}

    float render(vec2 point) {
      vec2 c = isJulia ? parameter : point;
      vec2 z = isJulia ? point : parameter;

      // Precalculate constant expressions
      vec2 numeratorTerm = c_mul(c - c_one(), c - 2.0 * c_one());
      vec2 denominatorTerm = numeratorTerm + c_one();
      vec2 numeratorFactor = 3.0 * (c - c_one());
      vec2 denominatorFactor = 3.0 * (c - 2.0 * c_one());

      float n = 0.0;
      for( int i=0; i<maxIterations; i++ )
      {
        vec2 numerator = c_pow(z, 3.0)
          + c_mul(numeratorFactor, z)
          + numeratorTerm;
        vec2 denominator = 3.0 * c_pow(z, 2.0)
          + c_mul(denominatorFactor, z)
          + denominatorTerm;
        z = c_pow(c_div(numerator, denominator), exponent);
        if( length(z) > bailout || c_eq(z, c_one(), epsilon) ) {
          return n;
        };
        n += 1.0;
      }

      return -1.0;
    }
    `
);

extend({ MagnetType2 });

type MagnetType2Impl = Partial<typeof baseUniforms> &
  JSX.IntrinsicElements["shaderMaterial"];

declare global {
  namespace JSX {
    interface IntrinsicElements {
      magnetType2: MagnetType2Impl;
    }
  }
}

interface MagnetType2SceneProps extends Partial<MagnetType2Impl> {}

export const MagnetType2Scene: FC<MagnetType2SceneProps> = (props) => {
  const size = useThree((state) => state.size);
  const dpr = useThree((state) => state.viewport.dpr);
  const ref = useRef<MagnetType2Impl>(null!);

  return (
    <ScreenQuad>
      <magnetType2
        ref={ref as any}
        {...props}
        resolution={[size.width * dpr, size.height * dpr]}
      />
    </ScreenQuad>
  );
};
