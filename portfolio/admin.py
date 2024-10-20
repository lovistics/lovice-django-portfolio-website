from django.contrib import admin
from .models import (
    PortfolioOwner, Project, Skill, BlogPost, Testimonial,
    ContactMessage, SkillCategory
)

@admin.register(PortfolioOwner)
class PortfolioOwnerAdmin(admin.ModelAdmin):
    list_display = ('owner',)

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'url', 'slug', 'created_at')
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ('title', 'description', 'url')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'level')
    search_fields = ('name',)
    list_filter = ('category', 'level')

@admin.register(SkillCategory)
class SkillCategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'url', 'publish_date', 'slug', 'created_at')
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ('title', 'url')
    list_filter = ('publish_date',)
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('author', 'role', 'company', 'rating', 'created_at')
    search_fields = ('author', 'role', 'company')
    readonly_fields = ('created_at',)

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'sent_at', 'responded')
    search_fields = ('name', 'email', 'subject')
    list_filter = ('responded', 'sent_at')
    readonly_fields = ('sent_at',)