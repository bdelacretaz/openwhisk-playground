enumerate-actions
============

Playing with wsk...
Test as follows, on an OpenWhisk setup:

        $ zip -r action.zip package.json node_modules *.js \
        && wsk action update enum action.zip --web true --kind nodejs:10 -a sling-foo .print.42
    ok: created action enum
    
    $ export URL=$(wsk -i action get enum --url | grep http)

    $ curl $URL
    
And then to see what happened:

    $ wsk -i activation get --last

	
