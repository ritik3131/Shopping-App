const express = require("express");
const route = express.Router();
const path = require("path");
const isAuth = require("../middleware/is-auth");

const { body } = require("express-validator/check");

const admincontroll = require("../controllers/admin");
route.get("/add_product", isAuth, admincontroll.getaddproduct);

route.post(
  "/product",
  isAuth,
  [
    body("product").isLength({ min: 3 }).withMessage('Please Enter atleast 3 character in title').trim(),
    body("price").isFloat().withMessage('Please Enter Price in flaoting values!!'),
    body("desp").isLength({ min: 5 }).withMessage('Please Enter atleast 5 character').trim(),
  ],
  admincontroll.postaddproduct
);

route.get("/product", isAuth, admincontroll.getproduct);

route.get("/edit-product/:productid", isAuth, admincontroll.geteditproduct);

route.post(
  "/edit-product",
  isAuth,
  [
    body("product").isLength({ min: 3 }).withMessage('Please Enter atleast 3 character in title').trim(),
    body("price").isFloat().withMessage('Please Enter Price in flaoting values!!'),
    body("desp").isLength({ min: 5 }).withMessage('Please Enter atleast 5 character').trim(),
  ],
  admincontroll.posteditproduct
);

route.post("/delete-product", isAuth, admincontroll.postdeleteproduct);

exports.route = route;
