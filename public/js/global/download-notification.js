const wsUri = 'wss:';
const conn = createWebSocket();

function createWebSocket() {
    try {
        return new WebSocket(wsUri);
    } catch (e) {
        console.error("Not Connected to WebSocket, please refresh page");
        return null;
    }
}

if (conn) {
    conn.onopen = function (e) {
        const connectionData = {
            // userId: securedUserId
        };
        conn.send(JSON.stringify(connectionData));
        console.log("Connected to websocket");
    };

    conn.onmessage = function (e) {
        notifyMessage(e.data);
    };

    conn.onerror = function (e) {
        console.error("WebSocket error:", e);
    };
}

function closeToaster(button) {
    const id = button.getAttribute('data-id');
    const toaster = document.getElementById(id);
    if (toaster) {
        toaster.classList.add("is-hidden");
    }
}

function notifyMessage(data) {
    const toasterList = document.querySelector('.toaster-list');
    data.forEach(user => {
        const newToaster = document.createElement("div");
        newToaster.classList.add("toaster", "bg", "shadow-sm", "margin-top-sm");
        newToaster.id = `toaster-${user.id}`;
        newToaster.innerHTML = `
            <div class="d-flex justify-between align-center">
                <div class="info-text">
                    <p>Generating CSV Report (Pending) for ${user.title}.</p>
                    <p>Generating report for ${user.message}.</p>
                    <p>From:<span>2024-01-01</span> To:<span>2024-01-20</span></p>
                </div>
                <button class="close-btn d-flex justify-center align-center" data-id="toaster-${user.id}" onclick="closeToaster(this)">
                    <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.3079 1.125L1.94531 10.4876" stroke="var(--dark-gray-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M1.94531 1.125L11.3079 10.4876" stroke="var(--dark-gray-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        `;
        toasterList.appendChild(newToaster);
    });

    // if(update)
    // {
    //     console.log("Removed");
    //     // Select all elements with the class "toaster"
    //     var elementsToDelete = document.querySelectorAll(".toaster");

    //     // Loop through the NodeList and remove each element
    //     elementsToDelete.forEach(function(element) {
    //         element.remove();
    //     });
    // }

}
