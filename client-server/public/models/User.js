class User {

    constructor(name, gender, birth, country, email, password, photo, admin){

        this._id;
        this._name = name;
        this._gender = gender;
        this._birth = birth;
        this._country = country;
        this._email = email;
        this._password = password;
        this._photo = photo;
        this._admin = admin;
        this._register = new Date(); // A data de registro é inicializada com a data atual

    }

    get id(){
        return this._id;
    }

    get register(){
        return this._register;
    }

    get name(){
        return this._name;
    }

    get gender() {
        return this._gender;
    }

    get birth() {
        return this._birth;
    }

    get country() {
        return this._country;
    }

    get email() {
        return this._email;
    }

    get photo() {
        return this._photo;
    }

    get password() {
        return this._password;
    }

    get admin() {
        return this._admin;
    }

    set photo(value){
        this._photo = value;
    }

    loadFromJSON(json){

        for (let name in json){
            
            switch(name){

                case '_register':
                    this[name] = new Date(json[name]);
                break;
                default:
                    if(name.substring(0, 1) === '_') this[name] = json[name];

            }

        }

    }

    static getUsersStorage() {

        let users = [];

        // Se houver dados salvos de usuários no localStorage
        if (localStorage.getItem("users")) {

            // Recupera os dados do localStorage e converte de JSON para objeto
            users = JSON.parse(localStorage.getItem("users"));

        }

        return users;

    }

    getNewID(){

        let usersID = parseInt(localStorage.getItem("usersID"));

        // Se o ID não for válido, inicializa como 0
        if (!usersID > 0) usersID = 0;

        usersID++; // Incrementa o ID

        // Atualiza o localStorage com o novo ID
        localStorage.setItem("usersID", usersID);

        return usersID;

    }

    toJSON () {

        let json = {};

        // Cria um objeto JSON com todas as propriedades do usuário
        Object.keys(this).forEach(key => {

            if (this[key] !== undefined) json[key] = this[key];

        });

        return json;

    }

    save(){

        return new Promise((resolve, reject) => {

            let promise;

            // Se o usuário já tem um ID, atualiza o usuário existente, senão cria um novo
            if (this.id) {

                promise = HttpRequest.put(`/users/${this.id}`, this.toJSON());

            } else {

                promise = HttpRequest.post(`/users`, this.toJSON());

            }

            promise.then(data => {

                // Quando a requisição for bem-sucedida, carrega os dados do usuário atualizado
                this.loadFromJSON(data);

                resolve(this);

            }).catch(e => {

                reject(e);

            });

        });

    }

    remove(){

        let users = User.getUsersStorage();

        // Encontra e remove o usuário pelo ID
        users.forEach((userData, index)=>{

            if (this._id == userData._id) {

                users.splice(index, 1);

            }

        });

        // Atualiza os usuários no localStorage após a remoção
        localStorage.setItem("users", JSON.stringify(users));

    }

}
