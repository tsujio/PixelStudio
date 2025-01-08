require.config({
  paths: {
    babel: "https://unpkg.com/@babel/standalone/babel.min",
    react: "https://unpkg.com/react@18/umd/react.production.min",
    "react-dom": "https://unpkg.com/react-dom@18/umd/react-dom.production.min"
  }
});
require(['tsx!main'])
