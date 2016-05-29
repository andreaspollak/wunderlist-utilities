var crypto = require('crypto');
var querystring = require('querystring');
var https = require('https')

var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session')
var morgan = require('morgan')

var api = require('./api.js')

var app = express();
var FileStore = require('session-file-store')(session);

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Config body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// session configuration
app.use(session({
  name: 'server-session-cookie-id',
  secret: process.env.SECRET,
  saveUninitialized: true,
  cookie: { httpOnly: true, 
            secure: false, 
            maxAge: null,},
  store: new FileStore(),
  resave: false,
}))




// index: main view 
app.get('/', function(req, res) {
  if (req.session.token) {
    console.log('already logged in')
  }
  res.render('pages/index');  
});


// Redirect user to authenticate 
app.get('/auth', function (req, res) {
  // res.redirect('https://www.google.com/')
  res.redirect('https://www.wunderlist.com/oauth/authorize?' +
       querystring.stringify( { client_id: process.env.CLIENT_ID,
                               redirect_uri: 'http://wunderlist-parser.herokuapp.com/callback',
                               state: process.env.SECRET} ))
});


// Wunderlist redirects back to your site
app.get('/callback', function(req, res){
  if (req.query.state !== process.env.SECRET) {
    res.sendStatus(403);
  } else {
    console.log(req.query.code)
    api.getToken(req.query.code, function(err, apires, json) {
      if (err) {
        console.log(err)
      } else {
        console.log(json)
        req.session.token = json.access_token;
      };
      res.send('authentication sucess!');
    })
    
  }
})


// run app
app.listen(app.get('port'), '0.0.0.0', function() {
  console.log('Node app is running on port', app.get('port'));
});