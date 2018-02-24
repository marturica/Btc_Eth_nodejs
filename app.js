var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require("request");
var redis = require("redis");
var client = redis.createClient();
var index = require('./routes/index');
var btc = require('./routes/btc');
var eth = require('./routes/eth');
var app = express();

client.on("error", function (err) {
    console.log("Error " + err);
});
client.on('connect', function() {
    console.log('connected');
});

var eth_60min = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=ETH&interval=60min&outputsize=full&apikey=D1YRS8XPERN3H006";
var eth_month = "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=ETH&apikey=D1YRS8XPERN3H006";

var btc_60min = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=BTC&interval=60min&outputsize=full&apikey=D1YRS8XPERN3H006";
var btc_month = "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=BTC&outputsize=full&apikey=D1YRS8XPERN3H006";

function setOptions(url){
  const options = {  
      url: url,
      method: 'GET',
      headers: {
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8',
          'User-Agent': 'my-reddit-client'
      }
  };
  return options;
}

function getdata(type,url,res){
    client.get(type, function(err, data) {
    if(err || data === null ) {
      // Peticion de API en caso de variable vacia
      console.log("nuevo");   
      request( setOptions(url) , function(err, output, body) {            
      //Error de api 10% simulada según petición 
      if( !body.hasOwnProperty('Information') && !body.hasOwnProperty('Error Message') && (Math.random(0, 1) < 0.1) ){
        client.set(type, body);
        client.expireat(type, parseInt((+new Date)/1000) + 3600);
        res.json(body); 
      } else {
        console.log('How unfortunate! The API Request Failed');
        getdata(type,url,res);
      }
      });
    } else {
      // Peticion de variable almacenada
      console.log("viejo");
      res.json(data);
    }
  });
};

app.use("/json/eth_60min", function(req, res)  { 
  getdata("eth_60min",eth_60min , res);
}); 

app.use("/json/eth_month", function(req, res)  { 
  getdata("eth_month",eth_month , res);
}); 

app.use("/json/btc_60min", function(req, res)  { 
  getdata("btc_60min",btc_60min , res);
}); 

app.use("/json/btc_month", function(req, res)  { 
  getdata("btc_month", btc_month , res);
}); 

app.use("/json/delete", function(req, res)  { 
  client.flushdb( function (err, succeeded) {
      console.log(succeeded); // will be true if successfull
      res.json("emptyness");
  });
}); 

/* amazon eliminar */
var server = app.listen(8081, function() {
    console.log(new Date().toISOString() + ": server started on port 8081");
});
/* amazon eliminar */

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use('/', express.static(path.join(__dirname, 'node_modules', 'gentelella')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/btc', btc);
app.use('/btc/month', btc);
app.use('/btc/day', btc);

app.use('/eth', eth);
app.use('/eth/month', eth);
app.use('/eth/day', eth);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;