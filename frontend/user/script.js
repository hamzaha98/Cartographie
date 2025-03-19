document.addEventListener('DOMContentLoaded', async function () {
    const categories = document.querySelectorAll('.category-btn'); 
    const resultsContainer = document.getElementById('resultsContainer');
    const categoryTitle = document.getElementById('categoryTitle'); // Sélection du titre de la catégorie
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    let entreprises = await fetchEntreprises(); // Récupération des entreprises au chargement
    let currentCategory = "Toutes"; // Par défaut, afficher toutes les entreprises

    // 📌 Fonction pour filtrer les entreprises par catégorie et mettre à jour le titre
    function filtrerParCategorie(categorie) {
        categoryTitle.textContent = categorie.toUpperCase(); // Mise à jour du titre de la catégorie
        currentCategory = categorie; // Stocke la catégorie actuelle

        if (categorie === "Toutes") {
            afficherEntreprises(entreprises);
        } else {
            const filtered = entreprises.filter(e => e.categorie.toLowerCase() === categorie.toLowerCase());
            afficherEntreprises(filtered);
        }
    }

    // 📌 Ajout d'un écouteur d'événements sur chaque bouton de catégorie
    categories.forEach(button => {
        button.addEventListener('click', function () {
            const selectedCategory = this.textContent.trim();
            filtrerParCategorie(selectedCategory);
        });
    });

    // 📌 Fonction pour récupérer les entreprises depuis l'API
    async function fetchEntreprises() {
        try {
            const response = await fetch('http://localhost:3000/entreprises');
            const entreprises = await response.json();
            console.log("✅ Entreprises chargées :", entreprises);
            return entreprises;
        } catch (error) {
            console.error("❌ Erreur lors de la récupération des entreprises :", error);
            return [];
        }
    }

    // 📌 Fonction pour afficher les entreprises
    function afficherEntreprises(data) {
        resultsContainer.innerHTML = data.length
            ? data.map(entreprise => `
                <div class="col-md-4">
                    <div class="card shadow-sm p-3 text-center">
                        <img src="${entreprise.logo || 'https://via.placeholder.com/80'}" 
                            onerror="this.src='https://via.placeholder.com/80';" 
                            alt="${entreprise.nom}" class="img-fluid mx-auto d-block rounded-circle" 
                            style="width: 80px; height: 80px; object-fit: contain;">
                        <div class="fw-bold mt-2">${entreprise.nom}</div>
                        <p class="text-muted">${entreprise.descriptif || ''}</p>
                        <a href="${entreprise.lien_du_site}" target="_blank" class="d-block text-primary fw-bold mt-2">
                            <i class="bi bi-link-45deg"></i> Écouter
                        </a>
                    </div>
                </div>
            `).join('')
            : '<p class="text-center text-danger">Aucune entreprise trouvée.</p>';
    }

    // 📌 Fonction pour la recherche
    async function rechercherEntreprises() {
        const searchTerm = searchInput.value.trim().toLowerCase();

        if (!searchTerm) {
            console.log("🔄 Affichage de toutes les entreprises");
            filtrerParCategorie(currentCategory); // Réafficher la catégorie actuelle
            return;
        }

        try {
            console.log(`🔍 Recherche pour : ${searchTerm}`);
            const response = await fetch(`http://localhost:3000/search?q=${encodeURIComponent(searchTerm)}`);
            const filteredResults = await response.json();
            console.log("🔎 Résultats trouvés :", filteredResults.length);

            afficherEntreprises(filteredResults);
        } catch (error) {
            console.error("❌ Erreur lors de la recherche :", error);
        }
    }

    // 📌 Écoute des événements pour la recherche
    searchButton.addEventListener('click', rechercherEntreprises);
    searchInput.addEventListener('keyup', rechercherEntreprises); // Recherche en temps réel
});
