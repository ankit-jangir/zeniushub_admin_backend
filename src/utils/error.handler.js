class customError extends Error {
    constructor(message, Statuscode) {
        super(message);
        this.Statuscode = Statuscode;
    }
}

module.exports = customError;

