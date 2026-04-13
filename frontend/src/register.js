const form = document.querySelector("#form");
const step3 = document.querySelector("#step3");
const prefList = document.querySelector(".registerPreferenceList")
const activePrefList = document.querySelector(".registerPreferenceListActive")

async function sendData() {
    const formData = new FormData(form);
    const currentPrefs = Array.from(activePrefList.querySelectorAll('button'))
                              .map(btn => btn.textContent.trim());
    try {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            body: formData,
        });
        const data = await response.json();
        console.log(data);

        /*const response2 = await fetch("/api/auth/regPrefs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
        const data2 = await response2.json();
        console.log(data2);*/

    } catch(e) {
        console.error(e);
    }
};

//listens for submit
form.addEventListener("submit", (event) => {
    event.preventDefault();
    sendData();
});

//Listening for gender buttons
let genderButtons = document.querySelectorAll(".registerGenderTextButton")
for(let gb of genderButtons){
    gb.addEventListener('click', ()=>{
        for(let gb2 of genderButtons){
            gb2.setAttribute("class","registerGenderTextButton")
        }
        gb.setAttribute("class","registerGenderTextButtonActive")
    })
}


//document.querySelectorAll('a').forEach(a => a.style.display = 'none');

var ps = document.querySelectorAll('div[id^="step"]');
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

const fileTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
];

function validFileType(file) {
    return fileTypes.includes(file.type);
}

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


//Get preferences
function run(){
    let sessionDataPrefs = {sessionId: "empty", query:"preferences"};
    let prefsQuery = fetch("/regPrefs", {method: 'POST', body: JSON.stringify(sessionDataPrefs)});
    prefsQuery.then(prefsResponse => {
        return prefsResponse.json();
    }).then(jsonPrefsResponse => {
        console.log(jsonPrefsResponse);
        createPrefs(jsonPrefsResponse);
    })
}
run();