class httpError extends Error {
  constructor(message, errorCode) {
    super(message); // !add message property
    this.code = errorCode; //!add a CODE property
  }
}

module.exports = httpError;
