//HTML elements
const form = document.querySelector("#form");
const step3 = document.querySelector("#step3");
const prefList = document.querySelector(".registerPreferenceList")
const activePrefList = document.querySelector(".registerPreferenceListActive")

const currentPageText = document.querySelector(".currentRegisterPage")
const pageSections = document.querySelectorAll('div[id^="step"]');
let currentRegisterPage = 0

const registerPageNextButton = document.querySelector('#next');
const registerPageSubmitButton = document.querySelector('#submit');
const registerPageReturnButton = document.querySelector('#return')

const input = document.querySelector("#img"); //Used for the image
const preview = document.querySelector(".preview");//Used for the image

const genderButtons = document.querySelectorAll(".registerGenderTextButton")

//Allowed image types
const fileTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
];
//Fetches all the active preferences in the database
fetchPreferences();

//Submit button (Send data to server)
form.addEventListener("submit", (event) => {
    event.preventDefault();
    sendData();
});

//Listening for gender buttons
for(let gb of genderButtons){
    gb.addEventListener('click', ()=>{
        for(let gb2 of genderButtons){
            gb2.setAttribute("class","registerGenderTextButton")
        }
        gb.setAttribute("class","registerGenderTextButtonActive")
    })
}

//Responsible for changing the pages in the register interface
//Goes forward
registerPageNextButton.addEventListener('click', function() {
    let switchPage = Math.min(currentRegisterPage+1,2)
    for(let ps of pageSections){
        ps.hidden = true
    }
    pageSections[switchPage].hidden = false
    currentRegisterPage = switchPage
    currentPageText.textContent = (switchPage + 1)+"/3"
    if(switchPage === 2){
        registerPageSubmitButton.hidden = false
        registerPageNextButton.hidden = true
    }
});

//Goes backwards
registerPageReturnButton.addEventListener('click', function() {
    let switchPage = Math.max(currentRegisterPage-1,0)
    for(let ps of pageSections){
        ps.hidden = true
    }
    pageSections[switchPage].hidden = false
    currentRegisterPage = switchPage
    currentPageText.textContent = (switchPage + 1)+"/3"
    registerPageSubmitButton.hidden = true
    registerPageNextButton.hidden = false
});

//Eventlistener for choosing gender
for(let gb of genderButtons){
    gb.addEventListener('click', ()=>{
        for(let gb2 of genderButtons){
            gb2.setAttribute("class","registerGenderTextButton")
        }
        gb.setAttribute("class","registerGenderTextButtonActive")
    })
}

//Event listener to update the image display
input.addEventListener("change", updateImageDisplay);

async function sendData() {
    const formData = new FormData(form);
    const currentPrefs = Array.from(activePrefList.querySelectorAll('button'))
                              .map(btn => btn.textContent.trim());
    formData.append("preferences", currentPrefs)
    const response = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
    }).then(response=>{
        return response.json()
    }).then(jsonData=>{
        console.log(jsonData)
        if(jsonData.status && jsonData.status === "registered"){
            window.location.href = "/"
        }
    })
};

function updateImageDisplay(){
    while (preview.firstChild) {
        preview.removeChild(preview.firstChild);
    }

    const curFiles = input.files;
    if (curFiles.length === 0) {
        const para  = document.createElement("p")
        para.textContent = "No files selected"
        preview.appendChild(para);
    } else if(curFiles.length === 1) {
        for (const file of curFiles) {
            const para = document.createElement("p");
            if (validFileType(file)) {
                const image = document.createElement("img");
                image.src = URL.createObjectURL(file);
                image.alt = image.title = file.name;
                image.setAttribute("class","previewImage")

                preview.appendChild(image);
                preview.appendChild(para);
            } else {
                para.textContent = `File ${file.name}: Not a valid file type.`
                preview.appendChild(para);
            }
        }
    }
}


function validFileType(file) {
    return fileTypes.includes(file.type);
}

//Fetches preferecnes
function fetchPreferences(){
    let sessionDataPrefs = {sessionId: "empty", query:"preferences"};
    let prefsQuery = fetch("/regPrefs", {method: 'POST', body: JSON.stringify(sessionDataPrefs)});
    prefsQuery.then(prefsResponse => {
        return prefsResponse.json();
    }).then(jsonPrefsResponse => {
        console.log(jsonPrefsResponse);
        createPrefs(jsonPrefsResponse);
    })
}

//Create the HTML for preferences
function createPrefs(pref){
    for(let t of pref){
        let prefButton = document.createElement("button");
        prefButton.setAttribute("class", "unselected-pref-item");
        prefButton.setAttribute("value", `${t.preference_id}`);
        prefButton.textContent = t.preference_id
        prefButton.setAttribute("type","button")

        prefButton.addEventListener('click', (event)=>{
            if(event.target.parentNode === prefList){
                event.target.classList.replace('unselected-pref-item', 'pref-item');
                activePrefList.append(event.target)
            }else{
                event.target.classList.replace('pref-item', 'unselected-pref-item');
                prefList.append(event.target)
            }

        })

        prefList.append(prefButton);
    }
}