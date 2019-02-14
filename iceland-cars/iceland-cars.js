// OpenWhisk minimal integration Web function example
var request = require('request')

function main (params) {
    
  // Icelandic Web Services FTW! See http://docs.apis.is    
  var serviceUrl = 'https://apis.is/car'
  var defaultCarNumber = 'aa120'
  var carNumber = params.carId ? params.carId : defaultCarNumber
    
  var options = {
    url: serviceUrl,
    qs: {number :  carNumber },
    json: true
  }
  
  console.log(`Using ${serviceUrl} to get info about car ${carNumber}`)
  
  return new Promise(function (resolve, reject) {
    request(options, function (err, resp) {
        
      if (err) {
        // request failed  
        console.log(err)
        return resolve({ statusCode:500, body:err})
      }
      
      if(resp.statusCode != 200) {
        // service error 
        console.log(`service error ${resp.statusCode}: ${resp.body.error}`)   
        return resolve({ statusCode:resp.statusCode, body:resp.body.error})
      }
      
      // all good, get the data
      var car = resp.body.results[0]; 
      var msg = `According to ${serviceUrl} the car having number ${car.number} is a ${car.type}`
      console.log(msg)
      return resolve({ body: msg, headers:{ 'Content-Type': 'text/plain'}}) 
    })
  }) 
}

// This is for command-line testing
// like node -e "require('./iceland-cars.js').main({carId:'aa151'})"
module.exports.main = main