// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  query,
  getDocs,
  collection,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  getAuth,
  deleteUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
// import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnpkoXtoilGMF7PDmWH_zS-wDdB_nsKz0",
  authDomain: "school-compare-cffbf.firebaseapp.com",
  databaseURL:
    "https://school-compare-cffbf-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "school-compare-cffbf",
  storageBucket: "school-compare-cffbf.appspot.com",
  messagingSenderId: "788961608159",
  appId: "1:788961608159:web:d63d54c0a1486aadb6446a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const logInWithEmailAndPassword = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error(err);
    toast(err.message, { type: "error" });
  }
};

const registerWithEmailAndPassword = async (
  name,
  email,
  password,
  setIsLoading
) => {
  try {
    setIsLoading(true);
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await addDoc(collection(db, "users"), {
      uid: user.uid,
      name,
      authProvider: "local",
      email,
    });
    await updateProfile(auth.currentUser, {
      displayName: name,
    })
      .then(() => {
        console.log(auth.currentUser.displayName);
      })
      .catch((error) => {
        console.log(error.message);
      });
  } catch (err) {
    console.error(err);
    toast(err.message, { type: "error" });
  }
  setIsLoading(false);
};

const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    toast("Password reset link sent!", { type: "info" });
  } catch (err) {
    console.error(err);
    toast(err.message, { type: "error" });
  }
};

const logout = () => {
  signOut(auth);
};

function useAuth() {
  const [currentUser, setCurrentUser] = useState();
  // const [isAuth, setIsAuth] = useState(false);
  useEffect(() => {
    let isMounted = true;
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && isMounted) {
        setCurrentUser(user);
        // setIsAuth(true);
      } else {
        // setIsAuth(false);
        setCurrentUser(false);
      }
    });

    return () => {
      unsub();
      isMounted = false;
    };
  }, []);
  return currentUser;
}

function reauthenticate(currentPassword) {
  const user = auth.currentUser;
  const cred = EmailAuthProvider.credential(user.email, currentPassword);
  return reauthenticateWithCredential(user, cred);
}

const updateUserEmail = async (newEmail) => {
  const user = auth.currentUser;

  await updateEmail(user, newEmail).then(async () => {
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q).catch((err) => {
      console.log("getDocs from query error: ", err.message);
    });

    const userRef = querySnapshot.docs[0].ref;

    await updateDoc(userRef, {
      email: newEmail,
    }).catch((err) => {
      console.log("updateDoc (email field) error: ", err.message);
    });
  });
  // .catch((err) => {
  //   //TODO reauthentication (separate function) when signed in too long ago
  //   console.log("updateEmail (Authentication) error: ", err.message);
  //   setError(true);
  //   toast(err.message, { type: "error" });
  // })
};

async function updateName(newName, setLoading) {
  const user = auth.currentUser;

  setLoading(true);

  const q = query(collection(db, "users"), where("uid", "==", user.uid));
  const querySnapshot = await getDocs(q).catch((err) =>
    console.log("getDocs from Query error: ", err.message)
  );
  const userRef = querySnapshot.docs[0].ref;

  await updateDoc(userRef, {
    name: newName,
  }).catch((err) => {
    console.log("updateDoc (name field) error: ", err.message);
  });

  await updateProfile(user, {
    displayName: newName,
  }).catch((err) => {
    console.log("updateProfile (displayName) error: ", err.message);
  });
  setLoading(false);
}

async function updatePhoto(file, setLoading) {
  const user = auth.currentUser;
  console.log("file type: ", typeof file);

  setLoading(true);

  const fileRef = ref(storage, "/profilePics/" + user.uid);

  const metadata = {
    contentType: "image/jpeg",
  };

  await uploadBytes(fileRef, file, metadata);
  const photoURL = await getDownloadURL(fileRef);

  await updateProfile(user, {
    photoURL: photoURL,
  }).catch((err) => {
    console.log("updateProfile (photoURL) error: ", err.message);
  });
  console.log("In Firebase updatePhoto, updated user photoURL:", user.photoURL);
  setLoading(false);
}

async function deleteAccount(setLoading) {
  const user = auth.currentUser;
  setLoading(true);
  deleteUser(user)
    .then(async () => {
      const q = query(collection(db, "users"), where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q).catch((err) =>
        console.log(err.message)
      );

      const userRef = querySnapshot.docs[0].ref;

      await deleteDoc(userRef).catch((err) => {
        toast(err.message, { type: "error" });
      });

      const fileRef = ref(storage, "/profilePics/" + user.uid);
      deleteObject(fileRef).catch((err) => {
        console.log(err.message);
      });
    })
    .then(() => {
      toast("Account deleted.", { type: "info" });
    })
    .catch((err) => {
      toast(err.message, { type: "error" });
    });
  setLoading(false);
}

const useGetUsers = () => {
  const [userList, setUserList] = useState();

  useEffect(() => {
    let isMounted = true;
    const getUser = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      if (isMounted) {
        setUserList(
          querySnapshot.docs.map((doc) => ({
            ...doc.data(),
          }))
        );
      }
    };
    getUser();
    return () => {
      isMounted = false;
    };
  }, []);
  return userList;
};

export {
  logInWithEmailAndPassword,
  registerWithEmailAndPassword,
  sendPasswordReset,
  logout,
  useAuth,
  updateName,
  updatePhoto,
  updateUserEmail,
  deleteAccount,
  reauthenticate,
  useGetUsers,
};
export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
