import { createUserHTML } from "./createUser.js"
import { initializeHeader } from "./loadHeader.js"

let user = { user_id: null }
let submitting = 0;

async function initializePage () {
    //1. Initalize the header conditionally on the user session existing from browser cookie
    try {
        const authResponse = await fetch("/me", {credentials: "include"});

        if (authResponse.ok) {
            user = await authResponse.json();
            initializeHeader(header, user, "Group");
        }
        else {
        // Not logged in: Initialize header with null user
        initializeHeader(header, null, "Group");
        throw "Session not found";
        }
    } catch (error) {console.error("Error in the authResponse initializeHeader part", error)} 

    //2. Wait for the group info to be fetched
    try {
        const pageURL = new URL(window.location.href);
        const groupId = pageURL.searchParams.get("id");
        const groupResponse = await fetch(`groupInfo?id=${groupId}`);
        const groupData = await groupResponse.json();

        let tripid = document.querySelector("#tripid");
        const groupElement = await createGroup(groupData, groupId);
        tripid.append(groupElement);
        
    } catch (error) {
        console.error("Error in the groupResponse append the createGroup", error);
    }
    
}
let header = document.querySelector("header");

async function createGroup(groupInfo, groupId) {
    console.table(groupInfo)
    let container = document.createElement("div")
    container.setAttribute("class", "groupPage")

    let tripInfo = document.createElement("div")
    tripInfo.setAttribute("class", "groupMain")

    let groupImg = document.createElement("img")
    groupImg.setAttribute("class", "groupImg")
    groupImg.setAttribute("src", groupInfo.picture)

    let tripName = document.createElement("h2")
    tripName.setAttribute("class", "h2")
    const title = groupInfo.title
    tripName.textContent = title

    let hostedBy = document.createElement("p")
    hostedBy.setAttribute("class", "p1")
    const host = groupInfo.host_name;
    const hostID = groupInfo.host_user_id;
    const maxAllowed = groupInfo.max_members
    let membercount = 0

    //group members list
    let membersList = document.createElement("div")
    membersList.setAttribute("class", "membersList")
    membersList.id = "groupMembers_Id"

    const now = new Date();
    const endDate = new Date(groupInfo.date_end_at);
    let joinable = ((endDate < now) && (membercount < maxAllowed)) ? 0 : 1;

    let joinButton = document.createElement("button")
    joinButton.setAttribute("class", "button1")
    joinButton.textContent = "Apply to join group"
    joinButton.id = "joinButton_id";
    joinButton.hidden = (joinable ? 0 : 1);

    let activities = document.createElement("p")
    activities.setAttribute("class", "activityPlanText")
    activities.textContent = "Planned activities:"

    let suggestActivityButton = document.createElement("button")
    suggestActivityButton.setAttribute("class", "suggestActivityButt")
    suggestActivityButton.textContent = "Suggest an Activity"

    try {
        const response = await fetch("/groupMembers", { method: "POST", body: JSON.stringify({ groupId: groupId }) })
        const members = await response.json();
        createUserHTML(members, membersList, user.user_id)

        membercount = members.length
        hostedBy.textContent = "Organized by " + host + " with " + membercount + "/" + maxAllowed

        //looks thorugh all members, if the user is in the group as member, a button gets created
        let isAMember = false;
        for (let m of members) {
            let member = m.id
            //console.log(member)
            //console.log(user.user_id)
            if (user.user_id === member) {
                isAMember = true;
                changeApplyToJoinButton(hostID, groupId, user.user_id, membersList, members, joinButton);
                activities.append(suggestActivityButton)
            }
        }
        if (!isAMember) { //the user is not a member or organizer, should have the option to join the group
            if (!joinable) { joinButton.addEventListener('click', (event) => { applyToJoinHandler(event, groupId, user.user_id) }, {once: true}); }
        }
    } catch (error) {
        console.error("Error building the UI elements in the createGroup function", error)
    }

    let aboutInfo = document.createElement("p")
    aboutInfo.setAttribute("class", "groupAbout")
    const about = groupInfo.about
    aboutInfo.textContent = about

    let dates = document.createElement("p")
    dates.setAttribute("class", "p1")
    dates.textContent = formatDate(groupInfo.date_start_at) + " - " + formatDate(groupInfo.date_end_at)

    let imageInfoRow = document.createElement("div")
    imageInfoRow.setAttribute("class", "groupImageInfo")


    let infoText = document.createElement("div")
    infoText.setAttribute("class", "groupInfo")

    infoText.append(hostedBy, aboutInfo, dates)
    imageInfoRow.append(groupImg, infoText)

    tripInfo.append(tripName, imageInfoRow)


    let membersElement = document.createElement("div")
    membersElement.setAttribute("class", "aside-box")

    let membersTitle = document.createElement("h2")
    membersTitle.textContent = "Group Members"
    membersElement.append(membersTitle)


    //buttons
    let buttons = document.createElement("div")
    buttons.setAttribute("class", "groupActions")

    let backButton = document.createElement("button")
    backButton.setAttribute("class", "buttonBack")
    backButton.setAttribute("type", "button")
    backButton.textContent = "Back"
    backButton.addEventListener("click", () => { window.location.href = "/" })

    

    buttons.append(backButton, joinButton)


    let tagsList = document.createElement("div")
    tagsList.setAttribute("class", "groupTags")

    //The tags display 
    fetch("/groupTags", { method: "POST", body: JSON.stringify({ groupId: groupId }) })
        .then(r => r.json())
        .then(tags => {
            for (let t of tags) {
                if (t !== null) {
                    let genre = document.createElement("li")
                    genre.setAttribute("class", "pref-item")
                    genre.textContent = t.tag_id
                    tagsList.append(genre)
                }
            }
        })
    tripInfo.append(tagsList)

    //group activities start here

    //hide the memberlist, and show new elements, that create the activity, 
    suggestActivityButton.addEventListener("click", () => {
        let createActivity = document.createElement("div")
        createActivity.setAttribute("class", "aside-box createActivityBox")
        membersElement.style.display = "none"
        suggestActivityButton.disabled = true
        let activityHead = document.createElement("h2")
        activityHead.textContent = "Suggest an activity"
        //litteraly same code for input as createGroup.js(with mostly only different textual content)
        let activityTitle = document.createElement("input")
        activityTitle.setAttribute("type", "text")
        activityTitle.setAttribute("class", "text-input-box") 
        activityTitle.setAttribute("placeholder", "Enter activity name")

        
        let calendarIcon1 = document.createElement("i")
        calendarIcon1.setAttribute("class", "fa-regular fa-calendar")

        let startLabel = document.createElement("label")
        startLabel.setAttribute("class", "trip-interactable-boxes")
        let startText = document.createElement("span")
        startText.textContent = " Start Date"
        let activityStart = document.createElement("input")
        activityStart.setAttribute("type", "date")
        activityStart.setAttribute("class", "calenderDisplay")
        startLabel.append(calendarIcon1, startText, activityStart)
        startLabel.addEventListener("click", (e) => {
            e.preventDefault()
            activityStart.showPicker()
        })
        activityStart.addEventListener("change", () => {
            startText.textContent = " " + activityStart.value || " Start Date"
            startText.style.color = activityStart.value ? "#333" : "#717171"
        })


        let activityDesc = document.createElement("textarea")
        activityDesc.setAttribute("type", "text")
        activityDesc.setAttribute("class", "description")
        activityDesc.setAttribute("placeholder", "Describe the activity")
        activityDesc.setAttribute("maxlength", "210")

        createActivity.append(activityHead, activityTitle, startLabel, activityDesc)

        let activityButtons = document.createElement("div")
        activityButtons.setAttribute("class", "groupActions")

        let backButton = document.createElement("button")
        backButton.setAttribute("class", "buttonBack")
        backButton.setAttribute("type", "button")
        backButton.textContent = "Close activity creation"
        backButton.addEventListener("click", () => {
            createActivity.style.display = "none"
            membersElement.style.display = "flex"
            suggestActivityButton.disabled = false
        })
        let submitButton = document.createElement("button")
        submitButton.setAttribute("class", "button CreateTripButton")
        submitButton.textContent = "Post the activity suggestion"
        activityButtons.append(backButton, submitButton)
        createActivity.append(activityButtons)

        //Maybe the activity should have to be approved by an organizer before posting it?(not a development priority imo)
        submitButton.addEventListener("click", () => {
            if (!activityTitle.value) {
                alert("Activity name is required")
                return
            }
            if (!activityStart.value) {
                alert("Start date is required")
                return
            }
            if (activityStart.value < groupInfo.date_start_at) {
                alert("Start date cannot be before the trip starts")
                return
            }
            const tripEnd = new Date(groupInfo.date_end_at)  //pga. den måde datoer er opbevaret bliver date_end_at set som dagen før den reele slut dato
            tripEnd.setDate(tripEnd.getDate() + 1)
            const tripEndPlusOne = tripEnd.toISOString().split("T")[0] //har lavet et forklaring til disse funktioner i CreateGroup.js for "today" variablen

            if (activityStart.value > tripEndPlusOne) {
                alert("Start date cannot be after the trip ends")
                return
            }
            if (!activityDesc.value) {
                alert("Activity has to be described")
                return
            }


            submitButton.disabled = true

            //insert into activity db and close the activity creation
            fetch("/createActivity", {
                method: "POST", body: JSON.stringify({
                    user_id: user.user_id,
                    group_id: groupId,
                    title: activityTitle.value,
                    about: activityDesc.value,
                    date_start_at: activityStart.value
                })
            }).then(() => {
                createActivity.style.display = "none"
                membersElement.style.display = "flex"
                suggestActivityButton.disabled = false
                submitButton.disabled = false
                submitting = 1;
                showActivites(submitting) //runs the show activites again to show the newly created one aswell, so the user does not need to refresh to see their own
            })
        })
        container.append(createActivity)
    })
    //display the activities by fetching the groups activites and for each one creating display elements
    let listOfActivities = document.createElement("li")
    listOfActivities.setAttribute("class", "activityList")

    const showActivites = (submitting) => {
        fetch(`/activities?id=${groupId}`, { method: "GET" })
            .then(r => r.json()).then(activities => {

                for (let activity of activities) {
                    let activityItem = document.createElement("div")
                    activityItem.setAttribute("class", "activityItem")
                    let activitesTop = document.createElement("div")
                    let activitiesIcon = document.createElement("i")
                    activitiesIcon.setAttribute("class", "fa-regular fa-calendar")
                    let activityStartDateandName = document.createElement("h2")
                    activityStartDateandName.setAttribute("class", "tripText")
                    let activityDesc = document.createElement("p")

                    if (submitting === 0) {
                        activityStartDateandName.textContent = "  " + formatDate(activity.date_start_at) + ", " + activity.title
                        activityDesc.textContent = activity.about

                        activitesTop.append(activitiesIcon, activityStartDateandName)
                        activityItem.append(activitesTop, activityDesc)
                        listOfActivities.append(activityItem)
                    }

                    else {
                        let activity = activities[activities.length - 1]

                        activityStartDateandName.textContent = "  " + formatDate(activity.date_start_at) + ", " + activity.title
                        activityDesc.textContent = activity.about

                        activitesTop.append(activitiesIcon, activityStartDateandName)
                        activityItem.append(activitesTop, activityDesc)
                        listOfActivities.append(activityItem) //sort listen gennem datoer? nok alt for meget arbejde(faker gør det allerede når den faker dataen)
                        return
                    }
                    tripInfo.append(listOfActivities)
                }
            })
    }



    showActivites(submitting)
    tripInfo.append(activities)
    membersElement.append(membersTitle, membersList, buttons)
    container.append(tripInfo, membersElement)
    return container
}

//change the date format to properly display date
function formatDate(dateString) {
    if (!dateString) return "TBD"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
    })
}

function changeApplyToJoinButton(hostID, groupId, activeUserID, membersList, members, joinButton) {
    if (hostID == activeUserID) { //the active user is a member but is also the organizer, so they should be able to manage the group
        manageGroupOption(hostID, groupId, membersList, members, joinButton);
    }
    else { //else the active user is a member of the trip, and they don't need to apply to join the trip, so change the btn
        leaveGroupOption(activeUserID, groupId, joinButton);
    }
}

function manageGroupOption(hostID, groupId, membersList, members, joinButton) {
    joinButton.innerText = "Manage Group"
    joinButton.id = "manageButton_id"
    joinButton.addEventListener('click', (event) => { manageGroupHandler(event, membersList, hostID, members, groupId);}, {once: true});
}

async function manageGroupHandler (event, membersList, hostID, members, groupId) {
    
    event.target.innerText="Save Changes";
    event.target.classList.replace("button1" , "highlight-box-button2");
    //size the members list down and add kick users buttons
    //add requests to join window (fetch the requests and build the userlist with admit or reject buttons)
    let listItems = membersList.children;
    console.table (listItems)
    let i = 0;
    for (let li of listItems) {
        console.log(li)
        if (members[i].id != hostID) createKickButton(li, members[i], groupId); //if not the organize himself, create kick button
        i++;
    }
    
    event.target.addEventListener('click', () => location.reload());
}

async function createKickButton(li, member, groupId) {
    //get the button position
    let btnDiv = document.createElement("div");
    let userInfoBox = li.firstChild.firstChild.firstChild;
    

    //create the button and append it to its container
    let btn = document.createElement("button");
    btn.innerText = "Kick";
    btn.classList = "box-button"
    userInfoBox.after(btn);

    btn.addEventListener('click', (event) => kickButtonHandler(member, groupId, event));
}

async function kickButtonHandler(member, groupId, event) {
    const btn = event.currentTarget;
    btn.innerText = "Kicked";
    btn.disabled = true;
    btn.classList.replace("box-button", "highlight-box-button2")

    try {
        await fetch("/groupLeave", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: member.id,
                groupId: groupId
            })
        });

    } catch (err) {
        console.error(`Failed to kick member w id: ${member.id} from group w id: ${groupId}`, err);
    }
}

function leaveGroupOption (activeUserID, groupId, joinButton) {
    joinButton.innerText = "Leave Group";
    joinButton.id = "leaveButton_id";
    joinButton.addEventListener('click', (event) => leaveGroupHandler(event, activeUserID, groupId));

    //TO DO: implement the event handler to query DELETE here as well
}

async function leaveGroupHandler (event, activeUserID, groupId) {
    try {
        event.target.disabled = true;

        const response = await fetch("/groupLeave", { //fetch a request to DELETE the group relation for the active user
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: activeUserID,
                groupId: groupId
            })
        });
        if (response.ok) { //if query was succesful reload the page
            event.target.innerText = "Left group!";
            setTimeout (() => {
                location.reload(); 
            }, 500)
        }
    } catch (err) {
        console.error(`Failed to leave group for user w id: ${activeUserID.id} from group w id: ${groupId}`, err);
        event.target.innerText = "Leave group";
        event.target.disabled = false;
    }
}

async function applyToJoinHandler(event, groupId, activeUserId) {
    try {
        event.target.innerText = "Application requested..."
        event.target.disabled = true;
        
        const response = await fetch("/groupApply", {
            method: "POST",
            body: JSON.stringify({
                userId: activeUserId,
                groupId: groupId})
        });
        if (response.ok) {
            event.target.innerText = "Application pending"
            setTimeout(() => {
                location.reload();
            }, 500);
        }
    } catch (error) {
        console.error(`Failed to join group for user w id: ${activeUserId} for group id: ${groupId}`, err);
        event.target.innerText = "Apply to join group";
        event.target.disabled = false;
    }
}

initializePage();