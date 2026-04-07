import { followUserListener } from "./User_creation.js";
import { initializeHeader } from "./loadHeader.js"

let main = document.querySelector("main")
let header = document.querySelector("header")

fetch("/me", {
    method: "GET",
    credentials: "include"
}).then(response => {
    if (response.status === 200) {
        return response.json();
    } else {
        // Not logged in: Initialize header with null user
        initializeHeader(header, null, "Profile");
        throw "Session not found";
    }
}).then(jsonResponse => {
    // Logged in: Initialize header with user data
    let user = jsonResponse;
    initializeHeader(header, user, "Profile");
}).catch(err => {
    console.log("Auth Check:", err);
});

const pageURL = new URL(window.location.href)
const profileId = pageURL.searchParams.get("id")
fetch(`profileInfo?id=${profileId}`).then(response => {
    return response.json()
}).then(jsonResponse => {
    createProfile(jsonResponse)
    generateTrips(jsonResponse)
})

let user = { user_id: null };

function createProfile(profile) {
    // Containers
    let backgroundContainer = document.createElement("section")
    backgroundContainer.setAttribute("class", "profileMain")

    let profileContainer = document.createElement("section")
    profileContainer.setAttribute("class", "profileContainer")
    profileContainer.setAttribute("id", "about")

    let tripContainer = document.createElement("section")
    tripContainer.setAttribute("class", "tripContainer")
    tripContainer.setAttribute("id", "trips")

    // Profile Container
    let profileImg = document.createElement("img")
    profileImg.setAttribute("class", "profileImage")
    profileImg.setAttribute("src", profile.picture)

    let usernameP = document.createElement("p")
    usernameP.setAttribute("class", "pBold")
    usernameP.textContent = profile.name_first + " " + profile.name_last

    let infoP = document.createElement("p")
    infoP.setAttribute("class", "pGrey")
    infoP.textContent = profile.age + ", " + profile.gender + ", " + profile.country

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
    followersAmountP.textContent = profile.follower_count + " followers"

    let followingAmountP = document.createElement("p")
    followingAmountP.setAttribute("class", "pMini")
    followingAmountP.textContent = profile.following_count + " following"

    // ProfileContainer - Preferences section
    let preferenceHeader = document.createElement("p")
    preferenceHeader.setAttribute("class", "pGrey")
    preferenceHeader.textContent = "Preferences"

    let preferenceList = document.createElement("ul")
    preferenceList.setAttribute("class", "prefList")
    for (let t of profile.preferences) {
        if (t !== null) {
            let pref = document.createElement("li")
            pref.setAttribute("class", "pref-item")
            pref.textContent = t
            preferenceList.append(pref)
        }
    }

    // ProfileContainer - About section
    let aboutHeader = document.createElement("p")
    aboutHeader.setAttribute("class", "pGrey")
    aboutHeader.textContent = "About"
    
    let aboutP = document.createElement("p")
    aboutP.setAttribute("class", "pGrey")
    aboutP.textContent = profile.bio

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
    tripHeader.textContent = "Past Trips"

    // TripContainer List
    let tripList = document.createElement("div")
    tripList.setAttribute("id", "tripList")
    tripList.setAttribute("class", "tripList")

    // Options if user is equal to the profile userid
    let optionsContainer = document.createElement("section")
    optionsContainer.setAttribute("class", "optionsContainer")

    // Appending
    profileContainer.append(profileImg, usernameP, infoP, profileInteractions, interactionD, followersAmountP, followingAmountP, metricsD, preferenceHeader, preferenceList, prefsD, aboutHeader, aboutP)
    
    if (profile.groups.length === 0) { // Text if no trips
        let noTripsText = document.createElement("p")
        noTripsText.setAttribute("class", "pGrey")
        noTripsText.textContent = "This user haven't been on any trips"

        tripContainer.append(tripHeader, noTripsText)
    } else {
        tripContainer.append(tripHeader, tripList)
    }

    backgroundContainer.append(profileContainer, tripContainer)
    main.append(backgroundContainer)
}

// Generates the HTML object for a trip
function createTrip(data) {
    const id = data.id
    const date = new Date(data.date_start_at)
    const title = data.title
    const host = data.host_name
    const memberCount = data.member_count
    
    let list = document.createElement("li")
    list.setAttribute("class", "tripElement")

    let leftTContainer = document.createElement("div")
    let centerLTContainer = document.createElement("div")
    let centerRTContainer = document.createElement("div")
    let rightTContainer = document.createElement("div")
    
    leftTContainer.setAttribute("class", "  ateContainer")
    centerLTContainer.setAttribute("class", "tripConnectorImage")
    centerRTContainer.setAttribute("class", "tripImageContainer")
    rightTContainer.setAttribute("class", "tripInfoContainer")

    let tripDate = document.createElement("div")
    tripDate.setAttribute("class", "tripInfo")

    let tripYear = document.createElement("p")
    let tripMonth = document.createElement("p")
    tripYear.setAttribute("class", "tripDateP")
    tripMonth.setAttribute("class", "tripDateH")
    tripYear.textContent = date.getFullYear()
    tripMonth.textContent = date.toLocaleDateString('en', {month: 'long'})

    let tripImage = document.createElement("img")
    tripImage.setAttribute("class", "tripImage")
    tripImage.setAttribute("src", data.picture)

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

    tripTitle.textContent = title
    tripHost.textContent = "Hosted by " + host
    tripInfo.textContent = memberCount + " travellers went"

    // Appending
    tripText.append(tripTitle, tripHost, tripInfo)
    tripDate.append(tripMonth, tripYear)

    leftTContainer.append(tripDate)
    centerLTContainer.append(connectorImage)
    centerRTContainer.append(tripImage)
    rightTContainer.append(tripText)

    list.append(leftTContainer, centerLTContainer, centerRTContainer, rightTContainer)

    list.dataset.id = data.id

    list.addEventListener('click', groupClick)

    return list
}

function groupClick(event) {
    //console.log(event.target)

    let groupData = event.currentTarget.dataset
    window.location.href = `/group/?id=${groupData["id"]}`
}

async function generateTrips(user) {
    for (let group of user.groups) {
        tripList.append(createTrip(group))
    }
}