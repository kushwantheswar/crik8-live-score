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
        match_obj = self.get_object()
        runs = request.data.get('runs', 0)
        is_wicket = request.data.get('is_wicket', False)
        is_extra = request.data.get('is_extra', False)
        commentary = request.data.get('commentary', '')

        # 1. Create a legacy ScoreUpdate record
        ScoreUpdate.objects.create(
            match=match_obj,
            score_details=request.data.get('score_details', ''),
            commentary=commentary
        )

        # 2. Update Match overall stats (Auto-Scorer Logic)
        if not is_extra or request.data.get('extra_type') in ['Nb', 'Wd']:
            match_obj.total_runs += int(runs)
        
        if is_wicket:
            match_obj.total_wickets += 1

        # Ball tracking (Skip for Wide/No Ball in some rules, but let's assume standard legal ball for now or simple +1)
        if not is_extra:
            match_obj.current_over_balls += 1
            if match_obj.current_over_balls >= 6:
                match_obj.current_over += 1
                match_obj.current_over_balls = 0
                # Over end: swap strikers
                match_obj.current_striker, match_obj.current_non_striker = match_obj.current_non_striker, match_obj.current_striker

        match_obj.save()

        # 3. Update Individual Batting Stats
        if match_obj.current_striker and not is_extra:
            bat_score, _ = BattingScore.objects.get_or_create(match=match_obj, player=match_obj.current_striker)
            bat_score.runs += int(runs)
            bat_score.balls += 1
            if int(runs) == 4: bat_score.fours += 1
            if int(runs) == 6: bat_score.sixes += 1
            if is_wicket: bat_score.is_out = True
            bat_score.save()
        
        # 4. Update Individual Bowling Stats
        if match_obj.current_bowler:
            bowl_score, _ = BowlingScore.objects.get_or_create(match=match_obj, player=match_obj.current_bowler)
            bowl_score.runs_conceded += int(runs)
            if is_wicket: bowl_score.wickets += 1
            if not is_extra:
                bowl_score.balls_bowled += 1
                ov_main = bowl_score.balls_bowled // 6
                ov_balls = bowl_score.balls_bowled % 6
                bowl_score.overs = float(f"{ov_main}.{ov_balls}")
            bowl_score.save()

        return Response(MatchSerializer(match_obj).data)

class ScoreUpdateViewSet(viewsets.ModelViewSet):
    queryset = ScoreUpdate.objects.all()
    serializer_class = ScoreUpdateSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class BattingScoreViewSet(viewsets.ModelViewSet):
    queryset = BattingScore.objects.all()
    serializer_class = BattingScoreSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class BowlingScoreViewSet(viewsets.ModelViewSet):
    queryset = BowlingScore.objects.all()
    serializer_class = BowlingScoreSerializer
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
