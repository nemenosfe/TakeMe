"use strict"
const express = require('express')
const router = express.Router()
const mysql = require('promise-mysql');

const pool  = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : '12345678',
  database : 'takemelegends'
});

function handleError(err, res, requestVerb) {
  console.log("Error "+requestVerb+" : " + JSON.stringify(err));
  res
    .status(500)
    .json({error: true, message: 'Error: ' +  JSON.stringify(err)})
}

function handleNoParams(res) {
  res
    .status(403)
    .json({error: true, message: 'Missing params'})
}


router

  .get('/', function(req, res, next) {
    let page_size = "20";
    let page_number = "1";
    if (req.body && req.body.page_size) { page_size = req.body.page_size; }
    if (req.body && req.body.page_number) { page_number = req.body.page_number; }
    const limit = page_size;
    const offset = page_size*(page_number-1);
    pool.getConnection().then(function(mysqlConnection) {
      mysqlConnection.query("SELECT * FROM rewards ORDER BY level ASC, takes ASC, name ASC LIMIT " + limit + " OFFSET " + offset + " ;")
      .then((result) => {
        res
          .status(200)
          .json({rewards: result})
      })
      .catch((err) => {
        console.log("ERROR: " + JSON.stringify(err));
        handleError(err, res, "GET");
      });
    });
  })

  .get('/user', function(req, res, next) {
    if(!req.body || !req.body.uid || !req.body.provider) { handleNoParams(res); }
    else {
      let page_size = "20";
      let page_number = "1";
      if (req.body && req.body.page_size) { page_size = req.body.page_size; }
      if (req.body && req.body.page_number) { page_number = req.body.page_number; }
      const limit = page_size;
      const offset = page_size*(page_number-1);
      let rewardsResponse = {
        "total_items" : 0,
        "total_rewards" : 0,
        "rewards" : []
      };

      pool.getConnection().then(function(mysqlConnection) {
      const sql = "SELECT * FROM rewards r, purchases p WHERE r.name = p.rewards_name AND p.users_uid = '"+req.body.uid+"' AND p.users_provider = '"+req.body.provider+"' ORDER BY name ASC LIMIT " + limit + " OFFSET " + offset + " ;";
      mysqlConnection.query(sql)
        .then((DBresult) => {
          rewardsResponse.total_items = DBresult.length;
          let total_rewards = 0;
          for (let index = 0; index < DBresult.length; index++) {
            let elementArray = {
              'name' : DBresult[index].name,
              'description' : DBresult[index].description,
              'takes' : DBresult[index].takes,
              'level' : DBresult[index].level,
              'amount' : DBresult[index].amount
            };
            rewardsResponse["rewards"][index] = {
              'reward' : elementArray
            };
            total_rewards += parseInt(DBresult[index].amount);
          }
          rewardsResponse["total_rewards"] = total_rewards;

          res
            .status(200)
            .json(rewardsResponse)
        })
        .catch((err) => {
          console.log("ERROR: " + JSON.stringify(err));
          handleError(err, res, "GET/user");
        });
      });
    }
  })

  .post('/user', function(req, res, next) {
    if(!req.body || !req.body.uid || !req.body.provider || !req.body.reward_name) {
      handleNoParams();
    } else {
      const purchaseRequest = req.body;
      let infoReward = {};
      let infoUser = {};
      let purchase_exists = -1;
      let amount = 1;
      if (req.body.amount) { amount = req.body.amount; }

      pool.getConnection().then(function(mysqlConnection) {
        const sqlGetRewardData = "SELECT takes, level FROM rewards WHERE name ='"+req.body.reward_name+"';";
        mysqlConnection.query(sqlGetRewardData)
        .then((result) => {
          infoReward.takes = result[0].takes;
          infoReward.level = result[0].level;
          const sqlGetUserData = "SELECT takes, level FROM users WHERE uid = '" + req.body.uid + "' AND provider = '" + req.body.provider + "' ;";
          return mysqlConnection.query(sqlGetUserData);
        })
        .then((result) => {
          infoUser.takes = result[0].takes;
          infoUser.level = result[0].level;
          return new Promise(function(resolve, reject) {
            if ( infoUser.level < infoReward.level ) {
              reject("This user's level is not enough to get this reward");
            } else if ( infoUser.takes < (infoReward.takes*amount) ) {
              reject("This user doesn't have enough takes to get this reward");
            } else {
              const sql = "SELECT COUNT(1) AS purchase_exists FROM purchases WHERE rewards_name='"+req.body.reward_name+"' AND users_uid = '"+req.body.uid+"' AND users_provider = '"+req.body.provider+"' ;";
              const result = mysqlConnection.query(sql);
              resolve(result);
            }
          });
        })
        .then((result) => {
          purchase_exists = result[0].purchase_exists;
          return mysqlConnection.query('START TRANSACTION');
        })
        .then((result) => {
          if (purchase_exists) {
            var sqlRegisterPurchase = "UPDATE purchases SET amount = amount + "+amount+" WHERE rewards_name='"+req.body.reward_name+"' AND users_uid = '"+req.body.uid+"' AND users_provider = '"+req.body.provider+"' ;";
          } else {
            var sqlRegisterPurchase = "INSERT INTO purchases VALUES ("+req.body.uid+", '"+req.body.provider+"', '"+req.body.reward_name+"', 1);";
          }
          return mysqlConnection.query(sqlRegisterPurchase);
        })
        .then((result) => {
          const sqlDecreaseTakes = "UPDATE users SET takes = takes - "+(infoReward.takes*amount)+" WHERE uid = '"+req.body.uid+"' AND provider = '"+req.body.provider+"' ;";
          return mysqlConnection.query(sqlDecreaseTakes);
        })
        .then((result) => {
          mysqlConnection.query('COMMIT');
          const sql = "SELECT u.takes, p.amount FROM purchases p, users u WHERE u.uid = p.users_uid AND u.provider = p.users_provider AND p.rewards_name='"+req.body.reward_name+"' AND p.users_uid = '"+req.body.uid+"' AND p.users_provider = '"+req.body.provider+"' ;";
          return mysqlConnection.query(sql);
        })
        .then((result) => {
          const purchaseResponse = {
            'purchase' : {
              'reward_name' : req.body.reward_name,
              'uid' : req.body.uid,
              'provider' : req.body.provider,
              'amount' : amount,
              'total_amount' : result[0].amount,
              'takes_left' : result[0].takes
            }
          };
          res
            .status(201)
            .json(purchaseResponse)
        })
        .catch((err) => {
          mysqlConnection.query('ROLLBACK');
          console.log("ERROR: " + JSON.stringify(err));
          handleError(err, res, "GET/user");
        });
      });
    }
  })

module.exports = router
