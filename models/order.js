const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  products: [
    {
      product: { type: Object, require: true },
      qty: { type: Number, require: true },
    },
  ],
  user: {
    mailid: {
      type: String,
      require: true,
    },
    userid: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
  },
});

module.exports=mongoose.model('Order',orderSchema);
