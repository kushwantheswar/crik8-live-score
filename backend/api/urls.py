from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, TournamentViewSet, TeamViewSet, 
    PlayerViewSet, MatchViewSet, ScoreUpdateViewSet, 
    TournamentApplicationViewSet
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'tournaments', TournamentViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'players', PlayerViewSet)
router.register(r'matches', MatchViewSet)
router.register(r'scores', ScoreUpdateViewSet)
router.register(r'applications', TournamentApplicationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
