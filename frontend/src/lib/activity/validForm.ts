/* eslint-disable no-console */
import {ErrorCode, _getErrorMessage} from './errorCode';
import type { ActivityData } from '$lib/types/ActivityData';

/**
 * Checks if the input is a finite number and returns a boolean based on the `etat` condition.
 *
 * @param {string | number} element - The element to be evaluated.
 * @param {boolean} etat - The boolean condition that influences the return value.
 * @return {boolean} - True or false based on the evaluation of `element` against `etat`.
 */
export function verifierElement(element: string | number, etat: boolean): boolean {
  let estNombre: boolean;
  if (typeof element === 'number') {
    estNombre = isFinite(element);
  } else {
    const num = parseFloat(element);
    estNombre = !isNaN(num) && isFinite(num);
  }

  return etat ? estNombre : !estNombre;
}

/**
 * Checks if the given Name (string) is valid.
 *
 * @param {string} name - The Name to be validated.
 * @return {boolean} - Returns true if the Name is valid, otherwise false.
 */
export function _isValidName(name: string): boolean {
  const isValidLength = name.length >= 3 && name.length <= 256;
  const isNotNumeric = verifierElement(name, false);

  return isValidLength && isNotNumeric;
}

/**
 * Checks if the given string is a valid City.
 *
 * @param {string} city - The string to be checked.
 * @return {boolean} - Returns true if the string is a valid city, otherwise false.
 */
export function _isValidCity(city: string): boolean {
  const isValidLength = city.length <= 100;
  const isNotNumeric = verifierElement(city, false);

  return isValidLength && isNotNumeric;
}

/**
 * Checks if the given type of activity is valid.
 *
 * @param {string} typeActivite - The type of activity to be checked.
 * @return {boolean} - Returns true if the type of activity is valid, false otherwise.
 */
export function _isValidTypeActivite(typeActivite: string): boolean {
  const isValidType = typeActivite === 'Running' || typeActivite === 'Biking' || typeActivite === 'Walking' ;
  const isNotNumeric = verifierElement(typeActivite, false);

  return isValidType && isNotNumeric;
}

/**
 * Calculates the date 150 years ago from today and returns it in 'YYYY-MM-DD' format.
 *
 * @return {string} - The date 150 years ago formatted as 'YYYY-MM-DD'.
 */
export function _obtenirPastDate(): string {
  const mostOldPersonne = 150 ; 
  const today = new Date();
  today.setFullYear(today.getFullYear() - mostOldPersonne);
  const dateIlYa150Ans = today.getFullYear() + '-' +
                         ('0' + (today.getMonth() + 1)).slice(-2) + '-' +
                         ('0' + today.getDate()).slice(-2);

  return dateIlYa150Ans;
}

/**
 * Computes and returns tomorrow's date in 'YYYY-MM-DD' format.
 *
 * @return {string} - Tomorrow's date formatted as 'YYYY-MM-DD'.
 */
export function _obtenirDateDemain(): string {
  const today = new Date();
  const futurDate = new Date(today);
  futurDate.setDate(today.getDate() + 1);
  const futurDateString = futurDate.getFullYear() + '-' +
                           ('0' + (futurDate.getMonth() + 1)).slice(-2) + '-' +
                           ('0' + futurDate.getDate()).slice(-2);

  return futurDateString;
}

/**
 * Checks if a given date is in a valid format.
 *
 * @param {string} date - The date to be checked in the format 'YYYY-MM-DD'.
 * @return {boolean} Returns true if the date is in a valid format, otherwise false.
 */
export function _isValidDate(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const pastDate = _obtenirPastDate();
  const futurDate = _obtenirDateDemain();
  let isValid = true; // Initialisation de la variable de validation

  if (date === null) {
    isValid = false;
  } else if (!dateRegex.test(date)) {
    isValid = false;
  } else if (new Date(date) >= new Date(futurDate)) {
    isValid = false;
  } else if (new Date(date) < new Date(pastDate)) {
    isValid = false;
  }

  return isValid;
}

/**
 * Checks whether the given duration string is a valid format (hh:mm).
 *
 * @param {string} time - The duration string to be validated.
 * @return {boolean} - Returns true if the duration string is valid, otherwise false.
 */
// vérifie le format HH:MM ou HH:MM:SS
export function _isValidTime(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

  return time !== null && timeRegex.test(time);
}

/**
 * Validates a datetime from an "datetime-local" input,
 * checking separately if the date and time components are valid.
 *
 * @param {string} datetime - The datetime string to be validated in the format 'YYYY-MM-DDTHH:MM' or 'YYYY-MM-DDTHH:MM:SS'.
 * @return {boolean} Returns true if both the date and time components are valid, otherwise false.
 */
export function _isValidDateTime(datetime: string): boolean {
  const [date, time] = datetime.split('T');
  const isValidDate = _isValidDate(date);
  const isValidTime = _isValidTime(time);

  return isValidDate && isValidTime;
}

/**
 * Appends a timezone offset to a given date string to convert it into a UTC formatted string.
 *
 * @param {string} dateStr - The local date string to be converted.
 * @return {string} - The UTC formatted date string.
 */
export function _convertDateFuseau(dateStr: string): string {
  return `${dateStr}:00.000Z`;
}


/**
 * Checks if the given distance is a valid number greater than or equal to 0.
 *
 * @param {string} distance - The distance to be validated.
 * @return {boolean} - Returns true if the distance is valid, otherwise false.
 */
export function _isValidDistance(distance: string): boolean {
  let isValid = false;

  if (distance.trim() === '') {
    isValid = true;
  } else {
    const normalizedDistance = distance.replace(',', '.');

    if (/^\d+(\.\d+)?$/.test(normalizedDistance)) {
      const distanceNumber = parseFloat(normalizedDistance);
      if (verifierElement(distanceNumber, true) && distanceNumber >= 0) {
        isValid = true;
      }
    }
  }

  return isValid;
}

/**
 * Validates if a given metric unit is acceptable.
 *
 * @param {string} metrique - The metric unit to validate.
 * @return {boolean} - Returns true if 'metrique' is an accepted unit and not numeric, otherwise false.
 */
export function _isValidMetrique(metrique: string): boolean {
  const isValidType = metrique === 'm' || metrique === 'km' || metrique === 'mi';
  const isNotNumeric = verifierElement(metrique, false);

  return isValidType && isNotNumeric;
}

/**
 * value: number = distance donnee
 * fromUnit: Unit = metric actuel de la distance
 * toUnit: Unit = metric final apres conversion de distance
 */
export function _convertDistance(value: number, fromUnit: string, toUnit: string): number {
  const conversionFactor: Record<string, number> = {
    m: 1,
    km: 1000,
    mi: 1609.34,
  };

  const valueInMeters = value * conversionFactor[fromUnit];
  return valueInMeters / conversionFactor[toUnit];
}

/**
 * Check whether a comment is valid.
 *
 * @param {string} comment - The comment to be checked.
 * @return {boolean} - True if the comment is valid, false otherwise.
 */
export function _isValidComment(comment: string): boolean {
  return comment.length >= 0 && comment.length <= 1000;
}

/**
 * Checks whether a provided file is a GPX (GPS Exchange Format) file based on its extension.
 *
 * @param {File | null} file - The file to be checked.
 * @return {boolean} - Returns true if the file is a GPX file, otherwise false.
 */
export function _isGPXFile(file: File | null): boolean {
  let isValid = false;
  if (file !== null) {
    isValid = file.name.toLowerCase().endsWith('.gpx');
  }
  return isValid;
}

/**
 * Converts a given duration string to seconds.
 *
 * @param {string} duree - The duration string in the format 'hh:mm:ss'.
 * @return {number} - The duration in seconds.
 */
export function _convertDureeToSecondes(duree: string): number {
  const [hours, minutes, seconds] = duree.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Formats a given date input into an ISO 8601 string representation using UTC.
 *
 * @param {Date | string} dateInput - The date to format, can be a Date object or a string that is parseable by Date.
 * @return {string} - The formatted date string in ISO 8601 format using UTC.
 */
export function formatDate(dateInput: Date | string) {
  const date = new Date(dateInput);
  
  const year = date.getUTCFullYear();
  const month = (1 + date.getUTCMonth()).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Converts a duration from seconds into a formatted string 'HH:mm:ss'.
 *
 * @param {string | number} totalSeconds - The total duration in seconds, can be a string or a number.
 * @return {string} - The formatted time in 'HH:mm:ss' or 'Invalid input' if the input is not valid.
 */
export function formatDuration(totalSeconds: string | number) {
  let result = ''; 

  if (!verifierElement(totalSeconds, true)) {
    result = 'Invalid input';
  } else {
    const secondsNumber = Number(totalSeconds);

    if (!Number.isInteger(secondsNumber)) {
      result = 'Invalid input';
    } else {
      const hours = Math.floor(secondsNumber / 3600);
      const minutes = Math.floor((secondsNumber % 3600) / 60);
      const seconds = secondsNumber % 60;

      const formattedHours = String(hours).padStart(2, '0');
      const formattedMinutes = String(minutes).padStart(2, '0');
      const formattedSeconds = String(seconds).padStart(2, '0');

      result = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }
  }

  return result;
}

/**
 * Validates the essential fields of an ActivityData object, returning a structured response on failure.
 *
 * Validations on the activityData object:
 * - 'name' and 'type' fields.
 * - Optionally checks the 'comment'.
 *
 * @param {ActivityData} activityData - The activity data object to validate.
 * @return {{ status: number, body: { success: boolean, message: string } } | null} - Returns an error object if validation fails, otherwise null.
 */
export function _validateDefault(activityData: ActivityData): { status: number, body: { success: boolean, message: string } } | null {

  if ( !activityData.name || !activityData.type ) {
    return {
      status: 400,
      body: {
        success: false,
        message: _getErrorMessage(ErrorCode.InvalidId, 'Empty'),
      },
    };
  }
  if (!_isValidName(<string>activityData.name)) {
    return {
      status: 400,
      body: {
        success: false,
        message: _getErrorMessage(ErrorCode.InvalidName, 'Name'),
      },
    };
  }
  if (!_isValidTypeActivite(<string>activityData.type)) {
    return {
      status: 400,
      body: {
        success: false,
        message: _getErrorMessage(ErrorCode.InvalidTypeActivite, 'Type of activity'),
      },
    };
  }
  if (!_isValidComment(<string>activityData.comment)) {
    return {
      status: 400,
      body: {
        success: false,
        message: _getErrorMessage(ErrorCode.InvalidComment, 'Comment'),
      },
    };
  }
  
  return null;
}

/**
 * Performs manual validations on specific fields of an ActivityData object and logs the initial state.
 *
 * Validations on the activityData object:
 * - 'date', 'city', 'duration', 'distance', and 'metric' fields.
 *
 * @param {ActivityData} activityData - The activity data to be validated manually.
 * @return {{ status: number, body: { success: boolean, message: string } } | null} - Returns an error object with a 400 status and a detailed error message if any validation fails, otherwise null.
 */
export function _validateManual(activityData: ActivityData): { status: number, body: { success: boolean, message: string } } | null {
  // eslint-disable-next-line no-console
  console.log('vide');

  if ( !activityData.date ) {
    return {
      status: 400,
      body: {
        success: false,
        message: _getErrorMessage(ErrorCode.InvalidId, 'Empty'),
      },
    };
  }
  if (!_isValidCity(<string>activityData.city)) {
    return {
      status: 400,
      body: {
        success: false,
        message: _getErrorMessage(ErrorCode.InvalidCity, 'City'),
      },
    };
  }
  if (!_isValidDateTime(<string>activityData.date)) {
    return {
      status: 400,
      body: {
        success: false,
        message: _getErrorMessage(ErrorCode.InvalidDate, 'Date'),
      },
    };
  }
  if (!_isValidTime(<string>activityData.duration)) {
    return {
      status: 400,
      body: {
        success: false,
        message: _getErrorMessage(ErrorCode.InvalidDuree, 'Duration'),
      },
    };
  }
  if (!_isValidDistance(<string>activityData.distance)) {
    return {
      status: 400,
      body: {
        success: false,
        message: _getErrorMessage(ErrorCode.InvalidDistance, 'Distance'),
      },
    };
  }
  if (!_isValidMetrique(<string>activityData.metric)) {
    return {
      status: 400,
      body: {
        success: false,
        message: _getErrorMessage(ErrorCode.InvalidMetrique, 'Metric'),
      },
    };
  }

  return null;
}

/**
 * Validates the presence and format of GPX file data in an ActivityData object.
 *
 * @param {ActivityData} activityData - The activity data containing the GPX file to validate.
 * @return {{ status: number, body: { success: boolean, message: string } } | null} - Returns an error object with a 400 status and a detailed error message if validations fail, otherwise null.
 */
export function _validateGPX(activityData: ActivityData): { status: number, body: { success: boolean, message: string } } | null {
  // eslint-disable-next-line no-console
  console.log('segments');

  if ( !activityData.segments ) {
    return {
      status: 400,
      body: {
        success: false,
        message: _getErrorMessage(ErrorCode.InvalidId, 'Empty'),
      },
    };
  }
  if (!_isGPXFile(activityData.segments) ) {
    return {
      status: 400,
      body: {
        success: false,
        message: _getErrorMessage(ErrorCode.InvalidGPX, 'GPXFormat'),
      },
    };
  }

  return null;
}
