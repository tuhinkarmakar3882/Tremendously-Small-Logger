# TSLogger - Tremendously Small Logger
> Author: Tuhin (https://linkedin.com/in/tuhinkarmakar3882)

## Getting Started: CheatSheet
To import the package,
```typescript
import TSLogger from `tremendously-small-logger`
```

Get the Singleton instance
```typescript
const logger = TSLogger.getInstance({ 
    /* Put the Config here */
})
```

Use the available methods
```typescript
logger.log(...args)
logger.info(...args)
logger.warn(...args)
logger.error(...args)
logger.debug(...args)
logger.trace(...args)
```

Here are the available config options
```typescript
interface ILoggerOptions {
  enableMonkeyPatch?: boolean
  enableStackTraceInErrorLogs?: boolean
  enableGlobalErrorTracing?: boolean

  handlers?: {
    log?: Function
    info?: Function
    error?: Function
    debug?: Function
    warn?: Function
    trace?: Function
  }

  logLevelFlags?: {
    allowDefaultLogging?: boolean
    allowInfoLogging?: boolean
    allowErrorLogging?: boolean
    allowDebugLogging?: boolean
    allowWarningLogging?: boolean
  }
  
  prefixFunc?: Function | string
}
```


## Common Usage Patterns
There are two ways of using the package
1. [Quick] Monkeypatch the following at a global level with the TSLogger config
  - `console.log`
  - `console.info`
  - `console.error`
  - `console.debug`
  - `console.warn`
2. [Recommended] Use it **without** MonkeyPatching


### 1. [Quick Migrate] With MonkeyPatching

- Go to your entry point in the code, e.g. `index.ts` or `App.ts` etc.
- import the package & add the config

```typescript
import TSLogger from `tremendously-small-logger`

const logger = TSLogger.getInstance({ 
  // put relevant configs depending on your usecase
})

logger.enableMonkeyPatch()
```

Alternatively, you can also pass a flag in the first-time creation, i.e.
```typescript
import TSLogger from `tremendously-small-logger`

TSLogger.getInstance({ 
  enableMonkeyPatch: true
})
```

If you're using monkeypatching, and wish to disable it on the fly, use the folloing
```typescript
logger.disableMonkeyPatch()
```

> With this approach, you can continue to use regular console.<log/info/error/debug/warn> methods & your custom handler will be invoked at runtime, before calling the console methods.

Here's a sample:

```typescript
const logger = TSLogger.getInstance({
  enableMonkeyPatch: true,
  enableGlobalErrorTracing: true,
  enableStackTraceInErrorLogs: true,
  
  prefixFunc: () => Date.now()

  logLevelFlags: {
    allowWarningLogging: true,
    allowInfoLogging: true,
    allowErrorLogging: true,
    allowDebugLogging: true,
    allowDefaultLogging: true,
  },

  handlers: {
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
  },
});
```

---

### 2. [Recommended] Without MonkeyPatching
If you wish not to monkey patch & replace the regular console.<log/info/error/debug/warn> with logger.<log/info/error/debug/warn>, then you can set the `enableMonkeyPatch` flag to `false`.

