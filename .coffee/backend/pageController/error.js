(function() {
  var sendErrPage;

  sendErrPage = function(err) {
    logger.error(err);
  };

  exports.handler = sendErrPage;

}).call(this);
