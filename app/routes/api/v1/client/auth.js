const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const validationSchemas = require('../../../../services/shared/validation');
const Mailer = require('../../../../services/shared/Mailer');
const Client = require('../../../../models/client/Client');
const ClientAuthenticator = require('../../../../services/client/ClientAuthenticator');
const Strings = require('../../../../services/shared/Strings');


mongoose.Promise = Promise;

const router = express.Router();

require('dotenv')
  .config();

const JWT_KEY = process.env.JWT_KEY_CLIENT;

/**
 * Body Parser Middleware
 */

router.use(bodyParser.json());
router.use(expressValidator({}));

/**
 * Client signup route
 */

router.post('/signup', (req, res, next) => {
  /**
   * Body Inputs
   */

  const userInfo = {
    email: req.body.email,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    mobile: req.body.mobile,
    gender: req.body.gender,
    birthdate: req.body.birthdate,
  };

  /**
   * Form Validation.
   */

  req.checkBody(validationSchemas.clientSignupValidation);
  req.checkBody('confirmPassword')
    .equals(req.body.password)
    .withMessage(Strings.clientValidationErrors.passwordMismatch);

  req.getValidationResult()
    .then((result) => {
      if (result.isEmpty()) {
        new Client(userInfo)
          .save()
          .then(() => {
            ClientAuthenticator.generateConfirmationToken(req.body.email)
              .then((token) => {
                Mailer.clientConfirmEmail(req.body.email, req.hostname, token)
                  .then(() => {
                    res.json({
                      message: Strings.clientSuccess.signup,
                    });
                  })
                  .catch(e => next([e]));
              })
              .catch(e => next([e]));
          })
          .catch(() => next([Strings.clientValidationErrors.userExists]));
      } else {
        next(result.array());
      }
    });
});

/**
 * Send Confirmation Mail Route
 * For resending a confirmation Mail to User
 */

router.post('/confirmation/send', (req, res, next) => {
  req.checkBody(validationSchemas.clientConfirmEmailValidation);
  req.getValidationResult()
    .then((result) => {
      if (result.isEmpty()) {
        ClientAuthenticator.generateConfirmationToken(req.body.email)
          .then((token) => {
            Mailer.clientConfirmEmail(req.body.email, req.hostname, token)
              .then(() => {
                res.json({
                  message: Strings.clientSuccess.emailConfirmation,
                });
              })
              .catch(e => next([e]));
          })
          .catch(e => next([e]));
      } else {
        next(result.array());
      }
    });
});

/**
 * Client reset password
 */

router.post('/reset', (req, res, next) => {
  const resetToken = req.body.token;
  const password = req.body.password;

  req.checkBody(validationSchemas.clientResetPasswordValidation);
  req.checkBody('confirmPassword')
    .equals(req.body.password)
.withMessage(Strings.clientValidationErrors.passwordMismatch);

  jwt.verify(resetToken, JWT_KEY, (err, payload) => {
    if (!payload) {
      next(Strings.businessForgotPassword.INva);
    } else {
      const email = payload.email;
      const creationDate = new Date(parseInt(payload.iat, 10) * 1000);

      Client.findOne({
        email,
        passwordChangeDate: {
          $lte: creationDate,
        },
      })
      .exec()
      .then((client) => {
        if (!client) {
          return next(Strings.businessForgotPassword.INVALID_RESET_TOKEN);
        }
        client.passwordResetTokenDate = undefined; // Disable the token
        client.passwordChangeDate = Date.now(); // Invalidate Login Tokens
        client.password = password; // Reset password

        return client.save()
          .then(() => res.json({
            message: Strings.clientForgotPassword.PASSWORD_RESET_SUCCESS,
          }));
      })
      .catch(e => next([e]));
    }
  });
});


/**
 * Confirm Email Route
 */

router.post('/confirmation/:token/confirm', (req, res, next) => {

});


/**
 * Client Login
 */

router.post('/login', (req, res, next) => {
  req.checkBody(validationSchemas.clientLoginValidation);
  req.getValidationResult()
    .then((result) => {
      if (result.isEmpty()) {
        ClientAuthenticator.loginClient(req.body.email, req.body.password)
          .then(info => res.json(info))
          .catch(err => next([err]));
      } else {
        next(result.array());
      }
    });
});

/**
 * Client forgot password
 */

router.post('/forgot', (req, res, next) => {
  const email = req.body.email;
  const currentDate = Date.now();
  const iat = Math.floor(currentDate / 1000);
  const resetToken = jwt.sign({
    email,
    iat,
  }, JWT_KEY, {
    expiresIn: '1h',
  });

  Client.findOne({
    email: req.body.email,
  }).exec().then((client) => {
    if (!client) { // Client not found, Invalid mail
      return res.json({
        message: Strings.clientForgotPassword.CHECK_YOU_EMAIL,
      });
    }
    client.passwordResetTokenDate = currentDate;

    return client.save().then(() => {
      Mailer.forgotPasswordEmail(email, req.hostname, resetToken)
        .then(() => res.json({ message: Strings.clientForgotPassword.CHECK_YOU_EMAIL }))
        .catch(err => next([err]));
    });
  }).catch(err => next([err]));
});

/**
 *  Error Handling Middlewares.
 */

router.use((err, req, res, next) => {
  res.status(400)
    .json({
      errors: err,
    });
});

module.exports = router;
