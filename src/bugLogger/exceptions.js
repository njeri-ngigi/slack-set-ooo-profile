class UserException {
  constructor(message, exception) {
    this.message = message;
    this.exception = exception;
    this.name = 'User Exception';
  }
}

module.exports = {
  UserException,
};
