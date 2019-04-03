// Statebox example based on https://github.com/wmfs/statebox
//
// Executes an Amazon States Langage state machine, defined inline for now
// See https://states-language.net/spec.html
//

'use strict'

const Statebox = require('@wmfs/statebox')
const statebox = new Statebox({})
const StateStore = require('./state-store.js')
var store
const EXPIRATION_SECONDS = 300
const VERSION = "1.08"

// Get suspend data, what must be saved
// to restart the state machine after suspending
function getSuspendData(event, context) {
    context.task.stateMachine.definition.StartAt = context.task.definition.Next
    var machine = {}
    machine[context.task.stateMachine.name] = context.task.stateMachine.definition
    return {
        data: event,
        restartAt: context.task.definition.Next,
        stateMachine: machine
    }
}

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
            Next: 'Suspend'
          },
          Suspend: {
            Type: 'Task',
            Resource: 'module:suspend',
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
    suspend: class Suspend {
      run(event, context) {
        var suspendData =  getSuspendData(event, context)
        store.put(suspendData, EXPIRATION_SECONDS, function(key) { 
          event._CONTINUATION = key
          console.log(`\nCONTINUATION DATA for #${key}, loaded from store:`)
          store.get(key, function(err, data) {
            console.log(JSON.stringify(data, null, 2))
            // Not calling context.sendTaskSuccess stops here...  
            event.success(event)
          })
        })
      }
    },
    sendResponse: class SendResponse {
      run(event, context) {
        event.elapsedMsec = new Date() - event.startTime

        console.log(`Reached end state, sending response`)
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
    var host = params.host ? params.host : "localhost";
    var port = params.port ? params.port : 6379;
    
    store = new StateStore({host:host, port:port})
    
    // Create module resources and run state machine
    await statebox.ready
    statebox.createModuleResources(MODULE_RESOURCES)

    // Create the state machine
    {
        const env = {} // An environment/context/sandbox
        
        if(params.continuation && params.continuation > 0) {
            store.get(params.continuation, await async function(err, data) {
                console.log(`CONTINUE FROM ${JSON.stringify(data.stateMachine, null, 2)}`)
                await statebox.createStateMachines(data.stateMachine, env)    
                console.log("Restart machine created")
                // TODO hack
                inputValue = data.data.values.value
            })
        } else {
          await statebox.createStateMachines(STATE_MACHINE, env)    
        }
    }
    
    // TODO hack hack need to the async stuff right
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Start a new execution on a state machine
    // and send response as the last step
    // TODO need better error handling
    return new Promise(async function (resolve, reject) {
        const stateMachineInput = {
            version: VERSION,
            startTime: START_TIME,
            host: host,
            port: port,
            values: {
                start : inputValue,
                value : inputValue
            },
            success: function(data) {
                store.close()
                return resolve( { body:data } )
            }
        }
        
        const name = 'incsquare'
        console.log("Starting state machine")
        statebox.startExecution( stateMachineInput, name, {} )
    })
}

if (require.main === module) {
    main({
        input:process.argv[2], 
        continuation:process.argv[3],
        host:process.argv[4],
        port:process.argv[5]
    });
}

module.exports.main = main