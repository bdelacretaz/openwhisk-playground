http-rendering-proxy
============

Minimal demonstration of an HTTP proxy that renders JSON content.

Meant to validate the setup, the code is _not really_ interesting...

Test as follows, on an OpenWhisk setup:

    $ export ORIGIN=http://48806b3fbf8e.ngrok.io/
    $ zip -r action.zip package.json node_modules *.js && wsk action update hproxy action.zip --web true --kind nodejs:10 -p ORIGIN $ORIGIN
    ok: created action hproxy
    
    $ export URL=$(wsk -i action get hproxy --url | grep http)
    $ curl $URL
    
    ...

And then to see what happened:

    $ wsk -i activation get --last

	
