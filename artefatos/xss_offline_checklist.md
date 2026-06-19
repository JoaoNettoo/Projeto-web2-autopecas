# Roteiro de Testes e Configuração Offline: XSS em Rede Local

Este guia detalha os procedimentos para configurar o ambiente de demonstração acadêmica do projeto **Autopeças JB** em uma rede local física totalmente isolada (sem acesso à Internet ou Wi-Fi), utilizando um **cabo de rede Ethernet direto** entre dois computadores.

---

## 📋 Checklist de Pré-Voo (Antes de Iniciar)

Realize estes passos no **Computador 1 (Servidor)** antes de ir para a apresentação:

1. **Criar Usuário Administrador (Django)**:
   Abra o terminal do Computador 1 na pasta do projeto e crie uma conta administrativa caso ainda não o tenha feito:
   ```powershell
   venv\Scripts\python.exe manage.py createsuperuser
   ```
   *Defina o nome de usuário (ex: `admin`), e-mail e uma senha forte. Essa conta será usada para demonstrar o roubo de sessão.*

2. **Validar Dependências Locais**:
   Certifique-se de que os pacotes do `requirements.txt` estão instalados no ambiente virtual do Computador 1.

3. **Verificar Portas de Comunicação**:
   Certifique-se de que as portas **5500** (Servidor Frontend), **8000** (Django API) e **8001** (Flask) estão livres e não sendo utilizadas por outros softwares locais.

4. **Configuração do Firewall do Windows**:
   **Por que isso é necessário?** Por padrão, o Windows bloqueia dispositivos externos de acessarem portas não convencionais no seu computador (como a 5500, 8000 e 8001) para evitar ataques. Como a nossa arquitetura exige que o Computador 2 "enxergue" os servidores rodando no Computador 1, precisamos permitir esse tráfego. Caso contrário, o Computador 2 receberá apenas uma tela de "Tempo de resposta esgotado" (Site Inatingível).

   Escolha uma das formas abaixo (faça isso no **Computador 1**):

   * **Opção 1 (Segura - Criar Exceção)**: Abra o PowerShell como **Administrador** e libere as portas específicas:
     ```powershell
     New-NetFirewallRule -DisplayName "XSS Demo Ports" -Direction Inbound -LocalPort 5500,8000,8001 -Protocol TCP -Action Allow
     ```
   
   * **Opção 2 (Prática - Desativar Temporariamente)**: Desative o firewall por completo apenas durante a apresentação:
     ```powershell
     Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
     ```
     *(Importante: Lembre-se de religá-lo após a apresentação alterando `False` para `True`)*.

---

## 🔌 Opções de Conectividade de Rede Local

Você pode estabelecer a rede local entre os dois computadores utilizando o Hotspot Wi-Fi do Computador 1, um Cabo de Rede Ethernet (Contingência) ou o Roteador Wi-Fi do seu Celular (Recomendado caso o Windows bloqueie o Hotspot sem internet).

---

### Opção A: Rede Wi-Fi via Hotspot no Computador 1 (Recomendado)

Esta é a opção mais limpa e prática, pois o Computador 1 gerencia tanto o sinal sem fio quanto a distribuição automática de IPs, sem depender de internet ou roteador.

#### 1. Configurando o Computador 1 (Servidor):
1. No Windows, acesse **Configurações > Rede e Internet > Hotspot Móvel**.
2. Ative o interruptor do **Hotspot Móvel**.
3. Clique em **Editar** para definir o nome da rede (SSID) e a senha (ex: `AutodefensoresXSS` / `12345678`).
4. *Nota*: O Windows atribuirá automaticamente o IP fixo **`192.168.137.1`** à interface virtual de rede do Computador 1.
5. Inicie o navegador e abra a aplicação no endereço: `http://192.168.137.1:5500/`.

#### 2. Configurando o Computador 2 (Vítima):
1. Habilite o Wi-Fi no Computador 2.
2. Procure a rede Wi-Fi criada pelo Computador 1, insira a senha e conecte-se.
3. O computador receberá automaticamente um IP configurado via DHCP (ex: `192.168.137.X`).
4. Abra o Prompt de Comando (cmd) no Computador 2 e valide a conectividade:
   ```cmd
   ping 192.168.137.1
   ```
5. Acesse a aplicação no navegador em: `http://192.168.137.1:5500/`.

---

### Opção B: Rede via Hotspot do Celular (A Solução Mais Prática)

Como você bem notou, o Windows 11 muitas vezes **bloqueia a criação do Hotspot Móvel** se não detectar uma conexão prévia com a internet. Usar o seu celular como roteador contorna isso perfeitamente e entrega os **mesmos resultados técnicos**.

Neste cenário, o celular atua apenas como um "switch sem fio" local, distribuindo IPs para as máquinas.

#### 1. Configurando a Rede:
1. No seu celular, ative o **Roteador Wi-Fi (Ponto de Acesso Móvel)**. *(Atenção: Os computadores não vão consumir seus dados móveis para acessar o Django, pois o tráfego será todo local, mas você pode até desligar os dados móveis do celular depois que a rede for criada se quiser garantir isolamento).*
2. Conecte o **Computador 1** e o **Computador 2** na rede Wi-Fi do seu celular.

#### 2. Configurando o Computador 1 (Servidor):
1. Abra o Prompt de Comando (`cmd`) ou PowerShell no Computador 1 e digite:
   ```cmd
   ipconfig
   ```
2. Procure pela sua conexão Wi-Fi e anote o **Endereço IPv4** (ex: `192.168.43.50`).
3. Inicie os servidores na sua máquina e teste localmente abrindo `http://192.168.43.50:5500/`.

#### 3. Configurando o Computador 2 (Vítima):
1. No navegador do Computador 2, simplesmente acesse o endereço IP que você anotou no passo anterior: `http://[IP_DO_COMPUTADOR_1]:5500/`.
2. A aplicação funcionará de forma idêntica à Opção A.

---

### Opção B: Rede Física via Cabo Ethernet Direto (Contingência)

Se o Wi-Fi de ambos os computadores estiver desabilitado ou se houver interferência na sala da apresentação, utilize a conexão via cabo RJ-45 direto:

#### 1. Conexão Física:
* Conecte um cabo Ethernet comum entre a porta LAN do **Computador 1** e a porta LAN do **Computador 2**.

#### 2. Configurando IPs Estáticos no Windows:

##### No Computador 1 (Servidor):
1. Pressione `Win + R`, digite `ncpa.cpl` e aperte Enter (Conexões de Rede).
2. Clique com o botão direito no adaptador **Ethernet** e selecione **Propriedades**.
3. Dê duplo clique em **Protocolo IP Versão 4 (TCP/IPv4)**.
4. Escolha **"Usar o seguinte endereço IP"** e defina:
   * **Endereço IP**: `192.168.1.1`
   * **Máscara de Sub-rede**: `255.255.255.0`
5. Salve clicando em **OK**.

##### No Computador 2 (Vítima):
1. Abra Conexões de Rede (`ncpa.cpl`) no Computador 2.
2. Vá nas propriedades de **Ethernet > TCP/IPv4**.
3. Escolha **"Usar o seguinte endereço IP"** e defina:
   * **Endereço IP**: `192.168.1.2`
   * **Máscara de Sub-rede**: `255.255.255.0`
4. Salve clicando em **OK**.

#### 3. Validação do Link de Rede:
No Computador 2, execute o comando no Prompt:
```cmd
ping 192.168.1.1
```
* **Se houver resposta no Ping, mas a aplicação não abrir (Tempo de Resposta Esgotado)**: 
  O ping usa o protocolo ICMP, que passa facilmente. O carregamento do site usa TCP nas portas 5500/8000/8001, que são bloqueadas por padrão.
  1. No **Computador 1 (Servidor)**: Certifique-se de que desabilitou o Firewall do Windows Defender (ou criou a regra de exceção das portas) conforme o **Passo 4** do Checklist de Pré-Voo.
  2. No **Computador 2 (Vítima - Laptop Corporativo)**: Laptops corporativos geralmente possuem agentes de segurança ativos (Crowdstrike, McAfee, Zscaler, Firewalls corporativos) que bloqueiam conexões de saída em portas não padrão (como 5500, 8000, 8001) mesmo em redes locais. 
     * **Solução A:** Desative temporariamente o firewall do Windows Defender no Computador 2 também (via painel de controle ou executando o comando `Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False` no PowerShell como administrador, se tiver privilégios).
     * **Solução B (Inverter Papéis):** Use o Computador do Trabalho como o *Computador 1 (Servidor)* e o Computador Pessoal como o *Computador 2 (Vítima/Atacante)*. Geralmente, as políticas de segurança corporativa são menos restritivas para conexões de entrada locais que você mesmo iniciou do que para acessar portas estranhas externamente.
     * **Solução C (Mudar para portas padrão):** Mude a porta do Frontend para a porta **80** (HTTP Padrão) e a da API para a porta **8080** (comumente liberada). Veja a seção de Resolução de Problemas Corporativos no fim deste arquivo.

---

## 🚀 Inicialização dos Serviços (Computador 1)

Execute cada comando em uma aba ou terminal separado no **Computador 1**:

1. **Iniciar API Django**:
   ```powershell
   venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
   ```
2. **Iniciar Coletor Flask**:
   ```powershell
   venv\Scripts\python.exe pedidos_service/app.py
   ```
3. **Iniciar Servidor Web do Frontend**:
   * *Atenção:* O servidor de arquivos estáticos deve servir a pasta `frontend`. Caso contrário, exibirá a listagem de arquivos da raiz do projeto ("Directory listing for /").
   * Execute o comando com o parâmetro `--directory frontend` para definir a pasta correta:
     ```powershell
     venv\Scripts\python.exe -m http.server 5500 --directory frontend
     ```

---

## 💻 Execução das Demonstrações (No Computador 2)

No navegador do **Computador 2**, acesse a aplicação pelo IP do Computador 1:
```
http://192.168.1.1:5500/
```

### Exploração 1: DOM-Based XSS (Mensagem via Hash da URL)
1. Coloque a barra de segurança da aplicação no **Modo Vulnerável**.
2. Altere a URL do navegador no Computador 2 adicionando o hash de mensagem simulado:
   `http://192.168.1.1:5500/#mensagem=[Script_Simulado]`
3. Pressione Enter.
4. **Comportamento**: O JavaScript decodifica a URL e insere a carga útil no banner de boas-vindas usando `.innerHTML`. O script do atacante é interpretado localmente pelo navegador da vítima.
5. Mude a aplicação para o **Modo Seguro** e repita. O banner exibirá o conteúdo como texto bruto (`textContent`), neutralizando o ataque.

### Exploração 2: Reflected XSS (Mecanismo de Busca)
1. Certifique-se de que a aplicação está no **Modo Vulnerável**.
2. Digite um termo contendo código simulado na caixa de pesquisa do catálogo ou acesse diretamente a URL:
   `http://192.168.1.1:5500/index.html?q=[Script_Simulado]`
3. **Comportamento**: A consulta de busca é capturada pela URL e ecoada dinamicamente na página usando `innerHTML`, resultando na ativação imediata do script injetado.

### Exploração 3: Stored XSS com Exfiltração de JWT (O Clímax da Apresentação)
1. **No Computador 1 (Administrador)**:
   * Faça login na aplicação utilizando a conta criada no início deste guia (isso salvará o token `access_token` no `localStorage` do Computador 1).
   * Navegue até o painel administrativo: `http://localhost:5500/admin_dashboard.html`.
   * Deixe o Painel de Segurança no **Modo Vulnerável**.

2. **No Computador 2 (Atacante / Cliente)**:
   * Acesse a página pública de suporte: `http://192.168.1.1:5500/suporte.html`.
   * Preencha o formulário e, no campo de **Mensagem**, insira um script malicioso conceitual que lê `localStorage.getItem('access_token')` e dispara uma chamada `fetch` contendo o token para a porta `8001` (Flask) do Computador 1.
   * Envie o formulário.

3. **No Computador 1 (Administrador)**:
   * Clique em **Atualizar Chamados**.
   * Ao carregar a mensagem na tela através da propriedade `innerHTML` insegura, o navegador do administrador executa o script injetado de forma oculta.

4. **O Resultado Visual (Console do Flask)**:
   A janela do terminal onde o microsserviço Flask está rodando no Computador 1 imprimirá instantaneamente o alerta com o token interceptado:
   ```text
   ==================================================
    [!] CRÍTICO: CREDENCIAIS INTERCEPTADAS VIA XSS
    [*] Usuário Vítima: Administrador
    [*] Token JWT Capturado: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ==================================================
   ```
   Isso prova para a banca acadêmica que a sessão do administrador foi comprometida e as credenciais foram roubadas fisicamente através da rede local.
