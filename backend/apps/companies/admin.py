from django.contrib import admin
from .models import Company

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'location', 'industry', 'company_size', 'created_at')
    list_filter = ('industry',)
    search_fields = ('name', 'location', 'industry')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at')
