import { JSDOM } from "jsdom";
const dom = new JSDOM(`
<!DOCTYPE html>
<head>
  <title>Hello World</title>
</head>
<body>
  <p>Hello world</p>
</body>
`);
global.document = dom.window.document;
global.window = dom.window;
