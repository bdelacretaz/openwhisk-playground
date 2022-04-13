// Based on the https://www.npmjs.com/package/ics example
// Validate at https://icalendar.org/validator.html
// Display at 
const ics = require('ics')

const getEvents = () => {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const days = [1, 12, 27, new Date().getDate()];
  const events = [];
  
  for (let day of days) {
    events.push({
      start: [year, month, day, 6, 42],
      duration: { hours: 1, minutes: 42 },
      title: `Test for ${year}-${month}-${day}`,
      description: `Test event for ${year}-${month}-${day}`,
      location: 'Somewhere in Colorado',
      url: 'https://github.com/bdelacretaz/openwhisk-playground/tree/master/ical-feed',
      geo: { lat: 40.0095, lon: 105.2669 },
      categories: ['iCal', 'Testing', 'JavaScript'],
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      organizer: { name: 'Admin', email: 'nobody@example.com' },
      attendees: [
        { name: 'Adam Gibbons', email: 'adam@example.com', rsvp: true, partstat: 'ACCEPTED', role: 'REQ-PARTICIPANT' },
        { name: 'Bertrand Delacretaz', email: 'bertrand@example.org', dir: 'https://www.linkedin.com/in/bdelacretaz/', role: 'OPT-PARTICIPANT' }
      ]
    });
  }
  return events;
}

function main(_params) {
  return new Promise(function (resolve, reject) {
    ics.createEvents(getEvents(), (error, calendar) => {
      if (error) {
        reject(error);
      }
      resolve({
        body: calendar,
        "statusCode": 200,
        "headers": {
          "Content-Type": "text/calendar"
        }
      })
    });
  });
}

module.exports.main = main