#!/bin/sh
docker run --rm -v `pwd`:/src trzeci/emscripten-slim:sdk-tag-1.38.43-64bit emcc -s WASM=1 -s SIDE_MODULE=1 -s EXPORTED_FUNCTIONS="['_cfunc']" -O1 cfunc.c -o cfunc.wasm
