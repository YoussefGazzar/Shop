const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const updatedCartItems = [...this.cart.items];
  const newQuantity = 1;
  const productIndex = this.cart.items.findIndex((prod) => {
    return prod.productId.equals(product._id);
  });
  if (productIndex >= 0) {
    updatedCartItems[productIndex].quantity += newQuantity;
    console.log("updating old");
  } else {
    console.log("adding new");
    updatedCartItems.push({ productId: product._id, quantity: newQuantity });
  }
  const updatedCart = { items: updatedCartItems };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.deleteItemFromCart = function (prodId) {
  const updatedCartItems = this.cart.items.filter((item) => {
    return item.productId.toString() !== prodId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart.items = [];
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
// class User {
//   constructor(username, email, cart, id) {
//     this.name = username;
//     this.email = email;
//     this.cart = cart;
//     this._id = id;
//   }

//   save() {
//     const db = getDb();
//     return db.collection('users').insertOne(this);
//   }

//   addToCart(product) {
//     const updatedCartItems = [...this.cart.items];
//     const newQuantity = 1;
//     const productIndex = this.cart.items.findIndex(prod => {
//       return prod.productId.equals(product._id);
//     });
//     if (productIndex >= 0) {
//       updatedCartItems[productIndex].quantity += newQuantity;
//       console.log('updating old');
//     } else {
//       console.log('adding new');
//       updatedCartItems.push({ productId: product._id, quantity: newQuantity })
//     }
//     const updatedCart = { items: updatedCartItems };
//     const db = getDb();
//     return db.collection('users').updateOne({ _id: this._id }, { $set: { cart: updatedCart } })
//       .then(res => {
//         console.log('added to cart');
//       })
//   }

//   getCart() {
//     const db = getDb();
//     const productIds = this.cart.items.map(item => {
//       return item.productId;
//     })
//     return db.collection('products').find({ _id: { $in: productIds } })
//       .toArray()
//       .then(products => {
//         return products.map(product => {
//           return {
//             ...product, quantity: this.cart.items.find(item => {
//               return item.productId.equals(product._id)
//             }).quantity
//           }
//         })
//       })
//   }

//   addOrder() {
//     const db = getDb();
//     return this.getCart()
//       .then(products => {
//         const order = {
//           items: products,
//           user: {
//             _id: this._id,
//             name: this.name
//           }
//         }
//         return db.collection('orders').insertOne(order)
//       })
//       .then(res => {
//         return db.collection('users').updateOne({ _id: this._id }, { $set: { cart: { items: [] } } })
//       })
//   }

//   getOrders() {
//     const db = getDb();
//     return db.collection('orders').find({ 'user._id': this._id })
//       .toArray()
//       .then(orders => {
//         return orders;
//       })
//   }

//   deleteItemFromCart(prodId) {
//     const updatedCartItems = this.cart.items.filter(item => {
//       return item.productId.toString() !== prodId.toString();
//     })
//     const db = getDb();
//     console.log('deleted from cart');
//     return db.collection('users').updateOne({ _id: this._id }, { $set: { cart: { items: updatedCartItems } } })
//   }

//   static findById(id) {
//     const db = getDb();
//     return db.collection('users').findOne({ _id: new mongodb.ObjectId(id) });
//   }

// }

// module.exports = User;
