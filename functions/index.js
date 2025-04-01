const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");

var serviceAccount = require("./vizsga-55ea5-firebase-adminsdk-fbsvc-5992076512.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://vizsga-55ea5-default-rtdb.europe-west1.firebasedatabase.app"
});

const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json());

const verifyToken = (req, res, next) => {
  const idToken = req.headers.authorization;

  admin.auth().verifyIdToken(idToken).then((decodedToken) => {
    req.user = decodedToken;
    next();
  }).catch((error) => {
    console.log("Hiba a token ellenőrzésénél!", error);
    res.status(401).json({ message: "Hozzáférés megtagadva: csak bejelentkezett felhasználóknak!" });
  });
};

const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.admin) {
    next();
  } else {
    res.status(403).json({ message: "Hozzáférés megtagadva: csak adminoknak!" });
  }
};

// ✅ Felhasználó törlése az Auth-ból ÉS az adatbázisból
app.post("/deleteUser", verifyToken, verifyAdmin, async (req, res) => {
    const { uid } = req.body;
  
    if (!uid) return res.status(400).json({ message: "Hiányzó UID!" });
  
    try {
      await admin.auth().deleteUser(uid);
      await admin.database().ref("users/" + uid).remove(); // 🔥 Törlés az adatbázisból is
      res.status(200).json({ message: "Felhasználó sikeresen törölve!" });
    } catch (err) {
      console.error("❌ Hiba a törlés során:", err);
      res.status(500).json({ message: "Hiba történt a törlés során!" });
    }
  });
app.get("/users", verifyToken, async (req, res) => {
  try {
    const userRecords = await admin.auth().listUsers();
    const userWithClaims = await Promise.all(userRecords.users.map(async (user) => {
      const userDetails = await admin.auth().getUser(user.uid);
      return {
        uid: userDetails.uid,
        email: userDetails.email,
        displayName: userDetails.displayName,
        phoneNumber: userDetails.phoneNumber,
        photoURL: userDetails.photoURL,
        emailVerified: userDetails.emailVerified,
        disabled: userDetails.disabled,
        claims: userDetails.customClaims || {}
      };
    }));
    res.json(userWithClaims);
  } catch (error) {
    console.error("Hiba a felhasználók lekérésekor:", error);
    res.status(500).json({ message: "Hiba a felhasználók lekérésekor!", error });
  }
});

app.post("/setCustomClaims", verifyToken, verifyAdmin, (req, res) => {
  const { uid, claims } = req.body;

  if (!uid || typeof claims !== "object") {
    return res.status(400).json({ message: "Hiányzó UID vagy claims!" });
  }

  admin.auth().setCustomUserClaims(uid, claims)
    .then(() => res.json({ message: "Custom claims beállítva." }))
    .catch((error) => {
      console.error("Hiba a claims beállításánál:", error);
      res.status(500).json({ message: "Hiba a claims beállításánál!", error });
    });
});

app.get("/getClaims/:uid?", verifyToken, (req, res) => {
  let { uid } = req.params;
  if (!uid || !req.user.admin) uid = req.user.uid;

  admin.auth().getUser(uid).then((user) => {
    res.json(user.customClaims || {});
  }).catch((error) => {
    console.error("Hiba a claims lekérdezésénél:", error);
    res.status(500).json({ message: "Hiba a claims lekérdezésénél!", error });
  });
});

app.patch("/updateUser", verifyToken, async (req, res) => {
  try {
    let { uid, email, password, displayName, phoneNumber, photoURL, emailVerified, disabled, claims } = req.body;
    if (!req.user.admin) {
      uid = req.user.uid;
      emailVerified = undefined;
      disabled = undefined;
      claims = undefined;
      email = undefined;
    }

    if (!uid) uid = req.user.uid;
    const updatedUser = await admin.auth().updateUser(uid, {
      email,
      password,
      displayName,
      phoneNumber,
      photoURL,
      emailVerified,
      disabled,
    });

    if (claims) {
      await admin.auth().setCustomUserClaims(uid, claims);
    }

    res.json({
      message: "Felhasználó frissítve.",
      user: {
        uid: updatedUser.uid,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        phoneNumber: updatedUser.phoneNumber,
        photoURL: updatedUser.photoURL,
        emailVerified: updatedUser.emailVerified,
        disabled: updatedUser.disabled,
        claims: claims || {}
      }
    });
  } catch (error) {
    console.error("Hiba a felhasználó frissítésénél:", error);
    res.status(500).json({ message: "Hiba a frissítés közben!", error });
  }
});

// 🔥 EXPORT
exports.api = onRequest(app);