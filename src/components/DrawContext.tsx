import React, { createContext, useContext, useReducer, useMemo, useCallback } from "react";
import { Color, RGBColor } from "../lib/color";
import { DrawingData, DrawingDataPosition, DrawingDataRect } from "../lib/drawing";
import { Project } from "../lib/project";

export type DrawTool = "pen" | "eraser" | "select" | "color" | "canvas" | "history";

type DrawContext = {
  tool: DrawTool;
  pen: {
    color: Color;
    setPalette: boolean;
  };
  eraser: {};
  select: {
    area?: {
      drawingId: string;
      rect: DrawingDataRect;
    };
  };
  clipboard: ClipboardValue;
};

type ClipboardValue = {
  type: "data";
  data: DrawingData;
} | null;

type DrawContextValue = {
  drawContext: DrawContext;
  changeTool: (tool: DrawTool) => void;
  changePenColor: (color: Color) => void;
  changePenSetPalette: (setPalette: boolean) => void;
  startSelectArea: (drawingId: string, position: DrawingDataPosition) => void;
  expandSelectArea: (drawingId: string, position: DrawingDataPosition) => void;
  copySelectArea: (project: Project) => void;
  clearSelectArea: (drawingId: string) => void;
};

const initialDrawContext: DrawContext = {
  tool: "pen",
  pen: {
    color: new RGBColor([0, 0, 0]),
    setPalette: false,
  },
  eraser: {},
  select: {},
  clipboard: null,
};

type Action =
  | {
      type: "changeTool";
      tool: DrawTool;
    }
  | {
      type: "changePenColor";
      color: Color;
    }
  | {
      type: "changePenSetPalette";
      setPalette: boolean;
    }
  | {
      type: "startSelectArea";
      drawingId: string;
      position: DrawingDataPosition;
    }
  | {
      type: "expandSelectArea";
      drawingId: string;
      position: DrawingDataPosition;
    }
  | {
      type: "copySelectArea";
      project: Project;
    }
  | {
      type: "clearSelectArea";
      drawingId: string;
    };

const reducer = (drawContext: DrawContext, action: Action) => {
  switch (action.type) {
    case "changeTool": {
      return {
        ...drawContext,
        tool: action.tool,
      };
    }
    case "changePenColor": {
      return {
        ...drawContext,
        pen: {
          ...drawContext.pen,
          color: action.color,
        },
      };
    }
    case "changePenSetPalette": {
      return {
        ...drawContext,
        pen: {
          ...drawContext.pen,
          setPalette: action.setPalette,
        },
      };
    }
    case "startSelectArea": {
      return {
        ...drawContext,
        select: {
          ...drawContext.select,
          area: {
            drawingId: action.drawingId,
            rect: {
              start: { ...action.position },
              end: { ...action.position },
            },
          },
        },
      };
    }
    case "expandSelectArea": {
      const area = drawContext.select.area;
      if (area === undefined || area.drawingId !== action.drawingId) {
        drawContext = reducer(drawContext, {
          type: "startSelectArea",
          drawingId: action.drawingId,
          position: action.position,
        });
      }
      return {
        ...drawContext,
        select: {
          ...drawContext.select,
          area: {
            ...drawContext.select.area!,
            rect: {
              ...drawContext.select.area!.rect,
              end: { ...action.position },
            },
          },
        },
      };
    }
    case "copySelectArea": {
      if (!drawContext.select.area) {
        return {
          ...drawContext,
          clipboard: null,
        };
      }
      const drawing = action.project.getDrawing(drawContext.select.area.drawingId);
      const { start, end } = drawContext.select.area.rect;
      const top = Math.min(start.rowIndex, end.rowIndex);
      const left = Math.min(start.columnIndex, end.columnIndex);
      const bottom = Math.max(start.rowIndex, end.rowIndex);
      const right = Math.max(start.columnIndex, end.columnIndex);
      const data = drawing.data
        .filter((_, i) => top <= i && i <= bottom)
        .map((row) => row.filter((_, j) => left <= j && j <= right));
      return {
        ...drawContext,
        clipboard: {
          type: "data" as const,
          data,
        },
      };
    }
    case "clearSelectArea": {
      return {
        ...drawContext,
        select: {
          ...drawContext.select,
          area: undefined,
        },
      };
    }
  }
};

const ReactDrawContext = createContext<DrawContextValue | null>(null);

type Props = {
  children: React.ReactNode;
};

export const DrawContextProvider = (props: Props) => {
  const [drawContext, updateDrawContext] = useReducer(reducer, initialDrawContext);

  const changeTool = useCallback((tool: DrawTool) => updateDrawContext({ type: "changeTool", tool }), []);
  const changePenColor = useCallback((color: Color) => updateDrawContext({ type: "changePenColor", color }), []);
  const changePenSetPalette = useCallback(
    (setPalette: boolean) => updateDrawContext({ type: "changePenSetPalette", setPalette }),
    [],
  );
  const startSelectArea = useCallback(
    (drawingId: string, position: DrawingDataPosition) =>
      updateDrawContext({ type: "startSelectArea", drawingId, position }),
    [],
  );
  const expandSelectArea = useCallback(
    (drawingId: string, position: DrawingDataPosition) =>
      updateDrawContext({ type: "expandSelectArea", drawingId, position }),
    [],
  );
  const copySelectArea = useCallback((project: Project) => updateDrawContext({ type: "copySelectArea", project }), []);
  const clearSelectArea = useCallback(
    (drawingId: string) => updateDrawContext({ type: "clearSelectArea", drawingId }),
    [],
  );

  const contextValue = useMemo(
    () => ({
      drawContext,
      changeTool,
      changePenColor,
      changePenSetPalette,
      startSelectArea,
      expandSelectArea,
      copySelectArea,
      clearSelectArea,
    }),
    [
      drawContext,
      changeTool,
      changePenColor,
      changePenSetPalette,
      startSelectArea,
      expandSelectArea,
      copySelectArea,
      clearSelectArea,
    ],
  );

  return <ReactDrawContext.Provider value={contextValue}>{props.children}</ReactDrawContext.Provider>;
};

export const useDrawContext = () => {
  const value = useContext(ReactDrawContext);
  if (value === null) {
    throw new Error("Not in a draw context");
  }
  return value;
};
