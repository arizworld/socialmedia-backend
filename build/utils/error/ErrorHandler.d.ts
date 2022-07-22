export default class ErrorHandler extends Error {
    statusCode: number;
    messageCode: string;
    constructor(statusCode: number, messageCode: string, message?: string);
}
