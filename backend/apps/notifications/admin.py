from django.contrib import admin
from .models import Notification, EmailLog

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'title', 'is_read', 'created_at')
    list_filter = ('type', 'is_read')
    search_fields = ('user__email', 'title', 'message')
    readonly_fields = ('created_at',)

@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'email_type', 'status', 'sent_at', 'failed_at', 'created_at')
    list_filter = ('status', 'email_type')
    search_fields = ('user__email',)
    readonly_fields = ('created_at', 'sent_at', 'failed_at')
