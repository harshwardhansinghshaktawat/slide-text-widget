class SlideText extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
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
    }
  }

  connectedCallback() {
    this.render();
  }

  render() {
    // Get attribute values with fallbacks
    const text = this.getAttribute('text') || 'Animation';
    const backgroundColor = this.getAttribute('background-color') || '#F5F5F5'; // Light gray
    const textColor = this.getAttribute('text-color') || '#333'; // Dark gray
    const animationDirection = this.getAttribute('animation-direction') || 'left'; // 'left' or 'right'
    const textAlignment = this.getAttribute('text-alignment') || 'center';
    const animationDuration = this.getAttribute('animation-duration') || '1.5'; // In seconds
    const fontFamily = this.getAttribute('font-family') || 'Helvetica'; // Matches original
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
          width: 100vw;
          height: 100vh;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background: ${backgroundColor};
          overflow: hidden;
        }

        .slide-container {
          text-align: ${textAlignment};
          font-family: ${fontFamily}, Arial, sans-serif;
          font-size: ${fontSize}vw;
          color: ${textColor};
          text-transform: uppercase;
        }

        .letter {
          display: inline-block;
          opacity: 0;
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

    // Apply animation delays to letters
    const letters = this.shadowRoot.querySelectorAll('.letter');
    letters.forEach((letter, i) => {
      letter.style.animationDelay = `${i * 0.1}s`; // 0.1s delay per letter
    });
  }
}

// Define the custom element
customElements.define('slide-text', SlideText);
