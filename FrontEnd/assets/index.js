let works = [];
const connexionToken = window.localStorage.getItem("token");
const userId = window.localStorage.getItem("userId");

if(connexionToken !== null) {
    // Modification du lien connexion et deconnexion
    let connexionButton = document.getElementById("connexion-button");
    connexionButton.innerHTML = "logout";
    connexionButton.addEventListener("click", function () {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        window.location.assign("index.html"); // Voir pk sa redirige vers la connexion
    });

    // Ajout de la barre d'édition
    const bodyElement = document.querySelector("body");

    const editionBar = document.createElement("div");
    editionBar.classList.add("edition-bar");
    const navElement = document.createElement("nav");
    navElement.innerHTML = '<i class="fa-regular fa-pen-to-square" style="color: #ffffff;"></i> Mode édition';

    bodyElement.insertBefore(editionBar, bodyElement.firstChild);
    editionBar.appendChild(navElement);

    // Ajout du boutton modifier après le H1
    const portfolioElement = document.getElementById("portfolio");
    portfolioElement.children[0].remove();
    const divElement = document.createElement("div");
    const h2Element = document.createElement("h2");
    const edition = document.createElement("span");

    divElement.classList.add("edition-modale");

    h2Element.innerText = 'Mes projets'
    edition.innerHTML = '<i class="fa-regular fa-pen-to-square" style="color: #000000;"></i> modifier';

    portfolioElement.insertBefore(divElement, portfolioElement.firstChild);
    divElement.appendChild(h2Element);
    divElement.appendChild(edition);

    // Ajout de la modal 
    edition.addEventListener("click", function () {
        const modalElement = document.getElementById("modal1");
        const modalGallery = document.getElementById("js-modal-gallery");
        const modalPageOne = document.getElementById("js-modal");
        const modalPageTwo = document.getElementById("js-modal-add");
        const modalGoBack = document.querySelector(".js-modal-back");

        modalElement.style.display = null;
        modalGallery.style.display = null;

        fetchModalWorksJson();
        // Fermé la modal
        modalElement.querySelector(".js-modal-close").addEventListener("click", function () {
            modalElement.style.display = "none";
        });
        
        // Page 2 de la modal
        modalElement.querySelector("#js-add-picture").addEventListener("click", function () {
            const limit = document.getElementById("js-upload-limit");
            const fileLabel = document.querySelector(".input-file-label");
            
            modalPageOne.style.display = "none";
            modalPageTwo.style.display = null;
            modalGoBack.style.display = null;

            // Retour en arrière
            modalGoBack.addEventListener("click", function() { 

                limit.style.display = null;
                fileLabel.style.display = null;
                modalPageOne.style.display = null;
                modalPageTwo.style.display = "none";
                modalGoBack.style.display = "none";
                document.getElementById("modal-form-add").reset();
            });
            // Preview image
            const image = document.getElementById("previewImage");
            let imageInput = document.getElementById("js-upload");

            const defaultImage = "./assets/icons/photo.png";
            image.src = defaultImage;

            document.getElementById("js-upload").addEventListener("change", previewImage);

            // Liste des catégories
            listCategoriesJSON();

            // Gestion de l'ajout de l'image
            document.querySelector("#modal-form-add").addEventListener("submit", async function(event) {
                event.preventDefault();

                let name = document.getElementById("title").value;
                let category = document.getElementById("categories").value;

                const formData = new FormData();

                formData.append("title", name);
                formData.append("category", category);
                formData.append("image", imageInput.files[0]);

                try {
                    const response = await fetch("http://localhost:5678/api/works", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${connexionToken}`
                        },
                        body: formData
                    });

                    if (response.ok) {
                        document.getElementById("modal-form-add").reset();
                        modalPageOne.style.display = null;
                        modalPageTwo.style.display = "none";
                        modalGoBack.style.display = "none";
                        modalElement.style.display = "none";
                        image.src = defaultImage;

                        fetchWorksJSON();

                    } else {
                        console.error("Erreur lors de l'ajout du projet :", response.status, response.statusText);
                    }
                } catch (error) {
                    console.error("Erreur réseau ou serveur :", error);
                }

            });

        });
    });
}

function previewImage() {
    const input = document.getElementById("js-upload");
    const limit = document.getElementById("js-upload-limit");
    const image = document.getElementById("previewImage");
    const fileLabel = document.querySelector(".input-file-label");

    if(input.files && input.files[0]) {
        const reader = new FileReader();

        limit.style.display = "none";
        fileLabel.style.display = "none";

        reader.onload = function(e) {
            image.src = e.target.result;
        };

        reader.readAsDataURL(input.files[0]);
    }
}

// Recherche des éléments pour la modal
async function fetchModalWorksJson() {
    const reponse = await fetch("http://localhost:5678/api/works");
    works = await reponse.json();
    const modalElement = document.getElementById("modal1");
    const modalGallery = modalElement.querySelector(".gallery");
    modalGallery.innerHTML = "";

    for (let i = 0; i < works.length; i++) {
        const figureElement = document.createElement("figure");
        const imageElement = document.createElement("img");
        const delElement = document.createElement("div");
        // Suppression d'un element de la gallery
        delElement.addEventListener("click", async function () {
            try {
                const response = await fetch(`http://localhost:5678/api/works/${works[i].id}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${connexionToken}`
                    }
                });

                if(response.ok) {
                    figureElement.remove(); // Supprime l'élément visuellement

                    const mainGallery = document.querySelector(".gallery");
                    const mainFigure = Array.from(mainGallery.children).find(
                        (child) => child.querySelector("img").src === works[i].imageUrl
                    );

                    if(mainFigure) {
                        mainFigure.remove();
                    }

                    console.log(`L'élément avec l'ID ${works[i].id} a été supprimé.`);
                } else {
                    console.error("Échec de la suppression :", response.status, response.statusText)
                }
            } catch (error) {
                console.error("Échec de la suppression: ", response.status, response.statusText)
            }
        });

        delElement.classList.add("del-element");

        delElement.innerHTML = '<i class="fa-regular fa-trash-can" style="color: #ffffff;"></i>';
        imageElement.src = works[i].imageUrl;
    
        modalGallery.appendChild(figureElement);
        figureElement.appendChild(imageElement);
        figureElement.appendChild(delElement);
    }
}

async function fetchWorksJSON() {
    const reponse = await fetch("http://localhost:5678/api/works");
    works = await reponse.json();
    genererWorks(works);
}

function genererWorks(worksToDisplay) {
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = "";

    for (let i = 0; i < worksToDisplay.length; i++) {
        const figureElement = document.createElement("figure");
        const figcaptionElement = document.createElement("figcaption");
        figcaptionElement.innerText = worksToDisplay[i].title;
        const imageElement = document.createElement("img");
        imageElement.src = worksToDisplay[i].imageUrl;
    
        gallery.appendChild(figureElement);
        figureElement.appendChild(imageElement);
        figureElement.appendChild(figcaptionElement);
    }
}

fetchWorksJSON();
fetchCategoriesJSON();
fetchUsersJSON();

async function listCategoriesJSON() {
    const reponse = await fetch("http://localhost:5678/api/categories");
    const categories = await reponse.json();
    
    const categoryList = document.getElementById("categories");

    for (let i = 0; i < categories.length; i++) {
        const optionElement = document.createElement("option");
        optionElement.innerText = categories[i].name;
        optionElement.value = categories[i].id;
        categoryList.appendChild(optionElement);
    }


}

async function fetchCategoriesJSON() {
    const reponse = await fetch("http://localhost:5678/api/categories");
    const categories = await reponse.json();
    
    const categoryMenu = document.querySelector(".menu-categories");
    const ulElement = document.createElement("ul");
    const liElement = document.createElement("li");

    liElement.innerText = "Tous";
    liElement.classList.add(`btn-menu0`);
    liElement.addEventListener("click", function() {
        document.querySelector(".gallery").innerHTML = "";
        genererWorks(works);
    });

    categoryMenu.appendChild(ulElement);
    ulElement.appendChild(liElement);

    for (let i = 0; i < categories.length; i++) {
        const liElement = document.createElement("li");
        liElement.innerText = categories[i].name;
        liElement.classList.add(`btn-menu` + categories[i].id);
        liElement.addEventListener("click", function() {
            const filtre = works.filter(function (work) {
                return work.categoryId === categories[i].id;
            });
            document.querySelector(".gallery").innerHTML = "";
            genererWorks(filtre);
        });
        ulElement.appendChild(liElement);
    }
}

async function fetchUsersJSON() {
    if(connexionToken === null) {
        document.querySelector("#connexion-form").addEventListener("submit", async function(event) {
            event.preventDefault();
    
            // On récupère les champs
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
    
            try {
                // Envoyer la requête de connexion
                const reponse = await fetch("http://localhost:5678/api/users/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        "email": email,
                        "password": password
                      })
                });
    
                // Vérification de la réponse
                if (reponse.ok) {
                    const data = await reponse.json();
                    //console.log("connexion réussi :", data.token);
                    window.localStorage.setItem("token", data.token);
                    window.localStorage.setItem("userId", data.userId);
                    window.location.assign("index.html");
                } else {
                    // Afficher un message d'erreur à l'utilisateur
                    console.error("erreur de connexion :", reponse.status);
                }
            } catch (error) {
                console.error("Erreur réseau:", error);
                // Afficher un message d'erreur réseau à l'utilisateur
            }
        });
    } else {
        document.querySelector("#connexion").innerHTML = " ";
    }
    
}


