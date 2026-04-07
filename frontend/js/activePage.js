export function highlightActivePageButton(pageToRender) {
    let highlightBtn = "Index";

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

