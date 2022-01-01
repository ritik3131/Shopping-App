const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    require: true,
  },
  Price: {
    type: Number,
    require: true,
  },
  Description: {
    type: String,
    require: true,
  },
  ImageUrl: {
    type: String,
    require: true,
  },
  userid:{
    type: Schema.Types.ObjectId, ref:"User",require: true 
  }
});

module.exports=mongoose.model('Product',productSchema);
// const getDb = require("../ult/database").getDb;
// const mongodb = require("mongodb");
// class Product {
//   constructor(title, price, desp, imageurl, id, userid) {
//     (this.title = title),
//       (this.Price = price),
//       (this.Description = desp),
//       (this.ImageUrl = imageurl),
//       (this._id = id ? new mongodb.ObjectId(id) : null);
//     this.userid = userid;
//   }
//   save() {
//     const db = getDb();
//     let dpobj;
//     if (this._id) {
//       dpobj = db
//         .collection("Products")
//         .updateOne({ _id: this._id }, { $set: this });
//     } else {
//       dpobj = db.collection("Products").insertOne(this);
//     }
//     return dpobj
//       .then((result) => {
//         console.log(result);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
//   static fetchAll() {
//     const db = getDb();
//     return db
//       .collection("Products")
//       .find()
//       .toArray()
//       .then((products) => {
//         console.log(products);
//         return products;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static findById(id) {
//     const db = getDb();
//     return db
//       .collection("Products")
//       .find({
//         _id: new mongodb.ObjectId(id),
//       })
//       .next()
//       .then((product) => {
//         console.log(product);
//         return product;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
//   static destroy(prodid) {
//     const db = getDb();
//     return db.collection("Products").deleteOne({
//       _id: new mongodb.ObjectId(prodid),
//     });
//   }
// }

// module.exports = Product;
