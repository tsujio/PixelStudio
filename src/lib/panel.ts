export abstract class Panel {
  protected _id: string;
  protected _x: number;
  protected _y: number;

  constructor(id: string, x: number, y: number) {
    this._id = id;
    this._x = x;
    this._y = y;
  }

  get id() {
    return this._id;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  move(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  abstract clone(): Panel;

  toJSON(): object {
    return {
      id: this._id,
      x: this._x,
      y: this._y,
    };
  }

  static fromJSON(json: unknown): Panel {
    if (typeof json !== "object" || json === null) {
      throw new Error(`Invalid panel data: expected=object, got=${json !== null ? typeof json : json}`);
    }
    if (!("id" in json)) {
      throw new Error("Missing required property 'id'");
    }
    if (typeof json.id !== "string") {
      throw new Error(`Invalid panel id: expected=string, got=${typeof json.id}`);
    }
    if (!("x" in json)) {
      throw new Error("Missing required property 'x'");
    }
    if (typeof json.x !== "number") {
      throw new Error(`Invalid panel x: expected=number, got=${typeof json.x}`);
    }
    if (!("y" in json)) {
      throw new Error("Missing required property 'y'");
    }
    if (typeof json.y !== "number") {
      throw new Error(`Invalid panel y: expected=number, got=${typeof json.y}`);
    }
    if (!("type" in json)) {
      throw new Error("Missing required property 'type'");
    }

    const j = {
      ...json,
      id: json.id,
      x: json.x,
      y: json.y,
    };

    switch (j.type) {
      case "drawing":
        return DrawingPanel.fromJSON(j);
      default:
        throw new Error(`Invalid panel type: ${json.type}`);
    }
  }
}

export class DrawingPanel extends Panel {
  #drawingId: string;

  constructor(id: string, x: number, y: number, drawingId: string) {
    super(id, x, y);
    this.#drawingId = drawingId;
  }

  get drawingId() {
    return this.#drawingId;
  }

  clone() {
    return new DrawingPanel(this._id, this._x, this._y, this.#drawingId);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      type: "drawing",
      drawingId: this.#drawingId,
    };
  }

  static fromJSON(json: { id: string; x: number; y: number; [key: string]: unknown }) {
    if (!("drawingId" in json)) {
      throw new Error("Missing required property 'drawingId'");
    }
    if (typeof json.drawingId !== "string") {
      throw new Error(`Invalid panel drawingId: expected=string, got=${typeof json.drawingId}`);
    }

    return new DrawingPanel(json.id, json.x, json.y, json.drawingId);
  }
}
