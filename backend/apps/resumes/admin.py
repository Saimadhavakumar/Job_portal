from django.contrib import admin
from .models import Resume, ResumeVersion, ParsedResume

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active',)
    search_fields = ('user__email', 'title')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(ResumeVersion)
class ResumeVersionAdmin(admin.ModelAdmin):
    list_display = ('resume', 'file_name', 'version_number', 'parsing_status', 'file_size', 'uploaded_at')
    list_filter = ('parsing_status',)
    search_fields = ('file_name', 'resume__user__email')
    readonly_fields = ('uploaded_at', 'parsed_at')

@admin.register(ParsedResume)
class ParsedResumeAdmin(admin.ModelAdmin):
    list_display = ('resume_version', 'parser_version', 'parsed_at')
    search_fields = ('resume_version__file_name',)
    readonly_fields = ('parsed_at',)
