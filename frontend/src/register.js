import { parseTags } from "../js/parseJson";

const form = document.querySelector("#form");

async function sendData() {
    const fromData = new FormData(form);
    const body = Object.fromEntries(fromData);

    try {
        const response = await fetch("http://localhost:3000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await response.json();

        console.log(data);
    } catch(e) {
        console.error(e);
    }
};

//listens for submit
form.addEventListener("submit", (event) => {
    event.preventDefault();
    sendData();
});

//document.querySelectorAll('a').forEach(a => a.style.display = 'none');

var ps = document.querySelectorAll('p[id^="step"]');
var i = 0;
document.getElementById("next").addEventListener('click', function() {

    if(i < ps.length - 1) {
        ps[i].hidden = true; //hide current step
        i = ++i % ps.length;
        ps[i].hidden = false; //show next step
        if (i === ps.length - 1){
            document.getElementById('next').hidden = true;
            document.getElementById('submit').hidden = false;
        }
    } else {
        document.getElementById('form').submit();
    }
});

document.getElementById('return').addEventListener('click', function() {
    if (i > 0) {
        ps[i].hidden = true;  // hide current step
        i--;
        ps[i].hidden = false; // show previous step
        document.getElementById('next').hidden = false;
        document.getElementById('submit').hidden = true;
    }
});

const input = document.querySelector("#img");
const preview = document.querySelector(".preview");


input.addEventListener("change", updateImageDisplay);

function updateImageDisplay(){
    while (preview.firstChild) {
        preview.removeChild(preview.firstChild);
    }

    const curFiles = input.files;
    if (curFiles.length === 0) {
        const para  = document.createElement("p")
        para.textContent = "No files selected"
        preview.appendChild(para);
    } else {
        const list = document.createElement("ol");
        preview.appendChild(list);

        for (const file of curFiles) {
            const listItem = document.createElement("li");
            const para = document.createElement("p");
            if (validFileType(file)) {
                para.textContent = `File size ${returnFileSize(file.size,)}.`;
                const image = document.createElement("img");
                image.src = URL.createObjectURL(file);
                image.alt = image.title = file.name;

                listItem.appendChild(image);
                listItem.appendChild(para);
            } else {
                para.textContent = `File ${file.name}: Not a valid file type.`
                listItem.appendChild(para);
            }

            list.appendChild(listItem);
        }
    }
}

const fileTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
];

function validFileType(file) {
    return fileTypes.includes(file.type);
}

// Uses SI prefix
function returnFileSize(number) {
    if(number < 1e3) {
        return `${number} bytes`;
    } else if (number >= 1e3 && number < 1e6) {
        return `${(number / 1e3).toFixed(1)} KB`;
    }
    
    return `${(number / 1e6).toFixed(1)} MB`;
}

const step3 = document.querySelector("#step3");

//Generates the HTML object for preferences
function createPrefs(tags){
    for(let t of tags){
        if(t !== null){
            const prefs = document.createElement("p")
            prefs.textContent = `${t}`
            step3.appendChild(prefs)
        }
    }
    
    return prefsList
}

//Get preferences
let sessionDataPrefs = {sessionId: "empty", query:"preferences"}
let prefsQuery = fetch("/", {method: 'POST', body: JSON.stringify(sessionDataPrefs)})
prefsQuery.then(prefsResponse => {
    return prefsResponse.json()
}).then(jsonPrefsResponse => {
    createPrefsHTML(jsonPrefsResponse)
})

function createPrefsHTML(prefsArray){
    for(let p of prefsArray){
        step3.append(createPrefs(parseTags(p.preferences)))
    }
}
