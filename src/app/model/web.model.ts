export interface WebResponse<T>  {
  message: string;
  data?: T;
  errors?: boolean;
}
