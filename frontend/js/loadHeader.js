import { login } from "./loginRegister.js";
import { highlightActivePageButton } from "./activePage.js"
import { profileClick } from "./User_creation.js"

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
    console.log
    discoverBtn.onclick = () => {
        console.log("in the discoverbtn click case")
        window.location.href = "../"; //go to the discover page on discover btn click
    }

    console.log("page to render: " + pageToRender);
    highlightActivePageButton(pageToRender);
}

function renderLoggedInHeader(header, user, pageToRender) {

    const mainDiv = document.createElement("div");
    mainDiv.className = "profile";

    const profileImage = document.createElement("img");
    profileImage.className = "profileImageClickable";
    profileImage.src = user.picture || "../img/notFound.jpg";

    const username = document.createElement("p");
    username.className = "profileNameClickable";
    username.textContent = user.username;

    profileImage.dataset.id = user.user_id
    profileImage.addEventListener('click', profileClick)

    username.dataset.id = user.user_id
    username.addEventListener('click', profileClick)

    mainDiv.append(username, profileImage);
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

    const loginBoxDiv = document.createElement("div");
    loginBoxDiv.id = "login-box-div_id";

    mainDiv.append(loginBtn, registerBtn, loginBoxDiv);
    header.append(mainDiv);
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
let titleElementHTML = `<div id="Groupies_title_id"> 
    <img src="../img/favicon.svg" alt="Groupies logo of a compass" id="logo_id"> 
    <h1 id="Groupies_title_header_id">Groupies</h1> 
</div>

<button class = "button" type="button" id="discover-btn_id">Find your next trips</button>`


