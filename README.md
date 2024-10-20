# Lovice Django Portfolio Website

A modern, responsive portfolio website built with Django, featuring an AI-powered chatbot for interactive portfolio exploration.

## Features

- 🎯 **Dynamic Portfolio Management**
  - Projects showcase with images and descriptions
  - Skills categorization with proficiency levels
  - Blog posts integration
  - Client testimonials with ratings
  - Contact form with response tracking

- 🤖 **AI Chatbot**
  - Natural language interaction
  - Intelligent portfolio information retrieval
  - Context-aware responses
  - Comprehensive query handling for projects, skills, and contact information

- 💼 **Professional Presentation**
  - Clean, modern UI design
  - Responsive layout for all devices
  - Social media integration
  - Testimonials carousel
  - Dynamic content loading

## Technical Stack

- **Backend:** Django 5.0
- **Frontend:** HTML5, CSS3, JavaScript
- **CSS Framework:** Bootstrap 4
- **Form Handling:** django-crispy-forms
- **Tagging System:** django-taggit
- **Database:** SQLite (default)
- **Image Handling:** Django ImageField

## Installation

1. Clone the repository:
```bash
git clone https://github.com/lovistics/lovice-django-portfolio-website.git
cd lovice-django-portfolio-website
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update necessary settings (SECRET_KEY, etc.)

5. Run migrations:
```bash
python manage.py migrate
```

6. Create a superuser:
```bash
python manage.py createsuperuser
```

7. Run the development server:
```bash
python manage.py runserver
```

## Project Structure

```
portfolio_website/
├── portfolio/              # Main portfolio app
│   ├── models.py          # Data models for portfolio content
│   ├── views.py           # View controllers
│   ├── templates/         # HTML templates
│   └── static/            # Static files (CSS, JS, images)
├── chatbot/               # Chatbot application
│   └── utils.py           # Chatbot logic and response handling
└── manage.py              # Django management script
```

## Usage

1. Access the admin panel at `/admin` to manage:
   - Portfolio owner information
   - Projects and skills
   - Blog posts
   - Testimonials
   - Contact messages

2. The chatbot can be customized by modifying the response patterns in `chatbot/utils.py`

3. Update the templates in `portfolio/templates/` to customize the site's appearance

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - [@YourTwitter](https://twitter.com/YourTwitter)

Project Link: [https://github.com/lovistics/lovice-django-portfolio-website](https://github.com/lovistics/lovice-django-portfolio-website)
