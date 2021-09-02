const firebase = require("firebase/app");
const path = require("path");
const { getStorage, ref, uploadBytes } = require("firebase/storage");
const firebaseConfigObj = require("../config/firebase");

const firebaseConfig = firebaseConfigObj;
const filename = (file) => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  return file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);
};
firebase.initializeApp(firebaseConfig);
const storage = getStorage();

module.exports = { storage, ref, uploadBytes, filename };
