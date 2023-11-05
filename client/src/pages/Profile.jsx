import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from 'react-router-dom';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
  signOutUserFailure,
  signOutUserSuccess,
} from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { app } from "../firebase";

const Profile = () => {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [formData, setFormData] = useState({});
  const [filePer, setFilePer] = useState(0);
  const [fileUploadErr, setFileUploadErr] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false)
  const [userListings, setUserListings] = useState([])
  const [deletelistingError, setDeletelistingError] = useState(false)
  const navigate = useNavigate()

  const dispatch = useDispatch();
  

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePer(Math.round(progress));
      },
      (error) => {
        setFileUploadErr(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
          setFormData({ ...formData, avatar: downloadUrl });
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "put",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
      navigate('/')
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async ()=>{
    try {
      dispatch(signOutUserStart())
      localStorage.clear();
      const res = await fetch(`/api/auth/signout`);
      const data = await res.json()
      if(data.success===false){
        dispatch(signOutUserFailure(data.message))
        return;
      }
      dispatch(signOutUserSuccess(data))
    } catch (error) {
      dispatch(signOutUserFailure(data.message))
    }
    navigate('/sign-in')
  }
  const handleShowListings =async()=>{ 
    try {
      setShowListingsError(false)
      const res = await fetch(`api/user/listings/${currentUser._id}`);
      const data = await res.json()
      if(data.success=== false){
      setShowListingsError(true)
      return;
      }
      setUserListings(data)
    } catch (error) {
      setShowListingsError(true);
    }  
  }

  const handleListingDelete=async(listingId)=>{
    try {
      setDeletelistingError(false)
      const res = await fetch(`/api/listing/delete/${listingId}`,{
        method:"DELETE"
      })
      const data = await res.json()
      if(data.success===false){
        setDeletelistingError(true)
        return;
      }
      setUserListings((prev)=>prev.filter((listing)=>listing._id!==listingId))
    } catch (error) {
      setDeletelistingError(true)
    }
  }
  
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-1">
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        />
        <img
          onClick={() => fileRef.current.click()}
          src={currentUser.avatar}
          alt="Profile"
          className="rounded-full self-center mt-2 h-24 w-24 object-cover cursor-pointer"
        />
        <p className="text-sm self-center">
          {fileUploadErr ? (
            <span className="text-red-600">
              Error while Uploading Image, Image must be less than 2mb!
            </span>
          ) : filePer > 0 && filePer < 100 ? (
            <span className="text-green-600">{`Uploading ${filePer}% image`}</span>
          ) : filePer === 100 ? (
            <span className="text-green-700">{`Successfully uploaded!!`}</span>
          ) : null}
        </p>
        <input
          type="text"
          placeholder="Name"
          defaultValue={currentUser.name}
          className="border p-3 rounded-lg "
          id="name"
          onChange={handleChange}
        />
        <input
          type="text"
          placeholder="Username"
          defaultValue={currentUser.username}
          className="border p-3 rounded-lg "
          id="username"
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="Email"
          defaultValue={currentUser.email}
          className="border p-3 rounded-lg "
          id="email"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-3 rounded-lg "
          id="password"
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className="bg-slate-600 text-white rounded-lg  p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Updating ..." : "Update"}
        </button>
        <Link 
        className="bg-green-600 text-white rounded-lg  p-3 uppercase hover:opacity-95 disabled:opacity-80 text-center"
        to={`/create-listing`}>Create Listing</Link>
        {/* <button className="bg-green-600 text-white rounded-lg  p-3 uppercase hover:opacity-95 disabled:opacity-80">Create Listing</button> */}
      </form>
      <div className="flex justify-between mt-4">
        <span
          className="text-red-800 cursor-pointer"
          onClick={handleDeleteUser}
        >
          Delete Account
        </span>
        <span className="text-red-800 cursor-pointer" onClick={handleSignOut}>Sign Out</span>
      </div>
      <div
        className={`${
          error &&
          !updateSuccess &&
          "my-4 border border-red-800 py-4 rounded-lg shadow-2xl bg-white flex gap-44"
        }`}
      >
        <p className="text-red-800 mx-3 ">
          {error && !updateSuccess ? error : ""}
        </p>
      </div>
      <div
        className={`${
          updateSuccess &&
          !error &&
          "my-4 border border-green-500 py-4 rounded-lg shadow-2xl bg-white flex gap-44"
        }`}
      >
        <p className="text-green-500  mx-3  ">
          {updateSuccess && !error ? "Profile has been updated" : ""}
        </p>
      </div>
      <button className="text-blue-600 w-full" onClick={handleShowListings}>Show Listings</button>
      <p className="text-red-600 mt-5">{showListingsError?"Error in showing lists":''}</p>
      {
        userListings && userListings.length> 0 &&
        <div className="flex flex-col gap-3">
          <h1 className="text-center mt-5 text-xl font-semibold">Your Listings</h1>
        {userListings.map((listing)=> 
        <div key={listing._id} className="border rounded-lg p-3 flex justify-between items-center gap-4">
          <Link to={`/listing/${listing._id}`}>
            <img src={listing.imageUrls[0]} alt="property cover" className="h-16 w-16 object-contain"/>
          </Link>
          <Link to={`/listing/${listing._id}`} className="flex-1 text-slate-700 font-semibold  hover:underline truncate">
            <p>
            {listing.name}
            </p>
          </Link>
          <div className="flex flex-col items-center">
          <button onClick={()=>handleListingDelete(listing._id)} className="text-red-700 uppercase">Delete</button>
         <Link to={`/update-listing/${listing._id}`}> <button className="text-green-700 uppercase">Edit</button></Link>
          </div>
        </div>
        )
}
        </div>
      }
    </div>
  );
};

export default Profile;
