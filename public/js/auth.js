// auth.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("Le DOM est chargé.");

  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  // Fonction pour afficher/masquer le mot de passe
  function togglePasswordVisibility(inputId) {
    const passwordField = document.getElementById(inputId);
    passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
  }

  // Gestion du formulaire de connexion
  if (loginForm) {
    console.log("Formulaire de connexion trouvé.");
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          const user = userCredential.user;

          // Récupérer le rôle de l'utilisateur pour redirection
          firebase.firestore().collection('Users').doc(user.uid).get()
            .then((doc) => {
              if (doc.exists) {
                const role = doc.data().role;

                // Redirection selon le rôle
                if (role === "responsable") {
                  window.location.href = "responsable_dashboard.html";
                } else if (role === "commercial") {
                  window.location.href = "commercial_dashboard.html";
                } else {
                  console.warn("Rôle non reconnu, redirection vers la page de connexion.");
                  window.location.href = "login.html";
                }
              } else {
                document.getElementById('login-error-message').textContent = "Erreur : Informations d'utilisateur introuvables.";
              }
            })
            .catch((error) => {
              console.error("Erreur lors de la récupération des informations :", error);
              document.getElementById('login-error-message').textContent = "Erreur lors de la récupération des informations de l'utilisateur.";
            });
        })
        .catch((error) => {
          console.error("Erreur de connexion :", error.message);
          document.getElementById('login-error-message').textContent = "Erreur de connexion : " + error.message;
        });
    });
  }

  // Gestion du formulaire d'inscription
  if (signupForm) {
    console.log("Formulaire d'inscription trouvé.");
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('emails').value;
      const password = document.getElementById('passwords').value;
      const role = document.getElementById('role').value;
      const societeId = document.getElementById('societeId').value;

      if (role === "responsable" && password !== "hajmjid") {
        alert("Mot de passe incorrect pour le rôle de responsable.");
        return;
      }

      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          const user = userCredential.user;

          return firebase.firestore().collection('Users').doc(user.uid).set({
            email: user.email,
            role: role,
            societeId: societeId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        })
        .then(() => {
          console.log("Utilisateur ajouté dans Firestore avec succès.");
          document.getElementById('signup-error-message').textContent = "Inscription réussie.";
          if (role === "responsable") {
            window.location.href = "responsable_dashboard.html";
          } else if (role === "commercial") {
            window.location.href = "commercial_dashboard.html";
          }
        })
        .catch((error) => {
          if (error.code === 'auth/email-already-in-use') {
            document.getElementById('signup-error-message').textContent = "Erreur : Cet e-mail est déjà utilisé.";
          } else {
            console.error("Erreur d'inscription :", error.message);
            document.getElementById('signup-error-message').textContent = "Erreur d'inscription : " + error.message;
          }
        });
    });
  }
});

// Fonction pour retourner à la page de connexion
function exitToHome() {
  window.location.href = "login.html";
}

// Fonction pour réinitialiser le mot de passe
function resetPassword() {
  const email = document.getElementById('email').value;

  if (!email) {
    document.getElementById('reset-password-message').textContent = "Veuillez saisir votre adresse e-mail.";
    return;
  }

  firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
      document.getElementById('reset-password-message').textContent = "Un email de réinitialisation a été envoyé.";
    })
    .catch((error) => {
      console.error("Erreur lors de la réinitialisation du mot de passe :", error);
      document.getElementById('reset-password-message').textContent = "Erreur : " + error.message;
    });
}
