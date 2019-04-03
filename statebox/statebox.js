// Statebox example based on https://github.com/wmfs/statebox
const Statebox = require('@wmfs/statebox')
const statebox = new Statebox({})

const main = async function(params) {

    params = params ? params : {}
    var operator = params.operator ? params.operator : "-";
    
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
    report: class Report {
      run(event, context) {
        console.log(`Reached end state`)
        console.log("\n*** CONTEXT ***")
        console.log(context);
        console.log("\n*** EVENT ***")
        console.log(event)
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
              StringEquals: '+',
              Next: 'Add'
            }, {
              Variable: '$.operator',
              StringEquals: '-',
              Next: 'Subtract'
            }]
          },
          Add: {
            Type: 'Task',
            InputPath: '$.numbers',
            Resource: 'module:add', // See createModuleResources()
            ResultPath: '$.result',
            Next: 'Report'
          },
          Subtract: {
            Type: 'Task',
            InputPath: '$.numbers',
            Resource: 'module:subtract',
            ResultPath: '$.result',
            Next: 'Report'
          },
          Report: {
            Type: 'Task',
            Resource: 'module:report',
            End: true
          }
        }
      }
    }, {}, // 'env': An environment/context/sandbox
  )
  
  // STEP 3:
  // Start a new execution on a state machine
  // ----------------------------------------
  const executioner = await statebox.startExecution({
      numbers: {
        number1: 44,
        number2: 2
      },
      operator: operator
    }, // input
    'calculator', // state machine name
    {} // options
  )
}

if (require.main === module) {
  main();
}

module.exports.main = main