from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('user_type', 'club_name',)}),
    )
    list_display = ('username', 'email', 'user_type', 'club_name', 'is_staff', 'is_superuser')
    list_filter = ('user_type', 'is_staff', 'is_superuser')