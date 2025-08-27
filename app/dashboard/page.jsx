'use client';
import React, { useEffect, useState } from "react";
// FIX: Use correct alias and path for firebase. The correct path is "@/app/login/firebase"
import { auth, db } from "@/app/login/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui";
import Image from "next/image";

/**
 * AI suggestion demo function.
 * In production, replace with a real API call or server function.
 */
async function getAISuggestion(reviewText) {
  // Replace this with real AI integration (OpenAI, your endpoint, etc)
  return "Thank you for your feedback! We're glad you enjoyed our product.";
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);    
  const [editData, setEditData] = useState({});
  const [productStats, setProductStats] = useState({ created: 0, bought: 0 });
  const [reviews, setReviews] = useState([]);
  const [aiSuggestions, setAISuggestions] = useState({}); // {reviewId: suggestion}

  // 1. Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Fetch profile info from Firestore
        const profileRef = doc(db, "users", u.uid);
        const snap = await getDoc(profileRef);
        setProfile(snap.exists() ? snap.data() : {});
        setEditData(snap.exists() ? snap.data() : {});
        // Products created (assuming "products" collection with ownerId)
        const prodSnap = await getDocs(query(collection(db, "products"), where("ownerId", "==", u.uid)));
        // Products bought (assuming "orders" with buyerId equals user.uid)
        const boughtSnap = await getDocs(query(collection(db, "orders"), where("buyerId", "==", u.uid)));
        setProductStats({ created: prodSnap.size, bought: boughtSnap.size });
        // Reviews (assuming "reviews" with artisanId/productOwnerId equals user.uid)
        const reviewSnap = await getDocs(query(collection(db, "reviews"), where("artisanId", "==", u.uid)));
        const reviewsList = reviewSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReviews(reviewsList);
      } else {
        setProfile(null);
        setEditData({});
        setProductStats({ created: 0, bought: 0 });
        setReviews([]);
      }
    });
    return unsub;
  }, []);

  // 2. Edit form handlers
  const handleEdit = () => setEditing(true);
  const handleEditChange = (e) => setEditData({ ...editData, [e.target.name]: e.target.value });
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    // Save to Firestore
    const profileRef = doc(db, "users", user.uid);
    await updateDoc(profileRef, editData);
    setProfile(editData);
    setEditing(false);
  };

  // 3. AI suggestion
  const handleAISuggest = async (reviewId, reviewText) => {
    setAISuggestions({ ...aiSuggestions, [reviewId]: "Generating..." });
    const resp = await getAISuggestion(reviewText);
    setAISuggestions({ ...aiSuggestions, [reviewId]: resp });
  };

  if (!user) return null; // Hide dashboard if not logged in

  return (
    <section className="max-w-2xl mx-auto my-12 p-8 rounded-xl bg-white shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Your Dashboard</h2>
      {/* Profile Card */}
      <div className="flex items-start gap-5 mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
          {/* Use user.photoURL if available, else initials */}
          {user.photoURL ?
            <Image src={user.photoURL} alt="Profile" width={96} height={96} /> :
            <div className="flex items-center justify-center w-full h-full text-4xl text-blue-600">
              {user.displayName ? user.displayName.charAt(0) : user.email.charAt(0)}
            </div>
          }
        </div>
        <div>
          <div className="text-xl font-semibold text-gray-900">{user.displayName || user.email}</div>
          <div className="text-gray-500">{profile?.businessName || profile?.shopName || "No business info yet"}</div>
          <div className="text-sm text-gray-400">Email: {user.email}</div>
        </div>
      </div>
      {/* Edit Profile */}
      <Button variant="outline" className="mb-6" onClick={handleEdit}>Edit Profile/Shop Info</Button>
      {editing && (
        <form onSubmit={handleEditSubmit} className="mb-6 p-4 bg-gray-50 rounded space-y-2">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Display Name</label>
            <input name="displayName" value={editData.displayName || ""} onChange={handleEditChange} className="w-full rounded px-3 py-2 border border-gray-200 focus:border-blue-400 outline-none" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Business/Artisan Name</label>
            <input name="businessName" value={editData.businessName || ""} onChange={handleEditChange} className="w-full rounded px-3 py-2 border border-gray-200 focus:border-blue-400 outline-none" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Business Description</label>
            <textarea name="businessDesc" value={editData.businessDesc || ""} onChange={handleEditChange} className="w-full rounded px-3 py-2 border border-gray-200 focus:border-blue-400 outline-none" />
          </div>
          <Button size="sm" className="bg-gradient-to-r from-indigo-200 to-purple-300 text-gray-800 font-bold">Save</Button>
          <Button size="sm" variant="outline" onClick={() => setEditing(false)} type="button">Cancel</Button>
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
        {reviews.length === 0 && <div className="text-gray-400 italic">No reviews yet.</div>}
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
  );
}