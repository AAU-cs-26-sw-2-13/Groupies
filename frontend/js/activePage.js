export function highlightActivePageButton(pageToRender) {
    let highlightBtn = "Index";
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
        default: highlightBtn = null;
    }
    if (highlightBtn) document.getElementById(highlightBtn)?.classList.add("highlight-button");
}

