const express = require("express");
const { check, body } = require("express-validator");

const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.get("/reset", authController.getReset);

router.get("/reset/:token", authController.getNewPassword);

router.post(
  "/login",
  [
    body("email", "Please enter a valid E-Mail").isEmail().normalizeEmail(),
    body("password", "Password can't be empty").isLength({ min: 1 }).trim(),
  ],
  authController.postLogin
);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid E-Mail")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "This E-Mail already exists! Please try another one.."
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      "password",
      "Please enter a password not less than 3 characters, with numbers and text only."
    )
      .isLength({ min: 3 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("These are different passwords. They MUST match..");
        }
        return true;
      }),
  ],
  authController.postSignup
);

router.post("/logout", authController.postLogout);

router.post("/reset", authController.postReset);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
