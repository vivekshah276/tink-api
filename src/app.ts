import express from "express";
import bodyParser from "body-parser";
import config from "./config";
import sequelize from "./utils/db"
import tinkRoutes from "./routes/tinkRoutes"
import "./jobs/renewalNotifier"; // ⬅️ Cron will now be scheduled at startup

const app = express();

app.use(bodyParser.json());

app.use("/tink",tinkRoutes)

sequelize.sync().then(() => {
  app.listen(config.port, () => {
    console.log("Server is listening");
  });
});
