(() => {
  const callMethod = name => obj =>
    obj[name]()
  const transform = babel => code =>
    babel.transform(code, {presets: ['react', 'es2015', 'tsx']}).code
  const format = code => `define((require, exports, module) => {
    ${code}
    ;return exports;})`

  define(['babel'], babel => {
    babel.registerPreset('tsx', {
      presets: [
        [babel.availablePresets['typescript'],
          {allExtensions: true, isTSX: true}
        ]],
      },
    );
    return {
      load: (name, req, onload, config) => {
        const path = req.toUrl(name) + '.tsx'
        fetch(path)
          .then(callMethod('text'))
          .then(transform(babel))
          .then(format)
          .then(onload.fromText.bind(onload))
          .catch(onload.error.bind(onload))
      }
    }
  })
})()
