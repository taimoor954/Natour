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
} = require('../Controllers/userController');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protectRouteMiddleware,
} = require('../Controllers/authenticationController');

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:randomToken', resetPassword);
router.patch('/updatepassword', protectRouteMiddleware, updatePassword);
router.patch('/updateme', protectRouteMiddleware, updateMe);
router.delete('/deleteme', protectRouteMiddleware, deleteme); //for deactivation not deletion from mongo

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').patch(updateUser).delete(deleteUser).get(getUserById);
module.exports = router;