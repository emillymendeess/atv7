// auth.js - O Controlador de Autenticação

/**
 * Função principal que verifica se o usuário está logado e atualiza a interface.
 * Esta é a única função que manipula a visibilidade das seções principais.
 */
const API_BASE_URL = 'http://localhost:3001'; // <-- ADICIONE ESTA LINHA NO TOPO
function checkAuthState() {
    const token = localStorage.getItem('authToken');
    const authSection = document.getElementById('auth-section');
    const garageSection = document.getElementById('garage-section');

    if (token) {
        // --- CENÁRIO 1: USUÁRIO ESTÁ LOGADO ---
        console.log("Token encontrado. Exibindo a garagem.");
        authSection.style.display = 'none';
        garageSection.classList.remove('hidden'); // Usa a classe do seu HTML
        garageSection.style.display = 'block';

        // Dispara o carregamento dos dados no script.js
        // A função carregarTudoDoUsuarioLogado() deve existir no seu script.js
        if (typeof carregarTudoDoUsuarioLogado === 'function') {
            carregarTudoDoUsuarioLogado();
        }

    } else {
        // --- CENÁRIO 2: USUÁRIO NÃO ESTÁ LOGADO (VISITANTE) ---
        console.log("Nenhum token encontrado. Exibindo tela de login/registro.");
        authSection.style.display = 'block';
        garageSection.classList.add('hidden');
        garageSection.style.display = 'none';

        // Limpa a tela para garantir que dados antigos não apareçam
        if (typeof limparDadosDaGaragem === 'function') {
            limparDadosDaGaragem();
        }
    }
}

/**
 * Função para registrar um novo usuário.
 */
async function handleRegister() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const feedbackEl = document.getElementById('register-feedback');

    if (!email || !password) {
        feedbackEl.textContent = 'Por favor, preencha e-mail e senha.';
        return;
    }

    try {
   const response = await fetch(`${API_BASE_URL}/api/auth/register`,{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (response.ok) {
            feedbackEl.textContent = 'Registro bem-sucedido! Agora você pode fazer o login.';
            feedbackEl.style.color = 'green';
        } else {
            feedbackEl.textContent = data.error || 'Erro ao registrar.';
            feedbackEl.style.color = 'red';
        }
    } catch (error) {
        console.error('Erro no registro:', error);
        feedbackEl.textContent = 'Erro de conexão.';
    }
}

/**
 * Função para logar o usuário.
 */
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const feedbackEl = document.getElementById('login-feedback');

    if (!email || !password) {
        feedbackEl.textContent = 'Por favor, preencha e-mail e senha.';
        return;
    }

    try {
       const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (response.ok) {
            feedbackEl.textContent = 'Login bem-sucedido!';
            feedbackEl.style.color = 'green';
            // SALVA o token e atualiza a interface
            localStorage.setItem('authToken', data.token);
            checkAuthState(); // Transição para a tela da garagem
        } else {
            feedbackEl.textContent = data.error || 'Credenciais inválidas.';
            feedbackEl.style.color = 'red';
        }
    } catch (error) {
        console.error('Erro no login:', error);
        feedbackEl.textContent = 'Erro de conexão.';
    }
}

/**
 * Função para deslogar o usuário.
 */
function handleLogout() {
    localStorage.removeItem('authToken');
    console.log('Usuário deslogado.');
    checkAuthState(); // Volta para a tela de login
}

// Adiciona os eventos quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('registerButton')?.addEventListener('click', handleRegister);
    document.getElementById('loginButton')?.addEventListener('click', handleLogin);
    document.getElementById('logoutButton')?.addEventListener('click', handleLogout);

    // Roda a verificação inicial para saber o que mostrar
    checkAuthState();
});