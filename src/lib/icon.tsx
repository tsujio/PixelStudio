import addImg from "../assets/add.png"
import closeImg from "../assets/close.png"
import deleteImg from "../assets/delete.png"
import downloadImg from "../assets/download.png"
import eraserImg from "../assets/eraser.png"
import hamburgerImg from "../assets/hamburger.png"
import menuImg from "../assets/menu.png"
import newImg from "../assets/new.png"
import openImg from "../assets/open.png"
import penImg from "../assets/pen.png"
import pinImg from "../assets/pin.png"
import redoImg from "../assets/redo.png"
import renameImg from "../assets/rename.png"
import saveImg from "../assets/save.png"
import saveasImg from "../assets/saveas.png"
import selectImg from "../assets/select.png"
import undoImg from "../assets/undo.png"
import zoominImg from "../assets/zoomin.png"
import zoomoutImg from "../assets/zoomout.png"

export type IconType = "add" | "close" | "delete" | "download" | "eraser" | "hamburger" | "menu" | "new" | "open" | "pen" | "pin" | "redo" | "rename" | "save" | "saveas" | "select" | "undo" | "zoomin" | "zoomout"

export const getIcon = (icon: IconType): string => {
  switch (icon) {
    case "add":  return addImg
    case "close": return closeImg
    case "delete": return deleteImg
    case "download": return downloadImg
    case "eraser": return eraserImg
    case "hamburger": return hamburgerImg
    case "menu": return menuImg
    case "new": return newImg
    case "open": return openImg
    case "pen": return penImg
    case "pin": return pinImg
    case "redo": return redoImg
    case "rename": return renameImg
    case "save": return saveImg
    case "saveas": return saveasImg
    case "select": return selectImg
    case "undo": return undoImg
    case "zoomin": return zoominImg
    case "zoomout": return zoomoutImg
  }
}
