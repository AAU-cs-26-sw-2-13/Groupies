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

    mainDiv.append(loginBtn, registerBtn);
    header.append(mainDiv);
}

function toggleLoginBox(container) {
    let existingBox = document.getElementById("login-box");
    if (existingBox) {
        existingBox.remove();
        return;
    }

    const loginBox = document.createElement("div");
    loginBox.innerHTML = `
        <section class="register-box" id="login-box" style="position:absolute; width:250px; left:-50px; top:125%; z-index:1000;">
            <form id="login_box_id">
                <input type="email" id="login_email_id" placeholder="Email" class="reg-box-inputs">
                <input type="password" id="login_password_id" placeholder="Password" class="reg-box-inputs">
                <button class="box-button" type="submit" id="login_submit">Enter</button>
            </form>
        </section>`;

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

function loadTitleElements (header) {
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


