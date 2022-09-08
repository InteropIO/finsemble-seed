// Sets a MutationObserver to automatically click the "Unread" filter button in the NotificationsCenter

// The DOM node to watch
const targetNode = document.querySelector("#notifications-center-container");

// The observer options (need childList and subtree, attributes is not necessary)
const observerOptions = {
    // Be sure to watch for children and subtree
    childList: true,
    attributes: false,
    subtree: true
}

// Create the observer
const observer = new MutationObserver((mutationList) => {
    mutationList.forEach((mutation) => {
        // Check for added nodes
        if (!!mutation.addedNodes?.length) {
            // Check to see if the filter buttons exist (querySelectorAll is easier to search than traversing the mutation.addedNodes)
            const filterButtons = Array.prototype.slice.call(document.querySelectorAll('.notifications-center-controls__filter-btn'));

            // If the filter buttons have been added to the DOM
            if (!!filterButtons.length) {
                // Get the "Unread" button
                const unreadButton = filterButtons.filter((e) => "Unread" === e.innerHTML)[0];

                // If the "Unread" button exists
                if (!!unreadButton) {
                    // Click the button (this will trigger the underlaying action)
                    unreadButton?.click();
                    // Disconnect from the mutation observer
                    observer.disconnect();
                }
            }
        }
    });
});

// Start watching on the target node with the options
observer.observe(targetNode, observerOptions);
