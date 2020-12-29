const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
});

//hash pass before saving doc
userSchema.pre('save', async function (next) {
  //if the pass is modified only then encrypt dontt encrypt again and again
  //  when email or other fields are modifier
  if (!this.isModified('password')) return next();

  //hash pass with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //delete pass comfirm field
  this.passwordConfirm = undefined;
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

  return false //means password is not chnaged since the account hass been created 
};

const User = mongoose.model('User', userSchema);
exports.User = User;
