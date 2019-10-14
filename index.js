const _ = require('lodash');
const Winston = require('winston');

module.exports = class SentryTransport extends Winston.Transport {
  constructor(options) {
    options = options || {};
    options = _.defaultsDeep(options, {
      name: 'SentryTransport',
      silent: false,
      level: 'error',
      levelsMap: {
        silly: 'debug',
        verbose: 'debug',
        info: 'info',
        debug: 'debug',
        warn: 'warning',
        error: 'error'
      }
    });

    super(_.omit(options, [
      'Sentry',
      'levelsMap'
    ]));

    this._sentry = options.Sentry;
    this._silent = options.silent;
    this._levelsMap = options.levelsMap;
  }

  log(level, msg, meta, next) {
    if (this.silent) return next(null, true);
    if (!(level in this._levelsMap)) return next(null, true);

    if (typeof this.formatter === 'function') {
      msg = this.formatter(msg);
    }

    if (_.isError(meta)) {
      this._sentry.captureException(meta);
      return next(null, true);
    }
    this._sentry.withScope(scope => {
      const context = _.isObject(meta) ? meta : {};
      scope.setLevel(this._levelsMap[level]);
      scope.setExtra('context', context);
      this._sentry.captureMessage(msg);

      next(null, true);
    });
  }
}
