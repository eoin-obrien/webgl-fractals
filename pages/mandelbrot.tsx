import { Canvas } from "@react-three/fiber";
import { useGesture } from "@use-gesture/react";
import { button, useControls } from "leva";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { Ref, useRef, useState } from "react";
import { Vector2Tuple } from "three";
import { MandelbrotScene } from "../shaders/mandelbrot";

const zoomFactor = 1.1;

const getScale = (resolution: Vector2Tuple, zoom: number): number => {
  return 1.0 / zoom / Math.min(...resolution);
};

const translate = (
  point: Vector2Tuple,
  delta: Vector2Tuple,
  scale: number
): Vector2Tuple => {
  const scaledDelta = delta.map((value) => value * scale);
  return [point[0] - scaledDelta[0], point[1] + scaledDelta[1]];
};

const saveCanvas = (canvas: HTMLCanvasElement, title: string) => {
  const link = document.createElement("a");
  link.download = title;
  link.href = canvas.toDataURL();

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
};

const MandelbrotPage: NextPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [controls, set] = useControls(() => ({
    parameter: [0, 0],
    center: [-0.5, 0],
    exponent: { value: 2.0, min: 1.0 },
    bailout: { value: 256, min: 0 },
    zoom: 0.3,
    paletteOffset: { value: 0, min: 0, max: 1 },
    gamma: { value: 0.2, step: 0.001 },
    maxIterations: { value: 100, min: 1, step: 1 },
    supersample: { value: 2, min: 1, max: 16, step: 1 },
    save: button((get) =>
      saveCanvas(
        canvasRef.current!,
        `Mandelbrot (${get("center")[0]},${get("center")[1]}).png`
      )
    ),
  }));
  const { center, zoom } = controls;
  const bind = useGesture({
    onDrag: ({ active, delta }) => {
      if (canvasRef.current && active) {
        const { width, height } = canvasRef.current;
        const scale = getScale([width, height], zoom);
        set({ center: translate(center, delta, scale) });
      }
    },
    onWheel: ({ active, direction, event }) => {
      if (canvasRef.current && active && direction[1] !== 0) {
        const { width, height } = canvasRef.current;
        const newZoom =
          direction[1] < 0 ? zoom * zoomFactor : zoom / zoomFactor;

        // Keep pixel under pointer steady while zooming
        const pixelDelta: Vector2Tuple = [
          event.clientX - width / 2,
          event.clientY - height / 2,
        ];
        const delta = pixelDelta.map(
          (value) => value * (1 - newZoom / zoom)
        ) as Vector2Tuple;
        const scale = getScale([width, height], newZoom);

        set({ center: translate(center, delta, scale), zoom: newZoom });
      }
    },
    onDoubleClick: ({ event }) => {
      if (canvasRef.current) {
        const { width, height } = canvasRef.current;
        const scale = getScale([width, height], zoom);
        const delta = [event.clientX - width / 2, event.clientY - height / 2];
        const scaledDelta = delta.map((value) => value * scale);
        const c = [scaledDelta[0] + center[0], scaledDelta[1] + center[1]];
        window.open(`/julia?cx=${c[0]}&cy=${c[1]}`, "_blank");
      }
    },
  });
  return (
    <Canvas
      ref={canvasRef}
      linear
      flat
      frameloop="demand"
      gl={{ precision: "highp", preserveDrawingBuffer: true }}
      style={{ touchAction: "none" }}
      {...bind()}
    >
      <MandelbrotScene {...controls} zoom={zoom} center={center} />
    </Canvas>
  );
};

export default MandelbrotPage;
