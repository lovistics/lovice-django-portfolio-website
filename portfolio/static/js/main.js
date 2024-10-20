document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const heroSection = document.querySelector(".hero-section");
  const heroContent = document.querySelector(".hero-content");
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotContainer = document.getElementById('chatbot-container');
  const chatbotMessages = document.getElementById('chatbot-messages');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');
  const skillsLists = document.querySelectorAll('.skills-list');
  const contactForm = document.querySelector('.contact-form-wrapper form');
  const successModal = document.getElementById('success-modal');
  const errorModal = document.getElementById('error-modal');
  const closeModalButtons = document.querySelectorAll('.modal .close');

  // Hero Section Animation
  const shrinkHero = () => {
    const scrollPosition = window.scrollY;
    const shrinkThreshold = 50;
    const shrinkFactor = Math.max(0, 1 - scrollPosition / 300);

    if (window.innerWidth > 768) {
      heroSection.style.height = scrollPosition > shrinkThreshold ? '100px' : '100vh';
      heroSection.classList.toggle("shrink", scrollPosition > shrinkThreshold);
      document.body.style.paddingTop = scrollPosition > shrinkThreshold ? "100px" : "0";
      heroContent.style.transform = `scale(${Math.max(0.8, shrinkFactor)})`;
    } else {
      heroSection.style.height = scrollPosition > shrinkThreshold ? '60px' : '100vh';
      heroSection.classList.toggle("shrink", scrollPosition > shrinkThreshold);
      document.body.style.paddingTop = scrollPosition > shrinkThreshold ? "60px" : "0";
      heroContent.style.transform = `scale(${Math.max(0.9, shrinkFactor)})`;
    }
  };

  let lastScrollPosition = 0;
  let ticking = false;

  window.addEventListener("scroll", () => {
    lastScrollPosition = window.scrollY;

    if (!ticking) {
      window.requestAnimationFrame(() => {
        shrinkHero();
        if (heroSection) {
          heroSection.style.backgroundPositionY = `${lastScrollPosition * 0.5}px`;
        }
        ticking = false;
      });

      ticking = true;
    }
  });

  // Smooth Scrolling
  const smoothScroll = (targetId, duration = 1000) => {
    const target = document.querySelector(targetId);
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    };

    const easeInOutCubic = (t, b, c, d) => {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t * t + b;
      t -= 2;
      return c / 2 * (t * t * t + 2) + b;
    };

    requestAnimationFrame(animation);
  };

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      smoothScroll(anchor.getAttribute('href'));
    });
  });

  // Intersection Observer for Animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.skills, .projects, .blog, .contact, .testimonials, .skill-card, .project-card, .blog-card, .testimonial-card')
    .forEach((el, index) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
      observer.observe(el);
    });

  // Chatbot Functionality
  const toggleChatbot = () => {
    chatbotContainer.classList.toggle('open');
    chatbotToggle.innerHTML = chatbotContainer.classList.contains('open') 
      ? '<i class="fas fa-times"></i>' 
      : '<i class="fas fa-comment"></i>';
    chatbotToggle.classList.toggle('active');
    if (chatbotContainer.classList.contains('open') && chatbotMessages.children.length === 0) {
      addMessage("Hi there! I'm an AI assistant for this portfolio. How can I help you today?", false);
    }
  };

  chatbotToggle.addEventListener('click', toggleChatbot);

  const addMessage = (message, isUser = false) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', isUser ? 'user-message' : 'bot-message');
    messageElement.innerHTML = formatMessage(message);
    messageElement.style.opacity = "0";
    messageElement.style.transform = "translateY(20px)";
    chatbotMessages.appendChild(messageElement);
    
    // Trigger reflow
    messageElement.offsetHeight;
    
    messageElement.style.opacity = "1";
    messageElement.style.transform = "translateY(0)";
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  };

  const formatMessage = (message) => {
    return message
      .replace(/\n/g, '<br>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  };

  const sendMessage = async () => {
    const message = userInput.value.trim();
    if (message) {
      addMessage(message, true);
      userInput.value = '';

      const typingIndicator = document.createElement('div');
      typingIndicator.classList.add('typing-indicator');
      typingIndicator.innerHTML = '<span></span><span></span><span></span>';
      chatbotMessages.appendChild(typingIndicator);
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

      try {
        const response = await fetch('/chatbot/chat/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
          },
          body: JSON.stringify({ message: message }),
        });
        const data = await response.json();
        setTimeout(() => {
          chatbotMessages.removeChild(typingIndicator);
          addMessage(data.message);
        }, 500 + Math.random() * 1000); // Random delay between 0.5 and 1.5 seconds
      } catch (error) {
        console.error('Error:', error);
        chatbotMessages.removeChild(typingIndicator);
        addMessage('Sorry, I encountered an error. Please try again.');
      }
    }
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  sendButton.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Card Animations
  const applyCardAnimation = (cards) => {
    cards.forEach(card => {
      const handleMouseEnter = () => {
        card.style.transition = "transform 0.3s ease, box-shadow 0.3s ease";
        card.style.transform = "scale(1.05)";
        card.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.2)";
      };
  
      const handleMouseLeave = () => {
        card.style.transition = "transform 0.3s ease, box-shadow 0.3s ease";
        card.style.transform = "scale(1)";
        card.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
      };
  
      const handleTouchStart = () => {
        card.style.transition = "transform 0.3s ease, box-shadow 0.3s ease";
        card.style.transform = "scale(1.05)";
        card.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.2)";
      };
  
      const handleTouchEnd = () => {
        card.style.transition = "transform 0.3s ease, box-shadow 0.3s ease";
        card.style.transform = "scale(1)";
        card.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
      };
  
      if (window.matchMedia("(hover: hover)").matches) {
        card.addEventListener("mouseenter", handleMouseEnter);
        card.addEventListener("mouseleave", handleMouseLeave);
      } else {
        card.addEventListener("touchstart", handleTouchStart);
        card.addEventListener("touchend", handleTouchEnd);
      }
    });
  };
  
  applyCardAnimation(document.querySelectorAll(".skill-card, .project-card, .blog-card"));

  // Testimonials Carousel
  const initTestimonialsCarousel = () => {
    const testimonialTrack = document.querySelector('.testimonials-track');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const prevButton = document.querySelector('.carousel-control.prev');
    const nextButton = document.querySelector('.carousel-control.next');
    let currentIndex = 0;
    let startX, currentX;
    let intervalId;

    const moveCarousel = (direction) => {
      if (direction === 'next') {
        currentIndex = (currentIndex + 1) % testimonialCards.length;
      } else {
        currentIndex = (currentIndex - 1 + testimonialCards.length) % testimonialCards.length;
      }
      updateCarousel(true);
    };

    const updateCarousel = (animate = false) => {
      const cardWidth = testimonialCards[0].offsetWidth;
      if (animate) {
        testimonialTrack.style.transition = 'transform 0.5s ease';
      } else {
        testimonialTrack.style.transition = 'none';
      }
      testimonialTrack.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
      testimonialCards.forEach((card, i) => {
        const distance = Math.abs(i - currentIndex);
        const scale = 1 - (distance * 0.1);
        const opacity = 1 - (distance * 0.3);
        card.style.transform = `scale(${scale})`;
        card.style.opacity = opacity;
      });
    };

    const autoPlay = () => moveCarousel('next');
    const startAutoPlay = () => { intervalId = setInterval(autoPlay, 5000); };
    const stopAutoPlay = () => clearInterval(intervalId);

    if (testimonialTrack && prevButton && nextButton) {
      [prevButton, nextButton].forEach(button => {
        button.addEventListener('click', () => {
          stopAutoPlay();
          moveCarousel(button === prevButton ? 'prev' : 'next');
          startAutoPlay();
        });
      });

      testimonialTrack.addEventListener('mouseenter', stopAutoPlay);
      testimonialTrack.addEventListener('mouseleave', startAutoPlay);

      // Touch events for mobile swipe
      let xDown = null;
      let yDown = null;

      const handleTouchStart = (evt) => {
        xDown = evt.touches[0].clientX;
        yDown = evt.touches[0].clientY;
        stopAutoPlay();
      };

      const handleTouchMove = (evt) => {
        if (!xDown || !yDown) {
          return;
        }

        const xUp = evt.touches[0].clientX;
        const yUp = evt.touches[0].clientY;

        const xDiff = xDown - xUp;
        const yDiff = yDown - yUp;

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
          if (xDiff > 0) {
            // Swipe left
            moveCarousel('next');
          } else {
            // Swipe right
            moveCarousel('prev');
          }
        }

        xDown = null;
        yDown = null;
      };

      const handleTouchEnd = () => {
        startAutoPlay();
      };

      testimonialCards.forEach(card => {
        card.addEventListener('touchstart', handleTouchStart, { passive: true });
        card.addEventListener('touchmove', handleTouchMove, { passive: true });
        card.addEventListener('touchend', handleTouchEnd, { passive: true });
      });

      // Transitionend event listener
      testimonialTrack.addEventListener('transitionend', () => {
        testimonialTrack.style.transition = 'none';
      });

      // Initial setup
      updateCarousel();
      startAutoPlay();

      // Resize handling
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          updateCarousel(false);
        }, 250);
      });
    }
  };
  // Typing effect for hero title
  const typeWriter = (element, text, i = 0) => {
    if (i < text.length) {
      if (i === 0) element.textContent = '';
      element.textContent += text.charAt(i);
      setTimeout(() => typeWriter(element, text, i + 1), 100);
    } else {
      setTimeout(() => element.classList.add('cursor-blink'), 500);
    }
  };

  const heroTitle = document.querySelector('.hero-job-title');
  if (heroTitle) {
    setTimeout(() => typeWriter(heroTitle, heroTitle.textContent), 1000);
  }

  // Initialize testimonials carousel
  initTestimonialsCarousel();

  // Contact Form Submission
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(contactForm);
    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      const data = await response.json();
      if (data.success) {
        showModal(successModal);
      } else {
        showModal(errorModal, data.errors);
      }
    } catch (error) {
      console.error('Error:', error);
      showModal(errorModal, { error: 'An unexpected error occurred. Please try again later.' });
    }
  });

  // Show Modal
  const showModal = (modal, errors = null) => {
    if (errors) {
      const errorList = modal.querySelector('.error-list');
      errorList.innerHTML = '';
      for (const [field, message] of Object.entries(errors)) {
        const errorItem = document.createElement('li');
        errorItem.textContent = `${field}: ${message}`;
        errorList.appendChild(errorItem);
      }
    }
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };

  // Close Modal
  closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
      button.closest('.modal').style.display = 'none';
      document.body.style.overflow = ''; // Re-enable scrolling
    });
  });

  // Close Modal on Outside Click
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
      document.body.style.overflow = ''; // Re-enable scrolling
    }
  });

  // Skills list animation
  const initSkillsAnimation = () => {
    skillsLists.forEach(list => {
      const listHeight = list.offsetHeight;
      const wrapperHeight = list.closest('.skills-list-wrapper').offsetHeight;
      
      if (listHeight > wrapperHeight) {
        const animationDuration = listHeight / 30; // 30 pixels per second
        list.style.animationDuration = `${animationDuration}s`;
      } else {
        list.style.animation = 'none';
      }
    });
  };

  initSkillsAnimation();

  // Reinitialize animations on window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      initSkillsAnimation();
      initTestimonialsCarousel();
    }, 250);
  });

  // Lazy loading images
  const lazyLoadImages = () => {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    const imgs = document.querySelectorAll('img.lazy');
    imgs.forEach(img => imageObserver.observe(img));
  };

  lazyLoadImages();

  // Add touch feedback for buttons and links
  const addTouchFeedback = () => {
    const elements = document.querySelectorAll('button, .btn, a');
    elements.forEach(el => {
      el.addEventListener('touchstart', () => el.classList.add('touch-active'), { passive: true });
      el.addEventListener('touchend', () => el.classList.remove('touch-active'), { passive: true });
    });
  };

  addTouchFeedback();
});