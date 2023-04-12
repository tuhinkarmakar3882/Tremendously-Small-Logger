# TSLogger - Tremendously Small Logger

> Author: Tuhin (https://linkedin.com/in/tuhinkarmakar3882)
>
> Github: https://github.com/tuhinkarmakar3882/Tremendously-Small-Logger

[![Npm package version](https://badgen.net/npm/v/tremendously-small-logger)](https://npmjs.com/package/tremendously-small-logger)
[![Npm package Downloads](https://badgen.net/npm/dt/tremendously-small-logger)](https://npmjs.com/package/tremendously-small-logger)
[![Npm package license](https://badgen.net/npm/license/tremendously-small-logger)](https://npmjs.com/package/tremendously-small-logger)
[![Bundlephobia MIN](https://badgen.net/bundlephobia/min/tremendously-small-logger)](https://bundlephobia.com/package/tremendously-small-logger)
[![Bundlephobia MIN ZIP](https://badgen.net/bundlephobia/minzip/tremendously-small-logger)](https://bundlephobia.com/package/tremendously-small-logger)

### Table of Contents:

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Available Methods](#available-methods)
- [Common Usage Patterns](#common-usage-patterns)
- [FAQ](#faq)
- [For Development](#for-development)

# Overview

This is a versatile library to supercharge the global/window console object and enables utmost customisibility by means
of custom handlers to hook into the logging events.

# Getting Started:

First Import the package,

```typescript
import {
  TSFeatureFlags,
  TSLogger,
  TSLoggingHandlerConfig,
  TSLogLevelFlags
} from "tremendously-small-logger"
```

Next Prepare the LogLevel Config

```typescript
// Note: By Default Everything is set to false! Make sure to Turn them on accordingly!

const logLevelFlags = new TSLogLevelFlags({
  allowWarningLogging: boolean,
  allowErrorLogging: boolean,
  allowDebugLogging: boolean,
  allowDefaultLogging: boolean,
  allowInfoLogging: boolean,
  allowTraceLogging: boolean,
})
```

Next Prepare the Log's Feature Level Config

```typescript
const logFeatureFlags = new TSFeatureFlags({
  enableGlobalMonkeyPatching: boolean,
  enableGlobalErrorTracing: boolean,
  enableStackTraceInErrorLogs: boolean,
  partialMonkeyPatchConfig: PartialMonkeyPatchConfig
})
```

Note that PartialMonkeyPatchConfig can be defined as the following
```typescript
type PartialMonkeyPatchConfig = {
  log?: boolean;
  info?: boolean;
  error?: boolean;
  debug?: boolean;
  warning?: boolean;
  trace?: boolean;
};
```

Set up custom Hooks/Handlers, whenever the logger is invoked

```typescript
const customHandlers: TSLoggingHandlerConfig = {
  log: (args: any[]) => void,
  info: (args: any[]) => void,
  warn: (args: any[]) => void,
  error: (args: any[]) => void,
  debug: (args: any[]) => void,
  trace: (args: any[]) => void,
}
```

Optionally, Create a log Prefix Function:

```typescript
const logPrefix = () => string
```

And Get the Singleton instance!

```typescript
const logger = TSLogger.getInstance({
  features: logFeatureFlags,
  handlers: customHandlers,
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

## 1. [Quick] With MonkeyPatching

- Go to the entry point in the code, e.g. `index.ts` or `App.ts` etc.
- import the package & add the config

```typescript
import {TSLogger} from "tremendously-small-logger"

const logFeatureFlags = new TSFeatureFlags({
  // set relevant configs(if required)
})

const logLevelFlags = new TSLogLevelFlags({
  // set relevant configs(if required)
})

const logger = TSLogger.getInstance({
  // set other relevant configs(if required)
  features: logFeatureFlags,
  logLevelFlags,
})

logger.enableGlobalMonkeyPatching()
```

Alternatively, a flag can be passed in the first-time creation, i.e.

```typescript
import {TSLogger} from "tremendously-small-logger"

const logFeatureFlags = new TSFeatureFlags({
  enableGlobalMonkeyPatching: true,
  // set other relevant configs(if required)
})

const logLevelFlags = new TSLogLevelFlags({
  allowDefaultLogging: true,
  // set other relevant configs(if required)
})

TSLogger.getInstance({
  // set other relevant configs(if required)
  features: logFeatureFlags,
  logLevelFlags,
})
```

MonkeyPatching can also be disabled on the fly:

```typescript
logger.disableMonkeyPatch()
```

> This approach allows to use the exising console.<log/info/error/debug/warn> methods(present in the global/window
> object) & custom handler
> will be invoked at runtime(if any), before calling the console methods.

---

## 2. [Recommended] Without MonkeyPatching

It is advisable not to monkey patch & replace the regular console.<log/info/error/debug/warn> with logger.<
log/info/error/debug/warn>.

To achieve this, set the `enableGlobalMonkeyPatching` flag to `false`.

i.e.,

- Go to the entry point in the application, e.g. `index.ts` or `App.ts` etc.
- import the package & add the config

```typescript
import {TSLogger} from "tremendously-small-logger"

const logFeatureFlags = new TSFeatureFlags({
  enableGlobalMonkeyPatching: false,
  // set other relevant configs(if required)
})

const logLevelFlags = new TSLogLevelFlags({
  allowDefaultLogging: true,
  // set other relevant configs(if required)
})

const logger = TSLogger.getInstance({
  // set other relevant configs(if required)
  features: logFeatureFlags,
  logLevelFlags,
})
```

# FAQ

### 1. What are the Custom Handlers?

A Custom Handler is an additional hook to give utmost flexibility to run custom hook whenever a certain method
is invoked. One common usage case is to add an analytics event or perhaps trigger an alarm or perhaps log to Cloudwatch
etc whenever certain logs are being printed.

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

Internally the handler passed is invoked in the following manner:

```typescript
function runWithAugmentation({func, handler}) {
  handler() // custom hook
  func() // base logger
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
- `ConsoleActionType` is an ENUM which contain basic log types based on the requirements

---

# For Development

- Clone the Repo
- Run `yarn install` or `npm install`
- Make Changes & Run `npm run start:dev`

# What's Next?

Please feel free fork/raise Pull Request. Your contribute is highly appreciated!
