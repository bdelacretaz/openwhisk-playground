var Handlebars = require('handlebars')

// TODO for now this only works for 
// content under content/articles
var templateSource = '\
  <div class="rendererOutput">\
    <h3>{{title}}</h3>\
    Path:{{path}}<br>\
    {{{text}}}\
  </div>'


var template = Handlebars.compile(templateSource);

class ContentRenderer {
    constructor() {
    }

    info() {
        return '\
            For now, the content renderer only works for content that\'s under content/articles \
            but the navigation should work everywhere'
    }

    render(content) {
        // TODO dispatch to the appropriate
        // renderers based on the incoming sling:resourceType values
        return template(content);
    }
}

module.exports = ContentRenderer;