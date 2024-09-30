//Backend representation of activity
export type PlannedActivity = {
  id: number | null,
  type: string,
  date: string, // Date + time
  duration: number, // seconds
  name: string,
  comment: string,
  activity_id: number | null,
}

// Frontend representation of activity
export type FrontPlannedActivity = {
  id: number | null,
  type: string,
  date: string,
  time: string,
  duration: number, // minutes
  name: string,
  comment: string,
  activity_id: number | null,
}
