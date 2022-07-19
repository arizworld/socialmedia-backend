import dotenv from "dotenv";
dotenv.config();
export default {
  host: process.env.HOST || "localhost",
  port: process.env.PORT || 8080,
  mongoURI: `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@mycluster.90knz.mongodb.net/ecart?retryWrites=true&w=majority`,
  secretKey: process.env.JWT_SECRET as string,
  resetDelay: 3 * 60 * 1000,
};
