var log = require('../base/log');

function sendErrPage( err ){
    log.error( err );
}

exports.handler = sendErrPage;