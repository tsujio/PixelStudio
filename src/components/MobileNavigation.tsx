import { useEffect, useRef, useState } from "react";
import { useDrawContext } from "./DrawContext";
import { Icon } from "./Icon";
import { useProjectContext } from "./ProjectContext";
import { useWindowContext } from "./WindowContext";
import { HSVColor } from "../lib/color";

export const MobileNavigation = () => {
  const { updateProject, projectHistory } = useProjectContext();
  const { windowSize } = useWindowContext();
  const { drawContext, changeTool, changePenColor } = useDrawContext();

  const onUndoButtonClick = () => {
    updateProject({ type: "undo" });
  };

  const onRedoButtonClick = () => {
    updateProject({ type: "redo" });
  };

  const onPenButtonClick = () => {
    if (drawContext.tool !== "pen") {
      changeTool("pen");
    } else {
      changeTool("eraser");
    }
  };

  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const onColorButtonClick = () => {
    setColorPickerOpen((colorPickerOpen) => !colorPickerOpen);
  };

  const onColorPickerClick = (color: HSVColor) => () => {
    changePenColor(color);
    changeTool("pen");
    setColorPickerOpen(false);
  };

  const colorPickerRef = useRef<HTMLDivElement>(null);
  const colorPickerButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (colorPickerOpen) {
      const handler = (e: PointerEvent) => {
        if (colorPickerButtonRef.current) {
          const rect = colorPickerButtonRef.current.getBoundingClientRect();
          if (rect.left <= e.pageX && e.pageX <= rect.right && rect.top <= e.pageY && e.pageY <= rect.bottom) {
            // Ignore if the point is on the color picker button (will be closed by onclick handler)
            return;
          }
        }
        if (colorPickerRef.current) {
          const rect = colorPickerRef.current.getBoundingClientRect();
          if (e.pageX < rect.left || rect.right < e.pageX || e.pageY < rect.top || rect.bottom < e.pageY) {
            setColorPickerOpen(false);
          }
        }
      };
      document.addEventListener("pointerdown", handler);
      return () => {
        document.removeEventListener("pointerdown", handler);
      };
    }
  }, [colorPickerOpen]);

  if (windowSize.type !== "mobile") {
    return null;
  }

  const canUndo = projectHistory.current > 0;
  const canRedo = projectHistory.current < projectHistory.history.length - 1;

  const buttons = [
    {
      icon: <Icon icon="undo" style={{ opacity: !canUndo ? 0.3 : undefined }} />,
      handler: canUndo ? onUndoButtonClick : undefined,
    },
    {
      icon: <Icon icon="redo" style={{ opacity: !canRedo ? 0.3 : undefined }} />,
      handler: canRedo ? onRedoButtonClick : undefined,
    },
    {
      icon: (
        <>
          {(["pen", "eraser"] as const).map((tool) => {
            const active =
              (tool === "eraser" && drawContext.tool === tool) || (tool === "pen" && drawContext.tool !== "eraser");
            return (
              <Icon
                key={tool}
                icon={tool}
                size={active ? "medium" : "small"}
                style={{
                  transitionProperty: "width, opacity",
                  transitionDuration: "0.1s",
                  opacity: drawContext.tool !== tool ? 0.3 : 1.0,
                  ...(!active && {
                    position: "absolute",
                    top: 12,
                    right: 8,
                  }),
                }}
              />
            );
          })}
        </>
      ),
      handler: onPenButtonClick,
    },
    {
      icon: (
        <div
          style={{
            background: drawContext.pen.color.css,
            width: "36px",
            height: "24px",
            boxSizing: "border-box",
            border: "1px solid gray",
            borderRadius: "2px",
          }}
        />
      ),
      handler: onColorButtonClick,
      ref: colorPickerButtonRef,
    },
  ];

  const colors = [...Array(12)].map((_, i, rows) =>
    [...Array(5)].map((_, j, columns) => {
      const [rowCount, columnCount] = [rows.length, columns.length];
      let h: number, s: number, v: number;
      if (i === 0) {
        h = 0;
        s = 0;
        v = Math.round((100 / (columnCount - 1)) * (columnCount - (j + 1)));
      } else {
        h = Math.round((360 / (rowCount - 1)) * (i - 1));
        s = Math.round(Math.min((100 / Math.ceil(columnCount / 2)) * (j + 1), 100));
        v = Math.round(Math.min((100 / Math.ceil(columnCount / 2)) * (columnCount - j), 100));
      }
      return new HSVColor([h, s, v]);
    }),
  );

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 9998,
        display: "grid",
        gridTemplateColumns: `repeat(${buttons.length}, 1fr)`,
        placeItems: "center",
        height: "56px",
        width: "100%",
        background: "whitesmoke",
        bottom: 0,
        left: 0,
        borderTop: "2px solid lightgray",
      }}
    >
      {buttons.map(({ icon, handler, ref }, i) => (
        <div
          key={i}
          ref={ref}
          style={{
            display: "grid",
            placeItems: "center",
            width: "min(100%, 96px)",
            height: "100%",
            cursor: handler ? "pointer" : undefined,
            boxSizing: "border-box",
            position: "relative",
          }}
          onClick={handler}
        >
          {icon}
        </div>
      ))}
      <div
        ref={colorPickerRef}
        style={{
          position: "absolute",
          top: colorPickerOpen ? -600 : 0,
          right: 0,
          background: "white",
          width: colorPickerOpen ? "350px" : 0,
          height: colorPickerOpen ? "600px" : 0,
          transitionProperty: "width, height, top",
          transitionDuration: "50ms",
          display: "grid",
          gridTemplateColumns: `repeat(${colors[0].length}, 1fr)`,
          gridTemplateRows: `repeat(${colors.length}, 1fr)`,
        }}
      >
        {colors.flat().map((color) => {
          const [h, s, v] = color.hsv;
          return (
            <div
              key={color.css}
              style={{
                background: color.css,
                ...(drawContext.pen.color.equalTo(color) && {
                  border: `2px solid ${(s < 50 && v > 70) || (30 <= h && h <= 190 && v > 70) ? "black" : "white"}`,
                  borderRadius: "2px",
                }),
              }}
              onClick={onColorPickerClick(color)}
            />
          );
        })}
      </div>
    </div>
  );
};
