# Fundamentação Teórica: Conceitos de XSS, Cenários Reais e Analogias

Este documento serve como apoio acadêmico para explicar detalhadamente os tipos de **Cross-Site Scripting (XSS)** e a infraestrutura de rede apresentados no projeto, conectando os experimentos a ameaças cibernéticas reais.

---

## 🛠️ 1. O Coletor no Computador 2: O que ele representa no mundo real?

No nosso laboratório, o Computador 2 roda o comando `python -m http.server 8001`. 
* **Na Demonstração:** Ele atua como o receptor do token JWT exfiltrado.
* **No Cenário Real:** Esse terminal representa o **Servidor de Comando e Controle (C2 - Command & Control Server)** ou um **Endpoint de Exfiltração** do atacante. 

Em um ataque real, o cibercriminoso não usa a porta 8001 de uma máquina local. Ele hospeda um script coletor em um servidor virtual privado (VPS) na nuvem sob seu controle, ou utiliza serviços legítimos de recebimento de logs (como *Webhook.site*, *requestbin* ou endpoints do *Burp Collaborator*) para ocultar seu tráfego. O navegador da vítima faz um túnel HTTP silencioso enviando a informação sigilosa através da internet diretamente para as mãos do criminoso.

---

## 🔍 2. Reflected XSS (XSS Refletido)

### O que é no Projeto?
O payload inserido na busca do catálogo é ecoado imediatamente na página de resultados usando `innerHTML`, executando código JavaScript dinâmico no navegador da própria vítima.

### 💀 Cenário Real Perigoso: Campanhas de Phishing Direcionado (Spear Phishing)
O XSS Refletido não afeta o banco de dados, então o atacante precisa fazer com que a vítima acesse um link específico.

* **O Ataque Real:** O atacante cria um e-mail de phishing fingindo ser um banco legítimo ou uma plataforma de e-commerce conhecida. O link no e-mail aponta para o site real e confiável da instituição (ex: `https://meubanco.com.br/busca?q=<img src=x onerror="...">`), mas contém o payload de XSS embutido na URL.
* **O Impacto:** Como a URL aponta para o domínio oficial do banco, filtros de e-mail e o próprio usuário confiam no link. Ao clicar, o site oficial do banco carrega normalmente, mas o script malicioso refletido é executado no navegador da vítima, roubando seus dados de sessão ou exibindo uma tela falsa de login (defacement/phishing interno) para roubar sua senha de forma indetectável.

### Analogia com o Mundo Real: "A Carta com Tinta Invisível"
Você envia uma carta a um atendente de banco dizendo: *"Por favor, grite para mim o que está escrito aqui: [Instrução Maliciosa]"*. O funcionário (servidor) simplesmente grita a instrução de volta na hora (reflete o dado). Apenas quem estava ao lado do guichê naquele instante é afetado. O banco não guarda a carta; o dado malicioso apenas passou por ele e voltou.

---

## 🌐 3. DOM-Based XSS (XSS Baseado no DOM)

### O que é no Projeto?
O JavaScript do frontend (`pecas.js`) lê o fragmento da URL após o `#` (`window.location.hash`) e injeta diretamente no HTML do banner de boas-vindas via `innerHTML`, sem que o servidor Django sequer receba ou saiba da existência do payload.

### 💀 Cenário Real Perigoso: Redirecionamento Malicioso e Roubo de Dados de Clientes (Single Page Apps)
Aplicações modernas em React, Angular ou Vue utilizam muito o roteamento do lado do cliente (Client-Side Routing) baseado no hash ou caminhos da URL.

* **O Ataque Real:** Se o roteador da aplicação ler parâmetros da URL de forma insegura, o atacante pode enviar um link malicioso para a vítima. Ao carregar a página, o script altera a estrutura do DOM da página legítima.
* **O Impacto:** O atacante pode modificar o destino do formulário de pagamento da página, fazendo com que os dados inseridos pelo usuário (como números de cartão de crédito) sejam enviados para o servidor do atacante em vez do servidor do site, ou simplesmente redirecionar o usuário para um site clonado idêntico para colher suas credenciais (Redirecionamento Aberto via XSS).

### Analogia com o Mundo Real: "O Painel de Recados do Condomínio"
O zelador (servidor) coloca um painel de avisos em branco com giz pendurado ao lado. Um morador malicioso (atacante) escreve uma ordem falsa na lousa: *"Próximo morador: favor transferir o aluguel para a conta X"*. O zelador não escreveu nem validou aquilo, apenas forneceu a lousa (o código JavaScript vulnerável). A vítima lê e executa a instrução (o DOM foi alterado localmente).

---

## 💾 4. Stored XSS + Roubo de JWT (XSS Armazenado)

### O que é no Projeto?
Uma mensagem de suporte contendo código malicioso é salva no banco de dados SQLite. Quando o administrador visualiza os chamados no painel administrativo, o navegador dele renderiza a mensagem via `innerHTML`, executando o script que lê o token JWT do `localStorage` e o envia pela rede para o Computador 2.

### 💀 Cenário Real Perigoso: Ataques Magecart (Carding) e Worms Auto-Propagáveis
É o tipo de XSS mais devastador devido à sua persistência.

* **O Ataque Real (Magecart/E-commerce):** Hackers encontram um campo vulnerável a XSS Armazenado (como a seção de avaliações de produtos ou o cadastro de endereços) em um grande e-commerce. Eles injetam um script de "skimming" que fica salvo no banco de dados. Sempre que qualquer cliente acessa a página do produto ou vai finalizar a compra, o script invisível é executado no navegador do cliente, intercepta os dados do cartão de crédito digitados e os envia para o atacante.
* **O Ataque Real (Worms de Redes Sociais):** No famoso caso do *Samy Worm* no MySpace (2005), o atacante injetou um script no seu perfil. Quem visualizava o perfil dele executava o script, que automaticamente enviava uma solicitação de amizade para o atacante e copiava o payload malicioso para o perfil da própria vítima. Em menos de 20 horas, o vírus XSS infectou mais de 1 milhão de usuários, derrubando a rede social.

### Analogia com o Mundo Real: "A correspondência com gás do sono"
Um criminoso envia um pacote para a caixa postal de uma empresa (banco de dados). O pacote contém um dispositivo que dispara spray com gás do sono assim que aberto. A caixa postal apenas guarda o pacote de forma inofensiva. Dias depois, a secretária da diretoria (Administrador) abre o pacote para ler a mensagem. Ela dorme imediatamente (sessão sequestrada) e o atacante entra livremente na empresa física com as chaves dela.

---

## 🛡️ 5. Por que o roubo de JWT via LocalStorage é crítico?

Durante a banca, explique que o armazenamento de tokens no `localStorage` deixa a aplicação completamente exposta:
* O JavaScript do navegador no tem **acesso de leitura irrestrito** ao `localStorage`. Se houver uma única falha de XSS (seja DOM, Refletido ou Armazenado) na página, o token é roubado instantaneamente.
* **A Solução Correta:** Os tokens devem ser armazenados em **Cookies com a flag `HttpOnly`**. Essa flag instrui o navegador que o cookie **não pode ser lido via JavaScript** (o comando `document.cookie` ou qualquer outro script de leitura falha). O navegador enviará o cookie automaticamente nas requisições HTTP para a API, mas um script invasor de XSS não conseguirá roubar a sessão.
