/**
 * Hello world as an OpenWhisk Web action.
 * See also https://github.com/apache/incubator-openwhisk/blob/master/docs/samples.md
 */

// Prevent XSS
// From https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript
function escapeForHTML(text) {
    return text.replace(/[&<"']/g, (m) => {
      switch (m) {
        case '&':
          return '&amp;';
        case '<':
          return '&lt;';
        case '"':
          return '&quot;';
        default:
          return '&#039;';
      }
    });
  };

// The actual OpenWhisk action code
function main(params) {
  const name = params.name || 'World';
  
  const content = `
    <html>
      <body>
        <h1>Hello, ${escapeForHTML(name)}!</h1>
      </body>
    </html>
    `;

  console.log(content);
  return {body: content };
}

// Glue to test from the command line
if (require.main === module) {
  main({
    name: process.argv[2],
  });
}

module.exports.main = main
