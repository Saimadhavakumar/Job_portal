from django.contrib import admin
from .models import (
    Profile, UserPreference, Skill, UserSkill,
    Project, ProjectSkill, Education, Experience, ExperienceSkill, Certification
)

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'headline', 'location', 'phone', 'updated_at')
    search_fields = ('user__email', 'user__first_name', 'headline', 'location')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'preferred_locations', 'preferred_work_modes', 'preferred_employment_types', 'updated_at')
    search_fields = ('user__email',)
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'normalized_name', 'category', 'created_at')
    list_filter = ('category',)
    search_fields = ('name', 'normalized_name')
    readonly_fields = ('created_at',)

@admin.register(UserSkill)
class UserSkillAdmin(admin.ModelAdmin):
    list_display = ('user', 'skill', 'source', 'confidence', 'proficiency', 'created_at')
    list_filter = ('source',)
    search_fields = ('user__email', 'skill__name')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'url', 'source', 'created_at')
    search_fields = ('name', 'user__email')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(ProjectSkill)
class ProjectSkillAdmin(admin.ModelAdmin):
    list_display = ('project', 'skill')

@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ('user', 'institution', 'degree', 'field_of_study', 'start_date', 'end_date')
    search_fields = ('user__email', 'institution', 'degree')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ('user', 'company', 'job_title', 'start_date', 'end_date', 'is_current')
    list_filter = ('is_current',)
    search_fields = ('user__email', 'company', 'job_title')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(ExperienceSkill)
class ExperienceSkillAdmin(admin.ModelAdmin):
    list_display = ('experience', 'skill')

@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'issuing_organization', 'issue_date', 'expiration_date')
    search_fields = ('user__email', 'name', 'issuing_organization')
    readonly_fields = ('created_at', 'updated_at')
