var express = require('express');
var router = express.Router();
var path = require('path');

var entorno = "local"; 

if(entorno == "local"){
} else { 

} 

router.get('/', function(req, res, next) {
	res.sendFile('/production/index.html', { root: path.join(__dirname, '../public') })
});

module.exports = router;