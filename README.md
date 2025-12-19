Autopeças JB
Descrição do Projeto

O Autopeças JB é um sistema web desenvolvido utilizando Django (backend) e HTML/CSS/JavaScript (frontend), permitindo aos usuários:

Criar conta, fazer login e logout.

Navegar pela lista de peças automotivas disponíveis.

Adicionar, remover e alterar quantidade de itens no carrinho.

Finalizar pedidos, integrando com um microsserviço específico para pedidos.

O projeto segue a arquitetura MVC e inclui autenticação, cache, e uma implementação de microsserviço para gerenciar pedidos.

Tecnologias Utilizadas
Backend

Python 3.x

Django

Django REST Framework (DRF)

Sqlite

Frontend

HTML5, CSS3 e JavaScript

Módulos ES6 para organização do código JS (auth.js, pecas.js, carrinho.js)

Microsserviço

Flask

Roda em porta separada (8001) e gerencia a criação de pedidos

Autenticação e Segurança

JWT (JSON Web Tokens) usando djangorestframework-simplejwt

Controle de acesso a endpoints da API

Cache

Implementado na listagem de peças usando @cache_page do Django

Ferramentas

Postman para testes de API

VSCode como IDE

Git/GitHub para versionamento e histórico de commits

Funcionalidades
Usuário

Criar conta e login/logout

Visualizar lista de peças

Adicionar/remover/alterar quantidade no carrinho

Finalizar pedidos

Administrador (superuser)

CRUD completo de Fornecedores, Peças e Pedidos via Django Admin ou API

Microsserviço de Pedidos

Recebe pedidos do frontend

Valida dados e armazena pedidos