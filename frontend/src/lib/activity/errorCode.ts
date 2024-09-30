/* eslint-disable no-unused-vars */
// Enumération des codes d'erreur
export enum ErrorCode {
  Missing,
  InvalidName,
  InvalidCity,
  InvalidTypeActivite,
  InvalidDate,
  InvalidDuree,
  InvalidDistance,
  InvalidMetrique,
  InvalidComment,
  InvalidGPX,
  InvalidId
}

// Fonction pour récupérer les messages d'erreur en fonction du code d'erreur
/**
 * Returns the error message based on the error code and variable name.
 *
 * @param {ErrorCode} errorCode - The error code representing the type of error.
 * @param {string} variable - The name of the variable associated with the error.
 * @returns {string} - The error message.
 */
export function _getErrorMessage(errorCode: ErrorCode, variable: string): string {
  switch (errorCode) {
  case ErrorCode.Missing:
    return `Please enter the field "${variable}" of the activity.`;
  case ErrorCode.InvalidName:
    return `The "${variable}" field of the activity must be a string of maximum length 256 characters.`;
  case ErrorCode.InvalidCity:
    return `The "${variable}" field of the activity must be a string of maximum length 100 characters.`;
  case ErrorCode.InvalidTypeActivite:
    return `The "${variable}" field of the activity must be either "Running", "Biking" or "Walking".`;
  case ErrorCode.InvalidDate:
    return `The "${variable}" field of the activity must be a valid date in the format YYYY-MM-DD.`;
  case ErrorCode.InvalidDuree:
    return `The "${variable}" field of the activity must be in the format HH:MM, where HH represents hours and MM represents minutes.`;
  case ErrorCode.InvalidDistance:
    return `The "${variable}" field of the activity must be a positive number.`;
  case ErrorCode.InvalidMetrique:
    return `The "${variable}" field of the activity must be either "meters", "kilometers", or "miles".`;
  case ErrorCode.InvalidComment:
    return `The "${variable}" field of the activity must be a string of maximum length 1000 characters.`;
  case ErrorCode.InvalidGPX:
    return `The "${variable}" field of the activity must be in GPX format.`;
  case ErrorCode.InvalidId:
    return `The "${variable}" field of the activity is missing or invalid.`;
  default:
    return 'An unknown error occurred.';
  }
}
