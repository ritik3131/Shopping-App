const express = require("express");
const { check, body } = require("express-validator/check");
const path = require("path");

const User = require("../models/user");

const router = express.Router();
const authcontroll = require("../controllers/auth");

router.get("/login", authcontroll.getlogin);
router.post(
  "/login",
  [
    check("email").isEmail().withMessage("!!Please enter a valid Email!!").normalizeEmail(),
    body(
      "password",
      "Please enter a password of 5 character atleast that contains only aplha nad no."
    )
      .isLength({ min: 5 })
      .isAlphanumeric().trim(),
  ],
  authcontroll.postlogin
);
router.post("/logout", authcontroll.postlogout);
router.get("/signup", authcontroll.getsignup);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("!!Please enter a valid Email!!")
      .custom((values, { req }) => {
        return User.findOne({ mailid: values }).then((userdoc) => {
          if (userdoc) {
            return Promise.reject(
              "Email Id already Exists,Pick a different one"
            );
          }
        });
      }).normalizeEmail(),
    body(
      "password",
      "Please enter a password of 5 character atleast that contains only aplha nad no."
    )
      .isLength({ min: 5 })
      .isAlphanumeric().trim(),
    body("confirmpassword").custom((values, { req }) => {
      if (values !== req.body.password)
        throw new Error("Password have to match!!");
      return true;
    }).trim(),
  ],
  authcontroll.postsignup
);

router.get("/reset", authcontroll.getreset);

router.post("/reset", authcontroll.postreset);

router.post("/reset/:token", authcontroll.getnewPassword);
router.post("/new-password", authcontroll.postnewpassword);

module.exports = router;
