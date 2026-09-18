from django.contrib import admin
from .models import Job, JobSkill, JobSource

class JobSkillInline(admin.TabularInline):
    model = JobSkill
    extra = 1

class JobSourceInline(admin.TabularInline):
    model = JobSource
    extra = 0

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'employment_type', 'work_mode', 'location', 'status', 'published_at', 'created_at')
    list_filter = ('status', 'employment_type', 'work_mode')
    search_fields = ('title', 'company__name', 'location', 'description')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('created_at', 'updated_at', 'published_at')
    inlines = [JobSkillInline, JobSourceInline]

@admin.register(JobSkill)
class JobSkillAdmin(admin.ModelAdmin):
    list_display = ('job', 'skill', 'importance', 'required')
    list_filter = ('importance', 'required')
    search_fields = ('job__title', 'skill__name')

@admin.register(JobSource)
class JobSourceAdmin(admin.ModelAdmin):
    list_display = ('job', 'source_type', 'source_name', 'source_url', 'created_at')
    list_filter = ('source_type',)
    search_fields = ('job__title', 'source_name')
