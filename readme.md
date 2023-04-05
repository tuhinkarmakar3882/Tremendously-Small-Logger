# TSLogger - Tremendously Small Logger
> Author: Tuhin (https://linkedin.com/in/tuhinkarmakar3882)

### Table of Contents:
- [Getting Started](#getting-started)
- [Available Methods](#available-methods)
- [Common Usage Patterns](#common-usage-patterns)
- [FAQ](#faq)


# Getting Started:
First Import the package,
```typescript
import { TSFeatureFlags, TSLogger, TSLoggingHandlerConfig, TSLogLevelFlags } from "tremendously-small-logger"
```

Next Prepare the LogLevel Config
```typescript
// Note: By Default Everything is set to false! Make sure to Turn them on accordingly!

const logLevelFlags = new TSLogLevelFlags({
  allowWarningLogging: true,
  allowErrorLogging: true,
  allowDebugLogging: true,
  allowDefaultLogging: true,
  allowInfoLogging: true,
})
```

Next Prepare the Log's Feature Level Config
```typescript
const logFeatureFlags = new TSFeatureFlags({
  enableMonkeyPatch: boolean,
  enableGlobalErrorTracing: boolean,
  enableStackTraceInErrorLogs: boolean,
})
```

Set up custom Hooks/Handlers that you wish to run, whenever the logger is invoked
```typescript
const customHandlers: TSLoggingHandlerConfig = {
  log: (...args) => handlerForConsoleLog(...args),
  info: (...args) => handlerForConsoleInfo(...args),
  warn: (...args) => handlerForConsoleWarn(...args),
  error: (...args) => handlerForConsoleError(...args),
  debug: (...args) => handlerForConsoleDebug(...args),
  trace: (...args) => handlerForConsoleTrace(...args),
}
```

Optionally, Create a log Prefix Function:
```typescript
const logPrefix = () => `[TSLogger: ${new Date()}]`
```


And Get the Singleton instance!
```typescript
const logger = TSLogger.getInstance({
  features: logFeatureFlags,
  handlers: mockedHandlers,
  logLevelFlags,
  logPrefix,
})
```


# Available Methods:
```typescript
logger.log(...args)
logger.info(...args)
logger.warn(...args)
logger.error(...args)
logger.debug(...args)
logger.trace(...args)
```

# Common Usage Patterns
There are two ways of using the package
1. [Quick] Monkeypatch the following at a global level with the TSLogger config
  - `console.log`
  - `console.info`
  - `console.error`
  - `console.debug`
  - `console.warn`
2. [Recommended] Use it **without** MonkeyPatching


## 1. [Quick Migrate] With MonkeyPatching

- Go to your entry point in the code, e.g. `index.ts` or `App.ts` etc.
- import the package & add the config

```typescript
import { TSLogger } from `tremendously-small-logger`

const logFeatureFlags = new TSFeatureFlags({
  // put relevant configs depending on your usecase
})

const logLevelFlags = new TSLogLevelFlags({
  allowDefaultLogging: true,
  // put relevant configs depending on your usecase
})

const logger = TSLogger.getInstance({ 
  features: logFeatureFlags,
  logLevelFlags,
})

logger.enableMonkeyPatch()
```

Alternatively, you can also pass a flag in the first-time creation, i.e.
```typescript
import { TSLogger } from `tremendously-small-logger`

const logFeatureFlags = new TSFeatureFlags({
  enableMonkeyPatch: true,
  // put relevant configs depending on your usecase
})

const logLevelFlags = new TSLogLevelFlags({
  allowDefaultLogging: true,
  // put relevant configs depending on your usecase
})

TSLogger.getInstance({ 
  features: logFeatureFlags,
  logLevelFlags,
})
```

If you're using monkeypatching, and wish to disable it on the fly, use the following
```typescript
logger.disableMonkeyPatch()
```

> With this approach, you can continue to use regular console.<log/info/error/debug/warn> methods & your custom handler will be invoked at runtime, before calling the console methods.

---

## 2. [Recommended] Without MonkeyPatching
It is advisable not to monkey patch & replace the regular console.<log/info/error/debug/warn> with logger.<log/info/error/debug/warn>.

To achieve this, please set the `enableMonkeyPatch` flag to `false`.

i.e.,

- Go to your entry point in the code, e.g. `index.ts` or `App.ts` etc.
- import the package & add the config

```typescript
import { TSLogger } from `tremendously-small-logger`

const logFeatureFlags = new TSFeatureFlags({
  enableMonkeyPatch: false,
  // put relevant configs depending on your usecase
})

const logLevelFlags = new TSLogLevelFlags({
  allowDefaultLogging: true,
  // put relevant configs depending on your usecase
})

const logger = TSLogger.getInstance({ 
  features: logFeatureFlags,
  logLevelFlags,
})
```


# FAQ

### 1. What are the Custom Handlers?
A Custom Handler is an additional hook to give you the utmost flexibility to run your own hook whenever a certain method is invoked. One common usage case is to add an analytics event or perhaps trigger an alarm or perhaps log to Cloudwatch etc whenever certain logs are being printed.

```typescript
const handlers: TSLoggingHandlerConfig = {
  log: ( /* ...args */) => {
    /*
    * someApiClient.post('/analytics-endpoint', {
    *   data: {
    *     args: args,
    *     type: ConsoleActionTypes.LOG
    *   }
    * }
    * */
  },
  error: ( /* ...args */) => {
    /*
    * someApiClient.post('/analytics-endpoint', {
    *   data: {
    *     args: args,
    *     type: ConsoleActionTypes.ERROR
    *   }
    * }
    * */
  },
  debug: ( /* ...args */) => {
    /*
    * someApiClient.post('/analytics-endpoint', {
    *   data: {
    *     args: args,
    *     type: ConsoleActionTypes.DEBUG
    *   }
    * }
    * */
  },
  warn: ( /* ...args */) => {
    /*
    * someApiClient.post('/analytics-endpoint', {
    *   data: {
    *     args: args,
    *     type: ConsoleActionTypes.WARN
    *   }
    * }
    * */
  },
  info: ( /* ...args */) => {
    /*
    * someApiClient.post('/analytics-endpoint', {
    *   data: {
    *     args: args,
    *     type: ConsoleActionTypes.INFO
    *   }
    * }
    * */
  },
  trace: ( /* ...args */) => {
    /*
    * someApiClient.post('/analytics-endpoint', {
    *   data: {
    *     args: args,
    *     type: ConsoleActionTypes.TRACE
    *   }
    * }
    * */
  },
}
```

### 2. What is the order of execution for the hooks & the logs?
Internally the handler you pass is invoked in the following manner:

```typescript
_runWithAugmentation({func, handler}) {
  handler() // Your custom hook
  func() // Your base logger
}
```

### 3. What are available exports?
Please find the list below

```typescript
export {
  TSLogger,
  TSFeatureFlags,
  TSLogLevelFlags,
  ConsoleActionType,
  TSLoggerUtility,
  TSLoggingHandlerConfig,
}
```

### 4. What is TSLoggerUtility & ConsoleActionType?
- `TSLoggerUtility` has two handy functions to detect `BrowserEnvironment` & `NodeEnvironment`
- `ConsoleActionType` is an ENUM which contain basic log types for your convenience

---

# What's Next?
Please feel free fork/raise Pull Request if you are willing to contribute here!
