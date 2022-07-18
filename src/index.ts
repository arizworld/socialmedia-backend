import App from "./App";
import { logger, LogType } from "./utils/logger";
import sendEMail from "./utils/mailer";
// uncaught error
process.on("uncaughtException", async (err: Error) => {
  logger(err.message, LogType.failure);
  logger(
    "shutting down the server due to unhandled promise rejection",
    LogType.failure
  );
  const isSent = await sendEMail({
    email: "aritrasadhukhan430@gmail.com",
    subject: "server shut down",
    message: `shutting down the server due to uncaught exception ${err.message}`,
  });
  process.exit(1);
});

const app = new App();

const server = app.listen(1020);

// unhandled promise rejection

process.on("unhandledRejection", async (err: Error) => {
  logger(err.message, LogType.failure);
  logger(
    "shutting down the server due to unhandled promise rejection",
    LogType.failure
  );
  const isSent = await sendEMail({
    email: "aritrasadhukhan430@gmail.com",
    subject: "server shut down",
    message: `shutting down the server due to unhandled promise rejection ${err.message}`,
  });

  server.close(() => {
    process.exit(1);
  });
});
