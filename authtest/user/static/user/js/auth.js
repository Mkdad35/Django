function storeTokens(accessToken, refreshToken, accessExpiry) {
    const expiryDate = accessExpiry * 1000; // Calculate expiry date in milliseconds
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('accessExpiry', expiryDate); // Store the calculated expiry date
}

function getAccessToken() {
    return localStorage.getItem('accessToken');
}

function getRefreshToken() {
    return localStorage.getItem('refreshToken');
}

function getAccessExpiry() {
    return parseInt(localStorage.getItem('accessExpiry'), 10);
}

async function refreshAccessToken() {
    console.log("DONE")
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        console.error("No refresh token available. Please log in again.");
        logoutUser();
        return null;
    }

    try {
        console.log(refreshToken)
        const response = await fetch('http://localhost:8000/user/api/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (response.ok) {
            const data = await response.json();
            const newAccessToken = data.access;
            const newAccessExpiry = data.access_expiry; // Lifetime in seconds
            console.log("Refresh:" , newAccessExpiry)
            // Store the new tokens and expiry date
            storeTokens(newAccessToken, refreshToken, newAccessExpiry);
            console.log("Access",getAccessToken())
            return newAccessToken;
        } else {
            console.error("Refresh token expired or invalid.");
            logoutUser();
            return null;
        }
        
    } catch (error) {
        console.error("Failed to refresh access token:", error);
        logoutUser();
        return null;
    }
}

async function fetchWithAuth(url, options = {}) {
    const accessExpiry = getAccessExpiry();
    console.log("IN here" , new Date(accessExpiry) , "      " , accessExpiry)

    // Check if the access token is expired
    if (Date.now() >= accessExpiry) {
        console.error("Access token has expired. Redirecting to login.");
        logoutUser();
        return;
    }

    // Refresh the access token if it's about to expire within the next 5 minutes
    if (Date.now() >= getAccessExpiry() - 30000) { //- 5 * 60 * 1000
        console.log("I'm here" , new Date(accessExpiry) , "      " , accessExpiry)
        const refreshedToken = await refreshAccessToken();
        if (!refreshedToken) {
            console.error("Unable to refresh access token. Redirecting to login.");
            logoutUser();
            return;
        }
    }

    // Add Authorization header with the latest access token
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${getAccessToken()}`,
    };

    // Proceed with the request to the server
    return fetch(url, options);
}

function setupTokenRefreshInterval() {
    setInterval(async () => {
        const accessExpiry = getAccessExpiry();
        if (Date.now() >= accessExpiry - 5 * 60 * 1000) {
            await refreshAccessToken();
        }
    }, 25 * 60 * 1000); // Every 25 minutes 25 * 60 * 1000
}

function setupTokenDestroyer() {
    setInterval(async () => {
        const accessExpiry = getAccessExpiry();
        if (Date.now() >= accessExpiry - 10000){
        //if (Date.now() >= accessExpiry - 5 * 60 * 1000) {
            logoutUser();
        }
        //}
    }, 15000); // Every 25 minutes 25 * 60 * 1000
}

function logoutUser() {
    localStorage.removeItem('accessToken');
    //localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessExpiry'); // Clear access expiry on logout
    window.location.href = 'http://localhost:8000/user/login'; // Redirect to login
}

document.addEventListener('DOMContentLoaded', () => {
    setupTokenRefreshInterval();
    setupTokenDestroyer();
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IF THE USER CLOSED THE BROWSER
// Function to clear tokens from localStorage
// Cleanup function to remove tokens
function clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessExpiry');
    localStorage.removeItem('openTabs')
}


// Increment or initialize tab count when a tab is opened
function initializeTab() {
    const openTabs = parseInt(localStorage.getItem('openTabs') || '0', 10);
    localStorage.setItem('openTabs', openTabs + 1);
}

// Decrement tab count when a tab is closed, and clear tokens if it’s the last tab
// Decrement openTabs and clear tokens when all tabs are closed
function handleTabClose() {
    const openTabs = parseInt(localStorage.getItem('openTabs') || '0', 10);
    if (openTabs <= 1) {
        // Last tab is closing, clear tokens
        clearTokens();
    } else {
        localStorage.setItem('openTabs', openTabs - 1);
    }
}


// Sync tab count across tabs using the storage event
// Set up a listener for `storage` events (triggered across all tabs)
// window.addEventListener('beforeunload', () => {
//     navigator.sendBeacon('/clear-tokens/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ token: getRefreshToken() }),
//     });
//     clearTokens();
// });


// Function to initialize tab count
function initializeTab() {
    const openTabs = parseInt(localStorage.getItem('openTabs') || '0', 10);
    localStorage.setItem('openTabs', openTabs + 1);  // Increment when a new tab is opened
}

// Initialize the tab count when the app is loaded
initializeTab();

// Detect when the tab is being closed (beforeunload)
window.addEventListener('beforeunload', () => {
    handleTabClose();

});


////////////////////////////////////////////////////////////////////////////////////////////////////////////