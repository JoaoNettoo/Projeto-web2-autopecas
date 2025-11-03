from rest_framework import routers
from .views import FornecedorViewSet, PecaViewSet, PedidoViewSet

router = routers.DefaultRouter()
router.register(r'fornecedores', FornecedorViewSet, basename='fornecedor')
router.register(r'pecas', PecaViewSet, basename='peca')
router.register(r'pedidos', PedidoViewSet, basename='pedido')

urlpatterns = router.urls
