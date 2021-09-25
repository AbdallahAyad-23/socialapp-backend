const firebase = require("firebase/app");
const path = require("path");
const { getStorage, ref, uploadBytes } = require("firebase/storage");

const firebaseConfig = {
  apiKey: process.env.FIREBASE_APIKEY,
  authDomain: process.env.FIREBASE_AUTHDOMAIN,
  projectId: process.env.FIREBASE_PROJECTID,
  storageBucket: process.env.FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGINGSENDERID,
  appId: process.env.FIREBASE_APPID,
  measurementId: process.env.FIREBASE_MEASUREMENTID,
};
const filename = (file) => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  return file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);
};
firebase.initializeApp(firebaseConfig);
const storage = getStorage();

module.exports = { storage, ref, uploadBytes, filename };
