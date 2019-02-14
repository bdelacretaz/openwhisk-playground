// OpenWhisk minimal integration Web function example
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