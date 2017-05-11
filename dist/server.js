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

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _bull = require('bull');

var _bull2 = _interopRequireDefault(_bull);

var _app = require('bull-ui/app');

var _app2 = _interopRequireDefault(_app);

var _toureiro = require('toureiro');

var _toureiro2 = _interopRequireDefault(_toureiro);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.load();

var _process$env$REDIS_UR = process.env.REDIS_URL.match(/redis\:\/\/([\d\.]*)\:(\d*)\/(\d*)/),
    _process$env$REDIS_UR2 = (0, _slicedToArray3.default)(_process$env$REDIS_UR, 4),
    host = _process$env$REDIS_UR2[1],
    port = _process$env$REDIS_UR2[2],
    db = _process$env$REDIS_UR2[3];

var twilioQueue = new _bull2.default('twilio', port, host, { db: db });

var matador = (0, _app2.default)({ redis: { port: port, host: host, options: { db: db } } });

var toureiro = (0, _toureiro2.default)({ redis: { port: port, host: host, db: db } });

var server = (0, _express2.default)();

server.use(_bodyParser2.default.urlencoded({ extended: true }));
server.use(_bodyParser2.default.json());

server.post('/confirm', function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res) {
    var result;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:

            console.log('QUEUEING: %s', (0, _stringify2.default)(req.body));

            _context.next = 3;
            return twilioQueue.add(req.body, { attempts: 3, backoff: 5000 });

          case 3:
            result = _context.sent;


            res.status(200).type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');

          case 5:
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

server.use('/jobs', function (req, res, next) {
  req.basepath = '/jobs';
  res.locals.basepath = '/jobs';
  next();
}, matador);

server.use('/toureiro', toureiro);

server.listen(3000, function () {
  console.log('Listening on port 3000...');
});