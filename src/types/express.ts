import type { Request, Response, NextFunction } from 'express';

/**
 * Generic typed Express Request
 * P = params
 * Res = response body (usually unknown)
 * Req = request body
 * Q = query
 */

export type AppRequest<
  P = Record<string, string>,
  Req = unknown,
  Q = Record<string, unknown>,
> = Request<P, unknown, Req, Q>;

export type AppResponse = Response;
export type AppNext = NextFunction;

export type AsyncController<
  P = Record<string, string>,
  Req = unknown,
  Q = Record<string, string>,
> = (
  req: AppRequest<P, Req, Q>,
  res: AppResponse,
  next: AppNext
) => Promise<void>;

export type AppMiddleware<
  P = Record<string, string>,
  Req = unknown,
  Q = Record<string, string>,
> = (
  req: Request<P, any, Req, Q>,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

// export type SyncController<
//   P = Record<string, string>,
//   Req = unknown,
//   Q = Record<string, string>,
// > = (req: AppRequest<P, Req, Q>, res: AppResponse, next: AppNext) => void;

// export type Controller<
//   P = Record<string, string>,
//   Req = unknown,
//   Q = Record<string, string>,
// > = AsyncController<P, Req, Q> | SyncController<P, Req, Q>;
