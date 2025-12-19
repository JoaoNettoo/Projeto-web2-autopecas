# Autopeças JB 🚗🔧

[![Python](https://img.shields.io/badge/Python-3.x-blue)](https://www.python.org/)  
[![Django](https://img.shields.io/badge/Django-4.x-green)](https://www.djangoproject.com/)  
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)  

---

## Descrição do Projeto
O Autopeças JB é um sistema web para gerenciamento de peças automotivas, desenvolvido com **Django** no backend e **HTML/CSS/JavaScript** no frontend. O sistema permite que usuários façam login, naveguem pelas peças, gerenciem o carrinho de compras e finalizem pedidos via um microsserviço dedicado.

---

## Tecnologias Utilizadas

### Backend
- Python 3.x  
- Django  
- Django REST Framework (DRF)  
- SQLite  

### Frontend
- HTML5, CSS3, JavaScript  
- Módulos ES6 (`auth.js`, `pecas.js`, `carrinho.js`)  

### Microsserviço
- Flask  
- Porta separada (`8001`) para gerenciar pedidos  

### Autenticação e Segurança
- JWT (JSON Web Tokens) com `djangorestframework-simplejwt`  
- Controle de acesso a endpoints da API  

### Cache
- Implementado na listagem de peças usando `@cache_page` do Django  

### Ferramentas
- Postman para testes de API  
- VSCode como IDE  
- Git/GitHub para versionamento  

---

## Funcionalidades

### Usuário
- Criar conta e login/logout  
- Visualizar lista de peças  
- Adicionar/remover/alterar quantidade no carrinho  
- Finalizar pedidos  

### Administrador (superuser)
- CRUD completo de Fornecedores, Peças e Pedidos via Django Admin ou API  

### Microsserviço de Pedidos
- Recebe pedidos do frontend  
- Valida dados e armazena pedidos  

---


