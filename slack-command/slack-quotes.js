// Minimal OpenWhisk Slack command that returns random quotes

const Quote = require('inspirational-quotes');

function main (params) {

  console.log(`request params: ${JSON.stringify(params, null, 2)}`)
  const short = (params && params.text) ? params.text.includes("short") : false;
    
  return new Promise((resolve, reject) => {
      const q = Quote.getQuote();
      console.log(q);
      let msg
      if(short) {
          msg = q.text;
      } else {
          msg = `${q.text} _(${q.author})_`;
      }
      console.log(msg)
      return resolve({ body: msg, headers:{ 'Content-Type': 'text/plain'}});
  });
}

if (require.main === module) {
  main({
    text: process.argv[2],
  });
}

module.exports.main = main