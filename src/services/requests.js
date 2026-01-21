import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const requestsCollection = collection(db, 'requests');

export const addRequest = async (requestData) => {
  try {
    const docRef = await addDoc(requestsCollection, requestData);
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getRequests = async () => {
  try {
    const querySnapshot = await getDocs(requestsCollection);
    const requests = [];
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });
    return requests;
  } catch (error) {
    throw error;
  }
};

export const updateRequest = async (id, updatedData) => {
  try {
    const requestDoc = doc(db, 'requests', id);
    await updateDoc(requestDoc, updatedData);
  } catch (error) {
    throw error;
  }
};

export const deleteRequest = async (id) => {
  try {
    const requestDoc = doc(db, 'requests', id);
    await deleteDoc(requestDoc);
  } catch (error) {
    throw error;
  }
};
