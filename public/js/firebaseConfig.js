// firebaseConfig.js sans export

// Configuration de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBXTqyVeV5iVlTMaTgVzJ_awHDFfqpWEJw",
  authDomain: "gestioncommerciaux-9f220.firebaseapp.com",
  projectId: "gestioncommerciaux-9f220",
  storageBucket: "gestioncommerciaux-9f220.appspot.com",
  appId: "1:37204441992:web:be1a33b81a3e761066d83d",
  measurementId: "G-KKD8N3CMPB"
};

// Initialisation de Firebase
firebase.initializeApp(firebaseConfig);

// Initialisation des services Firebase
const auth = firebase.auth();
const firestore = firebase.firestore();

// Authentification de l'utilisateur (exemple de fonction de connexion)
function connexionUtilisateur(email, password) {
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("Utilisateur connecté :", userCredential.user);
    })
    .catch((error) => {
      console.error("Erreur lors de la connexion :", error.message);
    });
}

// Déconnexion de l'utilisateur
function deconnexionUtilisateur() {
  auth.signOut()
    .then(() => {
      console.log("Utilisateur déconnecté.");
    })
    .catch((error) => {
      console.error("Erreur lors de la déconnexion :", error.message);
    });
}

// Exemple de sauvegarde de données dans Firestore
function sauvegarderDonneesUtilisateur(userId, data) {
  firestore.collection("users").doc(userId).set(data, { merge: true })
    .then(() => {
      console.log("Données utilisateur sauvegardées avec succès.");
    })
    .catch((error) => {
      console.error("Erreur lors de la sauvegarde des données :", error);
    });
}

// Exemple de récupération de données depuis Firestore
function recupererDonneesUtilisateur(userId) {
  firestore.collection("users").doc(userId).get()
    .then((doc) => {
      if (doc.exists) {
        console.log("Données utilisateur récupérées :", doc.data());
      } else {
        console.log("Aucun document trouvé pour cet utilisateur.");
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des données :", error);
    });
}
