export class Color {
  #rgb: string

  constructor(rgb: string) {
    this.#rgb = rgb
  }

  get rgb(): string {
    return this.#rgb
  }

  equalTo(other: Color): boolean {
    return this.#rgb === other.#rgb
  }

  toJSON() {
    return this.#rgb
  }

  static fromJSON(json: unknown) {
    if (typeof json !== "string") {
      throw new Error(`Invalid color data: expected=string, got=${typeof json}`)
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(json)) {
      throw new Error("Invalid color data format")
    }
    return new Color(json)
  }
}
