import { parseTags } from "./parseJson.js"

export function getAge(date) {
    let now = new Date();
    let dob = new Date(date);

    let age = now.getFullYear() - dob.getFullYear();
    if ((now.getMonth() - dob.getMonth()) <= 0 && now.getDate() < dob.getDate()) { age--; }

    return age;
}

//Generates the HTML object for a new user
export function createUser(id, name, dob, gender, country, picture, tags, isActiveUser) {
    let list = document.createElement("li")
    let article = document.createElement("article")

    let upperUserInfo = document.createElement("div")
    let lowerUserInfo = document.createElement("div")

    let userInformation = document.createElement("div")
    //let plusIcon = document.createElement("i")

    let userImage = document.createElement("img")
    let userText = document.createElement("div")

    let userName = document.createElement("p")
    let userInfoText = document.createElement("p")

    let genreList = document.createElement("ul")
    article.setAttribute("class", "userBox")
    article.dataset.id = id

    upperUserInfo.setAttribute("class", "mainUserInfo")
    lowerUserInfo.setAttribute("class", "userPrefFront")

    userInformation.setAttribute("class", "userInfo")
    userInformation.dataset.id = id;
    
    let followButton = document.createElement("button")
    followButton.setAttribute("class", "button2")
    followButton.setAttribute("type", "button")
    //plusIcon.setAttribute("class", "fa-regular fa-plus")
    followButton.innerHTML = "Follow"
    followButton.addEventListener('click', followUserListener)
    


    userImage.setAttribute("class", "userImage")
    userImage.setAttribute("src", picture)
    userText.setAttribute("class", "userText")

    userName.setAttribute("class", "userName")
    userName.textContent = name
    userInfoText.setAttribute("class", "userInfoText")
    userInfoText.textContent = getAge(dob) + ", " + gender + ", " + country

    genreList.setAttribute("class", "prefListFront")

    list.append(article)

    article.append(upperUserInfo)
    article.append(lowerUserInfo)

    upperUserInfo.append(userInformation)
    if (!isActiveUser) upperUserInfo.append(followButton);

    userInformation.append(userImage)
    userInformation.append(userText)

    userText.append(userName)
    userText.append(userInfoText)

    lowerUserInfo.append(genreList)

    for (let t of parseTags(tags)) {
        if (t !== null) {
            let genre = document.createElement("li")
            genre.setAttribute("class", "pref-item")
            genre.textContent = t
            genreList.append(genre)
        }
    }

    let clickArea = article.firstChild.firstChild;
    clickArea.addEventListener('click', profileClick) //click to go to this article user profile

    return list
}

export function followUserListener(event) {
    event.stopPropagation()
    if (event.target.classList.contains("following")) {
        event.target.classList.remove("following")
        event.target.textContent = "Follow"
    } else {
        event.target.classList.add("following")
        event.target.textContent = "Following"
    }
}

export function createUserHTML(userArray, targetList, userID) {
    for (let u of userArray) {
        let isActiveUser = false;
        if (u.id == userID) isActiveUser = true; //if its the active user, createUser must not create a follow button

        let prefs = u.preferences;
        targetList.append(createUser(u.id, u.name_first + " " + u.name_last, u.dob, u.gender, u.country, u.picture, prefs, isActiveUser));
    }
}

export function profileClick(event) {
    // console.log(event.target)

    let profileData = event.currentTarget.dataset
    window.location.href = `/profile/?id=${profileData["id"]}`
}

