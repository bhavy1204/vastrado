class APIResponse {
    constructor(statusCode, data = null, message = "Success", meta = {}) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode < 400;
        this.meta = meta;
        this.timestamp = new Date().toISOString();

        Object.freeze(this)
    }
}

export { APIResponse }