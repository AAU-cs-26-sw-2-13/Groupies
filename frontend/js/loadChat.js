import { initializeHeader } from "./loadHeader.js"

//HTML ELEMENTS
let header = document.querySelector("header")
let userContacts = document.querySelector(".userContactList")
let groupContacts = document.querySelector(".groupContactList")
let chatList = document.querySelector(".chatHistoryList")



let user = await fetch("/me", {
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
    return user
}).catch(err => {
    window.location.href = "/"
});

//Load user contacts
fetch(`getUserContacs/?ownUser=${user.user_id}`).then(response => {
    console.log(response.status)
    if(response.status === 200){
        return response.json()
    }else{
        throw "Couldnt fetch users"
    }
}).then(jsonReponse => {
    console.log(jsonReponse)
    for(let uc of jsonReponse){
        generateUserContact(uc)
    }
})

//Get chat history
function loadChat(){
    chatList.replaceChildren()
    let activeChat = new URL(window.location.href)
    let chatId = activeChat.searchParams.get("id")
    if(chatId){
        fetch(`getChatHistory/?ownUser=${user.user_id}&chatUser=${chatId}`).then(response=>{
            if(response.status === 200){
                return response.json()
            }else{
                throw "Couldnt fetch users"
            }
        }).then(jsonReponse =>{
            console.log(jsonReponse)
            for(let m of jsonReponse){
                if(m.sender_id === user.user_id){
                    createOwnMessage(m.chat_text)
                }else{
                    createOpponenMessage(m.chat_text)
                }
            }
        })
    }else{
        console.log("No active chats")
    }
}
loadChat()




//HTML FOR GENERATING USER CONTACT
function generateUserContact(uc){
    //List item
    let listItem = document.createElement("li")
    userContacts.append(listItem)
    
    //Contact Div
    let contactDiv = document.createElement("div")
    contactDiv.setAttribute("class", "userContactElement")
    contactDiv.addEventListener('click', () =>{
        window.history.pushState(null,"", `/chat/users/?id=${uc.id}`)
        loadChat()
    })
    contactDiv.dataset.id = uc.id
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
    profileButton.addEventListener('click', ()=>{
        window.location.href = `/profile/?id=${uc.id}`
    })
    contactDiv.append(profileButton)

    //profileImg
    let profileImg = document.createElement("img")
    profileImg.setAttribute("class", "userImage")
    profileImg.setAttribute("src", uc.picture)
    contactInfo.append(profileImg)

    //Profile name
    let profileName = document.createElement("p")
    profileName.setAttribute("class", "userContactName")
    profileName.textContent = uc.contact_name
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

function createOpponenMessage(message){
    let textElement = document.createElement("p")
    textElement.setAttribute("class", "opponentChatter")
    textElement.textContent = message
    chatList.append(textElement)
}

function createOwnMessage(message){
    let textElement = document.createElement("p")
    textElement.setAttribute("class", "currentChatter")
    textElement.textContent = message
    chatList.append(textElement)
}

generateGroupContact()
generateGroupContact()
generateGroupContact()

