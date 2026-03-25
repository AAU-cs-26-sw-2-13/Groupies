let HTMLdoc = document.querySelector("#CreateGroup")




//Generates the HTML
function createHTML(){
   let container = document.createElement("div")

     //buttons
    let buttons = document.createElement("div")
    buttons.setAttribute("class", "groupActions")

     let backButton = document.createElement("button")
        backButton.setAttribute("class", "buttonBack")
        backButton.setAttribute("type", "button")
        backButton.textContent = "Back"
        backButton.addEventListener("click", ()=>{ window.location.href = "/"})
        

    
        buttons.append(backButton)


    container.append(buttons)
    return container
}



HTMLdoc.append(createHTML())