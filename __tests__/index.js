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
