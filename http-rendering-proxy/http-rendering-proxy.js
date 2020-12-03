// OpenWhisk minimal HTTP proxy example
var request = require('request')
var ContentRenderer = require('./content-renderer.js')
var Handlebars = require('handlebars')
var ORIGIN_SUFFIX = '.rakam.json'
var contentRenderer = new ContentRenderer();

var templateSource = '\
  <html>\
  <head>\
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css">\
  </head>\
  <body> \
  \
  <h1>Sling Remote Content API proxying experiment</h1> \
  <div class="tech">\
  {{proxyInfo.contentRendererInfo}}<br>\
  </div>\
  \
  <div class="debug">\
  This is proxying content from <a href="{{proxyInfo.origin}}">{{proxyInfo.origin}}</a>\
  where the experimental <a href="https://github.com/apache/sling-whiteboard/tree/master/remote-content-api">Sling Remote Content API</a> should be installed.\
  <br>Source code: <a href="https://github.com/bdelacretaz/openwhisk-playground/tree/master/http-rendering-proxy">http-rendering-proxy</a>\
  </div>\
  \
  <div class="navigation">\
  <h2>Navigation</h2>\
  \
  Parent: <a href="{{navigation.parent}}">{{navigation.parent}}</a><br>\
  Children:\
  <ul>\
    {{#each navigation.children}} \
    <li><a href="{{this.url}}">{{this.path}}</a></li>\
    {{/each}} \
  </ul>\
  </div>\
  \
  <div class="content">\
  <h2>Rendered Content</h2>\
  {{{renderedContent}}}\
  \
  </div>\
  <div class="debug">\
  <h2>Raw Content</h2>\
  <pre>{{rawJSON}}</pre>\
  </div>\
  </body></html>'

var template = Handlebars.compile(templateSource);
var origin = "ORIGIN_NOT_SET"

// TODO get this from the environment
var myRootURL = "ROOT_URL_NOT_SET"

function convertUrl(url) {
  return url.replace(origin, myRootURL).replace(ORIGIN_SUFFIX, "")
}

function convertUrls(navigation) {
  navigation.self = convertUrl(navigation.self)
  navigation.parent = convertUrl(navigation.parent)
  for(const i in navigation.children) {
    var c = navigation.children[i]
    c.url = convertUrl(c.url)
  }
}

function main (params) {

  var path = params.__ow_path
  if(path == "") {
    path = "/"
  }
  origin = params.ORIGIN
  myRootURL = params.ROOT_URL
  var sourceURL = `${origin}${path}${ORIGIN_SUFFIX}`
  console.log(`Proxying to ${sourceURL}, converting links to point to ${myRootURL}`)
  
  var options = {
    url: sourceURL,
    json: true
  }

  return new Promise(function (resolve, reject) {
    request(options, function (err, resp) {
        
      if (err) {
        // request failed  
        console.log(err)
        return resolve({ statusCode:500, body:err})
      }
      
      if(resp.statusCode != 200) {
        // service error 
        console.log(`service error ${resp.statusCode}: ${resp.body.error}`)   
        return resolve({ statusCode:resp.statusCode, body:resp.body.error})
      }

      var data = resp.body
      convertUrls(data.navigation)
      data.rawJSON = JSON.stringify(resp.body, null, 2)
      data.renderedContent = contentRenderer.render(data.content)
      data.proxyInfo = {
        origin : origin,
        contentRendererInfo : contentRenderer.info()
      }
      var html = template(data);
      
      console.log(`Returning ${html}`)
      return resolve({ body: html, headers:{ 'Content-Type': 'text/html'}}) 
    })
  }) 
}

// This is for command-line testing
// like node -e "require('./http-rendering-proxy.js').main({ ORIGIN:'http://localhost:8080', __ow_path : '/content' })"
module.exports.main = main