/* The HTML element instances */
let buttonDivider = document.getElementById("button-divider_id"); //the container to generate buttons for if user is logged in
let buttonContainer = document.getElementById("button-container_id");
let userListHeader = document.getElementById("userListHeader_id");
let popularUserList = document.getElementById("userList");
let similarUserList = document.getElementById("similarUserList");


//generate the user list buttons and add event listeners for them
export function generateUserListButtons(user) {
    if (user && user.user_id) {
        if (!buttonContainer || !buttonDivider) {
            throw new Error("User list buttons container was not found in DOM");
        }
        const popularUsersListButton = document.getElementById("Pop-users-btn_id");
        const similarUsersListButton = document.getElementById("Similar-users-btn_id");

        if (popularUsersListButton || similarUsersListButton) {
            displaySimilarUserList(popularUsersListButton, similarUsersListButton);
            return; //They already exist, default to Similar Users list and return (dont generate them again);
        }

        let popUsersBtn = document.createElement("button");
        popUsersBtn.classList.add("highlight-box-button2");
        popUsersBtn.id = "Pop-users-btn_id";
        popUsersBtn.innerText = "Popular Users";

        let similarUsersBtn = document.createElement("button");
        similarUsersBtn.classList.add("box-button2");
        similarUsersBtn.id = "Similar-users-btn_id";
        similarUsersBtn.innerText = "Similar Users";

        buttonContainer.insertBefore(similarUsersBtn, buttonDivider);
        buttonContainer.appendChild(popUsersBtn);

        // We want to display similar users as default when logged in
        displaySimilarUserList(popUsersBtn, similarUsersBtn);
        //The event handlers for the clicks to change the display and button highlight.
        popUsersBtn.addEventListener("click", userListsButtonsClick);
        similarUsersBtn.addEventListener("click", userListsButtonsClick);
        return;
    }
    throw new Error("No authenticated user in generateUserListButtons");
}

/* ---- The event handler for the user list button clicks ---- */
function userListsButtonsClick(event) {

    const popularUsersListButton = document.getElementById("Pop-users-btn_id");
    const similarUsersListButton = document.getElementById("Similar-users-btn_id");

    if (!popularUsersListButton || !similarUsersListButton || !popularUserList || !similarUserList || !userListHeader) {
        return;
    }

    console.log(`clicked ${event.target.id}`); //debugging click logger
    if (event.target === popularUsersListButton) {
        displayPopularUserList(popularUsersListButton, similarUsersListButton);
    }
    else {
        displaySimilarUserList(popularUsersListButton, similarUsersListButton);
    }
}

function displayPopularUserList (popularUsersListButton, similarUsersListButton){
    //if popularUsers button clicked, highlight it and un-highlight similarUsers list button, and similarly if reverse is the case
    popularUsersListButton.classList.add("highlight-box-button2");
    popularUsersListButton.classList.remove("box-button2");

    similarUsersListButton.classList.add("box-button2");
    similarUsersListButton.classList.remove("highlight-box-button2");

    //Display only the active button userList:
    popularUserList.classList.remove("inactive");
    popularUserList.classList.add("active");
    similarUserList.classList.remove("active");
    similarUserList.classList.add("inactive");

    //Change the header to the corresponding active userlist
    userListHeader.innerText = "Popular Users";
}

function displaySimilarUserList (popularUsersListButton, similarUsersListButton) {
    popularUsersListButton.classList.add("box-button2");
    popularUsersListButton.classList.remove("highlight-box-button2");

    similarUsersListButton.classList.add("highlight-box-button2");
    similarUsersListButton.classList.remove("box-button2");

    popularUserList.classList.remove("active");
    popularUserList.classList.add("inactive");
    similarUserList.classList.remove("inactive");
    similarUserList.classList.add("active");

    userListHeader.innerText = "Similar Users";
}