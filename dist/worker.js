'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _bull = require('bull');

var _bull2 = _interopRequireDefault(_bull);

var _twilio = require('twilio');

var _twilio2 = _interopRequireDefault(_twilio);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.load();

var twilioQueue = new _bull2.default('twilio', process.env.REDIS_URL);

twilioQueue.process(function (job, done) {

  console.log('PACKET: %s', (0, _stringify2.default)(job.data));

  done();
});