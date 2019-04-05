Statebox experiments
===

Experimenting with https://github.com/wmfs/statebox in an OpenWhisk environment, to run state machines with continuations:
a state machine can be paused, potentially for a long time, by saving its state in Redis. A continuation ID is output when
that happens, allowing the state machine to be restarted from the same point and with the same context data later.

To test this locally (requires a Redis server at localhost 6379) use:

    npm install
    node statebox.js 5
    
And to test the continuations feature, note the `_CONTINUATION` value that's output
and call the script with that value as its second argument, such as

    node statebox.js 0 34bcdb33-ee54-4efd-963c-4931fd3b3855
    
which restarts the state machine from where it was suspended.    
    
Test as follows, on an OpenWhisk setup:

    $ zip -r action.zip package.json *.js node_modules
    $ wsk -i action update statebox action.zip --web true --param host $REDIS_HOST --param port $REDIS_PORT --kind nodejs:10
    ok: created action statebox

    $ export URL=$(wsk -i action get statebox --url | grep http)

    $ curl -L -k "$URL?input=5"
    
or, to restart from a continuation as shown above:

    $ export K=<continuation ID>
    $ curl -s -L -k "$URL?continuation=$K"

And then to see what happened:

    $ wsk -i activation get --last
    $ wsk -i activation logs --last
