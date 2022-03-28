import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import "../PagesCSS/Dashboard/Dashboard.css";
import avatar from "../PagesCSS/Dashboard/avatar.png";
import {
  auth,
  db,
  logout,
  updateNamePhoto,
  updateUserEmail,
  deleteAccount,
} from "../Firebase";
import { toast } from "react-toastify";
function Dashboard() {
  const [currentUser, isLoading, err] = useAuthState(auth);
  const [name, setName] = useState("name");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(avatar);
  const [photoURL, setPhotoURL] = useState(avatar);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // ORIGINAL
  // const fetchUserName = async () => {
  //   try {
  //     const q = query(collection(db, "users"), where("uid", "==", user?.uid));
  //     const doc = await getDocs(q);
  //     const data = doc.docs[0].data();
  //     setName(data.name);
  //   } catch (err) {
  //     console.error(err);
  //     alert("An error occured while fetching user data");
  //   }
  // };
  // useEffect(() => {
  //   if (loading) return;
  //   if (!user) return navigate("/");
  //   fetchUserName();
  // }, [user, loading]);
  // END ORIGINAL

  useEffect(() => {
    let isSubscribed = true;
    console.log("in useEffect");
    if (isLoading) {
      console.log("in useEffect: isLoading");
      return;
    }
    if (!currentUser) {
      toast("Please log in to view dashboard", { type: "info" });
      navigate("/login");
    }

    if (isSubscribed) {
      if (currentUser) {
        setName(currentUser.displayName);
        console.log("currentUser.displayName: ", currentUser.displayName);
        setEmail(currentUser.email);
      }
      if (currentUser?.photoURL) {
        setPhoto(currentUser.photoURL);
        setPhotoURL(currentUser.photoURL);
      } else {
        console.log("no photoURl");
      }
    }
    return () => (isSubscribed = false);
  }, [currentUser, isLoading]);

  function handleChangePhoto(e) {
    if (e.target.files[0]) {
      setPhotoURL(e.target.files[0]);
      setPhoto(URL.createObjectURL(e.target.files[0]));
    }
  }

  function handleSave() {
    //TODO don't allow when name and email are empty
    updateUserEmail(email, setError, setLoading);
    console.log(loading, error);
    if (!loading && !error) {
      setError(false);
      if (photoURL == avatar) setPhotoURL(null);
      updateNamePhoto(name, photoURL, setLoading);
    }
  }

  function handleCancel() {}

  function handleDelete() {
    deleteAccount(setLoading);
  }

  // useEffect(() => {
  //   if (currentUser) {
  //     setName(currentUser.displayName);
  //     console.log("currentUser.displayName: ", currentUser.displayName);
  //     setEmail(currentUser.email);
  //   }
  //   if (currentUser?.photoURL) {
  //     setPhoto(currentUser.photoURL);
  //     setPhotoURL(currentUser.photoURL);
  //   } else {
  //     console.log("no photoURl");
  //   }
  // }, [currentUser]);

  // console.log("displayName: ", name);
  // console.log("photoURL: ", photoURL);
  // console.log("photo: ", photo);

  return (
    <div className="dashboard">
      <div className="dashboard__container">
        <span className="dashboard-details">Dashboard</span>
        {/* <div>{name}</div>
        <div>{currentUser?.email}</div> */}
        <button className="dashboard__btn" onClick={logout}>
          Logout
        </button>

        <div>
          <input type="file" onChange={handleChangePhoto} />
          <img src={photo} alt="Avatar" className="dashboard-img" />
        </div>

        <input
          type="text"
          value={name == null ? "" : name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
        />
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail Address"
        />

        <button disabled={loading} onClick={handleSave}>
          Save changes
        </button>
        <button disabled={loading} onClick={handleCancel}>
          Cancel
        </button>
        <button disabled={loading} onClick={handleDelete}>
          Delete Account
        </button>
      </div>
    </div>
  );
}
export default Dashboard;
