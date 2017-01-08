const randomstring = require("randomstring"),
      crypto = require('crypto');

module.exports = {
  generateRandomString: function(numCharacters = 50) {
    return randomstring.generate(numCharacters);
  },
  getFormattedDateTimeNow: function () {
    const currentdate = new Date();
    return  this.addZero(currentdate.getFullYear()) + "-" +
            this.addZero(currentdate.getMonth()+1)  + "-"+
            this.addZero(currentdate.getDate()) + " "  +
            this.addZero(currentdate.getHours()) + ":"   +
            this.addZero(currentdate.getMinutes()) + ":" +
            this.addZero(currentdate.getSeconds());
  },
  getEncryptedInMd5:  function(stringToBeEncrypted) {
    return crypto.createHash('md5').update(stringToBeEncrypted).digest("hex");
  },
  addZero: function(str) {
    return str < 10 ? ('0' + str) : str;
  }
};
