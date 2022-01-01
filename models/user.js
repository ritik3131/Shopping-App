const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  mailid: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  resetToken:String,
  restTokenExpiration:Date,
  cart: {
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref:"Product",require: true }, //Adding relation by using ref
        qty: { type: Number, require: true },
      },
    ],
  },
});
userSchema.methods.addtocart=function (product) {
      const cartproductindex = this.cart.items.findIndex((cp) => {
        return cp.productId.toString() === product._id.toString();
      });
      let newqty = 1;
      let cartitems = [...this.cart.items];
      if (cartproductindex >= 0) {
        newqty = this.cart.items[cartproductindex].qty + 1;
        cartitems[cartproductindex].qty = newqty;
      } else {
        cartitems.push({ productId:product._id, qty: 1 });
      }
     //const update={items:[{productId:new mongodb.ObjectId(product._id),qty:1}]};
      const update = { items: cartitems };
      this.cart=update;
      return this.save();
    }

    userSchema.methods.deletefromcart=function(prodid) {
     // console.log("Id: ",prodid)
          const updatedcartitem=this.cart.items.filter(p=> {
            return p._id.toString()!==prodid.toString();
          });
          console.log("Updated: ",updatedcartitem);
          this.cart.items=updatedcartitem;
          return this.save();
        }
userSchema.methods.clearcart=function () {
  this.cart={items:[]};
  return this.save();
}
module.exports = mongoose.model("User", userSchema);

// const getDb = require("../ult/database").getDb;
// const mongodb = require("mongodb");

// class User {
//   constructor(username, email, id, cart) {
//     this.mailid = email;
//     this.name = username;
//     this.cart = cart;
//     this._id = id;
//   }
//   save() {
//     const db = getDb();
//     return db
//       .collection("Users")
//       .insertOne(this)
//       .then((user) => {
//         console.log(user);
//         return user;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
//   addtocart(product) {
//     const cartproductindex = this.cart.items.findIndex((cp) => {
//       return cp.productId.toString() === product._id.toString();
//     });
//     let newqty = 1;
//     let cartitems = [...this.cart.items];
//     if (cartproductindex >= 0) {
//       newqty = this.cart.items[cartproductindex].qty + 1;
//       cartitems[cartproductindex].qty = newqty;
//     } else {
//       cartitems.push({ productId: new mongodb.ObjectId(product._id), qty: 1 });
//     }
//    //const update={items:[{productId:new mongodb.ObjectId(product._id),qty:1}]};
//     const db = getDb();
//     const update = { items: cartitems };
//     return db
//       .collection("Users")
//       .updateOne(
//         { _id: new mongodb.ObjectId(this._id) },
//         { $set: { cart: update } }
//       );
//   }
//   getCart() {
//     const db = getDb();
//     console.log("Inside getCart:",this);
//     const productids = this.cart.items.map((p) => p.productId);
//     return db
//       .collection("Products")
//       .find({ _id: { $in: productids } })
//       .toArray()
//       .then((products) => {
//         return products.map((product) => {
//           return {
//             ...product,
//             qty: this.cart.items.find((p) => {
//               return product._id.toString() === p.productId.toString();
//             }).qty,
//           };
//         });
//       });
//   }
// addOrder(){
//   const db=getDb();
//  return this.getCart().then(products=>{
//     const order={
//       items:products,
//       user:{
//         _id:new mongodb.ObjectId( this._id),
//         name:this.name,
//         mailid:this.mailid
//       }
//     }
//     return db.collection("Orders").insertOne(order);
//   }).then(result=>{
//     this.cart={items:[]};
//     return  db
//     .collection("Users")
//     .updateOne(
//       { _id: new mongodb.ObjectId(this._id) },
//       { $set: { cart:{items:[]}} }
//     );
//   });
// }
// getOrders(){
//   const db=getDb();
//   return db.collection("Orders").find({'user._id':new mongodb.ObjectId( this._id)}).toArray();
// }
//   static findById(userid) {
//     const db = getDb();
//     return db
//       .collection("Users")
//       .findOne({ _id: new mongodb.ObjectId(userid) })
//       .then((user) => {
//         // console.log(user);
//         return user;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
//   deletefromcart(prodid) {
//     const db = getDb();
//     const updatedcartitem=this.cart.items.filter(p=> {
//       return p.productId.toString()!==prodid.toString();
//     });
//     //const updatecart = { items: updatedcartitem };
//     return db
//       .collection("Users")
//       .updateOne(
//         { _id: new mongodb.ObjectId(this._id) },
//         { $set: { cart:{items:updatedcartitem}} }
//       );
//   }
// }

// module.exports = User;
