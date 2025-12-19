import { getToken } from './auth.js';
const apiUrl = 'http://127.0.0.1:8000/api/';
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// Atualizar tabela do carrinho
export function atualizarTabela() {
    const tbody = document.getElementById('carrinho-tbody');
    if (!tbody) return; 

    tbody.innerHTML = '';
    let total = 0;

    carrinho.forEach((item, index) => {
        const quantidade = item.quantidade || 1;
        total += parseFloat(item.preco) * quantidade;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.nome}</td>
            <td>R$ ${item.preco}</td>
            <td><input type="number" min="1" value="${quantidade}" id="qtd-${index}" style="width:50px;"></td>
            <td><button id="remover-${index}">Remover</button></td>
        `;
        tbody.appendChild(tr);

        // Remover item
        document.getElementById(`remover-${index}`).addEventListener('click', () => {
            carrinho.splice(index,1);
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            atualizarTabela();
        });

        // Alterar quantidade
        document.getElementById(`qtd-${index}`).addEventListener('change', (e) => {
            const qtd = parseInt(e.target.value) || 1;
            carrinho[index].quantidade = qtd;
            localStorage.setItem('carrinho', JSON.stringify(carrinho));

            // Recalcular total
            let novoTotal = 0;
            carrinho.forEach(it => {
                novoTotal += parseFloat(it.preco) * (it.quantidade || 1);
            });
            document.getElementById('total').textContent = `Total: R$ ${novoTotal.toFixed(2)}`;
        });
    });

    const totalDiv = document.getElementById('total');
    if (totalDiv) totalDiv.textContent = `Total: R$ ${total.toFixed(2)}`;
}

// Finalizar compra
export async function finalizarCompra() {
    const token = getToken();
    if(!token){
        alert('Você precisa estar logado para finalizar a compra!');
        return;
    }

    if(carrinho.length === 0){
        alert('Carrinho vazio!');
        return;
    }

    const pedido = {
        itens: carrinho.map(item => ({ peca: item.id, quantidade: item.quantidade || 1 }))
    };

    try {
        const res = await fetch(apiUrl+'pedidos/', {
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization': 'Bearer '+token
            },
            body: JSON.stringify(pedido)
        });

        if(res.ok){
            alert('Pedido finalizado com sucesso!');
            carrinho = [];
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            atualizarTabela();
        } else {
            const err = await res.json();
            alert('Erro ao finalizar pedido');
            console.log(err);
        }
    } catch(e){
        console.error(e);
        alert('Erro ao conectar com o servidor');
    }
}

// Inicialização
atualizarTabela();
