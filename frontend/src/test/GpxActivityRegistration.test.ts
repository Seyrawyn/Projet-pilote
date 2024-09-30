import { describe, it, afterAll } from 'vitest';
import { _isGPXFile } from '$lib/activity/validForm';

let validTests: number = 0;
const invalidTests: string[] = [];

describe('Test #1 : Champs FileGpx', () => {
  it('Not a FileGpx .txt', () => {
    const invalidFileGpx = new File([''], 'example.txt', { type: 'text/plain' });
    const result = _isGPXFile(invalidFileGpx);
    if (!result) {
      validTests++;
    } else {
      invalidTests.push('Validation invalid(.txt) echec');
    }
  });

  it('Not a FileGpx xml', () => {
    const invalidFileGpx = new File([''], 'example.xml', { type: 'application/xml' });
    const result = _isGPXFile(invalidFileGpx);
    if (!result) {
      validTests++;
    } else {
      invalidTests.push('Validation invalid(.xml) echec');
    }
  });

  it('FileGpx valide lowerCase', () => {
    const validFileGpx = new File([''], 'example.gpx', { type: 'application/gpx+xml' });
    const result = _isGPXFile(validFileGpx);
    if (result) {
      validTests++;
    } else {
      invalidTests.push('Validation FileGpx valide lowerCase echec');
    }
  });

  it('FileGpx valide uperCase', () => {
    const validFileGpx = new File([''], 'EXAMPLE.GPX', { type: 'application/gpx+xml' });
    const result = _isGPXFile(validFileGpx);
    if (result) {
      validTests++;
    } else {
      invalidTests.push('Validation FileGpx valide uperCase echec');
    }
  });

  it('FileGpx null', () => {
    const result = _isGPXFile(null as unknown as File);
    if (!result) {
      validTests++;
    } else {
      invalidTests.push('Validation FileGpx null echec');
    }
  });
});

/* eslint-disable no-console */
afterAll(() => {
  console.log(`Nombre de tests valides passés: ${validTests}`);
  if (invalidTests.length > 0) {
    console.log('Tests invalides avec leurs messages d\'erreur :');
    invalidTests.forEach((test) => console.log(test));
  } else {
    console.log('Aucun test invalide.');
  }
});
/* eslint-enable no-console */
