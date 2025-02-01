class HttpRequest {

    // Método  para fazer uma requisição GET
    static get(url, params = {}) {

        // Chama o método `request` com o método GET
        return HttpRequest.request('GET', url, params);
        
    }

    // Método  para fazer uma requisição DELETE
    static delete(url, params = {}) {

        // Chama o método `request` com o método DELETE
        return HttpRequest.request('DELETE', url, params);
        
    }

    // Método  para fazer uma requisição PUT
    static put(url, params = {}) {

        // Chama o método `request` com o método PUT
        return HttpRequest.request('PUT', url, params);
        
    }

    // Método  para fazer uma requisição POST
    static post(url, params = {}) {

        // Chama o método `request` com o método POST
        return HttpRequest.request('POST', url, params);
        
    }

    // Método privado que gerencia a requisição AJAX
    static request(method, url, params = {}) {

        return new Promise((resolve, reject) => {

            // Cria uma nova instância de XMLHttpRequest para enviar a requisição
            let ajax = new XMLHttpRequest();

            // Abre a requisição com o método e URL fornecidos
            ajax.open(method.toUpperCase(), url);

            // Define um manipulador de erro, caso a requisição falhe
            ajax.onerror = event => {

                // Rejeita a promise com o erro ocorrido
                reject(event);

            };
    
            // Define um manipulador para o evento onload, que ocorre quando a requisição é concluída com sucesso
            ajax.onload = event => {

                let obj = {}; // Inicializa um objeto vazio para armazenar a resposta

                try {

                    // Converte a resposta JSON
                    obj = JSON.parse(ajax.responseText);

                } catch (e) {

                    // Se houver erro ao fazer o parse, rejeita a promise e exibe o erro no console
                    reject(e);
                    console.error(e);

                }

                // Resolve a promise com o objeto convertido
                resolve(obj);
    
            };

            // Define o cabeçalho para enviar o conteúdo como JSON
            ajax.setRequestHeader('Content-Type', 'application/json')
    
            // Envia a requisição, convertendo os parâmetros para JSON
            ajax.send(JSON.stringify(params));

        });

    }

}
