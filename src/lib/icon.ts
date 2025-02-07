import addImg from "../assets/add.png";
import canvasImg from "../assets/canvas.png";
import checkImg from "../assets/check.png";
import closeImg from "../assets/close.png";
import colorImg from "../assets/color.png";
import deleteImg from "../assets/delete.png";
import downImg from "../assets/down.png";
import downloadImg from "../assets/download.png";
import eraserImg from "../assets/eraser.png";
import hamburgerImg from "../assets/hamburger.png";
import historyImg from "../assets/history.png";
import leftImg from "../assets/left.png";
import menuImg from "../assets/menu.png";
import newImg from "../assets/new.png";
import openImg from "../assets/open.png";
import penImg from "../assets/pen.png";
import pinImg from "../assets/pin.png";
import redoImg from "../assets/redo.png";
import renameImg from "../assets/rename.png";
import rightImg from "../assets/right.png";
import saveImg from "../assets/save.png";
import saveasImg from "../assets/saveas.png";
import selectImg from "../assets/select.png";
import undoImg from "../assets/undo.png";
import upImg from "../assets/up.png";
import zoominImg from "../assets/zoomin.png";
import zoomoutImg from "../assets/zoomout.png";

export type IconType =
  | "add"
  | "canvas"
  | "check"
  | "close"
  | "color"
  | "delete"
  | "down"
  | "download"
  | "eraser"
  | "hamburger"
  | "history"
  | "left"
  | "menu"
  | "new"
  | "open"
  | "pen"
  | "pin"
  | "redo"
  | "rename"
  | "right"
  | "save"
  | "saveas"
  | "select"
  | "undo"
  | "up"
  | "zoomin"
  | "zoomout";

export const getIcon = (icon: IconType): string => {
  switch (icon) {
    case "add":
      return addImg;
    case "canvas":
      return canvasImg;
    case "check":
      return checkImg;
    case "close":
      return closeImg;
    case "color":
      return colorImg;
    case "delete":
      return deleteImg;
    case "down":
      return downImg;
    case "download":
      return downloadImg;
    case "eraser":
      return eraserImg;
    case "hamburger":
      return hamburgerImg;
    case "history":
      return historyImg;
    case "left":
      return leftImg;
    case "menu":
      return menuImg;
    case "new":
      return newImg;
    case "open":
      return openImg;
    case "pen":
      return penImg;
    case "pin":
      return pinImg;
    case "redo":
      return redoImg;
    case "rename":
      return renameImg;
    case "right":
      return rightImg;
    case "save":
      return saveImg;
    case "saveas":
      return saveasImg;
    case "select":
      return selectImg;
    case "undo":
      return undoImg;
    case "up":
      return upImg;
    case "zoomin":
      return zoominImg;
    case "zoomout":
      return zoomoutImg;
  }
};
