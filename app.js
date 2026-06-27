(function () {
  'use strict';

  var MEDIA = {
    photos: [
      { src: 'assets/images/photo-1.jpg', alt: 'Pareja en un momento especial juntos', caption: 'El día que comenzó todo' },
      { src: 'assets/images/photo-2.jpg', alt: 'Sonrisa compartida de la pareja', caption: 'Tu sonrisa, mi lugar favorito' },
      { src: 'assets/images/photo-3.jpg', alt: 'Mirada cómplice entre los dos', caption: 'La pieza que completa mi corazón.' },
      { src: 'assets/images/photo-4.jpg', alt: 'Abrazo sincero de la pareja', caption: 'Donde terminan mis brazos, empiezas tú' },
      { src: 'assets/images/photo-5.jpg', alt: 'Aventura de la pareja juntos', caption: 'Cada paso a tu lado es un destino' },
      { src: 'assets/images/photo-6.jpg', alt: 'Atardecer en pareja', caption: 'El sol se pone, nosotros no' },
      { src: 'assets/images/photo-7.jpg', alt: 'Mensaje especial esperando ser leído', caption: 'Haz click para leer' },
    ],
  };

  var PLACEHOLDER_GRADIENTS = [
    ['#F5EBE0', '#F5D6D6'],
    ['#FFF8F0', '#C9A96E'],
    ['#F5D6D6', '#C4958F'],
    ['#F5EBE0', '#FFF8F0'],
    ['#C9A96E', '#F5EBE0'],
    ['#C4958F', '#F5D6D6'],
    ['#FFF8F0', '#C4958F'],
  ];

  function generatePlaceholder(index) {
    var c = document.createElement('canvas');
    c.width = 120;
    c.height = 160;
    var ctx = c.getContext('2d');
    var colors = PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length];
    var grad = ctx.createLinearGradient(0, 0, c.width, c.height);
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(1, colors[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, c.width, c.height);
    return c.toDataURL();
  }

  var ScrollReveal = {
    observer: null,

    init: function () {
      var self = this;
      this.observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              self.observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );

      var els = document.querySelectorAll(
        '.polaroid, .letter-card, .section__header'
      );
      Array.prototype.forEach.call(els, function (el) {
        self.observer.observe(el);
      });
    },
  };

  var LightboxManager = {
    currentIndex: 0,
    el: null,
    previousFocus: null,

    init: function () {
      this.el = document.getElementById('lightbox');
      this.bindEvents();
    },

    open: function (index) {
      this.currentIndex = index;
      this.previousFocus = document.activeElement;
      this.updateContent();
      this.el.removeAttribute('hidden');
      this.el.classList.add('open');
      document.body.style.overflow = 'hidden';
      this.focusTrap();
    },

    close: function () {
      this.el.classList.remove('open');
      this.el.setAttribute('hidden', '');
      document.body.style.overflow = '';
      if (this.previousFocus) {
        this.previousFocus.focus();
      }
    },

    prev: function () {
      this.currentIndex =
        (this.currentIndex - 1 + MEDIA.photos.length) % MEDIA.photos.length;
      this.updateContent();
    },

    next: function () {
      this.currentIndex =
        (this.currentIndex + 1) % MEDIA.photos.length;
      this.updateContent();
    },

    updateContent: function () {
      var photo = MEDIA.photos[this.currentIndex];
      var img = this.el.querySelector('.lightbox__image');
      img.src = photo.src;
      img.alt = photo.alt;
      this.el.querySelector('.lightbox__caption').textContent = photo.caption;
    },

    bindEvents: function () {
      var self = this;

      this.el
        .querySelector('.lightbox__close')
        .addEventListener('click', function () {
          self.close();
        });

      this.el.addEventListener('click', function (e) {
        if (e.target === self.el) {
          self.close();
        }
      });

      this.el
        .querySelector('.lightbox__prev')
        .addEventListener('click', function () {
          self.prev();
        });

      this.el
        .querySelector('.lightbox__next')
        .addEventListener('click', function () {
          self.next();
        });

      document.addEventListener('keydown', function (e) {
        if (!self.el.classList.contains('open')) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          self.close();
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          self.prev();
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          self.next();
        }
      });

      var startX = 0;
      this.el.addEventListener(
        'touchstart',
        function (e) {
          startX = e.touches[0].clientX;
        },
        { passive: true }
      );

      this.el.addEventListener(
        'touchend',
        function (e) {
          var diff = e.changedTouches[0].clientX - startX;
          if (Math.abs(diff) > 40) {
            if (diff > 0) self.prev();
            else self.next();
          }
        },
        { passive: true }
      );
    },

    focusTrap: function () {
      var focusable = this.el.querySelectorAll(
        'button, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length) {
        setTimeout(function () {
          focusable[0].focus();
        }, 100);
      }
    },
  };

  var StarParticles = {
    canvas: null,
    ctx: null,
    stars: [],
    animId: null,

    init: function () {
      this.canvas = document.getElementById('particles-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      this.createStars(25);
      this.animate();

      var self = this;
      window.addEventListener('resize', function () {
        self.resize();
      });

      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          cancelAnimationFrame(self.animId);
        } else {
          self.animate();
        }
      });
    },

    resize: function () {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },

    createStars: function (count) {
      for (var i = 0; i < count; i++) {
        this.stars.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: Math.random() * 2.2 + 0.6,
          opacity: Math.random() * 0.5 + 0.2,
          speed: Math.random() * 0.02 + 0.005,
          phase: Math.random() * Math.PI * 2,
        });
      }
    },

    animate: function () {
      var self = this;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      var now = Date.now() * 0.001;

      this.stars.forEach(function (star) {
        var flicker = Math.sin(now * star.speed * 10 + star.phase) * 0.4 + 0.6;
        var alpha = star.opacity * flicker;

        self.ctx.beginPath();
        self.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        self.ctx.fillStyle = 'rgba(212, 160, 160, ' + alpha + ')';
        self.ctx.fill();

        self.ctx.beginPath();
        self.ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
        self.ctx.fillStyle = 'rgba(212, 160, 160, ' + alpha * 0.12 + ')';
        self.ctx.fill();
      });

      this.animId = requestAnimationFrame(function () {
        self.animate();
      });
    },
  };

  function buildGallery() {
    var grid = document.getElementById('gallery-grid');
    MEDIA.photos.forEach(function (photo, index) {
      var wrapper = document.createElement('div');
      wrapper.className = 'polaroid';
      wrapper.setAttribute('tabindex', '0');
      wrapper.setAttribute('role', 'button');
      wrapper.setAttribute('aria-label', 'Abrir ' + photo.alt);

      var imgWrapper = document.createElement('div');
      imgWrapper.className = 'polaroid__image-wrapper';

      var img = document.createElement('img');
      img.alt = photo.alt;
      img.loading = 'lazy';

      img.onerror = function () {
        img.src = generatePlaceholder(index);
      };

      img.src = photo.src;

      wrapper.style.transitionDelay = (index * 0.08) + 's';

      imgWrapper.appendChild(img);

      var caption = document.createElement('p');
      caption.className = 'polaroid__caption';
      caption.textContent = photo.caption;

      wrapper.appendChild(imgWrapper);
      wrapper.appendChild(caption);

      wrapper.addEventListener('click', function () {
        LightboxManager.open(index);
      });

      wrapper.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          LightboxManager.open(index);
        }
      });

      grid.appendChild(wrapper);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildGallery();
    ScrollReveal.init();
    LightboxManager.init();
    StarParticles.init();
  });
})();
