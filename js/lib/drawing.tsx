import Color from "tsx!lib/color"

export default class Drawing {
  _id: string
  _name: string
  _data: (Color|null)[][]

  constructor(id: string, name: string, rowCount: number, columnCount: number) {
    this._id = id
    this._name = name

    if (rowCount < 1 || columnCount < 1) {
      throw new Error("rowCount and columnCount should be positive")
    }

    const data: (Color|null)[][] = []
    for (let i = 0; i < rowCount; i++) {
      const row: (Color|null)[] = []
      for (let j = 0; j < columnCount; j++) {
        row.push(null)
      }
      data.push(row)
    }
    this._data = data
  }

  static create(name: string, rowCount: number, columnCount: number): Drawing {
    const id = crypto.randomUUID()
    return new Drawing(id, name, rowCount, columnCount)
  }

  get id(): string {
    return this._id
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

  get data(): (Color|null)[][] {
    return this._data
  }

  setPixel(rowIndex: number, columnIndex: number, color: Color | null): boolean {
    if (rowIndex >= 0 && rowIndex < this._data.length && columnIndex >= 0 && columnIndex < this._data[0].length) {
      const c = this._data[rowIndex][columnIndex]
      if (c && color && !c.equalTo(color) ||
        c !== color) {
        this._data = [...this._data]
        this._data[rowIndex][columnIndex] = color
        return true
      }
    }
    return false
  }

  clearPixel(rowIndex: number, columnIndex: number): boolean {
    return this.setPixel(rowIndex, columnIndex, null)
  }

  trim(start: {rowIndex: number, columnIndex: number}, end: {rowIndex: number, columnIndex: number}) {
    this._data = this._data.filter((row, i) => start.rowIndex <= i && i <= end.rowIndex)
      .map(row => row.slice(start.columnIndex, end.columnIndex + 1))
  }
}
