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
let chatBox = document.querySelector(".chatBox")

//Local variables

/*
The variables below makes sure when you write to a new person, they pup up as an contact without -
refreshing. 
*/
let isUserContactNew = true //Makes sure its only searched once
let userContactsList; //Contains all the current contacts

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
    console.log(data)
    activeChatImage.setAttribute("src", data[0].picture) 
    activeChatName.textContent =  data[0].title
})

//Load user contacts
fetch(`/chat/getUserContacs/?ownUser=${user.user_id}`).then(response => {
    if(response.status === 200){
        return response.json()
    }else{
        throw "Couldnt fetch users"
    }
}).then(jsonReponse => {
    userContactsList = jsonReponse
    for(let uc of jsonReponse){
        generateUserContact(uc)
    }
})

fetch(`/chat/getGroupContacs/?ownUser=${user.user_id}`).then(response => {
    if(response.status === 200){
        return response.json()
    }else{
        throw "Couldnt fetch groups"
    }
}).then(jsonReponse => {
    for(let g of jsonReponse){
        generateGroupContact(g)
    }
})

//Load chat
loadChat()

//Get chat history
function loadChat(){
    isUserContactNew = true
    chatList.replaceChildren()
    let activeChat = new URL(window.location.href)
    let chatId = activeChat.searchParams.get("id")
    let urlChatType = window.location.href.split("/")[4] //Users or groups :)
    if(window.location.href.split("/").length !== 6){  //Not in any active chats
        chatBox.setAttribute("class", "hidden")
    }else{ //Is in an active chat
        if(chatId){
            chatBox.setAttribute("class", "chatBox")
            //Get the old chat history
            fetch(`getChatHistory/?ownUser=${user.user_id}&chatUser=${chatId}`).then(response=>{
                if(response.status === 200){
                    return response.json()
                }else{
                    throw "Couldnt fetch users"
                }
            }).then(jsonReponse =>{
                console.log(urlChatType)
                if(urlChatType === "groups"){
                    console.log("GROUP")
                    for(let m of jsonReponse){
                        if(m.sender_id === user.user_id){
                            createOwnMessage(m.chat_text)
                        }else{
                            createOpponenMessageGroup(m.chat_text, m.sender_name)
                        }
                    }
                }else{
                    for(let m of jsonReponse){
                        if(m.sender_id === user.user_id){
                            createOwnMessage(m.chat_text)
                        }else{
                            createOpponenMessage(m.chat_text)
                        }
                    }
                }
                
                //Joins the socket room
                socket.emit('join-chat', {
                    userId: user.user_id,
                    targetId: chatId,
                    chatType: urlChatType
                })
                //Scroll to the buttom
                chatList.scrollTo(0, chatList.scrollHeight)

                //Removes possible old active listeners
                socket.off('messageClient')
                //Listens for new chats
                socket.on('messageClient', data=>{
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
}
//Add event listener for sending a message
sendMessage.addEventListener('click', ()=>{
    let activeChat = new URL(window.location.href)
    let urlChatType = window.location.href.split("/")[4] //Users or groups :)
    let stringPath = activeChat.toString()
    let pathArray = stringPath.split("/")
    let chatId = activeChat.searchParams.get("id")
    if(messageInput.value !== ""){
        //Check if the user already exist, otherwise add as an contact
        if(isUserContactNew){
            for(let u of userContactsList){
                if (u.id == chatId){
                    isUserContactNew = false
                    break
                }
            }
            if(isUserContactNew){
                if(pathArray[3] === "chat"){
                    isUserContactNew = false
                    generateUserContact(
                        {
                            id: chatId,
                            contact_name: activeChatName.textContent, 
                            picture: activeChatImage.getAttribute("src")
                        })
                }
            }
        }
        socket.emit('message', {
                userId: user.user_id,
                targetId: chatId,
                message: messageInput.value,
                chatType: urlChatType
            })
        messageInput.value = ""
    }
})



//HTML FOR GENERATING USER CONTACT
function generateUserContact(uc){
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

function generateGroupContact(group){
    //List item
    let listItem = document.createElement("li")
    groupContacts.append(listItem)
    
    //Contact Div
    let contactDiv = document.createElement("div")
    contactDiv.setAttribute("class", "userContactElement")
    listItem.append(contactDiv)

    contactDiv.addEventListener('click', () =>{
        window.history.pushState(null,"", `/chat/groups/?id=${group.group_id}`)
        activeChatImage.setAttribute("src",group.picture)
        activeChatName.textContent = group.title
        loadChat()
    })

    //group contact info
    let contactInfo = document.createElement("div")
    contactInfo.setAttribute("class", "usercontactInfo")
    contactDiv.append(contactInfo)

    //group button
    let profileButton = document.createElement("button")
    profileButton.setAttribute("class", "button2")
    profileButton.setAttribute("type", "button")
    profileButton.textContent = "Group"
    profileButton.addEventListener('click', ()=>{
        window.location.href = `/group/?id=${group.group_id}`
    })
    contactDiv.append(profileButton)

    //group img
    let profileImg = document.createElement("img")
    profileImg.setAttribute("class", "userImage")
    profileImg.setAttribute("src", group.picture)
    contactInfo.append(profileImg)

    //group Text div
    let textDiv = document.createElement("div")
    textDiv.setAttribute("class", "tripContactTextInfo")
    contactInfo.append(textDiv)

    //Contact Name
    let contactName = document.createElement("p")
    contactName.textContent = group.title
    textDiv.append(contactName)

    let tripStart = document.createElement("p")
    tripStart.textContent = group.date_start_at.split("T")[0]
    textDiv.append(tripStart)

    let tripEnd = document.createElement("p")
    tripEnd.textContent = group.date_end_at.split("T")[0]
    textDiv.append(tripEnd)
}

function createOpponenMessage(message){
    let textElement = document.createElement("p")
    textElement.setAttribute("class", "opponentChatter")
    textElement.textContent = message
    chatList.append(textElement)
}

function createOpponenMessageGroup(message,sender_name){
    let textContainer = document.createElement("div")
    let sender = document.createElement("p")
    sender.setAttribute("class","chatSenderText")
    sender.textContent = sender_name
    let textElement = document.createElement("p")
    textElement.setAttribute("class", "opponentChatter")
    textElement.textContent = message
    textContainer.append(sender)
    textContainer.append(textElement)
    chatList.append(textContainer)
}

function createOwnMessage(message){
    let textElement = document.createElement("p")
    textElement.setAttribute("class", "currentChatter")
    textElement.textContent = message
    chatList.append(textElement)
}


