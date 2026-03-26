import { login } from "./loginRegister.js";

/* Entry point to build the header. Conditionally renders a logged in header or loggedout header on whether the user is specified from the session */
export async function initializeHeader(headerElement, user) {
    headerElement.innerHTML = '';

    if (user && user.user_id) {
        renderLoggedInHeader(headerElement, user);
    } else {
        renderLoggedOutHeader(headerElement);
    }
}

function renderLoggedInHeader(header, user) {
    loadTitleElements(header);

    const mainDiv = document.createElement("div");
    mainDiv.className = "profile";

    const profileImage = document.createElement("img");
    profileImage.className = "profileImage";
    profileImage.src = user.profile_picture || "img/notFound.jpg";

    const username = document.createElement("p");
    username.className = "profileName";
    username.textContent = user.username;

    mainDiv.append(username, profileImage);
    header.append(mainDiv);
}

function renderLoggedOutHeader(header) {

    loadTitleElements(header);
    const mainDiv = document.createElement("div");
    mainDiv.id = "loginregDiv";
    mainDiv.style.position = "relative";

    const loginBtn = document.createElement("button");
    loginBtn.className = "button";
    loginBtn.textContent = "Login";

    loginBtn.addEventListener("click", () => toggleLoginBox(mainDiv));

    const registerBtn = document.createElement("button");
    registerBtn.className = "button";
    registerBtn.textContent = "Register";
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

    if (existingBox) existingBox.classList.toggle("active");

}

function loadTitleElements(header) {
    if (document.getElementById("Groupies_title_id")) return;
    //Load title and site logo
    header.insertAdjacentHTML('afterbegin', titleElementHTML);

    //Load discover page button
}


//HTML Generators
let titleElementHTML = `<div id="Groupies_title_id"> 
    <img src="../img/favicon.svg" alt="Groupies logo of a compass" id="logo_id"> 
    <h1 id="Groupies_title_header_id">Groupies</h1> 
</div>

<button class = "button" type="button">Find your next trips</button>`


