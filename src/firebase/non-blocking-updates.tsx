'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
  FirestoreError,
} from 'firebase/firestore';

/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export async function setDocumentNonBlocking(docRef: DocumentReference, data: any, options?: SetOptions) {
  try {
    await setDoc(docRef, data, options || {});
  } catch (error) {
    console.error(`Error setting document at ${docRef.path}:`, error);
    throw error;
  }
}


/**
 * Initiates an addDoc operation for a collection reference.
 * Does NOT await the write operation internally.
 * Returns the Promise for the new doc ref, but typically not awaited by caller.
 */
export async function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  try {
    const docRef = await addDoc(colRef, data);
    return docRef;
  } catch (error) {
    console.error(`Error adding document to ${colRef.path}:`, error);
    throw error;
  }
}


/**
 * Initiates an updateDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export async function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  try {
    await updateDoc(docRef, data);
  } catch (error) {
    console.error(`Error updating document at ${docRef.path}:`, error);
    throw error;
  }
}


/**
 * Initiates a deleteDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export async function deleteDocumentNonBlocking(docRef: DocumentReference) {
  try {
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document at ${docRef.path}:`, error);
    throw error;
  }
}
