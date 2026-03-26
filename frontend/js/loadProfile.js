import { followUserListener } from "./User_creation.js";

let profileContainer = document.querySelector("#main")

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
    messageButton.textContent = "Follow"
    messageButton.addEventListener('click', followUserListener)

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

    // Appending
    profileContainer.append(profileImg, username, profileInfo, profileInteractions, interactionD, followersAmountP, followingAmountP, metricsD, preferenceHeader, prefsD, aboutHeader, aboutP)
    tripContainer.append(tripHeader)
    backgroundContainer.append(profileContainer, tripContainer)
    container.append(backgroundContainer)

    return container;
}

profileContainer.append(createProfile())