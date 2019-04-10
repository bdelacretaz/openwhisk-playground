Hello, Serverless!
===

Small example of an OpenWhisk Web action.

To install, assuming `wsk` is setup correctly, use:

    npm install
    zip -r action.zip package.json *.js node_modules
    wsk action update web-hello action.zip --web true --kind nodejs:10

And to run it, use:

    export HURL=$(wsk -i action get web-hello --url | grep http)
    curl -L -k "$HURL?name=Serverless"

Which outputs:

    <html>
      <body>
        <h1>Hello, Serverless!</h1>
      </body>
    </html>