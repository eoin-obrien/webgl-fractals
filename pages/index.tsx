import { Canvas } from "@react-three/fiber";
import { useGesture } from "@use-gesture/react";
import { button, Leva, useControls } from "leva";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { Component, FunctionComponent, Ref, useRef, useState } from "react";
import { Vector2Tuple } from "three";
import { MandelbrotScene } from "../shaders/mandelbrot";
import { baseUniforms } from "../shaders/utils";
import { downloadCanvas } from "../utils/canvas";
import {
  getScale,
  translate,
  deltaFromEvent,
  scalePoint,
} from "../utils/point";

const zoomFactor = 1.1;

const defaultZoom = 0.3;
const defaultCenter: Vector2Tuple = [0, 0];
const defaultParameter: Vector2Tuple = [0, 0];

interface NamedFractal {
  name: string;
  fractal: FunctionComponent<
    Partial<typeof baseUniforms> & JSX.IntrinsicElements["shaderMaterial"]
  >;
}

const fractalOptions: Record<string, NamedFractal> = {
  Mandelbrot: { name: "Mandelbrot", fractal: MandelbrotScene },
};

const FractalPage: NextPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [controls, set] = useControls(() => ({
    algorithm: { options: fractalOptions },
    isJulia: { value: false },
    parameter: { value: defaultParameter, step: 0.01 },
    center: { value: defaultCenter, step: 0.01 },
    exponent: { value: 2.0, min: 1.0 },
    bailout: { value: 256, min: 0 },
    zoom: { value: defaultZoom },
    maxIterations: { value: 100, min: 1, step: 1 },
    supersample: { value: 2, min: 1, max: 16, step: 1 },
    save: button((get) => {
      const key = get("julia") ? "julia" : "mandelbrot";
      let name = get("fractal").name;
      if (get("isJulia")) {
        name += " Julia";
      }
      const center = `(${get("center")[0]},${get("center")[1]})`;
      const parameter = `(${get("parameter")[0]},${get("parameter")[1]})`;
      return downloadCanvas(
        canvasRef.current!,
        `${name} ${parameter} ${center}.png`
      );
    }),
  }));
  const { algorithm, isJulia, parameter, center, zoom } = controls;

  const paletteControls = useControls(
    "Palette",
    {
      paletteOffset: { value: 0, min: 0, max: 1, step: 0.01, label: "offset" },
      gamma: { value: 0.2, step: 0.001 },
      paletteA: { value: [0.5, 0.5, 0.5] },
      paletteB: { value: [0.5, 0.5, 0.5] },
      paletteC: { value: [1.0, 1.0, 1.0] },
      paletteD: { value: [0.2, 0.1, 0.0] },
    },
    { collapsed: false }
  );

  const bind = useGesture({
    onDrag: ({ active, delta, ctrlKey }) => {
      // Convert delta from screen axes to complex plane
      delta[0] *= -1;
      if (canvasRef.current && active) {
        const { width, height } = canvasRef.current;
        const scale = getScale([width, height], zoom);
        if (ctrlKey) {
          set({ parameter: translate(parameter, delta, scale) });
        } else {
          set({ center: translate(center, delta, scale) });
        }
      }
    },
    onWheel: ({ active, direction, event }) => {
      if (canvasRef.current && active && direction[1] !== 0) {
        const { width, height } = canvasRef.current;
        const newZoom = zoom * Math.pow(zoomFactor, -Math.sign(direction[1]));

        // Keep pixel under pointer steady while zooming
        const scale = getScale([width, height], newZoom) * (newZoom / zoom - 1);
        const delta = deltaFromEvent(event, [width, height]);
        set({ center: translate(center, delta, scale), zoom: newZoom });
      }
    },
    onDoubleClick: ({ event }) => {
      if (canvasRef.current) {
        const { width, height } = canvasRef.current;
        const scale = getScale([width, height], zoom);
        const delta = deltaFromEvent(event, [width, height], scale);
        const c = translate(delta, center);
        // TODO cache old values
        set({
          isJulia: !isJulia,
          parameter: isJulia ? defaultParameter : c,
          center: defaultCenter,
          zoom: defaultZoom,
        });
      }
    },
  });

  const Fractal = algorithm.fractal;

  return (
    <>
      <Leva />
      <Canvas
        ref={canvasRef}
        linear
        flat
        frameloop="demand"
        gl={{ precision: "highp", preserveDrawingBuffer: true }}
        style={{ touchAction: "none" }}
        {...bind()}
      >
        <Fractal
          {...controls}
          {...paletteControls}
          zoom={zoom}
          center={center}
        />
      </Canvas>
    </>
  );
};

export default FractalPage;
