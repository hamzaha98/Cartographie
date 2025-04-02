document.addEventListener('DOMContentLoaded', async function () {
    const categorySelect = document.getElementById('categorySelect'); // Menu déroulant
    const resultsContainer = document.getElementById('resultsContainer');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const publicCibleSelect = document.getElementById('publicCibleSelect'); // Nouveau filtre Public cible
    const formatSelect = document.getElementById('formatSelect'); // Nouveau filtre Format
    const typeActeurSelect = document.getElementById('typeActeurSelect'); // Nouveau filtre Type d'acteur


    let entreprises = await fetchEntreprises(); // Chargement initial
    let currentCategory = "Toutes";
    let currentPublicCible = "Toutes"; // Valeur par défaut pour Public cible
    let currentFormat = "Toutes"; // Valeur par défaut pour Format
    let currentTypeActeur = "Toutes"; // Valeur par défaut pour Type d'acteur


    // N📌 Fonction pour récupérer les entreprises depuis l'API
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

    // N📌 Fonction pour mettre à jour les titres des filtres actifs
    function updateFilterTitles() {
        const filterSubtitles = document.getElementById('filterSubtitles');

        const filterTitles = [];

        if (currentCategory !== "Toutes") {
            filterTitles.push(`Catégorie : ${currentCategory}`);
        }
        if (currentPublicCible !== "Toutes") {
            filterTitles.push(`Public cible : ${currentPublicCible}`);
        }
        if (currentFormat !== "Toutes") {
            filterTitles.push(`Format : ${currentFormat}`);
        }
        if (currentTypeActeur !== "Toutes") {
            filterTitles.push(`Type d'acteur : ${currentTypeActeur}`);
        }

        // Si aucun filtre n'est actif, afficher un message par défaut
        filterSubtitles.textContent = filterTitles.length
            ? filterTitles.join(' | ')
            : 'Aucun filtre actif';
    }

    // 📌 Fonction pour filtrer les entreprises selon les critères
    function filtrerEntreprises() {
        let filteredData = entreprises;

        // Filtrage par catégorie
        if (currentCategory !== "Toutes") {
            filteredData = filteredData.filter(e => e.categorie.toLowerCase() === currentCategory.toLowerCase());
        }

        // Filtrage par Public cible
        if (currentPublicCible !== "Toutes") {
            filteredData = filteredData.filter(e => e.public_cible && e.public_cible.toLowerCase() === currentPublicCible.toLowerCase());
        }

        // Filtrage par Format
        if (currentFormat !== "Toutes") {
            filteredData = filteredData.filter(e => e.format && e.format.toLowerCase() === currentFormat.toLowerCase());
        }

        // Filtrage par Type d'acteur
        if (currentTypeActeur !== "Toutes") {
            filteredData = filteredData.filter(e => e.type_acteur && e.type_acteur.toLowerCase() === currentTypeActeur.toLowerCase());
        }

        afficherEntreprises(filteredData);
    }

    // ✅ Fonction mise à jour pour afficher les entreprises avec les bons logos
    function afficherEntreprises(data) {
        resultsContainer.innerHTML = data.length
            ? data.map(entreprise => {
                const imagePath = `http://localhost:3000/logos/${entreprise.categorie}/${entreprise.logo}`;
                console.log("🔗 Image URL :", imagePath);
    
                return `
                    <div class="col-md-4 mb-4">
                        <div class="card shadow-sm p-3 text-center h-100">
                            <img src="${imagePath}" 
                                 onerror="this.src='/logos/Technologies Éducatives (EDTECH)/TecE_creativiteQc.png';" 
                                 alt="${entreprise.nom}" 
                                 class="img-fluid mx-auto d-block rounded-circle" 
                                 style="width: 80px; height: 80px; object-fit: contain;">
                            <div class="fw-bold mt-2">${entreprise.nom}</div>
                            <p class="text-muted">${entreprise.descriptif || ''}</p>
                            <a href="${entreprise.lien_du_site}" target="_blank" class="d-block text-primary fw-bold mt-2">
                                <i class="bi bi-link-45deg"></i> Écouter
                            </a>
                        </div>
                    </div>
                `;
            }).join('')
            : '<p class="text-center text-danger">Aucune organisation trouvée.</p>';
    }
    
// 📌 Fonction pour la recherche avec filtre catégorie
    async function rechercherEntreprises() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        let filteredResults = entreprises;

        if (searchTerm) {
            filteredResults = entreprises.filter(e =>
                e.nom.toLowerCase().includes(searchTerm) || 
                (e.descriptif && e.descriptif.toLowerCase().includes(searchTerm))
            );

        // S'il n'y a pas de résultats, consulter l'API en tant que dernière ressource.
        if (filteredResults.length === 0) {
            try {
                console.log(`🔍 No encontrado localmente. Buscando en API: ${searchTerm}`);
                const response = await fetch(`http://localhost:3000/search?q=${encodeURIComponent(searchTerm)}`);
                filteredResults = await response.json();
                console.log("🔎 Résultats trouvés :", filteredResults.length);
            } catch (error) {
                console.error("❌ Error al buscar en la API:", error);
            }
        }
    }

    
        // Filtrage par catégorie actif
        if (currentCategory !== "Toutes") {
            filteredResults = filteredResults.filter(e => e.categorie.toLowerCase() === currentCategory.toLowerCase());
        }

        afficherEntreprises(filteredResults);
    }

    // 📌 Gestionnaires d'événements pour les nouveaux filtres
     categorySelect.addEventListener('change', function () {
        currentCategory = this.value;
        filtrerEntreprises();
        updateFilterTitles();
    });

    publicCibleSelect.addEventListener('change', function () {
        currentPublicCible = this.value;
        filtrerEntreprises();
        updateFilterTitles();
    });

    formatSelect.addEventListener('change', function () {
        currentFormat = this.value;
        filtrerEntreprises();
        updateFilterTitles();
    });

    typeActeurSelect.addEventListener('change', function () {
        currentTypeActeur = this.value;
        filtrerEntreprises();
        updateFilterTitles();
    });

    searchButton.addEventListener('click', rechercherEntreprises);
    searchInput.addEventListener('keyup', rechercherEntreprises);

    // 📌 Chargement initial
    filtrerEntreprises();
});
