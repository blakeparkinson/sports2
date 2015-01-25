var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(res, res) {
      res.render('users', {
      });
    });

module.exports = router;
