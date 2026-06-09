const apiUrl = 'http://127.0.0.1:8000/api/';
let token = localStorage.getItem('access_token') || null;

// Atualizar UI dos botões
function updateAuthUI() {
    const btnLogin = document.getElementById('btn-login');
    const btnRegister = document.getElementById('btn-register');
    const btnLogout = document.getElementById('btn-logout');

    if(btnLogin && btnRegister && btnLogout){
        if(token){
            btnLogin.style.display = 'none';
            btnRegister.style.display = 'none';
            btnLogout.style.display = 'inline-block';
        } else {
            btnLogin.style.display = 'inline-block';
            btnRegister.style.display = 'inline-block';
            btnLogout.style.display = 'none';
        }
    }
}

// Login
export async function login(username, password) {
    try {
        const res = await fetch(apiUrl+'login/', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({username, password})
        });
        const data = await res.json();
        if(data.access){
            token = data.access;
            localStorage.setItem('access_token', token);
            updateAuthUI();
            return true;
        } else {
            console.log('Erro no login:', data);
            return false;
        }
    } catch(e){
        console.error('Erro ao conectar no login:', e);
        return false;
    }
}

// Criar conta
export async function register(username, password){
    try {
        const res = await fetch(apiUrl+'register/', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({username, password})
        });
        const data = await res.json();
        if(res.status === 201){
            return true;
        } else {
            console.log('Erro ao registrar:', data);
            return false;
        }
    } catch(e){
        console.error('Erro ao conectar no register:', e);
        return false;
    }
}

// Logout
export function logout(){
    token = null;
    localStorage.removeItem('access_token');
    updateAuthUI();
}

// Obter token para usar em outros JS
export function getToken() {
    return token;
}

// Inicializar UI
updateAuthUI();
