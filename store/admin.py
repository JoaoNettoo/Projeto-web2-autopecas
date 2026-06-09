from django.contrib import admin
from .models import Fornecedor, Peca, Pedido, ItemPedido

class ItemPedidoInline(admin.TabularInline):
    model = ItemPedido
    extra = 0

@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'cliente_nome', 'status', 'total', 'criado_em')  
    inlines = [ItemPedidoInline]

admin.site.register(Fornecedor)
admin.site.register(Peca)
