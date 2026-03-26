export function highlightActivePageButton (pageToRender){
    let highlightBtn ="Index";
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

    console.log("the highlightBtn: " + highlightBtn);
    document.getElementById(highlightBtn)?.classList.add("highlight-button");



    /* let spliceBtn = deactivateBtns.indexOf(highlightBtn);
    let spliced = deactivateBtns.splice(spliceBtn, 1);
    console.log("spliced:" + spliced);
    highlightActiveButton (highlightBtn, deactivateBtns);

    function highlightActiveButton (HighlightButtonID, switchOffButtonsIDs) {
    let theBtn = document.getElementById(HighlightButtonID);

    console.log(`Trying to set classname of ${theBtn} to highlight-button`);
    theBtn.className = "highlight-button";
    
    for (let offButton of switchOffButtonsIDs) {
        console.log(`Trying to set classname of ${offButton} to button`);
        document.getElementById(offButton).className = "button";
    }  */
}

