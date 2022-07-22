export declare enum LogType {
    info = "info",
    failure = "failure",
    success = "success",
    warning = "warning"
}
export declare enum chalkColor {
    info = "blue",
    failure = "bgRed",
    success = "green",
    warning = "yellow"
}
export declare const logger: (message: string, logType: LogType) => void;
