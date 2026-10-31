// Loaded by `npm test` through --import. Next resolves "server-only" itself at build time, so no
// such package exists under plain node and any module importing it would fail to load. This
// answers that one specifier with an empty module, for the test runner only. tsx runs the tests
// as CommonJS (no "type": "module" here), so the CommonJS loader is the one to answer from.
import Module from "node:module";

const load = Module._load;

Module._load = function (request, ...rest) {
  return request === "server-only" ? {} : load.call(this, request, ...rest);
};
