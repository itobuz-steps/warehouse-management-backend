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

  generateToken = (id) => {
    try {
      const access = config.ACCESS_SECRET_KEY;
      const refresh = config.REFRESH_SECRET_KEY;
      const accessExpiry = config.ACCESS_TOKEN_EXPIRY;
      const refreshExpiry = config.REFRESH_TOKEN_EXPIRY;
      const accessToken = jwt.sign({ id }, access, {
        expiresIn: accessExpiry,
      });
      const refreshToken = jwt.sign({ id }, refresh, {
        expiresIn: refreshExpiry,
      });

      return {
        access: accessToken,
        refresh: refreshToken,
      };
    } catch (err) {
      return err;
    }
  };

}
