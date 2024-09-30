export function validateName(name: any): boolean {
  return !name || typeof name !== 'string' || name.length < 3 || name.length > 25;
}

export function validateCity(city: any): boolean {
  return !city || typeof city !== 'string' || city.length > 100;
}

export function validateType(type: any): boolean {
  const validTypes = ['Running', 'Biking', 'Walking'];
  return !type || typeof type !== 'string' || !validTypes.includes(type);
}

export function validateDuration(duration: any): boolean {
  return typeof duration !== 'number' || duration <= 0;
}

export function validateDistance(distance: any): boolean {
  return typeof distance !== 'number' || distance <= 0;
}

export function validateComment(comment: any): boolean {
  return typeof comment !== 'string';
}

export function validateDate(date: any): boolean {
  const parsedDate = new Date(date);
  return isNaN(parsedDate.getTime()) || parsedDate > new Date();
}
