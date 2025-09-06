 'use client';
import React, { useEffect, useRef, useState } from "react";
import { auth, db } from "@/app/login/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { Button } from "@/components/ui";
import Image from "next/image";
import Input from '@/components/animated icon/Search';

// NOTE: For realistic uploads, you would also import Firebase Storage like this:
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// (Removed Full Screen Icon and logic)
async function getAISuggestion(reviewText) {
  return "Thank you for your feedback! We're glad you enjoyed our product.";
}

export default function Dashboard() {
  // ----- state (unchanged) -----
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const dashboardSectionRef = useRef(null);
  const dashboardRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [productStats, setProductStats] = useState({ created: 0, bought: 0 });
  const [createdProducts, setCreatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [aiSuggestions, setAISuggestions] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(null);

  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  // Section nav state for enabling all nav links
  const [activeSection, setActiveSection] = useState('overview');

  // Theme state: 'light' (default) or 'dark'
  const [theme, setTheme] = useState('light');

  const fileInputRef = useRef();
  const avatarMenuRef = useRef();

  // Settings panel state
  const [settingsOpen, setSettingsOpen] = useState(false);

  // full-screen was removed but JSX referenced it – keep false to avoid errors
  const fullScreen = false;

  // ----- helpers (unchanged) -----
  const fetchDashboardData = async (u) => {
    if (!u) return;
    const profileRef = doc(db, "users", u.uid);
    const snap = await getDoc(profileRef);
    setProfile(snap.exists() ? snap.data() : {});
    setEditData(snap.exists() ? snap.data() : {});
    const prodSnap = await getDocs(
      query(collection(db, "products"), where("ownerId", "==", u.uid))
    );
    const createdList = prodSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setCreatedProducts(createdList);
    const boughtSnap = await getDocs(
      query(collection(db, "orders"), where("buyerId", "==", u.uid))
    );
    setProductStats({ created: prodSnap.size, bought: boughtSnap.size });
    const reviewSnap = await getDocs(
      query(collection(db, "reviews"), where("artisanId", "==", u.uid))
    );
    const reviewsList = reviewSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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

  useEffect(() => {
    if (!avatarMenuOpen) return;
    const handleClick = (e) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) {
        setAvatarMenuOpen(false);
        setAvatarError(null);
      }
    };
    const handleEsc = (e) => {
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

  // ----- handlers (unchanged) -----
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
      setSaveError("No logged in user found!");
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
        (typeof err.message === "string" && err.message.includes("No document to update"))
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
        setSaveError("Could not save profile. Error: " + (err?.message || JSON.stringify(err)));
      }
    } finally {
      setSaveLoading(false);
    }
  };

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
  };

  const handleAvatarChange = async (e) => {
    setAvatarError(null);
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select a valid image file.");
      return;
    }
    setAvatarLoading(true);
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

  const handleAISuggest = async (reviewId, reviewText) => {
    setAISuggestions((prev) => ({ ...prev, [reviewId]: "Generating..." }));
    const resp = await getAISuggestion(reviewText);
    setAISuggestions((prev) => ({ ...prev, [reviewId]: resp }));
  };

  // ----- render -----
  if (!user) return null;

  const photoURL = profile?.photoURL || user.photoURL || "";

  return (
    <div
      ref={dashboardRef}
      className={`min-h-screen w-full flex ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'}`}
      style={theme === 'dark'
        ? { minHeight: '100vh', backgroundColor: '#111', color: '#fff' }
        : { minHeight: '100vh', backgroundColor: '#fff', color: '#1a202c' }
      }
    >
      {/* Sidebar (static nav like YouTube Studio) */}
      <aside className={`hidden md:flex md:w-64 border-r flex-col py-6 ${theme === 'dark' ? 'bg-black border-gray-800' : 'bg-white border-gray-200'}`}>
        <h1 className={`px-6 text-lg font-semibold tracking-wide mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Dashboard
        </h1>
        <nav className="px-2 text-sm space-y-1">
          <button
            className={`block w-full text-left px-4 py-2 rounded-lg transition font-semibold ${activeSection === 'overview' ? (theme === 'dark' ? 'bg-gray-800 text-blue-300' : 'bg-gray-100 text-blue-700') : (theme === 'dark' ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-900')}`}
            onClick={() => setActiveSection('overview')}
            type="button"
          >Overview</button>
          <button
            className={`block w-full text-left px-4 py-2 rounded-lg transition font-semibold ${activeSection === 'profile' ? (theme === 'dark' ? 'bg-gray-800 text-blue-300' : 'bg-gray-100 text-blue-700') : (theme === 'dark' ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-900')}`}
            onClick={() => setActiveSection('profile')}
            type="button"
          >Profile</button>
          <button
            className={`block w-full text-left px-4 py-2 rounded-lg transition font-semibold ${activeSection === 'products' ? (theme === 'dark' ? 'bg-gray-800 text-blue-300' : 'bg-gray-100 text-blue-700') : (theme === 'dark' ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-900')}`}
            onClick={() => setActiveSection('products')}
            type="button"
          >Products</button>
          <button
            className={`block w-full text-left px-4 py-2 rounded-lg transition font-semibold ${activeSection === 'reviews' ? (theme === 'dark' ? 'bg-gray-800 text-blue-300' : 'bg-gray-100 text-blue-700') : (theme === 'dark' ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-900')}`}
            onClick={() => setActiveSection('reviews')}
            type="button"
          >Reviews</button>
          {/* Settings nav item */}
          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
            className={`w-full text-left block px-4 py-2 rounded-lg mt-3 font-semibold ${theme === 'dark' ? 'text-blue-300 hover:bg-gray-800' : 'text-blue-700 hover:bg-gray-100'}`}
            aria-expanded={settingsOpen}
          >
            Settings
          </button>
        </nav>
        {/* Settings Modal */}
        {settingsOpen && (
          <div>
            {/* Modal Overlay */}
            <div
              className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
              style={{animation: 'fadeIn 0.18s'}}
              onClick={() => setSettingsOpen(false)}
            />
            <div
              className={`fixed inset-0 z-50 flex items-center justify-center px-2 py-8`}
              aria-modal="true"
              role="dialog"
            >
              <div
                className={`relative w-full max-w-md rounded-2xl shadow-2xl border transition-all ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
                style={{animation: 'popModal 0.22s'}}
                onClick={e => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSettingsOpen(false)}
                  className={`absolute top-4 right-4 p-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'} transition`}
                  aria-label="Close settings"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <div className="px-7 py-8">
                  <div className={`mb-6 font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Settings</div>
                  {/* Actions Section */}
                  <div className="flex flex-col gap-3">
                    <Button
                      variant="default"
                      className="w-full font-semibold text-base py-2"
                      onClick={async () => {
                        if (typeof window !== 'undefined') {
                          const { signOut } = await import('firebase/auth');
                          await signOut(auth);
                          window.location.href = '/login';
                        }
                      }}
                    >
                      Logout
                    </Button>

                    <Button
                      variant="destructive"
                      className="w-full font-semibold text-base py-2"
                      onClick={async () => {
                        if (!user) return;
                        const doit = window.confirm('Are you sure you want to remove your account and all associated data? This cannot be undone.');
                        if (!doit) return;
                        try {
                          const userId = user.uid;
                          await import('firebase/firestore').then(async firestore => {
                            await firestore.deleteDoc(firestore.doc(db, "users", userId));
                            const productsSnap = await firestore.getDocs(firestore.query(firestore.collection(db, "products"), firestore.where("ownerId", "==", userId)));
                            await Promise.all(productsSnap.docs.map(d => firestore.deleteDoc(d.ref)));
                            const ordersSnap = await firestore.getDocs(firestore.query(firestore.collection(db, "orders"), firestore.where("buyerId", "==", userId)));
                            await Promise.all(ordersSnap.docs.map(d => firestore.deleteDoc(d.ref)));
                            const reviewsSnap = await firestore.getDocs(firestore.query(firestore.collection(db, "reviews"), firestore.where("artisanId", "==", userId)));
                            await Promise.all(reviewsSnap.docs.map(d => firestore.deleteDoc(d.ref)));
                          });
                          await import('firebase/auth').then(async authApi => {
                            await authApi.deleteUser(auth.currentUser);
                          });
                          window.location.href = '/';
                        } catch (err) {
                          alert('Failed to remove account: ' + (err && err.message ? err.message : JSON.stringify(err)));
                        }
                      }}
                    >
                      Remove Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            {/* Simple CSS for dialog fade/pop-in */}
            <style>{`
              @keyframes fadeIn { from { opacity:0; } to {opacity:1;} }
              @keyframes popModal {
                0% { opacity:0; transform: scale(.96) translateY(32px); }
                100% { opacity:1; transform: none; }
              }
            `}</style>
          </div>
        )}
        
       <div className={`mt-auto px-6 pt-4 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
  © {new Date().getFullYear()}
</div>
      </aside>

      {/* Main content */}
      <main className={theme === 'dark' ? 'flex-1 bg-black' : 'flex-1 bg-white'}>
        {/* Top bar */}
        <div className={`sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 h-14 backdrop-blur border-b ${theme === 'dark' ? 'bg-black/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
          <div className={`md:hidden font-semibold ${theme === 'dark' ? 'text-white' : ''}`}>Dashboard</div>
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="w-full ml-4 md:ml-33">
              <Input />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm hidden sm:block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {user.email}
            </span>
            <div className={theme === 'dark' ? 'w-8 h-8 rounded-full overflow-hidden bg-gray-700' : 'w-8 h-8 rounded-full overflow-hidden bg-gray-200'}>
              {photoURL ? (
                <Image src={photoURL} alt="Profile" width={32} height={32} />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-xs ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {user.displayName ? user.displayName.charAt(0) : user.email.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page container */}
        <section
          ref={dashboardSectionRef}
          className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full"
        >
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <>
              <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Dashboard</h2>

              {/* Profile card */}
              <div className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 mb-8`}>
                <div className="flex items-start gap-6">
                  <div className="relative flex flex-col items-center">
                    <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} w-24 h-24 rounded-full overflow-hidden mb-2`}>
                      {photoURL ? (
                        <Image src={photoURL} alt="Profile" width={96} height={96} />
                      ) : (
                        <div className={`flex items-center justify-center w-full h-full text-4xl ${theme === 'dark' ? 'text-blue-300' : 'text-blue-400'}`}>
                          {user.displayName ? user.displayName.charAt(0) : user.email.charAt(0)}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleAvatarButtonClick}
                      className="mt-2 px-4 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-full shadow transition-all focus:outline-none disabled:opacity-60"
                      disabled={avatarLoading}
                      tabIndex={0}
                    >
                      {avatarLoading ? "Updating..." : "Edit Avatar"}
                    </button>
                    {avatarMenuOpen && (
                      <div
                        ref={avatarMenuRef}
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 z-30 bg-[#1a1a1a] rounded-lg shadow-xl border border-[#262626] py-2 flex flex-col items-stretch"
                        tabIndex={-1}
                      >
                        <button onClick={handleRemoveAvatar} disabled={avatarLoading} className="w-full px-4 py-2 text-left text-red-400 hover:bg-[#221818] text-sm font-medium transition disabled:opacity-60" type="button">Remove Profile</button>
                        <button onClick={handleChangeAvatar} disabled={avatarLoading} className="w-full px-4 py-2 text-left text-blue-300 hover:bg-[#1e2636] text-sm font-medium transition" type="button">Change Profile</button>
                        <button onClick={() => setAvatarMenuOpen(false)} className="w-full px-4 py-2 text-left text-gray-300 hover:bg-[#232323] text-sm font-medium transition" type="button">Cancel</button>
                        <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleAvatarChange} disabled={avatarLoading} />
                        {avatarError && (<div className="text-xs text-red-400 mt-2 px-2 text-center">{avatarError}</div>)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{profile?.displayName || user.displayName || user.email}</div>
                    <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}>{profile?.businessName || profile?.shopName || "No business info yet"}</div>
                    <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'} text-sm`}>Email: {user.email}</div>
                    {profile?.businessDesc && (<div className={`mt-3 text-base font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>{profile.businessDesc}</div>)}
                  </div>
                </div>
                {/* Edit Profile */}
                {!editing && (
                  <div className="mt-6">
                    <Button variant="outline" className={`${theme === 'dark' ? 'border-gray-500 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-800 hover:bg-gray-100'}`} onClick={handleEdit}>
                      Edit Profile/Shop Info
                    </Button>
                  </div>
                )}
                {editing && (
                  <form onSubmit={handleEditSubmit} className={`mt-6 p-4 rounded-xl space-y-3 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Display Name</label>
                      <input name="displayName" value={editData.displayName || ""} onChange={handleEditChange} className={`w-full rounded-lg px-3 py-2 outline-none focus:border-blue-400 ${theme === 'dark' ? 'bg-gray-900 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'} ${(fullScreen ? "text-lg py-3" : "")}`}/>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Business/Artisan Name</label>
                      <input name="businessName" value={editData.businessName || ""} onChange={handleEditChange} className={`w-full rounded-lg px-3 py-2 outline-none focus:border-blue-400 ${theme === 'dark' ? 'bg-gray-900 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'} ${(fullScreen ? "text-lg py-3" : "")}`}/>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Business Description</label>
                      <textarea name="businessDesc" value={editData.businessDesc || ""} onChange={handleEditChange} className={`w-full rounded-lg px-3 py-2 outline-none resize-y focus:border-blue-400 ${theme === 'dark' ? 'bg-gray-900 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'} ${(fullScreen ? "text-lg py-3 min-h-[80px]" : "")}`}/>
                    </div>
                    {saveError && <div className="text-red-400 text-sm">{saveError}</div>}
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold" disabled={saveLoading}>{saveLoading ? "Saving..." : "Save"}</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(false)} type="button" disabled={saveLoading} className={`${theme === 'dark' ? 'border-gray-500 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-800 hover:bg-gray-100'}`}>Cancel</Button>
                    </div>
                  </form>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8">
                <div className={`p-5 border rounded-2xl text-center ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="text-3xl font-bold text-blue-400">{productStats.created}</div>
                  <div className={theme === 'dark' ? 'text-gray-300 mt-1' : 'text-gray-700 mt-1'}>Products Created</div>
                </div>
                <div className={`p-5 border rounded-2xl text-center ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="text-3xl font-bold text-purple-400">{productStats.bought}</div>
                  <div className={theme === 'dark' ? 'text-gray-300 mt-1' : 'text-gray-700 mt-1'}>Products Bought</div>
                </div>
              </div>

              {/* Products Created */}
              <div className="mb-8">
                <div className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Created Products</div>
                {createdProducts.length === 0 && (
                  <div className="text-gray-400 italic">No products created yet.</div>
                )}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {createdProducts.map((prod) => (
                    <div key={prod.id} className={`rounded-xl border transition shadow-sm flex flex-col gap-2 p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                      {prod.imageUrl && (<img src={prod.imageUrl} alt={prod.name || "Product image"} className="w-full h-40 object-cover rounded-lg mb-1" />)}
                      <div className={`font-semibold text-base truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{prod.name || prod.title || "(Unnamed Product)"}</div>
                      {prod.description && (<div className={theme === 'dark' ? 'text-gray-300 text-sm' : 'text-gray-700 text-sm'}>{prod.description}</div>)}
                      {typeof prod.price !== "undefined" && (<div className="font-semibold text-green-400 dark:text-green-400 text-green-600">Price: ��{prod.price}</div>)}
                      {prod.createdAt && (<div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Created: {prod.createdAt.toDate?.().toLocaleString?.() || String(prod.createdAt)}</div>)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div className={`mb-3 font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Customer Reviews</div>
              <div className="space-y-4">
                {reviews.length === 0 && (
                  <div className="text-gray-400 italic">No reviews yet.</div>
                )}
                {reviews.map((r) => (
                  <div key={r.id} className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>                  <div className={theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>{r.content || r.text}</div>
                    <div className={theme === 'dark' ? 'text-gray-400 text-sm' : 'text-gray-500 text-sm'}>By: {r.customerName || r.reviewer || "Customer"}</div>
                    <div className="flex items-center gap-3 mt-3">
                      <Button size="sm" onClick={() => handleAISuggest(r.id, r.content || r.text)}>AI Suggest Response</Button>
                      {aiSuggestions[r.id] && (<span className={`border px-2 py-1 rounded ${theme === 'dark' ? 'text-blue-300 bg-gray-900 border-gray-700' : 'text-blue-600 bg-blue-50 border-blue-200'}`}>{aiSuggestions[r.id]}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <>
              <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Profile</h2>
              {/* Profile card and edit form (copied from original) */}
              <div className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 mb-8`}>
                <div className="flex items-start gap-6">
                  <div className="relative flex flex-col items-center">
                    <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} w-24 h-24 rounded-full overflow-hidden mb-2`}>
                      {photoURL ? (
                        <Image src={photoURL} alt="Profile" width={96} height={96} />
                      ) : (
                        <div className={`flex items-center justify-center w-full h-full text-4xl ${theme === 'dark' ? 'text-blue-300' : 'text-blue-400'}`}>
                          {user.displayName ? user.displayName.charAt(0) : user.email.charAt(0)}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleAvatarButtonClick}
                      className="mt-2 px-4 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-full shadow transition-all focus:outline-none disabled:opacity-60"
                      disabled={avatarLoading}
                      tabIndex={0}
                    >
                      {avatarLoading ? "Updating..." : "Edit Avatar"}
                    </button>
                    {avatarMenuOpen && (
                      <div
                        ref={avatarMenuRef}
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 z-30 bg-[#1a1a1a] rounded-lg shadow-xl border border-[#262626] py-2 flex flex-col items-stretch"
                        tabIndex={-1}
                      >
                        <button onClick={handleRemoveAvatar} disabled={avatarLoading} className="w-full px-4 py-2 text-left text-red-400 hover:bg-[#221818] text-sm font-medium transition disabled:opacity-60" type="button">Remove Profile</button>
                        <button onClick={handleChangeAvatar} disabled={avatarLoading} className="w-full px-4 py-2 text-left text-blue-300 hover:bg-[#1e2636] text-sm font-medium transition" type="button">Change Profile</button>
                        <button onClick={() => setAvatarMenuOpen(false)} className="w-full px-4 py-2 text-left text-gray-300 hover:bg-[#232323] text-sm font-medium transition" type="button">Cancel</button>
                        <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleAvatarChange} disabled={avatarLoading} />
                        {avatarError && (<div className="text-xs text-red-400 mt-2 px-2 text-center">{avatarError}</div>)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{profile?.displayName || user.displayName || user.email}</div>
                    <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}>{profile?.businessName || profile?.shopName || "No business info yet"}</div>
                    <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'} text-sm`}>Email: {user.email}</div>
                    {profile?.businessDesc && (<div className={`mt-3 text-base font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>{profile.businessDesc}</div>)}
                  </div>
                </div>
                {/* Edit Profile */}
                {!editing && (
                  <div className="mt-6">
                    <Button variant="outline" className={`${theme === 'dark' ? 'border-gray-500 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-800 hover:bg-gray-100'}`} onClick={handleEdit}>
                      Edit Profile/Shop Info
                    </Button>
                  </div>
                )}
                {editing && (
                  <form onSubmit={handleEditSubmit} className={`mt-6 p-4 rounded-xl space-y-3 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Display Name</label>
                      <input name="displayName" value={editData.displayName || ""} onChange={handleEditChange} className={`w-full rounded-lg px-3 py-2 outline-none focus:border-blue-400 ${theme === 'dark' ? 'bg-gray-900 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'} ${(fullScreen ? "text-lg py-3" : "")}`}/>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Business/Artisan Name</label>
                      <input name="businessName" value={editData.businessName || ""} onChange={handleEditChange} className={`w-full rounded-lg px-3 py-2 outline-none focus:border-blue-400 ${theme === 'dark' ? 'bg-gray-900 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'} ${(fullScreen ? "text-lg py-3" : "")}`}/>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Business Description</label>
                      <textarea name="businessDesc" value={editData.businessDesc || ""} onChange={handleEditChange} className={`w-full rounded-lg px-3 py-2 outline-none resize-y focus:border-blue-400 ${theme === 'dark' ? 'bg-gray-900 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'} ${(fullScreen ? "text-lg py-3 min-h-[80px]" : "")}`}/>
                    </div>
                    {saveError && <div className="text-red-400 text-sm">{saveError}</div>}
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold" disabled={saveLoading}>{saveLoading ? "Saving..." : "Save"}</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(false)} type="button" disabled={saveLoading} className={`${theme === 'dark' ? 'border-gray-500 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-800 hover:bg-gray-100'}`}>Cancel</Button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
          {/* Products Section */}
          {activeSection === 'products' && (
            <>
              <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Products</h2>
              <div className="mb-8">
                {createdProducts.length === 0 && (
                  <div className="text-gray-400 italic">No products created yet.</div>
                )}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {createdProducts.map((prod) => (
                    <div key={prod.id} className={`rounded-xl border transition shadow-sm flex flex-col gap-2 p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                      {prod.imageUrl && (<img src={prod.imageUrl} alt={prod.name || "Product image"} className="w-full h-40 object-cover rounded-lg mb-1" />)}
                      <div className={`font-semibold text-base truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{prod.name || prod.title || "(Unnamed Product)"}</div>
                      {prod.description && (<div className={theme === 'dark' ? 'text-gray-300 text-sm' : 'text-gray-700 text-sm'}>{prod.description}</div>)}
                      {typeof prod.price !== "undefined" && (<div className="font-semibold text-green-400 dark:text-green-400 text-green-600">Price: ₹{prod.price}</div>)}
                      {prod.createdAt && (<div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Created: {prod.createdAt.toDate?.().toLocaleString?.() || String(prod.createdAt)}</div>)}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {/* Reviews Section */}
          {activeSection === 'reviews' && (
            <>
              <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Customer Reviews</h2>
              <div className="space-y-4">
                {reviews.length === 0 && (<div className="text-gray-400 italic">No reviews yet.</div>)}
                {reviews.map((r) => (
                  <div key={r.id} className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>                  <div className={theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>{r.content || r.text}</div>
                    <div className={theme === 'dark' ? 'text-gray-400 text-sm' : 'text-gray-500 text-sm'}>By: {r.customerName || r.reviewer || "Customer"}</div>
                    <div className="flex items-center gap-3 mt-3">
                      <Button size="sm" onClick={() => handleAISuggest(r.id, r.content || r.text)}>AI Suggest Response</Button>
                      {aiSuggestions[r.id] && (<span className={`border px-2 py-1 rounded ${theme === 'dark' ? 'text-blue-300 bg-gray-900 border-gray-700' : 'text-blue-600 bg-blue-50 border-blue-200'}`}>{aiSuggestions[r.id]}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          </section>
      </main>
    </div>
  );
}
