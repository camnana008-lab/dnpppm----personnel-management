import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocFromServer,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { StaffProfile } from '../types';
import { Language } from '../translations';

const khmerToArabic = (str: string) => {
  const map: { [key: string]: string } = {
    '០': '0', '១': '1', '២': '2', '៣': '3', '៤': '4',
    '៥': '5', '៦': '6', '៧': '7', '៨': '8', '៩': '9'
  };
  return str.replace(/[០-៩]/g, (m) => map[m]);
};

export const useStaffData = (currentUserId: string | undefined, language: Language) => {
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Test connection
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, '_test_connection', 'ping'));
        setConnectionError(null);
      } catch (error: any) {
        if (error.message?.includes('the client is offline') || error.code === 'unavailable') {
          console.error("Firestore is offline or unreachable.");
          setConnectionError(language === 'kh' ? 'មិនអាចភ្ជាប់ទៅកាន់ម៉ាស៊ីនមេបានទេ សូមពិនិត្យមើលការតភ្ជាប់អ៊ីនធឺណិតរបស់អ្នក។' : 'Could not connect to the server. Please check your internet connection.');
        }
      }
    }
    testConnection();
  }, [language]);

  // Real-time Staff Data Listener
  useEffect(() => {
    if (!currentUserId) return;

    const staffCollection = collection(db, 'staff');
    const unsubscribe = onSnapshot(staffCollection, (snapshot) => {
      const staffData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StaffProfile[];
      setStaffList(staffData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'staff');
    });

    return () => unsubscribe();
  }, [currentUserId]);

  const handleSave = async (newData: StaffProfile, existingStaffId?: string) => {
    try {
      // Normalize staffId for comparison (Khmer to Arabic numerals)
      const normalizedStaffId = khmerToArabic(newData.staffId).trim();
      const normalizedDob = newData.dob.trim();

      // Check for duplicates (staffId + dob)
      const staffCollection = collection(db, 'staff');
      const q = query(
        staffCollection, 
        where('staffId', 'in', [newData.staffId, normalizedStaffId]),
        where('dob', '==', normalizedDob)
      );
      
      const querySnapshot = await getDocs(q);
      
      // If editing, exclude the current document from duplicate check
      const duplicate = querySnapshot.docs.find(doc => doc.id !== existingStaffId);
      
      if (duplicate) {
        const errorMsg = language === 'kh' 
          ? `លេខសម្គាល់មន្ត្រី "${newData.staffId}" និងថ្ងៃខែឆ្នាំកំណើតនេះមានរួចហើយក្នុងប្រព័ន្ធ!` 
          : `Staff ID "${newData.staffId}" with this Date of Birth already exists!`;
        
        const validationError = new Error(errorMsg);
        (validationError as any).isValidationError = true;
        throw validationError;
      }

      if (existingStaffId) {
        // Edit existing
        const staffDoc = doc(collection(db, 'staff'), existingStaffId);
        const { id, ...dataToUpdate } = newData;
        await updateDoc(staffDoc, dataToUpdate);
      } else {
        // Add new
        const { id, ...dataToSave } = newData;
        await addDoc(staffCollection, dataToSave);
      }
      return true;
    } catch (error: any) {
      if (error.isValidationError) {
        alert(error.message);
        return false;
      }
      handleFirestoreError(error, OperationType.WRITE, 'staff');
      return false;
    }
  };

  return {
    staffList,
    connectionError,
    handleSave,
  };
};
