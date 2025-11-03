import tokenValidator from '../../utils/verifyToken.js';

export default async function isAdmin(req, res, next) {
  try {
    const bearer_token = req.headers.authorization;
    const access_token = bearer_token.split(' ')[1];
    const user = await tokenValidator(access_token);

    if (user.role != 'admin') {
      res.status(401);

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
