let map;
let markers;
let mapInitialized = false;
document.addEventListener('DOMContentLoaded', async function () {
    const categorySelect = document.getElementById('categorySelect'); // Menu déroulant
    const resultsContainer = document.getElementById('resultsContainer');
    const categoryTitle = document.getElementById('categoryTitle');
    const searchInput = document.getElementById('searchInput');
    const publicSelect = document.getElementById('publicSelect');
    const formatSelect = document.getElementById('formatSelect');
    const acteurSelect = document.getElementById('acteurSelect');
    const searchButton = document.getElementById('searchButton');

    let entreprises = [];
    entreprises = await fetchEntreprises(); // Chargement initial
    console.log (entreprises);
    remplirSelect(publicSelect, extraireUniques(entreprises, 'public_cible'));
    remplirSelect(formatSelect, extraireUniques(entreprises, 'format'));
    remplirSelect(acteurSelect, extraireUniques(entreprises, 'type_acteur'));
    

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
                  .bindTooltip(e.nom);
            }
        });

        const boutonCarte = document.getElementById('btnCarte');
        if (boutonCarte) {
            document.getElementById('miniMap')?.addEventListener('click', () => {
                boutonCarte.click();
            });
            document.getElementById('miniMap').style.cursor = 'pointer';
        }
    }

    document.getElementById('btnGrille').addEventListener('click', () => changerVue('grille'));
    document.getElementById('btnListe').addEventListener('click', () => changerVue('liste'));
    document.getElementById('btnCarte').addEventListener('click', () => changerVue('carte'));

    function changerVue(nouvelleVue) {
        modeAffichage = nouvelleVue;
        document.querySelectorAll('.btn-outline-primary').forEach(btn => btn.classList.remove('active'));
        document.getElementById('btn' + nouvelleVue.charAt(0).toUpperCase() + nouvelleVue.slice(1)).classList.add('active');
        document.getElementById("resultsContainer").style.display = nouvelleVue === 'carte' ? "none" : "flex";
        document.getElementById("mapContainer").style.display = nouvelleVue === 'carte' ? "block" : "none";
        document.getElementById("mapWrapper").style.display = nouvelleVue === 'carte' ? "block" : "none";
    // Mise à jour des données en fonction de la catégorie sélectionnée
        filtrerParCategorie(currentCategory);
    }

    async function fetchEntreprises() {
        try {
            const response = await fetch('http://localhost:3000/entreprises');
            
            return await response.json();
        } catch (error) {
            console.error("❌ Erreur lors de la récupération des entreprises :", error);
            return [];
        }
    }

    function filtrerParCategorie(categorie) {
        categoryTitle.textContent = categorie === "Toutes" ? "Toutes les organisations" : categorie.toUpperCase();
        currentCategory = categorie;
        let filteredData = entreprises;

        if (categorie !== "Toutes") {
            filteredData = filteredData.filter(e => {
                if (!e.categories) return false;
                const cats = e.categories.split(',').map(c => c.trim().toLowerCase());
                return cats.includes(categorie.toLowerCase());
            });
        }

        const publicVal = publicSelect?.value;
        const formatVal = formatSelect?.value;
        const acteurVal = acteurSelect?.value;

        if (publicVal && publicVal !== "Tous") filteredData = filteredData.filter(e => e.public_cible === publicVal);
        if (formatVal && formatVal !== "Tous") filteredData = filteredData.filter(e => e.format === formatVal);
        if (acteurVal && acteurVal !== "Tous") filteredData = filteredData.filter(e => e.type_acteur === acteurVal);

        afficherEntreprises(filteredData);
        if (modeAffichage === 'carte') updateCarte(filteredData);
    }

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
            // Mode "grille"
            resultsContainer.innerHTML = data.length
            ? data.map(e => {
                  const logoFile = e.logo || 'default.png';
                  const imagePath = `http://localhost:3000/logos/${encodeURIComponent(logoFile)}`;
                  return `
                        <div class="col-md-4 mb-4">
                            <div class="card shadow-sm p-3 text-center h-100 d-flex flex-column">
                                <div class="flex-grow-1">
                                    <img src="${imagePath}" 
                                         onerror="this.src='/logos/default.png';"
                                         alt="${e.nom}" 
                                         class="img-fluid mx-auto d-block rounded-circle" 
                                         style="width: 80px; height: 80px; object-fit: contain;">
                                    <div class="fw-bold mt-2">${e.nom}</div>
                                    <p class="text-muted">${e.descriptif || ''}</p>
                                </div>
                                <div class="mt-auto">
                                    <a href="${e.lien_du_site}" target="_blank" class="d-block text-primary fw-bold mt-2">
                                        <i class="bi bi-link-45deg"></i> Visiter
                                    </a>
                                </div>
                            </div>
                        </div>
                    `;
              }).join('')
            : '<p class="text-center text-danger">Aucune organisation trouvée.</p>';
        }
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
            filteredResults = filteredResults.filter(e => e.categories.toLowerCase().includes(currentCategory.toLowerCase()));
        }
// Si le mode d'affichage est 'carte', mettre à jour la carte avec les résultats filtrés
        afficherEntreprises(filteredResults);
        if (modeAffichage === 'carte') {
            updateCarte(filteredResults);
        }
    }

    categorySelect.addEventListener('change', function () {
        filtrerParCategorie(this.value);
    });

    searchButton.addEventListener('click', rechercherEntreprises);
    searchInput.addEventListener('keyup', rechercherEntreprises);
    publicSelect.addEventListener('change', () => filtrerParCategorie(currentCategory));
    formatSelect.addEventListener('change', () => filtrerParCategorie(currentCategory));
    acteurSelect.addEventListener('change', () => filtrerParCategorie(currentCategory));

    filtrerParCategorie(currentCategory);
});

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
                ${e.categories}<br>
                <a href="${e.lien_du_site}" target="_blank">Visiter</a>
            `;
            marker.bindPopup(popup);
            markers.addLayer(marker);
        });
    }, 100);
}


function extraireUniques(data, champ) {
    return [...new Set(data.map(e => e[champ]).filter(Boolean))].sort();
}

function remplirSelect(selectElement, valeurs) {
    valeurs.forEach(val => {
        const option = document.createElement('option');
        option.value = val;
        option.textContent = val;
        selectElement.appendChild(option);
    });
}