
let HTMLdoc = document.querySelector("#CreateGroup")




//Generates the HTML
function createHTML(){
   let container = document.createElement("div")


   //group creation input fields
    let inputholder = document.createElement("div")

   let groupTitle = document.createElement("input")
    groupTitle.setAttribute("type", "text")
    groupTitle.setAttribute("placeholder", "Enter group title")

    let groupDest = document.createElement("input")
    groupDest.setAttribute("type", "text")
    groupDest.setAttribute("placeholder", "Enter destination")

    let groupDesc = document.createElement("input")
    groupDesc.setAttribute("type", "text")
    groupDesc.setAttribute("placeholder", "Describe the journey (optional)")
    
    let tripStart = document.createElement("input")
    tripStart.setAttribute("type", "date")
    tripStart.setAttribute("placeholder", "Journey start date") //does not work like this

     let tripEnd = document.createElement("input")
     tripEnd.setAttribute("type", "date")
     tripEnd.setAttribute("placeholder", "Journey end date") //does not work like this

    let tripImg = document.createElement("input")
     tripImg.setAttribute("type", "file")
     tripImg.setAttribute("accept", "image/*")
     tripImg.setAttribute("placeholder", "Journey picture(optional)") //does not work like this

    let Members = document.createElement("input")
     Members.setAttribute("type", "number")
     Members.setAttribute("placeholder", "Maximum joinable members")


     

    inputholder.append(groupTitle, groupDest, groupDesc, tripStart, tripEnd, tripImg, Members)

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
        alert("Maximum members is required")
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
        max_members: Members.value})}).then(r => r.json())
        .then(() => {window.location.href = "/"})
        })  
        })
    
    buttons.append(backButton, submitButton)
    container.append(inputholder,buttons)
    return container
}



/* THINGS from group that need to be implemented    
CREATE TABLE IF NOT EXISTS `groups` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    host_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    title VARCHAR(100) NOT NULL,
    destination VARCHAR(200),
    about TEXT, 
    date_start_at DATETIME, 
    date_end_at DATETIME,
    picture BLOB,
    max_members INT NOT NULL,

    FOREIGN KEY (host_user_id) REFERENCES users(id) ON DELETE CASCADE
);
*/



HTMLdoc.append(createHTML())