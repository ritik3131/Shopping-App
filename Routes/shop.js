const express = require("express");
const path = require("path");

const route = express.Router();
const shopcontroll = require("../controllers/shop");
const isAuth=require("../middleware/is-auth");

route.get('/', shopcontroll.getindex);
route.get('/products', shopcontroll.getproduct);

route.get('/products/:productid', shopcontroll.getdetails);

route.get('/cart',isAuth, shopcontroll.getcart);

route.post('/cart',isAuth, shopcontroll.postcart);

route.post('/delete-cart-item',isAuth, shopcontroll.postdeletecartitems);


route.get('/orders',isAuth, shopcontroll.getorder);

route.get('/order/:orderId',isAuth, shopcontroll.getinvoices);

route.get('/checkout',isAuth, shopcontroll.getcheckout);

route.get('/checkout/success',isAuth, shopcontroll.postorder);
route.get('/checkout/cancel',isAuth, shopcontroll.getcheckout);

module.exports = route;
