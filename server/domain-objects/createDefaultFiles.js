import { currentP5Version } from '../../common/p5Versions';

export const defaultSketch = `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}`;

export function defaultHTML({
  version = currentP5Version,
  sound = true,
  preload = false,
  shapes = false,
  data = false
} = {}) {
  const soundURL = version.startsWith('2.')
    ? `https://cdn.jsdelivr.net/npm/p5.sound@0.2.0/dist/p5.sound.min.js`
    : `https://cdnjs.cloudflare.com/ajax/libs/p5.js/${version}/addons/p5.sound.min.js`;

  const libraries = [
    `<script src="https://cdn.jsdelivr.net/npm/p5@${version}/lib/p5.js"></script>`,
    sound ? `<script src="${soundURL}"></script>` : '',
    preload
      ? `<script src="https://cdn.jsdelivr.net/npm/p5.js-compatibility@0.1.2/src/preload.js"></script>`
      : '',
    shapes
      ? `<script src="https://cdn.jsdelivr.net/npm/p5.js-compatibility@0.1.2/src/shapes.js"></script>`
      : '',
    data
      ? `<script src="https://cdn.jsdelivr.net/npm/p5.js-compatibility@0.1.2/src/data.js"></script>`
      : ''
  ].join('\n    ');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    ${libraries}
    <link rel="stylesheet" type="text/css" href="style.css">
    <meta charset="utf-8" />

  </head>
  <body>
    <main>
    </main>
    <script src="sketch.js"></script>
  </body>
</html>
`;
}

export const defaultCSS = `html, body {
  margin: 0;
  padding: 0;
}
canvas {
  display: block;
}
`;

export default function createDefaultFiles() {
  return {
    'index.html': {
      content: defaultHTML()
    },
    'style.css': {
      content: defaultCSS
    },
    'sketch.js': {
      content: defaultSketch
    }
  };
}
