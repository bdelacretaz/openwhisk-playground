// Statebox example based on https://github.com/wmfs/statebox
//
// Executes an Amazon States Langage state machine, defined inline for now
// See https://states-language.net/spec.html
//
const Statebox = require('@wmfs/statebox')
const statebox = new Statebox({})
const VERSION = "1.04"

const main = async function(params) {

    const startTime = new Date();
    params = params ? params : {}
    var operator = params.operator ? params.operator : "minus";
    
  // STEP 1:
  // Create some 'module' resources (i.e. Javascript
  // classes with 'run' and optional 'init' methods)
  // that state machines can then refer to...
  // -------------------------------------------------
  await statebox.ready
  statebox.createModuleResources({
    // Simple module to add two numbers together
    add: class Add {
      run(event, context) {
        context.sendTaskSuccess(event.number1 + event.number2)
      }
    },
    // Simple module to subtract one number from another
    subtract: class Subtract {
      // Init methods are optional, but all allow
      // resource-instances to be configured...
      init(resourceConfig, env, callback) {
        callback(null)
      }
      run(event, context) {
        context.sendTaskSuccess(event.number1 - event.number2)
      }
    },
    sendResponse: class SendResponse {
      run(event, context) {
        console.log(`Reached end state, sending response`)
        console.log("\n*** CONTEXT ***")
        console.log(context);
        console.log("\n*** EVENT ***")
        console.log(event)
        event.success(event)
      }
    },
  })

  // STEP 2:
  // Next create a new 'calculator' state
  // machine using Amazon States Language...
  // ---------------------------------------
  await statebox.createStateMachines({
      'calculator': {
        Comment: 'A simple calculator',
        StartAt: 'OperatorChoice',
        States: {
          OperatorChoice: {
            Type: 'Choice',
            Choices: [{
              Variable: '$.operator',
              StringEquals: 'plus',
              Next: 'Add'
            }, {
              Variable: '$.operator',
              StringEquals: 'minus',
              Next: 'Subtract'
            }]
          },
          Add: {
            Type: 'Task',
            InputPath: '$.numbers',
            Resource: 'module:add', // See createModuleResources()
            ResultPath: '$.result',
            Next: 'SendResponse'
          },
          Subtract: {
            Type: 'Task',
            InputPath: '$.numbers',
            Resource: 'module:subtract',
            ResultPath: '$.result',
            Next: 'SendResponse'
          },
          SendResponse: {
            Type: 'Task',
            Resource: 'module:sendResponse',
            End: true
          }
        }
      }
    }, {}, // 'env': An environment/context/sandbox
  )
  
  // STEP 3:
  // Start a new execution on a state machine
  // and send response as the last step
  // TODO need better error handling
  // ----------------------------------------
  return new Promise(async function (resolve, reject) {
      statebox.startExecution({
          version: VERSION,
          numbers: {
            number1: 44,
            number2: 2
          },
          operator: operator,
          elapsedMsec: new Date() - startTime,
          success: function(data) {
              return resolve( { body:data } )
          }
        }, // input
        'calculator', // state machine name
        {} // options
      )
  })
  
}

if (require.main === module) {
    main({operator:process.argv[2]});
}

module.exports.main = main