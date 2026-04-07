import { createUserHTML } from "./User_creation.js"
import { initializeHeader } from "./loadHeader.js"

let header = document.querySelector("header")

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
    let user = jsonResponse;
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

fetch("/groupMembers", {method: "POST", body: JSON.stringify({groupId: groupId})})
    .then(r => r.json())
    .then(members => {
                console.log("attempting to create memberslist...")
                createUserHTML(members,membersList) 
                membercount = members.length
                hostedBy.textContent = "Organized by " + host + " with " + membercount + "/" + maxAllowed
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
    joinButton.setAttribute("class", "button button1")
    joinButton.textContent = "Apply to join trip"

    buttons.append(backButton, joinButton)


let tagsList = document.createElement("div")
 tagsList.setAttribute("class", "groupTags")

//The tags display 
fetch("/groupTags", {method: "POST", body: JSON.stringify({groupId: groupId})})
    .then(r => r.json())
    .then(tags => {
           for(let t of tags){
             if (t!== null){
            let genre = document.createElement("l1")
            genre.setAttribute("class", "pref-item")
            genre.textContent = t.tag_id
            tagsList.append(genre)
        }}
     })
       tripInfo.append(tagsList)


    membersElement.append(membersTitle,membersList,buttons)
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



//Needs to implement code that can recoginze the current user who is logged in and remove the follow button(and maybe display some text being like "this is you")
//also the join trip button can recoginze if a user is already joined, so it switches depending on join state
tripid.append(createGroup())