// import { Response } from 'express';
export interface Response<T> {
  message: string;
  data: T;
  statusCode?: number;
}
