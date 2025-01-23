import addImg from "../assets/add.png"
import closeImg from "../assets/close.png"
import deleteImg from "../assets/delete.png"
import downloadImg from "../assets/download.png"
import eraserImg from "../assets/eraser.png"
import menuImg from "../assets/menu.png"
import newImg from "../assets/new.png"
import openImg from "../assets/open.png"
import penImg from "../assets/pen.png"
import renameImg from "../assets/rename.png"
import saveImg from "../assets/save.png"
import saveasImg from "../assets/saveas.png"
import selectImg from "../assets/select.png"

export type IconType = "add" | "close" | "delete" | "download" | "eraser" | "menu" | "new" | "open" | "pen" | "rename" | "save" | "saveas" | "select"

export const getIcon = (icon: IconType): string => {
  switch (icon) {
    case "add":  return addImg
    case "close": return closeImg
    case "delete": return deleteImg
    case "download": return downloadImg
    case "eraser": return eraserImg
    case "menu": return menuImg
    case "new": return newImg
    case "open": return openImg
    case "pen": return penImg
    case "rename": return renameImg
    case "save": return saveImg
    case "saveas": return saveasImg
    case "select": return selectImg
  }
}
