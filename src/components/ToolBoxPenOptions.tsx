import { useDrawContext } from "./DrawContext";
import { ColorPicker } from "./ColorPicker";
import { HSVColor } from "../lib/color";

export function ToolBoxPenOptions() {
  const { drawContext, changePenColor, changePenSetPalette } = useDrawContext();

  const onColorPanelClick = (color: HSVColor) => () => {
    changePenColor(color);
  };

  return (
    <div>
      <div style={{ marginTop: "8px" }}>
        <ColorPicker color={drawContext.pen.color} onColorPick={changePenColor} />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gridTemplateRows: "repeat(3, 20px)",
          gap: "4px",
          marginTop: "12px",
        }}
      >
        {[...Array(7)].map((_, i, array) => {
          const [h, s, v] = drawContext.pen.color.toHSV().hsv;
          const color = new HSVColor([h + (360 / (array.length - 1)) * (i - (array.length - 1) / 2), s, v]);
          return (
            <div
              key={"h-" + i}
              style={{
                background: color.css,
              }}
              onClick={onColorPanelClick(color)}
            />
          );
        })}
        {[...Array(7)].map((_, i, array) => {
          const [h, __, v] = drawContext.pen.color.toHSV().hsv;
          const color = new HSVColor([h, ((i + 1) / array.length) * 100, v]);
          return (
            <div
              key={"s-" + i}
              style={{
                background: color.css,
              }}
              onClick={onColorPanelClick(color)}
            />
          );
        })}
        {[...Array(7)].map((_, i, array) => {
          const [h, s, __] = drawContext.pen.color.toHSV().hsv;
          const color = new HSVColor([h, s, (1 - i / array.length) * 100]);
          return (
            <div
              key={"v-" + i}
              style={{
                background: color.css,
              }}
              onClick={onColorPanelClick(color)}
            />
          );
        })}
      </div>
      <div>
        <input
          type="checkbox"
          checked={drawContext.pen.setPalette}
          onChange={(e) => changePenSetPalette(e.target.checked)}
        />
      </div>
    </div>
  );
}
