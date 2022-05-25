const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");

const User = require("../models/user");

const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.TRANSPORTER_USER,
    pass: process.env.TRANSPORTER_PASS,
  },
});

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: { email: "", password: "" },
    validationErrors: [],
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    oldInput: { name: "", email: "", password: "", confirmPassword: "" },
    validationErrors: [],
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid token. Please request a new one.");
        return res.redirect("/reset");
      }
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  // make validation while routing for this to work
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array(),
      oldInput: { email: email, password: password },
      validationErrors: errors.array(),
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "Login",
          errorMessage: [
            {
              msg: password
                ? "Invalid E-Mail or Password"
                : "Password can't be empty",
            },
          ],
          oldInput: { email: email, password: password },
          validationErrors: errors.array(),
        });
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
              // return transporter.sendMail({
              //   from: "YoussefGazzar@Node.js.com",
              //   to: email,
              //   subject: "Successful Login",
              //   html: `<h1>Welcome Back, ${user.name}! ❤</h1>`,
              // });
            });
          }
          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: [
              {
                msg: password
                  ? "Invalid E-Mail or Password"
                  : "Password can't be empty",
              },
            ],
            oldInput: { email: email, password: password },
            validationErrors: errors.array(),
          });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array(),
      oldInput: {
        name: name,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }
  // User.findOne({ email: email })
  //   .then((userDoc) => {
  //     if (userDoc) {
  //       req.flash(
  //         "error",
  //         "E-Mail already exists! Please pick a different one.."
  //       );
  //       return res.redirect("/signup");
  //     }
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        name: name,
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login");
      return transporter.sendMail({
        from: "YoussefGazzar@Node.js.com",
        to: email,
        subject: "Successful Registeration!",
        html: `<h1>Welcome to our humble platform, ${name}!❤</h1>`,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "There's no account for that email..");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save().then((result) => {
          res.redirect("/");
          return transporter.sendMail({
            from: "YoussefGazzar@Node.js.com",
            to: req.body.email,
            subject: "Password Reset",
            html: `
            <p>You have requested a password reset.</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
            `,
          });
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      if (!user) {
        req.flash(
          "error",
          "Sorry, your token has expired. Please request a new one.."
        );
        return res.redirect("/reset");
      }
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
      return transporter.sendMail({
        from: "YoussefGazzar@Node.js.com",
        to: resetUser.email,
        subject: "Password Reset Successfully",
        html: `Congratulations ${resetUser.name}! You have successfully reset your password.`,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
