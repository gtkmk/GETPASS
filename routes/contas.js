const express = require('express');
const router = express.Router();
const multer = require('multer');
const login = require('../middleware/login');

const ProdutosController = require('../controllers/contas-controller');

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, './uploads/');
    },
    filename: function (req, file, cb){
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFielter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ){
        cb(null, true);
    }else{
        cb(null, false);
    }
}

//Uploado da imagem do logo da conta
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 8
    },
    fileFielter: fileFielter
});

//Retorna todas as contas
router.get(
    '/',
    login.obrigatorio,
    ProdutosController.getContas
);

//Insere uma conta
router.post(
    '/',
    login.obrigatorio,
    upload.single('conta_imagem'),
    ProdutosController.postContas
);

//Retorna sobre uma conta
router.get(
    '/:id_conta',
    login.obrigatorio,
    ProdutosController.getSingleConta
);

//Altera uma conta
router.patch(
    '/',
    login.obrigatorio,
    upload.single('conta_imagem'),
    ProdutosController.patchConta
);

//Deleta uma conta
router.delete(
    '/',
    login.obrigatorio,
    ProdutosController.deleteConta
);

module.exports = router;