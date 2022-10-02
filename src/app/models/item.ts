export interface Item {
  _id?: string;
  userId?: string;
  description?: string;
  type?: string;
  where?: string;
  obs?: string;
  started: boolean;
  finished: boolean;
  important: boolean;
  canceled: boolean;
}
