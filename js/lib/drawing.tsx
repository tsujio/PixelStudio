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

  setPixel(rowIndex: number, columnIndex: number, color: Color): boolean {
    if (rowIndex >= 0 && rowIndex < this._data.length && columnIndex >= 0 && columnIndex < this._data[0].length) {
      const c = this._data[rowIndex][columnIndex]
      if (!c || !c.equalTo(color)) {
        this._data = [...this._data]
        this._data[rowIndex][columnIndex] = color
        return true
      }
    }
    return false
  }

  trim(start: {rowIndex: number, columnIndex: number}, end: {rowIndex: number, columnIndex: number}) {
    this._data = this._data.filter((row, i) => start.rowIndex <= i && i <= end.rowIndex)
      .map(row => row.slice(start.columnIndex, end.columnIndex + 1))
  }
}
