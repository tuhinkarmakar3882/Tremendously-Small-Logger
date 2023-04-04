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
---

### Common Usage Patterns
There are two ways of using the package
- [Quick] Monkeypatch the following at a global level with the TSLogger config
  - `console.log`
  - `console.info`
  - `console.error`
  - `console.debug`
  - `console.warn`
- [Recommended] Use it **without** MonkeyPatching


#### [Quick Migrate] With MonkeyPatching

If you're using monkeypatching, and want to disable it on the fly, use the folloing
```typescript
logger.disableMonkeyPatch(...args)
```

#### [Recommended] Without MonkeyPatching
...