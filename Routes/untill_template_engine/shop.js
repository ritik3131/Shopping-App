const express = require("express");
const path = require("path");

const route = express.Router();
const admindata = require("./admin");

route.get("/", (req, res, next) => {
  //Adding HTML directly
  // console.log("In the another middleware");
  //res.send("<h1>Hello From Node</h1>");

  //Adding HTML by using a external file
  //  res.sendFile(path.join(__dirname,'../','shop.html'));
  //  console.log(admindata.product);
  // res.sendFile('/Users/lenovo/Desktop/backend nodejs/Express_js/shop.html')

  //Adding HTML by using templates engine
  const products = admindata.product;
  res.render("shop", {
    prods: products,
    pagetitle: "My Shop",
    path:"/",
    activeshop: "1",
    hasproduct: products.length,
  });

  //res.render('shop',{prods:products,pagetitle:"My Shop",path:"/",hasproduct:products.length});
  //As we define pug as default template engine we don't have to write shop.pug
  //We do't have to definr the path as we defined it in the main .js file
});

module.exports = route;
