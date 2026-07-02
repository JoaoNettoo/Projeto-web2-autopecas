import { getToken } from './auth.js';

let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
const apiHost = window.location.hostname;
const apiUrl = `http://${apiHost}:8000/api/`;

// Utilitários de Modo de Segurança
export function isSafeMode() {
    return localStorage.getItem('xss_safe_mode') !== 'vulnerable';
}

// Atualiza contador no topo
export function updateCarrinhoCount() {
    const countSpan = document.getElementById('carrinho-count');
    if(countSpan) countSpan.textContent = carrinho.length;
}

// Renderizar peças respeitando o modo de segurança
function renderizarPecas(pecas) {
    const container = document.getElementById('pecas-container');
    if(!container) return;

    container.innerHTML = '';

    pecas.forEach(p => {
        const card = document.createElement('div');
        card.className = 'peca-card';

        if (isSafeMode()) {
            // Modo Seguro: Criar elementos DOM estruturados e preencher via textContent
            card.innerHTML = `
                <h3 class="peca-title"></h3>
                <p>Preço: R$ <span class="peca-price"></span></p>
                <p>Estoque: <span class="peca-stock"></span></p>
                <button>Adicionar ao carrinho</button>
            `;
            card.querySelector('.peca-title').textContent = p.nome;
            card.querySelector('.peca-price').textContent = p.preco;
            card.querySelector('.peca-stock').textContent = p.estoque;
        } else {
            // Modo Vulnerável: Injetar diretamente via template literal (XSS Armazenado)
            card.innerHTML = `
                <h3>${p.nome}</h3>
                <p>Preço: R$ ${p.preco}</p>
                <p>Estoque: ${p.estoque}</p>
                <button>Adicionar ao carrinho</button>
            `;
        }

        card.querySelector('button').addEventListener('click', () => {
            const token = getToken();
            if(!token){
                alert('Você precisa estar logado para adicionar itens ao carrinho!');
                return;
            }

            // Adiciona quantidade inicial 1
            const itemNoCarrinho = {...p, quantidade: 1};
            carrinho.push(itemNoCarrinho);
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            updateCarrinhoCount();
            alert('Peça adicionada ao carrinho!');
        });

        container.appendChild(card);
    });
}

// Carregar peças da API
export async function carregarPecas(){
    const token = getToken();
    try {
        const res = await fetch(apiUrl+'pecas/', {
            headers: token ? {Authorization: 'Bearer '+token} : {}
        });

        if(!res.ok){
            console.error('Erro ao carregar peças', await res.text());
            return;
        }

        const pecas = await res.json();
        renderizarPecas(pecas);
    } catch(e) {
        console.error('Erro ao buscar peças:', e);
    }
}

// Executar busca de peças e exibir termo buscado (Reflected XSS)
export async function executarBusca(query) {
    const resultsArea = document.getElementById('search-results-area');
    if (!resultsArea) return;

    if (!query) {
        resultsArea.style.display = 'none';
        carregarPecas();
        return;
    }

    resultsArea.style.display = 'block';

    if (isSafeMode()) {
        // Modo Seguro: exibe o texto de busca de forma limpa usando textContent
        resultsArea.textContent = `Resultados para: "${query}"`;
    } else {
        // Modo Vulnerável: concatenação direta em innerHTML (XSS Refletido)
        resultsArea.innerHTML = `Resultados para: "<strong>${query}</strong>"`;
    }

    // Efetuar busca no backend
    const token = getToken();
    try {
        const res = await fetch(`${apiUrl}pecas/search/?q=${encodeURIComponent(query)}`, {
            headers: token ? {Authorization: 'Bearer '+token} : {}
        });

        if(!res.ok){
            console.error('Erro ao buscar peças', await res.text());
            return;
        }

        const pecas = await res.json();
        renderizarPecas(pecas);
    } catch(e) {
        console.error('Erro ao realizar busca de peças:', e);
    }
}

// Inicializar o banner dinâmico via URL Hash (DOM XSS)
export function initDomXss() {
    const banner = document.getElementById('welcome-banner');
    if (!banner) return;

    const hash = window.location.hash;
    if (hash && hash.startsWith('#mensagem=')) {
        const rawParam = hash.substring('#mensagem='.length);
        const text = decodeURIComponent(rawParam);
        
        if (isSafeMode()) {
            banner.textContent = text;
        } else {
            banner.innerHTML = text;
        }
        banner.style.display = 'block';
    } else {
        banner.style.display = 'none';
    }
}
window.initDomXss = initDomXss;
window.addEventListener('hashchange', initDomXss);

// Inicializar a busca por input e query params
function initBusca() {
    const searchInput = document.getElementById('search');
    if (!searchInput) return;

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            executarBusca(query);
        }
    });

    // Verificar se há parâmetro 'q' na URL para XSS Refletido imediato
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
        searchInput.value = query;
        executarBusca(query);
    }
}

// Inicializar o seletor do Painel de Segurança
function initSecurityToggle() {
    const select = document.getElementById('xss-mode-select');
    if (!select) return;

    // Sincronizar com localStorage
    const savedMode = localStorage.getItem('xss_safe_mode') || 'secure';
    select.value = savedMode;
    updateSecurityUI(savedMode);

    select.addEventListener('change', (e) => {
        const newMode = e.target.value;
        localStorage.setItem('xss_safe_mode', newMode);
        updateSecurityUI(newMode);

        // Recarregar os elementos para refletir a nova configuração
        carregarPecas();
        initDomXss();
        
        const searchInput = document.getElementById('search');
        if (searchInput && searchInput.value) {
            executarBusca(searchInput.value);
        }
    });
}

function updateSecurityUI(mode) {
    const badge = document.getElementById('xss-status-badge');
    const panel = document.getElementById('xss-security-panel');
    if (!badge || !panel) return;

    if (mode === 'secure') {
        badge.textContent = 'Seguro';
        badge.className = 'security-badge secure';
        panel.classList.add('safe-mode');
    } else {
        badge.textContent = 'Vulnerável';
        badge.className = 'security-badge vulnerable';
        panel.classList.remove('safe-mode');
    }
}

// Inicializar tudo ao carregar
document.addEventListener('DOMContentLoaded', () => {
    updateCarrinhoCount();
    initSecurityToggle();
    initBusca();
    initDomXss();
});