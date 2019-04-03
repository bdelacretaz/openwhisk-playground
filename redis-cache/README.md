OpenWhisk Redis cache experiment
===

This is a  minimal example using Redis to cache data.

To build this use:

    npm install
    
And if you have a local Redis setup you can test with

    node -e 'require("./redis-cache.js").main({host:"localhost", port:6379})'
    
Test as follows, on an OpenWhisk setup:

    $ zip -r action.zip package.json redis-cache.js node_modules
    $ wsk -i action update rcache action.zip --web true --param host $REDIS_HOST --param port $REDIS_PORT --kind nodejs:10
    ok: created action rcache

    $ export URL=$(wsk -i action get rcache --url | grep http)

    $ curl -L -k "$URL"

And then to see what happened:

    $ wsk -i activation get --last

