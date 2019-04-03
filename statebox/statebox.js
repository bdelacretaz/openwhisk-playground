// Statebox example based on https://github.com/wmfs/statebox
//
// Executes an Amazon States Langage state machine, defined inline for now
// See https://states-language.net/spec.html
//
const Statebox = require('@wmfs/statebox')
const statebox = new Statebox({})
const VERSION = "1.07"

// State machine definition
// TODO should be provided as input to this function
const STATE_MACHINE = {
      'incsquare': {
        Comment: 'Increment and square a value',
        StartAt: 'A',
        States: {
          A: {
            Type: 'Task',
            InputPath: '$.values',
            ResultPath: '$.values.value',
            Resource: 'module:increment',
            Next: 'B'
          },
          B: {
            Type: 'Task',
            InputPath: '$.values',
            ResultPath: '$.values.value',
            Resource: 'module:square',
            Next: 'C'
          },
          C: {
            Type: 'Task',
            InputPath: '$.values',
            ResultPath: '$.values.value',
            Resource: 'module:increment',
            Next: 'SendResponse'
          },
          SendResponse: {
            Type: 'Task',
            Resource: 'module:sendResponse',
            End: true
          }
        }
      }
    }
    
// Module resources are Javascript classes with 'run' 
// and optional 'init' methods) that state machines 
// can use for Task states
const MODULE_RESOURCES = {
    increment: class Increment {
      run(event, context) {
        console.log(`increment ${event.value}`)
        context.sendTaskSuccess(event.value + 1)
      }
    },
    square: class Square {
      run(event, context) {
        console.log(`square ${event.value}`)
        context.sendTaskSuccess(event.value * event.value)
      }
    },
    sendResponse: class SendResponse {
      run(event, context) {
        event.elapsedMsec = new Date() - event.startTime

        console.log(`Reached end state, sending response`)
        console.log("\n*** CONTEXT ***")
        console.log(context);
        console.log("\n*** EVENT ***")

        console.log(event)
        event.success(event)
      }
    }
  }     

// OpenWhisk action code
const main = async function(params) {

    const START_TIME = new Date()
    params = params ? params : {}
    var inputValue = params.input ? parseInt(params.input) : 1;
    
    // Create module resources
    await statebox.ready
    statebox.createModuleResources(MODULE_RESOURCES)

    // Create the state machine
    {
        const env = {} // An environment/context/sandbox
        await statebox.createStateMachines(STATE_MACHINE, env)    
    }
  
    // Start a new execution on a state machine
    // and send response as the last step
    // TODO need better error handling
    return new Promise(async function (resolve, reject) {
      statebox.startExecution({
          version: VERSION,
          startTime: START_TIME,
          values: {
              start : inputValue,
              value : inputValue
          },
          success: function(data) {
              return resolve( { body:data } )
          }
        }, // input
        'incsquare', // state machine name
        {} // options
      )
  })
  
}

if (require.main === module) {
    main({input:process.argv[2]});
}

module.exports.main = main