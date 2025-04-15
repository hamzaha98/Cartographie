// 🛡️ Rediriger vers login si non connecté
if (!localStorage.getItem("admin_token")) {
    window.location.href = "/frontend/admin/login.html";
}

document.addEventListener("DOMContentLoaded", function () {
    const entrepriseForm = document.getElementById("entrepriseForm");
    const messageBox = document.getElementById("message");
    const entreprisesTable = document.getElementById("entreprisesTable");
    const submitBtn = document.getElementById("submitBtn");
    const categoriesContainer = document.getElementById("categoriesContainer");
    let editingId = null;
    let allCategories = []; // Pour stocker toutes les catégories

    const headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("admin_token")
    };
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("admin_token");
            window.location.href = "/frontend/admin/login.html";
        });
    }

    // Charger les catégories disponibles pour les cases à cocher
    async function loadCategories() {
        try {
            const response = await fetch("http://localhost:3000/categories");
            allCategories = await response.json();
            
            // Générer les cases à cocher pour chaque catégorie
            categoriesContainer.innerHTML = allCategories.map(categorie => `
                <div class="category-item">
                    <input type="checkbox" class="form-check-input category-checkbox" 
                           id="cat_${categorie.id}" value="${categorie.nom}">
                    <label class="form-check-label" for="cat_${categorie.id}">${categorie.nom}</label>
                </div>
            `).join('');
        } catch (error) {
            console.error("❌ Erreur lors du chargement des catégories:", error);
        }
    }

    // Obtenir les catégories sélectionnées
    function getSelectedCategories() {
        const checkboxes = document.querySelectorAll('.category-checkbox:checked');
        return Array.from(checkboxes).map(checkbox => checkbox.value);
    }

    // Définir les catégories sélectionnées
    function setSelectedCategories(categories) {
        // Décocher toutes les cases
        document.querySelectorAll('.category-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Cocher celles qui correspondent
        if (categories && categories.length) {
            const categoryArray = categories.split(', ');
            categoryArray.forEach(cat => {
                const checkbox = document.querySelector(`.category-checkbox[value="${cat}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
    }

    async function loadEntreprises() {
        try {
            const response = await fetch("http://localhost:3000/entreprises");
            const entreprises = await response.json();

            entreprisesTable.innerHTML = entreprises.map(entreprise => {
                // Chemin du logo simplifié (sans sous-dossier de catégorie)
                const logoPath = entreprise.logo ? `http://localhost:3000/logos/${entreprise.logo}` : '/logos/default.png';
                
                return `
                <tr>
                    <td>${entreprise.nom}</td>
                    <td>
                        <div style="width: 60px; height: 60px; border: 1px solid #ccc; background-color: #fff; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                            <img src="${logoPath}" alt="Logo" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.src='/logos/default.png';">
                        </div>
                    </td>
                    <td>${entreprise.categories || ''}</td>
                    <td>
                        <div class="d-flex gap-2">
                            <button class="btn btn-warning btn-sm" onclick="editEntreprise(${entreprise.id})">Modifier</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteEntreprise(${entreprise.id})">Supprimer</button>
                        </div>
                    </td>
                </tr>
            `;
            }).join('');
        } catch (error) {
            console.error("❌ Erreur lors du chargement des entreprises:", error);
        }
    }

    entrepriseForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Récupérer les catégories sélectionnées via les cases à cocher
        const selectedCategories = getSelectedCategories();

        const entreprise = {
            nom: document.getElementById("nom").value.trim(),
            logo: document.getElementById("logo").value.trim(),
            descriptif: document.getElementById("descriptif").value.trim(),
            lien_du_site: document.getElementById("lien_du_site").value.trim(),
            mots_cles: document.getElementById("mots_cles").value.trim(),
            lieu: document.getElementById("lieu").value.trim(),
            latitude: parseFloat(document.getElementById("latitude").value) || 0,
            longitude: parseFloat(document.getElementById("longitude").value) || 0,
            public_cible: document.getElementById("public_cible").value,
            format: document.getElementById("format").value,
            type_acteur: document.getElementById("type_acteur").value,
            categories: selectedCategories
        };

        try {
            let response;
            if (editingId) {
                response = await fetch(`http://localhost:3000/entreprises/${editingId}`, {
                    method: "PUT",
                    headers,
                    body: JSON.stringify(entreprise)
                });
            } else {
                response = await fetch("http://localhost:3000/entreprises", {
                    method: "POST",
                    headers,
                    body: JSON.stringify(entreprise)
                });
            }

            const data = await response.json();

            if (response.ok) {
                messageBox.className = "alert alert-success";
                messageBox.textContent = editingId ? "Entreprise modifiée avec succès!" : "Entreprise ajoutée avec succès!";
                messageBox.classList.remove("d-none");
                entrepriseForm.reset();
                // Décocher toutes les cases à cocher
                document.querySelectorAll('.category-checkbox').forEach(checkbox => {
                    checkbox.checked = false;
                });
                editingId = null;
                submitBtn.textContent = "Ajouter l'entreprise";
                loadEntreprises();
            } else {
                messageBox.className = "alert alert-danger";
                messageBox.textContent = `Erreur: ${data.error || "Impossible d'ajouter ou modifier l'entreprise."}`;
                messageBox.classList.remove("d-none");
            }
        } catch (error) {
            messageBox.className = "alert alert-danger";
            messageBox.textContent = "Erreur de connexion.";
            messageBox.classList.remove("d-none");
            console.error("❌ Erreur lors de la requête:", error);
        }
    });

    window.editEntreprise = async function (id) {
        try {
            const response = await fetch(`http://localhost:3000/entreprises/${id}`);
            const entreprise = await response.json();
            if (!response.ok) return;
    
            document.getElementById("nom").value = entreprise.nom;
            document.getElementById("logo").value = entreprise.logo;
            document.getElementById("descriptif").value = entreprise.descriptif;
            document.getElementById("lien_du_site").value = entreprise.lien_du_site;
            document.getElementById("mots_cles").value = entreprise.mots_cles;
            document.getElementById("lieu").value = entreprise.lieu;
            
            // Nouveaux champs
            document.getElementById("latitude").value = entreprise.latitude || '';
            document.getElementById("longitude").value = entreprise.longitude || '';
            document.getElementById("date_creation").value = entreprise.date_creation ? entreprise.date_creation.split('T')[0] : '';
            document.getElementById("public_cible").value = entreprise.public_cible || '';
            document.getElementById("format").value = entreprise.format || '';
            document.getElementById("type_acteur").value = entreprise.type_acteur || '';
            
            // Mise à jour des cases à cocher des catégories
            setSelectedCategories(entreprise.categorie);
    
            editingId = id;
            submitBtn.textContent = "Modifier l'entreprise";
            
            // Défiler vers le haut de la page pour voir le formulaire
            window.scrollTo({
                top: 0,
                behavior: 'smooth'  // Pour un défilement fluide
            });
            
            // Optionnel : mettre en évidence le formulaire
            entrepriseForm.classList.add('bg-light');
            setTimeout(() => {
                entrepriseForm.classList.remove('bg-light');
            }, 1000);
            
        } catch (error) {
            console.error("❌ Erreur lors du chargement des données :", error);
        }
    };

    window.deleteEntreprise = async function (id) {
        if (confirm("⚠️ Voulez-vous vraiment supprimer cette entreprise ?")) {
            try {
                const response = await fetch(`http://localhost:3000/entreprises/${id}`, {
                    method: "DELETE",
                    headers
                });
                if (response.ok) {
                    loadEntreprises();
                } else {
                    alert("❌ Erreur lors de la suppression.");
                }
            } catch (error) {
                console.error("❌ Erreur lors de la suppression :", error);
            }
        }
    };

    loadCategories();
    loadEntreprises();
});