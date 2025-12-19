from flask import Flask, request, jsonify

app = Flask(__name__)

pedidos = []  # lista temporária para armazenar pedidos

@app.route('/pedidos/', methods=['POST'])
def criar_pedido():
    data = request.get_json()
    if not data or 'itens' not in data:
        return jsonify({'error': 'Formato de pedido inválido'}), 400
    
    pedidos.append(data)
    print("Pedido recebido:", data)  # loga no console
    return jsonify({'message': 'Pedido registrado com sucesso!'}), 201

if __name__ == '__main__':
    app.run(port=8001)
