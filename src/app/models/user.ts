export interface User {
  _id?: string;
  name: string;
  gender: string;
  birthdate: Date;
  email: string;
  password?: string;
  token?: string;
}
