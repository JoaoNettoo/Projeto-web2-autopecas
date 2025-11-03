from rest_framework import viewsets
from .models import Fornecedor, Peca, Pedido
from .serializers import FornecedorSerializer, PecaSerializer, PedidoSerializer
from rest_framework.decorators import action
from rest_framework.response import Response

class FornecedorViewSet(viewsets.ModelViewSet):
    queryset = Fornecedor.objects.all().order_by('-criado_em')
    serializer_class = FornecedorSerializer

class PecaViewSet(viewsets.ModelViewSet):
    queryset = Peca.objects.all().order_by('-criado_em')
    serializer_class = PecaSerializer

    @action(detail=False, methods=['get'])
    def search(self, request):
        q = request.query_params.get('q','')
        qs = Peca.objects.filter(nome__icontains=q)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all().order_by('-criado_em')
    serializer_class = PedidoSerializer
