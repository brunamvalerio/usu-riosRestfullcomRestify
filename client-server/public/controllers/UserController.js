class UserController {

    constructor(formIdCreate, formIdUpdate, tableId){

        // Armazena as referências dos elementos de formulário e da tabela
        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        // Inicializa os métodos de manipulação dos formulários
        this.onSubmit();
        this.onEdit();
        this.selectAll();  // Carrega todos os usuários (agora com AJAX)

    }

    onEdit(){
        // Ao clicar no botão de cancelar na tela de edição, volta para a tela de criação
        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e=>{
            this.showPanelCreate();
        });

        // Ao submeter o formulário de edição
        this.formUpdateEl.addEventListener("submit", event => {
            event.preventDefault();

            let btn = this.formUpdateEl.querySelector("[type=submit]");
            btn.disabled = true; // Desabilita o botão enquanto o envio está em andamento

            let values = this.getValues(this.formUpdateEl); // Coleta os valores do formulário

            let index = this.formUpdateEl.dataset.trIndex; // Obtém o índice da linha da tabela para atualizar
            let tr = this.tableEl.rows[index];

            let userOld = JSON.parse(tr.dataset.user); // Recupera os dados do usuário atual

            // Combina os dados antigos com os novos valores
            let result = Object.assign({}, userOld, values);

            // Faz a leitura da foto (se houver)
            this.getPhoto(this.formUpdateEl).then(
                (content) => {

                    // Se a foto não for alterada, mantém a foto anterior
                    if (!values.photo) {
                        result._photo = userOld._photo;
                    } else {
                        result._photo = content; // Se houver foto nova, usa a nova foto
                    }

                    let user = new User();
                    user.loadFromJSON(result); // Cria o objeto do usuário com os novos dados
                    user.save(); // Salva o usuário

                    // Atualiza a linha da tabela com os novos dados
                    this.getTr(user, tr);

                    this.updateCount(); // Atualiza a contagem de usuários

                    this.formUpdateEl.reset(); // Limpa o formulário
                    btn.disabled = false; // Habilita novamente o botão de submit
                    this.showPanelCreate(); // Volta para a tela de criação

                },
                (e) => {
                    console.error(e); // Caso ocorra erro na leitura da foto
                }
            );

        });

    }

    onSubmit(){
        // Ao submeter o formulário de criação
        this.formEl.addEventListener("submit", event => {
            event.preventDefault();

            let btn = this.formEl.querySelector("[type=submit]");
            btn.disabled = true; // Desabilita o botão enquanto o envio está em andamento

            let values = this.getValues(this.formEl); // Coleta os valores do formulário

            if (!values) return false; // Se os valores não forem válidos, não prossegue

            // Faz a leitura da foto (se houver)
            this.getPhoto(this.formEl).then(
                (content) => {

                    values.photo = content; // Atribui a foto ao objeto de valores
                    values.save(); // Salva o novo usuário

                    this.addLine(values); // Adiciona a linha na tabela

                    this.formEl.reset(); // Limpa o formulário
                    btn.disabled = false; // Habilita novamente o botão de submit

                }, 
                (e) => {
                    console.error(e); // Caso ocorra erro na leitura da foto
                }
            );

        });

    }

    getPhoto(formEl){
        // Função para ler a foto do formulário (se houver)
        return new Promise((resolve, reject) => {
            let fileReader = new FileReader();
            let elements = [...formEl.elements].filter(item => item.name === 'photo');
            let file = elements[0].files[0];

            fileReader.onload = () => {
                resolve(fileReader.result); // Retorna o conteúdo da foto
            };

            fileReader.onerror = (e) => {
                reject(e); // Caso ocorra um erro, retorna o erro
            };

            if (file) {
                fileReader.readAsDataURL(file); // Converte a foto em base64
            } else {
                resolve('dist/img/boxed-bg.jpg'); // Se não houver foto, usa uma imagem padrão
            }
        });
    }

    getValues(formEl){
        // Função para coletar os valores do formulário e validar
        let user = {};
        let isValid = true;

        [...formEl.elements].forEach(function (field, index) {

            // Valida os campos obrigatórios
            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {
                field.parentElement.classList.add('has-error');
                isValid = false;
            }

            if (field.name == "gender") {
                if (field.checked) {
                    user[field.name] = field.value; // Se for radio button, pega o valor selecionado
                }
            } else if(field.name == "admin") {
                user[field.name] = field.checked; // Se for checkbox, pega o estado (marcado/desmarcado)
            } else {
                user[field.name] = field.value; // Para outros campos, pega o valor diretamente
            }

        });

        if (!isValid) {
            return false; // Se houver erro de validação, retorna false
        }

        return new User(
            user.name,
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin
        ); // Retorna um novo objeto User
    }

    selectAll(){
        // Método modificado: Agora busca os usuários via AJAX
        let ajax = new XMLHttpRequest();
        ajax.open('GET', '/users'); // Faz uma requisição GET para a URL /users

        ajax.onload = event => {
            let obj = { users: [] };

            try {
                obj = JSON.parse(ajax.responseText); // Tenta parsear a resposta em JSON
            } catch (e) {
                console.error(e); // Caso ocorra um erro no parse, exibe no console
            }

            obj.users.forEach(dataUser => {
                let user = new User();
                user.loadFromJSON(dataUser); // Carrega os dados do usuário
                this.addLine(user); // Adiciona a linha na tabela
            });
        };

        ajax.send(); // Envia a requisição
    }

    addLine(dataUser) {
        // Adiciona uma nova linha na tabela com os dados do usuário
        let tr = this.getTr(dataUser);
        this.tableEl.appendChild(tr);
        this.updateCount(); // Atualiza a contagem de usuários
    }

    getTr(dataUser, tr = null){
        // Cria a linha (tr) com os dados do usuário
        if (tr === null) tr = document.createElement('tr');

        tr.dataset.user = JSON.stringify(dataUser); // Armazena os dados do usuário na linha

        tr.innerHTML = `
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
            <td>${Utils.dateFormat(dataUser.register)}</td>
            <td>
                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>
        `;

        this.addEventsTr(tr); // Adiciona os eventos aos botões de editar e excluir

        return tr;
    }

    addEventsTr(tr){
        // Adiciona os eventos de edição e exclusão na linha
        tr.querySelector(".btn-delete").addEventListener("click", e => {
            if (confirm("Deseja realmente excluir?")) {
                let user = new User();
                user.loadFromJSON(JSON.parse(tr.dataset.user));
                user.remove(); // Remove o usuário
                tr.remove(); // Remove a linha da tabela
                this.updateCount(); // Atualiza a contagem de usuários
            }
        });

        tr.querySelector(".btn-edit").addEventListener("click", e => {
            let json = JSON.parse(tr.dataset.user);
            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

            // Preenche os dados do formulário de edição
            for (let name in json) {
                let field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]");
                if (field) {
                    switch (field.type) {
                        case 'file':
                            continue; // Ignora campos de arquivo
                        case 'radio':
                            field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]");
                            field.checked = true;
                            break;
                        case 'checkbox':
                            field.checked = json[name];
                            break;
                        default:
                            field.value = json[name];
                    }
                }
            }

            this.formUpdateEl.querySelector(".photo").src = json
