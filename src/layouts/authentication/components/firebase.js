
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, addDoc, query, getDocs, setDoc, doc } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  
};

const app = initializeApp(vbiConfig);

export const firebaseApp = app;
export const firebaseStorage = getStorage(app)
export const db = getFirestore(app);

export const addData = async (documentName, documentId, data) => {
  try {
    const docRef = await setDoc(doc(db, documentName,documentId), data)

    return `Thêm thành công. ID: ${documentId}`;
  } catch (error) {
    return 'Lỗi ' + error;
  }
};

export const getDayOfTime = (d1, d2) => {
  let ms1 = d1.getTime();
  let ms2 = d2.getTime();
  return Math.ceil((ms2 - ms1) / (24 * 60 * 60 * 1000));
};

export const getDocumentsWithCondition = async(documentName,condition)=> {
  const valueCondition = condition.reduce((totalCondition,currentValue)=>{
    return totalCondition + `, where("${condition.key}", "${condition.equal}", ${condition.value})`
  }, ''); 
  const q = query(collection(db, documentName), valueCondition);
  const querySnapshot = await getDocs(q);
  const docData = [];
  querySnapshot.forEach((doc) => {
    docData.push(doc.data());
  });
  return docData;
}

export const getDocuments = async(documentName)=> {
  const q = query(collection(db, documentName));
  const querySnapshot = await getDocs(q);
  const docData = [];
  querySnapshot.forEach((doc) => {
    docData.push(doc.data());
  });
  return docData;
}
export const convertDateTimeToString = (today)=> {
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
}