from django.db import models

class Fornecedor(models.Model): 
    nome = models.CharField(max_length=255)
    documento = models.CharField(max_length=50, blank=True, null=True)
    telefone = models.CharField(max_length=30, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    endereco = models.TextField(blank=True, null=True)
    criado_em = models.DateTimeField(auto_now_add=True) 

    def __str__(self):
        return self.nome


class Peca(models.Model):
    nome = models.CharField(max_length=255)
    codigo_sku = models.CharField(max_length=100, unique=True)
    marca = models.CharField(max_length=100, blank=True, null=True)
    modelo_veiculo = models.CharField(max_length=100, blank=True, null=True)
    categoria = models.CharField(max_length=100, blank=True, null=True)
    preco = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    estoque = models.IntegerField(default=0)
    descricao = models.TextField(blank=True, null=True)
    fornecedor = models.ForeignKey('Fornecedor', on_delete=models.SET_NULL, null=True, blank=True, related_name='pecas')
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nome} ({self.codigo})"

class Pedido(models.Model): 
    STATUS_CHOICES = [
        ('PENDENTE','PENDENTE'),
        ('PROCESSANDO','PROCESSANDO'),
        ('ENVIADO','ENVIADO'),
        ('CANCELADO','CANCELADO'),
    ]
    cliente_nome = models.CharField(max_length=255)
    cliente_telefone = models.CharField(max_length=50, blank=True, null=True)
    total = models.DecimalField(max_digits=50, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDENTE')
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pedido {self.id} - {self.cliente_nome}"

class ItemPedido(models.Model):  
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='itens')
    peca = models.ForeignKey(Peca, on_delete=models.SET_NULL, null=True)
    quantidade = models.IntegerField()
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantidade} x {self.peca}"
