// Using https://github.com/floralvikings/jira-connector
// See its README for how to generate jsdoc for that
const JiraClient = require('jira-connector');

const getJiraClient = (config) => {
  return new JiraClient( {
    host: config.host,
    version: 2,
    basic_auth: {
        username: config.username,
        password: config.password
    }
});
}
const talkToJira = async (config, issue) => {
  console.log(`Using JIRA host ${config.host}, username ${config.username}`)
  if(!config.password) {
    throw new Error("Using basic auth for now, password must be provided");
  }
  const jira = getJiraClient(config)

  try {
    // await jira.auth.login();
    const data = await jira.issue.getIssue({ issueId: issue});
    console.log(`Got issue ${issue}, ${data.self}, project=${data.fields.project.name}`);
  } catch(e) {
    console.log(`API ERROR ${e}`);
  } 
  /*
  await jira.issue.addComment({
    issueId : issue,
    comment: `{ This is from the bot on ${issue}}`
  })
  .catch(e => { throw new Error(e) })
  */
  return `Talking to JIRA, ${issue.key} at ${config.host}`
}

const main = async (params) => {
  console.log(JSON.stringify(params, null, 2))
  const issue = params.issue
  if(issue) {
    return { body: talkToJira(params.jira, issue) }
  } else {
    const msg = "No issue key provided, doing nothing" 
    return { body: msg }
  }
}

// Glue to test from the command line
if (require.main === module) {
  main({
      issue: process.argv[2],
      jira: {
        host: process.argv[3],
        username: process.argv[4],
        password: process.argv[5]
      }
    });
}

module.exports.main = main