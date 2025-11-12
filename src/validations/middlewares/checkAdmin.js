import tokenValidator from '../../utils/verifyToken.js';

export default async function isAdmin(req, res, next) {
  try {
    const bearer_token = req.headers.authorization;

    if (!bearer_token) {
      res.status(401);
      throw new Error('Authorization header missing');
    }

    const parts = bearer_token.split(' ');
    
    if (parts.length !== 2) {
      res.status(401);
      throw new Error('Invalid authorization header format');
    }

    const access_token = parts[1];
    const user = await tokenValidator(access_token);

    if (!user || user instanceof Error) {
      res.status(401);
      throw new Error('Invalid or expired token');
    }

    if (user.role !== 'admin') {
      res.status(403); // Forbidden
      throw new Error('User is not an admin');
    }

    next();
  } catch (error) {
    if (error.message == 'jwt expired') {
      res.status(401);
    }
    next(error);
  }
}

