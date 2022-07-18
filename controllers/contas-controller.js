const mysql = require('../mysql');
const jwt = require('jsonwebtoken');
const security = require('../security/crypto');
const { query } = require('express');

// --------------------------------------------------------------------------------------------------------------------------------------


// const token = req.headers.authorization.split(' ')[1];
// const decode = jwt.verify(token, process.env.JWT_KEY);
// var user = decode.id_usuario;
// return user;



var abb = "minha senha";

abb = security.encrypt(abb);
console.log(abb);
acc = security.decrypt(abb);
console.log(acc);




exports.Teste = (req, res, next) => {   
    var abb = "minha senha"; 
    const user1 = userAuthorization.usuario;
    const isso = userID();
    res.status(200).send({ mensagem: 
        user1
    });
}

exports.getContas = async (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decode = jwt.verify(token, process.env.JWT_KEY);
    var user = decode.id_usuario;
    try {
        const query = "SELECT * FROM contas WHERE id_usuario = ?;";
        const result = await mysql.execute(query, [
            user
        ]);
        const response = {
            quantidade: result.length,
            contas: result.map(conta => {
                return {
                    id_conta: conta.id_conta,
                    login: security.decrypt(conta.login),
                    senha: security.decrypt(conta.senha),
                    tipo: security.decrypt(conta.tipo),
                    origem: security.decrypt(conta.origem),
                    imagem: security.decrypt(conta.imagem),
                    user_id: user,
                    request: {
                        tipo: 'GET',
                        descricao: 'Retorna os detalhes da conta listada',
                        url: 'http://localhost:3000/contas/' + conta.id_produto
                    }
                }   
            })
        }
        return res.status(200).send(response);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
}

exports.postContas = async (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decode = jwt.verify(token, process.env.JWT_KEY);
    const user = decode.id_usuario;
    try {        
        console.log(req.file);
        const query = "INSERT INTO contas (id_usuario, login, senha, tipo, origem, imagem) VALUES (?,?,?,?,?,?)"
        const result = await mysql.execute(query, [
            user, 
            security.encrypt(req.body.login),
            security.encrypt(req.body.senha),
            security.encrypt(req.body.tipo),
            security.encrypt(req.body.origem),
            security.encrypt(req.file.path)
        ]);
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
    } catch (error) {
        return res.status(500).send({ error: error })
    }       
}

exports.getSingleConta = async (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decode = jwt.verify(token, process.env.JWT_KEY);
    var user = decode.id_usuario;
    try {
        const query = "SELECT * FROM contas WHERE id_usuario = ? AND id_conta = ?;";
        const result = await mysql.execute(query, [
            user,
            req.params.id_conta
        ]);
        const response = {
            conta: {
                id_conta: result[0].id_conta,
                id_usuario: result[0].id_usuario,
                login: security.decrypt(result[0].login),
                senha: security.decrypt(result[0].senha),
                tipo: security.decrypt(result[0].tipo),
                origem: security.decrypt(result[0].origem),
                imagem_produto: security.decrypt(result[0].imagem),
                request:{
                    tipo: 'GET',
                    descricao: 'Retorna todas as contas',
                    url: 'http://localhost:3000/contas'
                }
            }                            
        }
        return res.status(200).send(response);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
}

exports.patchConta = async (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decode = jwt.verify(token, process.env.JWT_KEY);
    const user = decode.id_usuario;
    try {        
        console.log(req.file);
        const query = "UPDATE contas SET login = ?, senha = ?, tipo = ?, origem = ?, imagem = ? WHERE id_conta = ? AND id_usuario = ?"
        await mysql.execute(query, [
            security.encrypt(req.body.login),
            security.encrypt(req.body.senha),
            security.encrypt(req.body.tipo),
            security.encrypt(req.body.origem),
            security.encrypt(req.file.path),
            req.body.id_conta,
            user
        ]);
        const response = {
            mensagem: 'Conta alterada com sucesso',
            contaAlterada: {
                id_conta: req.body.id_conta,
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
    } catch (error) {
        return res.status(500).send({ error: error })
    }
}

exports.deleteConta = async (req, res, next) => {

    const token = req.headers.authorization.split(' ')[1];
    const decode = jwt.verify(token, process.env.JWT_KEY);
    const user = decode.id_usuario;
    try {        
        console.log(req.file);
        const query = "DELETE FROM contas WHERE id_conta = ? AND id_usuario = ?"
        await mysql.execute(query, [
            req.body.id_conta,
            user
        ]);
        const response = {
            mensagem: 'Conta removida com sucesso',
            request: {
                tipo: 'POST',
                descricao: 'Insere uma conta',
                url: 'http://localhost:3000/contas',
                body: {
                    login: 'STRING',
                    senha: 'STRING',
                    tipo: 'STRING',
                    origem: 'STRING',
                    path: 'file',
                    user
                }
            }
        }
        return res.status(201).send(response);
    } catch (error) {
        return res.status(500).send({ error: error })
    }
}