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

const MagnetType1 = shaderMaterial(
  {
    ...baseUniforms,
  },
  baseVertexShader,
  /*glsl*/ `
    ${baseFragmentShader}

    float render(vec2 point) {
      vec2 c = isJulia ? parameter : point;
      vec2 z = isJulia ? point : parameter;

      float n = 0.0;
      for( int i=0; i<maxIterations; i++ )
      {
        z = c_pow(c_div(
          c_pow(z, 2.0) + c - c_one(),
          2.0 * z + c - 2.0 * c_one()
        ), exponent);
        if( length(z) > bailout || c_eq(z, c_one(), epsilon) ) {
          return n;
        };
        n += 1.0;
      }

      return -1.0;
    }
    `
);

extend({ MagnetType1 });

type MagnetType1Impl = Partial<typeof baseUniforms> &
  JSX.IntrinsicElements["shaderMaterial"];

declare global {
  namespace JSX {
    interface IntrinsicElements {
      magnetType1: MagnetType1Impl;
    }
  }
}

interface MagnetType1SceneProps extends Partial<MagnetType1Impl> {}

export const MagnetType1Scene: FC<MagnetType1SceneProps> = (props) => {
  const size = useThree((state) => state.size);
  const dpr = useThree((state) => state.viewport.dpr);
  const ref = useRef<MagnetType1Impl>(null!);

  return (
    <ScreenQuad>
      <magnetType1
        ref={ref as any}
        {...props}
        resolution={[size.width * dpr, size.height * dpr]}
      />
    </ScreenQuad>
  );
};
