const express = require('express');

const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  deleteUser,
  updateUser,
  updateMe,
  deleteme,
  getUserId,
  getMe,
} = require('../Controllers/userController');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protectRouteMiddleware,
  restrictUser,
  tester
} = require('../Controllers/authenticationController');

router.post('/signup', signup);
router.post('/login',login);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:randomToken', resetPassword);
//PROTECT ALL ROUTES AFTER THIS MIDDLEWARE
router.use(protectRouteMiddleware); //ab neechay kay saray routes protected hen as middleware sequence say chaltay hen
//also ab humay router.patch('/updatepassword', protectRouteMiddleware, updatePassword); alag say protected middleware like thus
//likhnay ki need nahi haiprotectRouteMiddleware
 

router.patch('/updatepassword', updatePassword);

router.patch('/updateme', updateMe);
router.delete('/deleteme', deleteme); //for deactivation not deletion from mongo
router.get('/me', getUserId, getMe);

router.use(restrictUser('admin')); //ab neechay kay saray routes restric hen as middleware sequence say chaltay hen

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').patch(updateUser).delete(deleteUser).get(getUserById);
module.exports = router;
