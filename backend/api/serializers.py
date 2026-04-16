from rest_framework import serializers
from .models import Tournament, Team, Player, Match, ScoreUpdate, TournamentApplication
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(required=False, allow_blank=True, default='')

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'is_staff']

    def validate_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError as DjangoValidationError
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
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
    class Meta:
        model = Player
        fields = '__all__'

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

class MatchSerializer(serializers.ModelSerializer):
    team1_name = serializers.CharField(source='team1.name', read_only=True)
    team2_name = serializers.CharField(source='team2.name', read_only=True)
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
