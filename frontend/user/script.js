document.addEventListener('DOMContentLoaded', async function () {
    const categorySelect = document.getElementById('categorySelect');
    const resultsContainer = document.getElementById('resultsContainer');
    const categoryTitle = document.getElementById('categoryTitle');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    let entreprises = await fetchEntreprises();
    let currentCategory = "Toutes";

    async function fetchEntreprises() {
        try {
            const response = await fetch('http://localhost:3000/entreprises');
            const entreprises = await response.json();
            return entreprises;
        } catch (error) {
            console.error("❌ Erreur lors de la récupération des entreprises :", error);
            return [];
        }
    }

    function getInitials(nom) {
        return nom
            .split(' ')
            .filter(w => w.length > 0)
            .slice(0, 2)
            .map(word => word[0].toUpperCase())
            .join('');
    }

    function filtrerParCategorie(categorie) {
        categoryTitle.textContent = categorie === "Toutes" ? "Toutes les organisations" : categorie.toUpperCase();
        currentCategory = categorie;

        let filteredData = entreprises;

        if (categorie !== "Toutes") {
            filteredData = entreprises.filter(e => e.categorie.toLowerCase() === categorie.toLowerCase());
        }

        afficherEntreprises(filteredData);
    }

    function afficherEntreprises(data) {
        resultsContainer.innerHTML = data.length
            ? data.map(entreprise => {
                const hasLogo = entreprise.logo && entreprise.logo.trim() !== "";
                const imagePath = `http://localhost:3000/logos/${entreprise.categorie}/${entreprise.logo}`;
                const initials = getInitials(entreprise.nom);

                return `
                    <div class="col-md-4 mb-4">
                        <div class="card shadow-sm p-3 text-center h-100">
                            ${
                                hasLogo
                                ? `<img src="${imagePath}" 
                                       onerror="this.src='https://via.placeholder.com/80';" 
                                       alt="${entreprise.nom}" 
                                       class="img-fluid mx-auto d-block rounded-circle" 
                                       style="width: 80px; height: 80px; object-fit: contain;">`
                                : `<div class="avatar-placeholder mx-auto mb-2">${initials}</div>`
                            }
                            <a href="${entreprise.lien_du_site}" 
                               target="_blank" 
                               class="fw-bold mt-2 custom-link d-block">
                                ${entreprise.nom}
                            </a>
                            <p class="text-muted">${entreprise.descriptif || ''}</p>
                        </div>
                    </div>
                `;
            }).join('')
            : '<p class="text-center text-danger">Aucune organisation trouvée.</p>';
    }

    async function rechercherEntreprises() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        let filteredResults = entreprises;

        if (searchTerm) {
            try {
                const response = await fetch(`http://localhost:3000/search?q=${encodeURIComponent(searchTerm)}`);
                filteredResults = await response.json();
            } catch (error) {
                console.error("❌ Erreur lors de la recherche :", error);
            }
        }

        if (currentCategory !== "Toutes") {
            filteredResults = filteredResults.filter(e => e.categorie.toLowerCase() === currentCategory.toLowerCase());
        }

        afficherEntreprises(filteredResults);
    }

    categorySelect.addEventListener('change', function () {
        filtrerParCategorie(this.value);
    });

    searchButton.addEventListener('click', rechercherEntreprises);
    searchInput.addEventListener('keyup', rechercherEntreprises);

    filtrerParCategorie(currentCategory);
});
