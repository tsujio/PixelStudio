export default class Color {
  _rgb: string

  constructor(rgb: string) {
    this._rgb = rgb
  }

  get rgb(): string {
    return this._rgb
  }
}
