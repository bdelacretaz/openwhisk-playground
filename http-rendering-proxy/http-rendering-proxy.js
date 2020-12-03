function main (params) {
  var path = "undefined __ow_path"

  if (typeof __ow_path !== 'undefined') {
    path = __ow_path
  }

  console.log(`path=${path}`)

  return ({
    // as per https://github.com/apache/openwhisk/blob/master/docs/webactions.md
    // this should be the unmatched path of the request (matching stops after consuming the action extension).
    body : `path=${path}`,
  })
}

module.exports.main = main