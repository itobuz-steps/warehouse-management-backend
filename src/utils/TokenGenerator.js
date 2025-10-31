import jwt from 'jsonwebtoken';
import config from '../config/config.js';

const token_secret = config.TOKEN_SECRET;

export default class TokenGenerator {
  invitationToken = (email) => {
    const invitation = jwt.sign({ email: email }, token_secret, {
      expiresIn: config.TOKEN_EXPIRE,
    });

    return invitation;
  };

  accessToken = (id) => {
    try {
      const secretKey = config.ACCESS_SECRET_KEY;
      const expiry = config.ACCESS_TOKEN_EXPIRY;

      const accessToken = jwt.sign({ id }, secretKey, {
        expiresIn: expiry,
      });

      return accessToken;
    } catch (err) {
      console.log(err);
    }
  };

  refreshToken = (id) => {
    try {
      const secretKey = config.REFRESH_SECRET_KEY;
      const expiry = config.REFRESH_TOKEN_EXPIRY;

      const refreshToken = jwt.sign({ id }, secretKey, {
        expiresIn: expiry,
      });

      return refreshToken;
    } catch (err) {
      console.log(err);
    }
  };
}
