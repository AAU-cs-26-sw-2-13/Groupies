import { createUserHTML } from "../js/User_creation.js"


let tripid = document.querySelector("#tripid")


//Generates the HTML object for a group
function createGroup(){
   let container = document.createElement("div")
    container.setAttribute("class", "groupPage")

    let tripInfo = document.createElement("div")
    tripInfo.setAttribute("class", "groupMain")

    let groupImg = document.createElement("img")
    groupImg.setAttribute("class", "groupImg")
    groupImg.setAttribute("src", "../img/notFound.jpg")

    let tripName = document.createElement("h2")
    tripName.setAttribute("class", "h2")
    const title = sessionStorage.getItem("title")
     tripName.textContent= title 

    let hostedBy = document.createElement("p")
    hostedBy.setAttribute("class", "p1")
    const host = sessionStorage.getItem("host")
    const maxAllowed = sessionStorage.getItem("maxusers")
    let membercount = 0

 //group members list
    const groupId = sessionStorage.getItem("id")
let membersList = document.createElement("div")
 membersList.setAttribute("class", "membersList")

fetch("/", {method: "POST", body: JSON.stringify({sessionId: "empty", query: "groupMembers", groupId: groupId})})
    .then(r => r.json())
    .then(members => {
                createUserHTML(members,membersList) 
                membercount = members.length
                hostedBy.textContent = "Organized by " + host + " with " + membercount + "/" + maxAllowed
    })
       


    let aboutInfo = document.createElement("p")
    aboutInfo.setAttribute("class", "groupAbout")
    const about = sessionStorage.getItem("about")
    aboutInfo.textContent = about


     let dates = document.createElement("p")
    dates.setAttribute("class", "p1")
    dates.textContent = formatDate(sessionStorage.getItem("dateStart")) + " - " + formatDate(sessionStorage.getItem("dateEnd"))       
    
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
        backButton.addEventListener("click", ()=>{ window.location.href = "/"})
        
    let joinButton = document.createElement("button")
        joinButton.setAttribute("class", "button button1")
        joinButton.textContent = "Apply to join trip"
    
        buttons.append(backButton, joinButton)


let tagsList = document.createElement("div")
 tagsList.setAttribute("class", "membersList")

//The tags display 
fetch("/", {method: "POST", body: JSON.stringify({sessionId: "empty", query: "groupTags", groupId: groupId})})
    .then(r => r.json())
    .then(tags => {

           for(let t of tags){

             if (t!== null){
            let genre = document.createElement("li")
            genre.setAttribute("class", "pref-item")
            genre.textContent = t
            tagsList.append(genre)
        }}
     })
       



    membersElement.append(membersTitle,membersList,buttons)
    container.append(tripInfo, membersElement)
    return container
}

//change the date format to properly display date
function formatDate(dateString){
    if(!dateString) return "TBD"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", { 
        day: "numeric", 
        month: "long", 
        year: "numeric" 
    })
}




tripid.append(createGroup())