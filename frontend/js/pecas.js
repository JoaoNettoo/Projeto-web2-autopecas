import { getToken } from './auth.js';

let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
const apiUrl = 'http://127.0.0.1:8000/api/';

// Atualiza contador no topo
export function updateCarrinhoCount() {
    const countSpan = document.getElementById('carrinho-count');
    if(countSpan) countSpan.textContent = carrinho.length;
}

// Carregar peças
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
        const container = document.getElementById('pecas-container');
        if(!container) return; // evita erro se container não existir

        container.innerHTML = '';

        pecas.forEach(p => {
            const card = document.createElement('div');
            card.className = 'peca-card';
            card.innerHTML = `
                <h3>${p.nome}</h3>
                <p>Preço: R$ ${p.preco}</p>
                <p>Estoque: ${p.estoque}</p>
                <button>Adicionar ao carrinho</button>
            `;

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

    } catch(e) {
        console.error('Erro ao buscar peças:', e);
    }
}

// Inicializar contador
updateCarrinhoCount();

function initComentarios() {
    const input = document.getElementById('comentario-input');
    const btn = document.getElementById('btn-comentar');
    const lista = document.getElementById('comentarios-lista');

    if (!input || !btn || !lista) return;

    btn.addEventListener('click', () => {
        const texto = input.value.trim();

        if (!texto) return;

        const div = document.createElement('div');
        div.classList.add('comentario');

        // ⚠️ intencionalmente vulnerável (XSS demo)
        div.innerHTML = texto;

        // aparece imediatamente na tela
        lista.prepend(div);

        input.value = '';
    });
}

initComentarios();