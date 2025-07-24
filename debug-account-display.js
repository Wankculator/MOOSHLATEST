// Debug script to check AccountSwitcher issues
console.log('=== AccountSwitcher Debug ===');

// Check if we're on dashboard
console.log('Current page:', window.location.href);

// Check if AccountSwitcher container exists
const container = document.getElementById('accountSwitcherContainer');
console.log('Container exists:', !!container);
if (container) {
    console.log('Container HTML:', container.innerHTML);
    console.log('Container children:', container.children.length);
}

// Check app state
if (window.app) {
    console.log('App exists:', true);
    console.log('Accounts:', window.app.state.getAccounts());
    console.log('Current account:', window.app.state.getCurrentAccount());
    
    // Check if AccountSwitcher exists
    if (window.app.dashboard) {
        console.log('Dashboard exists:', true);
        console.log('AccountSwitcher:', window.app.dashboard.accountSwitcher);
    }
}

// Check button scaling
const addAccountBtn = document.querySelector('.dashboard-btn');
if (addAccountBtn) {
    const styles = window.getComputedStyle(addAccountBtn);
    console.log('Button styles:', {
        fontSize: styles.fontSize,
        padding: styles.padding,
        height: styles.height,
        minWidth: styles.minWidth
    });
}