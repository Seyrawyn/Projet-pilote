export interface trainerFields {
  username?: string;
  name?: string;
  email?: string ;
  password?: string;
}

export interface formDataTrainer extends FormData, trainerFields {
  success: boolean;
  message: string;
}
