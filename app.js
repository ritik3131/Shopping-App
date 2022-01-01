const http = require("http");

const express = require("express");

const path = require("path");

const bodyparser = require("body-parser");
const multer = require("multer");

const admindata = require("./Routes/admin");
const shoproute = require("./Routes/shop");
const authroute = require("./Routes/auth");

const User = require("./models/user");

const productcontroll = require("./controllers/404");

const mongoose = require("mongoose");
const session = require("express-session");
const MongoDbstore = require("connect-mongodb-session")(session);

//It is for image storage
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  )
    cb(null, true);
  else cb(null, false);
};

const csrf = require("csurf");
const csrfProtection = csrf();

const app = express();
const Mongo_Uri =process.env.MONGODB_URL;
const store = new MongoDbstore({
  uri: Mongo_Uri,
  collection: "sessions",
});

app.set("view engine", "ejs");
app.set("views", "template engines");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyparser.urlencoded({ extended: false }));

//Things related to images
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

//Using seesion middleware
app.use(
  session({
    secret: "My Secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

//Middleware for csrf protection
app.use(csrfProtection);

app.use((req, res, next) => {
  //console.log("session ",req.session);
  if (!req.session.user) return next();
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

//Adding Things which are used in every views
app.use((req, res, next) => {
  (res.locals.isAuthenticated = req.session.loggedin),
    (res.locals.csrfToken = req.csrfToken());
  next();
});

app.use(admindata.route); //app.use('/admin',adminroute); it wii run only adminroute which in admin floder
app.use(shoproute);
app.use(authroute);

app.use(productcontroll.get500error);
app.use(productcontroll.errorfunction);

//Using error middleware
app.use((error, req, res, next) => {
  res.redirect("/500");
});

//Using Mongoose

mongoose
  .connect(Mongo_Uri)
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
