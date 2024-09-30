export interface registerFields {
    username?: string;
    email?: string ;
    password?: string;
    lastname?: string;
    firstname?: string;
    dateOfBirth?: string;
  }
  
export interface formDataRegister extends FormData, registerFields {
    success: boolean;
    message: string;
  }
