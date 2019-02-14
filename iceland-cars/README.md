iceland-cars
============

OpenWhisk minimal integration Web function example

Gets a car's make from the Icelandic apis.is service

Docs:
 * https://apis.is
 * https://github.com/apache/incubator-openwhisk/blob/master/docs/webactions.md
 
Test as follows, on an OpenWhisk setup:

    $ wsk -i action create car car.js --web true
    ok: created action car
    
    $ export URL=$(wsk -i action get car --url | grep http)
    
    # Known good prefixes: aa02*, aa03*, aa12*
    $ export prefix=aa12
    
    $ for i in 1 2 3 4 5 6 7 8 9; do export carId=$prefix$i ; curl -k "$URL?carId=$carId" ; echo ; done
    According to https://apis.is/car the car having number AA121 is a FORD - LTD (Brúnn)
    According to https://apis.is/car the car having number AA122 is a LADA - 2105 (Hvítur)
    ...

