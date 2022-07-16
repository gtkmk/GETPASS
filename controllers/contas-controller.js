const mysql = require('../mysql').pool;
const jwt = require('jsonwebtoken');

exports.postTeste = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decode = jwt.verify(token, process.env.JWT_KEY);
    const user = decode.id_usuario;
    console.log(req.file);
    const a = req.file.path;

    return res.status(201).send(a);
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
                    mensagem: 'Produto inserido com sucesso',
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
                    conta_alterada: {
                        id_conta: result[0].id_conta,
                        id_usuario: result[0].id_usuario,
                        login: result[0].login,
                        senha: result[0].senha,
                        tipo: result[0].tipo,
                        imagem_produto: result[0].imagem_produto,
                        origem: result[0].origem,
                        request:{
                            tipo: 'GET',
                            descricao: 'Retorna os detalhes da conta listada',
                            url: 'http://localhost:3000/contas/' + req.body.id_conta
                        }
                    }                    
                }
                return res.status(202).send(response);
            }
        )
    });
};

exports.deleteProduto = (req, res, next) => {
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