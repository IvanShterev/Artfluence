from django.contrib import admin
from .models import ArtfluenceUser, DebitCard

admin.site.register(ArtfluenceUser)
admin.site.register(DebitCard)

# @admin.register(ArtfluenceUser)
# class ArtfluenceUserAdmin(admin.ModelAdmin):
#     list_display = ('id', 'email', 'username', 'is_staff')
#     search_fields = ('email', 'username')