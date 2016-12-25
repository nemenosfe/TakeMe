const mysql = require('promise-mysql');

module.exports = {
  getNewLevel: function (level, experience) {
    const log10level = Math.log10(level);
    if ( log10level == 0 ) return level;
    else {
      const new_level = experience / log10level;
      return (new_level > level) ? new_level : level;
    }
  },
  getNextLevelExperience: function (nextLevel) { return nextLevel * Math.log10(nextLevel); }
};
