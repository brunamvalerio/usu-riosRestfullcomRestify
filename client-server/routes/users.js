// Importa o módulo 'express' para criar o servidor e gerenciar rotas
var express = require('express');

// Importa o módulo 'assert' para realizar verificações de erros durante a requisição
var assert = require('assert');

// Importa o cliente Restify para realizar chamadas HTTP para servidores externos
var restify = require('restify-clients');

// Cria uma instância do roteador do Express para definir as rotas
var router = express.Router();

// Criação do cliente Restify configurado para se conectar a um servidor na URL fornecida
var client = restify.createJsonClient({
    url: 'http://localhost:4000'  // URL do servidor externo com o qual vamos interagir
});

// Rota GET padrão para '/'.  para buscar os usuários 
router.get('/', function(req, res, next) {
    
    client.get('/users', function(err, request, response, obj) {
        // Verifica se houve algum erro na requisição
        assert.ifError(err); 

        
        res.json(obj);  
    });
});

// Nova rota GET para buscar um usuário específico com base no 'id' fornecido na URL.
router.get('/:id', function(req, res, next) {
    // Faz uma requisição GET para buscar um usuário específico usando o ID da URL
    client.get(`/users/${req.params.id}`, function(err, request, response, obj) {
    
        assert.ifError(err);

       
        res.json(obj);  
    });
});

// Rota PUT para atualizar os dados de um usuário específico. Espera um corpo (body) na requisição.
router.put('/:id', function(req, res, next) {
    // Faz uma requisição PUT para atualizar os dados do usuário com o ID fornecido
    client.put(`/users/${req.params.id}`, req.body, function(err, request, response, obj) {
        
        assert.ifError(err);

       
        res.json(obj); 
    });
});

// Rota DELETE para excluir um usuário específico
router.delete('/:id', function(req, res, next) {
    // Faz uma requisição DELETE para excluir o usuário com o ID fornecido
    client.del(`/users/${req.params.id}`, function(err, request, response, obj) {
        
        assert.ifError(err);

       
        res.json(obj);  
    });
});

// Rota POST para criar um novo usuário
router.post('/', function(req, res, next) {
   
    client.post(`/users`, req.body, function(err, request, response, obj) {
       
        assert.ifError(err);

        
        res.json(obj);  
    });
});


module.exports = router;


