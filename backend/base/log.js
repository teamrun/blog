var log4js = require('log4js');
var logger = log4js.getLogger();

global.logger = logger;

module.exports = logger;