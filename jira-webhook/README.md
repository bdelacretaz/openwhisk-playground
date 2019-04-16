jira-webhook
===

Experimenting with JIRA Webhooks that trigger OpenWhisk actions.

To test this at the command line use

    $ node index.js <issue_id> <jira_host> <username> <password>

Which outputs something like

    Using JIRA host jira.example.com, username jiraboy
    Got issue FOO-1234, https://jira.example.com/rest/api/2/issue/173124, project=Fooing Around

Next steps: trigger this from JIRA and have the hook do something meaningful.    
