var express = require('express');
var router = express.Router();
var path = require('path');

var entorno = "local"; 

if(entorno == "local"){
} else { 
} 

router.get('/', function(req, res, next) {
	res.sendFile('/production/btc_60min.html', { root: path.join(__dirname, '../public') })
});

router.get('/month', function(req, res, next) {
	res.sendFile('/production/btc_month.html', { root: path.join(__dirname, '../public') })
});	

router.get('/day', function(req, res, next) {
	res.sendFile('/production/btc_60min.html', { root: path.join(__dirname, '../public') })
});


module.exports = router;