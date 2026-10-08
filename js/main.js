const mainPage = document.getElementById("main");
const grid = document.getElementById("main-grid");
const outGrid = document.getElementById("out-grid");

const STORAGE_KEY = "genshin-picker-save";

const favoriteTeam = document.getElementById("favorite-team");
const specialChoices = document.getElementById("special-choices");

//VAR POUR LA FENETRE MODALE
const modal = document.getElementById("selection-modal");
const modalContent = document.getElementById("modal-content");
const modalTitle = document.getElementById("modal-title");
const characterList = document.getElementById("character-list");
const closeModalButton = document.getElementById("close-modal");

const downloadGridButton = document.getElementById("download-grid");
const resetGridButton = document.getElementById("reset-grid");

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

const fatui = [
    "Pierro",
    "Capitano",
    "Dottore",
    "Columbina",
    "Arlecchino",
    "Pulcinella",
    "Scaramouche",
    "Sandrone",
    "Signora",
    "Pantalone",
    "Tartaglia"
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

            if(cell.dataset.element === "Favorite" && cell.dataset.weapon === "Favorite")
                cell.setAttribute("id", "favFavorite");


            //EVENT QUAND ON CLIQUE SUR UNE CASE : OUVERTURE DE LA FENETRE MODALE AVEC LES PERSOS CORRESPONDANTS
            cell.addEventListener("click", () => {
                const element = cell.dataset.element;
                const weapon = cell.dataset.weapon;

                selectedTarget = cell;

                let matchingChar = characters.filter(character => {
                    return(character.element === element &&
                        character.weapon === weapon || character.element.includes(element) &&
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
                        return(character.element === element || character.element.includes(element));
                    }); 
                }

                if(element === "Favorite" && weapon === "Favorite") {
                    matchingChar = getFavoriteCharacters();
                }

        


                openSelectionModal(
                    `${element} x ${weapon}`,
                    matchingChar,
                    getCharacterImg,
                    (character) => {
                        displaySelection(
                            selectedTarget,
                            character,
                            getCharacterImg
                        );
            
                        selectedTarget.selectedCharacter = character;
                        selectedTarget = null;
                    }
                );
            });

            grid.appendChild(cell);
        }
}

}

function getCharacterImg(character) {
    return `./img/Characters/${character}_Icon.png`;
}

function getRegionImg(region) {
    return `./img/Icon_Region/${region}_Icon.png`;
}

function getSkinImg(character) {
    return `./img/Skins/${character}_Skin.png`;
}

function displaySelection(target, value, getImg) {
    //ON SUPPRIME SI UN ELEMENT A DEJA ETE SELECTIONNE DANS LA CASE, SI OUI ON LE SUPPRIME
    const previousContent = target.querySelector(".cell-content");

    //ON VIDE EGALEMENT LA CASE FAVORITE SI LE PERSO N'EST PLUS SELECTIONNE DANS LA GRID
    if(previousContent !== null)
    {
        if(target.parentNode.id === "main-grid" && target.id !== "favFavorite") {
            let selectedCells = document.querySelectorAll(".selected-cell.favorite-cell");

            console.log(selectedCells)
        
            let selectedCellsContent = [];
            selectedCells.forEach(c => {
                
                console.log(`target = ${target.selectedCharacter?.name}`);
                if(c.selectedCharacter.name === target.selectedCharacter.name && c.selectedCharacter.name !== value.name)
                {
                    selectedCellsContent.push(c.querySelector(".cell-content"));
                    c.classList.remove("selected-cell");
                }
            });

            selectedCellsContent.forEach(c => {
                c.remove();
            })

            selectedCells.forEach(c => {
                if(!c.querySelector(".cell-content"))
                    c.selectedCharacter = null;
            })
            
            selectedCells = [];
            selectedCellsContent = [];
        }
        
        

        previousContent.remove();
    }

            

    //ON CREE UN NOUVEAU DIV POUR LE PERSONNAGE SELECTIONNE ET ON L'AJOUTE DANS LA CASE
    const cellContent = document.createElement("div");
    cellContent.classList.add("cell-content");

    const cellImg = document.createElement("img");
    cellImg.classList.add("cell-img");
    cellImg.src = getImg(value.name ?? value);

    cellContent.appendChild(cellImg);
    target.appendChild(cellContent);

    target.classList.add("selected-cell");
}


function openSelectionModal(title, options, getImg, onSelect) {
    //TITRE DE LA FENETRE
    modalTitle.textContent = title;

    while(modalTitle.classList.length > 0) 
    {
        modalTitle.classList.remove(modalTitle.classList.item(0));
    }

    //modalTitle.classList.add(`${element.replace(" ", "-").toLowerCase()}-text`);

    //ON VIDE LA LISTE DES PERSONNAGES
    characterList.innerHTML = "";

    //ON CREE UN ELEMENT POUR CHAQUE PERSONNAGE CORRESPONDANT A L'ELEMENT ET A L'ARME
    for (const option of options) {
        const optionElement = document.createElement("div");

        const optionImg = document.createElement("img");
        optionImg.classList.add("option-img");
        optionImg.alt = option.name ?? option;
        optionImg.src = getImg(option.name ?? option);

        optionElement.appendChild(optionImg);

        optionElement.classList.add("character-option");
        

        optionElement.addEventListener("click", () => {
            onSelect(option);
            saveChoices();
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

closeModalButton.addEventListener("click", closeSelectionModal);

function createTeam() {
    const favoriteTeam = document.getElementById("favorite-team");
    let teamSlots = [];

    for(let i = 0; i < 4; i++) {
        const teamMember = document.createElement("div");
        teamMember.classList.add("cell", "selection-cell", `cell-${i+1}`);

        teamSlots.push(teamMember);
    }



    teamSlots.forEach(slot => { 
        slot.addEventListener("click", () => { 
            selectedTarget = slot;
            openSelectionModal(
                `Team Member ${teamSlots.indexOf(slot) + 1}`,
                characters,
                getCharacterImg,
                (character) => {
                    const previousSlot = teamSlots.find(slot =>
                        slot !== selectedTarget &&
                        slot.selectedCharacter?.name === character.name
                    );

                    if (previousSlot) {
                        previousSlot.selectedCharacter = null;

                        const previousContent = previousSlot.querySelector(".cell-content");

                        if (previousContent !== null)
                            previousContent.remove();
                    }   

                    displaySelection(
                        selectedTarget,
                        character,
                        getCharacterImg
                    );

                    selectedTarget.selectedCharacter = character;
                    selectedTarget = null;
                }
            )
        });

         favoriteTeam.appendChild(slot);
    });

    
}


function createSpecialChoices() {
    const specialChoices = document.getElementById("special-choices");

    //#region PERSO PREF PAR REGION
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
                `Favorite from ${region}`,
                matchingChar,
                getCharacterImg,
                (character) => {
                    displaySelection(
                        selectedTarget,
                        character,
                        getCharacterImg
                    );
            
                    selectedTarget.selectedCharacter = character;
                    selectedTarget = null;
                }
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
                regionChoiceCell.classList.add("nod-krai-cell");
                regionChoiceTitle.classList.add("nod-krai-text");
                break;
            case "Snezhnaya":
                regionChoiceCell.classList.add("cryo-cell");
                regionChoiceTitle.classList.add("cryo-text");
                break;
        }

        specialChoices.appendChild(regionChoice);
        
    }

    //#endregion

    //#region REGION PREFEREE
    const favRegionChoice = document.createElement("div");
        

    const favRegionChoiceTitle = document.createElement("h3");
    favRegionChoiceTitle.classList.add("special-cell-title", "region-text");
    favRegionChoiceTitle.textContent = `Favorite Region`;
    favRegionChoice.appendChild(favRegionChoiceTitle);

    const favRegionChoiceCell = document.createElement("div");
    favRegionChoiceCell.classList.add("special-choice", "cell", "selection-cell", "region-cell");
    favRegionChoice.appendChild(favRegionChoiceCell);

    favRegionChoiceCell.addEventListener("click", () => {
        selectedTarget = favRegionChoiceCell;

        openSelectionModal(
            "Favorite Region",
            regions,
            getRegionImg,
            (region) => {
                displaySelection(
                    selectedTarget,
                    region,
                    getRegionImg
                );

                selectedTarget.selectedRegion = region;

                selectedTarget = null;
            }
        );
    });

    specialChoices.appendChild(favRegionChoice);

    //#endregion

    //#region ARCHON PREFERE
    const favArchonChoice = document.createElement("div");

    const favArchonChoiceTitle = document.createElement("h3");
    favArchonChoiceTitle.classList.add("special-cell-title", "archon-text");
    favArchonChoiceTitle.textContent = `Favorite Archon`;
    favArchonChoice.appendChild(favArchonChoiceTitle);

    const favArchonChoiceCell = document.createElement("div");
    favArchonChoiceCell.classList.add("special-choice", "cell", "selection-cell", "archon-cell");
    favArchonChoice.appendChild(favArchonChoiceCell);

    favArchonChoiceCell.addEventListener("click", () => {
        const matchingChar = characters.filter(character => {
            return character.archon;
        })

        matchingChar.sort((a, b) => {
            const archonA = a.archon;
            const archonB = b.archon;
            if(archonA < archonB)
                return -1;

            if(archonA > archonB)
                return 1;

            return 0;
        });
        
        selectedTarget = favArchonChoiceCell;

        openSelectionModal(
            "Favorite Archon",
            matchingChar,
            getCharacterImg,
            (character) => {
                displaySelection(
                    selectedTarget,
                    character,
                    getCharacterImg
                );

                selectedTarget.selectedCharacter = character;
                selectedTarget = null;
            }
        );
    });

    specialChoices.appendChild(favArchonChoice);

    //#endregion

    //#region FATUI PREFERE
    const favFatuiChoice = document.createElement("div");

    const favFatuiChoiceTitle = document.createElement("h3");
    favFatuiChoiceTitle.classList.add("special-cell-title", "fatui-text");
    favFatuiChoiceTitle.textContent = `Favorite Fatui`;
    favFatuiChoice.appendChild(favFatuiChoiceTitle);

    const favFatuiChoiceCell = document.createElement("div");
    favFatuiChoiceCell.classList.add("special-choice", "cell", "selection-cell", "fatui-cell");
    favFatuiChoice.appendChild(favFatuiChoiceCell);

    favFatuiChoiceCell.addEventListener("click", () => {
        const matchingChar = fatui;
        
        selectedTarget = favFatuiChoiceCell;

        openSelectionModal(
            "Favorite Fatui",
            matchingChar,
            getCharacterImg,
            (character) => {
                displaySelection(
                    selectedTarget,
                    character,
                    getCharacterImg
                );

                selectedTarget.selectedCharacter = character;
                selectedTarget = null;
            }
        );
    });

    specialChoices.appendChild(favFatuiChoice);

    //#endregion

    //#region SKIN PREFERE
    const favSkinChoice = document.createElement("div");

    const favSkinChoiceTitle = document.createElement("h3");
    favSkinChoiceTitle.classList.add("special-cell-title", "skin-text");
    favSkinChoiceTitle.textContent = `Favorite Skin`;
    favSkinChoice.appendChild(favSkinChoiceTitle);

    const favSkinChoiceCell = document.createElement("div");
    favSkinChoiceCell.classList.add("special-choice", "cell", "selection-cell", "skin-cell");
    favSkinChoice.appendChild(favSkinChoiceCell);

    favSkinChoiceCell.addEventListener("click", () => {
        let matchingChar = characters.filter(character => {
            return character.skin;
        })
        matchingChar.push("Aether", "Lumine");
        matchingChar.sort((a, b) => {
            const skinA = a.skin ?? a;
            const skinB = b.skin ?? b;

            if(skinA < skinB)
                return -1;
            if(skinA > skinB)
                return 1;
            return 0;
        });
        selectedTarget = favSkinChoiceCell;

        openSelectionModal(
            "Favorite Skin",
            matchingChar,
            getSkinImg,
            (character) => {
                displaySelection(
                    selectedTarget,
                    character,
                    getSkinImg
                );

                selectedTarget.selectedCharacter = character;
                selectedTarget = null;
            }
        );
    });

    specialChoices.appendChild(favSkinChoice);

    //#endregion

    
}



async function downloadGrid() {   
    //RECUPERE TOUTE LA PAGE
    const dataUrl = await htmlToImage.toPng(document.body);

    //ON CREE UNE IMAGE DE TOUTE LA PAGE AVEC CE QU'ON A AU DESSUS
    const image = new Image();
    image.src = dataUrl;

    //ON ATTEND QUE L'IMAGE SOIT CHARGEE
    await image.decode();

    //ON RECUPERE COORDONNES ET TAILLE DE MAIN, LA ZONE AVEC TOUT LES PERSOS
    const rect = mainPage.getBoundingClientRect();

    //ON PREND EN COMPTE LE SCROLLING DANS LA PAGE POUR LES COORDONNEES DE MAIN
    const mainX = rect.left + window.scrollX;
    const mainY = rect.top + window.scrollY;

    //ON CREE UN CANVAS (élément basique pour dessiner dessus) DE LA TAILLE DE MAIN
    const canvas = document.createElement("canvas");
    canvas.width = mainPage.offsetWidth;
    canvas.height = mainPage.offsetHeight;

    //CE QUI PERMET DE DESSINER
    const ctx = canvas.getContext("2d");

    //ON DESSINE L'IMAGE
    ctx.drawImage(
        image,  //IMAGE

        //CE QU'ON VEUT RECUPERER DANS L'IMAGE
        mainX,  //COORDONNEES DE MAIN SUR X
        mainY,  //COORDONNEES DE MAIN SUR Y
        mainPage.offsetWidth,   //DIMENSIONS DE MAIN POUR QUE LE GRAPH FASSE LA BONNE TAILLE
        mainPage.offsetHeight,

        //COORDONNES SUR LE CANVAS
        0,
        0,
        mainPage.offsetWidth,   //MEME DIMENSIONS QUE MAIN
        mainPage.offsetHeight
    );

    //CONVERSION CANVAS EN IMAGE
    const finalDataUrl = canvas.toDataURL("image/png");

    //ON EXPORTE L'IMAGE CREEE
    const link = document.createElement("a");
    link.download = "genshin-picker.png";
    link.href = finalDataUrl;
    link.click();
}

downloadGridButton.addEventListener("click", downloadGrid);

function clearCell(cell) {
    cell.querySelector(".cell-content")?.remove();

    cell.selectedCharacter = null;
    cell.selectedRegion = null;

    cell.classList.remove("selected-cell");
}


function clearAll() { 
    grid.querySelectorAll(".selection-cell").forEach(cell => {
        clearCell(cell);
    });

    specialChoices.querySelectorAll(".selection-cell").forEach(cell => {
        clearCell(cell);
    });

    favoriteTeam.querySelectorAll(".selection-cell").forEach(cell => {
        clearCell(cell);
    });

    localStorage.removeItem(STORAGE_KEY);
}

resetGridButton.addEventListener("click", clearAll);


function saveChoices() {
    const data = {
        grid: [],
        team: [],
        special: []
    };

    grid.querySelectorAll(".selection-cell").forEach(cell => {
        if(!cell.selectedCharacter)
            return;

        data.grid.push({
            element: cell.dataset.element,
            weapon: cell.dataset.weapon,
            character: cell.selectedCharacter.name
        });
    });


    favoriteTeam.querySelectorAll(".selection-cell").forEach(cell => {

        data.team.push(
            cell.selectedCharacter?.name ?? null
        );
    });

    specialChoices.querySelectorAll(".selection-cell").forEach(cell => {
        const title = cell.parentNode.querySelector(".special-cell-title");

        if(!title)
            return;

        const value = 
            cell.selectedRegion ??
            cell.selectedCharacter?.name ??
            cell.selectedCharacter ??
            null;

        if(value !== null) {
            data.special.push({
                title: title.textContent,
                value: value
            });
        };
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadSavedChoices() {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if(!savedData)
        return

    const data = JSON.parse(savedData);

    for(const savedCell of data.grid ?? []) {
        const cell = [...grid.querySelectorAll(".selection-cell")].find(cell =>
            cell.dataset.element === savedCell.element &&
            cell.dataset.weapon === savedCell.weapon
        );

        if(!cell)
            continue;

        const character = characters.find(
            character => character.name === savedCell.character
        );

        if(!character)
            continue;

        displaySelection(
            cell,
            character,
            getCharacterImg
        );

        cell.selectedCharacter = character;
        cell.classList.add("selected-cell");
    }

    const teamSlots = favoriteTeam.querySelectorAll(".selection-cell");

    data.team?.forEach((characterName, index) => {
        if(!characterName)
            return;

        const slot = teamSlots[index];

        if(!slot)
            return;

        const character = characters.find(character =>
            character.name === characterName
        );

        if(!character)
            return;

        displaySelection(
            slot,
            character,
            getCharacterImg
        );

        slot.selectedCharacter = character;
        slot.classList.add("selected-cell");


        for(const savedSpecial of data.special?? []) {
            const cell = [...specialChoices.querySelectorAll(".selection-cell")].find(cell => {
                const title = cell.parentElement.querySelector(".special-cell-title");

                return title?.textContent === savedSpecial.title;
            })

            if(!cell)
                continue;

            if (savedSpecial.title === "Favorite Region") {

                displaySelection(
                    cell,
                    savedSpecial.value,
                    getRegionImg
                );

                cell.selectedRegion = savedSpecial.value;
                cell.classList.add("selected-cell");

                continue;
            };

            if (savedSpecial.title === "Favorite Skin") {

                const character = characters.find(
                    character => character.name === savedSpecial.value
                ) ?? savedSpecial.value;

                displaySelection(
                    cell,
                    character,
                    getSkinImg
                );

                cell.selectedCharacter = character;
                cell.classList.add("selected-cell");

                continue;
            };

            const character = characters.find(
                character => character.name === savedSpecial.value
            );

            if (!character) 
                continue;

            displaySelection(
                cell,
                character,
                getCharacterImg
            );

            cell.selectedCharacter = character;
            cell.classList.add("selected-cell");
        }
    });
}



//INITIALISATION : RECUPERATION DES DONNEES DES PERSONNAGES ET CREATION DE LA GRILLE
async function init() {
    await loadCharacters();
    createGrid();
    createTeam();
    createSpecialChoices();
    loadSavedChoices();
}

init();