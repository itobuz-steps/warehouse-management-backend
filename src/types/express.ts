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
  Q = Record<string, string>,
> = Request<P, unknown, Req, Q>;

export type AppResponse = Response;
export type AppNext = NextFunction;
