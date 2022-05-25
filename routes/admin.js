const express = require("express");
const { body } = require("express-validator");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

// /admin/add-product => POST
router.post(
  "/add-product",
  [
    body("title", "Title must be 3 characters at least")
      .isLength({ min: 3 })
      .trim(),
    // body("imageUrl", "Please provide a proper URL for the Image").isURL(),
    body("price", "Please provide a valid Price").isFloat(),
    body("description", "Description must be between 3 and 400 characters")
      .isLength({ min: 3, max: 400 })
      .trim(),
  ],
  isAuth,
  adminController.postAddProduct
);

// /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product",
  [
    body("title", "Title must be 3 characters at least")
      .isLength({ min: 3 })
      .trim(),
    // body("imageUrl", "Please provide a proper URL for the Image").isURL(),
    body("price", "Please provide a valid Price").isFloat(),
    body("description", "Description must be between 3 and 400 characters")
      .isLength({ min: 3, max: 400 })
      .trim(),
  ],
  isAuth,
  adminController.postEditProduct
);

// router.post("/delete-product", isAuth, adminController.postDeleteProduct);

router.delete("/product/:productId", isAuth, adminController.deleteProduct);

module.exports = router;
