const socket = io();
let username = '';
let userList = [];

let loginPage = document.querySelector('#loginPage');
let chatPage = document.querySelector('#chatPage');

let loginInput = document.querySelector('#loginNameInput');
let textInput = document.querySelector('#chatTextInput');

loginPage.style.display = 'flex';
chatPage.style.display = 'none';

function renderUserList(){
    let ul = document.querySelector('.userList');
    ul.innerHTML = '';
    userList.forEach(i => {
        let li = document.createElement('li');
        li.textContent = i;
        ul.appendChild(li);
    });
}

function addMessage(type, user, message){
    let ul = document.querySelector('.chatList');
    switch(type){
        case 'status':
            ul.innerHTML += '<li class="m-status">'+message+'</li>';
            break;
        case 'message':
            if(username === user){
                ul.innerHTML += `<li class="m-txt"><span class="me">${user}</span>: ${message}</li>`;
            } else {
                ul.innerHTML += `<li class="m-txt"><span>${user}</span>: ${message}</li>`;
            }
            break;
        default:
            console.error('Tipo de mensagem desconhecido:', type);
            return;
    }
    ul.scrollTop = ul.scrollHeight;
}

loginInput.addEventListener('keyup', (e) => {
    if(e.keyCode === 13){
        let name = loginInput.value.trim();
        if(!name) {
            alert('Insira um nome válido por favor');
            return;
        }
        username = name;
        document.title = `Chat - ${username}`;
        socket.emit('join-request', username);
    }
})

textInput.addEventListener('keyup', (e) => {
    if(e.keyCode === 13){
        let message = textInput.value.trim();
        textInput.value = '';
        if(!message) {
            alert('Insira uma mensagem válida por favor');
            return;
        }
        addMessage('message', username, message);
        socket.emit('send-msg', message);
    }
})

socket.on('user-ok', (list) => {
    loginPage.style.display = 'none';
    chatPage.style.display = 'flex';
    textInput.focus();
    addMessage('status', null, 'conectado!')
    userList = list;
    renderUserList();
})

socket.on('list-update', (data) => {
    if(data.joined) {
        addMessage('status', null, data.joined+' entrou no chat');
    }
    if(data.left) {
        addMessage('status', null, data.left+' saiu no chat');
    }
    userList = data.list;
    renderUserList();
});

socket.on('show-msg', (data) => {
    addMessage('message', data.username, data.message);
})
socket.on('disconnect', () => {
    addMessage('status', null, 'você foi desconectado!');
    userList = [];
    renderUserList();
});

socket.on('reconnect_error', (err) => {
    addMessage('status', null, 'Tentando reconectar...');
})

socket.on('reconnect', () => {
    addMessage('status', null, 'Reconectado com sucesso!');
    socket.emit('join-request', username);
});