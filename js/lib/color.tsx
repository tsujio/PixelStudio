export default class Color {
  _rgb: string

  constructor(rgb: string) {
    this._rgb = rgb
  }

  get rgb(): string {
    return this._rgb
  }

  equalTo(other: Color): boolean {
    return this._rgb === other._rgb
  }

  toJSON(): any {
    return this._rgb
  }

  static fromJSON(json: any): Color {
    return new Color(json)
  }
}
