import {ICustomLoggingHandlers, ICustomLogLevelFlags, ILoggerOptions, IRunWithAugmentationProps} from "./types"

export class TSLogger {
  private static _logger: TSLogger

  private readonly _originalConsoleLogMethod: (...args) => void
  private readonly _originalConsoleInfoMethod: (...args) => void
  private readonly _originalConsoleErrorMethod: (...args) => void
  private readonly _originalConsoleDebugMethod: (...args) => void
  private readonly _originalConsoleWarningMethod: (...args) => void

  private readonly _handlers: ICustomLoggingHandlers
  private readonly _logLevelFlags: ICustomLogLevelFlags

  private readonly _enableGlobalErrorTracing?: boolean
  private readonly _enableStackTraceInErrorLogs?: boolean
  private readonly _logPrefix: Function | string;

  private _isMonkeyPatched?: boolean

  private constructor(options: ILoggerOptions) {
    this._handlers = options.handlers || {}
    this._logLevelFlags = options.logLevelFlags || {}
    this._isMonkeyPatched = options.enableMonkeyPatch || false
    this._enableStackTraceInErrorLogs = options.enableStackTraceInErrorLogs || false
    this._enableGlobalErrorTracing = options.enableGlobalErrorTracing || false
    this._logPrefix = options.prefixFunc ? options.prefixFunc : '[TSLogger]'

    this._originalConsoleLogMethod = console.log
    this._originalConsoleInfoMethod = console.info
    this._originalConsoleErrorMethod = console.error
    this._originalConsoleDebugMethod = console.debug
    this._originalConsoleWarningMethod = console.warn


    if (this._isMonkeyPatched) {
      this._performMonkeyPatching()
    }

    if (this._enableGlobalErrorTracing) {
      this._activateGlobalErrorTracing()
    }
  }

  static getInstance(options?: ILoggerOptions): TSLogger {
    if (!this._logger) {
      this._logger = new TSLogger({...options})
    }

    return this._logger
  }

  log(...args) {
    if (!this._logLevelFlags?.allowDefaultLogging) return

    const newArgs = this._getFinalArgs(args);

    this._runWithAugmentation({
      func: () => console.log(...newArgs),
      handler: this._handlers?.log
    })
  }

  info(...args) {
    if (!this._logLevelFlags?.allowInfoLogging) return

    const newArgs = this._getFinalArgs(args);

    this._runWithAugmentation({
      func: () => console.info(...newArgs),
      handler: this._handlers?.info
    })
  }

  error(...args) {
    if (!this._logLevelFlags?.allowErrorLogging) return

    const newArgs = this._getFinalArgs(args);
    const trace = this.trace.bind(this)
    const _enableStackTraceInErrorLogs = this._enableStackTraceInErrorLogs

    this._runWithAugmentation({
      func: () => {
        console.error(...newArgs)

        if (_enableStackTraceInErrorLogs) {
          trace(...newArgs)
        }
      },
      handler: this._handlers?.error
    })
  }

  trace(...args) {
    const newArgs = this._getFinalArgs(args);

    this._runWithAugmentation({
      func: () => console.trace(...newArgs),
      handler: this._handlers?.trace
    })
  }

  debug(...args) {
    if (!this._logLevelFlags?.allowDebugLogging) return

    const newArgs = this._getFinalArgs(args);

    this._runWithAugmentation({
      func: () => console.debug(...newArgs),
      handler: this._handlers?.debug
    })
  }

  warn(...args) {
    if (!this._logLevelFlags?.allowWarningLogging) return

    const newArgs = this._getFinalArgs(args);

    this._runWithAugmentation({
      func: () => console.warn(...newArgs),
      handler: this._handlers?.warn
    })
  }

  disableMonkeyPatching() {
    if (!this._isMonkeyPatched) return

    console.log = this._originalConsoleLogMethod as () => void
    console.info = this._originalConsoleInfoMethod as () => void
    console.error = this._originalConsoleErrorMethod as () => void
    console.debug = this._originalConsoleDebugMethod as () => void
    console.warn = this._originalConsoleWarningMethod as () => void

    this._isMonkeyPatched = false
  }

  private _getFinalArgs(args: any[], overrideMode = false): any[] {
    const prefix = typeof this._logPrefix === 'function' ? this._logPrefix() : this._logPrefix

    if (overrideMode) {
      return [prefix, ...args];
    }

    return this._isMonkeyPatched ? args : [prefix, ...args];
  }

  private _runWithAugmentation({func, handler}: IRunWithAugmentationProps) {
    if (handler) handler()

    func()
  }

  private _performMonkeyPatching() {
    if (this._logLevelFlags?.allowDefaultLogging) {
      this._monkeyPatchConsoleLog()
    }

    if (this._logLevelFlags?.allowInfoLogging) {
      this._monkeyPatchConsoleInfo()
    }

    if (this._logLevelFlags?.allowErrorLogging) {
      this._monkeyPatchConsoleError()
    }

    if (this._logLevelFlags?.allowDebugLogging) {
      this._monkeyPatchConsoleDebug()
    }

    if (this._logLevelFlags?.allowWarningLogging) {
      this._monkeyPatchConsoleWarn()
    }
  }

  private _monkeyPatchConsoleWarn() {
    const originalConsoleWarnMethod = this._originalConsoleWarningMethod
    const boundedGetFinalArgs = this._getFinalArgs.bind(this)
    const boundedRunWithAugmentation = this._runWithAugmentation.bind(this)
    const boundedWarnHandler = this._handlers?.warn

    console.warn = function () {
      const args = boundedGetFinalArgs(Array.from(arguments), true)

      boundedRunWithAugmentation({
        func: () => originalConsoleWarnMethod.apply(console, args),
        handler: boundedWarnHandler
      })
    }
  }

  private _monkeyPatchConsoleDebug() {
    const originalConsoleDebugMethod = this._originalConsoleDebugMethod
    const boundedGetFinalArgs = this._getFinalArgs.bind(this)
    const boundedRunWithAugmentation = this._runWithAugmentation.bind(this)
    const boundedDebugHandler = this._handlers?.debug

    console.debug = function () {
      const args = boundedGetFinalArgs(Array.from(arguments), true)

      boundedRunWithAugmentation({
        func: () => originalConsoleDebugMethod.apply(console, args),
        handler: boundedDebugHandler
      })
    }
  }

  private _monkeyPatchConsoleError() {
    const originalConsoleErrorMethod = this._originalConsoleErrorMethod
    const boundedGetFinalArgs = this._getFinalArgs.bind(this)
    const boundedRunWithAugmentation = this._runWithAugmentation.bind(this)
    const boundedErrorHandler = this._handlers?.error

    console.error = function () {
      const args = boundedGetFinalArgs(Array.from(arguments), true)

      boundedRunWithAugmentation({
        func: () => originalConsoleErrorMethod.apply(console, args),
        handler: boundedErrorHandler
      })
    }
  }

  private _monkeyPatchConsoleInfo() {
    const originalConsoleInfoMethod = this._originalConsoleInfoMethod
    const boundedGetFinalArgs = this._getFinalArgs.bind(this)
    const boundedRunWithAugmentation = this._runWithAugmentation.bind(this)
    const boundedInfoHandler = this._handlers?.info

    console.info = function () {
      const args = boundedGetFinalArgs(Array.from(arguments), true)

      boundedRunWithAugmentation({
        func: () => originalConsoleInfoMethod.apply(console, args),
        handler: boundedInfoHandler
      })
    }
  }

  private _monkeyPatchConsoleLog() {
    const originalConsoleLogMethod = this._originalConsoleLogMethod
    const boundedGetFinalArgs = this._getFinalArgs.bind(this)
    const boundedRunWithAugmentation = this._runWithAugmentation.bind(this)
    const boundedLogHandler = this._handlers?.log

    console.log = function () {
      const args = boundedGetFinalArgs(Array.from(arguments), true)

      boundedRunWithAugmentation({
        func: () => originalConsoleLogMethod.apply(console, args),
        handler: boundedLogHandler
      })
    }
  }

  private _activateGlobalErrorTracing() {
    const boundedTrace = this.trace.bind(this)

    const isBrowser = new Function("try {return this===window}catch(e){ return false}")

    if (isBrowser()) {
      window.addEventListener('error', boundedTrace)
      return
    }

    const isNode = new Function("try {return this===global}catch(e){return false}")

    if (isNode()) {
      process.on('unhandledRejection', (reason, p) => {
        boundedTrace(reason, 'Unhandled Rejection at Promise', p);
      }).on('uncaughtException', err => {
        boundedTrace(err, 'Uncaught Exception thrown');
        process.exit(1);
      })
    }
  }
}

export default TSLogger
