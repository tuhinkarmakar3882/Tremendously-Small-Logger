export type ICustomLogLevelFlags = {
  allowDefaultLogging?: boolean
  allowInfoLogging?: boolean
  allowErrorLogging?: boolean
  allowDebugLogging?: boolean
  allowWarningLogging?: boolean
};

export type ICustomLoggingHandlers = {
  log?: Function
  info?: Function
  error?: Function
  debug?: Function
  warn?: Function
};

export interface ILoggerOptions {
  enableMonkeyPatch?: boolean
  enableStackTraceInErrorLogs?: boolean
  enableGlobalErrorTracing?: boolean

  handlers?: ICustomLoggingHandlers,
  logLevelFlags?: ICustomLogLevelFlags
  prefixFunc?: Function,
}

export interface IRunWithAugmentationProps {
  func: Function,
  handler?: Function
}
