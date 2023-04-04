const crypto = require('crypto');

module.exports = {
  //
  // utility for creating a password hash using node.js crypto library
  //
  generatePasswordHash(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 32).toString("hex");
    return `${salt}${hash}`;
  },
};