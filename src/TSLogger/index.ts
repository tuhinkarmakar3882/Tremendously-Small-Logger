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
    this._run({
      args,
      customHandler: this._handlers.log,
      isEnabled: this._logLevelFlags.allowDefaultLogging,
      method: console.log,
    });
  }

  info(...args) {
    this._run({
      args,
      customHandler: this._handlers.info,
      isEnabled: this._logLevelFlags.allowInfoLogging,
      method: console.info,
    });
  }

  error(...args) {
    this._run({
      args,
      customHandler: this._handlers.error,
      isEnabled: this._logLevelFlags.allowErrorLogging,
      method: console.error,
    });

    if (this._logFeatureFlags.enableStackTraceInErrorLogs) {
      this.trace(args)
    }
  }

  trace(...args) {
    this._run({
      args: [...args, { stackTrace: new Error().stack }],
      customHandler: this._handlers.trace,
      isEnabled: this._logLevelFlags.allowTraceLogging,
      method: console.trace,
    });
  }

  debug(...args) {
    this._run({
      args,
      customHandler: this._handlers.debug,
      isEnabled: this._logLevelFlags.allowDebugLogging,
      method: console.debug,
    });
  }

  warn(...args) {
    this._run({
      args,
      customHandler: this._handlers.warn,
      isEnabled: this._logLevelFlags.allowWarningLogging,
      method: console.warn,
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

  private _getFinalArgs(args: Array<unknown>, overrideMode = false): Array<unknown> {
    const prefix = typeof this._logPrefix === 'function' ? this._logPrefix() : this._logPrefix;

    if (overrideMode) {
      return [prefix, ...args];
    }

    return this._isMonkeyPatched ? args : [prefix, ...args];
  }

  private _runWithAugmentation({ func, handler }: IRunWithAugmentationProps) {
    handler();
    func();
  }

  private _performMonkeyPatching() {
    const { enableGlobalMonkeyPatching } = this._logFeatureFlags;
    const {
      log: isLogPatched,
      info: isInfoPatched,
      error: isErrorPatched,
      debug: isDebugPatched,
      warning: isWarningPatched,
      trace: isTracePatched,
    } = this._logFeatureFlags.partialMonkeyPatchConfig;

    if (enableGlobalMonkeyPatching || isLogPatched) {
      this._monkeyPatchConsoleLog();
    }

    if (enableGlobalMonkeyPatching || isInfoPatched) {
      this._monkeyPatchConsoleInfo();
    }

    if (enableGlobalMonkeyPatching || isErrorPatched) {
      this._monkeyPatchConsoleError();
    }

    if (enableGlobalMonkeyPatching || isDebugPatched) {
      this._monkeyPatchConsoleDebug();
    }

    if (enableGlobalMonkeyPatching || isWarningPatched) {
      this._monkeyPatchConsoleWarn();
    }

    if (enableGlobalMonkeyPatching || isTracePatched) {
      this._monkeyPatchConsoleTrace();
    }
  }

  private _monkeyPatchConsoleLog() {
    console.log = this._patched({
      boundedHandler: this._handlers.log,
      isEnabled: this._logLevelFlags.allowDefaultLogging,
      originalMethod: this._originalConsoleClass.logMethod,
    });
  }

  private _monkeyPatchConsoleInfo() {
    console.info = this._patched({
      boundedHandler: this._handlers.info,
      isEnabled: this._logLevelFlags.allowInfoLogging,
      originalMethod: this._originalConsoleClass.infoMethod,
    });
  }

  private _monkeyPatchConsoleWarn() {
    console.warn = this._patched({
      boundedHandler: this._handlers.warn,
      isEnabled: this._logLevelFlags.allowWarningLogging,
      originalMethod: this._originalConsoleClass.warnMethod,
    });
  }

  private _monkeyPatchConsoleDebug() {
    console.debug = this._patched({
      boundedHandler: this._handlers.debug,
      isEnabled: this._logLevelFlags.allowDebugLogging,
      originalMethod: this._originalConsoleClass.debugMethod,
    });
  }

  private _monkeyPatchConsoleError() {
    console.error = this._patched({
      boundedHandler: this._handlers.error,
      isEnabled: this._logLevelFlags.allowErrorLogging,
      originalMethod: this._originalConsoleClass.errorMethod,
    });
  }

  private _monkeyPatchConsoleTrace() {
    console.trace = this._patched({
      boundedHandler: this._handlers.trace,
      isEnabled: this._logLevelFlags.allowTraceLogging,
      originalMethod: this._originalConsoleClass.traceMethod,
    });
  }

  private _patched({ boundedHandler, isEnabled, originalMethod }) {
    const getFinalArgs = this._getFinalArgs.bind(this);
    const runWithAugmentation = this._runWithAugmentation.bind(this);
    const originalConsoleLogMethod = this._originalConsoleClass.logMethod;

    return (...funcArgs) => {
      const args = getFinalArgs(funcArgs, true);

      runWithAugmentation({
        func: () => {
          if (!isEnabled) {
            originalConsoleLogMethod.apply(console, ['[+] Suppressing `console.error` as per TSL Config']);
            return;
          }

          originalMethod.apply(console, args);
        },
        handler: () => {
          if (typeof boundedHandler !== 'function' || !isEnabled) {
            return;
          }

          boundedHandler(...args);
        },
      });
    };
  }

  private _run({ args, customHandler, isEnabled, method }) {
    if (!isEnabled) {
      return;
    }

    const newArgs = this._getFinalArgs(args);

    this._runWithAugmentation({
      func: () => method(...newArgs),
      handler: () => {
        if (typeof customHandler !== 'function') {
          return;
        }

        customHandler(...args);
      },
    });
  }

  private _activateGlobalErrorTracing() {
    const boundedTrace = this.trace.bind(this);

    if (TSLoggerUtility.isBrowserEnvironment()) {
      window.addEventListener('error', (errorEvent: ErrorEvent) => {
        boundedTrace({
          colno: errorEvent.colno,
          error: errorEvent.error,
          filename: errorEvent.filename,
          lineno: errorEvent.lineno,
          message: errorEvent.message,
        });
      });
      window.addEventListener('unhandledrejection', (promiseRejectionEvent) => {
        boundedTrace({
          eventType: 'unhandledrejection',
          reason: promiseRejectionEvent.reason,
          type: promiseRejectionEvent.type,
          promise: promiseRejectionEvent.promise,
          eventStackTree: promiseRejectionEvent.reason?.stack,
        });
      });
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
