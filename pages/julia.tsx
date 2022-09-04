import { Canvas } from "@react-three/fiber";
import { useGesture } from "@use-gesture/react";
import { useControls } from "leva";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Vector2Tuple } from "three";
import { JuliaScene } from "../shaders/julia";

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

const parseQueryFloat = (str?: string | string[]): number => {
  if (!str || !str.length) {
    return 0;
  }

  const float = parseFloat(Array.isArray(str) ? str[0] : str);
  return isNaN(float) ? 0 : float;
};

const JuliaPage: NextPage = () => {
  const router = useRouter();
  console.log(router.query);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [center, setCenter] = useState<[x: number, y: number]>([0, 0]);
  const [c, setC] = useState<[x: number, y: number]>([0, 0]);
  const [zoom, setZoom] = useState(0.3);

  useEffect(() => {
    setC([parseQueryFloat(router.query.cx), parseQueryFloat(router.query.cy)]);
  }, [router.query.cx, router.query.cy]);

  console.log(c);

  const bind = useGesture({
    onDrag: ({ active, delta, event }) => {
      if (canvasRef.current && active) {
        const { width, height } = canvasRef.current;
        const scale = getScale([width, height], zoom);
        if (event.ctrlKey) {
          setC(translate(c, delta, scale));
        } else {
          setCenter(translate(center, delta, scale));
        }
      }
    },
    onWheel: ({ active, direction, event }) => {
      if (canvasRef.current && active && direction[1] !== 0) {
        const { width, height } = canvasRef.current;
        const newZoom =
          direction[1] < 0 ? zoom * zoomFactor : zoom / zoomFactor;

        // Keep pixel under pointer steady while zooming
        const delta: Vector2Tuple = [
          event.clientX - width / 2,
          event.clientY - height / 2,
        ];
        const x = delta[0] * (1 - newZoom / zoom);
        const y = delta[1] * (1 - newZoom / zoom);
        const scale = getScale([width, height], newZoom);
        const newCenter = translate(center, [x, y], scale);

        setCenter(newCenter);
        setZoom(newZoom);
      }
    },
  });
  const controls = useControls({
    gamma: 0.2,
    maxIterations: 100,
    supersample: { value: 2, min: 1, max: 16, step: 1 },
  });
  return (
    <Canvas
      ref={canvasRef}
      linear
      flat
      frameloop="demand"
      style={{ touchAction: "none" }}
      {...bind()}
    >
      <JuliaScene {...controls} zoom={zoom} center={center} parameter={c} />
    </Canvas>
  );
};

export default JuliaPage;
