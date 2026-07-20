import {Request, Response, NextFunction} from 'express'
import { verifyJWT } from '../utils/jwt.js';
import User, {IUser} from '../models/User.js';

declare global {
  namespace Express {
    interface Request {
      user?: IUser
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization;

  if (!bearer) {
    const error = new Error("No Autorizado");
    return res.status(401).json({ error: error.message });
  }

  const [, token] = bearer.split(" ");

  if (!token) {
    const error = new Error("No Autorizado");
    return res.status(401).json({ error: error.message });
  }

  try {
    const result = verifyJWT(token);
    if (typeof result === "object" && result.id) {
      const user = await User.findById(result.id).select('-password');
      if (!user) {
        const error = new Error("Usuario no existe");
        return res.status(404).json({ error: error.message });
      }
      req.user = user
      next()
    }
  } catch (error) {
    res.status(500).json({ error: "Token no valido" });
  }
}