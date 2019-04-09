// Minimal OpenWhisk Slack command that pings servers
// To setup:
//  - Create a Slack app with https://api.slack.com/apps?new_app=1
//  - View your Slack apps at https://api.slack.com/apps
//  - Create a command via https://api.slack.com/apps/<APP-ID>/slash-commands?

var ping = require('ping');

function main (params) {

  const host = (params && params.host) ? params.host : 'www.perdu.com';
    
  return new Promise(async (resolve, reject) => {
      const config = { timeout: 1 };
      ping.promise.probe(host, config)
      .then((res) => {
          console.log(res);
          const msg = `${res.host}: min/avg/max/stddev ${res.min}/${res.avg}/${res.max}/${res.stddev}`
          console.log(`Returning ${msg}`);
          return resolve({ body: msg, headers:{ 'Content-Type': 'text/plain'}});
      })
      .catch(err => {
          return resolve({ body: err, headers:{ 'Content-Type': 'text/plain'}});
      });
  }) 
}

if (require.main === module) {
  main({
    host: process.argv[2],
  });
}

module.exports.main = main