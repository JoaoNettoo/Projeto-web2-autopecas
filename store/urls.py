from rest_framework import routers
from django.urls import path, include
from .views import FornecedorViewSet, PecaViewSet, PedidoViewSet, register, login

# Router das ViewSets
router = routers.DefaultRouter()
router.register(r'fornecedores', FornecedorViewSet, basename='fornecedor')
router.register(r'pecas', PecaViewSet, basename='peca')
router.register(r'pedidos', PedidoViewSet, basename='pedido')

# URLs finais
urlpatterns = [
    path('api/register/', register, name='register'),
    path('api/login/', login, name='login'),
    path('api/', include(router.urls)),
]
