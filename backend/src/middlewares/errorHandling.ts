import { NextFunction, Request, Response } from 'express';

export type Error = {
  statusCode?: number;
  message?: string;
}

// The function need to have next to be recognize by express as an error handler
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const ErrorHandler = async (err: Error, req: Request, res: Response, next: NextFunction) => {
  // console.log(err.stack);
  console.log(err);
  const errCode = err.statusCode || 500;
  const errMsg = errCode !== 500 ? err.message : 'Internal Server Error';
  return res.status(errCode).json({
    error: errMsg,
  });
};

export default ErrorHandler;
