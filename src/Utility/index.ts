export class TSLoggerUtility {
  static isBrowserEnvironment() {
    const globalScopedFunction = new Function('try {return this===window}catch(e){ return false}');

    return globalScopedFunction();
  }

  static isNodeEnvironment() {
    const globalScopedFunction = new Function('try {return this===global}catch(e){return false}');

    return globalScopedFunction();
  }
}
