const express = require('express');
const router = express.Router();

router.get('/',(req, res, next) => {
    res.status(200).send({
        mensagem: 'Estou em usuario.js'
    })
});

const UsuariosController = require('../controllers/usuario-controller');



//Cadastro do usuário
router.post('/signup', UsuariosController.signUpUser);

//Login do usuário
router.post('/login', UsuariosController.login);

module.exports = router;