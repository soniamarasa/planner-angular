export interface Item {
  id?: string;
  user_id?: string;
  description?: string;
  type?: string;
  where?: string;
  obs?: string;
  started: boolean;
  finished: boolean;
  important: boolean;
  canceled: boolean;
}
