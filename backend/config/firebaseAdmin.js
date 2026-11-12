const { initializeApp, cert, getApps } = require("firebase-admin/app");

let serviceAccount;

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else if (process.env.RENDER) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT missing on Render");
    } else {
        serviceAccount = require("./firebase-service-account.json");
    }

    const app = getApps().length ?
        getApps()[0] :
        initializeApp({
            credential: cert(serviceAccount)
        });

    module.exports = app;

} catch (error) {
    console.error("Firebase Admin Error:", error.message);
    throw error;
}