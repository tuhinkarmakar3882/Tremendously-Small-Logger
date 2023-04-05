import { TSLogLevelFlags } from "../TSFlags/logLevelFlags";
import { TSFeatureFlags } from "../TSFlags/featureFlags";
import { TSOriginalConsoleClass } from "../TSOriginalConsoleClass";
import { TSLoggingHandlerConfig } from "./types";
import { TSLoggerUtility } from "../Utility";

interface IRunWithAugmentationProps {
  func: Function
  handler: Function
}

interface TSLoggerProps {
  features?: TSFeatureFlags
  logLevelFlags?: TSLogLevelFlags

  handlers?: TSLoggingHandlerConfig
  logPrefix?: Function | string
}

export class TSLogger {
  private static _logger: TSLogger

  private readonly _handlers: TSLoggingHandlerConfig
  private readonly _logLevelFlags: TSLogLevelFlags
  private readonly _logFeatureFlags: TSFeatureFlags
  private readonly _originalConsoleClass: TSOriginalConsoleClass

  private readonly _logPrefix: Function | string;

  private _isMonkeyPatched?: boolean

  private constructor(options: TSLoggerProps) {
    this._handlers = options.handlers || {}
    this._logFeatureFlags = options.features || new TSFeatureFlags()
    this._logLevelFlags = options.logLevelFlags || new TSLogLevelFlags()

    this._isMonkeyPatched = this._logFeatureFlags.enableMonkeyPatch
    this._logPrefix = options.logPrefix ? options.logPrefix : '[TSLogger]'

    this._originalConsoleClass = new TSOriginalConsoleClass(console)

    if (this._isMonkeyPatched) {
      this._performMonkeyPatching()
    }

    if (this._logFeatureFlags.enableGlobalErrorTracing) {
      this._activateGlobalErrorTracing()
    }
  }

  static getInstance(options?: TSLoggerProps): TSLogger {
    if (!this._logger) {
      this._logger = new TSLogger({...options})
    }

    return this._logger
  }

  log(...args) {
    if (!this._logLevelFlags?.allowDefaultLogging) return

    const newArgs = this._getFinalArgs(args);
    const boundedHandler = this._handlers?.log

    this._runWithAugmentation({
      func: () => console.log(...newArgs),
      handler: () => {
        if (typeof boundedHandler !== 'function') return

        boundedHandler(...args)
      }
    })
  }

  info(...args) {
    if (!this._logLevelFlags?.allowInfoLogging) return

    const newArgs = this._getFinalArgs(args);
    const boundedHandler = this._handlers?.info

    this._runWithAugmentation({
      func: () => console.info(...newArgs),
      handler: () => {
        if (typeof boundedHandler !== 'function') return

        boundedHandler(...args)
      }
    })
  }

  error(...args) {
    if (!this._logLevelFlags?.allowErrorLogging) return

    const newArgs = this._getFinalArgs(args);
    const boundedHandler = this._handlers?.error

    const boundedTraceHandler = this.trace.bind(this)
    const _enableStackTraceInErrorLogs = this._logFeatureFlags.enableStackTraceInErrorLogs

    this._runWithAugmentation({
      func: () => {
        console.error(...newArgs)

        if (_enableStackTraceInErrorLogs) {
          boundedTraceHandler(...newArgs)
        }
      },
      handler: () => {
        if (typeof boundedHandler !== 'function') return

        boundedHandler(...args)
      }
    })
  }

  trace(...args) {
    const newArgs = this._getFinalArgs(args);
    const boundedHandler = this._handlers?.trace

    this._runWithAugmentation({
      func: () => console.trace(...newArgs),
      handler: () => {
        if (typeof boundedHandler !== 'function') return

        boundedHandler(...args)
      }
    })
  }

  debug(...args) {
    if (!this._logLevelFlags?.allowDebugLogging) return

    const newArgs = this._getFinalArgs(args);
    const boundedHandler = this._handlers?.debug

    this._runWithAugmentation({
      func: () => console.debug(...newArgs),
      handler: () => {
        if (typeof boundedHandler !== 'function') return

        boundedHandler(...args)
      }
    })
  }

  warn(...args) {
    if (!this._logLevelFlags?.allowWarningLogging) return

    const newArgs = this._getFinalArgs(args);
    const boundedHandler = this._handlers?.warn

    this._runWithAugmentation({
      func: () => console.warn(...newArgs),
      handler: () => {
        if (typeof boundedHandler !== 'function') return

        boundedHandler(...args)
      }
    })
  }

  disableMonkeyPatching() {
    if (!this._isMonkeyPatched) return

    console.log = this._originalConsoleClass.logMethod
    console.info = this._originalConsoleClass.infoMethod
    console.error = this._originalConsoleClass.errorMethod
    console.debug = this._originalConsoleClass.debugMethod
    console.warn = this._originalConsoleClass.warnMethod
    console.trace = this._originalConsoleClass.traceMethod

    this._isMonkeyPatched = false
  }

  enableMonkeyPatch() {
    if (this._isMonkeyPatched) return

    this._performMonkeyPatching()

    this._isMonkeyPatched = true
  }

  private _getFinalArgs(args: any[], overrideMode = false): any[] {
    const prefix = typeof this._logPrefix === 'function' ? this._logPrefix() : this._logPrefix

    if (overrideMode) {
      return [prefix, ...args];
    }

    return this._isMonkeyPatched ? args : [prefix, ...args];
  }

  private _runWithAugmentation({func, handler}: IRunWithAugmentationProps) {
    handler()
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

    this._monkeyPatchConsoleTrace()
  }

  private _monkeyPatchConsoleWarn() {
    const boundedHandler = this._handlers?.warn
    const boundedGetFinalArgs = this._getFinalArgs.bind(this)
    const boundedRunWithAugmentation = this._runWithAugmentation.bind(this)

    const originalConsoleWarnMethod = this._originalConsoleClass.warnMethod

    console.warn = (...funcArgs) => {
      const args = boundedGetFinalArgs(funcArgs, true)

      boundedRunWithAugmentation({
        func: () => originalConsoleWarnMethod.apply(console, args),
        handler: () => {
          if (typeof boundedHandler !== 'function') return

          boundedHandler(...args)
        }
      })
    }
  }

  private _monkeyPatchConsoleDebug() {
    const boundedHandler = this._handlers?.debug
    const boundedGetFinalArgs = this._getFinalArgs.bind(this)
    const boundedRunWithAugmentation = this._runWithAugmentation.bind(this)

    const originalConsoleDebugMethod = this._originalConsoleClass.debugMethod

    console.debug = (...funcArgs) => {
      const args = boundedGetFinalArgs(funcArgs, true)

      boundedRunWithAugmentation({
        func: () => originalConsoleDebugMethod.apply(console, args),
        handler: () => {
          if (typeof boundedHandler !== 'function') return

          boundedHandler(...args)
        }
      })
    }
  }

  private _monkeyPatchConsoleError() {
    const boundedHandler = this._handlers?.error
    const boundedGetFinalArgs = this._getFinalArgs.bind(this)
    const boundedRunWithAugmentation = this._runWithAugmentation.bind(this)

    const originalConsoleErrorMethod = this._originalConsoleClass.errorMethod

    console.error = (...funcArgs) => {
      const args = boundedGetFinalArgs(funcArgs, true)

      boundedRunWithAugmentation({
        func: () => originalConsoleErrorMethod.apply(console, args),
        handler: () => {
          if (typeof boundedHandler !== 'function') return

          boundedHandler(...args)
        }
      })
    }
  }

  private _monkeyPatchConsoleInfo() {
    const boundedHandler = this._handlers?.info
    const boundedGetFinalArgs = this._getFinalArgs.bind(this)
    const boundedRunWithAugmentation = this._runWithAugmentation.bind(this)

    const originalConsoleInfoMethod = this._originalConsoleClass.infoMethod

    console.info = (...funcArgs) => {
      const args = boundedGetFinalArgs(funcArgs, true)

      boundedRunWithAugmentation({
        func: () => originalConsoleInfoMethod.apply(console, args),
        handler: () => {
          if (typeof boundedHandler !== 'function') return

          boundedHandler(...args)
        }
      })
    }
  }

  private _monkeyPatchConsoleLog() {
    const boundedHandler = this._handlers?.log
    const boundedGetFinalArgs = this._getFinalArgs.bind(this)
    const boundedRunWithAugmentation = this._runWithAugmentation.bind(this)

    const originalConsoleLogMethod = this._originalConsoleClass.logMethod

    console.log = (...funcArgs) => {
      const args = boundedGetFinalArgs(funcArgs, true)

      boundedRunWithAugmentation({
        func: () => originalConsoleLogMethod.apply(console, args),
        handler: () => {
          if (typeof boundedHandler !== 'function') return

          boundedHandler(...args)
        }
      })
    }
  }

  private _monkeyPatchConsoleTrace() {
    const boundedHandler = this._handlers?.trace
    const boundedGetFinalArgs = this._getFinalArgs.bind(this)
    const boundedRunWithAugmentation = this._runWithAugmentation.bind(this)

    const originalConsoleTraceMethod = this._originalConsoleClass.traceMethod

    console.trace = (...funcArgs) => {
      const args = boundedGetFinalArgs(funcArgs, true)

      boundedRunWithAugmentation({
        func: () => originalConsoleTraceMethod.apply(console, args),
        handler: () => {
          if (typeof boundedHandler !== 'function') return

          boundedHandler(...args)
        }
      })
    }
  }

  private _activateGlobalErrorTracing() {
    const boundedTrace = this.trace.bind(this)

    if (TSLoggerUtility.isBrowserEnvironment()) {
      window.addEventListener('error', boundedTrace)
      return
    }

    if (TSLoggerUtility.isNodeEnvironment()) {
      process.on('unhandledRejection', (reason, p) => {
        boundedTrace(reason, 'Unhandled Rejection at Promise', p);
      }).on('uncaughtException', err => {
        boundedTrace(err, 'Uncaught Exception thrown');
        process.exit(1);
      })
    }
  }
}
