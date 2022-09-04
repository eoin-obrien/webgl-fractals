import { Canvas } from "@react-three/fiber";
import { useGesture } from "@use-gesture/react";
import * as React from "react";
import { FunctionComponent, PropsWithChildren } from "react";

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

type FractalCanvasProps = {
  children?: React.ReactNode;
};

const FractalCanvas: FunctionComponent<FractalCanvasProps> = ({ children }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
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
        const delta: Vector2Tuple = [
          event.clientX - width / 2,
          event.clientY - height / 2,
        ];
        const x = delta[0] * (1 - newZoom / zoom);
        const y = delta[1] * (1 - newZoom / zoom);
        const scale = getScale([width, height], newZoom);
        const newCenter = translate(center, [x, y], scale);

        set({ center: newCenter });
        set({ zoom: newZoom });
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
      gl={{ preserveDrawingBuffer: true }}
      style={{ touchAction: "none" }}
      {...bind()}
    >
      {children}
    </Canvas>
  );
};

export default FractalCanvas;
