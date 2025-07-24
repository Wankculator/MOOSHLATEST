# Animation and Transition Guide

**Component**: UI Animations & Transitions
**Type**: Development Guide
**Critical**: NO
**Last Updated**: 2025-01-21

## Overview

This guide documents all animation and transition patterns used in MOOSH Wallet, including CSS transitions, loading states, and performance considerations.

## Core Animation System

### CSS Variables

```css
/* Animation duration variables */
:root {
    --animation-duration-fast: 150ms;
    --animation-duration-normal: 300ms;
    --animation-duration-slow: 500ms;
    --animation-duration-very-slow: 1000ms;
    
    /* Easing functions */
    --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
    --ease-in-out-expo: cubic-bezier(0.87, 0, 0.13, 1);
    --ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
    --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
    
    /* Spring physics */
    --spring-duration: 800ms;
    --spring-easing: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
    :root {
        --animation-duration-fast: 0.001ms;
        --animation-duration-normal: 0.001ms;
        --animation-duration-slow: 0.001ms;
        --animation-duration-very-slow: 0.001ms;
    }
}
```

### JavaScript Animation Controller

```javascript
class AnimationController {
    constructor() {
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.animationFrame = null;
    }
    
    animate(element, properties, options = {}) {
        const {
            duration = 300,
            easing = 'ease-out',
            delay = 0,
            onComplete = null
        } = options;
        
        if (this.prefersReducedMotion) {
            // Apply final state immediately
            Object.assign(element.style, properties);
            if (onComplete) onComplete();
            return;
        }
        
        // Set transition
        element.style.transition = `all ${duration}ms ${easing} ${delay}ms`;
        
        // Apply properties
        requestAnimationFrame(() => {
            Object.assign(element.style, properties);
        });
        
        // Handle completion
        setTimeout(() => {
            element.style.transition = '';
            if (onComplete) onComplete();
        }, duration + delay);
    }
    
    spring(element, properties, options = {}) {
        const {
            stiffness = 100,
            damping = 10,
            mass = 1,
            onComplete = null
        } = options;
        
        if (this.prefersReducedMotion) {
            Object.assign(element.style, properties);
            if (onComplete) onComplete();
            return;
        }
        
        // Spring physics animation
        const springAnimation = new SpringAnimation(element, properties, {
            stiffness,
            damping,
            mass
        });
        
        springAnimation.start(onComplete);
    }
}
```

## Common Animations

### Button Hover Effects

```css
/* Base button transitions */
.button {
    transition: all var(--animation-duration-fast) var(--ease-out-expo);
    transform: translateY(0);
}

.button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(245, 115, 21, 0.3);
}

.button:active {
    transform: translateY(0);
    transition-duration: 50ms;
}

/* Glow effect */
.button-glow {
    position: relative;
    overflow: hidden;
}

.button-glow::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: translate(-50%, -50%);
    transition: width var(--animation-duration-slow), 
                height var(--animation-duration-slow);
}

.button-glow:hover::before {
    width: 300px;
    height: 300px;
}
```

### Modal Animations

```javascript
class ModalAnimation {
    static show(modal) {
        // Backdrop fade
        const backdrop = modal.querySelector('.modal-backdrop');
        backdrop.style.opacity = '0';
        backdrop.style.display = 'block';
        
        // Modal scale and fade
        const content = modal.querySelector('.modal-content');
        content.style.transform = 'scale(0.7)';
        content.style.opacity = '0';
        
        requestAnimationFrame(() => {
            backdrop.style.transition = 'opacity 300ms ease-out';
            backdrop.style.opacity = '1';
            
            content.style.transition = 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)';
            content.style.transform = 'scale(1)';
            content.style.opacity = '1';
        });
    }
    
    static hide(modal, onComplete) {
        const backdrop = modal.querySelector('.modal-backdrop');
        const content = modal.querySelector('.modal-content');
        
        content.style.transition = 'all 200ms ease-in';
        content.style.transform = 'scale(0.9)';
        content.style.opacity = '0';
        
        backdrop.style.transition = 'opacity 200ms ease-in';
        backdrop.style.opacity = '0';
        
        setTimeout(() => {
            backdrop.style.display = 'none';
            if (onComplete) onComplete();
        }, 200);
    }
}
```

### Page Transitions

```javascript
class PageTransition {
    static async fadeTransition(oldPage, newPage) {
        // Prepare new page
        newPage.style.opacity = '0';
        newPage.style.display = 'block';
        
        // Fade out old page
        oldPage.style.transition = 'opacity 200ms ease-out';
        oldPage.style.opacity = '0';
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Hide old page
        oldPage.style.display = 'none';
        
        // Fade in new page
        newPage.style.transition = 'opacity 200ms ease-in';
        newPage.style.opacity = '1';
    }
    
    static async slideTransition(oldPage, newPage, direction = 'left') {
        const distance = direction === 'left' ? '-100%' : '100%';
        
        // Position new page
        newPage.style.transform = `translateX(${direction === 'left' ? '100%' : '-100%'})`;
        newPage.style.display = 'block';
        
        // Animate both pages
        requestAnimationFrame(() => {
            oldPage.style.transition = 'transform 300ms ease-in-out';
            newPage.style.transition = 'transform 300ms ease-in-out';
            
            oldPage.style.transform = `translateX(${distance})`;
            newPage.style.transform = 'translateX(0)';
        });
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Cleanup
        oldPage.style.display = 'none';
        oldPage.style.transform = '';
        newPage.style.transform = '';
    }
}
```

## Loading States

### Spinner Animation

```css
/* Pure CSS spinner */
.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(245, 115, 21, 0.2);
    border-top-color: #f57315;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Pulsing dot loader */
.dot-loader {
    display: flex;
    gap: 8px;
}

.dot-loader .dot {
    width: 10px;
    height: 10px;
    background: #f57315;
    border-radius: 50%;
    animation: pulse 1.4s ease-in-out infinite both;
}

.dot-loader .dot:nth-child(1) { animation-delay: -0.32s; }
.dot-loader .dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes pulse {
    0%, 80%, 100% {
        transform: scale(0);
        opacity: 0.5;
    }
    40% {
        transform: scale(1);
        opacity: 1;
    }
}
```

### Progress Bar Animation

```javascript
class ProgressBar {
    constructor(element) {
        this.element = element;
        this.bar = element.querySelector('.progress-bar-fill');
        this.text = element.querySelector('.progress-text');
    }
    
    update(progress, animated = true) {
        const percentage = Math.min(100, Math.max(0, progress));
        
        if (animated) {
            this.bar.style.transition = 'width 300ms ease-out';
        } else {
            this.bar.style.transition = 'none';
        }
        
        this.bar.style.width = `${percentage}%`;
        
        if (this.text) {
            this.animateNumber(this.text, percentage);
        }
    }
    
    animateNumber(element, target) {
        const current = parseInt(element.textContent) || 0;
        const difference = target - current;
        const duration = 300;
        const steps = 30;
        const increment = difference / steps;
        let step = 0;
        
        const timer = setInterval(() => {
            step++;
            const value = Math.round(current + (increment * step));
            element.textContent = `${value}%`;
            
            if (step >= steps) {
                clearInterval(timer);
                element.textContent = `${target}%`;
            }
        }, duration / steps);
    }
}
```

### Skeleton Loading

```css
/* Skeleton screen animation */
.skeleton {
    background: linear-gradient(
        90deg,
        rgba(245, 115, 21, 0.1) 25%,
        rgba(245, 115, 21, 0.2) 50%,
        rgba(245, 115, 21, 0.1) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* Usage */
.wallet-card-skeleton {
    height: 120px;
    border-radius: 8px;
    margin-bottom: 10px;
}

.text-skeleton {
    height: 16px;
    width: 60%;
    margin-bottom: 8px;
    border-radius: 4px;
}
```

## Scroll Animations

### Smooth Scrolling

```javascript
class SmoothScroll {
    static scrollTo(target, options = {}) {
        const {
            duration = 600,
            offset = 0,
            easing = this.easeInOutCubic
        } = options;
        
        const targetElement = typeof target === 'string' 
            ? document.querySelector(target) 
            : target;
            
        if (!targetElement) return;
        
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            window.scrollTo(0, startPosition + distance * easing(progress));
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }
        
        requestAnimationFrame(animation);
    }
    
    static easeInOutCubic(t) {
        return t < 0.5 
            ? 4 * t * t * t 
            : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
}
```

### Parallax Effects

```javascript
class ParallaxController {
    constructor() {
        this.elements = [];
        this.ticking = false;
        
        window.addEventListener('scroll', () => this.requestTick());
    }
    
    add(element, speed = 0.5) {
        this.elements.push({ element, speed });
    }
    
    requestTick() {
        if (!this.ticking) {
            requestAnimationFrame(() => this.updateElements());
            this.ticking = true;
        }
    }
    
    updateElements() {
        const scrolled = window.pageYOffset;
        
        this.elements.forEach(({ element, speed }) => {
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
        
        this.ticking = false;
    }
}
```

## Micro-interactions

### Copy Feedback

```javascript
class CopyAnimation {
    static async animate(button) {
        const originalText = button.textContent;
        
        // Immediate feedback
        button.classList.add('copied');
        button.textContent = 'Copied!';
        
        // Ripple effect
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        button.appendChild(ripple);
        
        // Remove ripple after animation
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
        
        // Reset after delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        button.classList.remove('copied');
        button.textContent = originalText;
    }
}

/* CSS for ripple */
.ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 600ms ease-out;
}

@keyframes ripple-animation {
    to {
        transform: scale(4);
        opacity: 0;
    }
}
```

### Toggle Animations

```javascript
class ToggleSwitch {
    constructor(element) {
        this.element = element;
        this.thumb = element.querySelector('.toggle-thumb');
        this.isOn = false;
    }
    
    toggle() {
        this.isOn = !this.isOn;
        
        if (this.isOn) {
            this.element.classList.add('on');
            this.thumb.style.transform = 'translateX(20px)';
            
            // Subtle bounce
            this.thumb.style.animation = 'bounce 300ms ease-out';
        } else {
            this.element.classList.remove('on');
            this.thumb.style.transform = 'translateX(0)';
        }
    }
}

/* CSS */
.toggle-switch {
    width: 44px;
    height: 24px;
    background: #ccc;
    border-radius: 12px;
    position: relative;
    transition: background-color 200ms ease-out;
}

.toggle-switch.on {
    background: #f57315;
}

.toggle-thumb {
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 200ms ease-out;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

@keyframes bounce {
    0% { transform: translateX(20px) scale(1); }
    50% { transform: translateX(20px) scale(1.1); }
    100% { transform: translateX(20px) scale(1); }
}
```

## Performance Optimization

### Animation Frame Management

```javascript
class AnimationFrameManager {
    constructor() {
        this.animations = new Map();
        this.running = false;
    }
    
    add(id, callback) {
        this.animations.set(id, callback);
        if (!this.running) {
            this.start();
        }
    }
    
    remove(id) {
        this.animations.delete(id);
        if (this.animations.size === 0) {
            this.stop();
        }
    }
    
    start() {
        this.running = true;
        this.tick();
    }
    
    stop() {
        this.running = false;
    }
    
    tick() {
        if (!this.running) return;
        
        this.animations.forEach(callback => callback());
        requestAnimationFrame(() => this.tick());
    }
}
```

### GPU Acceleration

```css
/* Force GPU acceleration */
.gpu-accelerated {
    transform: translateZ(0);
    will-change: transform;
}

/* Only during animation */
.animating {
    will-change: transform, opacity;
}

/* Clean up after animation */
.animation-complete {
    will-change: auto;
}
```

### Debounced Animations

```javascript
class DebouncedAnimation {
    constructor(element, animationFn, delay = 150) {
        this.element = element;
        this.animationFn = animationFn;
        this.delay = delay;
        this.timeout = null;
    }
    
    trigger() {
        clearTimeout(this.timeout);
        
        this.timeout = setTimeout(() => {
            this.animationFn(this.element);
        }, this.delay);
    }
}
```

## Accessibility Considerations

### Respecting Motion Preferences

```javascript
class AccessibleAnimations {
    static setup() {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        // Initial check
        this.updateAnimations(mediaQuery.matches);
        
        // Listen for changes
        mediaQuery.addEventListener('change', (e) => {
            this.updateAnimations(e.matches);
        });
    }
    
    static updateAnimations(reducedMotion) {
        if (reducedMotion) {
            document.documentElement.classList.add('reduce-motion');
            console.log('Animations reduced for accessibility');
        } else {
            document.documentElement.classList.remove('reduce-motion');
        }
    }
}

/* CSS */
.reduce-motion * {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
}
```

### Focus Indicators

```css
/* Animated focus ring */
.button:focus {
    outline: none;
    box-shadow: 0 0 0 0 rgba(245, 115, 21, 0.5);
    animation: focus-ring 300ms ease-out forwards;
}

@keyframes focus-ring {
    to {
        box-shadow: 0 0 0 3px rgba(245, 115, 21, 0.5);
    }
}
```

## Common Animation Patterns

### Stagger Animation

```javascript
class StaggerAnimation {
    static animate(elements, delay = 50) {
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'all 300ms ease-out';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * delay);
        });
    }
}
```

### Number Counter

```javascript
class NumberCounter {
    static count(element, start, end, duration = 1000) {
        const range = end - start;
        const increment = range / (duration / 16); // 60fps
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            
            if ((increment > 0 && current >= end) || 
                (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            
            element.textContent = Math.round(current).toLocaleString();
        }, 16);
    }
}
```

## Testing Animations

```javascript
// Test animation performance
describe('Animation Performance', () => {
    it('should complete within target duration', (done) => {
        const element = document.createElement('div');
        const startTime = performance.now();
        
        AnimationController.animate(element, {
            opacity: '1',
            transform: 'translateX(100px)'
        }, {
            duration: 300,
            onComplete: () => {
                const endTime = performance.now();
                const actualDuration = endTime - startTime;
                
                expect(actualDuration).toBeCloseTo(300, -2);
                done();
            }
        });
    });
});
```

## Related Documentation
- Performance Optimization: `/documentation/components/core/PerformanceOptimizationGuide.md`
- Mobile Implementation: `/documentation/components/core/MobileImplementationGuide.md`
- UI Sections: `/documentation/components/ui-sections/`