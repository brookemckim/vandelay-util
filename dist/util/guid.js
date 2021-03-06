'use strict';

exports.__esModule = true;

var _aguid = require('aguid');

var _aguid2 = _interopRequireDefault(_aguid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (...v) => {
  const args = v.filter(i => i != null);
  if (args.length === 0) return;
  return (0, _aguid2.default)(args.join('-'));
};

module.exports = exports.default;