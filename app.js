const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require ('cors');

const rotaUsuario = require('./routes/usuario');
const rotaContas = require('./routes/contas')

//app.use(cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requrested-With, Content-Type, Accept, Authorization, XMLHttpRequest'
    );
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    app.use(cors());
    next();
});


app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/usuario', rotaUsuario);
app.use('/contas', rotaContas);



//error 404
app.use((req, res, next) => {
    const erro = new Error('Não encontrado');
    erro.status = 404;
    next(erro);
});

//Recebe o error 404 e informa em forma de mensagem
app.use((erro, req, res, next)=> {
    res.status(erro.status || 500);
    return res.send({
        erro:{
            mensagem: erro.message
        }
    })
});

module.exports=app;