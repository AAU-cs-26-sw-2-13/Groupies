import { followUserListener } from "./User_creation.js";
import { initializeHeader } from "./loadHeader.js"
import { parseTags } from "./parseJson.js";

let main = document.querySelector("main")
let header = document.querySelector("header")
let activeUserId = 0;

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
    activeUserId = user.user_id;
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
    document.getElementById("mainContainer")?.remove()
    console.table(profile);

    let ownProfile = (profileId == activeUserId) ? true : false; //if id returned from db matches profile page to build, user visited own profile
    console.log(`The profile build for user id ${profile.id} commencing with own profile variable value: ${ownProfile}`);
    // Containers
    let backgroundContainer = document.createElement("section")
    backgroundContainer.setAttribute("class", "profileMain")
    backgroundContainer.setAttribute("id", "mainContainer")

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

    // ProfileContainer - Follow and Message Buttons section (not needed if user is loading their own profile)
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

    let editPrefsButton = document.createElement("button");
    editPrefsButton.setAttribute("id", "edit-prefs-button_id");
    editPrefsButton.setAttribute("class", "box-button2");
    editPrefsButton.setAttribute("type", "button");
    editPrefsButton.textContent = "Edit your preferences";
    editPrefsButton.addEventListener('click', (event) => {
        editPrefsHandler(profile, event);
    });

    if (!ownProfile) {
        profileInteractions.append(followButton, messageButton)
    }
    else {
        profileInteractions.append(editPrefsButton);
    }

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

    let preferenceList = document.createElement("ul");
    preferenceList.setAttribute("class", "prefList");
    preferenceList.setAttribute("id", "preferenceList_id");
    for (let t of parseTags(profile.preferences)) {
        if (t !== null) {
            let pref = document.createElement("li")
            let button = document.createElement("button")
            button.setAttribute("class", "pref-item")
            button.textContent = t
            pref.append(button);
            preferenceList.append(pref)
            if (ownProfile) button.addEventListener('click', togglePreferenceHandler);
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
    prefsD.setAttribute("id", "newPrefsListTarget_id")

    // Trip Container
    let tripHeader = document.createElement("h2")
    tripHeader.setAttribute("class", "pBold")
    tripHeader.textContent = "Past Trips"

    // TripContainer List
    let tripList = document.createElement("div")
    tripList.setAttribute("id", "tripList")
    tripList.setAttribute("class", "tripList")

    let backButton = document.createElement("button")
    backButton.setAttribute("class", "buttonBack")
    backButton.setAttribute("type", "button")
    backButton.textContent = "Back"
    backButton.addEventListener("click", () => { window.location.href = "/" })

    let optionsContainer = document.createElement("section")
    optionsContainer.setAttribute("class", "optionsContainer")

    if (ownProfile) {
        let editButton = document.createElement("button")
        editButton.setAttribute("class", "box-button2")
        editButton.setAttribute("type", "button")
        editButton.textContent = "Edit Profile"
        editButton.addEventListener('click', () => {
            createEditProfile(profile)
        })
        optionsContainer.append(backButton, editButton)
    } else {
        optionsContainer.append(backButton)
    }

    // Appending
    profileContainer.append(profileImg, usernameP, infoP, followersAmountP, followingAmountP, interactionD, profileInteractions, metricsD, preferenceHeader, preferenceList, prefsD, aboutHeader, aboutP, optionsContainer)

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

function createEditProfile(profile) {
    let ownProfile = (profileId == activeUserId) ? true : false;
    if (!ownProfile) { console.log(`User ${activeUserId} tried to access edit page of user ${profileId}`); return }
    document.getElementById("mainContainer")?.remove()

    let formContainer = document.createElement("form")
    formContainer.setAttribute("class", "profileMain")
    formContainer.setAttribute("id", "mainContainer")
    formContainer.style.alignItems = "center"
    formContainer.style.flexDirection = "column"
    formContainer.style.width = "35%"

    let firstNameInput = document.createElement("input")
    firstNameInput.type = "text"
    firstNameInput.id = "firstName"
    firstNameInput.placeholder = "First Name"
    firstNameInput.class = "reg-box-inputs"

    let lastNameInput = document.createElement("input")
    lastNameInput.type = "text"
    lastNameInput.id = "lastname"
    lastNameInput.placeholder = "Last Name"
    lastNameInput.class = "reg-box-inputs"

    let emailInput = document.createElement("input")
    emailInput.type = "email"
    emailInput.id = "email"
    emailInput.placeholder = "Email"
    emailInput.class = "reg-box-inputs"

    let passwordInput = document.createElement("input")
    passwordInput.type = "password"
    passwordInput.id = "password"
    passwordInput.placeholder = "Password"
    passwordInput.class = "reg-box-inputs"

    // Options (back & save)
    let optionsContainer = document.createElement("section")
    optionsContainer.setAttribute("class", "optionsContainer")

    let backButton = document.createElement("button")
    backButton.setAttribute("class", "buttonBack")
    backButton.setAttribute("type", "button")
    backButton.textContent = "Back"
    backButton.addEventListener("click", () => { window.location.href = `/profile/?id=${activeUserId}`   })

    let saveButton = document.createElement("button")
    saveButton.setAttribute("class", "box-button2")
    saveButton.setAttribute("type", "button")
    saveButton.textContent = "Save"

    optionsContainer.append(backButton, saveButton)
    
    formContainer.append(firstNameInput, lastNameInput, emailInput, passwordInput, optionsContainer)
    saveButton.addEventListener('click', () => {
        editProfile(firstNameInput.value,
            lastNameInput.value,
            emailInput.value,
            passwordInput.value
        )
    })
    main.append(formContainer)
}

async function editProfile(firstname, lastname, email, password) {
    const res = await fetch("/api/auth/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstname, lastname, email, password })
    });
    if (!res.ok) {
        return "Server failed to update user in database!"
    }
    window.location.href = `/profile/?id=${activeUserId}`
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
    tripYear.textContent = date.getFullYear()
    tripMonth.textContent = date.toLocaleDateString('en', { month: 'long' })

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

async function editPrefsHandler(profile, event) {
    const prefsButton = event.target;

    if (prefsButton.innerText === "Edit your preferences") {
        console.log("Entering edit preferences case");
        prefsButton.innerText = "Save preferences";
        prefsButton.classList.replace("box-button2", "highlight-box-button2");

        fetch("/prefs").then((response) => {
            if (response.status === 200) {
                return response.json();
            }
        }).then(jsonResponse => {
            let possiblePrefs = jsonResponse;
            let filteredPrefs = possiblePrefs.filter(pref => {
                return !profile.preferences.includes(pref.preference_id); //return each preference that is not already selected to an array
            })
            console.log("Adding the following unselected preferences:")
            console.log(filteredPrefs);
            return filteredPrefs;
        }).catch(err => {
            console.error("Error fetching all prefs:", err);
        }).then(filteredPrefs => {
            insertNewPrefButtons(filteredPrefs);
        });
    }
    else {
        console.log("Saving Preferences...");
        await savePrefsHandler(profile, event);

        // Reset button state to edit your preferences
        prefsButton.innerText = "Edit your preferences";
        prefsButton.classList.replace("highlight-box-button2", "box-button2");
    }
}

function insertNewPrefButtons(filteredPrefs) {
    document.getElementById("newPreferenceHeader_id")?.remove();
    document.getElementById("newPreferenceList_id")?.remove();
    
    let newPreferenceHeader = document.createElement("p")
    newPreferenceHeader.setAttribute("class", "pGrey")
    newPreferenceHeader.textContent = "Select new preferences"
    newPreferenceHeader.setAttribute("id", "newPreferenceHeader_id")

    let newPreferenceList = document.createElement("ul");
    newPreferenceList.setAttribute("class", "prefList");
    newPreferenceList.setAttribute("id", "newPreferenceList_id")

    let allNewPrefs = filteredPrefs.map(pref => pref.preference_id);

    for (let prefName of allNewPrefs) {
        if (prefName !== null) {
            let pref = document.createElement("li");
            let button = document.createElement("button");
            button.setAttribute("class", "unselected-pref-item");
            button.textContent = prefName;
            pref.append(button);
            newPreferenceList.append(pref);
            button.addEventListener('click', togglePreferenceHandler);
        }
    }

    let newPrefsInsertTarget = document.getElementById("newPrefsListTarget_id");
    newPrefsInsertTarget.after(newPreferenceHeader, newPreferenceList);
}

async function savePrefsHandler(profile, event) {
    //logic to save preferences
    console.log("profile id in savePrefsHandler: " + profile.id);
    let newPreferenceHeader = document.getElementById("newPreferenceHeader_id");
    let newPreferenceList = document.getElementById("newPreferenceList_id");
    let preferenceList = document.getElementById("preferenceList_id")

    //Get the current prefs buttons state in the existing prefs list and make an array for a post request to query the DB for update
    const currentPrefs = Array.from(preferenceList.querySelectorAll('button'))
                              .map(btn => btn.textContent.trim());
    console.log("Attempting to set user prefs in DB to the following prefs;" + currentPrefs);

    try {
        const response = await fetch("/api/pref", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: profile.id,
                preferenceList: currentPrefs
            })
        });

        if (response.ok) {
            // Update local profile so no duplicate buttons are created if "edit your preferences" is clicked again
            profile.preferences = currentPrefs;
            //remove the elements
            newPreferenceHeader.remove();
            newPreferenceList.remove();
            console.log("Preferences saved successfully.");
        }
    } catch (err) {
        console.error("Failed to save preferences:", err);
    }
}

async function togglePreferenceHandler(event) {
    let preferenceList = document.getElementById("preferenceList_id") //DRY lacking :( too moist
    let newPreferenceList = document.getElementById("newPreferenceList_id")
    const button = event.target.closest('button');
    if (!button || !preferenceList || !newPreferenceList) return;

    console.log("button and parent nodes:")
    console.log(button);
    console.log(button.parentNode.parentNode);

    const currentContainer = button.parentNode.parentNode;

    if (currentContainer === preferenceList) {
        button.classList.replace('pref-item', 'unselected-pref-item');
        newPreferenceList.append(button.parentNode);
    }
    else if (currentContainer === newPreferenceList) {
        button.classList.replace('unselected-pref-item', 'pref-item');
        preferenceList.append(button.parentNode);
    }
}