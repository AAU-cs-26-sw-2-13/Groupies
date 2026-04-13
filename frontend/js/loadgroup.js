import { createUserHTML } from "./createUser.js"
import { initializeHeader } from "./loadHeader.js"

let user = { user_id: null }

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

    let joinButton = document.createElement("button")
    joinButton.setAttribute("class", "button button1")
    joinButton.textContent = "Apply to join group"
    joinButton.id = "joinButton_id";

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
                createSuggestActityButton(tripInfo);
                changeApplyToJoinButton(hostID, groupId, user.user_id, membersList, members, joinButton);
            }
        }
        if (!isAMember) { //the user is not a member or organizer, should have the option to join the group
            joinButton.addEventListener('click', (event) => { applyToJoinHandler(event, groupId, user.user_id) }, {once: true});
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

    //group activities develop here and append to tripInfo
    let activities = document.createElement("p")
    activities.setAttribute("class", "p1")
    activities.textContent = "Planned activities:"

    //check if user is a member to the group, if use create button which allows them to suggest a activity
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

function createSuggestActityButton (groupInfo) {
let suggestActivityButton = document.createElement("button");
    suggestActivityButton.setAttribute("class", "button button1");
    suggestActivityButton.textContent = "Suggest an Activity";
    groupInfo.append(suggestActivityButton);
    return;
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