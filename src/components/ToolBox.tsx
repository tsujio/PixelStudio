import { useDrawContext, DrawTool } from "./DrawContext";
import { ToolBoxPenOptions } from "./ToolBoxPenOptions";
import { ToolBoxEraserOptions } from "./ToolBoxEraserOptions";
import { ToolBoxSelectOptions } from "./ToolBoxSelectOptions";
import { ToolBoxCanvasOptions } from "./ToolBoxCanvasOptions";
import { Palette } from "./Palette";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import { useEffect, useRef, useState } from "react";

const tools = [
  { type: "pen", icon: "pen" },
  { type: "eraser", icon: "eraser" },
  { type: "select", icon: "select" },
  { type: "color", icon: "color" },
  { type: "canvas", icon: "canvas" },
  { type: "history", icon: "history" },
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
};

export const width = 330;

export function ToolBox(props: Props) {
  const { drawContext, changeTool } = useDrawContext();

  const onToolChange = (tool: DrawTool) => () => {
    changeTool(tool);
  };

  const [pinned, setPinned] = useState(props.open);

  if (!props.open && pinned) {
    setPinned(false);
  }

  const onPinClick = () => {
    setPinned((pinned) => !pinned);
  };

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (props.open) {
      const handler = (e: PointerEvent) => {
        if (!pinned && ref.current) {
          const rect = ref.current.getBoundingClientRect();
          if (e.pageX < rect.left || rect.right < e.pageX || e.pageY < rect.top || rect.bottom < e.pageY) {
            props.onClose();
          }
        }
      };
      document.addEventListener("pointerdown", handler);
      return () => {
        document.removeEventListener("pointerdown", handler);
      };
    }
  }, [props.open, pinned]);

  return (
    <div
      ref={ref}
      style={{
        width: props.open ? `${width}px` : 0,
        height: "fit-content",
        position: "absolute",
        top: 0,
        right: 0,
        overflow: "hidden",
        boxShadow: "0 0 8px 0 gray",
        zIndex: 9999,
        background: "white",
      }}
    >
      <IconButton
        icon="pin"
        size="small"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          background: pinned ? "gainsboro" : undefined,
        }}
        onClick={onPinClick}
      />
      <div style={{ padding: "12px 12px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "8px",
            paddingRight: "36px",
            marginBottom: "18px",
          }}
        >
          {tools.map((tool) => (
            <div
              key={tool.type}
              onClick={onToolChange(tool.type)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: drawContext.tool === tool.type ? "4px solid gray" : "none",
                borderRadius: "4px",
                aspectRatio: "1 / 1",
              }}
            >
              <Icon icon={tool.icon} />
            </div>
          ))}
        </div>
        {drawContext.tool === "pen" && <ToolBoxPenOptions />}
        {drawContext.tool === "eraser" && <ToolBoxEraserOptions />}
        {drawContext.tool === "select" && <ToolBoxSelectOptions />}
        {drawContext.tool === "canvas" && <ToolBoxCanvasOptions />}
        <div style={{ marginTop: "8px" }}>
          <Palette />
        </div>
      </div>
    </div>
  );
}
