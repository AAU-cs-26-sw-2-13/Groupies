import { getCurrentUser } from "./userAPI.js";
import { login, register } from "./loginRegister.js";
import {createUserHTML} from "./User_creation.js"

//Queries to dom elements
let tripList = document.querySelector("#tripList")
let userList = document.querySelector("#userList")
let header = document.querySelector("header")
let discovered = 1;

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
    username.textContent = user.name

    mainDiv.append(username)
    mainDiv.append(profileImage)

    header.append(mainDiv)
}

function createHomePageLoggedOut(){
    //Main div
    let mainDiv = document.createElement("div")
    mainDiv.setAttribute("class", "loginregDiv")

    //Login button
    let loginButton = document.createElement("button")
    loginButton.setAttribute("class", "button")
    loginButton.setAttribute("type", "button")
    loginButton.textContent = "Login"

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
    console.log(response.status)
    if(response.status===401){
        createHomePageLoggedOut()
        user={
            user_id: 1,
            username: "Mikkel123",
            name: "Mikkel Dissing"
        }
        //createHomePageLoggedIn(user)
        //return null
    }
})






//Get users
let sessionDataUser = {sessionId: "empty", query:"users"}
let usersQuery = fetch("/", {method: 'POST', body: JSON.stringify(sessionDataUser)})
usersQuery.then(userResponse => {
    return userResponse.json()
}).then(jsonUserResponse => {
    createUserHTML(jsonUserResponse, userList)
})
//Get groups
let sessionDataTrips = {sessionId: "empty", query:"groups"}
let groupQuery = fetch("/", {method: 'POST', body: JSON.stringify(sessionDataTrips)})
groupQuery.then(groupResponse => {
    return groupResponse.json()
}).then(data => {
    createGroups(data)
})


function createGroups(groupArray){
    for(let t of groupArray){
        tripList.append(createTrip(t.title, t.name_first + " " + t.name_last, t.tags, t))
    }
}
 

