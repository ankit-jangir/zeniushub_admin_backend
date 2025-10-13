const admin = require("firebase-admin");

function initializeFirebase() {
    const serviceAccount = require("../utils/google-services.json");

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    console.log("Firebase initialized successfully!");
}

module.exports = initializeFirebase;