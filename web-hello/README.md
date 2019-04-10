Hello, Serverless!
===

Small example of an OpenWhisk Web action.

To install, assuming `wsk` is setup correctly, use:

    wsk action update web-hello web-hello.js --web true

And to run it, use:

    export URL=$(wsk -i action get web-hello --url | grep http)
    curl -L -k "$URL?name=Serverless"

Which outputs:

    <html>
      <body>
        <h1>Hello, Serverless!</h1>
      </body>
    </html>