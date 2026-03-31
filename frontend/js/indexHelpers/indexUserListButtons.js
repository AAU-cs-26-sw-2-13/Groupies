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

        if (document.getElementById("Pop-users-btn_id") || document.getElementById("Similar-users-btn_id")) {
            return;
        }

        let popUsersBtn = document.createElement("button");
        popUsersBtn.classList.add("highlight-box-button2");
        popUsersBtn.id = "Pop-users-btn_id";
        popUsersBtn.innerText = "Popular Users";

        let similarUsersBtn = document.createElement("button");
        similarUsersBtn.classList.add("box-button2");
        similarUsersBtn.id = "Similar-users-btn_id";
        similarUsersBtn.innerText = "Similar Users";

        buttonContainer.insertBefore(popUsersBtn, buttonDivider);
        buttonContainer.appendChild(similarUsersBtn);

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
    else {
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
}

