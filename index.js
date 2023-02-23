const fs = require("fs");
const path = require("path");

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let quillLibrary = fs.readFileSync(path.join(__dirname, "quill.min.js"));
let mutationObserverPolyfill = fs.readFileSync(
  path.join(__dirname, "polyfill.js")
);

const JSDOM_TEMPLATE = `
  <div id="editor">hello</div>
  <script>${mutationObserverPolyfill}</script>
  <script>${quillLibrary}</script>
  <script>
    document.getSelection = function() {
      return {
        getRangeAt: function() { }
      };
    };
    document.execCommand = function (command, showUI, value) {
      try {
          return document.execCommand(command, showUI, value);
      } catch(e) {}
      return false;
    };
  </script>
`;

const JSDOM_OPTIONS = { runScripts: "dangerously", resources: "usable" };
const DOM = new JSDOM(JSDOM_TEMPLATE, JSDOM_OPTIONS);

exports.handler = function (event, context, callback) {
  // TODO implement

  const cache = {};

  if (!cache.quill) {
    cache.quill = new DOM.window.Quill("#editor");
  }

  let delta = cache.quill.clipboard.convert(event.body);

  const response = {
    statusCode: 200,
    body: JSON.stringify(delta),
  };
  callback(null, response);
};

