class UserController {

    constructor(formIdCreate, formIdUpdate, tableId) {
        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();
        this.selectAll();
    }

    // Função que lida com a edição de um usuário
    onEdit() {
        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e => {
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
                    user.save();

                    this.getTr(user, tr); // Atualiza a linha com o novo usuário
                    this.updateCount();

                    this.formUpdateEl.reset();
                    btn.disabled = false;
                    this.showPanelCreate(); // Volta para o painel de criação
                },
                (e) => {
                    console.error(e);
                }
            );
        });
    }

    // Função que lida com o envio de um novo usuário
    onSubmit() {
        this.formEl.addEventListener("submit", event => {
            event.preventDefault();

            let btn = this.formEl.querySelector("[type=submit]");
            btn.disabled = true;

            let values = this.getValues(this.formEl);
            if (!values) return false;

            this.getPhoto(this.formEl).then(
                (content) => {
                    values.photo = content;
                    values.save();
                    this.addLine(values); // Adiciona a nova linha na tabela
                    this.formEl.reset();
                    btn.disabled = false;
                },
                (e) => {
                    console.error(e);
                }
            );
        });
    }

    // Função que lê a foto do usuário
    getPhoto(formEl) {
        return new Promise((resolve, reject) => {
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

            fileReader.onerror = (e) => {
                reject(e);
            };

            if (file) {
                fileReader.readAsDataURL(file);
            } else {
                resolve('dist/img/boxed-bg.jpg'); // Foto padrão se não for selecionada
            }
        });
    }

    // Função que pega os valores do formulário
    getValues(formEl) {
        let user = {};
        let isValid = true;

        [...formEl.elements].forEach(function (field, index) {
            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {
                field.parentElement.classList.add('has-error');
                isValid = false;
            }

            if (field.name == "gender") {
                if (field.checked) {
                    user[field.name] = field.value;
                }
            } else if (field.name == "admin") {
                user[field.name] = field.checked;
            } else {
                user[field.name] = field.value;
            }
        });

        if (!isValid) {
            return false;
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
        );
    }

    // Função que seleciona todos os usuários
    selectAll() {
        let ajax = new XMLHttpRequest();

        ajax.open('GET', '/users');
        ajax.onload = event => {
            let obj = { users: [] };

            try {
                obj = JSON.parse(ajax.responseText);
            } catch (e) {
                console.error(e);
            }

            obj.users.forEach(dataUser => {
                let user = new User();
                user.loadFromJSON(dataUser);
                this.addLine(user); // Adiciona cada usuário na tabela
            });
        };

        ajax.send();
    }

    // Função que adiciona uma nova linha na tabela
    addLine(dataUser) {
        let tr = this.getTr(dataUser);
        this.tableEl.appendChild(tr);
        this.updateCount();
    }

    // Função que gera o HTML de cada linha da tabela
    getTr(dataUser, tr = null) {
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

        this.addEventsTr(tr); // Adiciona os eventos de edição e exclusão

        return tr;
    }

    // Função que adiciona os eventos de editar e excluir nas linhas da tabela
    addEventsTr(tr) {
        tr.querySelector(".btn-delete").addEventListener("click", e => {
            if (confirm("Deseja realmente excluir?")) {
                let user = new User();
                user.loadFromJSON(JSON.parse(tr.dataset.user));
                user.remove(); // Remove o usuário
                tr.remove(); // Remove a linha
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

            this.formUpdateEl.querySelector(".photo").src = json._photo;
            this.showPanelUpdate(); // Mostra o painel de atualização
        });
    }

    // Função que exibe o painel de criação
    showPanelCreate() {
        document.querySelector("#box-user-create").style.display = "block";
        document.querySelector("#box-user-update").style.display = "none";
    }

    // Função que exibe o painel de edição
    showPanelUpdate() {
        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-update").style.display = "block";
    }

    // Função que atualiza a contagem de usuários e administradores
    updateCount() {
        let numberUsers = 0;
        let numberAdmin = 0;

        [...this.tableEl.children].forEach(tr => {
            numberUsers++;

            let user = JSON.parse(tr.dataset.user);
            if (user._admin) numberAdmin++;
        });

        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-users-admin").innerHTML = numberAdmin;
    }
}
