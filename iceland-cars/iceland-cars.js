// OpenWhisk minimal integration Web function example
// Get a car's make from the Icelandic apis.is service
// See https://github.com/apache/incubator-openwhisk/blob/master/docs/webactions.md
//
// Test as follows, on an OpenWhisk setup:
//    $ wsk -i action create car car.js --web true
//    ok: created action car
//    $ export URL=$(wsk -i action get car --url | grep http)
//    # Known good prefixes: aa02*, aa03*, aa12*
//    $ export prefix=aa12
//    $ for i in 1 2 3 4 5 6 7 8 9; do export carId=$prefix$i ; curl -k "$URL?carId=$carId" ; echo ; done
//    According to https://apis.is/car the car having number AA121 is a FORD - LTD (Brúnn)
//    According to https://apis.is/car the car having number AA122 is a LADA - 2105 (Hvítur)
//    ...
//
var request = require('request')

function main (params) {
    
  // Icelandic Web Services FTW! See http://docs.apis.is    
  var serviceUrl = 'https://apis.is/car'
  var defaultCarNumber = 'aa120'
    
  var options = {
    url: serviceUrl,
    qs: {number :  params.carId ? params.carId : defaultCarNumber },
    json: true
  }
  
  console.log(`Using ${{serviceUrl}}`)
  

  return new Promise(function (resolve, reject) {
    request(options, function (err, resp) {
        
      if (err) {
        console.log(err)
        return resolve({ statusCode:500, body:err})
      }
      
      if(resp.statusCode != 200) {
        return resolve({ statusCode:resp.statusCode, body:resp.body.error})
      }
      
      var car = resp.body.results[0]; 
      var msg = `According to ${serviceUrl} the car having number ${car.number} is a ${car.type}`
      console.log(msg)
      return resolve({ body: msg }) 
    })
  }) 
}

// This is for command-line testing
// like node -e "require('./iceland-cars.js').main({carId:'aa151'})"
module.exports.main = main