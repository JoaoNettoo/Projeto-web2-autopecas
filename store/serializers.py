from rest_framework import serializers
from .models import Fornecedor, Peca, Pedido, ItemPedido

class FornecedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fornecedor
        fields = '__all__'

class PecaSerializer(serializers.ModelSerializer):
    fornecedor = FornecedorSerializer(read_only=True)
    fornecedor_id = serializers.PrimaryKeyRelatedField(
        queryset=Fornecedor.objects.all(), source='fornecedor', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Peca
        fields = ['id', 'nome', 'codigo', 'marca', 'modelo_veiculo', 'categoria', 'preco', 'estoque', 'descricao', 'fornecedor', 'fornecedor_id', 'criado_em']

class ItemPedidoSerializer(serializers.ModelSerializer):
    peca = PecaSerializer(read_only=True)
    peca_id = serializers.PrimaryKeyRelatedField(queryset=Peca.objects.all(), source='peca', write_only=True)

    class Meta:
        model = ItemPedido
        fields = ['id', 'peca', 'peca_id', 'quantidade', 'preco_unitario']

class PedidoSerializer(serializers.ModelSerializer):
    itens = ItemPedidoSerializer(many=True)
    total = serializers.DecimalField(max_digits=50, decimal_places=2, read_only=True)

    class Meta:
        model = Pedido
        fields = ['id', 'cliente_nome', 'cliente_telefone', 'status', 'total', 'itens', 'criado_em']

    def create(self, validated_data):
        itens_data = validated_data.pop('itens')
        pedido = Pedido.objects.create(**validated_data)

        total = 0
        for item in itens_data:
            peca = item['peca']
            quantidade = item['quantidade']
            preco_unitario = item['preco_unitario']

            ItemPedido.objects.create(
                pedido=pedido,
                peca=peca,
                quantidade=quantidade,
                preco_unitario=preco_unitario
            )

            total += preco_unitario * quantidade

            if peca and peca.estoque is not None:
                peca.estoque = max(0, peca.estoque - quantidade)
                peca.save()

        pedido.total = total
        pedido.save()
        return pedido

