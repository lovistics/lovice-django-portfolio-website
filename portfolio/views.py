import logging
from django.http import JsonResponse
from django.shortcuts import render, redirect
from .models import Project, BlogPost, Testimonial, SkillCategory, PortfolioOwner
from .forms import ContactForm
from django.urls import reverse
from django.contrib import messages
from django.views.decorators.http import require_POST


logger = logging.getLogger(__name__)

def home(request):
    owner = PortfolioOwner.objects.first()
    projects = Project.objects.filter(owner=owner).order_by('-created_at')[:3]
    skills = SkillCategory.objects.prefetch_related('skills').all()
    blog_posts = BlogPost.objects.filter(owner=owner).order_by('-publish_date')[:3]
    testimonials = Testimonial.objects.order_by('-created_at').all()

    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            try:
                form.save()
                if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                    return JsonResponse({'success': True})
                messages.success(request, 'Your message has been sent successfully!')
                return redirect(reverse('contact_success'))
            except Exception as e:
                logger.error(f"Error saving contact form: {e}")
                messages.error(request, 'There was an error saving your message. Please try again.')
        else:
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': form.errors})
            messages.error(request, 'There was an error in your submission. Please try again.')
    else:
        form = ContactForm()

    return render(request, 'portfolio/home.html', {
        'owner': owner,
        'projects': projects,
        'skills': skills,
        'blog_posts': blog_posts,
        'testimonials': testimonials,
        'form': form,
    })

@require_POST
def contact_form_submit(request):
    form = ContactForm(request.POST)
    if form.is_valid():
        try:
            form.save()
            return JsonResponse({'status': 'success', 'message': 'Your message has been sent successfully!'})
        except Exception as e:
            logger.error(f"Error saving contact form: {e}")
            return JsonResponse({'status': 'error', 'message': 'There was an error saving your message. Please try again.'})
    else:
        errors = {field: errors[0] for field, errors in form.errors.items()}
        return JsonResponse({'status': 'error', 'errors': errors})