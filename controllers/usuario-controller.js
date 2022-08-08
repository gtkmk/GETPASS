const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signUpUser = (req, res, next) => {
    mysql.getConnection((error, conn)=>{
        if(error){return res.status(500).send({ error: error }) }
        conn.query(`SELECT email FROM usuario WHERE email = ?`, [req.body.email], (error, results) => {
            if(results.length > 0){
                return res.status(409).send({ mensagem: 'Usuário já cadastrado!' });
            }else {
                bcrypt.hash(req.body.senha, 12, (errBcrypt, hash) => {
                    if(errBcrypt) { return res.status(500).send({ error: errBcrypt}) }
                    conn.query(`INSERT INTO usuario (email, senha, nome, sobrenome) VALUES (?,?,?,?)`,
                    [req.body.email, hash, req.body.nome, req.body.sobrenome],
                    (error, results) => {
                        conn.release();
                        if(error){return res.status(500).send({ error: error }) }
                        response = {
                            mensagem: 'Usuário criado com sucesso!',
                            usuarioCriado: {
                                id_usuario: results.insertId,
                                email: req.body.email,
                                nome: req.body.nome,
                                sobrenome: req.body.sobrenome
                            }
                        }
                        return res.status(201).send(response)
                    });
                });
            }
        });
        
    });    
};

exports.login = (req, res, next) => {
    mysql.getConnection((error, conn)=>{
        if(error){return res.status(500).send({ error: error }) }
        conn.query('SELECT * FROM usuario WHERE email = ?', [req.body.email], (error, results, fields) => {
            conn.release();
            if (error) { return res.status(500).send({ error: error }) }
            if(results.length < 1){
                return res.status(401).send({ mensagem: 'Falha na autenticação' })
            }
            bcrypt.compare(req.body.senha, results[0].senha, (err, result) => {
                if(err){
                    return res.status(401).send({ mensagem: 'Falha na autenticação' })
                }
                if(result){
                    const token = jwt.sign({
                        id_usuario: results[0].id_usuario,
                        email:  results[0].email,
                        nome: results[0].nome,
                        sobrenome: results[0].sobrenome
                    },
                    process.env.JWT_KEY, 
                    {
                        expiresIn: "1h"
                    });
                    return res.status(200).send({ 
                        mensagem: 'Autenticado com sucesso!',
                        token: token
                    })
                }
                return res.status(401).send({ mensagem: 'Falha na autenticação' })
            });
        });
    });
};