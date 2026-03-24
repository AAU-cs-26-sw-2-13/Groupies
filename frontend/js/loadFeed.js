import { getCurrentUser } from "./userAPI.js";
import { login, register } from "./loginRegister.js";

//Queries to dom elements
let tripList = document.querySelector("#tripList")
let userList = document.querySelector("#userList")
let header = document.querySelector("header")
let buttons = document.querySelector(".pageButtons")

//Context variables
let discovered = 1;

//Generates the HTML object for a new trip
function createTrip(title, host, tags){
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
//Generates the HTML object for a new user
function createUser(name, age, gender, country, tags){
    let list = document.createElement("li")
    let article = document.createElement("article")

    let upperUserInfo = document.createElement("div")
    let lowerUserInfo = document.createElement("div")

    let userInformation = document.createElement("div")
    let followButton = document.createElement("button")
    //let plusIcon = document.createElement("i")

    let userImage = document.createElement("img")
    let userText = document.createElement("div")

    let userName = document.createElement("p")
    let userInfoText = document.createElement("p")

    let genreList = document.createElement("ul")

    article.setAttribute("class", "userBox")
    article.addEventListener('click', profileClick)

    upperUserInfo.setAttribute("class", "mainUserInfo")
    lowerUserInfo.setAttribute("class", "userPrefFront")

    userInformation.setAttribute("class","userInfo" )
    followButton.setAttribute("class", "button2")
    followButton.setAttribute("type", "button")
    //plusIcon.setAttribute("class", "fa-regular fa-plus")
    followButton.innerHTML = "Follow"
    followButton.addEventListener('click', followUserListener)

    userImage.setAttribute("class", "userImage")
    userImage.setAttribute("src", "img/notFound.jpg")
    userText.setAttribute("class","userText")

    userName.setAttribute("class", "userName")
    userName.textContent = name
    userInfoText.setAttribute("class", "userInfoText")
    userInfoText.textContent = age+", "+gender+", "+country

    genreList.setAttribute("class", "prefListFront")

    list.append(article)

    article.append(upperUserInfo)
    article.append(lowerUserInfo)
    
    upperUserInfo.append(userInformation)
    upperUserInfo.append(followButton)

    userInformation.append(userImage)
    userInformation.append(userText)
    
    userText.append(userName)
    userText.append(userInfoText)

    lowerUserInfo.append(genreList)

    for(let t of tags){
        if(t !== null){
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

function followUserListener(event){
    event.stopPropagation()
    if(event.target.classList.contains("following")){
        event.target.classList.remove("following")
        event.target.textContent = "Follow"
    }else{
        event.target.classList.add("following")
         event.target.textContent = "Following"
    }
}

function groupClick(event){
}

function profileClick(event){

}

function createDiscoverButtons(Amount){
    let buttonsCount = Math.ceil(Amount/10)
    for(let i = 1; i<=buttonsCount; i++){
        let button = document.createElement("button")
        button.setAttribute("type","button")
        button.setAttribute("data-pnumber",i)
        button.textContent = i
        if(i===1){
            button.setAttribute("class","button3")
            buttons.append(button)
            continue
        }
        button.setAttribute("class","button3 passive")
        button.addEventListener('click',(event)=>{
            console.log(event.target.getAttribute("data-pnumber"))
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
        generateTrips({user_id: null})
        generateUsers({user_id: null})
        throw "Session not found"
    }
}).then(jsonResponse => {
    createHomePageLoggedIn(jsonResponse)
    generateUsers(jsonResponse)
    generateTrips(jsonResponse)
})

//Get users
async function generateUsers(user) {
    user.query = "users"
    let usersQuery = fetch("/", {method: 'POST', body: JSON.stringify(user)})
    usersQuery.then(userResponse => {
        return userResponse.json()
    }).then(jsonUserResponse => {
        createUserHTML(jsonUserResponse)
    })
}

//Get groups
async function generateTrips(user,offset) {
    console.log(user)
    user.query = "groups"
    let groupQuery = fetch("/", {method: 'POST', body: JSON.stringify(user)})
    groupQuery.then(groupResponse => {
        return groupResponse.json()
    }).then(data => {
        createGroups(data)
        if(buttons.getAttribute("data-loaded") === "false"){
            createDiscoverButtons(data[0].total_groups)
            buttons.setAttribute("data-loaded", "true")
        }
    })
}


function createUserHTML(userArray){
    for(let u of userArray){
        userList.append(createUser(u.name_first + " " + u.name_last, u.age, u.gender, u.country, u.preferences))
    }
}

function createGroups(groupArray){
    for(let t of groupArray){
        tripList.append(createTrip(t.title, t.name_first + " " + t.name_last, t.tags))
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