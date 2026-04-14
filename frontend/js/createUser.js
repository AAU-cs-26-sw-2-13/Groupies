import { parseTags } from "./parseJson.js"

export function getAge(date) {
    let now = new Date();
    let dob = new Date(date);

    let age = now.getFullYear() - dob.getFullYear();
    if ((now.getMonth() - dob.getMonth()) <= 0 && now.getDate() < dob.getDate()) { age--; }

    return age;
}

//Generates the HTML object for a new user
export function createUser(id, name, dob, gender, country, picture, tags, isActiveUser, isFollowing, activeUserId) {
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

    if (isFollowing) { //if the active user already follows this user
        followButton.innerHTML = "Following";
        followButton.classList.add("following");
    }
    else followButton.innerHTML = "Follow";

    followButton.addEventListener('click', (event) => followUserListener(event, id, activeUserId))

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

export async function createUserHTML(userArray, targetList, userID) {
    //fetch array of users the userID user is already following. For each createUser, create the user html based on that information
    let alreadyFollowing = [];
    if (userID) alreadyFollowing = await followingUsers(userID); //if there is a login session, get the users the active user follows

    for (let u of userArray) {
        //Check this user in the array for match with active user ID and for existing followage relation
        let isActiveUser = false;
        let isFollowing = false;

        if (userID) {
            if (u.id == userID) isActiveUser = true; //if its the active user, createUser must not create a follow button
            isFollowing = alreadyFollowing.some(follow => follow.target_user_id === u.id); //if the user is already followed by active user
        }

        targetList.append(createUser(u.id, u.name_first + " " + u.name_last, u.age, u.gender, 
            u.country, u.picture, u.preferences,
            isActiveUser, isFollowing, userID));
    }
}

export function profileClick(event) {
    // console.log(event.target)

    let profileData = event.currentTarget.dataset
    window.location.href = `/profile/?id=${profileData["id"]}`
}

export async function followingUsers(userID) {
    try {
        const response = await fetch("/followingUsers", {
            method: "POST",
            body: JSON.stringify({ userId: userID })
        });

        if (response.ok) {
            const body = await response.json();
            console.log("printing following users array: ", body)
            return body;
        }
    } catch (error) {
        console.error("Error in the followingUsers functions", error)
    }
}

export async function followUserListener(event, userId, activeUserId) {
    if (activeUserId == null) {alert("You must login first"); return;}
    event.stopPropagation()
    if (event.target.classList.contains("following")) {
        await unfollowUser(event, activeUserId, userId);
    } else {
        await followUser(event, activeUserId, userId);
        event.target.classList.add("following")
        event.target.textContent = "Following"
    }
}
async function unfollowUser(event, activeUserId, userId) {
    try {
        event.target.disabled = true;

        const response = await fetch("/unfollowUser", { //fetch a request to DELETE the group relation for the active user
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: userId,
                activeUserId: activeUserId
            })
        });
        if (response.ok) { //if query was succesful reload the page
            event.target.classList.remove("following")
            event.target.textContent = "Follow"
            event.target.disabled = false;
        }
    } catch (err) {
        console.error(`There was an with fetch request to unfollow a user`, err);
        event.target.disabled = false;
    }

}
async function followUser(event, activeUserId, userId) {
    try {
        console.log(`${activeUserId} wants to follow ${userId}, now attempting...`)
        event.target.disabled = true;

        const response = await fetch("/followUser", { //fetch a request to DELETE the group relation for the active user
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: userId,
                activeUserId: activeUserId
            })
        });
        if (response.ok) { //if query was succesful reload the page
            event.target.classList.add("following")
            event.target.textContent = "Following"
            event.target.disabled = false;
        }
    } catch (err) {
        console.error(`There was an with fetch request to follow a user`, err);
        event.target.disabled = false;
    }
}