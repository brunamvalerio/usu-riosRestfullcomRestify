// Importa o módulo 'express' para criar o servidor e gerenciar rotas
var express = require('express');
// Importa o módulo 'assert' para realizar verificações de erros durante a requisição
var assert = require('assert');
// Importa o cliente Restify
var restify = require('restify-clients');
// Cria uma instância do roteador do Express
var router = express.Router();

// Criação do cliente Restify configurado para se conectar a um servidor na URL fornecida
var client = restify.createJsonClient({
    url: 'http://localhost:4000' 
});

/* 
  Rota GET para '/'. Quando um cliente acessa essa rota, o servidor irá
  fazer uma requisição a um servidor externo para obter dados e retorná-los ao cliente.
*/
router.get('/', function(req, res, next) {
    // Faz uma requisição GET ao servidor externo na rota '/users'
    client.get('/users', function(err, request, response, obj) {
        
        // Verifica se ocorreu algum erro na requisição
        assert.ifError(err); 

       
        // 'obj' contém os dados retornados da requisição externa
        res.end(JSON.stringify(obj, null, 2)); 

        // Ao usar JSON.stringify(obj, null, 2), estamos formatando a resposta com uma indentação de 2 espaços.
       
    });

});


module.exports = router;

