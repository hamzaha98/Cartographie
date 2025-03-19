document.addEventListener("DOMContentLoaded", function () {
    const entrepriseForm = document.getElementById("entrepriseForm");
    const messageBox = document.getElementById("message");
    const entreprisesTable = document.getElementById("entreprisesTable");
    const submitBtn = document.getElementById("submitBtn");
    let editingId = null;  // ID de l'entreprise en cours de modification

    // 🔄 Charger les entreprises existantes
    async function loadEntreprises() {
        try {
            const response = await fetch("http://localhost:3000/entreprises");
            const entreprises = await response.json();

            entreprisesTable.innerHTML = entreprises.map(entreprise => `
                <tr>
                    <td>${entreprise.nom}</td>
                    <td><img src="${entreprise.logo}" width="50" height="50" alt="Logo"></td>
                    <td>${entreprise.categorie}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editEntreprise(${entreprise.id})">Modifier</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteEntreprise(${entreprise.id})">Supprimer</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error("❌ Erreur lors du chargement des entreprises:", error);
        }
    }

    // 🔄 Ajouter ou Modifier une entreprise
    entrepriseForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const entreprise = {
            nom: document.getElementById("nom").value.trim(),
            logo: document.getElementById("logo").value.trim(),
            descriptif: document.getElementById("descriptif").value.trim(),
            lien_du_site: document.getElementById("lien_du_site").value.trim(),
            categorie: document.getElementById("categorie").value,
            mots_cles: document.getElementById("mots_cles").value.trim(),
            lieu: document.getElementById("lieu").value.trim()
        };

        try {
            let response;
            if (editingId) {
                // Modifier une entreprise existante
                console.log(`📝 Modification en cours pour l'ID: ${editingId}`);
                response = await fetch(`http://localhost:3000/entreprises/${editingId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(entreprise)
                });
            } else {
                // Ajouter une nouvelle entreprise
                console.log("➕ Ajout d'une nouvelle entreprise...");
                response = await fetch("http://localhost:3000/entreprises", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(entreprise)
                });
            }

            const data = await response.json();

            if (response.ok) {
                messageBox.className = "alert alert-success";
                messageBox.textContent = editingId ? "Entreprise modifiée avec succès!" : "Entreprise ajoutée avec succès!";
                messageBox.classList.remove("d-none");

                entrepriseForm.reset();
                editingId = null;  // Réinitialiser après modification
                submitBtn.textContent = "Ajouter l'entreprise"; // Remettre le bouton à son état initial

                loadEntreprises(); // Actualiser la liste
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

    // 🔄 Charger les données dans le formulaire pour modification
    window.editEntreprise = async function (id) {
        console.log(`🔄 Chargement des données pour l'édition de l'entreprise ID: ${id}`);
        try {
            const response = await fetch(`http://localhost:3000/entreprises/${id}`);
            const entreprise = await response.json();

            if (!response.ok) {
                console.error("⚠️ Erreur de récupération:", entreprise.error);
                return;
            }

            document.getElementById("nom").value = entreprise.nom;
            document.getElementById("logo").value = entreprise.logo;
            document.getElementById("descriptif").value = entreprise.descriptif;
            document.getElementById("lien_du_site").value = entreprise.lien_du_site;
            document.getElementById("categorie").value = entreprise.categorie;
            document.getElementById("mots_cles").value = entreprise.mots_cles;
            document.getElementById("lieu").value = entreprise.lieu;

            // 📝 Mettre à jour l'ID d'édition et le texte du bouton
            editingId = id;
            submitBtn.textContent = "Modifier l'entreprise";
            console.log(`✔️ ID stocké pour modification: ${editingId}`);

        } catch (error) {
            console.error("❌ Erreur lors du chargement des données :", error);
        }
    };

    // 🔄 Supprimer une entreprise
    window.deleteEntreprise = async function (id) {
        if (confirm("⚠️ Voulez-vous vraiment supprimer cette entreprise ?")) {
            try {
                console.log(`🗑️ Suppression de l'entreprise ID: ${id}`);
                const response = await fetch(`http://localhost:3000/entreprises/${id}`, { method: "DELETE" });

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

    // Charger les entreprises au démarrage
    loadEntreprises();
});
