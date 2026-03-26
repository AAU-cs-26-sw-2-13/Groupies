import { followUserListener } from "./User_creation.js";
import { initializeHeader } from "./loadHeader.js"

let profileContainer = document.querySelector("#main")
let header = document.querySelector("header")

let user = { user_id: null };

function createProfile() {
    // Containers
    let container = document.createElement("div")
    container.setAttribute("class", "profilePage")

    let backgroundContainer = document.createElement("div")
    backgroundContainer.setAttribute("class", "profileMain")

    let profileContainer = document.createElement("div")
    profileContainer.setAttribute("class", "profileContainer")
    profileContainer.setAttribute("id", "about")

    let tripContainer = document.createElement("div")
    tripContainer.setAttribute("class", "profileContainer")
    tripContainer.setAttribute("id", "trips")

    // Profile Container
    let profileImg = document.createElement("img")
    profileImg.setAttribute("class", "profileImage")
    profileImg.setAttribute("src", "../img/accountPlaceholder.svg")

    let username = document.createElement("p")
    username.setAttribute("class", "pBold")
    username.textContent = "John Software"

    let profileInfo = document.createElement("p")
    profileInfo.setAttribute("class", "pGrey")
    profileInfo.textContent = "28, Male, USA"

    // ProfileContainer - Follow and Message Buttons section
    let profileInteractions = document.createElement("div")
    profileInteractions.setAttribute("class", "profileButtons")

    let followButton = document.createElement("button")
    followButton.setAttribute("class", "button4")
    followButton.setAttribute("type", "button")
    followButton.textContent = "Follow"
    followButton.addEventListener('click', followUserListener)

    let messageButton = document.createElement("button")
    messageButton.setAttribute("class", "button5")
    messageButton.setAttribute("type", "button")
    messageButton.textContent = "message"
    //messageButton.addEventListener('click', followUserListener)

    profileInteractions.append(followButton, messageButton)

    // ProfileContainer - Followers section
    let followersAmountP = document.createElement("p")
    followersAmountP.setAttribute("class", "pMini")
    followersAmountP.textContent = "67 followers"

    let followingAmountP = document.createElement("p")
    followingAmountP.setAttribute("class", "pMini")
    followingAmountP.textContent = "67 following"

    // ProfileContainer - Preferences section
    let preferenceHeader = document.createElement("p")
    preferenceHeader.setAttribute("class", "pGrey")
    preferenceHeader.textContent = "John's Preferences"

    // ProfileContainer - About section
    let aboutHeader = document.createElement("p")
    aboutHeader.setAttribute("class", "pGrey")
    aboutHeader.textContent = "About John"
    
    let aboutP = document.createElement("p")
    aboutP.setAttribute("class", "pGrey")
    aboutP.textContent = "Lorem ipsum dolor sit amet consectetur adipiscing elit. Consectetur adipiscing elit quisque faucibus ex sapien vitae. Ex sapien vitae pellentesque sem placerat in id. Placerat in id cursus mi pretium tellus duis. Pretium tellus duis convallis tempus leo eu aenean."

    // ProfileContainer - Dividers
    let interactionD = document.createElement("div")
    let metricsD = document.createElement("div")
    let prefsD = document.createElement("div")
    interactionD.setAttribute("class", "divider")
    metricsD.setAttribute("class", "divider")
    prefsD.setAttribute("class", "divider")

    // Trip Container
    let tripHeader = document.createElement("h2")
    tripHeader.setAttribute("class", "pBold")
    tripHeader.textContent = "John's Past Trips"

    // TripContainer List
    let tripList = document.createElement("div")
    tripList.setAttribute("id", "tripList")
    tripList.setAttribute("class", "tripList")

    // Appending
    profileContainer.append(profileImg, username, profileInfo, profileInteractions, interactionD, followersAmountP, followingAmountP, metricsD, preferenceHeader, prefsD, aboutHeader, aboutP)
    tripContainer.append(tripHeader, tripList)
    backgroundContainer.append(profileContainer, tripContainer)
    container.append(backgroundContainer)

    return container;
}

// Generates the HTML object for a trip
function createTrip(title, host, tags, group) {
    let list = document.createElement("li")
    list.setAttribute("class", "tripElement")

    let leftTContainer = document.createElement("div")
    let centerLTContainer = document.createElement("div")
    let centerRTContainer = document.createElement("div")
    let rightTContainer = document.createElement("div")
    
    leftTContainer.setAttribute("class", "tripDateContainer")
    centerLTContainer.setAttribute("class", "tripConnectorImage")
    centerRTContainer.setAttribute("class", "tripImageContainer")
    rightTContainer.setAttribute("class", "tripInfoContainer")

    let tripDate = document.createElement("div")
    tripDate.setAttribute("class", "tripInfo")

    let tripYear = document.createElement("p")
    let tripMonth = document.createElement("p")
    tripYear.setAttribute("class", "tripDateP")
    tripMonth.setAttribute("class", "tripDateH")
    tripYear.textContent = "2025"
    tripMonth.textContent = "June"

    let tripImage = document.createElement("img")
    tripImage.setAttribute("class", "tripImage")
    tripImage.setAttribute("src", "../img/notFound.jpg")

    let profileImg = document.createElement("img")
    profileImg.setAttribute("class", "profileImage")

    let connectorImage = document.createElement("img")
    connectorImage.setAttribute("class", "connectorImage")
    connectorImage.setAttribute("src", "../img/radioButtonChecked.svg")
    
    let tripText = document.createElement("div")
    tripText.setAttribute("class", "tripInfo")

    let tripTitle = document.createElement("p")
    let tripHost = document.createElement("p")
    let tripInfo = document.createElement("p")
    tripTitle.setAttribute("class", "tripInfoH")
    tripHost.setAttribute("class", "tripInfoP")
    tripInfo.setAttribute("class", "tripInfoP")

    tripTitle.textContent = "Iceland Trip"
    tripHost.textContent = "Hosted by Patrick"
    tripInfo.textContent = "3 travellers went"

    // Appending
    tripText.append(tripTitle, tripHost, tripInfo)
    tripDate.append(tripMonth, tripYear)

    leftTContainer.append(tripDate)
    centerLTContainer.append(connectorImage)
    centerRTContainer.append(tripImage)
    rightTContainer.append(tripText)

    list.append(leftTContainer, centerLTContainer, centerRTContainer, rightTContainer)

    return list
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
        initializeHeader(header, null);
        generateTrips({ user_id: null }, 1);
        throw "Session not found";
    }
}).then(jsonResponse => {
    console.log(jsonResponse);
    // Logged in: Initialize header with user data and load personalized data
    user = jsonResponse;
    initializeHeader(header, user);
    generateTrips(user, 1);
}).catch(err => {
    console.log("Auth Check:", err);
});

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
    })
}

function createGroups(groupArray) {
    for (let t of groupArray) {
        tripList.append(createTrip(t.title, t.host_name, t))
    }
}

profileContainer.append(createProfile())