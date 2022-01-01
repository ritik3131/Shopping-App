const User = require("../models/user");

const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const { validationResult } = require("express-validator/check");

const nodemailer = require("nodemailer");
let errormessage = null,
  errormesg2 = null;
const sendgridTransport = require("nodemailer-sendgrid-transport");
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        process.env.SEND_API_KEY,
    },
  })
);
exports.getlogin = (req, res, next) => {
  console.log(req.session.loggedin);
  //   const islogin = req.get("Cookie").split("=")[1];
  errormesg2 = null;
  res.render("auth/login", {
    pagetitle: "Login",
    path: "login",
    errormsg: errormessage,
    oldvalues: {
      email: "",
      password: "",
    },
    validationerror: [],
  });
};
exports.postlogin = (req, res, next) => {
  //Setting cookies
  //   res.setHeader("Set-Cookie", "loggedin=true; Max-Age=10");

  //Setting session
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("auth/login", {
      pagetitle: "Login",
      path: "login",
      errormsg: errors.array()[0].msg,
      oldvalues: {
        email: email,
        password: password,
      },
      validationerror: errors.array(),
    });
  }

  User.findOne({ mailid: email }).then((user) => {
    if (!user) {
      errormessage = "!!Invalid Email id!!";
      return res.status(422).render("auth/login", {
        pagetitle: "Login",
        path: "login",
        errormsg: errormessage,
        oldvalues: {
          email: email,
          password: password,
        },
        validationerror: [{ param: "email" }],
      });
    }
    bcrypt
      .compare(password, user.password)
      .then((domatch) => {
        if (domatch) {
          req.session.loggedin = true;
          req.session.user = user;
          return req.session.save(() => {
            res.redirect("/");
          });
        }
        errormessage = "!!!Please Enter the correct Password!!!";
        errormesg2 = null;
        return res.status(422).render("auth/login", {
          pagetitle: "Login",
          path: "login",
          errormsg: errormessage,
          oldvalues: {
            email: email,
            password: password,
          },
          validationerror: [{ param: "password" }],
        });
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/login");
      });
  });
};
exports.postlogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
exports.getsignup = (req, res, next) => {
  errormessage = null;
  res.render("auth/signup", {
    pagetitle: "SignUp",
    path: "signup",
    errormsg: errormesg2,
    oldvalues: {
      email: "",
      password: "",
      confirmpassword: "",
    },
    validationerror: [],
  });
};
exports.postsignup = (req, res, next) => {
  //console.log(req.body.email);
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("auth/signup", {
      pagetitle: "SignUp",
      path: "signup",
      errormsg: errors.array()[0].msg,
      oldvalues: {
        email: email,
        password: password,
        confirmpassword: req.body.confirmpassword,
      },
      validationerror: errors.array(),
    });
  }
  bcrypt
    .hash(password, 12)
    .then((bcryptpassword) => {
      const user = new User({
        mailid: email,
        password: bcryptpassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then(() => {
      errormessage = "!!Successfully Signed in!!";
      errormesg2 = null;
      return res.redirect("/login");
      // return transporter.sendMail({
      //   to:email,
      //   from:'ritikgupta9414@gmail.com',
      //   subject:"Signed Sucessfully",
      //   html:'<h1>From Node js App tu ek dam hoti hai!!</h1>'
      // })
    })
    .catch((err) => {
      error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  //console.log(req.body.email);
};
exports.getreset = (req, res, next) => {
  res.render("auth/reset", {
    pagetitle: "Reset Password",
    path: "reset",
    errormsg: errormessage,
  });
};
exports.postreset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const Token = buffer.toString("hex");
    const email = req.body.email;
    User.findOne({ mailid: email })
      .then((user) => {
        if (!user) {
          errormessage = "No account with this email found!!";
          return res.redirect("/reset");
        }
        user.resetToken = Token;
        //console.log("Token ", Token);
        user.restTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        transporter.sendMail({
          to: email,
          from: "ritikgupta9414@gmail.com",
          subject: "Reset Password",
          html: `<p>You Requested to reset password</p>
          <p>Click this <a href="http://localhost:3000/reset/${Token}"> to reset password</p>`,
        });
      })
      .catch((err) => {
        error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};
exports.getnewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, restTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      res.render("auth/new-password", {
        pagetitle: "Reset Password",
        path: "new-password",
        errormsg: errormessage,
        userId: user._id.toString(),
        passwordtoken: token,
      });
    })
    .catch((err) => {
      error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.postnewpassword = (req, res, next) => {
  const token = req.body.passwordtoken;
  const userId = req.body.userId;
  const newpassword = req.body.password;
  let resetuser;
  User.findOne({
    resetToken: token,
    restTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetuser = user;
      return bcrypt.hash(newpassword, 12);
    })
    .then((hashpassword) => {
      resetuser.restTokenExpiration = undefined;
      resetuser.resetToken = undefined;
      resetuser.password = hashpassword;
      return resetuser.save();
    })
    .then(() => {
      res.redirect("/login");
    })
    .catch((err) => {
      error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
