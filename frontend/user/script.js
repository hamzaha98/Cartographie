document.addEventListener('DOMContentLoaded', async function () {
    const categorySelect = document.getElementById('categorySelect');
    const resultsContainer = document.getElementById('resultsContainer');
    const categoryTitle = document.getElementById('categoryTitle');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    let entreprises = await fetchEntreprises();
    let currentCategory = "Toutes";
    let modeAffichage = 'grille';

    initMiniMap(entreprises);

    document.getElementById('btnGrille').addEventListener('click', () => changerVue('grille'));
    document.getElementById('btnListe').addEventListener('click', () => changerVue('liste'));
    document.getElementById('btnCarte').addEventListener('click', () => changerVue('carte'));

    function changerVue(nouvelleVue) {
        modeAffichage = nouvelleVue;
        document.querySelectorAll('.btn-outline-primary').forEach(btn => btn.classList.remove('active'));
        document.getElementById('btn' + nouvelleVue.charAt(0).toUpperCase() + nouvelleVue.slice(1)).classList.add('active');

        if (nouvelleVue === 'carte') {
            document.getElementById("resultsContainer").style.display = "none";
            document.getElementById("mapContainer").style.display = "block";
        } else {
            document.getElementById("resultsContainer").style.display = "flex";
            document.getElementById("mapContainer").style.display = "none";
        }

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
                                ? `<img src="${imagePath}" onerror="this.src='/logos/default.png';"
                                    alt="${entreprise.nom}" class="img-fluid mx-auto d-block rounded-circle"
                                    style="width: 80px; height: 80px; object-fit: contain;">`
                                : `<div class="avatar-placeholder mx-auto mb-2">${initials}</div>`
                            }
                            <a href="${entreprise.lien_du_site}" target="_blank" class="fw-bold mt-2 custom-link d-block">
                                ${entreprise.nom}
                            </a>
                            <p class="text-muted">${entreprise.descriptif || ''}</p>
                        </div>
                    </div>`;
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

function initMiniMap(data) {
    const miniMap = L.map("miniMap", {
        zoomControl: true,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: false,
        tap: false,
    }).setView([46.8, -71.2], 6);

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
            }).addTo(miniMap).bindTooltip(e.nom);
        }
    });

    const boutonCarte = document.getElementById('btnCarte');
    if (boutonCarte) {
        document.getElementById('miniMap')?.addEventListener('click', () => boutonCarte.click());
        document.getElementById('miniMap').style.cursor = 'pointer';
    }
}

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
