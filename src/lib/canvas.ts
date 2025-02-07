import React from "react";
import { DrawingData, DrawingDataPosition, DrawingDataRect } from "./drawing";
import { Color } from "./color";

export const getEventPosition = (e: React.PointerEvent | PointerEvent, canvas: HTMLCanvasElement): [number, number] => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  return [x, y];
};

export const convertToDrawingDataPosition = (x: number, y: number, pixelSize: number): DrawingDataPosition => {
  const columnIndex = Math.trunc(x / pixelSize);
  const rowIndex = Math.trunc(y / pixelSize);
  return { rowIndex, columnIndex };
};

export const interpolateEventPositions = (
  [x, y]: [number, number],
  [prevX, prevY]: [number, number],
  pixelSize: number,
) => {
  const positions: DrawingDataPosition[] = [];
  const [vx, vy] = [x - prevX, y - prevY];
  const norm = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2));
  const [nvx, nvy] = [vx / norm, vy / norm];
  for (let i = 1; i <= norm / pixelSize; i++) {
    const [px, py] = [prevX + nvx * pixelSize * i, prevY + nvy * pixelSize * i];
    const pos = convertToDrawingDataPosition(px, py, pixelSize);
    positions.push(pos);
  }
  const pos = convertToDrawingDataPosition(x, y, pixelSize);
  positions.push(pos);
  return positions;
};

export const applyMask = (data: DrawingData, mask: DrawingDataRect) => {
  const [rowCount, columnCount] = [data.length, data[0].length];
  const { start, end } = mask;

  if (start.rowIndex > 0) {
    data = data.slice(start.rowIndex);
  }
  if (start.rowIndex < 0) {
    data = [...Array(-start.rowIndex)].map(() => Array(data[0].length).fill(null)).concat(data);
  }
  if (start.columnIndex > 0) {
    data = data.map((row) => row.slice(start.columnIndex));
  }
  if (start.columnIndex < 0) {
    data = data.map((row) => Array(-start.columnIndex).fill(null).concat(row));
  }
  if (end.rowIndex > rowCount - 1) {
    data = data.concat([...Array(end.rowIndex - (rowCount - 1))].map(() => Array(data[0].length).fill(null)));
  }
  if (end.rowIndex < rowCount - 1) {
    data = data.slice(0, data.length - (rowCount - 1 - end.rowIndex));
  }
  if (end.columnIndex > columnCount - 1) {
    data = data.map((row) => row.concat(Array(end.columnIndex - (columnCount - 1)).fill(null)));
  }
  if (end.columnIndex < columnCount - 1) {
    data = data.map((row) => row.slice(0, data[0].length - (columnCount - 1 - end.columnIndex)));
  }

  return data;
};

export const clearCanvas = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

export const drawGridLines = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  rowCount: number,
  columnCount: number,
  pixelSize: number,
) => {
  ctx.strokeStyle = "gray";
  for (let i = 0; i < rowCount - 1; i++) {
    const y = pixelSize * (i + 1);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  for (let i = 0; i < columnCount - 1; i++) {
    const x = pixelSize * (i + 1);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
};

export const drawPixels = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  _: HTMLCanvasElement | OffscreenCanvas,
  data: DrawingData,
  pixelSize: number,
) => {
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      if (data[i][j] !== null) {
        ctx.fillStyle = data[i][j]!.css;
        ctx.fillRect(pixelSize * j, pixelSize * i, pixelSize, pixelSize);
      }
    }
  }
};

export const drawSelectArea = (
  ctx: CanvasRenderingContext2D,
  _: HTMLCanvasElement,
  rect: DrawingDataRect,
  pixelSize: number,
) => {
  const { start, end } = rect;
  const top = Math.min(start.rowIndex, end.rowIndex);
  const left = Math.min(start.columnIndex, end.columnIndex);
  const height = Math.max(start.rowIndex, end.rowIndex) - top + 1;
  const width = Math.max(start.columnIndex, end.columnIndex) - left + 1;
  ctx.strokeStyle = "green";
  ctx.strokeRect(pixelSize * left, pixelSize * top, pixelSize * width, pixelSize * height);
};

const optimizeRects = (data: DrawingData) => {
  const ret: { x: number; y: number; width: number; height: number; color: Color }[] = [];

  const toKey = (i: number, j: number) => `${i}-${j}`;
  const toIndices = (key: string) => [parseInt(key.split("-")[0]), parseInt(key.split("-")[1])] as [number, number];

  const map = Object.fromEntries(
    data
      .map((row, i) => row.map((color, j) => [toKey(i, j), color] as const))
      .flat()
      .filter(([_, color]) => color !== null) as [string, Color][],
  );

  while (Object.keys(map).length > 0) {
    const i = Math.min(...Object.keys(map).map((k) => toIndices(k)[0]));
    const j = Math.min(
      ...Object.keys(map)
        .filter((k) => toIndices(k)[0] === i)
        .map((k) => toIndices(k)[1]),
    );

    const jOffsets: number[] = [];
    for (let io = 0; i + io < data.length; io++) {
      let jo = 0;
      while (
        j + jo < data[i + io].length &&
        map[toKey(i, j)].equalTo(map[toKey(i + io, j + jo)]) &&
        (jOffsets.length === 0 || jo <= jOffsets[jOffsets.length - 1])
      ) {
        jo++;
      }
      if (jo > 0) {
        jOffsets.push(jo - 1);
      } else {
        break;
      }
    }

    const areas = jOffsets.map((jo, io) => (io + 1) * (jo + 1));
    const maxAreaIndex = areas.findIndex((area) => area === Math.max(...areas));
    ret.push({
      x: j,
      y: i,
      width: jOffsets[maxAreaIndex] + 1,
      height: maxAreaIndex + 1,
      color: map[toKey(i, j)],
    });

    for (let io = 0; io <= maxAreaIndex; io++) {
      for (let jo = 0; jo <= jOffsets[maxAreaIndex]; jo++) {
        delete map[toKey(i + io, j + jo)];
      }
    }
  }

  return ret;
};

export const generateSVG = (data: DrawingData, optimize?: boolean) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${data[0].length} ${data.length}`);

  const rects = optimize
    ? optimizeRects(data)
    : data
        .map((row, i) =>
          row.map((color, j) => ({
            x: j,
            y: i,
            width: 1,
            height: 1,
            color,
          })),
        )
        .flat();

  rects.forEach(({ x, y, width, height, color }) => {
    if (color) {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x.toString());
      rect.setAttribute("y", y.toString());
      rect.setAttribute("width", width.toString());
      rect.setAttribute("height", height.toString());
      rect.setAttribute("fill", color.css);
      svg.appendChild(rect);
    }
  });
  return svg;
};
