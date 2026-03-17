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