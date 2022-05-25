const mongoose = require("mongoose");
const Schemha = mongoose.Schema;

const productSchema = new Schemha({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: Schemha.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Product", productSchema);
// class Product {
//   constructor(title, price, description, imageUrl, _id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = _id ? new mongodb.ObjectId(_id) : null;
//     this.userId = userId;
//   }

//   save() {
//     console.log(this.userId);
//     const db = getDb();
//     let dbOp;
//     if (this._id) {
//       dbOp = db.collection("products").updateOne({ _id: this._id }, { $set: this })
//     } else {
//       dbOp = db.collection("products").insertOne(this);
//     }
//     return dbOp
//       .then((res) => {
//         console.log(res);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static fetchAll() {
//     const db = getDb();
//     return db
//       .collection("products")
//       .find()
//       .toArray()
//       .then(products => {
//         return products;
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }

//   static findById(id) {
//     const db = getDb();
//     return db
//       .collection('products')
//       .find({ _id: new mongodb.ObjectId(id) })
//       .next()
//       .then(product => {
//         return product;
//       })
//       .catch(err => {
//         console.log(err);
//       })
//   }

//   static deleteById(id) {
//     const db = getDb();
//     return db.collection('products').deleteOne({ _id: new mongodb.ObjectId(id) })
//       .then(res => {
//         return db.collection('users').find()
//           .toArray()
//           .then(users => {
//             users.forEach(user => {
//               const updatedCartItems = user.cart.items.filter(item => {
//                 return item.productId.toString() !== id.toString();
//               })
//               console.log('deleted for ' + user.name);
//               return db.collection('users').updateOne({ _id: user._id }, { $set: { cart: { items: updatedCartItems } } })
//             })
//           })
//       })
//       .catch(err => {
//         console.log(err);
//       })
//   }
// }

// module.exports = Product;
