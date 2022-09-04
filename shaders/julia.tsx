import { ScreenQuad, shaderMaterial } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { FC, useRef } from "react";
import { Vector2Tuple } from "three";
import { baseFragmentShader, baseUniforms, baseVertexShader } from "./utils";

const Julia = shaderMaterial(
  {
    ...baseUniforms,
  },
  baseVertexShader,
  /*glsl*/ `
    ${baseFragmentShader}

    float render(vec2 z) {
      float n = 0.0;
      vec2 c = parameter;
      for( int i=0; i<maxIterations; i++ )
      {
        z = c_mul(z, z) + c; // z = z² + c
        if( dot(z,z)>(bailout * bailout) ) {
          return n - log2(log2(dot(z,z))) + 4.0;
        };
        n += 1.0;
      }

      return -1.0;
    }
    `
);

extend({ Julia });

type JuliaImpl = Partial<typeof baseUniforms> &
  JSX.IntrinsicElements["shaderMaterial"];

declare global {
  namespace JSX {
    interface IntrinsicElements {
      julia: JuliaImpl;
    }
  }
}

interface JuliaSceneProps extends Partial<JuliaImpl> {}

export const JuliaScene: FC<JuliaSceneProps> = (props) => {
  const size = useThree((state) => state.size);
  const dpr = useThree((state) => state.viewport.dpr);
  const ref = useRef<JuliaImpl>(null!);

  return (
    <ScreenQuad>
      <julia
        ref={ref as any}
        {...props}
        resolution={[size.width * dpr, size.height * dpr]}
      />
    </ScreenQuad>
  );
};
