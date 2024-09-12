import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";

export async function uploadImage(file, fileName, ticketId) {
  try {
    const imageRef = ref(storage, `images/${ticketId}/${fileName}`);
    await uploadBytes(imageRef, file);
    return getDownloadURL(imageRef);
  } catch (error) {
    throw error;
  }
}

export async function getImage(ticketId) {
  try {
    const listRef = ref(storage, `images/${ticketId}`);
    const res = await listAll(listRef);

    if (res.items.length === 0) {
      throw new Error("No image found for this ticket");
    }

    const imageRef = res.items[0];
    const url = await getDownloadURL(imageRef);
    return { name: imageRef.name, url };
  } catch (error) {
    throw error;
  }
}