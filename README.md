# 🔒 Sistema Web para Demonstração de Vulnerabilidades XSS

![Python](https://img.shields.io/badge/Python-3.x-blue)
![Django](https://img.shields.io/badge/Django-4.x-green)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

## 📖 Descrição

Este projeto foi desenvolvido com fins **educacionais** para demonstrar, em um ambiente controlado, como funcionam ataques do tipo **Cross-Site Scripting (XSS)** e suas respectivas formas de mitigação.

A aplicação possui um **Modo Vulnerável** e um **Modo Seguro**, permitindo comparar o comportamento da aplicação antes e depois da aplicação das boas práticas de desenvolvimento seguro.

> **Aviso:** Este projeto destina-se exclusivamente para estudos, pesquisas e demonstrações acadêmicas em Segurança da Informação.

---

## 🎯 Objetivos

- Demonstrar diferentes tipos de ataques XSS.
- Comparar implementações vulneráveis e seguras.
- Mostrar técnicas de mitigação.
- Simular um cenário real de exploração em aplicações web.
- Auxiliar estudantes no aprendizado de Segurança da Informação.

---

## 🛠️ Tecnologias Utilizadas

### Backend

- Python
- Django
- Django REST Framework
- SQLite

### Frontend

- HTML5
- CSS3
- JavaScript (ES6)

### Ferramentas

- Visual Studio Code
- Git
- GitHub
- Postman

---

## 🚀 Funcionalidades

O projeto permite reproduzir diferentes cenários envolvendo vulnerabilidades XSS.

### ✔ DOM-Based XSS

Demonstra como dados provenientes da URL podem ser inseridos diretamente no DOM utilizando métodos inseguros como `innerHTML`.

Também apresenta a mitigação utilizando `textContent`.

---

### ✔ Reflected XSS

Simula ataques onde parâmetros enviados na URL são refletidos na página sem sanitização.

Permite observar:

- execução do payload;
- comportamento vulnerável;
- comportamento após a correção.

---

### ✔ Stored XSS

Demonstra o armazenamento de conteúdo malicioso no banco de dados e sua execução quando acessado por outro usuário.

Durante a demonstração também é possível observar:

- persistência do payload;
- execução automática;
- captura de token JWT;
- simulação de Session Hijacking.

---

## 📂 Estrutura do Projeto

```text
Projeto/
│
├── artefatos/ 
├── autopecas/
├── frontend/
├── pedidos_service/
├── store/
└── README.md
```

---

## ▶ Como executar

### 1. Clonar o repositório

```bash
git clone URL_DO_REPOSITORIO
```

### 2. Instalar as dependências

```bash
pip install -r requirements.txt
```

### 3. Executar o Backend

```bash
python manage.py runserver
```

### 4. Executar o Frontend

```bash
python -m http.server 5500 --directory frontend
```

A aplicação estará disponível em:

```text
http://localhost:5500
```

---

## 🧪 Experimentos Disponíveis

O projeto possui três demonstrações principais:

- DOM-Based XSS
- Reflected XSS
- Stored XSS
- Session Hijacking utilizando JWT

O roteiro completo da demonstração encontra-se na pasta **artefatos**.

---

## 🔐 Mitigações Demonstradas

Durante os experimentos são apresentadas boas práticas para prevenção de vulnerabilidades, como:

- utilização de `textContent` em vez de `innerHTML`;
- validação de entradas;
- sanitização de dados;
- renderização segura de conteúdo HTML;
- tratamento adequado das informações exibidas ao usuário.

---

## 📚 Conceitos Abordados

- Cross-Site Scripting (XSS)
- DOM Manipulation
- Stored XSS
- Reflected XSS
- DOM-Based XSS
- Session Hijacking
- JWT
- Segurança em Aplicações Web

---

## 🎓 Objetivo Acadêmico

Este projeto foi desenvolvido para apoiar a disciplina de Segurança da Informação, permitindo que estudantes compreendam, de forma prática, como vulnerabilidades XSS podem ser exploradas e como podem ser mitigadas utilizando técnicas de desenvolvimento seguro.

---

## ⚠ Aviso

Este projeto possui finalidade exclusivamente educacional.

Os experimentos devem ser executados apenas em ambientes controlados e autorizados. Os autores não incentivam ou autorizam a utilização das técnicas apresentadas em sistemas de terceiros sem permissão.

---

## 👨‍💻 Autores

João Barbosa & André Luiz.

Projeto desenvolvido para fins acadêmicos na disciplina de Segurança da Informação IFPE.
=======