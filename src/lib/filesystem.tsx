const filePickerOpts: OpenFilePickerOptions & SaveFilePickerOptions = {
  id: "project",
  startIn: "documents",
  types: [
    {
      description: "Pixel Studio Project Files",
      accept: {
        "application/json": [".json"]
      }
    }
  ],
}

export const openFile = async (): Promise<{fileHandle: FileSystemFileHandle | null, contents: string}> => {
  if (supportFileSystemAPI) {
    const [fileHandle]: FileSystemFileHandle[] = await window.showOpenFilePicker({
      ...filePickerOpts,
      excludeAcceptAllOption: true,
      multiple: false,
    })
    const file = await fileHandle.getFile()
    const contents = await file.text()

    return {fileHandle, contents}
  } else {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input")
      input.type = "file"
      input.addEventListener("change", e => {
        const target = e.target as HTMLInputElement
        const files = target.files
        if (files === null || files.length === 0) {
          reject(new Error("Not selected any file"))
          return
        }
        const reader = new FileReader()
        reader.onload = () => {
          if (reader.result) {
            const contents = reader.result.toString()
            resolve({fileHandle: null, contents})
          } else {
            reject(new Error("Failed to read contents from file"))
          }
        }
        reader.readAsText(files[0])
      })
      document.body.appendChild(input)
      input.click()
      document.body.removeChild(input)
    })
  }
}

export const createFile = async (contents: string, suggestedName?: string) => {
  if (supportFileSystemAPI) {
    const fileHandle: FileSystemFileHandle = await window.showSaveFilePicker({
      ...filePickerOpts,
      suggestedName,
    })

    await writeToFile(fileHandle, contents)

    return fileHandle
  } else {
    throw new Error("FileSystem API not supported")
  }
}

export const writeToFile = async (fileHandle: FileSystemFileHandle, contents: string) => {
  const writable = await fileHandle.createWritable()
  try {
    writable.write(contents)
  } finally {
    await writable.close()
  }
}

export const supportFileSystemAPI = ["showOpenFilePicker", "showSaveFilePicker"].every(method => method in window)
