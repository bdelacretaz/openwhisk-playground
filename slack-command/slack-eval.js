// Example OpenWhisk Slack command that evaluates an expression using jexl

const jexl = require('jexl');

function main (params) {

  console.log(`request params: ${JSON.stringify(params, null, 2)}`)
  const expr = (params && params.text) ? params.text : "";
    
  return new Promise((resolve, reject) => {
    const now = new Date();

    const context = {
      hour: now.getHours(),
      minute : now.getMinutes(),
      second: now.getSeconds(),
      year: now.getFullYear(),
      // for additional demo random: Math.random(),
    }

    jexl.eval(expr, context)
    .then(res =>{
      const output = `${expr} = *${res}*`;
      console.log(output);
      return resolve({ body: `${output}\n`, headers:{ 'Content-Type': 'text/plain'}});
    })
    .catch(e => {
      console.log(e);
      return resolve({ body:`*ERROR*: ${e}`})
    })
  });
}

if (require.main === module) {
  main({
    text: process.argv[2],
  });
}

module.exports.main = main