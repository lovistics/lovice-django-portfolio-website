from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.utils.crypto import get_random_string

# Singleton Model for Portfolio Owner
class PortfolioOwner(models.Model):
    owner = models.OneToOneField(User, on_delete=models.CASCADE, related_name='portfolio_owner')
    
    def save(self, *args, **kwargs):
        if PortfolioOwner.objects.exists() and not self.pk:
            raise ValidationError("There can be only one Portfolio Owner.")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.owner.username

# Project Model
class Project(models.Model):
    owner = models.ForeignKey(PortfolioOwner, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=200, unique=True)
    description = models.TextField()
    url = models.URLField(max_length=500)
    image = models.ImageField(upload_to='projects/', blank=True, null=True)
    slug = models.SlugField(unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
            if Project.objects.filter(slug=self.slug).exists():
                self.slug = f'{self.slug}-{get_random_string(5)}'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def clean(self):
        if self.image:
            file_size = self.image.file.size
            limit_kb = 500
            if file_size > limit_kb * 1024:
                raise ValidationError(f"Max size of file is {limit_kb} KB")

# Skill Category Model
class SkillCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

# Skill Levels Choices
SKILL_LEVELS = (
    ('Beginner', 'Beginner'),
    ('Intermediate', 'Intermediate'),
    ('Advanced', 'Advanced'),
    ('Expert', 'Expert'),
)

# Skill Model
class Skill(models.Model):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(SkillCategory, on_delete=models.SET_NULL, null=True, related_name='skills')
    level = models.CharField(max_length=20, choices=SKILL_LEVELS)

    def __str__(self):
        return f'{self.name} ({self.level})'

# BlogPost Model
class BlogPost(models.Model):
    owner = models.ForeignKey(PortfolioOwner, on_delete=models.CASCADE, related_name='blog_posts')
    title = models.CharField(max_length=200, unique=True)
    url = models.URLField(max_length=500)
    publish_date = models.DateField(default=timezone.now)
    slug = models.SlugField(unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
            if BlogPost.objects.filter(slug=self.slug).exists():
                self.slug = f'{self.slug}-{get_random_string(5)}'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

# Testimonial Model
class Testimonial(models.Model):
    author = models.CharField(max_length=100)
    role = models.CharField(max_length=100, blank=True, null=True)
    company = models.CharField(max_length=100)
    content = models.TextField()
    rating = models.IntegerField(default=5)  # Assuming a rating out of 5
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.author} - {self.company}'

# ContactMessage Model
class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    responded = models.BooleanField(default=False)
    response_message = models.TextField(blank=True, null=True)

    def __str__(self):
        return f'Message from {self.name} - {self.subject}'

    class Meta:
        ordering = ['-sent_at']