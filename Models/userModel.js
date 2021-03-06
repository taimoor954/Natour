const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// const { validator } = require('validator');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please mention your name'],
  },
  email: {
    type: String,
    required: [true, 'Please mention your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please insert a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false, //will not be shwon up when get will be use
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password Confirmation is required'],
    validate: {
      //this only work on save or create not on find one and update
      validator: function (passConfirm) {
        return passConfirm === this.password; //if pass confirm then true else false
      },
      message: 'Sorry passconfirm is diff', //err message
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  //shows you have 10 mins to change your passwod otherwise your token will be expired
  passwordResetTokenExpiresAt: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

//find those users whos acetive property is true
userSchema.pre(/^find/, function (next) {
  this.find({
    active: {
      $ne: false
    }
  })
  next()
})


//hash pass before saving doc
userSchema.pre('save', async function (next) {
  //if the pass is modified only then encrypt dontt encrypt again and again
  //  when email or other fields are modifier
  if (!this.isModified('password')) return next();

  //hash pass with cost of 12 //jitna ziada hash cost utna ziada time taken and utna ziada enrypted
  this.password = await bcrypt.hash(this.password, 12);
  //delete pass comfirm field
  this.passwordConfirm = undefined;
});
userSchema.pre('save', async function (next) {
  //if the pass is modified only then encrypt dontt encrypt again and again
  //  when email or other fields are modifier
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000 //sometimes jwt pehlay ajata hai and password changed time baad may
  //tou usay bachnay kay liye humnay date may 1s minus kardia (1000ms) just ha hack :)
  next()
});

//these method are called INSTANCE METHOD
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  //candidatepass is coming from req.body.pass whereas userpassword is password that is hashed and stored in mongo
  // this.password will not work because pass may selct prop hai so it wont work
  return await bcrypt.compare(userPassword, candidatePassword); //return bool
};

userSchema.methods.changePasswordAfter = async function (JWTTimeStamp) {
  //shows is password changed
  //after user signed up and jwt has been assigned
  //jwt time stamp shows the time of jwt being assigned
  if (this.passwordChangedAt) {
    const timeStampForPasswordChangedAt = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(JWTTimeStamp, timeStampForPasswordChangedAt );
    //false mean password not changed
    // console.log( JWTTimeStamp < timeStampForPasswordChangedAt)
    return JWTTimeStamp < timeStampForPasswordChangedAt;
    //if jwtTimeStamp means token given at time of sign up < password changed after sign up is true
  }

  return false; //means password is not chnaged since the account hass been created
};

userSchema.methods.createPasswordResetToken = function () {
  //a simple 32 lengths random string
  const resetToken = crypto.randomBytes(32).toString('hex'); //without enc
  //above token should be encrypt (with not so heavy algo) and store it into db so that we cab compare it with
  //token user provide

  this.passwordResetToken = crypto //with enc
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetTokenExpiresAt = Date.now() + 10 * 60 * 1000; //10 mins
  // console.log(this.passwordResetToken)
  // console.log(`${resetToken} enc token`)
  // console.log(this.passwordResetTokenExpiresAt)
  return resetToken; //non encrypted password will be returned to user 
  //so that he can enter the token and the enc token stored in database will be compared with it
};

const User = mongoose.model('User', userSchema);
exports.User = User;