OpenWhisk continuations experiments
===

Minimal examples and experiments around continuations in OpenWhisk - combining
Actions with waiting for human responses for example.

For now this just contains a very basic Redis caching example, no continuations yet.

To build this use:

    npm install
    
And if you have a local Redis setup you can test with

    node -e 'require("./continuations.js").main({host:"localhost", port:6379})'
    
Test as follows, on an OpenWhisk setup:

    $ zip -r action.zip package.json continuations.js node_modules
    $ wsk -i action update cont action.zip --web true --param host $REDIS_HOST --param port $REDIS_PORT --kind nodejs:10
    ok: created action cont

    $ export URL=$(wsk -i action get cont --url | grep http)

    $ curl -L -k "$URL"

And then to see what happened:

    $ wsk -i activation get --last

