const crypto = require('crypto');

//
// UTILS PROVIDED BY ES6+
// .filter
// .find
// .findIndex
//

module.exports = {
  name: 'VolanteUtils',
  methods: {
    jwt: require('./jwt'),
    get(obj, path) {
      return path.split('.').reduce(function(a, v) {
        return a[v];
      }, obj);
    },
    pick(obj, keys) {
      return keys.reduce(function (ret, key) {
        ret[key] = obj[key];
        return ret;
      }, {});
    },
    omit(obj, keys) {
      return Object.fromEntries(Object.entries(obj).filter(function([k, _]) {
        return !keys.includes(k);
      }));
    },
    clone(obj) {
      if (typeof obj !== 'object' || obj === null) return obj;
      if (obj instanceof Date) return new Date(obj.getTime());
      if (obj instanceof Array) {
        return obj.reduce((arr, item, i) => {
          arr[i] = this.clone(item); // OMG RECURSION!!
          return arr;
        }, []);
      }
      if (obj instanceof Object) {
        return Object.keys(obj).reduce((newObj, key) => {
          newObj[key] = this.clone(obj[key]); // OMG RECURSION!!
          return newObj;
        }, {});
      }
    },
    flatMap(aryOfObj, path) {
      return aryOfObj.map((o) => this.get(o, path));
    },
    randomNumber(min=0, max=100) {
      return Math.random() * (max - min) + min;
    },
    randomInteger(min=0, max=100) {
      return Math.round(Math.random() * (max - min) + min);
    },
    generateId(length=16) {
      return crypto.randomBytes(length).toString('hex');
    },
  },
};