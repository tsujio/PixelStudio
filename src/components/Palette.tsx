import { useDrawContext } from "./DrawContext";
import { useProjectContext } from "./ProjectContext";

export function Palette() {
  const { project, updateProject } = useProjectContext();
  const { drawContext, changePenColor } = useDrawContext();

  const onClick = (index: number) => () => {
    switch (drawContext.tool) {
      case "pen":
        if (drawContext.pen.setPalette) {
          updateProject({ type: "setPalette", index, color: drawContext.pen.color });
        } else if (index < project.palette.length && project.palette[index] !== null) {
          changePenColor(project.palette[index]);
        }
        break;
      case "eraser":
        updateProject({ type: "setPalette", index, color: null });
        break;
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
      }}
    >
      {project.palette.concat(Array(6 - (project.palette.length % 6)).fill(null)).map((color, i) => (
        <div
          key={i}
          onClick={onClick(i)}
          style={{
            height: "30px",
            boxSizing: "border-box",
            border: "1px solid lightgray",
            ...(color !== null
              ? {
                  background: color.toRGB().css,
                }
              : {
                  backgroundSize: "10px 10px",
                  backgroundImage: "repeating-conic-gradient(from 0deg, lightgray 0deg 90deg, #fff 90deg 180deg)",
                  backgroundRepeat: "repeat",
                }),
          }}
        />
      ))}
    </div>
  );
}
