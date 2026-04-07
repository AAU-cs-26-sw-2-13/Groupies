import { initializeHeader } from "./loadHeader.js"
//The socket connection
let socket = io()

//HTML ELEMENTS
let header = document.querySelector("header")
let userContacts = document.querySelector(".userContactList")
let groupContacts = document.querySelector(".groupContactList")
let chatList = document.querySelector(".chatHistoryList")
let sendMessage = document.querySelector(".sendMessageButton")
let messageInput = document.querySelector(".messageInputBox")
let activeChatName = document.querySelector(".activeChatName")
let activeChatImage = document.querySelector(".activeChatImage")

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

//Listens for update of contact information
socket.on('updateChatInfo', (data)=>{
    activeChatImage.setAttribute("src", data[0].picture) 
    activeChatName.textContent =  data[0].full_name
})

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
        //Get the old chat history
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
             //Joins the socket room
            socket.emit('join-chat', {
                userId: user.user_id,
                targetId: chatId
            })
            //Scroll to the buttom
            chatList.scrollTo(0, chatList.scrollHeight)

            //Removes possible old active listeners
            socket.off('messageClient')
            //Listens for new chats
            socket.on('messageClient', data=>{
                console.log(data)
                if(data.sender === user.user_id){
                    createOwnMessage(data.message)
                }else{
                    createOpponenMessage(data.message)
                }
                chatList.scrollTo(0, chatList.scrollHeight)
            })
        })
    }else{
        console.log("No active chats")
    }
}
loadChat()
//Add event listener for sending a message
sendMessage.addEventListener('click', ()=>{
    let activeChat = new URL(window.location.href)
    let chatId = activeChat.searchParams.get("id")
    if(messageInput.value !== ""){
        socket.emit('message', {
                userId: user.user_id,
                targetId: chatId,
                message: messageInput.value
            })
        messageInput.value = ""
    }
})



//HTML FOR GENERATING USER CONTACT
function generateUserContact(uc){
    console.log(uc)
    //List item
    let listItem = document.createElement("li")
    userContacts.append(listItem)
    
    //Contact Div
    let contactDiv = document.createElement("div")
    contactDiv.setAttribute("class", "userContactElement")

    listItem.append(contactDiv)

    //Event listener for loading new chat
     contactDiv.addEventListener('click', () =>{
        window.history.pushState(null,"", `/chat/users/?id=${uc.id}`)
        activeChatImage.setAttribute("src",uc.picture)
        activeChatName.textContent = uc.contact_name
        loadChat()
    })

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

