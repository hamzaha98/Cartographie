
// 🛡️ Rediriger vers login si non connecté
if (!localStorage.getItem("admin_token")) {
    window.location.href = "/frontend/admin/login.html";
}

document.addEventListener("DOMContentLoaded", function () {
    const entrepriseForm = document.getElementById("entrepriseForm");
    const messageBox = document.getElementById("message");
    const entreprisesTable = document.getElementById("entreprisesTable");
    const submitBtn = document.getElementById("submitBtn");
    let editingId = null;

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
                                <img src="${logoPath}" alt="Logo" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.src='/logos/default.png';">
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
            document.getElementById("categorie").value = entreprise.categorie;
            document.getElementById("mots_cles").value = entreprise.mots_cles;
            document.getElementById("lieu").value = entreprise.lieu;

            editingId = id;
            submitBtn.textContent = "Modifier l'entreprise";
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

    loadEntreprises();
});
