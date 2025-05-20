class SlideText extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isIntersecting = false;
    this.hasAnimated = false;
  }

  static get observedAttributes() {
    return [
      'text', 'background-color', 'text-color', 'animation-direction',
      'text-alignment', 'animation-duration', 'font-family', 'font-size'
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
      
      // Re-observe after render if attributes change
      if (this.observer && !this.hasAnimated) {
        this.setupIntersectionObserver();
      }
    }
  }

  connectedCallback() {
    this.render();
    this.setupIntersectionObserver();
  }

  disconnectedCallback() {
    // Clean up the observer when element is removed
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  setupIntersectionObserver() {
    // Create an intersection observer
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimated) {
          this.isIntersecting = true;
          this.startAnimation();
          this.hasAnimated = true;
          
          // Optionally disconnect the observer after animation starts
          // Remove this if you want the animation to replay when element re-enters viewport
          this.observer.disconnect();
          this.observer = null;
        }
      });
    }, {
      threshold: 0.1 // Trigger when at least 10% of the element is visible
    });

    // Start observing the container
    const container = this.shadowRoot.querySelector('.slide-container');
    if (container) {
      this.observer.observe(container);
    }
  }

  startAnimation() {
    // Apply animation classes to letters only when in viewport
    const letters = this.shadowRoot.querySelectorAll('.letter');
    letters.forEach((letter, i) => {
      letter.classList.add('animate');
      letter.style.animationDelay = `${i * 0.1}s`;
    });
  }

  render() {
    // Get attribute values with fallbacks
    const text = this.getAttribute('text') || 'Elegant';
    const backgroundColor = this.getAttribute('background-color') || '#2C2F33'; // Deep charcoal gray
    const textColor = this.getAttribute('text-color') || '#F8EDE3'; // Creamy off-white
    const animationDirection = this.getAttribute('animation-direction') || 'left';
    const textAlignment = this.getAttribute('text-alignment') || 'center';
    const animationDuration = this.getAttribute('animation-duration') || '1.5'; // In seconds
    const fontFamily = this.getAttribute('font-family') || 'Playfair Display'; // Elegant serif
    const fontSize = this.getAttribute('font-size') || '5'; // In vw
    
    // Spanize the text (skip spaces)
    const spanizedText = text.split('').map(char => 
      char === ' ' ? ' ' : `<span class="letter">${char}</span>`
    ).join('');
    
    // Determine animation direction
    const isLeft = animationDirection === 'left';
    const translateFromX = isLeft ? '200px' : '-200px';
    const animationName = isLeft ? 'slideLeft' : 'slideRight';
    
    // Inject HTML and CSS into shadow DOM
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          background: ${backgroundColor};
          overflow: hidden;
        }
        .slide-container {
          text-align: ${textAlignment};
          font-family: ${fontFamily}, serif; /* Serif fallback for elegance */
          font-size: ${fontSize}vw;
          color: ${textColor};
          text-transform: uppercase;
          padding: 20px;
        }
        .letter {
          display: inline-block;
          opacity: 0;
        }
        .letter.animate {
          animation: ${animationName} ${animationDuration}s cubic-bezier(0.075, 0.82, 0.165, 1) forwards;
        }
        @keyframes slideLeft {
          from {
            opacity: 0;
            transform: translateX(${translateFromX});
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideRight {
          from {
            opacity: 0;
            transform: translateX(${translateFromX});
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      </style>
      <div class="slide-container">${spanizedText}</div>
    `;
    
    // If already intersecting, start animation immediately 
    // This handles case where attributes change after element is already visible
    if (this.isIntersecting && !this.hasAnimated) {
      this.startAnimation();
      this.hasAnimated = true;
    }
  }
}

// Define the custom element
customElements.define('slide-text', SlideText);
