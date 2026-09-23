import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { products } from '@/data/products';

export async function GET() {
  try {
    const productsRef = collection(db, 'products');
    let count = 0;
    
    for (const product of products) {
      // Use the existing ID as the document ID
      const docRef = doc(productsRef, product.id);
      
      // Add a few extra fields for the admin side
      const dataToSave = {
        ...product,
        isAvailable: true,
        stock: 50, // default mock stock
        createdAt: new Date().toISOString()
      };
      
      await setDoc(docRef, dataToSave);
      count++;
    }
    
    return NextResponse.json({ success: true, message: `Migrated ${count} products to Firestore successfully.` });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
