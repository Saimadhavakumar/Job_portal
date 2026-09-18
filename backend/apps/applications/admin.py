from django.contrib import admin
from .models import SavedJob, Application, ApplicationStatusHistory

class ApplicationStatusHistoryInline(admin.TabularInline):
    model = ApplicationStatusHistory
    extra = 0
    readonly_fields = ('old_status', 'new_status', 'changed_by', 'note', 'created_at')

@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display = ('user', 'job', 'created_at')
    search_fields = ('user__email', 'job__title')
    readonly_fields = ('created_at',)

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('user', 'job', 'status', 'applied_at', 'updated_at')
    list_filter = ('status',)
    search_fields = ('user__email', 'job__title', 'job__company__name')
    readonly_fields = ('applied_at', 'updated_at')
    inlines = [ApplicationStatusHistoryInline]

@admin.register(ApplicationStatusHistory)
class ApplicationStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('application', 'old_status', 'new_status', 'changed_by', 'created_at')
    list_filter = ('new_status',)
    search_fields = ('application__user__email', 'application__job__title')
    readonly_fields = ('created_at',)
