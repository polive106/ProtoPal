import type { JwtPayload } from '../services/JwtService';

declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}
