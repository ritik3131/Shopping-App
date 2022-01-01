const path = require("path");
const fs = require("fs");
const p = path.join(__dirname, "../data", "cart.json");

module.exports = class Cart {
  static addtocart(id, productprice) {
    fs.readFile(p, (err, filecontent) => {
      let cart = { product: [], totalprice: 0 };
      if (!err) {
        cart = JSON.parse(filecontent);
      }
      const exitenceindex = cart.product.findIndex((p) => p.id === id);
      const exitenceprod = cart.product[exitenceindex];
      let updateproduct;
      if (exitenceprod) {
        updateproduct = { ...exitenceprod };
        updateproduct.qty = updateproduct.qty + 1;
        cart.product = [...cart.product];
        cart.product[exitenceindex] = updateproduct;
      } else {
        updateproduct = { id: id, qty: 1 };
        cart.product = [...cart.product, updateproduct];
      }
      cart.totalprice = cart.totalprice + +productprice;
      fs.writeFile(p, JSON.stringify(cart), (err) => {
        console.log(err);
      });
    });
  }

  static deleteproduct(id, productprice) {
    fs.readFile(p, (err, filecontent) => {
      let cart = { product: [], totalprice: 0 };
      if (err) {
        return;
      }
      cart = JSON.parse(filecontent);
      let updateproduct = { ...cart };
      const product = updateproduct.product.find((p) => p.id == id);
      const prodqty = product.qty;
      updateproduct.product = updateproduct.product.filter((p) => p.id !== id);
      updateproduct.totalprice =
        updateproduct.totalprice - productprice * prodqty;
      fs.writeFile(p, JSON.stringify(updateproduct), (err) => {
        console.log(err);
      });
    });
  }

  static getcart(cb) {
    fs.readFile(p, (err, filecontent) => {
      if (err) cb([]);
      else {
        const cart = JSON.parse(filecontent);
        cb(cart);
      }
    });
  }
};
