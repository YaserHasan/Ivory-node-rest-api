const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/auth_controller'); 
const checkAuth = require('../middlewares/check_auth');

router.post('/register', AuthController.register);

router.post('/login', AuthController.login);

router.delete('/logout', checkAuth, AuthController.logout);

router.post('/refreshToken', AuthController.refreshToken);

router.get('/checkAuth', checkAuth, AuthController.checkAuth);

module.exports = router;