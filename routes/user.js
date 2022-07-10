const express = require('express');
const router = express.Router();

const UsuariosController = require('../controllers/usuario-controller');

//Cadastro do usuário
router.post('/signup', UsuariosController.signUpUser);

//Login do usuário
router.post('/login', UsuariosController.login);

module.exports = router;