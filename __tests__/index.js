const SentryTransport = require('../index');

const getMockSentry = () => {
  const mockScope = {
    setLevel: jest.fn(),
    setExtra: jest.fn(),
  };

  return {
    mockScope,
    withScope: jest.fn(cb => {
      cb(mockScope);
    }),
    captureMessage: jest.fn(),
    captureException: jest.fn(),
  }
}

test('instantiates', () => {
  const Sentry = getMockSentry();
  const Transport = new SentryTransport({ Sentry });

  expect(Transport._sentry).toBe(Sentry);
});

test('log calls sentry functions', () => {
  const Sentry = getMockSentry();
  const Transport = new SentryTransport({ Sentry });

  const cb = jest.fn();
  Transport.log('error', 'message', null, cb);

  expect(cb).toHaveBeenCalledWith(null, true);
  expect(Sentry.mockScope.setLevel).toHaveBeenCalledWith('error')
  expect(Sentry.mockScope.setExtra).toHaveBeenCalledWith('context', {});
  expect(Sentry.captureMessage).toHaveBeenCalledWith('message');
});

test('message is formatted when custom formatter has been provided', () => {
  const messageDecoration = '___';
  const errorMessage = 'message';
  const formatter = jest.fn((options) => messageDecoration + options.message);

  const Sentry = getMockSentry();
  const Transport = new SentryTransport({ Sentry, formatter });

  Transport.log('error', errorMessage, null, () => {});

  expect(Sentry.captureMessage).toHaveBeenCalledWith('___message');
});

test(`passes raw exceptions to Sentry's captureException`, () => {
  const exception = new Error('Bad thing');

  const Sentry = getMockSentry();
  const Transport = new SentryTransport({ Sentry });

  Transport.log('error', '', exception, () => {});

  expect(Sentry.captureException).toHaveBeenCalledWith(exception)
  expect(Sentry.captureMessage).not.toHaveBeenCalled();
});
