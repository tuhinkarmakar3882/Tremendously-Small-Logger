export class TSLoggerUtility {
  static isBrowserEnvironment() {
    return new Function("try {return this===window}catch(e){ return false}")()
  }

  static isNodeEnvironment() {
    return new Function("try {return this===global}catch(e){return false}")()
  }
}
