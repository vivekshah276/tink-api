import dotenv from "dotenv";
dotenv.config();

const config = {
  port: process.env.PORT as string,
  dbName: process.env.dbName as string,
  dbUsername: process.env.dbUsername as string,
  dbPassword: process.env.dbPassword as string,
  TINK_CLIENT_ID: process.env.TINK_CLIENT_ID as string,
  TINK_CLIENT_SECRET: process.env.TINK_CLIENT_SECRET as string,
  TINK_REDIRECT_URI: process.env.TINK_REDIRECT_URI as string,
  email_host: process.env.EMAIL_HOST as string,
  email_port: Number(process.env.EMAIL_PORT as string),
  email_auth_user: process.env.EMAIL_AUTH_USER as string,
  email_auth_pass: process.env.EMAIL_AUTH_PASS as string,
};

export default config;
