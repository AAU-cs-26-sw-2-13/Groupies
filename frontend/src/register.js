const form1 = document.querySelector("#stepOne")

async function sendData() {
    const fromData = new FormData(form1);

    try {
        const response = await fetch("http://localhost:3000/api/auth/register", {
            method: "POST",
            body: fromData,
        });
        const data = await response.json();

        console.log(data);
    } catch(e) {
        console.error(e);
    }
}

//listens for submit
form1.addEventListener("submit", (event) => {
    event.preventDefault();
    sendData();
});