export interface User {
  id?: string;
  name: string;
  gender: string;
  birthdate: Date;
  email: string;
  password?: string;
  token?: string;
}
