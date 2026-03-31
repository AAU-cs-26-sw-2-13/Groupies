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

    let formRow = document.createElement("div")
    formRow.setAttribute("class", "createTripFormRow")
    let infoSide = document.createElement("div")
    infoSide.setAttribute("class", "createTripLeft")

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

    let groupDesc = document.createElement("textarea")
    groupDesc.setAttribute("type", "text")
    groupDesc.setAttribute("class", "description")
    groupDesc.setAttribute("placeholder", "Description (optional)")

    let fileIcon = document.createElement("i")
    fileIcon.setAttribute("class", "fa-regular fa-image")
    let fileLabel = document.createElement("label")
    fileLabel.setAttribute("class", "trip-interactable-boxes")
    let fileText = document.createElement("span")
    fileText.textContent = " Trip Photo"
    let tripImg = document.createElement("input")
    tripImg.setAttribute("type", "file")
    tripImg.setAttribute("accept", "image/*")
    tripImg.style.display = "none"
    let preview = document.createElement("img")
    preview.setAttribute("class", "groupImg")
    preview.style.display = "none" //hide preview until a picture is uploaded
    let validImageData = null
    tripImg.addEventListener("change", () => {
    const file = tripImg.files[0]    
    if(file){
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"]
        if(!allowedTypes.includes(file.type)){
            alert("Unsupported file format")  
            tripImg.value = ""
            return
        }
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (e) => {
        validImageData = e.target.result
        preview.setAttribute("src", validImageData)
        preview.style.display = "block"
        fileText.textContent = " Change Photo"
    }}})

    fileLabel.append(fileIcon, fileText, tripImg,preview)

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


    //tags selection
    let tagsSide = document.createElement("div")
    tagsSide.setAttribute("class", "createTripRight")

    let tagsTitle = document.createElement("p")
    tagsTitle.setAttribute("class", "p1")
    tagsTitle.textContent = "Trip Tags"

    let tagsList = document.createElement("ul")
    // Fetch possible preferences/tags to show as checkboxes
    fetch("/preferences", {method: "GET"})
    .then(r => r.json())
    .then(prefs => {
        for(let p of prefs){
            let list = document.createElement("li")
            let tagBtn = document.createElement("button")
            tagBtn.setAttribute("type", "button")
            tagBtn.setAttribute("class", "button passive")
            tagBtn.textContent = p.preference_id
            tagBtn.dataset.selected = "false"
            
            tagBtn.addEventListener("click", () => {
                if(tagBtn.dataset.selected === "false"){
                    tagBtn.setAttribute("class", "button button1")
                    tagBtn.dataset.selected = "true"
                } else {
                    tagBtn.setAttribute("class", "button passive")
                    tagBtn.dataset.selected = "false"
                }
            })
            list.append(tagBtn)
            tagsList.append(list)
        }
    })
    tagsSide.append(tagsTitle,tagsList)
     
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
    const today = new Date().toISOString().split("T")[0]  
    if(tripStart.value < today){
    alert("Start date cannot be in the past")
    return
    }
    if(tripEnd.value < tripStart.value){
    alert("End date cannot be before start date")
    return
    }
    if(!Members.value || Members.value < 1 || Members.value >= 1000){
        alert("Member limit is required or has to atleast equal 1 and less than 1000")
        return
    }
    if(!validImageData){
        alert("A trip picture is required")
        return
    }   
        const selectedTags = [...tagsSide.querySelectorAll("button[data-selected='true']")].map(btn => btn.textContent)
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
        const sendFetchImage = (imageData) => {
        fetch("/createTrip", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({
        host_user_id: user.user_id,
        title: groupTitle.value,
        destination: groupDest.value,
        about: groupDesc.value,
        date_start_at: tripStart.value,  
        date_end_at: tripEnd.value,
        picture: imageData || null,
        max_members: Members.value,
        group_openess: membershipType,
        tags_list: selectedTags})}).then(r => r.json())
        .then(() => {window.location.href = "/"})}
    
        if(validImageData)sendFetchImage(validImageData)
        else sendFetchImage(null)
    })})
    
    buttons.append(backButton, submitButton)
    infoSide.append(infoTitle, groupTitle, dateRow, groupDest, groupDesc,fileLabel)
    formRow.append(infoSide, tagsSide)
    inputholder.append(formRow, MemberTitle, membershipRow, Members, buttons)
    page.append(pageHeader, inputholder)
    container.append(page)
    return container
}

HTMLdoc.append(createHTML())