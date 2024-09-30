import { db } from '../db/db';
import { sql } from 'drizzle-orm';

export const getActivitiesByMonth = async (date: Date, userId: number, activityType?: string | null) => {
    let month = date.getUTCMonth() + 1; // getMonth() retourne un mois de 0-11
    const year = date.getUTCFullYear();

    let query = sql`
        SELECT date, type, durationTotal, distanceTotal 
        FROM activities 
        WHERE MONTH(date) = ${month} 
        AND YEAR(date) = ${year}
        AND user_id = ${userId}
    `;

    if (activityType) {
        query.append(sql` AND type = ${activityType}`);
    }

    // return format { date, type, durée, distance }
    const results = await db.execute(query);


    return results[0]; 
};
