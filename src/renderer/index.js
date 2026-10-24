const { HTML_renderer } = require("./type_renderer/html_renderer");

const RENDERER_MAP = {
  "text/html": HTML_renderer,
}

function fallbackRenderer({ mime, data }) {
  console.log(`该MIME未被支持: ${mime}`);
}

function render({ mime, data }) {
  const fn = RENDERER_MAP[mime] || fallbackRenderer;
  fn({ mime, data });
}

module.exports = { render };
