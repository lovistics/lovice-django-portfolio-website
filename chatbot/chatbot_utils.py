import re
from django.db.models import Prefetch
from portfolio.models import PortfolioOwner, Project, SkillCategory, Skill, BlogPost, Testimonial

def get_portfolio_data():
    """
    Fetches all portfolio data using optimized queries matching the current models.
    """
    try:
        owner = PortfolioOwner.objects.select_related('owner').get()
    except PortfolioOwner.DoesNotExist:
        raise ValueError("PortfolioOwner does not exist. Please create one.")

    return {
        'owner': owner,
        'projects': Project.objects.filter(owner=owner).select_related('owner').order_by('-created_at'),
        'skill_categories': SkillCategory.objects.prefetch_related(
            Prefetch('skills', queryset=Skill.objects.order_by('category', '-level', 'name'))
        ),
        'blog_posts': BlogPost.objects.filter(owner=owner).select_related('owner').order_by('-publish_date'),
        'testimonials': Testimonial.objects.order_by('-created_at'),
    }

def generate_response(user_input, portfolio_data):
    user_input = preprocess_input(user_input)

    response_functions = [
        (r'\b(hi|hello|hey)\b', get_greeting),
        (r'\b(skills?|expertise|abilities)\b', get_skills_info),
        (r'\b(projects?|work|portfolio)\b', get_projects_info),
        (r'\b(blog|posts?|articles?)\b', get_blog_posts_info),
        (r'\b(testimonials?|reviews?|feedback)\b', get_testimonials_info),
        (r'\b(contact|reach|get in touch)\b', get_contact_info),
        (r'\b(social|media|linkedin|github)\b', get_social_media_info),
        (r'\b(about|who is) (.+)\b', get_owner_info),
        (r'\b(latest|recent) (project|work)\b', get_latest_project_info),
        (r'\b(top|best) (skills?|expertise)\b', get_top_skills_info),
        (r'\b(education|background|qualifications)\b', get_education_info),
        (r'\b(help|assistance|what can you do)\b', get_help_info),
        (r'\bwho are you\b', get_chatbot_info),
    ]

    for pattern, func in response_functions:
        if match := re.search(pattern, user_input):
            return func(portfolio_data, match)

    return "I'm sorry, I didn't quite understand that. Could you please rephrase your question? Type 'help' to see what I can assist you with."

def get_greeting(portfolio_data, _):
    owner_name = portfolio_data['owner'].owner.get_full_name()
    return f"Hello! I'm an AI assistant for {owner_name}'s portfolio. How can I help you today? Type 'help' to see what I can do."

def get_skills_info(portfolio_data, _):
    skills_info = "Here are the main skill categories:\n"
    for category in portfolio_data['skill_categories']:
        skills = [f'{skill.name} ({skill.level})' for skill in category.skills.all()]
        if skills:  # Only show categories that have skills
            skills_info += f"- {category.name}: {', '.join(skills)}\n"
    return skills_info.strip()


def get_projects_info(portfolio_data, _):
    projects = portfolio_data['projects'][:5]
    return format_projects(projects)

def format_projects(projects):
    projects_info = "Here are some notable projects:\n"
    for project in projects:
        projects_info += f"- {project.title}: {project.description[:100]}... "
        projects_info += f"(URL: {project.url})\n"
    return projects_info.strip()

def get_blog_posts_info(portfolio_data, _):
    blog_posts = portfolio_data['blog_posts'][:5]
    return format_blog_posts(blog_posts)

def format_blog_posts(blog_posts):
    blog_info = "Here are the latest blog posts:\n"
    for post in blog_posts:
        blog_info += f"- {post.title} (Published on {post.publish_date})\nURL: {post.url}\n"
    return blog_info.strip()

def get_testimonials_info(portfolio_data, _):
    testimonials = portfolio_data['testimonials'][:3]
    return format_testimonials(testimonials)

def format_testimonials(testimonials):
    testimonials_info = "Here are some testimonials:\n"
    for testimonial in testimonials:
        testimonials_info += (f"- {testimonial.author} ({testimonial.role or 'N/A'}) from {testimonial.company}: "
                              f"\"{testimonial.content[:100]}...\"\nRating: {testimonial.rating}/5\n")
    return testimonials_info.strip()

def get_contact_info(portfolio_data, _):
    owner = portfolio_data['owner'].owner
    return (f"You can contact {owner.get_full_name()} by filling out the contact form on the website. "
            f"Alternatively, you can send an email to {owner.email}.")

def get_social_media_info(portfolio_data, _):
    owner = portfolio_data['owner'].owner
    return (f"You can find {owner.get_full_name()} on:\n"
            f"GitHub: https://github.com/{owner.username}\n"
            f"LinkedIn: https://linkedin.com/in/{owner.username}dev")

def get_owner_info(portfolio_data, match):
    owner = portfolio_data['owner'].owner
    owner_name = owner.get_full_name()
    if match.group(2).lower() in [owner_name.lower(), 'the owner']:
        return (f"{owner_name} is a passionate developer and the owner of this portfolio. "
                f"They have expertise in various technologies and have worked on numerous projects. "
                f"Type 'skills' to see their areas of expertise or 'projects' to view their work.")
    return f"I'm sorry, I don't have information about {match.group(2)}. I can only provide details about {owner_name}, the owner of this portfolio."

def get_latest_project_info(portfolio_data, _):
    latest_project = portfolio_data['projects'].first()
    if latest_project:
        return (f"The latest project is '{latest_project.title}'. "
                f"Description: {latest_project.description[:150]}... "
                f"You can view it at: {latest_project.url}")
    return "I'm sorry, I couldn't find any recent projects."

def get_top_skills_info(portfolio_data, _):
    top_skills = []
    for category in portfolio_data['skill_categories']:
        top_skills.extend(category.skills.filter(level__in=['Advanced', 'Expert'])[:3])
    
    if top_skills:
        skills_list = ", ".join([f"{skill.name} ({skill.level})" for skill in top_skills])
        return f"Some of the top skills include: {skills_list}"
    return "I'm sorry, I couldn't find information about top skills."

def get_education_info(portfolio_data, _):
    return "For detailed information about education and qualifications, please contact the owner directly."

def get_help_info(portfolio_data, _):
    return (
        "I can help you with the following:\n"
        "- Information about skills and expertise (try 'What are your skills?')\n"
        "- Details about projects (try 'Tell me about your projects' or 'What's your latest project?')\n"
        "- Blog posts and articles (try 'Show me your blog posts')\n"
        "- Testimonials and reviews (try 'What testimonials do you have?')\n"
        "- Contact information (try 'How can I contact you?')\n"
        "- Social media profiles (try 'What are your social media links?')\n"
        "- General information about the portfolio owner (try 'Tell me about the owner')\n"
        "- Education and work experience (try 'What's your background?')\n"
        "Feel free to ask about any of these topics!"
    )

def get_chatbot_info(portfolio_data, _):
    owner_name = portfolio_data['owner'].owner.get_full_name()
    return f"I am an AI assistant designed to provide information about {owner_name}'s portfolio. I can answer questions about their skills, projects, blog posts, and more. How can I assist you today?"

def preprocess_input(user_input):
    return re.sub(r'[^\w\s]', '', user_input.lower()).strip()