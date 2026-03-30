

/* ---- The elements for event listeners by ID ----- */
let popularUsersListButton = document.getElementById("Pop-users-btn_id");
let similarUsersListButton = document.getElementById("Similar-users-btn_id");

/* Other elements to manipulate in the event handlers */
let popularUserList = document.getElementById("userList");
let similarUserList = document.getElementById("similarUserList");

/* The event listeners on the elements */
popularUsersListButton.addEventListener("click", userListsButtonsClick);
similarUsersListButton.addEventListener("click", userListsButtonsClick);

/* ---- The event handlers ---- */
function userListsButtonsClick (event) {
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
    }
    else{
        popularUsersListButton.classList.add("box-button2");
        popularUsersListButton.classList.remove("highlight-box-button2");

        similarUsersListButton.classList.add("highlight-box-button2");
        similarUsersListButton.classList.remove("box-button2");

        popularUserList.classList.remove("active");
        popularUserList.classList.add("inactive");
        similarUserList.classList.remove("inactive");
        similarUserList.classList.add("active");
    }
}