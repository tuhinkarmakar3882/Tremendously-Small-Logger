import {TSFeatureFlags, TSLogger, TSLoggingHandlerConfig, TSLogLevelFlags} from '../src';

describe('Tremendously Small Logger Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  });

  describe('With Global Monkey Patcher', () => {
    const mockedHandlers: TSLoggingHandlerConfig = {
      log: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
    };

    const logLevelFlags = new TSLogLevelFlags({
      allowWarningLogging: true,
      allowErrorLogging: true,
      allowDebugLogging: true,
      allowDefaultLogging: true,
      allowInfoLogging: true,
      allowTraceLogging: true,
    });
    const logFeatureFlags = new TSFeatureFlags({
      enableGlobalMonkeyPatching: true,
      enableGlobalErrorTracing: true,
      enableStackTraceInErrorLogs: true,
    });

    it('should monkeypatch without errors', () => {
      TSLogger.getInstance({
        features: logFeatureFlags,
        handlers: mockedHandlers,
        logLevelFlags,
        logPrefix: () => `[TSLogger: ${new Date()}]`,
      });

      console.log('Hello, World!');
      expect(mockedHandlers.log).toHaveBeenCalledTimes(1);

      console.info('Hello, World!');
      expect(mockedHandlers.info).toHaveBeenCalledTimes(1);

      console.warn('Hello, World!');
      expect(mockedHandlers.warn).toHaveBeenCalledTimes(1);

      console.error('Hello, World!');
      expect(mockedHandlers.error).toHaveBeenCalledTimes(1);

      console.debug('Hello, World!');
      expect(mockedHandlers.debug).toHaveBeenCalledTimes(1);

      console.trace('Hello, World!');
      expect(mockedHandlers.trace).toHaveBeenCalledTimes(1);
    });

    it('should disable monkeypatch on the fly', () => {
      const logger = TSLogger.getInstance({
        features: logFeatureFlags,
        handlers: mockedHandlers,
        logLevelFlags,
        logPrefix: () => `[TSLogger: ${new Date()}]`,
      });

      logger.disableMonkeyPatching();

      console.log('Hello, World!');
      expect(mockedHandlers.log).toHaveBeenCalledTimes(0);

      console.info('Hello, World!');
      expect(mockedHandlers.info).toHaveBeenCalledTimes(0);

      console.warn('Hello, World!');
      expect(mockedHandlers.warn).toHaveBeenCalledTimes(0);

      console.error('Hello, World!');
      expect(mockedHandlers.error).toHaveBeenCalledTimes(0);

      console.debug('Hello, World!');
      expect(mockedHandlers.debug).toHaveBeenCalledTimes(0);

      console.trace('Hello, World!');
      expect(mockedHandlers.trace).toHaveBeenCalledTimes(0);
    });

    it('should enable monkeypatch on the fly', () => {
      const logger = TSLogger.getInstance({
        features: logFeatureFlags,
        handlers: mockedHandlers,
        logLevelFlags,
        logPrefix: () => `[TSLogger: ${new Date()}]`,
      });

      logger.disableMonkeyPatching();

      console.log('Hello, World!');
      expect(mockedHandlers.log).toHaveBeenCalledTimes(0);

      console.info('Hello, World!');
      expect(mockedHandlers.info).toHaveBeenCalledTimes(0);

      console.warn('Hello, World!');
      expect(mockedHandlers.warn).toHaveBeenCalledTimes(0);

      console.error('Hello, World!');
      expect(mockedHandlers.error).toHaveBeenCalledTimes(0);

      console.debug('Hello, World!');
      expect(mockedHandlers.debug).toHaveBeenCalledTimes(0);

      console.trace('Hello, World!');
      expect(mockedHandlers.trace).toHaveBeenCalledTimes(0);

      logger.enableMonkeyPatch();

      console.log('Hello, World!');
      expect(mockedHandlers.log).toHaveBeenCalledTimes(1);

      console.info('Hello, World!');
      expect(mockedHandlers.info).toHaveBeenCalledTimes(1);

      console.warn('Hello, World!');
      expect(mockedHandlers.warn).toHaveBeenCalledTimes(1);

      console.error('Hello, World!');
      expect(mockedHandlers.error).toHaveBeenCalledTimes(1);

      console.debug('Hello, World!');
      expect(mockedHandlers.debug).toHaveBeenCalledTimes(1);

      console.trace('Hello, World!');
      expect(mockedHandlers.trace).toHaveBeenCalledTimes(1);
    });
  });

  describe('Without Monkey Patcher', () => {
    beforeEach(() => {
      TSLogger.killInstance()
    });

    const mockedHandlers: TSLoggingHandlerConfig = {
      log: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
    };

    const logLevelFlags = new TSLogLevelFlags({
      allowWarningLogging: true,
      allowErrorLogging: true,
      allowDebugLogging: true,
      allowDefaultLogging: true,
      allowInfoLogging: true,
    });
    const logFeatureFlags = new TSFeatureFlags({
      enableGlobalMonkeyPatching: false,
      enableGlobalErrorTracing: true,
      enableStackTraceInErrorLogs: true,
    });

    it('should not monkeypatch', () => {
      const logger = TSLogger.getInstance({
        features: logFeatureFlags,
        handlers: mockedHandlers,
        logLevelFlags,
        logPrefix: () => `[TSLogger: ${new Date()}]`,
      });

      logger.disableMonkeyPatching();

      console.log('Hello, World!');
      console.info('Hello, World!');
      console.warn('Hello, World!');
      console.error('Hello, World!');
      console.debug('Hello, World!');
      console.trace('Hello, World!');

      expect(jest.fn()).toHaveBeenCalledTimes(0);
      expect(jest.fn()).toHaveBeenCalledTimes(0);
      expect(jest.fn()).toHaveBeenCalledTimes(0);
      expect(mockedHandlers.error).toHaveBeenCalledTimes(0);
      expect(mockedHandlers.debug).toHaveBeenCalledTimes(0);
      expect(mockedHandlers.trace).toHaveBeenCalledTimes(0);

      logger.log('Hello, World!');
      logger.info('Hello, World!');
      logger.warn('Hello, World!');
      logger.error('Hello, World!');
      logger.debug('Hello, World!');
      logger.trace('Hello, World!');

      expect(mockedHandlers.log).toHaveBeenCalledTimes(1);
      expect(mockedHandlers.info).toHaveBeenCalledTimes(1);
      expect(mockedHandlers.warn).toHaveBeenCalledTimes(1);
      expect(mockedHandlers.error).toHaveBeenCalledTimes(1);
      expect(mockedHandlers.debug).toHaveBeenCalledTimes(1);
      expect(mockedHandlers.trace).toHaveBeenCalledTimes(2);
    });
  });

  describe('With Partial Monkey Patcher', () => {
    beforeEach(() => {
      TSLogger.killInstance()
    });

    const logLevelFlags = new TSLogLevelFlags({
      allowWarningLogging: true,
      allowErrorLogging: true,
      allowDebugLogging: true,
      allowDefaultLogging: true,
      allowInfoLogging: true,
      allowTraceLogging: true,
    });

    const commonFeatureOptions = {
      enableGlobalMonkeyPatching: false,
      enableGlobalErrorTracing: false,
      enableStackTraceInErrorLogs: false,
    };

    it('should only monkeypatch console.log', () => {
      const mockedHandlers: TSLoggingHandlerConfig = {
        log: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        trace: jest.fn(),
      };

      const logFeatureFlags = new TSFeatureFlags({
        ...commonFeatureOptions,
        partialMonkeyPatchConfig: { log: true },
      });

      TSLogger.getInstance({
        features: logFeatureFlags,
        handlers: mockedHandlers,
        logLevelFlags,
        logPrefix: () => `[TSLogger: ${new Date()}]`,
      });

      console.log('Hello, World!');
      expect(mockedHandlers.log).toHaveBeenCalledTimes(1);

      console.info('Hello, World!');
      expect(mockedHandlers.info).toHaveBeenCalledTimes(0);

      console.warn('Hello, World!');
      expect(mockedHandlers.warn).toHaveBeenCalledTimes(0);

      console.error('Hello, World!');
      expect(mockedHandlers.error).toHaveBeenCalledTimes(0);

      console.debug('Hello, World!');
      expect(mockedHandlers.debug).toHaveBeenCalledTimes(0);

      console.trace('Hello, World!');
      expect(mockedHandlers.trace).toHaveBeenCalledTimes(0);
    });

    it('should only monkeypatch console.info', () => {
      const mockedHandlers: TSLoggingHandlerConfig = {
        log: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        trace: jest.fn(),
      };

      const logFeatureFlags = new TSFeatureFlags({
        ...commonFeatureOptions,
        partialMonkeyPatchConfig: { info: true },
      });

      TSLogger.getInstance({
        features: logFeatureFlags,
        handlers: mockedHandlers,
        logLevelFlags,
        logPrefix: () => `[TSLogger: ${new Date()}]`,
      });

      console.log('Hello, World!');
      expect(mockedHandlers.log).toHaveBeenCalledTimes(0);

      console.info('Hello, World!');
      expect(mockedHandlers.info).toHaveBeenCalledTimes(1);

      console.warn('Hello, World!');
      expect(mockedHandlers.warn).toHaveBeenCalledTimes(0);

      console.error('Hello, World!');
      expect(mockedHandlers.error).toHaveBeenCalledTimes(0);

      console.debug('Hello, World!');
      expect(mockedHandlers.debug).toHaveBeenCalledTimes(0);

      console.trace('Hello, World!');
      expect(mockedHandlers.trace).toHaveBeenCalledTimes(0);
    });

    it('should only monkeypatch console.warn', () => {
      const mockedHandlers: TSLoggingHandlerConfig = {
        log: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        trace: jest.fn(),
      };

      const logFeatureFlags = new TSFeatureFlags({
        ...commonFeatureOptions,
        partialMonkeyPatchConfig: { warning: true },
      });

      TSLogger.getInstance({
        features: logFeatureFlags,
        handlers: mockedHandlers,
        logLevelFlags,
        logPrefix: () => `[TSLogger: ${new Date()}]`,
      });

      console.log('Hello, World!');
      expect(mockedHandlers.log).toHaveBeenCalledTimes(0);

      console.info('Hello, World!');
      expect(mockedHandlers.info).toHaveBeenCalledTimes(0);

      console.warn('Hello, World!');
      expect(mockedHandlers.warn).toHaveBeenCalledTimes(1);

      console.error('Hello, World!');
      expect(mockedHandlers.error).toHaveBeenCalledTimes(0);

      console.debug('Hello, World!');
      expect(mockedHandlers.debug).toHaveBeenCalledTimes(0);

      console.trace('Hello, World!');
      expect(mockedHandlers.trace).toHaveBeenCalledTimes(0);
    });

    it('should only monkeypatch console.debug', () => {
      const mockedHandlers: TSLoggingHandlerConfig = {
        log: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        trace: jest.fn(),
      };

      const logFeatureFlags = new TSFeatureFlags({
        ...commonFeatureOptions,
        partialMonkeyPatchConfig: { debug: true },
      });

      TSLogger.getInstance({
        features: logFeatureFlags,
        handlers: mockedHandlers,
        logLevelFlags,
        logPrefix: () => `[TSLogger: ${new Date()}]`,
      });

      console.log('Hello, World!');
      expect(mockedHandlers.log).toHaveBeenCalledTimes(0);

      console.info('Hello, World!');
      expect(mockedHandlers.info).toHaveBeenCalledTimes(0);

      console.warn('Hello, World!');
      expect(mockedHandlers.warn).toHaveBeenCalledTimes(0);

      console.error('Hello, World!');
      expect(mockedHandlers.error).toHaveBeenCalledTimes(0);

      console.debug('Hello, World!');
      expect(mockedHandlers.debug).toHaveBeenCalledTimes(1);

      console.trace('Hello, World!');
      expect(mockedHandlers.trace).toHaveBeenCalledTimes(0);
    });

    it('should only monkeypatch console.error', () => {
      const mockedHandlers: TSLoggingHandlerConfig = {
        log: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        trace: jest.fn(),
      };

      const logFeatureFlags = new TSFeatureFlags({
        ...commonFeatureOptions,
        partialMonkeyPatchConfig: { error: true },
      });

      TSLogger.getInstance({
        features: logFeatureFlags,
        handlers: mockedHandlers,
        logLevelFlags,
        logPrefix: () => `[TSLogger: ${new Date()}]`,
      });

      console.log('Hello, World!');
      expect(mockedHandlers.log).toHaveBeenCalledTimes(0);

      console.info('Hello, World!');
      expect(mockedHandlers.info).toHaveBeenCalledTimes(0);

      console.warn('Hello, World!');
      expect(mockedHandlers.warn).toHaveBeenCalledTimes(0);

      console.error('Hello, World!');
      expect(mockedHandlers.error).toHaveBeenCalledTimes(1);

      console.debug('Hello, World!');
      expect(mockedHandlers.debug).toHaveBeenCalledTimes(0);

      console.trace('Hello, World!');
      expect(mockedHandlers.trace).toHaveBeenCalledTimes(0);
    });

    it('should only monkeypatch console.trace', () => {
      const mockedHandlers: TSLoggingHandlerConfig = {
        log: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        trace: jest.fn(),
      };

      const logFeatureFlags = new TSFeatureFlags({
        ...commonFeatureOptions,
        partialMonkeyPatchConfig: { trace: true },
      });

      TSLogger.getInstance({
        features: logFeatureFlags,
        handlers: mockedHandlers,
        logLevelFlags,
        logPrefix: () => `[TSLogger: ${new Date()}]`,
      });

      console.log('Hello, World!');
      expect(mockedHandlers.log).toHaveBeenCalledTimes(0);

      console.info('Hello, World!');
      expect(mockedHandlers.info).toHaveBeenCalledTimes(0);

      console.warn('Hello, World!');
      expect(mockedHandlers.warn).toHaveBeenCalledTimes(0);

      console.error('Hello, World!');
      expect(mockedHandlers.error).toHaveBeenCalledTimes(0);

      console.debug('Hello, World!');
      expect(mockedHandlers.debug).toHaveBeenCalledTimes(0);

      console.trace('Hello, World!');
      expect(mockedHandlers.trace).toHaveBeenCalledTimes(1);
    });
  });
});
