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

const Tricorn = shaderMaterial(
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
        z = c_pow(c_conj(z), exponent) + c;
        if( length(z) > bailout ) {
          return n - log(log(length(z)) / log(bailout)) / log(exponent);
        };
        n += 1.0;
      }

      return -1.0;
    }
    `
);

extend({ Tricorn });

type TricornImpl = Partial<typeof baseUniforms> &
  JSX.IntrinsicElements["shaderMaterial"];

declare global {
  namespace JSX {
    interface IntrinsicElements {
      tricorn: TricornImpl;
    }
  }
}

interface TricornSceneProps extends Partial<TricornImpl> {}

export const TricornScene: FC<TricornSceneProps> = (props) => {
  const size = useThree((state) => state.size);
  const dpr = useThree((state) => state.viewport.dpr);
  const ref = useRef<TricornImpl>(null!);

  return (
    <ScreenQuad>
      <tricorn
        ref={ref as any}
        {...props}
        resolution={[size.width * dpr, size.height * dpr]}
      />
    </ScreenQuad>
  );
};
