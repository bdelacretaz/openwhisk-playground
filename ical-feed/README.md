ical-feed
============

Generate an iCal feed as an OpenWhisk serverless Action

To test on the command-line:

    npm install
    node -e "console.log(require('./ical-feed.js').main())"

To deploy to OpenWhisk, after setting up the `wsk` command
for your environment:

    $ npm install
    $ export ACTION=calendar.ics
    $ zip -r action.zip package.json node_modules $ACTION.js && wsk action update $ACTION action.zip --web true --kind nodejs:10
    ok: created action ...
    
    $ export URL=$(wsk -i action get $ACTION --url | grep http)

    $ open $URL

To get info about any errors, use:

    $ wsk -i activation get --last

	
