const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session')
const flash = require('express-flash')
const nocache = require('nocache');
const {rateLimit} = require('express-rate-limit');
const hpp = require('hpp');
const helmet = require('helmet')
require('dotenv').config();
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session')(session);
//Routes

const indexRouter = require('./routes/admin');
const usersRouter = require('./routes/users');


mongoose.connect(process.env.MONGO_URI, {
  user: process.env.MONGO_USER,
  pass: process.env.MONGO_PASS,
},)
  .then(() => {
    console.log('MongoDB Connected!!')
  }).catch((err) => {
    console.log("MongoConnectionError:", err)
    console.log("Failed to Connect!!")
  })

const app = express()
app.disable('x-powered-by');
var store = new MongoDBStore({
  uri: `mongodb://${encodeURIComponent(process.env.MONGO_USER)}:${encodeURIComponent(process.env.MONGO_PASS)}@localhost:27017/CHRONOCOVE`,
  collection: 'sessions',
  expires: 1000 * 60 * 60 * 24 * 30, // 30 days in milliseconds
}, err => console.error(err))

const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 15 minutes
	limit: 150, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
})

//app.use(limiter);
app.use(helmet({
  contentSecurityPolicy: false,
}));
// directives: {
//   defaultSrc: ["'self'"],
//   scriptSrc: ["'self'", "cdn.jsdelivr.net", "code.jquery.com"],
//   styleSrc: ["'self'", "cdn.jsdeliver.net", "code.jquery.com"]
// }
//session
require('dotenv').config();

const oneday = 1000 * 60 * 60 * 24
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  store: store,
  cookie: { maxAge: oneday },
  saveUninitialized: true,
  name: process.env.SESSION_NAME,
}));

app.use(nocache());
//Flash

app.use(flash())


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(hpp());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/admin', indexRouter);
app.use('/', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(7000, () => {

  console.log("  ██████╗██╗  ██╗██████╗  ██████╗ ███╗   ██╗ ██████╗  ██████╗ ██████╗ ██╗   ██╗███████╗");
  console.log(" ██╔════╝██║  ██║██╔══██╗██╔═══██╗████╗  ██║██╔═══██╗██╔════╝██╔═══██╗██║   ██║██╔════╝");
  console.log(" ██║     ███████║██████╔╝██║   ██║██╔██╗ ██║██║   ██║██║     ██║   ██║██║   ██║█████╗  ");
  console.log(" ██║     ██╔══██║██╔══██╗██║   ██║██║╚██╗██║██║   ██║██║     ██║   ██║╚██╗ ██╔╝██╔══╝  ");
  console.log(" ╚██████╗██║  ██║██║  ██║╚██████╔╝██║ ╚████║╚██████╔╝╚██████╗╚██████╔╝ ╚████╔╝ ███████╗");
  console.log("  ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝  ╚═════╝ ╚═════╝   ╚═══╝  ╚══════╝");
  console.log(" :: Server started listening on http://localhost:7000");
});