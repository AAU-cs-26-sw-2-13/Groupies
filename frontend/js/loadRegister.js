import { initializeHeader } from "./loadHeader.js"

let header = document.querySelector("header")

fetch("/me", {
    method: "GET",
    credentials: "include"
}).then(response => {
    if (response.status === 200) {
        return response.json();
    } else {
        // Not logged in: Initialize header with null user
        initializeHeader(header, null, "Register");
        throw "Session not found";
    }
}).then(jsonResponse => {
    // Logged in: Initialize header with user data
    let user = jsonResponse;
    initializeHeader(header, user, "Register");
}).catch(err => {
    console.log("Auth Check:", err);
});

//HTML elements
const form = document.querySelector("#form");
const step3 = document.querySelector("#step3");
const countryDiv = document.querySelector("#countryDiv")
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

const dobButton = document.querySelector("#dobBox")
const dobInput = document.querySelector("#dob")
const dobText = document.querySelector("#dobText")

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
    const submitButton = document.getElementById("submit");
    submitButton.disabled = true
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
        } else {
            const submitButton = document.getElementById("submit");
            submitButton.disabled = false
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

//creates and runs countrySelector
function countrySelector(){
    const countryCode = ["AF","AX","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS",
        "BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BA","BW","BV","BR","IO","BN","BG","BF","BI",
        "CV","KH","CM","CA","BQ","KY","CF","TD","CL","CN","CX","CC","CO","KM","CG","CD","CK","CR","HR",
        "CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO",
        "FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG",
        "GN","GW","GY","HT","HM","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP",
        "JE","JO","KZ","KE","KI","KP","KR","XK","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU",
        "MO","MK","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME",
        "MS","MA","MZ","MM","NA","NR","NP","NL","AN","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM",
        "PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","RE","RO","RU","RW","BL","SH",
        "KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","CS","SC","SL","SG","SX","SK","SI","SB",
        "SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK",
        "TO","TT","TN","TR","TM","TC","TV","UM","UG","UA","AE","GB","US","UY","UZ","VU","VA","VE","VN",
        "VG","VI","WF","EH","YE","ZM","ZW"
    ];
    const countryName = [
        "Afghanistan","Åland Islands","Albania","Algeria","American Samoa","Andorra","Angola","Anguilla",
        "Antarctica","Antigua and Barbuda","Argentina","Armenia","Aruba","Australia","Austria",
        "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin",
        "Bermuda","Bhutan","Bolivia (Plurinational State of)","Bosnia and Herzegovina","Botswana",
        "Bouvet Island","Brazil","British Indian Ocean Territory","Brunei Darussalam","Bulgaria",
        "Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Caribbean Netherlands",
        "Cayman Islands","Central African Republic","Chad","Chile","China","Christmas Island",
        "Cocos (Keeling) Islands","Colombia","Comoros","Congo","Congo, Democratic Republic of the",
        "Cook Islands","Costa Rica","Croatia","Cuba","Curaçao","Cyprus","Czech Republic","Côte d'Ivoire",
        "Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador",
        "Equatorial Guinea","Eritrea","Estonia","Eswatini (Swaziland)","Ethiopia",
        "Falkland Islands (Malvinas)","Faroe Islands","Fiji","Finland","France","French Guiana",
        "French Polynesia","French Southern Territories","Gabon","Gambia","Georgia","Germany",
        "Ghana","Gibraltar","Greece","Greenland","Grenada","Guadeloupe","Guam","Guatemala","Guernsey",
        "Guinea","Guinea-Bissau","Guyana","Haiti","Heard Island and Mcdonald Islands","Honduras",
        "Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man",
        "Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kiribati",
        "Korea, North","Korea, South","Kosovo","Kuwait","Kyrgyzstan","Lao People's Democratic Republic",
        "Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg",
        "Macao","Macedonia North","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta",
        "Marshall Islands","Martinique","Mauritania","Mauritius","Mayotte","Mexico","Micronesia",
        "Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique",
        "Myanmar (Burma)","Namibia","Nauru","Nepal","Netherlands","Netherlands Antilles",
        "New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Niue","Norfolk Island",
        "Northern Mariana Islands","Norway","Oman","Pakistan","Palau","Palestine","Panama",
        "Papua New Guinea","Paraguay","Peru","Philippines","Pitcairn Islands","Poland","Portugal",
        "Puerto Rico","Qatar","Reunion","Romania","Russian Federation","Rwanda","Saint Barthelemy",
        "Saint Helena","Saint Kitts and Nevis","Saint Lucia","Saint Martin","Saint Pierre and Miquelon",
        "Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia",
        "Senegal","Serbia","Serbia and Montenegro","Seychelles","Sierra Leone","Singapore",
        "Sint Maarten","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa",
        "South Georgia and the South Sandwich Islands","South Sudan","Spain","Sri Lanka","Sudan",
        "Suriname","Svalbard and Jan Mayen","Sweden","Switzerland","Syria","Taiwan","Tajikistan",
        "Tanzania","Thailand","Timor-Leste","Togo","Tokelau","Tonga","Trinidad and Tobago",
        "Tunisia","Turkey (Türkiye)","Turkmenistan","Turks and Caicos Islands","Tuvalu",
        "U.S. Outlying Islands","Uganda","Ukraine","United Arab Emirates","United Kingdom",
        "United States","Uruguay","Uzbekistan","Vanuatu","Vatican City Holy See","Venezuela",
        "Vietnam","Virgin Islands, British","Virgin Islands, U.S","Wallis and Futuna","Western Sahara",
        "Yemen","Zambia","Zimbabwe",
    ];
    let countrySelect = document.createElement("select");
    countrySelect.setAttribute("class", "reg-box-inputs");
    countrySelect.setAttribute("autocomplete", "country");
    countrySelect.setAttribute("id", "country");
    countrySelect.setAttribute("name", "country");
    for (let i = 0; i < countryCode.length; i++){
        let option = document.createElement("option");
        option.value = countryCode[i];
        option.textContent = countryName[i];
        countrySelect.appendChild(option);
    };
    countryDiv.append(countrySelect);
}
countrySelector();

// Date of Birth selector
dobButton.addEventListener("click", (e) => {
    e.preventDefault()
    dobInput.showPicker()
})
dobButton.addEventListener("change", () => {
    dobText.textContent = " " + dobInput.value || " Start Date"
    dobText.style.color = dobInput.value ? "#333" : "#717171"
})