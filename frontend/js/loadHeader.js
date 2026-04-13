import { login } from "./loginRegister.js";
import { highlightActivePageButton } from "./activePage.js"

/* Entry point to build the header. Conditionally renders a logged in header or loggedout header on whether the user is specified from the session */
export async function initializeHeader(headerElement, user, pageToRender) {
    headerElement.innerHTML = '';

    loadTitleElements(headerElement); //load the base header elements (title and logo)

    if (user && user.user_id) { //conditionally render the header
        renderLoggedInHeader(headerElement, user, pageToRender);
    } else {
        renderLoggedOutHeader(headerElement, pageToRender);
    }

    let discoverBtn = document.getElementById("discover-btn_id");
    discoverBtn.onclick = () => {
        window.location.href = "/"; //go to the discover page on discover btn click
    }

    console.log("page to render: " + pageToRender);
    highlightActivePageButton(pageToRender);
}

function renderLoggedInHeader(header, user, pageToRender) {

    const mainDiv = document.createElement("div");
    mainDiv.className = "profile";
    mainDiv.style.position = "relative";

    const profileImage = document.createElement("img");
    profileImage.className = "profileImageClickable";
    profileImage.src = user.picture || "../img/notFound.jpg";

    const username = document.createElement("p");
    username.className = "profileNameClickable";
    username.textContent = user.username;

    profileImage.dataset.id = user.user_id
    profileImage.addEventListener('click', (event) => toggleProfileBox(event)) //profileClick previously

    username.dataset.id = user.user_id
    username.addEventListener('click', (event) => toggleProfileBox(event)) //profileClick previously

    //div for the profile nav box (go to profile, messages pages or logout)
    const profileBoxDiv = document.createElement("div");
    profileBoxDiv.id = "profile-box-div_id";

    mainDiv.append(username, profileImage, profileBoxDiv);
    console.log(`Appending header for logged out case on ${pageToRender} page`);
    header.append(mainDiv);
}

function renderLoggedOutHeader(header, pageToRender) {

    const mainDiv = document.createElement("div");
    mainDiv.id = "loginregDiv";
    mainDiv.style.position = "relative";

    const loginBtn = document.createElement("button");
    loginBtn.className = "button";
    loginBtn.textContent = "Login";
    loginBtn.id = "login-btn_id";

    loginBtn.addEventListener("click", () => toggleLoginBox(mainDiv));

    const registerBtn = document.createElement("button");
    registerBtn.className = "button";
    registerBtn.textContent = "Register";
    registerBtn.id = "register-btn_id";

    registerBtn.onclick = () => window.location.href = "/html/register.html";
    //div for the login box to appear when clicking login btn
    const loginBoxDiv = document.createElement("div");
    loginBoxDiv.id = "login-box-div_id";

    mainDiv.append(loginBtn, registerBtn, loginBoxDiv);
    header.append(mainDiv);
    console.log(`Appending header for logged out case on ${pageToRender} page`);
}

function toggleLoginBox(container) {
    let existingBox = document.getElementById("login-box");
    if (!existingBox) {
        const loginBox = document.getElementById("login-box-div_id");
        loginBox.innerHTML = `
        <div class="register-box active" id="login-box" style="position:absolute; width:250px; left:-50px; top:125%; z-index:1000;">
            <form id="login_box_id">
                <input type="email" id="login_email_id" placeholder="Email" class="reg-box-inputs">
                <input type="password" id="login_password_id" placeholder="Password" class="reg-box-inputs">
                <button class="box-button" type="submit" id="login_submit">Enter</button>
            </form>
        </div>`;

        container.appendChild(loginBox);

        document.getElementById("login-btn_id").classList.toggle("highlight-button")

        document.getElementById("login_submit").addEventListener("click", async (e) => {
            e.preventDefault();
            const email = document.getElementById("login_email_id").value.trim();
            const password = document.getElementById("login_password_id").value.trim();

            const result = await login(email, password);
            if (result.error) {
                alert(result.error);
            } else {
                window.location.reload();
            }
        });

    }

    if (existingBox) {
        existingBox.classList.toggle("active");
        let logBtn = document.getElementById("login-btn_id");
        if (logBtn.className === "button") logBtn.className = "highlight-button";
        else logBtn.className = "button";
        /* 
        document.getElementById("login-btn").classList.remove("highlight-button") */
    }

}

function toggleProfileBox (event) {
    let existingBox = document.getElementById("profile-box");
    if (!existingBox) {
        const profileBox = document.getElementById("profile-box-div_id");
        createProfileBox(profileBox, event);
        }
    else {
        existingBox.classList.toggle("active");
    }
}

function loadTitleElements(header) {
    if (document.getElementById("Groupies_title_id")) return; //if the title elements already exist, they are already loaded.
    //Load title and site logo
    header.insertAdjacentHTML('afterbegin', titleElementHTML);
    document.querySelector("#Groupies_title_id").addEventListener('click', ()=>{
        console.log("Header click")
        window.location.href = "/"
    })
}



//HTML Generators
function createProfileBox(profileBox, event) {
    profileBox.id = "profile-box"; //toggle logic will find this box by this ID
    profileBox.className = "register-box active";
    
    // set styles for positioning
    profileBox.style.position = "absolute";
    profileBox.style.width = "200px";
    profileBox.style.left = "";
    profileBox.style.top = "105%";
    profileBox.style.zIndex = "1000";

    // Create link buttons (to own profile and to messages page)
    const profileLink = document.createElement("a");
    profileLink.textContent = "View Profile";
    profileLink.className = "box-link"; 
    let profileData = event.currentTarget.dataset
    profileLink.href = `/profile/?id=${profileData["id"]}`
    profileLink.style.width = "150px";
    
    const messagesLink = document.createElement("a");
    messagesLink.textContent = "View Messages";
    messagesLink.className = "box-link"; 
    messagesLink.href = `/chat`
    messagesLink.style.width = "150px";

    // Create the logout button and add logout functionality (deletes the browser cookie and reloads current page)
    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = "Logout";
    logoutBtn.className = "box-button";
    logoutBtn.id = "logout-btn_id";
    logoutBtn.style.width = "150px";
    logoutBtn.onclick = async () => {
        try { //try to send a logout request to server for the server to send a delete cookie response to client
            const response = await fetch('/api/auth/logout', {method: 'POST'});
            if(response.ok){
                window.location.reload(); //reload if cookie was succesfully deleted by the server API
            }
        } catch (error) {
            console.error("Network failed", error)
        }
    };

    profileBox.append(profileLink, messagesLink, logoutBtn);
}


let titleElementHTML = `<div id="Groupies_title_id"> 
    <img src="/img/favicon.svg" alt="Groupies logo of a compass" id="logo_id"> 
    <h1 id="Groupies_title_header_id">Groupies</h1> 
</div>

<button class = "button" type="button" id="discover-btn_id">Discover Travel Groups</button>`


