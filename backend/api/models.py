from django.db import models
from django.contrib.auth.models import User

class Tournament(models.Model):
    FORMAT_CHOICES = [
        ('T10', 'T10 (10 Overs)'),
        ('T20', 'T20 (20 Overs)'),
        ('ODI', 'ODI (50 Overs)'),
        ('TEST', 'Test Match (Days)'),
    ]
    name = models.CharField(max_length=200)
    description = models.TextField()
    format_type = models.CharField(max_length=20, choices=FORMAT_CHOICES, default='T20')
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.get_format_type_display()})"

class Team(models.Model):
    name = models.CharField(max_length=100)
    logo_url = models.URLField(blank=True, null=True)
    captain_name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='player_profile', null=True, blank=True)
    team = models.ForeignKey(Team, related_name='players', on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=50) # e.g., Batsman, Bowler, Wicket Keeper, All-rounder
    batting_style = models.CharField(max_length=50, blank=True, null=True) # e.g. Right-hand bat, Left-hand bat
    bowling_style = models.CharField(max_length=50, blank=True, null=True) # e.g. Right-arm Fast, Left-arm Spin
    image_url = models.URLField(blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    birth_place = models.CharField(max_length=255, blank=True, null=True)
    country = models.CharField(max_length=100, default='India')
    state = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    village = models.CharField(max_length=100, blank=True, null=True)
    pincode = models.CharField(max_length=20, blank=True, null=True)
    mobile_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    def __str__(self):
        return self.name


class Match(models.Model):
    tournament = models.ForeignKey(Tournament, related_name='matches', on_delete=models.CASCADE)
    team1 = models.ForeignKey(Team, related_name='matches_as_team1', on_delete=models.CASCADE)
    team2 = models.ForeignKey(Team, related_name='matches_as_team2', on_delete=models.CASCADE)
    match_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=[('Upcoming', 'Upcoming'), ('Ongoing', 'Ongoing'), ('Completed', 'Completed')], default='Upcoming')
    toss_details = models.CharField(max_length=255, blank=True, null=True)
    current_striker = models.ForeignKey(Player, related_name='active_strikes', on_delete=models.SET_NULL, null=True, blank=True)
    current_non_striker = models.ForeignKey(Player, related_name='active_non_strikes', on_delete=models.SET_NULL, null=True, blank=True)
    current_bowler = models.ForeignKey(Player, related_name='active_bowls', on_delete=models.SET_NULL, null=True, blank=True)
    total_runs = models.IntegerField(default=0)
    total_wickets = models.IntegerField(default=0)
    current_over = models.IntegerField(default=0)
    current_over_balls = models.IntegerField(default=0)
    result = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return f"{self.team1.name} vs {self.team2.name}"

class BattingScore(models.Model):
    match = models.ForeignKey(Match, related_name='batting_scores', on_delete=models.CASCADE)
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    runs = models.IntegerField(default=0)
    balls = models.IntegerField(default=0)
    fours = models.IntegerField(default=0)
    sixes = models.IntegerField(default=0)
    is_out = models.BooleanField(default=False)
    how_out = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        unique_together = ('match', 'player')

class BowlingScore(models.Model):
    match = models.ForeignKey(Match, related_name='bowling_scores', on_delete=models.CASCADE)
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    overs = models.FloatField(default=0.0)
    balls_bowled = models.IntegerField(default=0)
    maidens = models.IntegerField(default=0)
    runs_conceded = models.IntegerField(default=0)
    wickets = models.IntegerField(default=0)

    class Meta:
        unique_together = ('match', 'player')

class ScoreUpdate(models.Model):
    match = models.ForeignKey(Match, related_name='scores', on_delete=models.CASCADE)
    score_details = models.CharField(max_length=255) # e.g., "India 150/2 (15.4)"
    commentary = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Score for {self.match} at {self.updated_at}"

class TournamentApplication(models.Model):
    tournament = models.ForeignKey(Tournament, related_name='applications', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team_name = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=15)
    status = models.CharField(max_length=20, choices=[('Pending', 'Pending'), ('Approved', 'Approved'), ('Rejected', 'Rejected')], default='Pending')
    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.team_name} application for {self.tournament}"
