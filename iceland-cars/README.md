iceland-cars
============

OpenWhisk minimal integration Web function example

Gets a car's make from the Icelandic apis.is service

Docs:

 * https://github.com/apache/incubator-openwhisk/blob/master/docs/actions.md
 * https://github.com/apache/incubator-openwhisk/blob/master/docs/webactions.md
 * https://apis.is
 
Test as follows, on an OpenWhisk setup:

    $ zip -r action.zip package.json node_modules iceland-cars.js && wsk action update car action.zip --web true --kind nodejs:10
    ok: created action car
    
    $ export URL=$(wsk -i action get car --url | grep http)
    
    # Known good prefixes: aa02*, aa03*, aa12*
    $ export prefix=aa12
    
    $ for i in 1 2 3 4 5 6 7 8 9; do export carNumber=$prefix$i ; curl -k "$URL?carNumber=$carNumber" ; echo ; done
    According to https://apis.is/car the car having number AA121 is a FORD - LTD (Brúnn)
    According to https://apis.is/car the car having number AA122 is a LADA - 2105 (Hvítur)
    ...

And then to see what happened:

    $ wsk -i activation get --last

	
