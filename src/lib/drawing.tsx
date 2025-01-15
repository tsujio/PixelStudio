import { Color } from "./color"

export class Drawing {
  #id: string
  #name: string
  #data: (Color | null)[][]

  constructor(id: string, name: string, data: (Color | null)[][]) {
    this.#id = id
    this.#name = name
    this.#data = data
  }

  static create(name: string, rowCount?: number, columnCount?: number): Drawing {
    const id = crypto.randomUUID()

    rowCount = rowCount ?? 48
    columnCount = columnCount ?? 64

    if (rowCount < 1 || columnCount < 1) {
      throw new Error("rowCount and columnCount should be positive")
    }

    const data: (Color | null)[][] = []
    for (let i = 0; i < rowCount; i++) {
      const row: (Color | null)[] = []
      for (let j = 0; j < columnCount; j++) {
        row.push(null)
      }
      data.push(row)
    }

    return new Drawing(id, name, data)
  }

  get id() {
    return this.#id
  }

  get name() {
    return this.#name
  }

  get data() {
    return this.#data
  }

  get rowCount() {
    return this.#data.length
  }

  get columnCount() {
    return this.#data[0].length
  }

  rename(newName: string) {
    this.#name = newName
  }

  isValidIndices(rowIndex: number, columnIndex: number) {
    return 0 <= rowIndex && rowIndex < this.#data.length && 0 <= columnIndex && columnIndex < this.#data[0].length
  }

  setPixel(rowIndex: number, columnIndex: number, color: Color | null) {
    this.#data[rowIndex][columnIndex] = color
  }

  trim(start: {rowIndex: number, columnIndex: number}, end: {rowIndex: number, columnIndex: number}) {
    this.#data = this.#data.filter((_, i) => start.rowIndex <= i && i <= end.rowIndex)
      .map(row => row.slice(start.columnIndex, end.columnIndex + 1))
  }

  clone() {
    const data = this.#data.map(row => [...row])
    const drawing = new Drawing(this.#id, this.#name, data)
    return drawing
  }

  toJSON() {
    return {
      id: this.#id,
      name: this.#name,
      data: this.#data,
    }
  }

  static fromJSON(json: unknown) {
    if (typeof json !== "object" || json === null) {
      throw new Error(`Invalid drawing data: expected=object, got=${json !== null ? typeof json : json}`)
    }
    if (!("id" in json)) {
      throw new Error("Missing required property 'id'")
    }
    if (typeof json.id !== "string") {
      throw new Error(`Invalid drawing id: expected=string, got=${typeof json.id}`)
    }
    if (!("name" in json)) {
      throw new Error("Missing required property 'name'")
    }
    if (typeof json.name !== "string") {
      throw new Error(`Invalid drawing name: expected=string, got=${typeof json.name}`)
    }
    if (!("data" in json)) {
      throw new Error("Missing required property 'data'")
    }
    if (!Array.isArray(json.data)) {
      throw new Error("Invalid drawing data: not an array")
    }
    const data = json.data.map((row: unknown) => {
      if (!Array.isArray(row)) {
        throw new Error("Invalid drawing data row: not an array")
      }
      if (row.length !== (json.data as unknown[]).length) {
        throw new Error("Invalid row length")
      }
      return row.map((v: unknown) => v === null ? null : Color.fromJSON(v))
    })

    const drawing = new Drawing(json.id as string, json.name as string, data)
    return drawing
  }
}