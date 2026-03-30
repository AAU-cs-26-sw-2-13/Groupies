import { getCurrentUser } from "./userAPI.js";
import { login, register } from "./loginRegister.js";
import { createUserHTML } from "./User_creation.js";
import { initializeHeader } from "./loadHeader.js";
import  "./indexHelpers/indexListeners.js";

//Queries to dom elements
let tripList = document.querySelector("#tripList");
let userList = document.querySelector("#userList");
let similarUserList = document.querySelector("#similarUserList");
let header = document.querySelector("header");
let buttons = document.querySelector(".pageButtons");

//Context variables
let discovered = 1;
let user = { user_id: null };
let buttonAmount;

//Generates the HTML object for a new trip
function createTrip(title, host, tags, group) {
    let list = document.createElement("li")
    let article = document.createElement("article")

    let upperTripInfo = document.createElement("div")
    let lowerTripInfo = document.createElement("div")

    let tripInformation = document.createElement("div")
    let starIcon = document.createElement("i")

    let tripImage = document.createElement("img")
    let tripText = document.createElement("div")

    let tripTitle = document.createElement("p")
    let tripHost = document.createElement("p")

    let genreList = document.createElement("ul")

    article.setAttribute("class", "trip")

    //saves the data of the trip, needed for showing the group page
    article.dataset.id = group.id

    article.addEventListener('click', groupClick)

    upperTripInfo.setAttribute("class", "upperTripInfo")
    lowerTripInfo.setAttribute("class", "userPrefFront")

    tripInformation.setAttribute("class", "TripInformation")
    starIcon.setAttribute("class", "fa-regular fa-star followb")
    starIcon.addEventListener('click', followTripListener)

    tripImage.setAttribute("class", "tripImage")
    tripImage.setAttribute("src", group.picture)
    tripText.setAttribute("class", "tripText")

    tripTitle.setAttribute("class", "tripTittle")
    tripTitle.textContent = title
    tripHost.setAttribute("class", "tripHost")
    tripHost.textContent = "Organized by " + host

    genreList.setAttribute("class", "prefListFront")

    list.append(article)

    article.append(upperTripInfo)
    article.append(lowerTripInfo)

    upperTripInfo.append(tripInformation)
    upperTripInfo.append(starIcon)

    tripInformation.append(tripImage)
    tripInformation.append(tripText)

    tripText.append(tripTitle)
    tripText.append(tripHost)

    lowerTripInfo.append(genreList)

    for (let t of tags) {
        if (t !== null) {
            let genre = document.createElement("li")
            genre.setAttribute("class", "pref-item")
            genre.textContent = t

            genreList.append(genre)
        }
    }
    return list
}

function followTripListener(event) {
    event.stopPropagation()
    if (event.target.classList.contains("fa-regular")) {
        event.target.classList.remove("fa-regular")
        event.target.classList.add("fa-solid")
    } else {
        event.target.classList.add("fa-regular")
        event.target.classList.remove("fa-solid")
    }

}

function groupClick(event) {
    //console.log(event.target)

    let Groupdata = event.currentTarget.dataset
    window.location.href = `/group/?id=${Groupdata["id"]}`
}

//Generates the buttons to change page
function createDiscoverButtons(Amount) {
    let buttonsCount = Math.ceil(Amount / 10)
    //Variables for making page shifting dynamic
    let lowerBound = Math.max(1, parseInt(discovered) - 2); //Finds lowest bound - if its below 1 it selects 1
    let upperBound = Math.min(buttonsCount, parseInt(discovered) + 2) //Find the largets boud, if its above the total button count it selecet the button count

    for (let i = Math.min(lowerBound, Math.max(buttonsCount - 4, 1)); i <= Math.max(upperBound, Math.min(buttonsCount, 5)); i++) { //Chooses the correct bounds
        let button = document.createElement("button")
        button.setAttribute("type", "button")
        button.setAttribute("data-pnumber", i)
        button.textContent = i
        if (i == discovered) { //Makes the selected button purplbe (By not adding pasive css)
            button.setAttribute("class", "button3")
            buttons.append(button)
            continue
        }
        button.setAttribute("class", "button3 passive")
        button.addEventListener('click', (event) => { //Reloads the buttons once one is clicked
            discovered = event.target.getAttribute("data-pnumber") //Gets the button number
            buttons.replaceChildren() //Deletes all the current buttons
            tripList.replaceChildren() //Deletes all the current trips
            createDiscoverButtons(buttonAmount) //Generates the again
            generateTrips(user, discovered) //Generates the trips again with new offset
        })
        buttons.append(button)
    }
}
// Build the header and load page content based on Auth state
fetch("/me", {
    method: "GET",
    credentials: "include"
}).then(response => {
    if (response.status === 200) {
        return response.json();
    } else {
        // Not logged in: Initialize header with null user and load public data
        initializeHeader(header, null, "Index");
        generateTrips({ user_id: null }, discovered);
        generateUsers({ user_id: null });
        throw "Session not found";
    }
}).then(jsonResponse => {
    // Logged in: Initialize header with user data and load personalized data
    user = jsonResponse;
    initializeHeader(header, user, "Index");
    generateUsers(user);
    generateSimilarUsers(user);
    generateTrips(user, discovered);
}).catch(err => {
    console.log("Auth Check:", err);
});

//Get users sorted by # followers
async function generateUsers(user) {
    console.log("attempting to generate users...");
    user.query = "users";
    let usersQuery = fetch("/", { method: 'POST', body: JSON.stringify(user) });
    usersQuery.then(userResponse => {
        return userResponse.json();
    }).then(jsonUserResponse => {
        console.log("received json User list response");
        createUserHTML(jsonUserResponse, userList);
    })
}

async function generateSimilarUsers(user) {
    console.log("attempting to generate similar users...");
    user.query = "similar users";
    let similarUsersQuery = fetch("/", { method: 'POST', body: JSON.stringify(user) });
    similarUsersQuery.then(similarUsersResponse => {
        return similarUsersResponse.json();
    }).then(jsonSimilarUsersResponse => {
        console.log("received json similar user list response");
        createUserHTML(jsonSimilarUsersResponse, similarUserList);
    })

}

//Get groups
async function generateTrips(user, offset) {
    console.log(user)
    user.query = "groups"
    user.offset = (offset - 1) * 10
    let groupQuery = fetch("/", { method: 'POST', body: JSON.stringify(user) })
    groupQuery.then(groupResponse => {
        return groupResponse.json()
    }).then(data => {
        console.log(data)
        createGroups(data)
        if (buttons.getAttribute("data-loaded") === "false") {
            buttonAmount = data[0].total_groups
            createDiscoverButtons(buttonAmount)
            buttons.setAttribute("data-loaded", "true")
        }
    })
}

function createGroups(groupArray) {
    for (let t of groupArray) {
        tripList.append(createTrip(t.title, t.host_name, t.tags, t))
    }
}
