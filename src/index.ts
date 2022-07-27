import App from "./App";
import config from "./config/config";
import DB from "./config/db";
import { logger, LogType } from "./utils/logger";
import sendEMail from "./utils/mailer";
// uncaught error
process.on("uncaughtException", async (err: Error) => {
  logger(
    `${
      err.name +
      "  " +
      err.message +
      "  " +
      err.stack?.slice(err.stack.indexOf("at"), err.stack.indexOf(")"))
    }`,
    LogType.failure
  );
  logger(
    "shutting down the server due to unhandled promise rejection",
    LogType.failure
  );
  const isSent = await sendEMail({
    email: config.ownerEmail,
    subject: "server shut down",
    message: `shutting down the server due to uncaught exception ${
      err.name +
      "  " +
      err.message +
      "  " +
      err.stack?.slice(err.stack.indexOf("at"), err.stack.indexOf(")"))
    }`,
  });
  process.exit(1);
});

export const app = new App(DB);
const server = app.listen(1020);
// unhandled promise rejection

process.on("unhandledRejection", async (err: Error) => {
  logger(err.message, LogType.failure);
  logger(
    "shutting down the server due to unhandled promise rejection",
    LogType.failure
  );
  const isSent = await sendEMail({
    email: config.ownerEmail,
    subject: "server shut down",
    message: `shutting down the server due to unhandled promise rejection ${
      err.name +
      "  " +
      err.message +
      "  " +
      err.stack?.slice(err.stack.indexOf("at"), err.stack.indexOf(")"))
    }`,
  });

  server.close(() => {
    process.exit(1);
  });
});
