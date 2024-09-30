/* eslint-disable no-unused-vars */
// express-validator types
export enum evTypes {
  INT,
  FLOAT,
  STRING,
  EMAIL,
  SEX,
  DATE,
}

// validate if a given value is an evTypes or null, both are meant to return true
export const isGivenTypeOrNull = (type: evTypes) => {
  return (value: number | string | undefined) => {
    if (value === null) return true;
    if (value === undefined) return false;
    switch (type) {
    case evTypes.INT: return Number.isInteger(Number(value));
    case evTypes.FLOAT: return Number(value) === value;
    case evTypes.STRING: return typeof value === 'string';
    case evTypes.EMAIL: return typeof value === 'string' &&  value.match(/^[\w\-.]+@([\w-]+\.)+[\w-]{2,}$/);
    case evTypes.SEX: return typeof value === 'string' && value.match(/\b(?:Homme|Femme|Autre)\b/);
    case evTypes.DATE: return typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/);
    }
  };
};
