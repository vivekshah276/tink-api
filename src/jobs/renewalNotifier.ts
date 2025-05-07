import cron from "node-cron";
import { checkUpcomingRenewals } from "../controller/tinkController";

console.log("gellhkh");
console.log("Server time is:", new Date().toString());

cron.schedule("* * * * *", async () => {
  console.log("🕒 Checking for upcoming renewals...");
  try {
    const count = await checkUpcomingRenewals();
    console.log(`Sent ${count} renewal emails.`);
  } catch (error) {
    console.error("Error while sending notifications:", error);
  }
});
