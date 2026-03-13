//Queries to dom elements
let tripList = document.querySelector("#tripList")
let userList = document.querySelector("#userList")

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

    let genre = document.createElement("li")


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

    genre.setAttribute("class", "pref-item")
    genre.textContent = "Adventure"

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
    
    genreList.append(genre)
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
        let genre = document.createElement("li")
        genre.setAttribute("class", "pref-item")
        genre.textContent = t
        genreList.append(genre)
    }
    

    console.log(list)
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
    console.log(event.target)
}

function profileClick(event){
    console.log(event.target)
}

//Get users
let sessionDataUser = {sessionId: "empty", query:"users"}
let usersQuery = fetch("/", {method: 'POST', body: JSON.stringify(sessionDataUser)})
usersQuery.then(userResponse => {
    return userResponse.json()
}).then(jsonUserResponse => {
    createUserHTML(loadUsers(jsonUserResponse))
})
//Get groups
let sessionDataTrips = {sessionId: "empty", query:"groups"}
let groupQuery = fetch("/", {method: 'POST', body: JSON.stringify(sessionDataTrips)})
groupQuery.then(groupResponse => {
    return groupResponse.json()
}).then(data => {
    loadGroups(data)
})

function loadUsers(userArray){
    let userArrayWithPref = {}

    for(let u of userArray){
        if (!userArrayWithPref[u.id]){
            userArrayWithPref[u.id] = {
                id: u.id,
                name_first: u.name_first,
                name_last: u.name_last,
                country: u.country,
                gender: u.gender,
                age: u.age,
                picture: u.picture,
                prefs: []
            }
        }
        if(userArrayWithPref[u.id] && u.preference_id != null){
            userArrayWithPref[u.id].prefs.push(u.preference_id)
        }
    }

    return Object.values(userArrayWithPref) 
}

function createUserHTML(userArray){
    for(let u of userArray){
        if(u){
            userList.append(createUser(u.name_first + " " + u.name_last, u.age, u.gender, u.country, u.prefs))
        }
    }
}

function loadGroups(groupArray){
    console.log(groupArray)
    for(let t of groupArray){
        tripList.append(createTrip(t.title, t.name_first + " " + t.name_last))
    }
}
 

