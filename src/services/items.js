import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const itemsCollection = collection(db, 'items');

export const addItem = async (itemData) => {
  try {
    const docRef = await addDoc(itemsCollection, itemData);
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getItems = async () => {
  try {
    const querySnapshot = await getDocs(itemsCollection);
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return items;
  } catch (error) {
    throw error;
  }
};

export const updateItem = async (id, updatedData) => {
  try {
    const itemDoc = doc(db, 'items', id);
    await updateDoc(itemDoc, updatedData);
  } catch (error) {
    throw error;
  }
};

export const deleteItem = async (id) => {
  try {
    const itemDoc = doc(db, 'items', id);
    await deleteDoc(itemDoc);
  } catch (error) {
    throw error;
  }
};
