import { applyMask } from "./canvas";
import { Color } from "./color";

export class Drawing {
  #id: string;
  #name: string;
  #data: DrawingData;
  #pixelSize: number;

  constructor(id: string, name: string, data: DrawingData, pixelSize: number) {
    this.#id = id;
    this.#name = name;
    this.#data = data;
    this.#pixelSize = pixelSize;
  }

  static create(name: string, rowCount?: number, columnCount?: number, pixelSize?: number): Drawing {
    const id = crypto.randomUUID();

    rowCount = rowCount ?? 48;
    columnCount = columnCount ?? 64;
    pixelSize = pixelSize ?? 10;

    columnCount = Math.min(columnCount, Math.round(window.innerWidth / pixelSize) - 6);

    if (rowCount < 1 || columnCount < 1) {
      throw new Error("rowCount and columnCount should be positive");
    }

    const data: DrawingData = [];
    for (let i = 0; i < rowCount; i++) {
      const row: DrawingDataRow = [];
      for (let j = 0; j < columnCount; j++) {
        row.push(null);
      }
      data.push(row);
    }

    return new Drawing(id, name, data, pixelSize);
  }

  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }

  get data() {
    return this.#data;
  }

  get rowCount() {
    return this.#data.length;
  }

  get columnCount() {
    return this.#data[0].length;
  }

  get pixelSize() {
    return this.#pixelSize;
  }

  rename(newName: string) {
    this.#name = newName;
  }

  isValidPosition({ rowIndex, columnIndex }: DrawingDataPosition) {
    return 0 <= rowIndex && rowIndex < this.#data.length && 0 <= columnIndex && columnIndex < this.#data[0].length;
  }

  setPixel({ rowIndex, columnIndex }: DrawingDataPosition, color: DrawingDataPixel) {
    const before = this.#data[rowIndex][columnIndex];
    if (before === color) {
      return false;
    }
    this.#data[rowIndex][columnIndex] = color;
    return true;
  }

  trim({ start, end }: DrawingDataRect) {
    this.#data = this.#data
      .filter((_, i) => start.rowIndex <= i && i <= end.rowIndex)
      .map((row) => row.slice(start.columnIndex, end.columnIndex + 1));
  }

  resize({ start, end }: DrawingDataRect) {
    if (
      start.rowIndex === 0 &&
      start.columnIndex === 0 &&
      end.rowIndex === this.rowCount - 1 &&
      end.columnIndex === this.columnCount - 1
    ) {
      return false;
    } else {
      this.#data = applyMask(this.#data, { start, end });
      return true;
    }
  }

  setPixelSize(pixelSize: number) {
    this.#pixelSize = pixelSize;
  }

  clone() {
    const data = this.#data.map((row) => [...row]);
    const drawing = new Drawing(this.#id, this.#name, data, this.#pixelSize);
    return drawing;
  }

  toJSON() {
    return {
      id: this.#id,
      name: this.#name,
      data: this.#data,
      pixelSize: this.#pixelSize,
    };
  }

  static fromJSON(json: unknown) {
    if (typeof json !== "object" || json === null) {
      throw new Error(`Invalid drawing data: expected=object, got=${json !== null ? typeof json : json}`);
    }
    if (!("id" in json)) {
      throw new Error("Missing required property 'id'");
    }
    if (typeof json.id !== "string") {
      throw new Error(`Invalid drawing id: expected=string, got=${typeof json.id}`);
    }
    if (!("name" in json)) {
      throw new Error("Missing required property 'name'");
    }
    if (typeof json.name !== "string") {
      throw new Error(`Invalid drawing name: expected=string, got=${typeof json.name}`);
    }
    if (!("data" in json)) {
      throw new Error("Missing required property 'data'");
    }
    if (!Array.isArray(json.data)) {
      throw new Error("Invalid drawing data: not an array");
    }
    const data = json.data.map((row: unknown) => {
      if (!Array.isArray(row)) {
        throw new Error("Invalid drawing data row: not an array");
      }
      return row.map((v: unknown) => (v === null ? null : Color.fromJSON(v)));
    });
    if (new Set(data.map((row) => row.length)).size > 1) {
      throw new Error("Invalid row length");
    }
    if (!("pixelSize" in json)) {
      throw new Error("Missing required property 'pixelSize'");
    }
    if (typeof json.pixelSize !== "number") {
      throw new Error(`Invalid drawing pixel size: expected=number, got=${typeof json.pixelSize}`);
    }

    const drawing = new Drawing(json.id as string, json.name as string, data, json.pixelSize);
    return drawing;
  }
}

export type DrawingDataPixel = Color | null;
export type DrawingDataRow = DrawingDataPixel[];
export type DrawingData = DrawingDataRow[];

export type DrawingDataPosition = {
  rowIndex: number;
  columnIndex: number;
};

export type DrawingDataRect = {
  start: DrawingDataPosition;
  end: DrawingDataPosition;
};
