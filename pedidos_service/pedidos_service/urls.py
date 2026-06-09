from rest_framework import routers
from .views import PedidoViewSet

router = routers.DefaultRouter()
router.register(r'pedidos', PedidoViewSet)

urlpatterns = router.urls
