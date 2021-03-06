const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const Schema = mongoose.Schema;

/**
 * Business Schema.
 */

const businessSchema = Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  phoneNumbers: [{
    type: String,
    required: true,
  }],
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category',
  }],
  branches: [{
    type: Schema.Types.ObjectId,
    ref: 'Branch',
  }],
  gallery: [{
    path: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  }],
  workingHours: {
    type: String,
  },
  passwordResetTokenDate: {
    type: Date,
    default: Date.now,
  },
  confirmationTokenDate: {
    type: Date,
    default: Date.now,
  },
  passwordChangeDate: {
    type: Date,
    default: Date.now,
  },
  _status: {
    type: String,
    enum: ['unverified', 'verified', 'rejected', 'pending'],
    default: 'unverified',
  },
  _deleted: {
    type: Boolean,
    default: false,
  },
});

/**
 * Hash password before saving the document.
 */

businessSchema.pre('save', function preSave(done) {
  if (!this.isModified('password')) {
    done();
  } else {
    bcrypt.hash(this.password, null, null, (err, hashedPassword) => {
      if (err) {
        return done(err);
      }

      this.password = hashedPassword;
      return done();
    });
  }
});

/**
 * Check the password.
 * @param {String} guess - The guessed password
 * @returns {Promise} - Resolves if no error occurs, rejects otherwise.
 */

businessSchema.methods.checkPassword = function checkPassword(guess) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(guess, this.password, (err, matching) => {
      if (err) {
        return reject(err);
      }
      return resolve(matching);
    });
  });
};

module.exports = mongoose.model('Business', businessSchema);
