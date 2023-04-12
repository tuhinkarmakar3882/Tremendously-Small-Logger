import { TSLogLevelFlags } from '../TSFlags/logLevelFlags';
import { TSFeatureFlags } from '../TSFlags/featureFlags';
import { TSOriginalConsoleClass } from '../TSOriginalConsoleClass';
import { TSLoggingHandlerConfig } from './types';
import { TSLoggerUtility } from '../Utility';

type IRunWithAugmentationProps = {
  func: () => void
  handler: () => void
};

type TSLoggerProps = {
  features?: TSFeatureFlags
  logLevelFlags?: TSLogLevelFlags

  handlers?: TSLoggingHandlerConfig
  logPrefix?: (() => string) | string
};

export class TSLogger {
  private static _logger: TSLogger | undefined;

  private readonly _handlers: TSLoggingHandlerConfig;

  private readonly _logLevelFlags: TSLogLevelFlags;

  private readonly _logFeatureFlags: TSFeatureFlags;

  private readonly _originalConsoleClass: TSOriginalConsoleClass;

  private readonly _logPrefix: (() => string) | string;

  private _isMonkeyPatched?: boolean;

  private constructor(options: TSLoggerProps) {
    this._handlers = options.handlers ?? {};
    this._logFeatureFlags = options.features ?? new TSFeatureFlags();
    this._logLevelFlags = options.logLevelFlags ?? new TSLogLevelFlags();

    this._isMonkeyPatched = this._logFeatureFlags.isMonkeyPatchingEnabled();
    this._logPrefix = options.logPrefix ? options.logPrefix : '[TSLogger]';

    this._originalConsoleClass = new TSOriginalConsoleClass(console);

    if (this._isMonkeyPatched) {
      this._performMonkeyPatching();
    }

    if (this._logFeatureFlags.enableGlobalErrorTracing) {
      this._activateGlobalErrorTracing();
    }
  }

  static getInstance(options?: TSLoggerProps): TSLogger {
    if (!this._logger) {
      this._logger = new TSLogger({ ...options });
    }

    return this._logger;
  }

  static killInstance(): void {
    this._logger = undefined;
  }

  log(...args) {
    if (!this._logLevelFlags.allowDefaultLogging) {
      return;
    }

    const newArgs = this._getFinalArgs(args);
    const boundedHandler = this._handlers.log;

    this._runWithAugmentation({
      func: () => console.log(...newArgs),
      handler: () => {
        if (typeof boundedHandler !== 'function') {
          return;
        }

        boundedHandler(...args);
      },
    });
  }

  info(...args) {
    if (!this._logLevelFlags.allowInfoLogging) {
      return;
    }

    const newArgs = this._getFinalArgs(args);
    const boundedHandler = this._handlers.info;

    this._runWithAugmentation({
      func: () => console.info(...newArgs),
      handler: () => {
        if (typeof boundedHandler !== 'function') {
          return;
        }

        boundedHandler(...args);
      },
    });
  }

  error(...args) {
    if (!this._logLevelFlags.allowErrorLogging) {
      return;
    }

    const newArgs = this._getFinalArgs(args);
    const boundedHandler = this._handlers.error;

    const boundedTraceHandler = this.trace.bind(this);
    const _enableStackTraceInErrorLogs = this._logFeatureFlags.enableStackTraceInErrorLogs;

    this._runWithAugmentation({
      func: () => {
        console.error(...newArgs);

        if (_enableStackTraceInErrorLogs) {
          boundedTraceHandler(...newArgs);
        }
      },
      handler: () => {
        if (typeof boundedHandler !== 'function') {
          return;
        }

        boundedHandler(...args);
      },
    });
  }

  trace(...args) {
    const newArgs = this._getFinalArgs(args);
    const boundedHandler = this._handlers.trace;

    newArgs.push({ stackTrace: new Error().stack });

    this._runWithAugmentation({
      func: () => console.trace(...newArgs),
      handler: () => {
        if (typeof boundedHandler !== 'function') {
          return;
        }

        boundedHandler(...newArgs);
      },
    });
  }

  debug(...args) {
    if (!this._logLevelFlags.allowDebugLogging) {
      return;
    }

    const newArgs = this._getFinalArgs(args);
    const boundedHandler = this._handlers.debug;

    this._runWithAugmentation({
      func: () => console.debug(...newArgs),
      handler: () => {
        if (typeof boundedHandler !== 'function') {
          return;
        }

        boundedHandler(...args);
      },
    });
  }

  warn(...args) {
    if (!this._logLevelFlags.allowWarningLogging) {
      return;
    }

    const newArgs = this._getFinalArgs(args);
    const boundedHandler = this._handlers.warn;

    this._runWithAugmentation({
      func: () => console.warn(...newArgs),
      handler: () => {
        if (typeof boundedHandler !== 'function') {
          return;
        }

        boundedHandler(...args);
      },
    });
  }

  disableMonkeyPatching() {
    if (!this._isMonkeyPatched) {
      return;
    }

    console.log = this._originalConsoleClass.logMethod;
    console.info = this._originalConsoleClass.infoMethod;
    console.error = this._originalConsoleClass.errorMethod;
    console.debug = this._originalConsoleClass.debugMethod;
    console.warn = this._originalConsoleClass.warnMethod;
    console.trace = this._originalConsoleClass.traceMethod;

    this._isMonkeyPatched = false;
  }

  enableMonkeyPatch() {
    if (this._isMonkeyPatched) {
      return;
    }

    this._performMonkeyPatching();

    this._isMonkeyPatched = true;
  }

  private _getFinalArgs(args: Array<any>, overrideMode = false): Array<any> {
    const prefix = typeof this._logPrefix === 'function' ? this._logPrefix() : this._logPrefix;

    if (overrideMode) {
      return [prefix, ...args];
    }

    return this._isMonkeyPatched ? args : [prefix, ...args];
  }

  private _runWithAugmentation({
    func,
    handler,
  }: IRunWithAugmentationProps) {
    handler();
    func();
  }

  private _performMonkeyPatching() {
    if (this._logFeatureFlags.enableGlobalMonkeyPatching) {
      this._monkeyPatchConsoleLog();
      this._monkeyPatchConsoleInfo();
      this._monkeyPatchConsoleError();
      this._monkeyPatchConsoleDebug();
      this._monkeyPatchConsoleWarn();
      this._monkeyPatchConsoleTrace();

      return;
    }

    if (this._logFeatureFlags.partialMonkeyPatchConfig.log) {
      this._monkeyPatchConsoleLog();
    }

    if (this._logFeatureFlags.partialMonkeyPatchConfig.info) {
      this._monkeyPatchConsoleInfo();
    }

    if (this._logFeatureFlags.partialMonkeyPatchConfig.error) {
      this._monkeyPatchConsoleError();
    }

    if (this._logFeatureFlags.partialMonkeyPatchConfig.debug) {
      this._monkeyPatchConsoleDebug();
    }

    if (this._logFeatureFlags.partialMonkeyPatchConfig.warning) {
      this._monkeyPatchConsoleWarn();
    }

    if (this._logFeatureFlags.partialMonkeyPatchConfig.trace) {
      this._monkeyPatchConsoleTrace();
    }
  }

  private _monkeyPatchConsoleLog() {
    const boundedHandler = this._handlers.log;
    const boundedGetFinalArgs = this._getFinalArgs.bind(this);
    const boundedRunWithAugmentation = this._runWithAugmentation.bind(this);
    const boundedAllowDebugLogging = this._logLevelFlags.allowDebugLogging;

    const originalConsoleLogMethod = this._originalConsoleClass.logMethod;

    console.log = (...funcArgs) => {
      const args = boundedGetFinalArgs(funcArgs, true);

      boundedRunWithAugmentation({
        func: () => {
          if (!boundedAllowDebugLogging) {
            originalConsoleLogMethod.apply(console, ['[+] Suppressing `console.log` as per TSL Config']);
            return;
          }

          originalConsoleLogMethod.apply(console, args);
        },
        handler: () => {
          if (typeof boundedHandler !== 'function' || !boundedAllowDebugLogging) {
            return;
          }

          boundedHandler(...args);
        },
      });
    };
  }

  private _monkeyPatchConsoleInfo() {
    const boundedHandler = this._handlers.info;
    const boundedGetFinalArgs = this._getFinalArgs.bind(this);
    const boundedRunWithAugmentation = this._runWithAugmentation.bind(this);
    const boundedAllowInfoLogging = this._logLevelFlags.allowInfoLogging;

    const originalConsoleInfoMethod = this._originalConsoleClass.infoMethod;
    const originalConsoleLogMethod = this._originalConsoleClass.logMethod;

    console.info = (...funcArgs) => {
      const args = boundedGetFinalArgs(funcArgs, true);

      boundedRunWithAugmentation({
        func: () => {
          if (!boundedAllowInfoLogging) {
            originalConsoleLogMethod.apply(console, ['[+] Suppressing `console.info` as per TSL Config']);
            return;
          }

          originalConsoleInfoMethod.apply(console, args);
        },
        handler: () => {
          if (typeof boundedHandler !== 'function' || !boundedAllowInfoLogging) {
            return;
          }

          boundedHandler(...args);
        },
      });
    };
  }

  private _monkeyPatchConsoleWarn() {
    const boundedHandler = this._handlers.warn;
    const boundedGetFinalArgs = this._getFinalArgs.bind(this);
    const boundedRunWithAugmentation = this._runWithAugmentation.bind(this);
    const boundedAllowWarningLogging = this._logLevelFlags.allowWarningLogging;

    const originalConsoleWarnMethod = this._originalConsoleClass.warnMethod;
    const originalConsoleLogMethod = this._originalConsoleClass.logMethod;

    console.warn = (...funcArgs) => {
      const args = boundedGetFinalArgs(funcArgs, true);

      boundedRunWithAugmentation({
        func: () => {
          if (!boundedAllowWarningLogging) {
            originalConsoleLogMethod.apply(console, ['[+] Suppressing `console.warn` as per TSL Config']);
            return;
          }

          originalConsoleWarnMethod.apply(console, args);
        },
        handler: () => {
          if (typeof boundedHandler !== 'function' || !boundedAllowWarningLogging) {
            return;
          }

          boundedHandler(...args);
        },
      });
    };
  }

  private _monkeyPatchConsoleDebug() {
    const boundedHandler = this._handlers.debug;
    const boundedGetFinalArgs = this._getFinalArgs.bind(this);
    const boundedRunWithAugmentation = this._runWithAugmentation.bind(this);
    const boundedAllowDebugLogging = this._logLevelFlags.allowDebugLogging;

    const originalConsoleDebugMethod = this._originalConsoleClass.debugMethod;
    const originalConsoleLogMethod = this._originalConsoleClass.logMethod;

    console.debug = (...funcArgs) => {
      const args = boundedGetFinalArgs(funcArgs, true);

      boundedRunWithAugmentation({
        func: () => {
          if (!boundedAllowDebugLogging) {
            originalConsoleLogMethod.apply(console, ['[+] Suppressing `console.debug` as per TSL Config']);
            return;
          }

          originalConsoleDebugMethod.apply(console, args);
        },
        handler: () => {
          if (typeof boundedHandler !== 'function' || !boundedAllowDebugLogging) {
            return;
          }

          boundedHandler(...args);
        },
      });
    };
  }

  private _monkeyPatchConsoleError() {
    const boundedHandler = this._handlers.error;
    const boundedGetFinalArgs = this._getFinalArgs.bind(this);
    const boundedRunWithAugmentation = this._runWithAugmentation.bind(this);
    const boundedAllowErrorLogging = this._logLevelFlags.allowErrorLogging;

    const originalConsoleErrorMethod = this._originalConsoleClass.errorMethod;
    const originalConsoleLogMethod = this._originalConsoleClass.logMethod;

    console.error = (...funcArgs) => {
      const args = boundedGetFinalArgs(funcArgs, true);

      boundedRunWithAugmentation({
        func: () => {
          if (!boundedAllowErrorLogging) {
            originalConsoleLogMethod.apply(console, ['[+] Suppressing `console.error` as per TSL Config']);
            return;
          }

          originalConsoleErrorMethod.apply(console, args);
        },
        handler: () => {
          if (typeof boundedHandler !== 'function' || !boundedAllowErrorLogging) {
            return;
          }

          boundedHandler(...args);
        },
      });
    };
  }

  private _monkeyPatchConsoleTrace() {
    const boundedHandler = this._handlers.trace;
    const boundedGetFinalArgs = this._getFinalArgs.bind(this);
    const boundedRunWithAugmentation = this._runWithAugmentation.bind(this);
    const boundedAllowTraceLogging = this._logLevelFlags.allowTraceLogging;

    const originalConsoleTraceMethod = this._originalConsoleClass.traceMethod;
    const originalConsoleLogMethod = this._originalConsoleClass.logMethod;

    console.trace = (...funcArgs) => {
      const args = boundedGetFinalArgs(funcArgs, true);

      boundedRunWithAugmentation({
        func: () => {
          if (!boundedAllowTraceLogging) {
            originalConsoleLogMethod.apply(console, ['[+] Suppressing `console.trace` as per TSL Config']);
            return;
          }

          originalConsoleTraceMethod.apply(console, args);
        },
        handler: () => {
          if (typeof boundedHandler !== 'function' || !boundedAllowTraceLogging) {
            return;
          }

          boundedHandler(...args);
        },
      });
    };
  }

  private _activateGlobalErrorTracing() {
    const boundedTrace = this.trace.bind(this);

    if (TSLoggerUtility.isBrowserEnvironment()) {
      window.addEventListener('error', boundedTrace);
      return;
    }

    if (TSLoggerUtility.isNodeEnvironment()) {
      process
        .on('unhandledRejection', (reason, p) => {
          boundedTrace(reason, 'Unhandled Rejection at Promise', p);
        })
        .on('uncaughtException', (err) => {
          boundedTrace(err, 'Uncaught Exception thrown');
          process.exit(1);
        });
    }
  }
}
