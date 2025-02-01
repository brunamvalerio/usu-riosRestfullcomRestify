class UserController {

    constructor(formIdCreate, formIdUpdate, tableId){

        // Inicializa os elementos dos formulários e da tabela
        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        // Chama os métodos responsáveis por configurar os eventos
        this.onSubmit();
        this.onEdit();
        this.selectAll();

    }

    onEdit(){

        // Evento que ativa o cancelamento da edição e retorna ao formulário de criação
        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e=>{

            this.showPanelCreate();

        });


        this.formUpdateEl.addEventListener("submit", event => {

            event.preventDefault();

            let btn = this.formUpdateEl.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formUpdateEl);

            let index = this.formUpdateEl.dataset.trIndex;

            let tr = this.tableEl.rows[index];

            let userOld = JSON.parse(tr.dataset.user);

            let result = Object.assign({}, userOld, values);

            this.getPhoto(this.formUpdateEl).then(
                (content) => {

                    if (!values.photo) {
                        result._photo = userOld._photo;
                    } else {
                        result._photo = content;
                    }

                    let user = new User();

                    user.loadFromJSON(result);

                    user.save().then(user => {

                        this.getTr(user, tr);

                        this.updateCount();

                        this.formUpdateEl.reset();

                        btn.disabled = false;

                        this.showPanelCreate();

                    });

                },
                (e) => {
                    console.error(e);
                }
            );

        });

    }

    onSubmit(){

        this.formEl.addEventListener("submit", event => {

            event.preventDefault();

            let btn = this.formEl.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formEl);

            if (!values) return false;

            this.getPhoto(this.formEl).then(
                (content) => {
                    
                    values.photo = content;

                    values.save().then(user => {

                        this.addLine(user);

                        this.formEl.reset();

                        btn.disabled = false;

                    });

                }, 
                (e) => {
                    console.error(e);
                }
            );

        });

    }

    getPhoto(formEl){

        return new Promise((resolve, reject)=>{

            let fileReader = new FileReader();

            let elements = [...formEl.elements].filter(item => {

                if (item.name === 'photo') {
                    return item;
                }

            });

            let file = elements[0].files[0];

            fileReader.onload = () => {

                resolve(fileReader.result);

            };

            fileReader.onerror = (e)=>{

                reject(e);

            };

            if (file) {
                fileReader.readAsDataURL(file);
            } else {
                resolve('dist/img/boxed-bg.jpg');
            }

        });

    }

    getValues(formEl){

        let user = {};
        let isValid = true;

        // Itera sobre os elementos do formulário
        [...formEl.elements].forEach(function (field, index) {

            // Verifica se campos obrigatórios (name, email, password) estão preenchidos
            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {

                // Adiciona classe de erro caso o campo esteja vazio
                field.parentElement.classList.add('has-error');
                isValid = false;

            }

            // Verifica se o campo é de gênero (radio buttons)
            if (field.name == "gender") {

                if (field.checked) {
                    user[field.name] = field.value;
                }

            } else if(field.name == "admin") {

                // Se for checkbox, armazena o estado de seleção
                user[field.name] = field.checked;

            } else {

                // Para os outros campos, armazena o valor digitado
                user[field.name] = field.value;

            }

        });

        // Se algum campo obrigatório estiver vazio, retorna false
        if (!isValid) {
            return false;
        }

        // Retorna um objeto User com os dados coletados do formulário
        return new User(
            user.name,
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin
        );

    }

    selectAll(){

        // Faz uma requisição HTTP para buscar todos os usuários
        HttpRequest.get('/users').then(data => {

            // Para cada usuário retornado, cria um objeto User e adiciona à tabela
            data.users.forEach(dataUser => {

                let user = new User();
    
                user.loadFromJSON(dataUser);
    
                this.addLine(user);
    
            });

        });

    }


    addLine(dataUser) {

        let tr = this.getTr(dataUser);

        this.tableEl.appendChild(tr);

        this.updateCount();

    }

    getTr(dataUser, tr = null){

        if (tr === null) tr = document.createElement('tr');

        tr.dataset.user = JSON.stringify(dataUser);

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

        this.addEventsTr(tr);

        return tr;

    }

    addEventsTr(tr){

        tr.querySelector(".btn-delete").addEventListener("click", e => {

            if (confirm("Deseja realmente excluir?")) {

                let user = new User();

                user.loadFromJSON(JSON.parse(tr.dataset.user));

                user.remove();

                tr.remove();

                this.updateCount();

            }

        });

        // Evento de edição: ao clicar no botão de edição
        tr.querySelector(".btn-edit").addEventListener("click", e => {

            // Converte os dados do usuário da linha para um objeto JSON
            let json = JSON.parse(tr.dataset.user);

            // Define o índice da linha no formulário de edição
            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

            // Itera sobre as propriedades do objeto JSON do usuário
            for (let name in json) {

                // Busca o campo correspondente no formulário de edição
                let field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]");

                if (field) {

                    // Verifica o tipo de campo e preenche conforme necessário
                    switch (field.type) {
                        case 'file':
                            continue; // Ignora campos do tipo 'file'
                            break;

                        case 'radio':
                            // Marca o botão de rádio correspondente ao valor do usuário
                            field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]");
                            field.checked = true;
                            break;

                        case 'checkbox':
                            // Marca o checkbox se o valor for verdadeiro
                            field.checked = json[name];
                            break;

                        default:
                            // Para outros tipos de campo, preenche o valor diretamente
                            field.value = json[name];

                    }

                }

            }

            // Atualiza a imagem de perfil no formulário de edição
            this.formUpdateEl.querySelector(".photo").src = json._photo;

            // Mostra o painel de edição
            this.showPanelUpdate();


        });

    }


    showPanelCreate(){

        document.querySelector("#box-user-create").style.display = "block";
        document.querySelector("#box-user-update").style.display = "none";

    }

    showPanelUpdate() {

        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-update").style.display = "block";

    }

    updateCount(){

        let numberUsers = 0;
        let numberAdmin = 0;

        [...this.tableEl.children].forEach(tr=>{

            numberUsers++;
            
            let user = JSON.parse(tr.dataset.user);

            if (user._admin) numberAdmin++;
            
        });

        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-users-admin").innerHTML = numberAdmin;

    }

}