document.addEventListener("DOMContentLoaded", function () {
    const entrepriseForm = document.getElementById("entrepriseForm");
    const messageBox = document.getElementById("message");
    const entreprisesTable = document.getElementById("entreprisesTable");
    const submitBtn = document.getElementById("submitBtn");
    let editingId = null;

    async function loadEntreprises() {
        try {
            const response = await fetch("http://localhost:3000/entreprises");
            const entreprises = await response.json();

            entreprisesTable.innerHTML = entreprises.map(entreprise => {
                const logoPath = `http://localhost:3000/logos/${entreprise.categorie}/${entreprise.logo}`;

                return `
                    <tr>
                        <td>${entreprise.nom}</td>
                        <td>
                            <div style="width: 60px; height: 60px; border: 1px solid #ccc; background-color: #fff; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                                <img src="${logoPath}" alt="Logo" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.src='https://via.placeholder.com/60';">
                            </div>
                        </td>
                        <td>${entreprise.categorie}</td>
                        <td>
                            <button class="btn btn-warning btn-sm" onclick="editEntreprise(${entreprise.id})">Modifier</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteEntreprise(${entreprise.id})">Supprimer</button>
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

        const entreprise = {
            nom: document.getElementById("nom").value.trim(),
            logo: document.getElementById("logo").value.trim(),
            descriptif: document.getElementById("descriptif").value.trim(),
            lien_du_site: document.getElementById("lien_du_site").value.trim(),
            categorie: document.getElementById("categorie").value,
            mots_cles: document.getElementById("mots_cles").value.trim(),
            lieu: document.getElementById("lieu").value.trim()
        };

        let response;

        try {
            if (editingId) {
                response = await fetch(`http://localhost:3000/entreprises/${editingId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(entreprise)
                });
            } else {
                response = await fetch("http://localhost:3000/entreprises", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(entreprise)
                });
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                afficherMessage("alert-danger", errorData.error || "Une erreur est survenue.");
                return;
            }

            let data = {};
            const contentType = response.headers.get("Content-Type") || "";
            if (contentType.includes("application/json")) {
                data = await response.json();
            }

            if (data.success) {
                afficherMessage("alert-success", data.message || "Entreprise ajoutée !");
                entrepriseForm.reset();
                editingId = null;
                submitBtn.textContent = "Ajouter l'entreprise";
                loadEntreprises();
            } else {
                afficherMessage("alert-danger", data.error || "Erreur inconnue.");
            }

        } catch (error) {
            console.error("❌ Erreur lors de la requête :", error);
            if (!response || !response.ok) {
                afficherMessage("alert-danger", "Erreur de connexion au serveur.");
            }
        }
    });

    window.editEntreprise = async function (id) {
        console.log(`🔄 Chargement des données pour l'édition de l'entreprise ID: ${id}`);
        try {
            const response = await fetch(`http://localhost:3000/entreprises/${id}`);
            const entreprise = await response.json();

            if (!response.ok) {
                console.error("⚠️ Erreur de récupération :", entreprise.error);
                return;
            }

            document.getElementById("nom").value = entreprise.nom;
            document.getElementById("logo").value = entreprise.logo;
            document.getElementById("descriptif").value = entreprise.descriptif;
            document.getElementById("lien_du_site").value = entreprise.lien_du_site;
            document.getElementById("categorie").value = entreprise.categorie;
            document.getElementById("mots_cles").value = entreprise.mots_cles;
            document.getElementById("lieu").value = entreprise.lieu;

            editingId = id;
            submitBtn.textContent = "Modifier l'entreprise";
            console.log(`✔️ ID stocké pour modification: ${editingId}`);

        } catch (error) {
            console.error("❌ Erreur lors du chargement des données :", error);
        }
    };

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

    function afficherMessage(type, texte) {
        messageBox.className = `alert ${type}`;
        messageBox.textContent = texte;
        messageBox.classList.remove("d-none");
        setTimeout(() => {
            messageBox.classList.add("d-none");
        }, 5000);
    }

    loadEntreprises();
});
