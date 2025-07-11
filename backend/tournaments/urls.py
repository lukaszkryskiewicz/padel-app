"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path

from backend.tournaments.views import TournamentListCreateView, TournamentRetriveView, MatchListView, \
    CurrentRoundMatchesView, MatchUpdateView, RoundResultsUpdateView, GenerateRoundView

urlpatterns = [
    path('', TournamentListCreateView.as_view(), name="tournament-list-create"),
    path('<int:pk>/', TournamentRetriveView.as_view(), name="tournament-retrieve"),
    path('<int:pk>/matches/', MatchListView.as_view(), name="match-list"),
    path('<int:tournament_id>/current-round/', CurrentRoundMatchesView.as_view(), name="current-round-matches"),
    path('<int:tournament_id>/update-single/<int:pk>/', MatchUpdateView.as_view(), name='single-match-update'),
    path('<int:tournament_id>/update-round/', RoundResultsUpdateView.as_view(), name='round-results-update'),
    path('<int:tournament_id>/generate-round/', GenerateRoundView.as_view(), name='generate-round'),
]