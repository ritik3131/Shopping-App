const Product = require("../models/product");

const { validationResult } = require("express-validator/check");

const filehelper = require("../ult/file");

exports.getaddproduct = (req, res, next) => {
  res.render("admin/admin", {
    pagetitle: "Admin Section",
    path: "admin",
    edit: false,
    haserror: false,
    errormsg: null,
    validationerror: [],
  });
};

exports.geteditproduct = (req, res, next) => {
  const editmode = req.query.edit;

  if (editmode) {
    const prodid = req.params.productid;
    Product.findById(prodid)
      .then((product) => {
        if (product) {
          res.render("admin/admin", {
            pagetitle: "Edit Product",
            path: "edit",
            edit: editmode,
            product: product,
            haserror: false,
            errormsg: null,
            validationerror: [],
          });
        } else {
          res.redirect("/");
        }
      })
      .catch((err) => {
        error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  } else {
    res.redirect("/");
  }
};

exports.posteditproduct = (req, res, next) => {
  const prodid = req.body.productid;
  const updatedtitle = req.body.product;
  const updatedprice = req.body.price;
  const updateddesp = req.body.desp;
  const updatedimage = req.file;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //console.log(errors.array());
    return res.status(422).render("admin/admin", {
      pagetitle: "Edit Product",
      path: "edit",
      edit: true,
      product: {
        title: updatedtitle,
        Price: updatedprice,
        Description: updateddesp,
        _id: prodid,
      },
      validationerror: errors.array(),
      haserror: true,
      errormsg: errors.array()[0].msg,
    });
  }

  Product.findById(prodid)
    .then((product) => {
      filehelper.deletefile(product.ImageUrl);
      if (product.userid.toString() !== req.user._id.toString())
        return res.redirect("/");
      Product.findByIdAndUpdate(prodid, {
        $set: {
          title: updatedtitle,
          Price: updatedprice,
          Description: updateddesp,
          ImageUrl: updatedimage.path,
          //prodid
        },
      }).then((result) => {
        console.log("UPDATED PRODUCT");
        res.redirect("/products");
      });
    })
    .catch((err) => {
      error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  //METHOD-2
  // Product.findById(prodid).then(prod=>{
  //     prod.title= updatedtitle;
  //     prod.Price= updatedprice;
  //     prod.Description= updateddesp;
  //     prod.ImageUrl= updatedimageurl;
  //     prod.save();
  // }).then((result) => {
  //   console.log("UPDATED PRODUCT");
  // })
  // .catch((err) => {
  //   console.log(err);
  // });
};

exports.postdeleteproduct = (req, res, next) => {
  const prodid = req.body.productid;
  Product.findById(prodid)
    .then((product) => {
      if (!product) return next(new Error("Product Not Found!!"));
      filehelper.deletefile(product.ImageUrl);
      return Product.deleteOne({ _id: prodid, userid: req.user._id });
    })
    .then(() => {
      res.redirect("/products");
    })
    .catch((err) => {
      error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.postaddproduct = (req, res, next) => {
  const title = req.body.product;
  const price = req.body.price;
  const desp = req.body.desp;
  const image = req.file;
  //console.log(imageurl);
  if (!image) {
    return res.status(422).render("admin/admin", {
      pagetitle: "Admin Section",
      path: "admin",
      edit: false,
      product: {
        title: title,
        Price: price,
        Description: desp,
      },
      validationerror: [],
      haserror: true,
      errormsg: "Attached file is not an image.",
    });
  }
  const imageurl = image.path;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/admin", {
      pagetitle: "Admin Section",
      path: "admin",
      edit: false,
      product: {
        title: title,
        Price: price,
        Description: desp,
        ImageUrl: imageurl,
      },
      validationerror: errors.array(),
      haserror: true,
      errormsg: errors.array()[0].msg,
    });
  }
  const product = new Product({
    title: title,
    Price: price,
    Description: desp,
    ImageUrl: imageurl,
    userid: req.user,
  });
  product
    .save()
    .then((result) => {
      // console.log(result);
      console.log("Table Created!!!!!");
      res.redirect("/product");
    })
    .catch((err) => {
      error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getproduct = (req, res, next) => {
  // Product.findAll()
  Product.find({ userid: req.user._id })
    .then((product) => {
      res.render("admin/product_list", {
        prods: product,
        pagetitle: "All Products",
        path: "/adminproducts",
      });
    })
    .catch((err) => {
      error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
