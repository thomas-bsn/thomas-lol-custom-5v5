'use client';

import { useEffect } from 'react';

export default function AuthValidator() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/validate`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) {
        console.log('[Auth] Token invalide → logout');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Force reload pour mettre à jour l'UI
        window.location.reload();
      }
    })
    .catch(err => {
      console.error('[Auth] Erreur validation:', err);
    });
  }, []);

  return null; // Composant invisible
}