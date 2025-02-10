const express = require('express');
const userController = require('../controller/userController')
const router = express.Router();


// Get All
router.get('/', userController.getAllUsers)

// Get Specific
router.get('/:id', userController.getSpecificUser)

// Create
router.post('/', userController.createUser)

// Update
router.patch('/:id', userController.updateUser)

// Delete
router.delete('/:id', userController.deleteMiddleWare, userController.deleteUser)

// Sign In
router.post('/sign-in', userController.signIn)

module.exports = router;