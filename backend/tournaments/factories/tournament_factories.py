import factory
from backend.tournaments.models import Tournament, Court, Match, Player, MatchPlayer
from faker import Faker
from django.db import models

faker = Faker()

class TournamentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Tournament

    title = factory.Faker('sentence', nb_words=3)
    format = factory.Faker('random_element', elements=Tournament.TournamentFormat.values)
    result_sorting = factory.Faker('random_element', elements=Tournament.ResultSorting.values)
    team_format = factory.Faker('random_element', elements=Tournament.TeamFormat.values)
    final_match = factory.Faker('random_element', elements=Tournament.FinalMatch.values)
    points_per_match = factory.Faker('random_int', min=1, max=50)
    status = Tournament.TournamentStatus.NEW
    rounds = 0

class CourtFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Court

    name = factory.Faker('sentence', nb_words=2)
    number = factory.Faker('random_int',min=1)
    tournament = factory.SubFactory(TournamentFactory)

class PlayerFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Player

    name = factory.Faker('name')
    tournament = factory.SubFactory(TournamentFactory)

class MatchFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Match

    tournament = factory.SubFactory(TournamentFactory)
    court = factory.SubFactory(CourtFactory, tournament=factory.SelfAttribute('..tournament'))
    round_number = factory.LazyAttribute(
        lambda o: faker.random_int(min=1, max=o.tournament.rounds + 1)
    )

    team_1_score = factory.LazyAttribute(
        lambda o: faker.random_int(min=0, max=50) if o.played else None
    )
    team_2_score = factory.LazyAttribute(
        lambda o: faker.random_int(min=0, max=50) if o.played else None
    )
    played = factory.Faker('pybool')

class MatchPlayerFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = MatchPlayer

    match = factory.SubFactory(MatchFactory)
    player = factory.SubFactory(PlayerFactory, tournament=factory.SelfAttribute('..match.tournament'))
    team = factory.Faker('random_element', elements=MatchPlayer.TeamChoices.values)

class TournamentWithRelationsFactory(TournamentFactory):
    """
    Create Tournaments with realted players, courts and matches
    if full=True -> creates all relations
    if full=False (default) --> creates only rel that are passed by user
    """

    class Params:
        full = False

    @factory.post_generation
    def players(self, create, extracted, **kwargs):
        if not create:
            return
        count = extracted or (8 if kwargs.get('full') else None)
        if count:
            PlayerFactory.create_batch(count, tournament=self)

    @factory.post_generation
    def courts(self, create, extracted, **kwargs):
        if not create:
            return
        count = extracted or (3 if kwargs.get('full') else None)
        if count:
            CourtFactory.create_batch(count, tournament=self)

    @factory.post_generation
    def matches(self, create, extracted, **kwargs):
        if not create:
            return
        count = extracted or (5 if kwargs.get('full') else None)
        if count:
            MatchFactory.create_batch(count, tournament=self)
            self.rounds = self.matches.aggregate(
                max_round=models.Max('round_number')
            )['max_round'] or 0
            self.save(update_fields=['rounds'])

