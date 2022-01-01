const express = require("express");
const route = express.Router();
const path = require("path");

const product = [];

route.use("/add_product", (req, res, next) => {
  //Adding HTML directly
  // console.log("In the add middleware");
  //res.send('<form action="/product" method="POST"><input type="text" name="product"><button type="submit">Send</button></form>');

  //By calling the files
  // res.sendFile(path.join(__dirname,'..','add_product.html'));

  //By Using templates
  res.render("admin", {
    pagetitle: "Admin Sectison",
    path: 'admin',
    addcss: true,
    activeadmin: true,
  });
});
route.post("/product", (req, res, next) => {
  product.push({ title: req.body.product });
  res.redirect("/");
});

exports.route = route;
exports.product = product;
