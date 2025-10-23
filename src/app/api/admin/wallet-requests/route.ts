import { NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';
import type { WalletTopUpRequest } from '@/lib/data';

export async function GET(request: Request) {
  try {
    // In a real app, you'd want to protect this route to ensure only admins can call it.
    // For example, by verifying a Firebase Auth ID token passed in the Authorization header.
    
    const snapshot = await adminFirestore.collection('wallet_top_up_requests').orderBy('requestDate', 'desc').get();
    
    if (snapshot.empty) {
      return NextResponse.json([]);
    }
    
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as WalletTopUpRequest[];

    return NextResponse.json(requests);

  } catch (error: any) {
    console.error("Error fetching wallet requests:", error);
    return NextResponse.json({ error: 'Failed to fetch wallet requests', details: error.message }, { status: 500 });
  }
}
