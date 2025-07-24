// MOOSH WALLET - Base Modal Module
// Provides common functionality for all modal dialogs
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class ModalBase {
        constructor(app) {
            this.app = app;
            this.modal = null;
            this.overlay = null;
        }

        show() {
            if (this.overlay) {
                document.body.appendChild(this.overlay);
                // Trigger animation
                setTimeout(() => {
                    this.overlay.classList.add('show');
                }, 10);
            }
        }

        close() {
            if (this.overlay) {
                this.overlay.classList.remove('show');
                setTimeout(() => {
                    if (this.overlay && this.overlay.parentNode) {
                        this.overlay.parentNode.removeChild(this.overlay);
                    }
                    this.overlay = null;
                    this.modal = null;
                }, 300); // Match CSS transition time
            }
        }

        createOverlay(content) {
            const $ = window.ElementFactory || window.$;
            
            this.overlay = $.div({ 
                className: 'modal-overlay',
                onclick: (e) => {
                    if (e.target.className === 'modal-overlay') {
                        this.close();
                    }
                }
            }, [content]);
            
            return this.overlay;
        }

        createHeader(title, showClose = true) {
            const $ = window.ElementFactory || window.$;
            
            const headerElements = [
                $.h2({ className: 'modal-title' }, [
                    $.span({ className: 'text-dim' }, ['<']),
                    ` ${title} `,
                    $.span({ className: 'text-dim' }, ['/>'])
                ])
            ];
            
            if (showClose) {
                headerElements.push(
                    $.button({
                        className: 'modal-close',
                        onclick: () => this.close()
                    }, ['×'])
                );
            }
            
            return $.div({ className: 'modal-header' }, headerElements);
        }

        createFooter(buttons) {
            const $ = window.ElementFactory || window.$;
            
            return $.div({ className: 'modal-footer' }, buttons.map(btn => {
                return $.button({
                    className: btn.className || 'btn btn-secondary',
                    onclick: btn.onClick
                }, [btn.text]);
            }));
        }

        addModalStyles() {
            if (document.getElementById('modal-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'modal-styles';
            style.textContent = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                .modal-overlay.show {
                    opacity: 1;
                }
                
                .modal-container {
                    background: var(--bg-primary);
                    border: 2px solid var(--text-primary);
                    border-radius: 0;
                    width: 90%;
                    max-width: 600px;
                    max-height: 80vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    transform: scale(0.9);
                    transition: transform 0.3s ease;
                }
                
                .modal-overlay.show .modal-container {
                    transform: scale(1);
                }
                
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: calc(20px * var(--scale-factor));
                    border-bottom: 1px solid var(--border-color);
                }
                
                .modal-title {
                    font-size: calc(20px * var(--scale-factor));
                    margin: 0;
                    color: var(--text-primary);
                }
                
                .modal-close {
                    background: transparent;
                    border: none;
                    color: var(--text-dim);
                    font-size: calc(24px * var(--scale-factor));
                    cursor: pointer;
                    padding: 0;
                    width: calc(30px * var(--scale-factor));
                    height: calc(30px * var(--scale-factor));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .modal-close:hover {
                    color: var(--text-primary);
                }
                
                .modal-content {
                    flex: 1;
                    padding: calc(20px * var(--scale-factor));
                    overflow-y: auto;
                }
                
                .modal-footer {
                    display: flex;
                    gap: calc(10px * var(--scale-factor));
                    padding: calc(20px * var(--scale-factor));
                    border-top: 1px solid var(--border-color);
                    justify-content: flex-end;
                }
                
                .modal-footer .btn {
                    padding: calc(10px * var(--scale-factor)) calc(20px * var(--scale-factor));
                }
                
                .modal-footer .btn.full-width {
                    width: 100%;
                }
            `;
            
            document.head.appendChild(style);
        }
    }

    // Make available globally
    window.ModalBase = ModalBase;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.ModalBase = ModalBase;
    }

})(window);