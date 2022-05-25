const Product = require("../models/product");
const User = require("../models/user");
const { validationResult } = require("express-validator");
const fileHelper = require("../util/delete-file");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);
  console.log(image);
  if (!image) {
    return res.status(422).render("admin/edit-product", {
      path: "/admin/edit-product",
      pageTitle: "Add Product",
      errorMessage: [{ msg: "Attached file is not an image.." }],
      editing: false,
      hasError: true,
      validationErrors: [],
      product: {
        title: title,
        price: price,
        description: description,
      },
    });
  }

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      path: "/admin/edit-product",
      pageTitle: "Add Product",
      errorMessage: errors.array(),
      editing: false,
      hasError: true,
      validationErrors: errors.array(),
      product: {
        title: title,
        price: price,
        description: description,
      },
    });
  }

  const imageUrl = "/" + image.path;

  const product = new Product({
    // _id: mongoose.Types.ObjectId("6284f0c9b69675f808b33af4"),
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      // console.log(result);
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
        product: product,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const image = req.file;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      path: "/admin/edit-product",
      pageTitle: "Edit Product",
      errorMessage: errors.array(),
      editing: true,
      hasError: true,
      validationErrors: errors.array(),
      product: {
        _id: prodId,
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
      },
    });
  }
  // Product.findByIdAndUpdate(prodId, {
  //   title: updatedTitle,
  //   price: updatedPrice,
  //   description: updatedDesc,
  //   imageUrl: updatedImageUrl,
  // })
  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if (image) {
        fileHelper.deleteFile(product.imageUrl.slice(1));
        product.imageUrl = "/" + image.path;
      }
      return product.save().then((result) => {
        // console.log(result);
        console.log("UPDATED PRODUCT!");
        res.redirect("/admin/products");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user })
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// exports.postDeleteProduct = (req, res, next) => {
//   const prodId = req.body.productId;
//   let imagePath;
//   Product.findById(prodId)
//     .then((product) => {
//       if (!product) {
//         return next(new Error("This product doesn't exist anymore"));
//       }
//       imagePath = product.imageUrl.slice(1);
//       return Product.deleteOne({ _id: prodId, userId: req.user });
//     })
//     // Product.findByIdAndDelete(prodId)
//     .then((product) => {
//       // there's no reason for rechecking now, as i've already checked earlier
//       if (product.deletedCount) {
//         fileHelper.deleteFile(imagePath);
//         User.find()
//           .then((users) => {
//             users.forEach((user) => {
//               user.deleteItemFromCart(prodId);
//               // console.log(`This item is deleted from ${user.name}'s cart`);
//             });
//           })
//           .then((result) => {
//             console.log("DESTROYED PRODUCT");
//           });
//       }
//       res.redirect("/admin/products");
//     })
//     .catch((err) => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  let imagePath;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error("This product doesn't exist anymore"));
      }
      imagePath = product.imageUrl.slice(1);
      return (
        Product.deleteOne({ _id: prodId, userId: req.user })
          // Product.findByIdAndDelete(prodId)
          .then(() => {
            fileHelper.deleteFile(imagePath);
            User.find().then((users) => {
              users.forEach((user) => {
                user.deleteItemFromCart(prodId);
                // console.log(`This item is deleted from ${user.name}'s cart`);
              });
            });
          })
          .then((result) => {
            console.log("DESTROYED PRODUCT");
            res.status(200).json({ message: "DESTROYED PRODUCT" });
          })
      );
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Deleting product failed.." });
    });
};
