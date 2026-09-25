const grid = document.getElementById("main-grid");

//VAR POUR LA FENETRE MODALE
const modal = document.getElementById("selection-modal");
const modalContent = document.getElementById("modal-content");
const modalTitle = document.getElementById("modal-title");
const characterList = document.getElementById("character-list");
const closeModalButton = document.getElementById("close-modal");

let selectedTarget = null;

//VAR POUR LA GRID
const elements = [
    "Pyro",
    "Hydro",
    "Dendro",
    "Electro",
    "Anemo",
    "Cryo",
    "Geo",
    "Favorite"
];

const weapons = [
    "Sword",
    "Claymore",
    "Polearm",
    "Catalyst",
    "Bow",
    "Favorite"
];

const regions = [
    "Mondstadt",
    "Liyue",
    "Inazuma",
    "Sumeru",
    "Fontaine",
    "Natlan",
    "Nod Krai",
    "Snezhnaya"
];

//RECUPERATION DES DONNEES DES PERSONNAGES
let characters = [];
async function loadCharacters() {
    const response = await fetch("./data/characters.json");
    characters = await response.json();
}


function getSelectedCharacters() { 
    const selectedCharacters = [];

    const cells = grid.querySelectorAll(".cell");
    for (const cell of cells) {

        //ON SKIP LES FAVORIS
        if(cell.dataset.element === "Favorite" || cell.dataset.weapon === "Favorite") { 
            continue; 
        }

        //SI LA CASE CONTIENT UN PERSO, ON L'AJOUTE
        if (cell.selectedCharacter && !selectedCharacters.includes(cell.selectedCharacter)) {
            selectedCharacters.push(cell.selectedCharacter);
        }
    }

    
    return selectedCharacters;
}

function getFavoriteCharacters() {
    const favoriteCharacters = [];

    const cells = grid.querySelectorAll(".cell");
    
    for (const cell of cells) {
        //ON IGNORE CE QUI N'EST PAS EN FAVORI
        if (cell.dataset.element !== "Favorite" && cell.dataset.weapon !== "Favorite") {
            continue;
        }

        //ON IGNORE LA DERNIERE CASE DE FAVORI
        if (cell.dataset.element === "Favorite" && cell.dataset.weapon === "Favorite") {
            continue;
        }

        if (cell.selectedCharacter && !favoriteCharacters.includes(cell.selectedCharacter)) {
            favoriteCharacters.push(cell.selectedCharacter);
        }
    }

    return favoriteCharacters;
}




function createGrid() {
    //1ERE CASE
    const first_cell = document.createElement("div");
    first_cell.classList.add("cell", "first-cell");
    first_cell.textContent = "Pick your Favorites !";
    grid.appendChild(first_cell);

    //LIGNE DES ARMES
    for (const weapon of weapons) {
        const header = document.createElement("div");

        header.classList.add("cell", "header");

        const headerImg = document.createElement("img");
        headerImg.classList.add("header-img");
        headerImg.alt = weapon;
        headerImg.src = `./img/Icon_Weapon/Icon_${weapon}.png`;

        if(weapon === "Favorite") {
            headerImg.src = `./img/Icon_Favorite.png`;
        };

        header.appendChild(headerImg);

        grid.appendChild(header);
    }

    
    for (const element of elements) {
        //1ERE CASE ELEMENT
        const rowHeader = document.createElement("div");

        rowHeader.classList.add("cell", "header");
        const rowHeaderImg = document.createElement("img");
        rowHeaderImg.classList.add("row-header-img");
        rowHeaderImg.alt = element;
        rowHeaderImg.src = `./img/Icon_Element/Element_${element}.png`;
        if(element === "Favorite") {
            rowHeaderImg.src = `./img/Icon_Favorite.png`;
        };
        rowHeader.appendChild(rowHeaderImg);

        grid.appendChild(rowHeader);
    
        //BOUCLE POUR AJOUTER UNE CASE PAR TYPE D'ARME POUR CHAQUE ELEMENT
        for (const weapon of weapons) {
            const cell = document.createElement("div");
            cell.classList.add("cell", "selection-cell");
            if(weapon !== "Favorite")
                cell.classList.add(`${element.toLowerCase()}-cell`);
            else{
                cell.classList.add("favorite-cell");
            }
            cell.dataset.element = element;
            cell.dataset.weapon = weapon;
            cell.selectedCharacter = null;

            //EVENT QUAND ON CLIQUE SUR UNE CASE : OUVERTURE DE LA FENETRE MODALE AVEC LES PERSOS CORRESPONDANTS
            cell.addEventListener("click", () => {
                const element = cell.dataset.element;
                const weapon = cell.dataset.weapon;

                selectedTarget = cell;

                let matchingChar = characters.filter(character => {
                    return(character.element === element &&
                        character.weapon === weapon
                    )
                });


                //PERSOS DEJA SELECTIONNES
                const selectedCharacters = getSelectedCharacters();

                if(element === "Favorite") { 
                    matchingChar = selectedCharacters.filter(character => {
                        return character.weapon === weapon;
                    });
                }

                if(weapon === "Favorite") {
                    matchingChar = selectedCharacters.filter(character => {
                        return character.element === element;
                    }); 
                }

                if(element === "Favorite" && weapon === "Favorite") {
                    matchingChar = getFavoriteCharacters();
                }

        


                openSelectionModal(
                    element,
                    weapon,
                    matchingChar
                );
            });

            grid.appendChild(cell);
        }
}

}


function openSelectionModal(element, weapon, options) {
    //TITRE DE LA FENETRE
    modalTitle.textContent = `${element} × ${weapon}`;

    while(modalTitle.classList.length > 0) 
    {
        modalTitle.classList.remove(modalTitle.classList.item(0));
    }

    modalTitle.classList.add(`${element.replace(" ", "-").toLowerCase()}-text`);

    //ON VIDE LA LISTE DES PERSONNAGES
    characterList.innerHTML = "";

    //ON CREE UN ELEMENT POUR CHAQUE PERSONNAGE CORRESPONDANT A L'ELEMENT ET A L'ARME
    for (const option of options) {
        const optionElement = document.createElement("div");

        const optionImg = document.createElement("img");
        optionImg.classList.add("option-img");
        optionImg.alt = option.name;
        optionImg.src = `./img/Characters/${option.name}_Icon.png`;

        optionElement.appendChild(optionImg);

        optionElement.classList.add("character-option");
        

        optionElement.addEventListener("click", () => {
            //ON SUPPRIME SI UN ELEMENT A DEJA ETE SELECTIONNE DANS LA CASE, SI OUI ON LE SUPPRIME
            const previousContent = selectedTarget.querySelector(".cell-content");

            if(previousContent !== null)
                previousContent.remove();

            

            //ON CREE UN NOUVEAU DIV POUR LE PERSONNAGE SELECTIONNE ET ON L'AJOUTE DANS LA CASE
            const cellContent = document.createElement("div");
            cellContent.classList.add("cell-content");

            const cellImg = document.createElement("img");
            cellImg.classList.add("cell-img");
            cellImg.alt = option.name;
            cellImg.src = `./img/Characters/${option.name}_Icon.png`;

            cellContent.appendChild(cellImg);
            

            selectedTarget.appendChild(cellContent);
            selectedTarget.selectedCharacter = option;

            selectedTarget.classList.add("selected-cell");

            

            selectedTarget = null;

            //ON FERME LA FENETRE
            closeSelectionModal();

        })

        characterList.appendChild(optionElement);
    }

    modal.classList.remove("hidden");
}

//FERME LA FENETRE DE SELECTION
function closeSelectionModal() {
    modal.classList.add("hidden");
}

window.addEventListener("keydown", (event) => { 
    if(event.key === "Escape" && !modal.classList.contains("hidden"))  
        closeSelectionModal();
});
/*modal.addEventListener("click", (event) => {
    const clickTarget = event.target;

    if(clickTarget !== modalContent && clickTarget !== modalTitle && clickTarget !== closeModalButton)
    {
        closeSelectionModal();
        console.log("not modal");
    }
    
})*/
closeModalButton.addEventListener("click", closeSelectionModal);


function createSpecialChoices() {
    const specialChoices = document.getElementById("special-choices");

    //PERSO PREF PAR REGION
    for(const region of regions) {
        const regionChoice = document.createElement("div");

        const regionChoiceTitle = document.createElement("h3");
        regionChoiceTitle.classList.add("special-cell-title");
        regionChoiceTitle.textContent = `Favorite from ${region}`;
        regionChoice.appendChild(regionChoiceTitle);

        const regionChoiceCell = document.createElement("div");
        regionChoiceCell.classList.add("special-choice", "cell", "selection-cell");
        regionChoice.appendChild(regionChoiceCell);

        regionChoiceCell.addEventListener("click", () => {
            const matchingChar = characters.filter(character => {
                return character.region === region;
            })

            selectedTarget = regionChoiceCell;

            openSelectionModal(
                region,
                "Favorite",
                matchingChar
            );
        });


        switch(region) {
            case "Mondstadt":
                regionChoiceCell.classList.add("anemo-cell");
                regionChoiceTitle.classList.add("anemo-text");
                break;
            case "Liyue":
                regionChoiceCell.classList.add("geo-cell");
                regionChoiceTitle.classList.add("geo-text");
                break;
            case "Inazuma":
                regionChoiceCell.classList.add("electro-cell");
                regionChoiceTitle.classList.add("electro-text");
                break;
            case "Sumeru":
                regionChoiceCell.classList.add("dendro-cell");
                regionChoiceTitle.classList.add("dendro-text");
                break;
            case "Fontaine":
                regionChoiceCell.classList.add("hydro-cell");
                regionChoiceTitle.classList.add("hydro-text");
                break;
            case "Natlan":
                regionChoiceCell.classList.add("pyro-cell");
                regionChoiceTitle.classList.add("pyro-text");
                break;
            case "Nod Krai":
                //regionChoiceCell.classList.add("anemo-cell");
                break;
            case "Snezhnaya":
                regionChoiceCell.classList.add("cryo-cell");
                regionChoiceTitle.classList.add("cryo-text");
                break;
        }

        specialChoices.appendChild(regionChoice);
        
    }



    /*const favRegionChoice = document.createElement("div");
        

    const favRegionChoiceTitle = document.createElement("h3");
    favRegionChoiceTitle.classList.add("special-cell-title");
    favRegionChoiceTitle.textContent = `Favorite Region`;
    favRegionChoice.appendChild(favRegionChoiceTitle);

    const favRegionChoiceCell = document.createElement("div");
    favRegionChoiceCell.classList.add("special-choice", "cell");
    favRegionChoice.appendChild(favRegionChoiceCell);


    specialChoices.appendChild(favRegionChoice);*/
}



//INITIALISATION : RECUPERATION DES DONNEES DES PERSONNAGES ET CREATION DE LA GRILLE
async function init() {
    await loadCharacters();
    createGrid();
    createSpecialChoices();
}

init();