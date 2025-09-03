'use client';
import React, { useEffect, useRef, useState } from "react";
import { auth, db } from "@/app/login/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui";
import Image from "next/image";

// NOTE: For realistic uploads, you would also import Firebase Storage like this:
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Full Screen Icon
const FullScreenIcon = ({ fullScreen }) => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
    {fullScreen ? (
      <path d="M9 15H5v4m0-4l4 4M15 9h4V5m0 4-4-4" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    ) : (
      <path d="M9 5H5v4m0-4l4 4M15 19h4v-4m0 4-4-4" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    )}
  </svg>
);

async function getAISuggestion(reviewText) {
  return "Thank you for your feedback! We're glad you enjoyed our product.";
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [fullScreen, setFullScreen] = useState(false);
  const dashboardSectionRef = useRef(null);
  const dashboardRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [productStats, setProductStats] = useState({ created: 0, bought: 0 });
  const [reviews, setReviews] = useState([]);
  const [aiSuggestions, setAISuggestions] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(null);

  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  const fileInputRef = useRef();
  const avatarMenuRef = useRef();

  // Helper: fetch/refresh profile, stats, and reviews
  const fetchDashboardData = async (u) => {
    if (!u) return;
    const profileRef = doc(db, "users", u.uid);
    const snap = await getDoc(profileRef);
    setProfile(snap.exists() ? snap.data() : {});
    setEditData(snap.exists() ? snap.data() : {});
    const prodSnap = await getDocs(query(collection(db, "products"), where("ownerId", "==", u.uid)));
    const boughtSnap = await getDocs(query(collection(db, "orders"), where("buyerId", "==", u.uid)));
    setProductStats({ created: prodSnap.size, bought: boughtSnap.size });
    const reviewSnap = await getDocs(query(collection(db, "reviews"), where("artisanId", "==", u.uid)));
    const reviewsList = reviewSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setReviews(reviewsList);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await fetchDashboardData(u);
      } else {
        setProfile(null);
        setEditData({});
        setProductStats({ created: 0, bought: 0 });
        setReviews([]);
      }
    });
    return unsub;
    // eslint-disable-next-line
  }, []);

  // Close avatar menu when clicking outside or pressing Esc
  useEffect(() => {
    if (!avatarMenuOpen) return;
    const handleClick = e => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) {
        setAvatarMenuOpen(false);
        setAvatarError(null);
      }
    };
    const handleEsc = e => {
      if (e.key === "Escape") {
        setAvatarMenuOpen(false);
        setAvatarError(null);
      }
    };
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [avatarMenuOpen]);

  // Edit form handlers
  const handleEdit = () => {
    setEditData(profile || {});
    setEditing(true);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaveError(null);
    if (!user || !user.uid) {
      setSaveError('No logged in user found!');
      setSaveLoading(false);
      return;
    }
    setSaveLoading(true);
    try {
      const profileRef = doc(db, "users", user.uid);
      await updateDoc(profileRef, {
        displayName: editData.displayName ?? "",
        businessName: editData.businessName ?? "",
        businessDesc: editData.businessDesc ?? "",
      });
      await fetchDashboardData(user);
      setEditing(false);
    } catch (err) {
      if (
        err.code === "not-found" ||
        (typeof err.message === "string" &&
          err.message.includes("No document to update"))
      ) {
        try {
          const profileRef = doc(db, "users", user.uid);
          await setDoc(
            profileRef,
            {
              displayName: editData.displayName ?? "",
              businessName: editData.businessName ?? "",
              businessDesc: editData.businessDesc ?? "",
            },
            { merge: true }
          );
          await fetchDashboardData(user);
          setEditing(false);
        } catch (setErr) {
          setSaveError(
            "Could not create profile document. Error: " +
              (setErr?.message || JSON.stringify(setErr))
          );
        }
      } else {
        setSaveError(
          "Could not save profile. Error: " + (err?.message || JSON.stringify(err))
        );
      }
    } finally {
      setSaveLoading(false);
    }
  };

  // Avatar menu handlers
  const handleAvatarButtonClick = () => {
    setAvatarMenuOpen((v) => !v);
    setAvatarError(null);
  };

  const handleRemoveAvatar = async () => {
    setAvatarError(null);
    setAvatarLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { photoURL: "" });
      await fetchDashboardData(user);
      setAvatarMenuOpen(false);
    } catch (err) {
      setAvatarError("Failed to remove avatar: " + (err?.message || JSON.stringify(err)));
    }
    setAvatarLoading(false);
  };

  const handleChangeAvatar = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // reset
      fileInputRef.current.click();
    }
    // menu closes on file select, or leave open on error
  };

  const handleAvatarChange = async (e) => {
    setAvatarError(null);
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // OPTIONAL: Validate file type/size here
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select a valid image file.");
      return;
    }
    setAvatarLoading(true);
    // Would use Firebase Storage in real app for upload
    const fakeUrl = URL.createObjectURL(file);
    try {
      await updateDoc(doc(db, "users", user.uid), { photoURL: fakeUrl });
      await fetchDashboardData(user);
      setAvatarMenuOpen(false);
    } catch (err) {
      setAvatarError("Failed to update avatar: " + (err?.message || JSON.stringify(err)));
    }
    setAvatarLoading(false);
  };

  // AI suggestion
  const handleAISuggest = async (reviewId, reviewText) => {
    setAISuggestions(prev => ({ ...prev, [reviewId]: "Generating..." }));
    const resp = await getAISuggestion(reviewText);
    setAISuggestions(prev => ({ ...prev, [reviewId]: resp }));
  };

  // Full Screen handlers
  useEffect(() => {
    if (!dashboardSectionRef.current) return;
    function handleFullScreenChange() {
      const inFull = document.fullscreenElement === dashboardSectionRef.current;
      setFullScreen(inFull);
    }
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  const toggleFullScreen = () => {
    if (!dashboardSectionRef.current) return;
    if (!fullScreen) {
      if (dashboardSectionRef.current.requestFullscreen) {
        dashboardSectionRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  if (!user) return null; // Hide dashboard if not logged in

  const photoURL = profile?.photoURL || user.photoURL || "";

  return (
    <div
      ref={dashboardRef}
      className={
        "min-h-screen w-full bg-gradient-to-tr from-indigo-200 via-indigo-300 to-purple-300 flex flex-col items-center justify-center"
      }
      style={{ minHeight: "100vh" }}
    >
      <section
        ref={dashboardSectionRef}
        className={
          `max-w-2xl mx-auto my-12 p-8 rounded-xl bg-white shadow-lg w-full transition-all duration-300 `+
          (fullScreen ?
            "!fixed !inset-0 !z-[9999] !w-full !h-full !max-w-none !my-0 !rounded-none flex flex-col justify-center items-center overflow-auto !p-10" :
            ""
          )
        }
        style={fullScreen ? { minHeight: '100vh' } : {}}
      >
        <div className="flex justify-between items-center mb-4 w-full">
          <h2 className="text-2xl font-bold text-blue-700">Your Dashboard</h2>
          <Button
            variant="outline"
            className="flex items-center gap-1 px-3 py-2 text-xs rounded-lg border border-indigo-200 hover:bg-indigo-50 transition"
            onClick={toggleFullScreen}
            aria-label={fullScreen ? "Exit Full Screen" : "Full Screen"}
            type="button"
            tabIndex={0}
          >
            <FullScreenIcon fullScreen={fullScreen} />
            {fullScreen ? "Exit Full Screen" : "Full Screen"}
          </Button>
        </div>

        {/* Profile Card */}
        <div className="flex items-start gap-5 mb-6">
          <div className="relative flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-2">
              {photoURL ? (
                <Image src={photoURL} alt="Profile" width={96} height={96} />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-4xl text-blue-600">
                  {user.displayName ? user.displayName.charAt(0) : user.email.charAt(0)}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleAvatarButtonClick}
              className="mt-2 px-4 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold rounded-full shadow hover:scale-105 hover:shadow-lg transition-all focus:outline-none"
              disabled={avatarLoading}
              tabIndex={0}
            >
              {avatarLoading ? "Updating..." : "Edit Avatar"}
            </button>
            {/* Small inline menu below avatar */}
            {avatarMenuOpen && (
              <div
                ref={avatarMenuRef}
                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-44 z-30 bg-white rounded-lg shadow-xl border border-gray-100 py-2 flex flex-col items-stretch animate-fade-in"
                tabIndex={-1}
              >
                <button
                  onClick={handleRemoveAvatar}
                  disabled={avatarLoading}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 text-sm font-medium rounded-t-lg transition disabled:opacity-60"
                  type="button"
                >
                  Remove Profile
                </button>
                <button
                  onClick={handleChangeAvatar}
                  disabled={avatarLoading}
                  className="w-full px-4 py-2 text-left text-indigo-700 hover:bg-indigo-50 text-sm font-medium transition"
                  type="button"
                >
                  Change Profile
                </button>
                <button
                  onClick={() => setAvatarMenuOpen(false)}
                  className="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-b-lg transition"
                  type="button"
                >
                  Cancel
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={avatarLoading}
                />
                {avatarError && (
                  <div className="text-xs text-red-500 mt-2 px-2 text-center">{avatarError}</div>
                )}
              </div>
            )}
          </div>
          <div>
            <div className="text-xl font-semibold text-gray-900">{profile?.displayName || user.displayName || user.email}</div>
            <div className="text-gray-500">{profile?.businessName || profile?.shopName || "No business info yet"}</div>
            <div className="text-gray-400 text-sm">Email: {user.email}</div>
            {profile?.businessDesc && (
              <div className="mt-2 text-lg font-bold text-gray-700">{profile.businessDesc}</div>
            )}
          </div>
        </div>
        {/* Edit Profile Button */}
        {!editing && (
          <Button variant="outline" className="mb-6" onClick={handleEdit}>
            Edit Profile/Shop Info
          </Button>
        )}
        {editing && (
          <form onSubmit={handleEditSubmit} className="mb-6 p-4 bg-gray-50 rounded space-y-2">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Display Name</label>
              <input
                name="displayName"
                value={editData.displayName || ""}
                onChange={handleEditChange}
                className={
                  "w-full rounded px-3 py-2 border border-gray-200 focus:border-blue-400 outline-none " +
                  (fullScreen ? "text-lg py-3" : "")
                }
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Business/Artisan Name</label>
              <input
                name="businessName"
                value={editData.businessName || ""}
                onChange={handleEditChange}
                className={
                  "w-full rounded px-3 py-2 border border-gray-200 focus:border-blue-400 outline-none " +
                  (fullScreen ? "text-lg py-3" : "")
                }
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Business Description</label>
              <textarea
                name="businessDesc"
                value={editData.businessDesc || ""}
                onChange={handleEditChange}
                className={
                  "w-full rounded px-3 py-2 border border-gray-200 focus:border-blue-400 outline-none resize-y " +
                  (fullScreen ? "text-lg py-3 min-h-[80px]" : "")
                }
              />
            </div>
            {saveError && (
              <div className="text-red-500 text-sm">{saveError}</div>
            )}
            <div className="flex gap-2">
              <Button size="sm" className="bg-gradient-to-r from-indigo-200 to-purple-300 text-gray-800 font-bold" disabled={saveLoading}>
                {saveLoading ? "Saving..." : "Save"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)} type="button" disabled={saveLoading}>
                Cancel
              </Button>
            </div>
          </form>
        )}
        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-600">{productStats.created}</div>
            <div className="text-gray-700">Products Created</div>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg text-center">
            <div className="text-3xl font-bold text-indigo-600">{productStats.bought}</div>
            <div className="text-gray-700">Products Bought</div>
          </div>
        </div>
        {/* Reviews */}
        <div className="mb-2 font-semibold text-blue-700">Customer Reviews</div>
        <div className="space-y-4">
          {reviews.length === 0 && (
            <div className="text-gray-400 italic">No reviews yet.</div>
          )}
          {reviews.map(r => (
            <div key={r.id} className="p-4 rounded bg-blue-50">
              <div className="text-gray-800">{r.content || r.text}</div>
              <div className="text-gray-400 text-sm">By: {r.customerName || r.reviewer || "Customer"}</div>
              <div className="flex items-center gap-3 mt-2">
                <Button size="sm" onClick={() => handleAISuggest(r.id, r.content || r.text)}>
                  AI Suggest Response
                </Button>
                {aiSuggestions[r.id] && (
                  <span className="text-indigo-700 bg-indigo-50 px-2 py-1 rounded">{aiSuggestions[r.id]}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}