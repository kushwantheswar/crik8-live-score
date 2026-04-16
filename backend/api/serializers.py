from rest_framework import serializers
from .models import Tournament, Team, Player, Match, ScoreUpdate, TournamentApplication, BattingScore, BowlingScore
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField(required=False, allow_blank=True, default='')

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'is_staff']

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def create(self, validated_data):
        email = validated_data.pop('email', '') or ''
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=email,
        )
        return user




class PlayerSerializer(serializers.ModelSerializer):
    batting_career = serializers.SerializerMethodField()
    bowling_career = serializers.SerializerMethodField()
    batting_form = serializers.SerializerMethodField()
    bowling_form = serializers.SerializerMethodField()
    team_name = serializers.CharField(source='team.name', read_only=True)

    class Meta:
        model = Player
        fields = '__all__'

    def get_batting_career(self, obj):
        stats = {}
        for fmt, label in Tournament.FORMAT_CHOICES:
            scores = BattingScore.objects.filter(player=obj, match__tournament__format_type=fmt)
            if scores.exists():
                total_runs = sum(s.runs for s in scores)
                total_balls = sum(s.balls for s in scores)
                innings = scores.count()
                highest = max(s.runs for s in scores)
                fours = sum(s.fours for s in scores)
                sixes = sum(s.sixes for s in scores)
                not_outs = scores.filter(is_out=False).count()
                avg = total_runs / (innings - not_outs) if (innings - not_outs) > 0 else total_runs
                sr = (total_runs / total_balls * 100) if total_balls > 0 else 0
                
                stats[fmt] = {
                    'matches': innings, # simplified: each score record is a match
                    'innings': innings,
                    'runs': total_runs,
                    'balls': total_balls,
                    'highest': highest,
                    'avg': round(avg, 2),
                    'sr': round(sr, 2),
                    'fours': fours,
                    'sixes': sixes,
                    'not_out': not_outs
                }
        return stats

    def get_bowling_career(self, obj):
        stats = {}
        for fmt, label in Tournament.FORMAT_CHOICES:
            scores = BowlingScore.objects.filter(player=obj, match__tournament__format_type=fmt)
            if scores.exists():
                total_wickets = sum(s.wickets for s in scores)
                total_runs = sum(s.runs_conceded for s in scores)
                total_balls = sum(s.balls_bowled for s in scores)
                matches = scores.count()
                maidens = sum(s.maidens for s in scores)
                
                avg = total_runs / total_wickets if total_wickets > 0 else 0
                eco = (total_runs / (total_balls / 6)) if total_balls > 0 else 0
                sr = total_balls / total_wickets if total_wickets > 0 else 0

                stats[fmt] = {
                    'matches': matches,
                    'wickets': total_wickets,
                    'runs': total_runs,
                    'balls': total_balls,
                    'maidens': maidens,
                    'avg': round(avg, 2),
                    'eco': round(eco, 2),
                    'sr': round(sr, 2)
                }
        return stats

    def get_batting_form(self, obj):
        scores = BattingScore.objects.filter(player=obj).order_by('-match__match_date')[:5]
        return [{
            'score': f"{s.runs}{'*' if not s.is_out else ''}({s.balls})",
            'oppn': s.match.team2.name if s.match.team1.players.filter(id=obj.id).exists() else s.match.team1.name,
            'format': s.match.tournament.format_type,
            'date': s.match.match_date.strftime('%d %b %y')
        } for s in scores]

    def get_bowling_form(self, obj):
        scores = BowlingScore.objects.filter(player=obj).order_by('-match__match_date')[:5]
        return [{
            'wickets': f"{s.wickets}-{s.runs_conceded}",
            'oppn': s.match.team2.name if s.match.team1.players.filter(id=obj.id).exists() else s.match.team1.name,
            'format': s.match.tournament.format_type,
            'date': s.match.match_date.strftime('%d %b %y')
        } for s in scores]

class TeamSerializer(serializers.ModelSerializer):
    players = PlayerSerializer(many=True, read_only=True)
    class Meta:
        model = Team
        fields = '__all__'

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = '__all__'

class ScoreUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScoreUpdate
        fields = '__all__'
        extra_kwargs = {'match': {'read_only': True}}

class BattingScoreSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player.name', read_only=True)
    class Meta:
        model = BattingScore
        fields = '__all__'
        extra_kwargs = {'match': {'read_only': True}}

class BowlingScoreSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player.name', read_only=True)
    class Meta:
        model = BowlingScore
        fields = '__all__'
        extra_kwargs = {'match': {'read_only': True}}

class MatchSerializer(serializers.ModelSerializer):
    team1_name = serializers.CharField(source='team1.name', read_only=True)
    team2_name = serializers.CharField(source='team2.name', read_only=True)
    striker_name = serializers.CharField(source='current_striker.name', read_only=True)
    non_striker_name = serializers.CharField(source='current_non_striker.name', read_only=True)
    bowler_name = serializers.CharField(source='current_bowler.name', read_only=True)
    batting_scores = BattingScoreSerializer(many=True, read_only=True)
    bowling_scores = BowlingScoreSerializer(many=True, read_only=True)
    latest_score = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = '__all__'

    def get_latest_score(self, obj):
        latest = obj.scores.order_by('-updated_at').first()
        return ScoreUpdateSerializer(latest).data if latest else None

class TournamentApplicationSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    tournament_name = serializers.CharField(source='tournament.name', read_only=True)

    class Meta:
        model = TournamentApplication
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}
