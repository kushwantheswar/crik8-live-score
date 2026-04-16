from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .models import Tournament, Team, Player, Match, ScoreUpdate, TournamentApplication
from .serializers import (
    UserSerializer, TournamentSerializer, TeamSerializer, 
    PlayerSerializer, MatchSerializer, ScoreUpdateSerializer, 
    TournamentApplicationSerializer
)

# Public registration endpoint
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


# Get current authenticated user's profile
class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def me(self, request):
        if request.user.is_authenticated:
            try:
                player = Player.objects.get(user=request.user)
                serializer = self.get_serializer(player)
                return Response(serializer.data)
            except Player.DoesNotExist:
                return Response({'detail': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'detail': 'Not authenticated.'}, status=status.HTTP_401_UNAUTHORIZED)


class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def update_score(self, request, pk=None):
        match = self.get_object()
        serializer = ScoreUpdateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(match=match)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ScoreUpdateViewSet(viewsets.ModelViewSet):
    queryset = ScoreUpdate.objects.all()
    serializer_class = ScoreUpdateSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class TournamentApplicationViewSet(viewsets.ModelViewSet):
    queryset = TournamentApplication.objects.all()
    serializer_class = TournamentApplicationSerializer

    def get_permissions(self):
        if self.action in ['create', 'list']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        if self.request.user.is_staff:
            return TournamentApplication.objects.all()
        return TournamentApplication.objects.filter(user=self.request.user)
