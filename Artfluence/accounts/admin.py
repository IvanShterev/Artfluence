
from django.contrib import admin
from .models import ArtfluenceUser, DebitCard

@admin.register(ArtfluenceUser)
class ArtfluenceUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'email', 'username', 'is_staff', 'is_superuser')
    list_filter = ('is_staff', 'is_superuser')
    search_fields = ('email', 'username')
    ordering = ('email',)
    fieldsets = (
        (None, {
            'fields': ('email', 'username', 'password')
        }),
        ('Permissions', {
            'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Important dates', {
            'fields': ('last_login',)
        }),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'is_staff', 'is_superuser'),
        }),
    )


@admin.register(DebitCard)
class DebitCardAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'card_number', 'used_for_payments')
    search_fields = ('card_number', 'owner__email', 'owner__username')
    list_filter = ('used_for_payments',)
