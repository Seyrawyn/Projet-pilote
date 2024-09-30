/**
 * Represents the structured data for an activity, including various details like name, type, and metrics.
 *
 * @interface
 * @property {string | null} activityId - The unique identifier for the activity, nullable.
 * @property {string | null} name - The name of the activity, nullable.
 * @property {string | null} city - The city where the activity took place, nullable.
 * @property {string | null} type - The type of activity, such as running or cycling, nullable.
 * @property {string | null} date - The date when the activity occurred, nullable.
 * @property {string | null} duration - The duration of the activity, nullable.
 * @property {string | null} distance - The distance covered during the activity, nullable.
 * @property {string} metric - The units used for measuring distance and/or speed.
 * @property {string | null} comment - Additional comments about the activity, nullable.
 * @property {any | null} segments - Complex data representing different segments of the activity, nullable, type not explicitly defined.
 */
export interface ActivityData {
  activityId: string | null;
  name: string | null;
  city: string | null;
  type: string | null;
  date: string | null;
  duration: string | null;
  distance: string | null;
  metric: string;
  comment: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  segments: any  | null;
}
