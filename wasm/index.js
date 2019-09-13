// Run a WASM module from NodeJS (requires version 8.0.0 or later)
'use strict';
const fs = require('fs');
const util = require('util')

const WASM_MODULE = 'cfunc.wasm'
let wasm_instance

// Load WASM module - thanks to James Thomas for this code, 
// from http://jamesthom.as/blog/2019/08/06/serverless-and-webassembly-modules/
async function load_wasm(wasm_module) {
  if (!wasm_instance) {
    const bytes = fs.readFileSync(wasm_module);
    const memory = new WebAssembly.Memory({initial: 1});
    const env = {
      __memory_base: 0, memory
    }

    const { instance, module } = await WebAssembly.instantiate(bytes, { env });
    wasm_instance = instance
  }

  return wasm_instance.exports._cfunc
}

exports.main = async function ({ a = 14, b = 2 }) {
  const cfunc = await load_wasm(WASM_MODULE)
  const result = cfunc(a, b);
  return { result };
}

if (require.main === module) {
  const f = async function () {
    console.log(await exports.main({
      a: 39,
      b: 3
    }));
  };
  f();
}