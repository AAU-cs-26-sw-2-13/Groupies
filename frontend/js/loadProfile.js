import { followUserListener, getAge } from "./createUser.js";
import { initializeHeader } from "./loadHeader.js"
import { parseTags } from "./parseJson.js";
import { followingUsers } from "./createUser.js"

let main = document.querySelector("main")
let header = document.querySelector("header")
let activeUserId = null;

await fetch("/me", {
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
const profileId = Number(pageURL.searchParams.get("id"))
const includeEmail = activeUserId === profileId ? "&ownProfile=true" : ""

fetch(`profileInfo?id=${profileId}${includeEmail}`).then(response => {
    return response.json()
}).then(async jsonResponse => {
    let isFollowing = false;
    let alreadyFollowing = [];
    if (activeUserId) alreadyFollowing = await followingUsers(activeUserId);
    isFollowing = alreadyFollowing.some(follow => Number(follow.target_user_id) === profileId); //if active user follows the profile user already

    createProfile(jsonResponse, isFollowing); //create the profile, but follow button conditionally on isFollowing
    generateTrips(jsonResponse); //generate HTML elements for past trips for the profile user
})

function createProfile(profile, isFollowing) {
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
    infoP.textContent = getAge(profile.dob) + ", " + profile.gender + ", " + profile.country

    // ProfileContainer - Follow and Message Buttons section (not needed if user is loading their own profile)
    let profileInteractions = document.createElement("div")
    profileInteractions.setAttribute("class", "profileButtons")

    let followButton = document.createElement("button")
    followButton.setAttribute("class", "button4")
    followButton.setAttribute("type", "button")

    if (isFollowing) {
        followButton.textContent = "Following";
        followButton.classList.add("following");
    }
    else {
        followButton.textContent = "Follow";
    }
    followButton.addEventListener('click', (event) => followUserListener(event, profile.id, activeUserId))

    let messageButton = document.createElement("button")
    messageButton.setAttribute("class", "button5")
    messageButton.setAttribute("type", "button")
    messageButton.textContent = "message"
    messageButton.addEventListener('click', ()=>{
        if (activeUserId == null) {alert("You must login first"); return;}
        window.location.href = `/chat/users/?id=${profile.id}`
    })

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

    let pageHeader = document.createElement("div")
    pageHeader.setAttribute("class", "headerBox")
    let headerText= document.createElement("h3")
    headerText.textContent = "Edit Profile"
    let inputholder = document.createElement("div")
    inputholder.setAttribute("class", "register-box")

    let formContainer = document.createElement("form")
    formContainer.setAttribute("class", "profileMain")
    formContainer.setAttribute("id", "mainContainer")
    formContainer.style.alignItems = "center"
    formContainer.style.flexDirection = "column"
    formContainer.style.width = "25%"
    formContainer.style.gap = "0.3rem"

    let nameContainer = document.createElement("section")
    nameContainer.setAttribute("class", "columnContainer")

    let nameTitle = document.createElement("p")
    nameTitle.setAttribute("class", "p1")
    nameTitle.textContent = "Name"

    let firstNameInput = document.createElement("input")
    firstNameInput.setAttribute("type", "text")
    firstNameInput.setAttribute("id", "firstname")
    firstNameInput.setAttribute("name", "firstname")
    firstNameInput.setAttribute("placeholder", "First Name")
    firstNameInput.setAttribute("class", "box-input")
    firstNameInput.style.width = "80%"

    let lastNameInput = document.createElement("input")
    lastNameInput.setAttribute("type", "text")
    lastNameInput.setAttribute("id", "lastname")
    lastNameInput.setAttribute("name", "lastname")
    lastNameInput.setAttribute("placeholder", "Last Name")
    lastNameInput.setAttribute("class", "box-input")
    lastNameInput.style.width = "80%"

    let loginContainer = document.createElement("section")
    loginContainer.setAttribute("class", "columnContainer")

    let loginTitle = document.createElement("p")
    loginTitle.setAttribute("class", "p1")
    loginTitle.textContent = "Login"

    let emailInput = document.createElement("input")
    emailInput.setAttribute("type", "email")
    emailInput.setAttribute("id", "email")
    emailInput.setAttribute("name", "email")
    emailInput.setAttribute("placeholder", "Email")
    emailInput.setAttribute("class", "box-input")
    emailInput.style.width = "80%"

    let passwordInput = document.createElement("input")
    passwordInput.setAttribute("type", "password")
    passwordInput.setAttribute("id", "password")
    passwordInput.setAttribute("name", "password")
    passwordInput.setAttribute("placeholder", "Password")
    passwordInput.setAttribute("class", "box-input")
    passwordInput.style.width = "80%"
    
    let aboutTitle = document.createElement("p")
    aboutTitle.setAttribute("class", "p1")
    aboutTitle.textContent = "About"
    
    let bioInput = document.createElement("input")
    bioInput.setAttribute("type", "text")
    bioInput.setAttribute("id", "bio")
    bioInput.setAttribute("name", "bio")
    bioInput.setAttribute("placeholder", "Bio")
    bioInput.setAttribute("class", "box-input")
    bioInput.style.height = "3rem"

    let calendarIcon = document.createElement("i")
    calendarIcon.setAttribute("class", "fa-regular fa-calendar")
    
    let dobLabel = document.createElement("label")
    dobLabel.setAttribute("class", "box-interactable")
    let dobText = document.createElement("span")
    dobText.textContent = " Date of Birth" 
    let dobBox = document.createElement("input")
    dobBox.setAttribute("type", "date")
    dobBox.setAttribute("name", "dob")
    dobBox.setAttribute("class", "calenderDisplay")
    dobLabel.style.width = "100%"
    dobLabel.append(calendarIcon,dobText,dobBox)
    dobLabel.addEventListener("click", (e) => {
        e.preventDefault()
        dobBox.showPicker()
    })
    dobLabel.addEventListener("change", () => {
        dobText.textContent = " " + dobBox.value || " Date of Birth"
        dobText.style.color = dobBox.value ? "#333" : "#717171"
    })
    const dob = profile.dob.trim().split('T')[0]; // clean dob
    if (dob) {
        dobBox.value = dob
        dobText.textContent = " " + dob
    } else {
        dobText.textContent = " Date of Birth"
    }
    dobText.style.color = dobBox.value ? "#333" : "#717171"

    let fileIcon = document.createElement("i")
    fileIcon.setAttribute("class", "fa-regular fa-image")
    let fileLabel = document.createElement("label")
    fileLabel.setAttribute("class", "box-interactable")
    let fileText = document.createElement("span")
    fileText.textContent = " Profile Picture"
    let profileImg = document.createElement("input")
    profileImg.setAttribute("type", "file")
    profileImg.setAttribute("name", "picture")
    profileImg.setAttribute("accept", "image/*")
    profileImg.style.display = "none"
    let preview = document.createElement("img")
    preview.setAttribute("class", "groupImg")
    preview.style.display = "none" //hide preview until a picture is uploaded
    fileLabel.style.width = "100%"
    let validImageData = null
    profileImg.addEventListener("change", () => {
    const file = profileImg.files[0]    
    if(file){
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"]
        if(!allowedTypes.includes(file.type)){
            alert("Unsupported file format")  
            profileImg.value = ""
            return
        }
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (e) => {
            console.log(e.target)
            console.log(e.target.result)
        validImageData = e.target.result
        preview.setAttribute("src", validImageData)
        preview.style.display = "block"
        fileText.textContent = " Change Photo"
    }}})

    fileLabel.append(fileIcon, fileText, profileImg, preview)

    let genderTitle = document.createElement("p")
    genderTitle.setAttribute("class", "p1")
    genderTitle.textContent = "Gender"
    
    let genderContainer = document.createElement("section")
    genderContainer.setAttribute("class", "genderChooserBox")
    genderContainer.innerHTML = `
        <div class="registerGenderDiv">
            <input class="registerGenderRadioButton" type="radio" id="male" name="gender" value="Male" ${profile.gender === 'male' ? ' checked' : ''}>
            <label class="registerGenderTextButton" for="male">Male</label><br>
            <input class="registerGenderRadioButton" type="radio" id="female" name="gender" value="Female" ${profile.gender === 'female' ? ' checked' : ''}>
            <label class="registerGenderTextButton" for="female">Female</label><br>
            <input class="registerGenderRadioButton" type="radio" id="other" name="gender" value="Other" ${profile.gender === 'other' ? ' checked' : ''}>
            <label class="registerGenderTextButton" for="other">Other</label><br>
        </div>
    `

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
    saveButton.setAttribute("type", "submit")
    saveButton.setAttribute("id", "submitButton")
    saveButton.textContent = "Save"

    optionsContainer.append(backButton, saveButton)
    
    // Initial input
    firstNameInput.value = profile.name_first || ""
    lastNameInput.value = profile.name_last || ""
    bioInput.value = profile.bio || ""
    emailInput.value = profile.email || ""

    // Appending
    nameContainer.append(firstNameInput, lastNameInput)
    loginContainer.append(emailInput, passwordInput)
    pageHeader.append(headerText)
    formContainer.append(pageHeader, nameTitle, nameContainer, loginTitle, loginContainer, aboutTitle, bioInput, dobLabel, fileLabel, genderTitle, genderContainer, optionsContainer)
    formContainer.addEventListener('submit', (e) => {
        e.preventDefault()
        editProfile(firstNameInput.value.trim(),
            lastNameInput.value.trim(),
            emailInput.value.trim(),
            passwordInput.value.trim(),
            bioInput.value.trim(),
            dobBox.value,
            validImageData
        )
    })
    main.append(formContainer)

    //Eventlistener for choosing gender
    const genderButtons = document.querySelectorAll(".registerGenderTextButton")

    for(let gb of genderButtons){
        if (gb.textContent.toLowerCase() === profile.gender.toLowerCase()) { gb.setAttribute("class","registerGenderTextButtonActive") }
        gb.addEventListener('click', ()=>{
            for(let gb2 of genderButtons){
                gb2.setAttribute("class","registerGenderTextButton")
            }
            gb.setAttribute("class","registerGenderTextButtonActive")
        })
    }
}

async function editProfile(firstname, lastname, email, password, bio, dob, image) {
    if(!firstname){ alert("First Name is required"); return; }
    if(!lastname){ alert("Last Name is required"); return; }
    if(!email){ alert("Email is required"); return; }
    //if(!password){ alert("Password is required"); return; }
    if(!bio){ alert("Bio is required"); return; }
    if(!dob){ alert("Date of birth is required"); return; }
    const submitButton = document.getElementById("saveButton");
    submitButton.disabled = true
    
    const form = document.getElementById("mainContainer");
    const formData = new FormData(form);
    const res = await fetch("/api/auth/edit", {
        method: "POST",
        body: formData,
    });
    if (!res.ok) {
        submitButton.disabled = false
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