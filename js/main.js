const grid = document.getElementById("main-grid");

//VAR POUR LA FENETRE MODALE
const modal = document.getElementById("selection-modal");
const modalTitle = document.getElementById("modal-title");
const characterList = document.getElementById("character-list");
const closeModalButton = document.getElementById("close-modal");

var selectedCell = null;

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

//RECUPERATION DES DONNEES DES PERSONNAGES
var characters = [];
async function loadCharacters() {
    const response = await fetch("./data/characters.json");
    characters = await response.json();
}


var selectedCharacters = [];


function createGrid() {
    //1ERE CASE
    const first_cell = document.createElement("div");
    first_cell.classList.add("cell");
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
        //header.textContent = weapon;

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
    //rowHeader.textContent = element;

    grid.appendChild(rowHeader);
    
    //BOUCLE POUR AJOUTER UNE CASE PAR TYPE D'ARME POUR CHAQUE ELEMENT
    for (const weapon of weapons) {
        const cell = document.createElement("div");


        cell.classList.add("cell");
        cell.dataset.element = element;
        cell.dataset.weapon = weapon;

        //EVENT QUAND ON CLIQUE SUR UNE CASE : OUVERTURE DE LA FENETRE MODALE AVEC LES PERSOS CORRESPONDANTS
        cell.addEventListener("click", () => {
            const element = cell.dataset.element;
            const weapon = cell.dataset.weapon;

            selectedCell = cell;

            var matchingChar = characters.filter(character => {
                return(character.element === element &&
                    character.weapon === weapon
                )
            });

            if(element === "Favorite") {
            
                matchingChar = characters.filter(character => {
                    return(character.weapon === weapon &&
                        selectedCharacters.includes(character)
                    );
                });
            };

            if(weapon === "Favorite") {
                matchingChar = characters.filter(character => {
                    return(character.element === element &&
                        selectedCharacters.includes(character)
                    );
                });
            };


            if(element === "Favorite" && weapon === "Favorite") {
                matchingChar = selectedCharacters;
            };


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


function openSelectionModal(element, weapon, matchingCharacters) {
    //TITRE DE LA FENETRE
    modalTitle.textContent = `${element} × ${weapon}`;

    //ON VIDE LA LISTE DES PERSONNAGES
    characterList.innerHTML = "";

    //ON CREE UN ELEMENT POUR CHAQUE PERSONNAGE CORRESPONDANT A L'ELEMENT ET A L'ARME
    for (const character of matchingCharacters) {
        const option = document.createElement("div");
        const optionImg = document.createElement("img");
        optionImg.classList.add("option-img");
        optionImg.alt = character.name;
        optionImg.src = `./img/Characters/${character.name}_Icon.png`;
        option.appendChild(optionImg);

        option.classList.add("character-option");
        //option.textContent = character.name;

        option.addEventListener("click", () => {
            //ON SUPPRIME SI UN ELEMENT A DEJA ETE SELECTIONNE DANS LA CASE, SI OUI ON LE SUPPRIME
            const previousContent = selectedCell.querySelector(".cell-content");

            if(previousContent !== null)
                previousContent.remove();

            //ON CREE UN NOUVEAU DIV POUR LE PERSONNAGE SELECTIONNE ET ON L'AJOUTE DANS LA CASE
            const cellContent = document.createElement("div");
            cellContent.classList.add("cell-content");
            const cellImg = document.createElement("img");
            cellImg.classList.add("cell-img");
            cellImg.alt = character.name;
            cellImg.src = `./img/Characters/${character.name}_Icon.png`;
            cellContent.appendChild(cellImg);
            //cellContent.textContent = character.name;

            selectedCell.appendChild(cellContent);

            selectedCell = null;

            //ON FERME LA FENETRE
            closeSelectionModal();
            
            if(!selectedCharacters.includes(character))
                selectedCharacters.push(character);
        })

        characterList.appendChild(option);
    }

    modal.classList.remove("hidden");
    //modal.addEventListener("click", closeSelectionModal);
}

//FERME LA FENETRE DE SELECTION
function closeSelectionModal() {
    modal.classList.add("hidden");
}

closeModalButton.addEventListener("click", closeSelectionModal);

//INITIALISATION : RECUPERATION DES DONNEES DES PERSONNAGES ET CREATION DE LA GRILLE
async function init() {
    await loadCharacters();
    createGrid();
}

init();