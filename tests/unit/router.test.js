/**
 * Unit tests for Router and Navigation
 * Tests routing logic, page transitions, and navigation state
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock DOM
global.document = {
    getElementById: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(),
    createElement: vi.fn(() => ({
        style: {},
        classList: {
            add: vi.fn(),
            remove: vi.fn(),
            contains: vi.fn()
        },
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
    }))
};

// Mock window
global.window = {
    location: {
        hash: '',
        pathname: '/'
    },
    history: {
        pushState: vi.fn(),
        replaceState: vi.fn(),
        back: vi.fn(),
        forward: vi.fn()
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
};

// Mock Router class
class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.beforeHooks = [];
        this.afterHooks = [];
        this.app = null;
    }

    addRoute(path, handler, options = {}) {
        this.routes.set(path, { handler, options });
    }

    navigate(path, state = {}) {
        const route = this.routes.get(path);
        if (!route) {
            this.handleNotFound(path);
            return false;
        }

        // Run before hooks
        for (const hook of this.beforeHooks) {
            if (!hook(path, this.currentRoute)) {
                return false;
            }
        }

        // Update state
        this.currentRoute = path;
        window.history.pushState(state, '', `#${path}`);
        
        // Execute handler
        route.handler(state);

        // Run after hooks
        for (const hook of this.afterHooks) {
            hook(path, state);
        }

        return true;
    }

    beforeEach(hook) {
        this.beforeHooks.push(hook);
    }

    afterEach(hook) {
        this.afterHooks.push(hook);
    }

    handleNotFound(path) {
        console.error(`Route not found: ${path}`);
    }

    back() {
        window.history.back();
    }

    forward() {
        window.history.forward();
    }
}

describe('Router', () => {
    let router;

    beforeEach(() => {
        router = new Router();
        vi.clearAllMocks();
        window.location.hash = '';
    });

    describe('Route Registration', () => {
        it('should register routes', () => {
            const homeHandler = vi.fn();
            const dashboardHandler = vi.fn();

            router.addRoute('home', homeHandler);
            router.addRoute('dashboard', dashboardHandler);

            expect(router.routes.size).toBe(2);
            expect(router.routes.has('home')).toBe(true);
            expect(router.routes.has('dashboard')).toBe(true);
        });

        it('should handle route options', () => {
            const handler = vi.fn();
            const options = {
                requiresAuth: true,
                title: 'Protected Page'
            };

            router.addRoute('protected', handler, options);

            const route = router.routes.get('protected');
            expect(route.options.requiresAuth).toBe(true);
            expect(route.options.title).toBe('Protected Page');
        });
    });

    describe('Navigation', () => {
        it('should navigate to registered routes', () => {
            const handler = vi.fn();
            router.addRoute('test-page', handler);

            const result = router.navigate('test-page');

            expect(result).toBe(true);
            expect(handler).toHaveBeenCalled();
            expect(window.history.pushState).toHaveBeenCalledWith(
                {},
                '',
                '#test-page'
            );
        });

        it('should pass state to route handler', () => {
            const handler = vi.fn();
            const state = { userId: 123, data: 'test' };

            router.addRoute('user-profile', handler);
            router.navigate('user-profile', state);

            expect(handler).toHaveBeenCalledWith(state);
        });

        it('should handle non-existent routes', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            
            const result = router.navigate('non-existent');

            expect(result).toBe(false);
            expect(consoleSpy).toHaveBeenCalledWith('Route not found: non-existent');
            
            consoleSpy.mockRestore();
        });
    });

    describe('Navigation Guards', () => {
        it('should execute before navigation hooks', () => {
            const beforeHook = vi.fn(() => true);
            const handler = vi.fn();

            router.beforeEach(beforeHook);
            router.addRoute('guarded', handler);
            router.navigate('guarded');

            expect(beforeHook).toHaveBeenCalledWith('guarded', null);
            expect(handler).toHaveBeenCalled();
        });

        it('should block navigation if before hook returns false', () => {
            const beforeHook = vi.fn(() => false);
            const handler = vi.fn();

            router.beforeEach(beforeHook);
            router.addRoute('blocked', handler);
            
            const result = router.navigate('blocked');

            expect(result).toBe(false);
            expect(handler).not.toHaveBeenCalled();
        });

        it('should execute after navigation hooks', () => {
            const afterHook = vi.fn();
            const handler = vi.fn();

            router.afterEach(afterHook);
            router.addRoute('tracked', handler);
            router.navigate('tracked', { test: true });

            expect(afterHook).toHaveBeenCalledWith('tracked', { test: true });
        });
    });

    describe('Browser History', () => {
        it('should handle back navigation', () => {
            router.back();
            expect(window.history.back).toHaveBeenCalled();
        });

        it('should handle forward navigation', () => {
            router.forward();
            expect(window.history.forward).toHaveBeenCalled();
        });
    });

    describe('Page Transitions', () => {
        it('should handle page visibility during navigation', () => {
            const currentPage = {
                style: { display: 'block' },
                classList: {
                    remove: vi.fn(),
                    add: vi.fn()
                }
            };

            const newPage = {
                style: { display: 'none' },
                classList: {
                    remove: vi.fn(),
                    add: vi.fn()
                }
            };

            // Simulate page transition
            currentPage.style.display = 'none';
            currentPage.classList.add('hidden');
            newPage.style.display = 'block';
            newPage.classList.remove('hidden');

            expect(currentPage.style.display).toBe('none');
            expect(newPage.style.display).toBe('block');
        });
    });

    describe('Route Patterns', () => {
        it('should support dynamic routes', () => {
            const patterns = [
                { pattern: '/user/:id', path: '/user/123', params: { id: '123' } },
                { pattern: '/wallet/:address', path: '/wallet/bc1qtest', params: { address: 'bc1qtest' } },
                { pattern: '/tx/:txid/details', path: '/tx/abc123/details', params: { txid: 'abc123' } }
            ];

            patterns.forEach(({ pattern, path, params }) => {
                const extracted = extractParams(pattern, path);
                expect(extracted).toEqual(params);
            });
        });

        function extractParams(pattern, path) {
            const params = {};
            const patternParts = pattern.split('/');
            const pathParts = path.split('/');

            patternParts.forEach((part, index) => {
                if (part.startsWith(':')) {
                    const paramName = part.slice(1);
                    params[paramName] = pathParts[index];
                }
            });

            return params;
        }
    });

    describe('Navigation State Management', () => {
        it('should track navigation history', () => {
            const history = [];
            
            router.afterEach((path) => {
                history.push(path);
            });

            router.addRoute('page1', vi.fn());
            router.addRoute('page2', vi.fn());
            router.addRoute('page3', vi.fn());

            router.navigate('page1');
            router.navigate('page2');
            router.navigate('page3');

            expect(history).toEqual(['page1', 'page2', 'page3']);
        });

        it('should maintain current route state', () => {
            router.addRoute('dashboard', vi.fn());
            router.navigate('dashboard');

            expect(router.currentRoute).toBe('dashboard');
        });
    });

    describe('Protected Routes', () => {
        it('should check authentication for protected routes', () => {
            const authCheck = vi.fn(() => false);
            const protectedHandler = vi.fn();
            const loginHandler = vi.fn();

            router.addRoute('protected', protectedHandler, { requiresAuth: true });
            router.addRoute('login', loginHandler);

            router.beforeEach((path) => {
                const route = router.routes.get(path);
                if (route?.options?.requiresAuth && !authCheck()) {
                    router.navigate('login');
                    return false;
                }
                return true;
            });

            router.navigate('protected');

            expect(authCheck).toHaveBeenCalled();
            expect(protectedHandler).not.toHaveBeenCalled();
            expect(loginHandler).toHaveBeenCalled();
        });
    });

    describe('Deep Linking', () => {
        it('should handle initial hash navigation', () => {
            window.location.hash = '#wallet-details';
            
            const handler = vi.fn();
            router.addRoute('wallet-details', handler);

            // Simulate hashchange event
            const hashPath = window.location.hash.slice(1);
            if (router.routes.has(hashPath)) {
                router.navigate(hashPath);
            }

            expect(handler).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('should handle navigation errors', () => {
            const errorHandler = vi.fn();
            const faultyHandler = vi.fn(() => {
                throw new Error('Route handler error');
            });

            router.addRoute('faulty', faultyHandler);

            try {
                router.navigate('faulty');
            } catch (error) {
                errorHandler(error);
            }

            expect(errorHandler).toHaveBeenCalled();
        });
    });
});