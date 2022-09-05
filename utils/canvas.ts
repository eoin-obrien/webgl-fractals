export const downloadCanvas = (canvas: HTMLCanvasElement, title: string) => {
  const link = document.createElement("a");
  link.download = title;
  link.href = canvas.toDataURL();

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
};
