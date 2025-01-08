import Color from "tsx!lib/color"

export default class Drawing {
  _name: string
  _data: (Color|undefined)[][]

  constructor(name: string, rowCount: number, columnCount: number) {
    this._name = name

    if (rowCount < 1 || columnCount < 1) {
      throw new Error("rowCount and columnCount should be positive")
    }

    const data: (Color|undefined)[][] = []
    for (let i = 0; i < rowCount; i++) {
      const row: (Color|undefined)[] = []
      for (let j = 0; j < columnCount; j++) {
        row.push(undefined)
      }
      data.push(row)
    }
    this._data = data
  }

  get id(): string {
    return this._name
  }

  get name(): string {
    return this._name
  }

  get rowCount(): number {
    return this._data.length
  }

  get columnCount(): number {
    return this._data[0].length
  }

  get data(): (Color|undefined)[][] {
    return this._data
  }

  setPixel(rowIndex: number, columnIndex: number, color: Color) {
    this._data = [...this._data]
    this._data[rowIndex][columnIndex] = color
  }
}
