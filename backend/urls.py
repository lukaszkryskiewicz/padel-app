from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path('api/tournaments/', include('backend.tournaments.urls')),
    path('api/accounts/', include('backend.accounts.urls'))
]
