const fs = require("fs");
const firebase = require("firebase/app");
const { getStorage, ref, uploadBytes } = require("firebase/storage");
const storage = getStorage();
const firebaseConfigObj = require("../config/firebase");
const firebaseConfig = firebaseConfigObj;
firebase.initializeApp(firebaseConfig);

exports.profile = (req, res, next) => {
  const storageRef = ref(storage, req.file.filename);
  fs.promises.readFile(req.file.path).then((imgBuffer) => {
    uploadBytes(storageRef, imgBuffer, { contentType: req.file.mimetype }).then(
      (snapshot) => {
        return res.json({ message: "success" });
      }
    );
  });
};
