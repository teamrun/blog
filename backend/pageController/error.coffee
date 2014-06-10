sendErrPage = (err) ->
  logger.error err
  return

exports.handler = sendErrPage