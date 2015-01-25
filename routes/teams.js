var express = require('express');
var router = express.Router();
var http = require("http"),
    mongojs = require("mongojs"),
    uri = 'mongodb://root:root@ds031541.mongolab.com:31541/rosterblitz';

    db = mongojs.connect(uri, ["teams"]);



/* GET users listing. */
router.get('/', function(res, res) {
      res.render('teams', {
      });
    });

router.get('/team', function(req, res) {
    var term = req.query.q.term;
    		limit = req.query.page_limit;

    console.log(term);
    db.collection('teams').find({'name':/term/}).toArray(function (err, items) {
        res.json(items);
    });
});

module.exports = router;
