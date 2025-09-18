'use client';

import React, { useState } from 'react';
import { auth, db } from '@/app/login/firebase';

// Confirmation modal to permanently delete the current user's account and related data.
// Props:
// - open: boolean to control visibility
// - onClose: function to close the modal
const ComfermationDelet = ({ open = false, onClose = () => {} }) => {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    if (!auth || !auth.currentUser) {
      alert('No authenticated user found.');
      return;
    }
    const userId = auth.currentUser.uid;
    setLoading(true);
    try {
      // Lazy-load Firestore methods to keep bundle light
      await import('firebase/firestore').then(async (firestore) => {
        // Remove main user document
        try {
          await firestore.deleteDoc(firestore.doc(db, 'users', userId));
        } catch {}

        // Remove products owned by the user
        try {
          const productsSnap = await firestore.getDocs(
            firestore.query(
              firestore.collection(db, 'products'),
              firestore.where('ownerId', '==', userId)
            )
          );
          await Promise.all(productsSnap.docs.map((d) => firestore.deleteDoc(d.ref)));
        } catch {}

        // Remove orders placed by the user
        try {
          const ordersSnap = await firestore.getDocs(
            firestore.query(
              firestore.collection(db, 'orders'),
              firestore.where('buyerId', '==', userId)
            )
          );
          await Promise.all(ordersSnap.docs.map((d) => firestore.deleteDoc(d.ref)));
        } catch {}

        // Remove reviews where the user is the artisan/seller
        try {
          const reviewsSnap = await firestore.getDocs(
            firestore.query(
              firestore.collection(db, 'reviews'),
              firestore.where('artisanId', '==', userId)
            )
          );
          await Promise.all(reviewsSnap.docs.map((d) => firestore.deleteDoc(d.ref)));
        } catch {}
      });

      // Finally, delete the Firebase Auth user. This may require recent login.
      await import('firebase/auth').then(async (authApi) => {
        await authApi.deleteUser(auth.currentUser);
      });

      // Redirect to homepage
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (err) {
      alert(
        'Failed to remove account: ' + (err && err.message ? err.message : JSON.stringify(err))
      );
    } finally {
      setLoading(false);
      try { onClose(); } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={() => !loading && onClose()} />

      {/* Dialog */}
      <div
        className="relative group select-none w-[320px] sm:w-[360px] flex flex-col p-4 items-center justify-center bg-gray-800 border border-gray-700 shadow-2xl rounded-2xl mx-4"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center p-3 flex-auto justify-center">
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            className="group-hover:animate-bounce w-12 h-12 flex items-center text-gray-600 fill-red-500 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clipRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              fillRule="evenodd"
            />
          </svg>
          <h2 className="text-xl font-bold py-4 text-gray-200">Are you sure?</h2>
          <p className="font-bold text-sm text-gray-400 px-2">
            Do you really want to delete your account? This action is permanent and cannot be undone.
          </p>
        </div>
        <div className="p-2 mt-2 text-center space-x-1 md:block">
          <button
            type="button"
            onClick={() => !loading && onClose()}
            disabled={loading}
            className="mb-2 md:mb-0 bg-gray-700 px-5 py-2 text-sm shadow-sm font-medium tracking-wider border-2 border-gray-600 hover:border-gray-600 text-gray-300 rounded-full hover:shadow-lg hover:bg-gray-800 transition ease-in duration-300 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-500 hover:bg-transparent px-5 ml-4 py-2 text-sm shadow-sm hover:shadow-lg font-medium tracking-wider border-2 border-red-500 hover:border-red-500 text-white hover:text-red-500 rounded-full transition ease-in duration-300 disabled:opacity-60"
          >
            {loading ? 'Deleting...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComfermationDelet;
