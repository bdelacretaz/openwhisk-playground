Statebox experiments
===

Experimenting with https://github.com/wmfs/statebox in an OpenWhisk environment.

To test this locally use:

    npm install
    node statebox.js 5
    
Test as follows, on an OpenWhisk setup:

    $ zip -r action.zip package.json statebox.js node_modules
    $ wsk -i action update statebox action.zip --web true --kind nodejs:10
    ok: created action statebox

    $ export URL=$(wsk -i action get statebox --url | grep http)

    $ curl -L -k "$URL?input=5"

And then to see what happened:

    $ wsk -i activation get --last