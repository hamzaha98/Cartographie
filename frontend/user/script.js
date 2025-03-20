document.addEventListener('DOMContentLoaded', async function () {
    const categorySelect = document.getElementById('categorySelect'); // Sélection du menu déroulant
    const resultsContainer = document.getElementById('resultsContainer');
    const categoryTitle = document.getElementById('categoryTitle');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    let entreprises = await fetchEntreprises(); // Récupération des entreprises
    let currentCategory = "Toutes"; // Par défaut, afficher tout

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

    // 📌 Fonction pour filtrer les entreprises par catégorie et mettre à jour le titre
    function filtrerParCategorie(categorie) {
        categoryTitle.textContent = categorie === "Toutes" ? "Toutes les organisations" : categorie.toUpperCase();
        currentCategory = categorie; 

        let filteredData = entreprises;

        if (categorie !== "Toutes") {
            filteredData = entreprises.filter(e => e.categorie.toLowerCase() === categorie.toLowerCase());
        }

        afficherEntreprises(filteredData);
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
            : '<p class="text-center text-danger">Aucune organisation trouvée.</p>';
    }

    // 📌 Fonction pour la recherche
    async function rechercherEntreprises() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        let filteredResults = entreprises;

        if (searchTerm) {
            try {
                console.log(`🔍 Recherche pour : ${searchTerm}`);
                const response = await fetch(`http://localhost:3000/search?q=${encodeURIComponent(searchTerm)}`);
                filteredResults = await response.json();
                console.log("🔎 Résultats trouvés :", filteredResults.length);
            } catch (error) {
                console.error("❌ Erreur lors de la recherche :", error);
            }
        }

        // Appliquer le filtre de catégorie en plus de la recherche
        if (currentCategory !== "Toutes") {
            filteredResults = filteredResults.filter(e => e.categorie.toLowerCase() === currentCategory.toLowerCase());
        }

        afficherEntreprises(filteredResults);
    }

    // 📌 Gestion du changement de sélection dans la liste déroulante
    categorySelect.addEventListener('change', function () {
        filtrerParCategorie(this.value);
    });

    // 📌 Écoute des événements pour la recherche
    searchButton.addEventListener('click', rechercherEntreprises);
    searchInput.addEventListener('keyup', rechercherEntreprises); // Recherche en temps réel

    // 📌 Affichage initial de toutes les entreprises
    filtrerParCategorie(currentCategory);
});
