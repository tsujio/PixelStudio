export abstract class Color {
  abstract get css(): string;

  abstract equalTo(other: Color): boolean;

  abstract toRGB(): RGBColor;

  abstract toHSV(): HSVColor;

  abstract toJSON(): unknown;

  static fromJSON(json: unknown) {
    if (typeof json !== "object" || json === null) {
      throw new Error(`Invalid color data: expected=object, got=${typeof json}`);
    }
    if ("rgb" in json) {
      if (!Array.isArray(json["rgb"]) || json["rgb"].length !== 3 || json["rgb"].some((n) => typeof n !== "number")) {
        throw new Error(`Invalid RGB color format: expected={rgb: [r, g, b]}, got=${json["rgb"]}`);
      }
      return new RGBColor(json["rgb"] as [number, number, number]);
    } else if ("hsv" in json) {
      if (!Array.isArray(json["hsv"]) || json["hsv"].length !== 3 || json["hsv"].some((n) => typeof n !== "number")) {
        throw new Error(`Invalid HSV color format: expected={hsv: [h, s, v]}, got=${json["hsv"]}`);
      }
      return new HSVColor(json["hsv"] as [number, number, number]);
    } else if ("hsl" in json) {
      if (!Array.isArray(json["hsl"]) || json["hsl"].length !== 3 || json["hsl"].some((n) => typeof n !== "number")) {
        throw new Error(`Invalid HSL color format: expected={hsl: [h, s, l]}, got=${json["hsl"]}`);
      }
      return new HSLColor(json["hsl"] as [number, number, number]);
    } else {
      throw new Error(`Invalid color data: ${json}`);
    }
  }
}

export class RGBColor extends Color {
  #rgb: [number, number, number];

  constructor(rgb: [number, number, number]) {
    super();
    this.#rgb = [...rgb];
  }

  get rgb(): [number, number, number] {
    return [...this.#rgb];
  }

  get css(): string {
    return "#" + this.#rgb.map((n) => (n < 16 ? "0" + n.toString(16) : n.toString(16))).join("");
  }

  equalTo(other: Color): boolean {
    if (other instanceof RGBColor) {
      return this.#rgb.every((n, i) => n === other.#rgb[i]);
    } else if (other instanceof HSVColor) {
      return other.toRGB().equalTo(this);
    } else if (other instanceof HSLColor) {
      return other.equalTo(this.toHSV().toHSL());
    } else {
      return false;
    }
  }

  toRGB() {
    return this;
  }

  toHSV() {
    const [r, g, b] = this.#rgb.map((n) => n / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = max - min;
    if (h > 0) {
      if (max === r) {
        h = (g - b) / h;
        if (h < 0) {
          h += 6.0;
        }
      } else if (max === g) {
        h = 2.0 + (b - r) / h;
      } else {
        h = 4.0 + (r - g) / h;
      }
    }
    h /= 6.0;
    let s = max - min;
    if (max !== 0) {
      s /= max;
    }
    const v = max;
    return new HSVColor([Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)]);
  }

  toJSON() {
    return { rgb: this.#rgb };
  }

  static fromHex(hex: string) {
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
      throw new Error(`Invalid rgb hex format: ${hex}`);
    }
    return new RGBColor([1, 3, 5].map((i) => parseInt(hex.substring(i, i + 2), 16)) as [number, number, number]);
  }
}

export class HSVColor extends Color {
  #hsv: [number, number, number];

  constructor(hsv: [number, number, number]) {
    super();
    this.#hsv = [...hsv];
  }

  get hsv(): [number, number, number] {
    return [...this.#hsv];
  }

  get css(): string {
    return this.toHSL().css;
  }

  equalTo(other: Color): boolean {
    if (other instanceof HSVColor) {
      return this.#hsv.every((n, i) => n === other.#hsv[i]);
    } else if (other instanceof RGBColor) {
      return other.toHSV().equalTo(this);
    } else if (other instanceof HSLColor) {
      return other.equalTo(this.toHSL());
    } else {
      return false;
    }
  }

  toRGB() {
    const [h, s, v] = [this.#hsv[0] / 360, this.#hsv[1] / 100, this.#hsv[2] / 100];
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    let r: number, g: number, b: number;
    switch (i % 6) {
      case 0:
        [r, g, b] = [v, t, p];
        break;
      case 1:
        [r, g, b] = [q, v, p];
        break;
      case 2:
        [r, g, b] = [p, v, t];
        break;
      case 3:
        [r, g, b] = [p, q, v];
        break;
      case 4:
        [r, g, b] = [t, p, v];
        break;
      case 5:
        [r, g, b] = [v, p, q];
        break;
      default:
        throw new Error();
    }
    return new RGBColor([Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]);
  }

  toHSV() {
    return this;
  }

  toHSL() {
    const [h, s, v] = [this.#hsv[0] / 360, this.#hsv[1] / 100, this.#hsv[2] / 100];
    const l = v * (1 - s / 2);
    const _s = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
    return new HSLColor([Math.round(h * 360), Math.round(_s * 100), Math.round(l * 100)]);
  }

  toJSON() {
    return { hsv: this.#hsv };
  }
}

export class HSLColor extends Color {
  #hsl: [number, number, number];

  constructor(hsl: [number, number, number]) {
    super();
    this.#hsl = [...hsl];
  }

  get hsl(): [number, number, number] {
    return [...this.#hsl];
  }

  get css(): string {
    const [h, s, l] = this.#hsl;
    return `hsl(${h}deg, ${s}%, ${l}%)`;
  }

  equalTo(other: Color): boolean {
    if (other instanceof HSLColor) {
      return this.#hsl.every((n, i) => n === other.#hsl[i]);
    } else if (other instanceof RGBColor) {
      return other.toHSV().toHSL().equalTo(this);
    } else if (other instanceof HSVColor) {
      return other.toHSL().equalTo(this);
    } else {
      return false;
    }
  }

  toRGB(): RGBColor {
    throw new Error("Not implemented");
  }

  toHSV(): HSVColor {
    throw new Error("Not implemented");
  }

  toJSON() {
    return { hsl: this.#hsl };
  }
}
