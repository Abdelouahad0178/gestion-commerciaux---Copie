document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.getElementById("tableRecapVentes").getElementsByTagName("tbody")[0];
  const periodeSelector = document.getElementById("periodeSelector");

  // Fonction pour récupérer et afficher les données des ventes validées
  function afficherRecapitulatifVentes(periodeFiltre = "") {
    tableBody.innerHTML = ""; // Réinitialiser le tableau

    firebase.firestore().collection("SalesData").get()
      .then((querySnapshot) => {
        const periodes = new Set(); // Ensemble pour stocker les périodes uniques

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          // Récupérer ou définir la période
          const periode = data.periode || "Période inconnue";
          
          // Vérifier si la période correspond au filtre sélectionné
          if (periodeFiltre && periode !== periodeFiltre) {
            return;
          }

          // Ajouter la période au set pour remplir le sélecteur
          periodes.add(periode);

          // Créer une nouvelle ligne de tableau pour chaque enregistrement
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${data.commercialName || "Commercial inconnu"}</td>
            <td>${data.totalVentes ? data.totalVentes.toFixed(2) : "0"} MAD</td>
            <td>${data.pourcentage || 0}%</td>
            <td>${data.montantCalculé ? data.montantCalculé.toFixed(2) : "0"} MAD</td>
            <td>${periode}</td>
            <td>
              <button onclick="modifierOperation('${doc.id}')">Modifier</button>
              <button onclick="supprimerOperation('${doc.id}')">Supprimer</button>
            </td>
          `;
          tableBody.appendChild(row);
        });

        // Rafraîchir les options du sélecteur de période
        periodeSelector.innerHTML = `<option value="">Toutes les périodes</option>`; // Vider les options existantes
        periodes.forEach((periode) => {
          const option = document.createElement("option");
          option.value = periode;
          option.textContent = periode;
          periodeSelector.appendChild(option);
        });

        // Assurer que la période actuellement filtrée reste sélectionnée
        if (periodeFiltre) {
          periodeSelector.value = periodeFiltre;
        }
      })
      .catch((error) => console.error("Erreur lors de la récupération des données :", error));
  }

  // Appel initial pour afficher toutes les ventes
  afficherRecapitulatifVentes();

  // Gestion du changement de période dans le sélecteur
  periodeSelector.addEventListener("change", (event) => {
    const periodeChoisie = event.target.value;
    afficherRecapitulatifVentes(periodeChoisie);
  });

  // Fonction pour envoyer le tableau par WhatsApp
  document.getElementById("sendWhatsappButton").addEventListener("click", function () {
    let message = "Récapitulatif des Ventes par Commercial :\n\n";
    tableBody.querySelectorAll("tr").forEach((row) => {
      const cells = row.querySelectorAll("td");
      message += `Commercial: ${cells[0].textContent}\n`;
      message += `Total des Ventes: ${cells[1].textContent}\n`;
      message += `Pourcentage: ${cells[2].textContent}\n`;
      message += `Montant Validé: ${cells[3].textContent}\n`;
      message += `Période Validée: ${cells[4].textContent}\n\n`;
    });

    // Lien pour partager sur WhatsApp
    const whatsappURL = `https://wa.me/212661112540?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank");
  });

  window.modifierOperation = function (operationId) {
    firebase.firestore().collection("SalesData").doc(operationId).get()
      .then(doc => {
        if (doc.exists) {
          const data = doc.data();
  
          // Créez un formulaire dynamique pour afficher les champs de l'opération
          const formContainer = document.createElement("div");
          formContainer.innerHTML = `
            <h3>Modifier l'Opération</h3>
            <form id="modificationForm">
              <label for="commercialName">Nom du Commercial:</label>
              <input type="text" id="commercialName" value="${data.commercialName || ''}" required><br>
  
              <label for="totalVentes">Total des Ventes (MAD):</label>
              <input type="number" id="totalVentes" value="${data.totalVentes || 0}" step="0.01" required><br>
  
              <label for="pourcentage">Pourcentage:</label>
              <input type="number" id="pourcentage" value="${data.pourcentage || 0}" step="0.1" required><br>
  
              <label for="montantCalculé">Montant Validé (MAD):</label>
              <input type="number" id="montantCalculé" value="${data.montantCalculé || 0}" step="0.01" required><br>
  
              <label for="periode">Période:</label>
              <input type="text" id="periode" value="${data.periode || ''}" required><br>
  
              <button type="button" onclick="enregistrerModifications('${operationId}')">Enregistrer</button>
              <button type="button" onclick="fermerFormulaire()">Annuler</button>
            </form>
          `;
  
          // Ajoutez le formulaire à la page
          document.body.appendChild(formContainer);
  
          // Appliquez du style au formulaire
          formContainer.style.position = "fixed";
          formContainer.style.top = "50%";
          formContainer.style.left = "50%";
          formContainer.style.transform = "translate(-50%, -50%)";
          formContainer.style.backgroundColor = "#fff";
          formContainer.style.padding = "20px";
          formContainer.style.border = "1px solid #ccc";
          formContainer.style.zIndex = "1000";
        }
      })
      .catch(error => console.error("Erreur lors de la récupération de l'opération :", error));
  };
  
  // Fonction pour enregistrer les modifications
  window.enregistrerModifications = function (operationId) {
    const updatedData = {
      commercialName: document.getElementById("commercialName").value,
      totalVentes: parseFloat(document.getElementById("totalVentes").value),
      pourcentage: parseFloat(document.getElementById("pourcentage").value),
      montantCalculé: parseFloat(document.getElementById("montantCalculé").value),
      periode: document.getElementById("periode").value
    };
  
    // Mettre à jour l'enregistrement dans Firestore
    firebase.firestore().collection("SalesData").doc(operationId).update(updatedData)
      .then(() => {
        console.log("Opération mise à jour avec succès");
        fermerFormulaire(); // Fermer le formulaire de modification
        afficherRecapitulatifVentes(); // Rafraîchir le tableau des opérations
      })
      .catch(error => console.error("Erreur lors de la mise à jour de l'opération :", error));
  };
  
  // Fonction pour fermer le formulaire de modification
  window.fermerFormulaire = function () {
    const formContainer = document.getElementById("modificationForm").parentNode;
    if (formContainer) {
      document.body.removeChild(formContainer);
    }
  };
  

  // Fonction pour supprimer une opération
  window.supprimerOperation = function (operationId) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette opération ?")) {
      firebase.firestore().collection("SalesData").doc(operationId).delete()
        .then(() => {
          console.log("Opération supprimée avec succès");
          afficherRecapitulatifVentes(); // Rafraîchir le tableau
        })
        .catch(error => console.error("Erreur lors de la suppression de l'opération :", error));
    }
  };
});
