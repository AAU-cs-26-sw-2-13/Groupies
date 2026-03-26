export function highlightActivePageButton (pageToRender){
    let highlightBtn ="";
    let deactivateBtns = ["login-btn_id", "register-btn_id", "discover-btn_id"];

    console.log(`Entered highlightActivePageButton function with pageToRender : ${pageToRender}`);

    switch (pageToRender) {
        case "Index": 
            highlightBtn = "discover-btn_id";
            break;
        case "Register":
            highlightBtn = "register-btn_id";
            break;
        case "Group":
            highlightBtn = "discover-btn_id";
            break;
        default: throw (pageToRender + "whichButtonActive not valid error");
    }

    let spliceBtn = deactivateBtns.indexOf(highlightBtn);
    deactivateBtns.splice(spliceBtn);
    highlightActiveButton (highlightBtn, deactivateBtns);

    function highlightActiveButton (HighlightButtonID, switchOffButtonsIDs) {
    let theBtn = document.getElementById(HighlightButtonID);
    theBtn.className = "highlight-button";
    
    for (let offButton of switchOffButtonsIDs) {
        document.getElementById(offButton).className = "button";
    } 
}
}

