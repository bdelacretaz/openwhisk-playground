JiraApi = require('jira').JiraApi;

const commentOnJira = (config, issue) => {
  console.log(`Using JIRA host at ${config.host}:${config.port}, username ${config.username}`)
  var jira = new JiraApi('https', config.host, config.port, config.username, config.password, '2', true);
  jira.findIssue(issue.key, (error, issue) => {
    if(error) {
      throw new Error(error)
    }
    console.log('Issue status: ' + issue.fields.status.name);
  });
  return `Commenting on ${issue.key} at ${config.host}:${config.port}`
}

const main = async (params) => {
  console.log(JSON.stringify(params, null, 2))
  const issue = params.issue
  if(issue) {
    return { body: commentOnJira(params.jira, issue) }
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
        host: "b2019.atlassian.net",
        port: 443,
        username: process.argv[3],
        password: process.argv[4]
      }
    });
}

module.exports.main = main