const express = require('express');

const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  deleteUser,
  updateUser,
} = require('../Controllers/userController');
const { signup,login } = require('../Controllers/authenticationController');

router.post('/signup', signup); 
router.post('/login', login); 

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').patch(updateUser).delete(deleteUser).get(getUserById);
module.exports = router;
