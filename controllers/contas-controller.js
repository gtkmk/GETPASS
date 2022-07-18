const mysql = require('../mysql').pool;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// --------------------------------------------------------------------------------------------------------------------------------------
const security = require('../security/crypto');

var abb = "minha senha";

// function encrypt(value){
//     const iv = Buffer.from(crypto.randomBytes(16));
//     const cipher = crypto.createCipheriv("aes-256-cbc", key_in_bytes, iv);
//     let encrypted = cipher.update(value);
//     encrypted = Buffer.concat([encrypted, cipher.final()]);
//     return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
// }

// function encrypt(text){
//         const iv = Buffer.from(crypto.randomBytes(16));
//         const cipher = crypto.createCipheriv(process.env.CRYPTO_ALG, Buffer.from(process.env.CRYPTO_PSW), iv);
//         let encrypted = cipher.update(text);
//         encrypted = Buffer.concat([encrypted, cipher.final()]);
//         return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
//     }

// abb = encrypt(abb);
// console.log(encrypt(abb))

// function decrypt(text){
//     const [iv, encrypted] = text.split(':');
//     const ivBuffer = Buffer.from(iv, 'hex');
//     const decipher = crypto.createDecipheriv(process.env.CRYPTO_ALG, Buffer.from(process.env.CRYPTO_PSW), ivBuffer);
//     let content = decipher.update(Buffer.from(text, 'hex'));
//     content = Buffer.concat([ content, decipher.final() ]);
//     return content.toString();
// }
// abb = encrypt(abb);
// acc = encrypt(abb);
// add = decrypt(acc);

//---------------------------------------------------------------------------------------------------------------------------------------

const PASSWORD = "Pa$$w0rd"

function encrypt(text) {

    let iv = crypto.randomBytes(16);
    let salt = crypto.randomBytes(16);
    let key = crypto.scryptSync(PASSWORD, salt, 32);

    let cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    return `${iv.toString("hex")}:${salt.toString("hex")}:${encrypted}`;

}

function decrypt(text) {

    let [ivs, salts, data] = text.split(':');
    let iv = Buffer.from(ivs, "hex");
    let salt = Buffer.from(salts, "hex");
    let key = crypto.scryptSync("Pa$$w0rd", salt, 32);

    let decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(data, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted.toString();

}

abb = encrypt(abb);
console.log(abb);
acc = decrypt(abb)
console.log(acc);






























//------------------------------------------------------------------------------------------------------------------------------------------

exports.Teste = (req, res, next) => {
    res.status(200).send({ mensagem: abb });
}

exports.getContas = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decode = jwt.verify(token, process.env.JWT_KEY);
    const user = decode.id_usuario;
    mysql.getConnection((error, conn)=>{
        if(error){return res.status(500).send({ error: error }) }
        conn.query(
            "SELECT * FROM contas WHERE id_usuario = ?;",
            [user],
            (error, result, field)=>{
                conn.release();
                if(error){return res.status(500).send({ error: error }) }
                const response = {
                    quantidade: result.length,
                    contas: result.map(conta => {
                        return{
                            id_conta: conta.id_conta,
                            login: conta.login,
                            senha: conta.senha,
                            tipo: conta.tipo,
                            origem: conta.origem,
                            imagem: conta.imagem,                            
                            request:{
                                tipo: 'GET',
                                descricao: 'Retorna os detalhes da conta listada',
                                url: 'http://localhost:3000/contas/'+ conta.id_produto
                            }
                        }
                    })
                }
                return res.status(200).send(response);

            }
        )
    })
};

exports.postContas = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decode = jwt.verify(token, process.env.JWT_KEY);
    const user = decode.id_usuario;
    console.log(req.file);
    mysql.getConnection((error, conn)=>{
        if(error){return res.status(500).send({ error: error }) }
        conn.query(

            "INSERT INTO contas (id_usuario, login, senha, tipo, origem, imagem) VALUES (?,?,?,?,?,?)",

            [user, req.body.login, req.body.senha, req.body.senha, req.body.origem, req.file.path],

            (error, result, field)=>{
                conn.release();
                if(error){return res.status(500).send({ error: error }) }  
                const response = {
                    mensagem: 'Conta inserida com sucesso',
                    produtoCriado: {
                        id_conta: result.id_conta,
                        id_usuario: result.id_usuario,
                        login: req.body.login,
                        senha: req.body.senha,
                        tipo: req.body.tipo,
                        origem: req.body.origem,
                        conta_imagem: req.file.path,
                        request: {
                            tipo: 'GET',
                            descricao: 'Retorna todas as contas',
                            url: 'http://localhost:3000/contas'
                        }
                    }
                }
                return res.status(201).send(response);
            }
        )
    });    
};

exports.getSingleConta = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decode = jwt.verify(token, process.env.JWT_KEY);
    const user = decode.id_usuario;
    mysql.getConnection((error, conn)=>{
        if(error){return res.status(500).send({ error: error }) }
        conn.query(
            "SELECT * FROM contas WHERE id_usuario = ? AND id_conta = ?;",
            [user, req.params.id_conta],
            (error, result, field)=>{
                conn.release();
                if(error){return res.status(500).send({ error: error }) }

                if(result.length == 0){
                    return res.status(404).send({
                        mensagem: 'Conta não encontrada!'
                    })
                }
                const response = {
                    conta: {
                        id_conta: result[0].id_conta,
                        id_usuario: result[0].id_usuario,
                        login: result[0].login,
                        senha: result[0].senha,
                        tipo: result[0].tipo,                        
                        origem: result[0].origem,
                        imagem_produto: result[0].imagem_produto,
                        request:{
                            tipo: 'GET',
                            descricao: 'Retorna todas as contas',
                            url: 'http://localhost:3000/contas'
                        }
                    }                            
                }
                return res.status(200).send(response); 
            }
        )
    })   
};

exports.patchConta = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decode = jwt.verify(token, process.env.JWT_KEY);
    const user = decode.id_usuario;
    console.log(req.file);
    mysql.getConnection((error, conn)=>{
        if(error){return res.status(500).send({ error: error }) }
        conn.query(

            "UPDATE contas SET login = ?, senha = ?, tipo = ?, origem = ?, imagem = ? WHERE id_conta = ? AND id_usuario = ?",

            [req.body.login, req.body.senha, req.body.tipo, req.body.origem, req.file.path, req.body.id_conta, user],

            (error, result, field)=>{
                conn.release();
                if(error){return res.status(500).send({ error: error }) }  
                const response = {
                    mensagem: 'Conta alterada com sucesso',
                    produtoCriado: {
                        id_conta: result.id_conta,
                        id_usuario: result.id_usuario,
                        login: req.body.login,
                        senha: req.body.senha,
                        tipo: req.body.tipo,
                        origem: req.body.origem,
                        conta_imagem: req.file.path,
                        request:{
                            tipo: 'GET',
                            descricao: 'Retorna os detalhes da conta listada',
                            url: 'http://localhost:3000/contas/' + req.body.id_conta
                        }
                    }
                }
                return res.status(201).send(response);
            }
        )
    }); 
};

exports.deleteConta = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decode = jwt.verify(token, process.env.JWT_KEY);
    const user = decode.id_usuario;
    mysql.getConnection((error, conn)=>{
        if(error){return res.status(500).send({ error: error }) }

        conn.query(

            "DELETE FROM contas WHERE id_conta = ? AND id_usuario = ?",

            [req.body.id_conta, user],

            (error, result, field)=>{
                conn.release();

                if(error){return res.status(500).send({ error: error }) }     
                const response = {
                    mensagem: 'Conta removido com sucesso',
                    request: {
                        tipo: 'POST',
                        descricao: 'Insere uma conta',
                        url: 'http://localhost:3000/contas',
                        body: {
                            nome: 'STRING',
                            preco: 'NUMBER'
                        }
                    }
                }
                res.status(201).send(response);
            }
        )
    });
};