import dotenv from "dotenv";
dotenv.config();
export default {
  host: process.env.HOST || "localhost",
  port: process.env.PORT || 8080,
  mongoUsername: process.env.MONGO_USERNAME,
  mongoPassword: process.env.MONGO_PASSWORD,
  testDb: "blogposttest",
  productionDb: "blogpost",
  mongoOptions: {
    retryWrites: true,
    w: "majority",
  },
  secretKey: process.env.JWT_SECRET as string,
  resetDelay: 3 * 60 * 1000,
  ownerEmail: process.env.OWNER_EMAIL as string,
  domainEmail: process.env.DOMAIN_EMAIL as string,
  domainEmailPassowrd: process.env.DOMAIN_EMAIL_PASSWORD as string,
  emailHostServiceProvider: "smtp.gmail.com",
  apiKey: "4fcc807ead48669c976b",
};
