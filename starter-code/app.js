require("dotenv").config();
const dbUrl = process.env.DBURL;

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const favicon = require("serve-favicon");
const hbs = require("hbs");
const mongoose = require("mongoose");
const logger = require("morgan");
const path = require("path");
const _ = require("lodash");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const app_name = require("./package.json").name;
const debug = require("debug")(`${app_name}:${path.basename(__filename).split(".")[0]}`);
const app = express();
const dbConfig = require("./config/db.config.js");

// Middleware Setup
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  })
);
app.use(flash());

require("./passport")(app);
// Express View engine setup

app.use(
  require("node-sass-middleware")({
    src: path.join(__dirname, "public"),
    dest: path.join(__dirname, "public"),
    sourceMap: true
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views/partials");
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));

app.use(async (req, res, next) => {
  // res.locals.user = req.user;
  // await req.user.save();
  // next();
  res.locals = {
    home: false,
    documents: false,
    login: false,
    signup: false
  };

  res.locals.user = req.user;

  const messageTypes = [
    { flashName: "error", className: "danger" },
    { flashName: "info", className: "info" }
  ];
  res.locals.messages = _.flatten(messageTypes.map(({ flashName, className }) => req.flash(flashName).map(message => ({ type: className, message }))));
  console.log("messages", res.locals.messages);
  next();
});

// default value for title local
app.locals.title = "Passport Lab";

// Routes middleware goes here
const index = require("./routes/index");
app.use("/", index);

module.exports = app;
