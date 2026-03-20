import { createUserHTML } from "../js/User_creation.js"


let tripid = document.querySelector("#tripid")


//Generates the HTML object for a group
function createGroup(){
   let container = document.createElement("div")
    container.setAttribute("class", "groupPage")

    // info abt the trip(left side)
    let left = document.createElement("div")
    left.setAttribute("class", "groupMain")


    let img = document.createElement("img")
    img.setAttribute("class", "groupImg")
    img.setAttribute("src", "../img/notFound.jpg")

    let Tripname = document.createElement("h2")
    Tripname.setAttribute("class", "h2")
    const title = sessionStorage.getItem("title")
     Tripname.textContent= title 

    let hostedBy = document.createElement("p")
    hostedBy.setAttribute("class", "p1")
    const host = sessionStorage.getItem("host")
    const maxAllowed = sessionStorage.getItem("maxusers")

    hostedBy.textContent = "Organized by " + host + " with " + "1/" + maxAllowed //rewrite so the 1 is not static but reflects the proper amount of joined users

    let aboutInfo = document.createElement("p")
    aboutInfo.setAttribute("class", "groupAbout")
    const about = sessionStorage.getItem("about")
    aboutInfo.textContent = about


     let dates = document.createElement("p")
    dates.setAttribute("class", "p1")
    const startDate = sessionStorage.getItem("dateStart")
    const endDate = sessionStorage.getItem("dateEnd")
    dates.textContent = formatDate(sessionStorage.getItem("dateStart")) + " - " + formatDate(sessionStorage.getItem("dateEnd"))       
    
let imageInfoRow = document.createElement("div")
imageInfoRow.setAttribute("class", "groupImageInfo")


let infoText = document.createElement("div")
infoText.setAttribute("class", "groupInfo")

    infoText.append(hostedBy, aboutInfo, dates)
    imageInfoRow.append(img, infoText)

    left.append(Tripname, imageInfoRow)


    //trip members(right side)
    let right = document.createElement("div")
    right.setAttribute("class", "aside-box")

    let membersTitle = document.createElement("h2")
    membersTitle.textContent = "Trip Members"
    right.append(membersTitle)


const groupId = sessionStorage.getItem("id")
let membersList = document.createElement("div")

fetch("/", {method: "POST", body: JSON.stringify({sessionId: "empty", query: "groupMembers", groupId: groupId})})
    .then(r => r.json())
    .then(members => {
                createUserHTML(members,membersList)   
                right.append(membersTitle,membersList,buttons)
    })



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

        container.append(left, right)

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