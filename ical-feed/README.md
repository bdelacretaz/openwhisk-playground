ical-feed
============

Generate an iCal feed as an OpenWhisk serverless Action.

This is currently deployed at https://runtime.adobe.io/api/v1/web/bdelacre/default/calendar.ics which
returns a calendar in iCal format.

The result can be validated at 
[icalendar.org](https://icalendar.org/validator.html?url=https://runtime.adobe.io/api/v1/web/bdelacre/default/calendar.ics)

The generated calendar includes events for a few days of the current month, all at the same time,
including one on the current day.

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

	
