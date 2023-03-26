const crypto = require('crypto');

module.exports = {
  //
  // build a C2 JWT
  //
  buildToken({ /*user*/_id, username }) {
    let header = {
     alg : "HS256",
     typ : "JWT"
    };
    let now = new Date().getTime();
    let payload = {
      iss: this.$hub.name,
      sub: _id,
      aud: username,
      exp: Math.floor(new Date(now + this.tokenMs).getTime() / 1000),
      nbf: Math.floor(now / 1000),
      iat: Math.floor(now / 1000),
      jti: crypto.randomBytes(16).toString('hex'),
    };
      let hp = Buffer.from(JSON.stringify(header)).toString('base64') + '.' + // header portion
               Buffer.from(JSON.stringify(payload)).toString('base64');       // payload portion
    let signature = crypto.createHmac('sha256', this.jwtSecret)
                          .update(hp).digest('hex');
    this.$log(`built token for ${username} for ${this.tokenDays} days`);
    return `${hp}.${signature}`;
  },
  //
  // cryptographically validate a JWT
  //
  validateToken(token) {
    let splitToken = token.split('.'); // split the header and payload
    let signature = crypto.createHmac('sha256', this.jwtSecret)
                          .update(splitToken.slice(0, 2).join('.')).digest('hex');
    // see if computed signature matches what was provided
    if (signature === splitToken[2]) {
      // signature matches, now parse payload and see if time is valid
      let payload;
      try {
        payload = JSON.parse(Buffer.from(splitToken[1], 'base64').toString());
      } catch (e) {
        this.$error('error parsing json in JWT payload');
        return null;
      }
      let now = Math.floor(new Date().getTime() / 1000);
      if (payload.exp && payload.exp > now) {
        return payload;
      } else {
        this.$debug('expired token', token);
        return null;
      }
    }
    this.$debug('invalid signature on token');
    return null;
  },
  //
  // parse the JWT payload and return as an Object
  //
  parseTokenPayload(token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  },
  //
  // parse the JWT payload and return only the username ('aud') part
  //
  getUserFromTokenString(token) {
    return exports.getUserFromTokenObject(exports.parseTokenPayload(token));
  },
  //
  // parse the JWT payload and return only the _id ('sub') part
  //
  getUserIdFromTokenString(token) {
    return exports.getUserIdFromTokenObject(exports.parseTokenPayload(token));
  },
  //
  // Return the username field of the given token object
  //
  getUserFromTokenObject(tokenObj) {
    return tokenObj.aud;
  },
  //
  // Return the user _id field of the given token object
  //
  getUserIdFromTokenObject(tokenObj) {
    return tokenObj.sub;
  },
  //
  // utility for creating a password hash using node.js crypto library
  //
  generatePasswordHash(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 32).toString("hex");
    return `${salt}${hash}`;
  },
};