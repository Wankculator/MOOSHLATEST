/**
 * UI Components Module
 * Base component class and common UI components for MOOSH Wallet
 * Event-driven architecture with proper cleanup
 */

import { $ } from './element-factory.js';
import { stateManager } from './state-manager.js';

/**
 * Base Component Class
 * All UI components should extend this class
 */
export class Component {
    constructor(props = {}) {
        this.props = props;
        this.state = {};
        this.element = null;
        this.mounted = false;
        this.subscriptions = [];
        this.eventListeners = [];
        this.children = [];
    }

    /**
     * Set component state
     */
    setState(updates) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...updates };
        
        if (this.mounted && this.shouldUpdate(oldState, this.state)) {
            this.update();
        }
    }

    /**
     * Check if component should update
     */
    shouldUpdate(oldState, newState) {
        return JSON.stringify(oldState) !== JSON.stringify(newState);
    }

    /**
     * Subscribe to state changes
     */
    subscribe(key, callback) {
        const unsubscribe = stateManager.on(key, callback);
        this.subscriptions.push(unsubscribe);
        return unsubscribe;
    }

    /**
     * Add event listener with tracking
     */
    addEventListener(element, event, handler, options) {
        element.addEventListener(event, handler, options);
        this.eventListeners.push({ element, event, handler, options });
    }

    /**
     * Add child component
     */
    addChild(child) {
        this.children.push(child);
    }

    /**
     * Mount component
     */
    mount(container) {
        if (this.mounted) {
            console.warn('Component already mounted');
            return;
        }

        this.element = this.render();
        if (container && this.element) {
            container.appendChild(this.element);
        }

        this.mounted = true;
        this.afterMount();

        // Mount children
        this.children.forEach(child => {
            if (child.mount && !child.mounted) {
                child.mount();
            }
        });
    }

    /**
     * Update component
     */
    update() {
        if (!this.mounted || !this.element) return;

        const newElement = this.render();
        if (newElement && this.element.parentNode) {
            this.element.parentNode.replaceChild(newElement, this.element);
            this.element = newElement;
        }
    }

    /**
     * Unmount component
     */
    unmount() {
        if (!this.mounted) return;

        // Unmount children first
        this.children.forEach(child => {
            if (child.unmount) {
                child.unmount();
            }
        });

        // Clean up subscriptions
        this.subscriptions.forEach(unsubscribe => unsubscribe());
        this.subscriptions = [];

        // Clean up event listeners
        this.eventListeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        this.eventListeners = [];

        // Remove from DOM
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }

        this.beforeUnmount();
        this.mounted = false;
        this.element = null;
    }

    /**
     * Lifecycle methods (to be overridden)
     */
    render() {
        throw new Error('Component must implement render method');
    }

    afterMount() {
        // Override in subclass
    }

    beforeUnmount() {
        // Override in subclass
    }
}

/**
 * Button Component
 */
export class Button extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        if (this.props.disabled) return;
        
        if (this.props.onClick) {
            this.props.onClick(e);
        }
    }

    render() {
        const {
            label = '',
            variant = 'primary',
            size = 'medium',
            disabled = false,
            loading = false,
            icon = null,
            className = ''
        } = this.props;

        const classes = [
            'btn',
            `btn-${variant}`,
            `btn-${size}`,
            disabled ? 'btn-disabled' : '',
            loading ? 'btn-loading' : '',
            className
        ].filter(Boolean).join(' ');

        return $.button({
            className: classes,
            disabled: disabled || loading,
            onclick: this.handleClick,
            'aria-busy': loading
        }, [
            loading && $.span({ className: 'spinner' }),
            icon && $.span({ className: 'btn-icon' }, [icon]),
            label && $.span({ className: 'btn-label' }, [label])
        ]);
    }
}

/**
 * Modal Component
 */
export class Modal extends Component {
    constructor(props) {
        super(props);
        this.handleClose = this.handleClose.bind(this);
        this.handleBackdropClick = this.handleBackdropClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    afterMount() {
        // Add keyboard listener
        this.addEventListener(document, 'keydown', this.handleKeyDown);
        
        // Focus trap
        const focusableElements = this.element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    handleClose() {
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    handleBackdropClick(e) {
        if (e.target === e.currentTarget && this.props.closeOnBackdrop !== false) {
            this.handleClose();
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Escape' && this.props.closeOnEsc !== false) {
            this.handleClose();
        }
    }

    render() {
        const {
            title = '',
            content = null,
            footer = null,
            size = 'medium',
            className = ''
        } = this.props;

        return $.div({
            className: 'modal-backdrop',
            onclick: this.handleBackdropClick
        }, [
            $.div({
                className: `modal modal-${size} ${className}`,
                role: 'dialog',
                'aria-modal': 'true',
                'aria-labelledby': 'modal-title'
            }, [
                // Header
                $.div({ className: 'modal-header' }, [
                    $.h2({ id: 'modal-title', className: 'modal-title' }, [title]),
                    $.button({
                        className: 'modal-close',
                        onclick: this.handleClose,
                        'aria-label': 'Close modal'
                    }, ['×'])
                ]),
                
                // Content
                $.div({ className: 'modal-content' }, [content]),
                
                // Footer
                footer && $.div({ className: 'modal-footer' }, [footer])
            ])
        ]);
    }
}

/**
 * Loading Spinner Component
 */
export class LoadingSpinner extends Component {
    render() {
        const {
            size = 'medium',
            color = 'primary',
            text = ''
        } = this.props;

        return $.div({ className: `loading-spinner loading-${size}` }, [
            $.div({ className: `spinner spinner-${color}` }),
            text && $.p({ className: 'loading-text' }, [text])
        ]);
    }
}

/**
 * Toast Notification Component
 */
export class Toast extends Component {
    constructor(props) {
        super(props);
        this.autoCloseTimer = null;
    }

    afterMount() {
        if (this.props.autoClose !== false) {
            const duration = this.props.duration || 5000;
            this.autoCloseTimer = setTimeout(() => {
                this.close();
            }, duration);
        }
    }

    beforeUnmount() {
        if (this.autoCloseTimer) {
            clearTimeout(this.autoCloseTimer);
        }
    }

    close() {
        if (this.props.onClose) {
            this.props.onClose();
        }
        this.unmount();
    }

    render() {
        const {
            type = 'info',
            title = '',
            message = '',
            icon = null
        } = this.props;

        return $.div({ 
            className: `toast toast-${type}`,
            role: 'alert'
        }, [
            icon && $.span({ className: 'toast-icon' }, [icon]),
            $.div({ className: 'toast-content' }, [
                title && $.h4({ className: 'toast-title' }, [title]),
                message && $.p({ className: 'toast-message' }, [message])
            ]),
            $.button({
                className: 'toast-close',
                onclick: () => this.close(),
                'aria-label': 'Close notification'
            }, ['×'])
        ]);
    }
}

/**
 * Input Component
 */
export class Input extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        
        this.state = {
            focused: false,
            touched: false
        };
    }

    handleChange(e) {
        if (this.props.onChange) {
            this.props.onChange(e.target.value, e);
        }
    }

    handleFocus(e) {
        this.setState({ focused: true });
        if (this.props.onFocus) {
            this.props.onFocus(e);
        }
    }

    handleBlur(e) {
        this.setState({ focused: false, touched: true });
        if (this.props.onBlur) {
            this.props.onBlur(e);
        }
    }

    render() {
        const {
            type = 'text',
            value = '',
            placeholder = '',
            label = '',
            error = '',
            disabled = false,
            required = false,
            className = ''
        } = this.props;

        const hasError = error && this.state.touched;

        return $.div({ className: `input-group ${className}` }, [
            label && $.label({ className: 'input-label' }, [
                label,
                required && $.span({ className: 'required' }, ['*'])
            ]),
            
            $.input({
                type,
                value,
                placeholder,
                disabled,
                required,
                className: `input ${hasError ? 'input-error' : ''}`,
                onchange: this.handleChange,
                onfocus: this.handleFocus,
                onblur: this.handleBlur,
                'aria-invalid': hasError,
                'aria-describedby': hasError ? 'input-error' : undefined
            }),
            
            hasError && $.span({ 
                id: 'input-error',
                className: 'input-error-message' 
            }, [error])
        ]);
    }
}

/**
 * Tab Component
 */
export class Tabs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: props.defaultTab || 0
        };
    }

    selectTab(index) {
        this.setState({ activeTab: index });
        if (this.props.onChange) {
            this.props.onChange(index);
        }
    }

    render() {
        const { tabs = [] } = this.props;
        const { activeTab } = this.state;

        return $.div({ className: 'tabs' }, [
            // Tab headers
            $.div({ className: 'tab-headers', role: 'tablist' }, 
                tabs.map((tab, index) => 
                    $.button({
                        className: `tab-header ${activeTab === index ? 'active' : ''}`,
                        role: 'tab',
                        'aria-selected': activeTab === index,
                        onclick: () => this.selectTab(index)
                    }, [tab.label])
                )
            ),
            
            // Tab content
            $.div({ className: 'tab-content', role: 'tabpanel' }, [
                tabs[activeTab]?.content
            ])
        ]);
    }
}

/**
 * Dropdown Component
 */
export class Dropdown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false
        };
        
        this.handleToggle = this.handleToggle.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    afterMount() {
        if (this.state.isOpen) {
            this.addEventListener(document, 'click', this.handleClickOutside);
        }
    }

    handleToggle() {
        const newState = !this.state.isOpen;
        this.setState({ isOpen: newState });
        
        if (newState) {
            setTimeout(() => {
                this.addEventListener(document, 'click', this.handleClickOutside);
            }, 0);
        }
    }

    handleClickOutside(e) {
        if (this.element && !this.element.contains(e.target)) {
            this.setState({ isOpen: false });
        }
    }

    render() {
        const {
            trigger = 'Options',
            items = [],
            className = ''
        } = this.props;
        
        const { isOpen } = this.state;

        return $.div({ className: `dropdown ${className}` }, [
            $.button({
                className: 'dropdown-trigger',
                onclick: this.handleToggle,
                'aria-expanded': isOpen
            }, [trigger]),
            
            isOpen && $.div({ className: 'dropdown-menu' },
                items.map(item => 
                    $.button({
                        className: 'dropdown-item',
                        onclick: () => {
                            if (item.onClick) item.onClick();
                            this.setState({ isOpen: false });
                        },
                        disabled: item.disabled
                    }, [item.label])
                )
            )
        ]);
    }
}

// Export all components
export default {
    Component,
    Button,
    Modal,
    LoadingSpinner,
    Toast,
    Input,
    Tabs,
    Dropdown
};