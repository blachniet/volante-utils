const crypto = require('crypto');

module.exports = {
  //
  // build a JWT
  //
  build({ /*user*/_id, username }) {
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
  getJwtFromAuthorizationHeader(hdr) {
    if (hdr && typeof(hdr) === 'string' && hdr.startsWith('Bearer')) {
      let sp = hdr.split('Bearer ');
      if (sp.length === 2) {
        return sp[1];
      }
    }
    return null;
  },
  //
  // cryptographically validate a JWT
  //
  validate(jwt) {
    let splitToken = jwt.split('.'); // split the header and payload
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
        this.$debug('expired token', jwt);
        return null;
      }
    }
    this.$debug('invalid signature on token');
    return null;
  },
  //
  // parse the JWT payload and return as an Object
  //
  parsePayload(jwt) {
    return JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString());
  },
  //
  // parse the JWT payload and return only the username ('aud') part
  //
  parseUsername(token) {
    return this.getUserFromJwtObject(this.parsePayload(token));
  },
  //
  // parse the JWT payload and return only the _id ('sub') part
  //
  parseUserId(token) {
    return this.getUserIdFromJwtObject(this.parsePayload(token));
  },
  //
  // Return the username field of the given token object
  //
  getUserFromJwtObject(tokenObj) {
    return tokenObj.aud;
  },
  //
  // Return the user _id field of the given token object
  //
  getUserIdFromJwtObject(tokenObj) {
    return tokenObj.sub;
  },
};