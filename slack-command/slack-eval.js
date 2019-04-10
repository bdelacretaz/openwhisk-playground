// Example OpenWhisk Slack command that evaluates an expression using jexl

const jexl = require('jexl');

function plainText(content) {
  return { body: `${content}\n`, headers:{ 'Content-Type': 'text/plain'}};
}

const now = new Date();

const context = {
  now : now,
  hour: now.getHours(),
  minute : now.getMinutes(),
  second: now.getSeconds(),
  year: now.getFullYear(),
  space : " \n".repeat(10),
  // for additional demo random: Math.random(),
}

// The actual OpenWhisk action
async function main (params) {

  console.log(`request params: ${JSON.stringify(params, null, 2)}`)
  const expr = (params && params.text) ? params.text : "";
    
    try {
      return jexl.eval(expr, context)
      .then(res =>{
        const output = `${expr} = *${res}*`;
        console.log(output);
        return plainText(output);
      })
      .catch(e => {
        return plainText(`*ERROR*: ${e}`);
      })
    } catch(e) {
      return plainText(`*ERROR*: ${e}`);
    }
}

// Glue to run from the command line + OpenWhisk
if (require.main === module) {
  main({
    text: process.argv[2],
  });
}

module.exports.main = main