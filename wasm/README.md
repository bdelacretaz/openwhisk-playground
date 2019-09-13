Running WebAssembly code on the Apache OpenWhisk NodeJS runtime
===

This is based on [James Thomas' blog post on serverless and WebAssembly modules](http://jamesthom.as/blog/2019/08/06/serverless-and-webassembly-modules/).

It's the same code actually, with minor differences but I'm using a Docker image to build the WebAssembly code to
avoid requiring a potentially complex installation for that - you just need Docker.

Prerequisites
---
Docker to run the WASM build - or see the build script if you have the Emscripten 
toolchain already.

Apache OpenWhisk to run in a serverless environment.

Build and run at the command-line
---
See https://hub.docker.com/r/wasm/toolchain/ for details of the WebAssembly part.

Build the `cfunc.wasm` code with

    ./build-wasm.sh

which takes longer the first time it runs as it will pull a Docker image used for the build.

And run it with

    node index.js

Which should output `

    { result: 117 }

Run in Apache OpenWhisk
---
For this you need the OpenWhisk `wsk` command setup with the correct credentials.

Install or update the OpenWhisk action as follows, after building the WASM code
as above:

    zip action.zip *.js *.wasm package.json
    wsk action update wasm action.zip --kind nodejs:10

And run it as follows:

    wsk action invoke wasm -r -p a 21 -p b 2


