const express = require('express');
const app = express();
const session = require("cookie-session");
const cors = require('cors');
require('dotenv').config();


// Import routes
const pageRouter = require('./routes/page.router.js');
const adminRouter = require('./routes/admin.router.js');
const mhpRouter = require('./routes/mhp.router.js');
const analyzeRouter = require('./routes/analyze.router.js');
const userRouter = require('./routes/user.router.js');

console.log("App is running in '" + process.env['NODE_ENV'] + "' mode.")
if (process.env['NODE_ENV'] == "test") {
  app.locals.appUrl = "http://localhost/";
}
else if (process.env['NODE_ENV'] == "production") {
  app.locals.appUrl = "https://therapia.onrender.com";
} else {
  console.log("anlamadım hocam");
}
console.log("URL is >>> " + app.locals.appUrl);


// Middlewares
//app.use(express.static(__dirname + '/views/'));

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}))
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}))

app.use(cors());

// Set view engine
//app.set('view engine', 'twig');

app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});
// Routes
app.use("/", pageRouter);
app.use("/admin", adminRouter);
app.use("/mhp", mhpRouter);
app.use("/analyze", analyzeRouter);
app.use("/user", userRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});



module.exports = app;