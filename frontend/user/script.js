document.addEventListener('DOMContentLoaded', async function () {
    const categorySelect = document.getElementById('categorySelect'); // Menu déroulant
    const resultsContainer = document.getElementById('resultsContainer');
    const categoryTitle = document.getElementById('categoryTitle');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    let entreprises = [];
    entreprises = await fetchEntreprises(); // Chargement initial
    
    initMiniMap(entreprises); 
    let currentCategory = "Toutes";
    let modeAffichage = 'grille'; // 'grille', 'liste', 'carte'

    function initMiniMap(data) {
        const miniMap = L.map("miniMap", {
            zoomControl: true,
            dragging: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: false,
            tap: false,
        }).setView([46.8, -71.2], 6); // Vue centrée sur le Québec
    
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '',
        }).addTo(miniMap);
    
        data.forEach(e => {
            const lat = parseFloat(e.latitude);
            const lng = parseFloat(e.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
                L.circleMarker([lat, lng], {
                    radius: 4,
                    color: "#007bff",
                    fillOpacity: 0.8,
                }).addTo(miniMap)
                  .bindTooltip(e.nom); // Infobulle avec le nom
            }
        });
    
        // 🖱 Permet de cliquer sur la mini-carte pour afficher la carte principale
        const boutonCarte = document.getElementById('btnCarte');
        if (boutonCarte) {
            document.getElementById('miniMap')?.addEventListener('click', () => {
                boutonCarte.click();
            });
            document.getElementById('miniMap').style.cursor = 'pointer'; // Change le curseur
        }
    }
    

    
// 📌 Ajoute gestion des boutons de vue
document.getElementById('btnGrille').addEventListener('click', () => {
    changerVue('grille');
});
document.getElementById('btnListe').addEventListener('click', () => {
    changerVue('liste');
});
document.getElementById('btnCarte').addEventListener('click', () => {
    changerVue('carte');
});

function changerVue(nouvelleVue) {
    modeAffichage = nouvelleVue;

    // Désactive tous les boutons
    document.querySelectorAll('.btn-outline-primary').forEach(btn => btn.classList.remove('active'));

    // Active le bouton sélectionné
    if (nouvelleVue === 'grille') document.getElementById('btnGrille').classList.add('active');
    if (nouvelleVue === 'liste') document.getElementById('btnListe').classList.add('active');
    if (nouvelleVue === 'carte') document.getElementById('btnCarte').classList.add('active');

    // Affichage des résultats
    if (nouvelleVue === 'carte') {
        document.getElementById("resultsContainer").style.display = "none";
        document.getElementById("mapContainer").style.display = "block";
    } else {
        document.getElementById("resultsContainer").style.display = "flex";
        document.getElementById("mapContainer").style.display = "none";
    }

    // Recharger les données
    filtrerParCategorie(currentCategory);
}




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

    // 📌 Fonction pour filtrer les entreprises selon la catégorie
    function filtrerParCategorie(categorie) {
        categoryTitle.textContent = categorie === "Toutes" ? "Toutes les organisations" : categorie.toUpperCase();
        currentCategory = categorie;

        let filteredData = entreprises;

        if (categorie !== "Toutes") {
            filteredData = entreprises.filter(e => e.categorie.toLowerCase() === categorie.toLowerCase());
        }

        afficherEntreprises(filteredData);
        if (modeAffichage === 'carte') {
            updateCarte(filteredData);
        }
        
    }

    // ✅ Fonction mise à jour pour afficher les entreprises avec les bons logos
    function afficherEntreprises(data) {
        if (modeAffichage === 'liste') {
            resultsContainer.innerHTML = data.length
                ? `<ul class="list-group">` + data.map(e => `
                    <li class="list-group-item">
                        <div class="fw-bold">${e.nom}</div>
                        <div class="text-muted">${e.descriptif || ''}</div>
                        <a href="${e.lien_du_site}" target="_blank" class="text-primary">Visiter</a>
                    </li>`).join('') + `</ul>`
                : '<p class="text-center text-danger">Aucune organisation trouvée.</p>';
        } else {
            // Mode grille (par défaut)
            resultsContainer.innerHTML = data.length
                ? data.map(entreprise => {
                    const imagePath = `http://localhost:3000/logos/${entreprise.categorie}/${entreprise.logo}`;
                    return `
                        <div class="col-md-4 mb-4">
                            <div class="card shadow-sm p-3 text-center h-100">
                                <img src="${imagePath}" 
                                     onerror="this.src='/logos/default.png';"
                                     alt="${entreprise.nom}" 
                                     class="img-fluid mx-auto d-block rounded-circle" 
                                     style="width: 80px; height: 80px; object-fit: contain;">
                                <div class="fw-bold mt-2">${entreprise.nom}</div>
                                <p class="text-muted">${entreprise.descriptif || ''}</p>
                                <a href="${entreprise.lien_du_site}" target="_blank" class="d-block text-primary fw-bold mt-2">
                                    <i class="bi bi-link-45deg"></i> Visiter
                                </a>
                            </div>
                        </div>
                    `;
                }).join('')
                : '<p class="text-center text-danger">Aucune organisation trouvée.</p>';
        }
    }

    
    

    // 📌 Fonction pour la recherche avec filtre catégorie
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

        // Filtrage par catégorie actif
        if (currentCategory !== "Toutes") {
            filteredResults = filteredResults.filter(e => e.categorie.toLowerCase() === currentCategory.toLowerCase());
        }

        afficherEntreprises(filteredResults);
    }

    // 📌 Événements
    categorySelect.addEventListener('change', function () {
        filtrerParCategorie(this.value);
    });

    searchButton.addEventListener('click', rechercherEntreprises);
    searchInput.addEventListener('keyup', rechercherEntreprises);

    // 📌 Chargement initial
    filtrerParCategorie(currentCategory);
});

let map;
let markers;
let mapInitialized = false;

function updateCarte(data) {
    setTimeout(() => {
        if (!mapInitialized) {
            const mapContainer = document.getElementById("mapContainer");
            map = L.map(mapContainer).setView([46.8, -71.2], 6);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            markers = L.markerClusterGroup();
            map.addLayer(markers);
            mapInitialized = true;
        }

        markers.clearLayers();

        data.forEach(e => {
            const lat = parseFloat(e.latitude);
            const lng = parseFloat(e.longitude);
            if (isNaN(lat) || isNaN(lng)) return;

            const marker = L.marker([lat, lng]);
            const popup = `
                <strong>${e.nom}</strong><br>
                ${e.categorie}<br>
                <a href="${e.lien_du_site}" target="_blank">Visiter</a>
            `;
            marker.bindPopup(popup);
            markers.addLayer(marker);
        });
    }, 100); 
}

