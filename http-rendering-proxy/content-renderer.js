// Renders content based on sling:resourceType values

var Handlebars = require('handlebars')

class HandlebarsRenderer {
    constructor(templateSrc) {
        this.template = Handlebars.compile(templateSrc);
    }

    render(content) { 
        return this.template(content) 
    }
}

var renderers = {}

var DEFAULT_RENDERER = new HandlebarsRenderer('\
    <h3>{{title}}</h3>\
    This is the default renderer<br>\
    <b>Path</b>:{{path}}<br>\
    <b>sling:resourceType</b>:{{sling:resourceType}}<br>\
    {{{text}}}\
    ');

renderers["samples/article"] = new HandlebarsRenderer('\
      <h3>{{section}}: {{title}}</h3>\
      <div><b>tags</b>:{{tags}}</div>\
      <blockquote>{{{text}}}</blockquote>\
    ');

renderers["samples/section"] = new HandlebarsRenderer('This is the <b>{{name}}</b> section.')

// Need to recurse in the content and dispatch to more renderers
renderers["wknd/components/page"] = new HandlebarsRenderer('\
    <h3>WKND page - TODO this renderer is very incomplete</h3>\
    <div>tags: {{jcr:content.cq:tags}}</div>\
    ');

class ContentRenderer {
    info() {
        return `The ContentRenderer only supports a limited set of sling:resourceType values: ${Object.keys(renderers)}`
    }

    getResourceType(content, supertype) {
        var result = null;
        var key = supertype ? "sling:resourceSuperType" : "sling:resourceType"
        result = content[key]
        if(!result && content["jcr:content"]) {
            result = content["jcr:content"][key]
        }
        return result;
    }

    render(content) {
        var renderer = renderers[this.getResourceType(content, false)]
        if(!renderer) {
            renderer = renderers[this.getResourceType(content, true)]
        }
        if(!renderer) {
            renderer = DEFAULT_RENDERER
        }
        return renderer.render(content)
    }
}

module.exports = ContentRenderer;