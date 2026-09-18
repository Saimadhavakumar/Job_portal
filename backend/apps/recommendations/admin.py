from django.contrib import admin
from .models import Recommendation

@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ('user', 'job', 'score', 'algorithm_version', 'created_at')
    list_filter = ('algorithm_version',)
    search_fields = ('user__email', 'job__title')
    readonly_fields = ('created_at', 'expires_at')
    ordering = ('-score',)
