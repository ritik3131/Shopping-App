const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");

const PDFDocument = require("pdfkit");

const fs = require("fs");
const path = require("path");

const ITEMS_PER_PAGE = 1;

//Using Stripe for Payment
const stripe = require('stripe')(
  'sk_test_51JMvPPSAUEuUq9k6LAUSy4iKC9o0G1jiu2H1D9Zl717lMDXkfdwRxiZ2VYoyKZiJglXaoW9rfZ6rTMFfY4XKNxQk00Kbd3AK3U'
);

exports.getproduct = (req, res, next) => {
  //Adding Paginagation
  const page = +req.query.page || 1;
  let numprod;
  Product.find()
    .countDocuments()
    .then((numproducts) => {
      numprod = numproducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/shop", {
        prods: products,
        pagetitle: "All Products",
        path: "/product",
        page: page,
        numprod: numprod,
        nextpage: page + 1,
        nextpagebtn: page + 2,
        hasnext: ITEMS_PER_PAGE * page < numprod,
        prevpage: page - 1,
        hasnextbtn: ITEMS_PER_PAGE * (page + 1) < numprod,
      });
    })
    .catch((err) => {
      error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getindex = (req, res, next) => {
  const page = +req.query.page || 1;
  let numprod;
  Product.find()
    .countDocuments()
    .then((numproducts) => {
      numprod = numproducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pagetitle: "My Shop",
        path: "/",
        page: page,
        numprod: numprod,
        nextpage: page + 1,
        nextpagebtn: page + 2,
        hasnext: ITEMS_PER_PAGE * page < numprod,
        prevpage: page - 1,
        hasnextbtn: ITEMS_PER_PAGE * (page + 1) < numprod,
      });
    })
    .catch((err) => {
      error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getcart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((product) => {
      // console.log("Getcart: ",product.cart.items);
      res.render("shop/cart", {
        prods: product.cart.items,
        pagetitle: "My Cart",
        path: "/cart",
        isAuthenticated: req.session.loggedin,
      });
      //  console.log(product)
    })
    .catch((err) => {
      error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postcart = (req, res, next) => {
  const productids = req.body.productids;
  Product.findById(productids)
    .then((product) => {
      return req.user.addtocart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postdeletecartitems = (req, res, next) => {
  const productid = req.body.productid;
  req.user
    .deletefromcart(productid)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getorder = (req, res, next) => {
  Order.find({ "user.userid": req.user._id })
    .then((order) => {
      //console.log(order[0].products);
      res.render("shop/orders", {
        orders: order,
        pagetitle: "Our Orders",
        path: "/orders",
        isAuthenticated: req.session.loggedin,
      });
    })
    .catch((err) => {
      error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.getdetails = (req, res, next) => {
  const productid = req.params.productid;
  Product.findById(productid)
    .then((product) => {
      res.render("shop/product_detail", {
        path: "/product",
        product: product,
        pagetitle: product.title,
        isAuthenticated: req.session.loggedin,
      });
    })
    .catch((err) => {
      error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postorder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((product) => {
      const products = product.cart.items.map((i) => {
        return { qty: i.qty, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          mailid: req.user.mailid,
          userid: req.user,
        },
        products: products,
      });
      order.save();
    })
    .then(() => {
      return req.user.clearcart();
    })
    .then((r) => {
      res.redirect("/orders");
    })
    .catch((err) => {
      error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getinvoices = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) return next(new Error("No Order Found!!"));
      if (order.user.userid.toString() !== req.user._id.toString())
        return next(new Error("Unauthorized"));
      const filename = "invoice-" + orderId + ".pdf";
      const filepath = path.join("data", "invoices", filename);

      //Generation the pdf
      const pdfDoc = new PDFDocument();
      pdfDoc.pipe(fs.createWriteStream(filepath));
      pdfDoc.pipe(res);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + filename + '"'
      );

      pdfDoc.fontSize(26).fillColor("blue").text("Invoice: ", {
        underline: true,
      });
      pdfDoc.text("---------------------");
      let totalprice = 0;
      order.products.forEach((prod) => {
        totalprice += prod.qty * prod.product.Price;
        pdfDoc
          .fontSize(14)
          .text(
            `${prod.product.title}- Quantity ${prod.qty} x $${prod.product.Price}`
          );
      });
      pdfDoc.text("---------------------");
      pdfDoc
        .fontSize(20)
        .fillColor("red")
        .text("Total Price: " + totalprice);
      pdfDoc.end();

      // fs.readFile(filepath, (err, data) => {
      //   if (err) {
      //     // console.log("Error Occurred!!");
      //     return next(err);
      //   }
      //   res.setHeader("Content-Type", "application/pdf");
      //   res.setHeader(
      //     "Content-Disposition",
      //     'inline; filename="' + filename + '"'
      //   );
      //   res.send(data);
      // });

      //For larger files
      //   const file = fs.createReadStream(filepath);
      //   res.setHeader("Content-Type", "application/pdf");
      //   res.setHeader(
      //     "Content-Disposition",
      //     'attachment; filename="' + filename + '"'
      //   );
      //   file.pipe(res);
    })
    .catch((err) => next(err));
};

exports.getcheckout = (req, res, next) => {
  let products;
  let total = 0;
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((product) => {
      products = product.cart.items;
      products.forEach((prod) => {
        total += prod.qty * prod.productId.Price;
      });
     // console.log(stripe);
      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map((p) => {
          return {
            name: p.productId.title,
            description: p.productId.Description,
            amount: p.productId.Price * 100,
            currency: 'INR',
            quantity: p.qty,
          };
        }),
        success_url:
          req.protocol + '://' + req.get('host') + '/checkout/success',
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
      });
    })
    .then((session) => {
      res.render("shop/checkout", {
        prods: products,
        pagetitle: "CheckOut",
        path: "/checkout",
        totalprice: total,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      //console.log("Error Occured",err)
      error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
