import { initializeHeader } from "./loadHeader.js"
let header = document.querySelector("header")
console.log("Test")


fetch("/me", {
    method: "GET",
    credentials: "include"  
}).then(response => {
    if (response.status === 200) {
        return response.json();
    } else {
        // Not logged in: Initialize header with null user
        initializeHeader(header, null, "Group");
        throw "Session not found";
    }
}).then(jsonResponse => {
    // Logged in: Initialize header with user data
    let user = jsonResponse;
    initializeHeader(header, user, "Group");
}).catch(err => {
    console.log("Auth Check:", err);
});