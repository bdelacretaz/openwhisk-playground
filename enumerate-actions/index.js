const openwhisk = require('openwhisk');
const elapsedTime = require('elapsed-time');

function main(args) {
    return new Promise(function(resolve, reject) {
        const elapsed = elapsedTime.new().start();
        var ow = openwhisk();
        ow.actions.list()
        .then(actions => {
            const result = {
              elapsed : elapsed.getValue(),
              data: actions    
            };
            return resolve({ body: result }); 
        })
        .catch(e => {
            return reject(e);
        });
    })
}  

module.exports.main = main