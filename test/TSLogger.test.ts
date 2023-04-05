import {TSFeatureFlags, TSLogger, TSLoggingHandlerConfig, TSLogLevelFlags} from "../src";


describe('Tremendously Small Logger Tests', () => {
  const mockedHandlerForConsoleLog = jest.fn()
  const mockedHandlerForConsoleInfo = jest.fn()
  const mockedHandlerForConsoleWarn = jest.fn()
  const mockedHandlerForConsoleError = jest.fn()
  const mockedHandlerForConsoleDebug = jest.fn()
  const mockedHandlerForConsoleTrace = jest.fn()
  const mockedHandlers: TSLoggingHandlerConfig = {
    log: (...args) => mockedHandlerForConsoleLog(...args),
    info: (...args) => mockedHandlerForConsoleInfo(...args),
    warn: (...args) => mockedHandlerForConsoleWarn(...args),
    error: (...args) => mockedHandlerForConsoleError(...args),
    debug: (...args) => mockedHandlerForConsoleDebug(...args),
    trace: (...args) => mockedHandlerForConsoleTrace(...args),
  }

  describe('With Monkey Patcher', () => {
    beforeEach(jest.clearAllMocks)

    const logLevelFlags = new TSLogLevelFlags({
      allowWarningLogging: true,
      allowErrorLogging: true,
      allowDebugLogging: true,
      allowDefaultLogging: true,
      allowInfoLogging: true,
    })
    const logFeatureFlags = new TSFeatureFlags({
      enableMonkeyPatch: true,
      enableGlobalErrorTracing: true,
      enableStackTraceInErrorLogs: true,
    })

    it('should monkeypatch without errors', () => {
      TSLogger.getInstance({
        features: logFeatureFlags,
        handlers: mockedHandlers,
        logLevelFlags,
        logPrefix: () => `[TSLogger: ${new Date()}]`,
      })

      console.log('Hello, World!')
      expect(mockedHandlerForConsoleLog).toBeCalledTimes(1)

      console.info('Hello, World!')
      expect(mockedHandlerForConsoleInfo).toBeCalledTimes(1)

      console.warn('Hello, World!')
      expect(mockedHandlerForConsoleWarn).toBeCalledTimes(1)

      console.error('Hello, World!')
      expect(mockedHandlerForConsoleError).toBeCalledTimes(1)

      console.debug('Hello, World!')
      expect(mockedHandlerForConsoleDebug).toBeCalledTimes(1)

      console.trace('Hello, World!')
      expect(mockedHandlerForConsoleTrace).toBeCalledTimes(1)
    });

    it('should disable monkeypatch on the fly', () => {
      const logger = TSLogger.getInstance({
        features: logFeatureFlags,
        handlers: mockedHandlers,
        logLevelFlags,
        logPrefix: () => `[TSLogger: ${new Date()}]`,
      })

      logger.disableMonkeyPatching()

      console.log('Hello, World!')
      expect(mockedHandlerForConsoleLog).toBeCalledTimes(0)

      console.info('Hello, World!')
      expect(mockedHandlerForConsoleInfo).toBeCalledTimes(0)

      console.warn('Hello, World!')
      expect(mockedHandlerForConsoleWarn).toBeCalledTimes(0)

      console.error('Hello, World!')
      expect(mockedHandlerForConsoleError).toBeCalledTimes(0)

      console.debug('Hello, World!')
      expect(mockedHandlerForConsoleDebug).toBeCalledTimes(0)

      console.trace('Hello, World!')
      expect(mockedHandlerForConsoleTrace).toBeCalledTimes(0)
    });

    it('should enable monkeypatch on the fly', () => {
      const logger = TSLogger.getInstance({
        features: logFeatureFlags,
        handlers: mockedHandlers,
        logLevelFlags,
        logPrefix: () => `[TSLogger: ${new Date()}]`,
      })

      logger.disableMonkeyPatching()

      console.log('Hello, World!')
      expect(mockedHandlerForConsoleLog).toBeCalledTimes(0)

      console.info('Hello, World!')
      expect(mockedHandlerForConsoleInfo).toBeCalledTimes(0)

      console.warn('Hello, World!')
      expect(mockedHandlerForConsoleWarn).toBeCalledTimes(0)

      console.error('Hello, World!')
      expect(mockedHandlerForConsoleError).toBeCalledTimes(0)

      console.debug('Hello, World!')
      expect(mockedHandlerForConsoleDebug).toBeCalledTimes(0)

      console.trace('Hello, World!')
      expect(mockedHandlerForConsoleTrace).toBeCalledTimes(0)


      logger.enableMonkeyPatch()
      console.log('Hello, World!')
      expect(mockedHandlerForConsoleLog).toBeCalledTimes(1)

      console.info('Hello, World!')
      expect(mockedHandlerForConsoleInfo).toBeCalledTimes(1)

      console.warn('Hello, World!')
      expect(mockedHandlerForConsoleWarn).toBeCalledTimes(1)

      console.error('Hello, World!')
      expect(mockedHandlerForConsoleError).toBeCalledTimes(1)

      console.debug('Hello, World!')
      expect(mockedHandlerForConsoleDebug).toBeCalledTimes(1)

      console.trace('Hello, World!')
      expect(mockedHandlerForConsoleTrace).toBeCalledTimes(1)
    });
  })

  describe('Without Monkey Patcher', () => {
    beforeEach(jest.clearAllMocks)

    const logLevelFlags = new TSLogLevelFlags({
      allowWarningLogging: true,
      allowErrorLogging: true,
      allowDebugLogging: true,
      allowDefaultLogging: true,
      allowInfoLogging: true,
    })
    const logFeatureFlags = new TSFeatureFlags({
      enableMonkeyPatch: false,
      enableGlobalErrorTracing: true,
      enableStackTraceInErrorLogs: true,
    })

    it('should not monkeypatch', () => {
      const logger = TSLogger.getInstance({
        features: logFeatureFlags,
        handlers: mockedHandlers,
        logLevelFlags,
        logPrefix: () => `[TSLogger: ${new Date()}]`,
      })
      logger.disableMonkeyPatching()

      console.log('Hello, World!')
      console.info('Hello, World!')
      console.warn('Hello, World!')
      console.error('Hello, World!')
      console.debug('Hello, World!')
      console.trace('Hello, World!')

      expect(mockedHandlerForConsoleLog).toBeCalledTimes(0)
      expect(mockedHandlerForConsoleInfo).toBeCalledTimes(0)
      expect(mockedHandlerForConsoleWarn).toBeCalledTimes(0)
      expect(mockedHandlerForConsoleError).toBeCalledTimes(0)
      expect(mockedHandlerForConsoleDebug).toBeCalledTimes(0)
      expect(mockedHandlerForConsoleTrace).toBeCalledTimes(0)


      logger.log('Hello, World!')
      logger.info('Hello, World!')
      logger.warn('Hello, World!')
      logger.error('Hello, World!')
      logger.debug('Hello, World!')
      logger.trace('Hello, World!')

      expect(mockedHandlerForConsoleLog).toBeCalledTimes(1)
      expect(mockedHandlerForConsoleInfo).toBeCalledTimes(1)
      expect(mockedHandlerForConsoleWarn).toBeCalledTimes(1)
      expect(mockedHandlerForConsoleError).toBeCalledTimes(1)
      expect(mockedHandlerForConsoleDebug).toBeCalledTimes(1)
      expect(mockedHandlerForConsoleTrace).toBeCalledTimes(2)
    });
  })
})
