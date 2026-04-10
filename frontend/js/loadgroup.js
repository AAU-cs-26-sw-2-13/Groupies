import { createUserHTML } from "./User_creation.js"
import { initializeHeader } from "./loadHeader.js"

let user = { user_id: null }
let header = document.querySelector("header")
let submitting = 0;
fetch("/me", {
    method: "GET",
    credentials: "include"
}).then(response => {
    if (response.status === 200) {
        return response.json();
    } else {
        // Not logged in: Initialize header with null user
        initializeHeader(header, null, "Group");
        throw "Session not found";
    }
}).then(jsonResponse => {
    // Logged in: Initialize header with user data
    user = jsonResponse
    initializeHeader(header, user, "Group");
}).catch(err => {
    console.log("Auth Check:", err);
});


let tripid = document.querySelector("#tripid")
const pageURL = new URL(window.location.href)
const groupId = pageURL.searchParams.get("id")
fetch(`groupInfo?id=${groupId}`).then(response => {
    return response.json()
}).then(jsonResponse => {
    tripid.append(createGroup(jsonResponse))
})


function createGroup(groupInfo) {
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
    const host = groupInfo.host_name
    const maxAllowed = groupInfo.max_members
    let membercount = 0

    //group members list
    let membersList = document.createElement("div")
    membersList.setAttribute("class", "membersList")
    let suggestActivityButton = document.createElement("button")
    suggestActivityButton.setAttribute("class", "suggestActivityButt")
    suggestActivityButton.textContent = "Suggest an Activity"

    fetch("/groupMembers", { method: "POST", body: JSON.stringify({ groupId: groupId }) })
        .then(r => r.json())
        .then(members => {
            //console.log("attempting to create memberslist...")
            createUserHTML(members, membersList)
            membercount = members.length
            hostedBy.textContent = "Organized by " + host + " with " + membercount + "/" + maxAllowed

            //looks thorugh all members, if the user is in the group as member, a button gets created
            for (let m of members) {
                let member = m.id
                //console.log(member)
                //console.log(user.user_id)
                if (user.user_id === member) {
                    activities.append(suggestActivityButton)
                    return
                }
            }
        }).catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });



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
    membersTitle.textContent = "Trip Members"
    membersElement.append(membersTitle)


    //buttons
    let buttons = document.createElement("div")
    buttons.setAttribute("class", "groupActions")

    let backButton = document.createElement("button")
    backButton.setAttribute("class", "buttonBack")
    backButton.setAttribute("type", "button")
    backButton.textContent = "Back"
    backButton.addEventListener("click", () => { window.location.href = "/" })

    let joinButton = document.createElement("button")
    joinButton.setAttribute("class", "button1")
    joinButton.textContent = "Apply to join trip"

    buttons.append(backButton, joinButton)


    let tagsList = document.createElement("div")
    tagsList.setAttribute("class", "groupTags")

    //The tags display 
    fetch("/groupTags", { method: "POST", body: JSON.stringify({ groupId: groupId }) })
        .then(r => r.json())
        .then(tags => {
            for (let t of tags) {
                if (t !== null) {
                    let genre = document.createElement("l1")
                    genre.setAttribute("class", "pref-item")
                    genre.textContent = t.tag_id
                    tagsList.append(genre)
                }
            }
        })
    tripInfo.append(tagsList)

    //group activities start here
    let activities = document.createElement("p")
    activities.setAttribute("class", "activityPlanText")
    activities.textContent = "Planned activities:"

    //hide the memberlist, and show new elements, that create the activity, 
    suggestActivityButton.addEventListener("click", () => {
        let createActivity = document.createElement("div")
        createActivity.setAttribute("class", "aside-box")
        membersElement.style.display = "none"
        suggestActivityButton.disabled = true
        let activityHead = document.createElement("h2")
        activityHead.textContent = "Suggest an activity"
        //litteraly same code for input as createGroup.js(with different textual content)
        let activityTitle = document.createElement("input")
        activityTitle.setAttribute("type", "text")
        activityTitle.setAttribute("class", "text-input-box") //need to do smth about the look as a whole as it was based on smth else before.
        activityTitle.setAttribute("placeholder", "Enter activity name")

        let dateRow = document.createElement("div")
        dateRow.setAttribute("class", "center-align")

        let calendarIcon1 = document.createElement("i")
        calendarIcon1.setAttribute("class", "fa-regular fa-calendar")
        let calendarIcon2 = document.createElement("i")
        calendarIcon2.setAttribute("class", "fa-regular fa-calendar")

        let startLabel = document.createElement("label")
        startLabel.setAttribute("class", "trip-interactable-boxes")
        let startText = document.createElement("span")
        startText.textContent = " Start Date"
        let activityStart = document.createElement("input")
        activityStart.setAttribute("type", "date")
        activityStart.setAttribute("class", "tripDisplayCreate")
        startLabel.append(calendarIcon1, startText, activityStart)
        startLabel.addEventListener("click", (e) => {
            e.preventDefault()
            activityStart.showPicker()
        })
        activityStart.addEventListener("change", () => {
            startText.textContent = " " + activityStart.value || " Start Date"
            startText.style.color = activityStart.value ? "#333" : "#717171"
        })

        dateRow.append(startLabel)

        let activityDesc = document.createElement("textarea")
        activityDesc.setAttribute("type", "text")
        activityDesc.setAttribute("class", "description")
        activityDesc.setAttribute("placeholder", "Describe the activity")
        activityDesc.setAttribute("maxlength", "420") //maybe have a smaller limit?(same as the group desc rn)

        createActivity.append(activityHead, activityTitle, dateRow, activityDesc)

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
            //same checks as in creategroup, still has the downsides of being able to be injected into
            if (!activityTitle.value.trim()) {
                alert("Activity name is required")
                return
            }
            if (!activityStart.value) { //maybe make the activites check if they are within the trip group dates    
                alert("Start date is required")
                return
            }
            const today = new Date().toISOString().split("T")[0]
            if (activityStart.value < today) {
                alert("Start date cannot be in the past")
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
                    activityItem.setAttribute("class", "trip")
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
