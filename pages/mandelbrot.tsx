import { ScreenQuad, shaderMaterial } from '@react-three/drei'
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { FC, useRef } from 'react'
import { Vector2 } from 'three'
import styles from '../styles/Home.module.css'

const Mandelbrot = shaderMaterial(
    { time: 0, resolution: new Vector2(), maxIterations: 100, gamma: 1, center: new Vector2(), zoom: 1 },
    `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
      `,
    `
      uniform float time;
      uniform vec2 resolution;
      uniform vec2 center;
      uniform float zoom;
      uniform float gamma;
      uniform int maxIterations;
  
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
      
      void main() {
        float scale = zoom / min(resolution.x, resolution.y);
        vec2 p = center + (gl_FragCoord.xy - 0.5 * resolution) * scale;
  
        float i = mandelbrot(p);
  
        //if (i < float(maxIterations)) {
          float normalized = pow(i, gamma);
          // gl_FragColor = vec4(vec3(pow(normalized, gamma)), 1.0);
          gl_FragColor = vec4(palette(normalized, vec3(0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5), vec3(1.0, 1.0, 1.0),	vec3(0.00, 0.33, 0.67)), 1.0);
          gl_FragColor = vec4(palette(normalized, vec3(0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5), vec3(1.0, 1.0, 1.0),	vec3(0.20, 0.10, 0.00)), 1.0);
        //} else {
        //  gl_FragColor = vec4(vec3(0.0), 1.0);
        //}
      }
      `
)

extend({ Mandelbrot })

type MandelbrotImpl = {
    resolution: number[]
    center?: number[]
    zoom?: number
    gamma?: number
    maxIterations?: number
} & JSX.IntrinsicElements['shaderMaterial']

declare global {
    namespace JSX {
        interface IntrinsicElements {
            mandelbrot: MandelbrotImpl
        }
    }
}

const Scene: FC = () => {
    const size = useThree((state) => state.size);
    const dpr = useThree((state) => state.viewport.dpr);
    const ref = useRef<MandelbrotImpl>(null!)
    useFrame((state) => {
        if (ref.current.uniforms) {
            ref.current.uniforms.time.value = state.clock.elapsedTime
        }
    })
    const controls = useControls({
        gamma: 1,
        maxIterations: 100,
    })

    return (
        <ScreenQuad>
            <mandelbrot
                ref={ref as any}
                {...controls}
                zoom={3}
                resolution={[size.width * dpr, size.height * dpr]} />
        </ScreenQuad>
    );
}

const MandelbrotPage: NextPage = () => {
    return (
        <Canvas flat linear dpr={1}>
            <Scene />
        </Canvas>
    )
}

export default MandelbrotPage
