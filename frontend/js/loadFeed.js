import { getCurrentUser } from "./userAPI.js";
import { login, register } from "./loginRegister.js";
import {createUserHTML} from "./User_creation.js";
import { parseTags } from "./parseJson.js";

//Queries to dom elements
let tripList = document.querySelector("#tripList")
let userList = document.querySelector("#userList")
let header = document.querySelector("header")
let buttons = document.querySelector(".pageButtons")

//Context variables
let discovered = 1;
let user = {user_id: null};
let buttonAmount;

//Generates the HTML object for a new trip
function createTrip(title, host, tags, group){
    let list = document.createElement("li")
    let article = document.createElement("article")

    let upperTripInfo = document.createElement("div")
    let lowerTripInfo = document.createElement("div")

    let tripInformation = document.createElement("div")
    let starIcon = document.createElement("i")

    let tripImage = document.createElement("img")
    let tripText = document.createElement("div")

    let tripTitle = document.createElement("p")
    let tripHost = document.createElement("p")

    let genreList = document.createElement("ul")

    article.setAttribute("class", "trip")

   //saves the data of the trip, needed for showing the group page
article.dataset.id = group.id
article.dataset.title = title
article.dataset.host = host
article.dataset.destination = group.destination
article.dataset.about = group.about
article.dataset.picture = group.picture || ""
article.dataset.dateStart = group.date_start_at || ""
article.dataset.dateEnd = group.date_end_at || ""
article.dataset.maxusers = group.max_members



    article.addEventListener('click', groupClick)

    upperTripInfo.setAttribute("class", "upperTripInfo")
    lowerTripInfo.setAttribute("class", "userPrefFront")

    tripInformation.setAttribute("class","TripInformation" )
    starIcon.setAttribute("class", "fa-regular fa-star followb")
    starIcon.addEventListener('click', followTripListener)

    tripImage.setAttribute("class", "tripImage")
    tripImage.setAttribute("src", "img/notFound.jpg")
    tripText.setAttribute("class","tripText")

    tripTitle.setAttribute("class", "tripTittle")
    tripTitle.textContent = title
    tripHost.setAttribute("class", "tripHost")
    tripHost.textContent = "Organized by "+ host

    genreList.setAttribute("class", "prefListFront")

    list.append(article)

    article.append(upperTripInfo)
    article.append(lowerTripInfo)
    
    upperTripInfo.append(tripInformation)
    upperTripInfo.append(starIcon)

    tripInformation.append(tripImage)
    tripInformation.append(tripText)
    
    tripText.append(tripTitle)
    tripText.append(tripHost)

    lowerTripInfo.append(genreList)
    
    for(let t of tags){
        if (t!== null){
            let genre = document.createElement("li")
            genre.setAttribute("class", "pref-item")
            genre.textContent = t

            genreList.append(genre)
        }
    }
    return list
}


function followTripListener(event){
    event.stopPropagation()
    if(event.target.classList.contains("fa-regular")){
        event.target.classList.remove("fa-regular")
        event.target.classList.add("fa-solid")
    }else{
        event.target.classList.add("fa-regular")
        event.target.classList.remove("fa-solid")
    }
    
}


function groupClick(event){
    //console.log(event.target)

      let Groupdata = event.currentTarget.dataset
    for(let key in Groupdata){
        sessionStorage.setItem(key, Groupdata[key])
    }

    window.location.href = "/html/group.html"
}


function createDiscoverButtons(Amount){
    let buttonsCount = Math.ceil(Amount/10)
    for(let i = 1; i<=buttonsCount; i++){
        let button = document.createElement("button")
        button.setAttribute("type","button")
        button.setAttribute("data-pnumber",i)
        button.textContent = i
        console.log("Discovered: "+discovered)
        if(i==discovered){
            console.log("The passive one is " + i)
            button.setAttribute("class","button3")
            buttons.append(button)
            continue
        }
        button.setAttribute("class","button3 passive")
        button.addEventListener('click',(event)=>{
            discovered = event.target.getAttribute("data-pnumber")
            buttons.replaceChildren()
            tripList.replaceChildren()
            createDiscoverButtons(buttonAmount)
            generateTrips(user, discovered)
        })
        buttons.append(button)
    }
}


function createHomePageLoggedIn(user){
    let mainDiv = document.createElement("div")
    mainDiv.setAttribute("class", "profile")

    //Login button
    let profileImage = document.createElement("img")
    profileImage.setAttribute("class", "profileImage")
    profileImage.setAttribute("src", "img/notFound.jpg")

    //Register button
    let username = document.createElement("p")
    username.setAttribute("class", "profileName")
    username.textContent = user.username

    mainDiv.append(username)
    mainDiv.append(profileImage)

    header.append(mainDiv)
}

function createHomePageLoggedOut(){
    //Main div
    let mainDiv = document.createElement("div");
    mainDiv.setAttribute("id", "loginregDiv");
    mainDiv.style.position = "relative";

    //Login button
    let loginButton = document.createElement("button")
    loginButton.setAttribute("class", "button")
    loginButton.setAttribute("type", "button")
    loginButton.textContent = "Login"
    loginButton.addEventListener("click", () => {console.log("login button clicked"); displayLoginBox();})

    async function displayLoginBox() {
        //if the loginBox is already visible, login button click removes i
        let existingBox = document.getElementById("login-box");
        if (existingBox) {
            existingBox.remove();
            return;
        }
        //Create the login box element from the HTML generator
        let div = document.createElement("div");
        div.innerHTML = loginBoxHTML();
        let loginBox = div.firstElementChild;

        //Position the box
        loginBox.style.position = "absolute";
        loginBox.style.width = "250px";
        loginBox.style.left = -50 + "px"; 
        loginBox.style.top = "125%"; 
        loginBox.style.zIndex = "1000";

        //Place the loginBox in the document body
        mainDiv.appendChild(loginBox);

        //Handle the validation and submission of entered fields values
        let submitBtn = document.getElementById("login_submit");
        submitBtn.addEventListener("click", async (e) => {
            e.preventDefault();

            try {
            const email = document.getElementById("login_email_id").value.trim();
            const password = document.getElementById("login_password_id").value.trim();

            console.log(`Login input submitted, attempting to login with: {${email} , ${password}}`)
            
            //validate and send login creds to server, which queries db for creds and returns result and sets cookie
            const result = await login(email, password);
            if (result.error) { alert(result.error); return; }
            
            //Refresh the page after successful submission (the cookie will hold the session and the user will be logged in)
             window.location.reload(); 
            } catch (error) {
                alert("Could not reach server. " + error);
            }
        })
    }

    //Register button
    let registerButton = document.createElement("button")
    registerButton.setAttribute("class", "button")
    registerButton.setAttribute("type", "button")
    registerButton.setAttribute("id", "register")
    registerButton.textContent = "Register"
    registerButton.addEventListener('click', () =>{
        window.location.href = "/html/register.html"
    })

    mainDiv.append(loginButton)
    mainDiv.append(registerButton)
    header.append(mainDiv)
}
//Get me
let me = fetch("/me",{
    method: "GET",
    credentials: "include"
}).then(response=>{

    if(response.status === 200){
        return response.json()
    }else{
        createHomePageLoggedOut()
        generateTrips({user_id: null},discovered)
        generateUsers({user_id: null})
        throw "Session not found"
    }
}).then(jsonResponse => {
    user = jsonResponse
    createHomePageLoggedIn(jsonResponse)
    generateUsers(jsonResponse)
    generateTrips(jsonResponse, discovered)
})

//Get users
async function generateUsers(user) {
    user.query = "users"
    let usersQuery = fetch("/", {method: 'POST', body: JSON.stringify(user)})
    usersQuery.then(userResponse => {
        return userResponse.json()
    }).then(jsonUserResponse => {
        createUserHTML(jsonUserResponse, userList)
    })
}

//Get groups
async function generateTrips(user,offset) {
    console.log(user)
    user.query = "groups"
    user.offset = (offset-1)*10
    let groupQuery = fetch("/", {method: 'POST', body: JSON.stringify(user)})
    groupQuery.then(groupResponse => {
        return groupResponse.json()
    }).then(data => {
        console.log(data)
        createGroups(data)
        if(buttons.getAttribute("data-loaded") === "false"){
            buttonAmount = data[0].total_groups
            createDiscoverButtons(buttonAmount)
            buttons.setAttribute("data-loaded", "true")
        }
    })
}



function createGroups(groupArray){
    for(let t of groupArray){
        tripList.append(createTrip(t.title, t.host_name, parseTags(t.tags), t))
    }
}
 


// -------------- HTML Generators -----------------
function loginBoxHTML() {
    return `<section class="register-box" id="login-box">
        <li>
                <form id="login_box_id">
                        <input type="email" id="login_email_id" name="login_email" placeholder="Email" class="reg-box-inputs">
                        <input type="password" id="login_password_id" name="login_password" placeholder="Password" class="reg-box-inputs">
                        <button class="box-button box-button11" type="submit" id="login_submit">Enter</button>
                </form>
            </li>
        </section>`
}