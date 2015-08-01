var express = require('express');
var router = express.Router();

var html_dir = './views/';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello, World!' });
});

/* GET Socket Test page. */
router.get('/sockettest', function(req, res) {
    res.render('sockettest', { title: 'This page should use Socket.io!' });
});

/* GET Music page. */
router.get('/music', function(req, res) {
    //res.render('music', { title: 'Mushuk' });
    res.sendfile(html_dir + 'mushuk.html');
});

module.exports = router;
