export const usernameValidation = (username: string) => {
  if (!username) return 'What ? No username ? How are are you suppose to login if you do that?';
};

export const dateOfBirthValidation = (dateOfBirth: Date | string) => {
  const currentDate = new Date();
  const age = currentDate.getFullYear() - new Date(dateOfBirth).getFullYear();
  if (age < 0) return 'Invalid age: Coming from the future?';
  if (age === 0) return 'Invalid age: Just born yet ready to train? Impressive determination for a 0 year old.';
  if (age < 18) return 'Invalid age: You must be at least 18 to register.';
  if (age > 122) return 'Invalid age: The oldest human died at 122 years old. You should consider applying here: https://www.guinnessworldrecords.com/contact/application-enquiry';
};

export const heightValidation = (height: number) => {
  if (height < 0) return 'Invalid Height: Are you a hole?';
  if (height <= 30) return 'Invalid Height: Are you a gnome?';
  if (height > 280) return 'Invalid Height: Why aren\'t you playing basketball?';
};

export const weightValidation = (weight: number) => {
  if (weight < 0) return 'Invalid Weight: Matching IQ and weight? That\'s a rare sight!';
  if (weight <= 20) return 'Invalid weight: I know our trainers are good, but not that good.';
  if (weight > 650) return 'Invalid Weight: You do know the weight is in kg right? If you do, I don\'t think we can help.';
};

export const emailValidation = (email: string) => {
  let errMsg;
  if (email === '') return errMsg;
  errMsg = '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) errMsg = 'Must be a valid email';
  return errMsg;
};

export const passwordValidation = (password: string) => {
  let errMsg;
  if (password === '') return errMsg;
  errMsg = '';
  if (password.length < 8) errMsg += 'The password must be at least 8 characters\n';
  if (password.length > 72) errMsg += 'The password cannot exceed 72 characters\n';
  if (!/[A-Z]/.test(password)) errMsg += 'Must have a least one upper case letter\n';
  if (!/[a-z]/.test(password)) errMsg += 'Must have a least one lower case letter\n';
  if (!/[0-9]/.test(password)) errMsg += 'Must have a least one number\n';
  return errMsg;
};



