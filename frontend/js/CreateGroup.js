let HTMLdoc = document.querySelector("#CreateGroup")

//Generates the HTML
function createHTML(){
    let container = document.createElement("div")
    container.setAttribute("class", "createTripPage")

    let page = document.createElement("div")
    page.setAttribute("class", "register-box-top")
    let pageHeader = document.createElement("h3")
    pageHeader.textContent = "Trip Creation"
    let inputholder = document.createElement("div")
    inputholder.setAttribute("class", "register-box")

    let infoTitle = document.createElement("p")
    infoTitle.setAttribute("class", "p1")
    infoTitle.textContent = "Information"

   //group creation input fields
    let groupTitle = document.createElement("input")
    groupTitle.setAttribute("type", "text")
    groupTitle.setAttribute("class", "reg-box-inputs")
    groupTitle.setAttribute("placeholder", "Enter Trip title")

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
    let tripStart = document.createElement("input")
    tripStart.setAttribute("type", "date")
    tripStart.setAttribute("class", "tripDisplayCreate")
    startLabel.append(calendarIcon1,startText,tripStart)
    startLabel.addEventListener("click", (e) => {
        e.preventDefault()
        tripStart.showPicker()})
    tripStart.addEventListener("change", () => {
    startText.textContent = " " + tripStart.value || " Start Date"
    startText.style.color = tripStart.value ? "#333" : "#717171"})

    let endLabel = document.createElement("label")
    endLabel.setAttribute("class", "trip-interactable-boxes")
    let endText = document.createElement("span")
    endText.textContent = " End Date" 
    let tripEnd = document.createElement("input")
    tripEnd.setAttribute("type", "date")
    tripEnd.setAttribute("class", "tripDisplayCreate")
    endLabel.append(calendarIcon2,endText,tripEnd)
    endLabel.addEventListener("click", (e) => {
        e.preventDefault()
        tripEnd.showPicker()})
    tripEnd.addEventListener("change", () => {
    endText.textContent = " " + tripEnd.value || " End Date"
    endText.style.color = tripEnd.value ? "#333" : "#717171"})

    dateRow.append(startLabel, endLabel)

    let groupDest = document.createElement("input")
    groupDest.setAttribute("type", "text")
    groupDest.setAttribute("class", "reg-box-inputs")
    groupDest.setAttribute("placeholder", "Enter destination")

    let groupDesc = document.createElement("input")
    groupDesc.setAttribute("type", "text")
    groupDesc.setAttribute("class", "reg-box-inputs")
    groupDesc.setAttribute("placeholder", "Description (optional)")

    let fileIconEl = document.createElement("i")
    fileIconEl.setAttribute("class", "fa-regular fa-image")
    let fileLabel = document.createElement("label")
    fileLabel.setAttribute("class", "trip-interactable-boxes")
    let fileIcon = document.createElement("span")
    fileIcon.textContent = " Trip Photo (optional)"
    let tripImg = document.createElement("input")
    tripImg.setAttribute("type", "file")
    tripImg.setAttribute("accept", "image/*")
    tripImg.style.display = "none"
    fileLabel.append(fileIconEl, fileIcon, tripImg)

    let MemberTitle = document.createElement("p")
    MemberTitle.setAttribute("class", "p1")
    MemberTitle.textContent = "Membership"

    let Members = document.createElement("input")
    Members.setAttribute("type", "number")
    Members.setAttribute("class", "reg-box-inputs")
    Members.setAttribute("placeholder", "Maximum joinable members")

    let membershipRow = document.createElement("div")
    membershipRow.setAttribute("class", "center-align")

    let openBtn = document.createElement("button")
    openBtn.setAttribute("type", "button")
    openBtn.setAttribute("class", "button button1")
    openBtn.textContent = "Open"
    let requestsBtn = document.createElement("button")
    requestsBtn.setAttribute("type", "button")
    requestsBtn.setAttribute("class", "button passive")
    requestsBtn.textContent = "Requests"

    let membershipType = 0  // 0 = open, 1 = requests

    openBtn.addEventListener("click", () => {
    membershipType = 0
    openBtn.setAttribute("class", "button button1")
    requestsBtn.setAttribute("class", "button passive")
    })
    requestsBtn.addEventListener("click", () => {
    membershipType = 1
    requestsBtn.setAttribute("class", "button button1")
    openBtn.setAttribute("class", "button passive")
    })
    membershipRow.append(openBtn, requestsBtn)

     //buttons
    let buttons = document.createElement("div")
    buttons.setAttribute("class", "groupActions")

     let backButton = document.createElement("button")
        backButton.setAttribute("class", "buttonBack")
        backButton.setAttribute("type", "button")
        backButton.textContent = "Back"
        backButton.addEventListener("click", ()=>{ window.location.href = "/"})
        
    let submitButton = document.createElement("button")
    submitButton.setAttribute("class", "button CreateTripButton")
    submitButton.textContent = "Finish trip creation"
    submitButton.addEventListener("click", () => {
        
    if(!groupTitle.value.trim()){
        alert("Group title is required")
        return
    }
    if(!groupDest.value.trim()){
        alert("Destination is required")
        return
    }
    if(!tripStart.value){
        alert("Start date is required")
        return
    }
    if(!tripEnd.value){
        alert("End date is required")
        return
    }
    if(!Members.value){
        alert("Member limit is required")
        return
    }    

       submitButton.disabled = true
   
       // fetch the user, so the host id for the group can be set to the user id
       let user = { user_id: null }
       fetch("/me", {
       method: "GET",
       credentials: "include"
       }).then(response => {
       if (response.status === 200) {
       return response.json()}}).then(jsonResponse => {
        user = jsonResponse;   
        //insert into group db and refer the user back to main page
        fetch("/createTrip", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({
        host_user_id: user.user_id,
        title: groupTitle.value,
        destination: groupDest.value,
        about: groupDesc.value,
        date_start_at: tripStart.value,  
        date_end_at: tripEnd.value,
        max_members: Members.value,
        group_openess: membershipType})}).then(r => r.json())
        .then(() => {window.location.href = "/"})
        })  
        })
    
    buttons.append(backButton, submitButton)
    inputholder.append(infoTitle, groupTitle, dateRow, groupDest, groupDesc,fileLabel, MemberTitle, membershipRow, Members, buttons)
    page.append(pageHeader, inputholder)
    container.append(page)
    return container
}

HTMLdoc.append(createHTML())