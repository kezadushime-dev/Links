import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: string;     // The ID from the JWT
  userRole?: string; // The Role from the JWT (Admin/Vendor/User)
}