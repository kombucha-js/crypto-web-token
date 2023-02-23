
class JSONWrapper {
  static parse(...args) {
    try {
      return JSON.parse(...args);
    } catch (e) {
      e.message = e.message + "\n" + args[0] + "\n";;
      throw e;
    }
  }

  static stringify(...args) {
    try {
      return JSON.stringify(...args);
    } catch (e) {
      throw e;
    }
  }
}

module.exports.JSONWrapper = JSONWrapper;
