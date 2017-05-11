'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _bull = require('bull');

var _bull2 = _interopRequireDefault(_bull);

var _twilio = require('twilio');

var _twilio2 = _interopRequireDefault(_twilio);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.load();

var twilio = (0, _twilio2.default)(process.env.TWILIO_ID, process.env.TWILIO_TOKEN);

var _process$env$REDIS_UR = process.env.REDIS_URL.match(/redis\:\/\/([\d\.]*)\:(\d*)\/(\d*)/),
    _process$env$REDIS_UR2 = (0, _slicedToArray3.default)(_process$env$REDIS_UR, 4),
    host = _process$env$REDIS_UR2[1],
    port = _process$env$REDIS_UR2[2],
    db = _process$env$REDIS_UR2[3];

var twilioQueue = new _bull2.default('twilio', port, host, { db: db });

twilioQueue.process(function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(job, done) {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:

            console.log('PROCESSING: %s', (0, _stringify2.default)(job.data));

            if (!(job.data.Body === 'boom')) {
              _context.next = 3;
              break;
            }

            return _context.abrupt('return', done(Error('foo')));

          case 3:
            _context.next = 5;
            return twilio.messages.create({
              from: process.env.TWILIO_PHONE,
              to: job.data.From,
              body: 'You texted: \'' + job.data.Body + '\''
            });

          case 5:

            done();

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());

twilioQueue.on('failed', function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(job, err) {
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!(job.attemptsMade < job.opts.attempts)) {
              _context2.next = 2;
              break;
            }

            return _context2.abrupt('return', console.log('failed'));

          case 2:
            _context2.next = 4;
            return twilio.messages.create({
              from: process.env.TWILIO_PHONE,
              to: job.data.From,
              body: 'I couldnt send your text. I give up...'
            });

          case 4:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());

twilioQueue.on('completed', function (job, result) {
  console.log('completed');
});