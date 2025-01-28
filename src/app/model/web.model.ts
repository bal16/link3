export interface WebResponse<T> {
  message: string;
  data?: T;
  errors?: boolean;
  page?: Page;
}

type Page = {
  size: number;
  current: number;
  total: number;
};
