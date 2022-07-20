import chalk from "chalk";
export enum LogType {
  info = "info",
  failure = "failure",
  success = "success",
  warning = "warning",
}
export enum chalkColor {
  info = "blue",
  failure = "bgRed",
  success = "green",
  warning = "yellow",
}
export const logger = function (message: string, logType: LogType) {
  for (let key in LogType) {
    if (logType === LogType[key as keyof typeof LogType]) {
      const color = chalkColor[key as keyof typeof LogType];
      console.log(
        chalk[color].bold(`${key.toUpperCase()}:: `) +
          chalk[color](toSentanceCase(message)) +
          " At " +
          chalk.magentaBright(new Date().toLocaleString("en-IN")) +
          "\n"
      );
    }
  }
};

const toSentanceCase = function (message: string) {
  return message
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// String.prototype.toSentanceCase = function () {
//   return this.toLowerCase()
//     .split(" ")
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(" ");
// };
