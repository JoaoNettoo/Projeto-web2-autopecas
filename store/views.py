from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Fornecedor, Peca, Pedido
from .serializers import FornecedorSerializer, PecaSerializer, PedidoSerializer

# ----- ViewSets existentes -----

class FornecedorViewSet(viewsets.ModelViewSet):
    queryset = Fornecedor.objects.all().order_by('-criado_em')
    serializer_class = FornecedorSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class PecaViewSet(viewsets.ModelViewSet):
    queryset = Peca.objects.all().order_by('-criado_em')
    serializer_class = PecaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    # Cache na listagem de peças (5 minutos)
    @method_decorator(cache_page(60 * 5))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    # Busca NÃO entra no cache
    @action(detail=False, methods=['get'])
    def search(self, request):
        q = request.query_params.get('q', '')
        qs = Peca.objects.filter(nome__icontains=q)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all().order_by('-criado_em')
    serializer_class = PedidoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


# ----- NOVAS views para registro e login -----

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'username e password são obrigatórios'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Usuário já existe'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password)
    return Response({'message': 'Usuário criado com sucesso'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'username e password são obrigatórios'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'error': 'Usuário não encontrado'}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.check_password(password):
        return Response({'error': 'Senha incorreta'}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token)
    })
