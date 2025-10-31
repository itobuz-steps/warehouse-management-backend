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
}
