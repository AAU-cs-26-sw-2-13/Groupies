import { initializeHeader } from "./loadHeader.js"

//HTML ELEMENTS
let header = document.querySelector("header")
let userContacts = document.querySelector(".userContactList")
let groupContacts = document.querySelector(".groupContactList")



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
    window.location.href = "/"
});

//Load user contacts
fetch("getUserContacs").then(response => {
    if(response.status === 200){
        return response.json()
    }else{
        throw "Couldnt fetch users"
    }
}).then(jsonReponse => {
    console.log(jsonReponse)
})


//HTML FOR GENERATING USER CONTACT
function generateUserContact(){
    //List item
    let listItem = document.createElement("li")
    userContacts.append(listItem)
    
    //Contact Div
    let contactDiv = document.createElement("div")
    contactDiv.setAttribute("class", "userContactElement")
    listItem.append(contactDiv)

    //User contact info
    let contactInfo = document.createElement("div")
    contactInfo.setAttribute("class", "usercontactInfo")
    contactDiv.append(contactInfo)

    //Profile button
    let profileButton = document.createElement("button")
    profileButton.setAttribute("class", "button2")
    profileButton.setAttribute("type", "button")
    profileButton.textContent = "Profile"
    contactDiv.append(profileButton)

    //profileImg
    let profileImg = document.createElement("img")
    profileImg.setAttribute("class", "userImage")
    profileImg.setAttribute("src", "/img/accountPlaceholder.svg")
    contactInfo.append(profileImg)

    //Profile name
    let profileName = document.createElement("p")
    profileName.setAttribute("class", "userContactName")
    profileName.textContent = "Julie"
    contactInfo.append(profileName)
}

function generateGroupContact(){
    //List item
    let listItem = document.createElement("li")
    groupContacts.append(listItem)
    
    //Contact Div
    let contactDiv = document.createElement("div")
    contactDiv.setAttribute("class", "userContactElement")
    listItem.append(contactDiv)

    //group contact info
    let contactInfo = document.createElement("div")
    contactInfo.setAttribute("class", "usercontactInfo")
    contactDiv.append(contactInfo)

    //group button
    let profileButton = document.createElement("button")
    profileButton.setAttribute("class", "button2")
    profileButton.setAttribute("type", "button")
    profileButton.textContent = "Group"
    contactDiv.append(profileButton)

    //group img
    let profileImg = document.createElement("img")
    profileImg.setAttribute("class", "userImage")
    profileImg.setAttribute("src", "/img/notFound.jpg")
    contactInfo.append(profileImg)

    //group Text div
    let textDiv = document.createElement("div")
    textDiv.setAttribute("class", "tripContactTextInfo")
    contactInfo.append(textDiv)

    //Contact Name
    let contactName = document.createElement("p")
    contactName.textContent = "Italy 2026"
    textDiv.append(contactName)

    let tripStart = document.createElement("p")
    tripStart.textContent = "July 19, 2026 -"
    textDiv.append(tripStart)

    let tripEnd = document.createElement("p")
    tripEnd.textContent = "August 19, 2026"
    textDiv.append(tripEnd)
}

generateUserContact()
generateGroupContact()
generateGroupContact()
generateGroupContact()

