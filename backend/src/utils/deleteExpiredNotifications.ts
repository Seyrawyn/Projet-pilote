import { CronJob } from "cron";
import { deleteExpiredNotifications } from "../services/notifications.services";

const today = new Date();
const yesterday = new Date(today.setDate(today.getDate() - 1));
export const job_expiredNotifcations = new CronJob('0 4 * * *', async () => { // 4:00 AM, Chaque jour
    try {
        await deleteExpiredNotifications(yesterday);
    } catch (error) {
        console.log(error)
    }
}); 
