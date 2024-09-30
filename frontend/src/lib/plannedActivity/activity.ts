import type { PlannedActivity, FrontPlannedActivity } from '$lib/types/plannedActivity';

export const activityType = ['Running', 'Biking', 'Walking'];

export function getLastMonday(date: Date): Date {
  date.setDate(date.getDate() - (date.getDay() + 6) % 7);
  return date;
}

export function getDateFromISO(dateStr: string): Date {
  const fields = dateStr.split('-').map((i) => Number(i));
  return new Date(fields[0], fields[1] - 1, fields[2]);
}

export function getISOFromDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Zero-pad month for YYYY-MM format
  const day = String(date.getDate()).padStart(2, '0'); // Zero-pad day for YYYY-DD format
  return `${year}-${month}-${day}`;
}

export function getFormatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function get24hFormatFromDate(date: Date): string {
  return date.toTimeString().substring(0,5);
}

export function getFormatTime(dateString: string): string {
  const date = new Date(dateString);
  date.toLocaleString('en-US', { timeZone: 'America/New_York' });
  const hours = date.getHours();
  const min = String(date.getMinutes()).padStart(2,'0');
  return `${hours}h${min}`;
}

export function getFormatDuration(duration: number): string {
  if (duration === 0) 
    return '-';
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  return `${hours > 0 ? `${hours}h` : ''}${minutes}m`;
}

export function formatPActivityForBackend(data: FormData): PlannedActivity {
  const pActivity: PlannedActivity = {
    id: Number(data.get('id')) || null,
    type: String(data.get('type')) ,
    date: `${data.get('date')} ${data.get('time')}`,
    duration: Number(data.get('duration')) * 60,
    name: String(data.get('name')) || String(data.get('type')),
    comment: String(data.get('comment')),
    activity_id: null,
  };
  return pActivity;
}

export function formatPActivityForFrontend(pActivity: PlannedActivity): FrontPlannedActivity {
  const prev_date = new Date(pActivity.date);
  const date = getISOFromDate(prev_date);
  const time = get24hFormatFromDate(prev_date);
  const duration = Math.floor(pActivity.duration / 60);

  const fPActivity: FrontPlannedActivity = {
    id: pActivity.id,
    type: pActivity.type ,
    date,
    time,
    duration,
    name: pActivity.name,
    comment: pActivity.comment,
    activity_id: pActivity.activity_id,
  };
  return fPActivity;
}
