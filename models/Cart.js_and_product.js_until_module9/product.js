const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "../data", "product.json");
const Cart=require("./cart");

const getprodcutfromfile = (cb) => {
  fs.readFile(p, (err, filecontent) => {
    if (err) return cb([]);
    cb(JSON.parse(filecontent));
  });
};

module.exports = class Product {
  constructor(id, title, imageurl, desp, price) {
    this.id = id;
    this.title = title;
    this.imageurl = imageurl;
    this.desp = desp;
    this.price = price;
  }

  save() {
    getprodcutfromfile((products) => {
      if (this.id) {
        const existrnceproductindex = products.findIndex(
          (prod) => prod.id == this.id
        );
        const updatedprod = [...products];
        updatedprod[existrnceproductindex] = this;
        fs.writeFile(p, JSON.stringify(updatedprod), (err) => {
          console.log(err);
        });
      }
      //first will read the content of file if file exist then push the data which is created now;
      else {
        this.id = Math.random().toString();
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), (err) => {
          console.log(err);
        });
      }
    });
  }

  static fetchAll(cb) {
    getprodcutfromfile(cb);
  }
  static delete(id)
  {
    getprodcutfromfile((products) => {
      const product=products.find((prod) => prod.id == id);
        const updatedprod = products.filter(
          (prod) => prod.id != id
        );
        fs.writeFile(p, JSON.stringify(updatedprod), (err) => {
          if(!err)
           Cart.deleteproduct(product.id,product.price);
        });
      });
  }
  static findbyid(id, cb) {
    getprodcutfromfile((products) => {
      const productid = products.find((p) => p.id == id);
      cb(productid);
    });
  }
};
