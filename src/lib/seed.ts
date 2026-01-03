
'use server';
// This is a standalone script to seed the database.
// To run, use: npm run seed

import { initializeFirebase } from '@/firebase';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, where, limit, getDocs, setDoc, doc, writeBatch, serverTimestamp } from 'firebase/firestore';

const adminUsers = [
    { email: 'super@eventide.app', role: 'Super Admin', firstName: 'Super', lastName: 'Admin' },
    { email: 'user.admin@eventide.app', role: 'User Admin', firstName: 'User', lastName: 'Admin' },
    { email: 'content.admin@eventide.app', role: 'Content Admin', firstName: 'Content', lastName: 'Admin' },
    { email: 'editorial.admin@eventide.app', role: 'Editorial Admin', firstName: 'Editorial', lastName: 'Admin' },
];

const sampleMagazineIssues = [
    {
        title: "The Art of the Gathering",
        introduction: "Welcome to our October issue, where we explore the intricate beauty of human connection and the spaces we create to foster it.",
        eventSummaries: [
            { eventName: "Lagos Fashion Week Gala", summary: "A night of glamour and cutting-edge design, the gala set a new standard for style in the city." },
            { eventName: "Abuja Tech Innovators Meetup", summary: "The brightest minds in Nigerian tech came together to share ideas that will shape the future." }
        ],
        advertisement: {
            concept: "A seamless transition from a planner's digital mood board to a stunning real-life event.",
            product: "AI-Powered Mood Board"
        },
        status: "published" as const,
        publishedAt: new Date('2024-10-01T10:00:00Z'),
    },
    {
        title: "Aso-Ebi & Allegiance",
        introduction: "This issue delves into the cultural threads that bind us, celebrating the color, tradition, and community spirit of Nigerian ceremonies.",
        eventSummaries: [
            { eventName: "The Adeleke-Johnson Wedding", summary: "A breathtaking union of two prominent families, showcasing the best of Yoruba tradition." },
            { eventName: "The Rivers Cultural Festival", summary: "A vibrant display of dance, music, and artistry from the heart of the Niger Delta." }
        ],
        advertisement: {
            concept: "Finding the perfect designer for your big day should be a joy, not a hassle.",
            product: "EvenTide Fashion Hub"
        },
        status: "published" as const,
        publishedAt: new Date('2024-09-01T10:00:00Z'),
    }
];

const seedPricePlansData = [
    {
        name: "Free",
        price: 0,
        description: "For small, intimate gatherings and personal events.",
        maxGuests: 20,
        plannerLimit: 0,
        cohostLimit: 2,
        securityPersonnelLimit: 0,
        features: ["Digital Invitations", "QR Code Gate Passes"],
        isPopular: false,
    },
    {
        name: "Standard",
        price: 45000,
        description: "Ideal for weddings, birthdays, and corporate events.",
        maxGuests: 150,
        plannerLimit: 1,
        cohostLimit: 4,
        securityPersonnelLimit: 2,
        features: ["Guest Management", "Team Collaboration"],
        isPopular: false,
    },
    {
        name: "Gold",
        price: 80000,
        description: "For larger events and professional planners.",
        maxGuests: 300,
        plannerLimit: 1,
        cohostLimit: 8,
        securityPersonnelLimit: 4,
        features: ["Advanced Analytics", "Budget Tracking"],
        isPopular: true,
    },
    {
        name: "Platinum",
        price: 120000,
        description: "The ultimate package for grand occasions.",
        maxGuests: 500,
        plannerLimit: 1,
        cohostLimit: 16,
        securityPersonnelLimit: 8,
        features: ["Priority Support", "AI-Powered Tools"],
        isPopular: false,
    },
    {
        name: "Festival",
        price: 200000,
        description: "Engineered for large-scale public events.",
        maxGuests: 1000,
        plannerLimit: 1,
        cohostLimit: 99, // Essentially unlimited
        securityPersonnelLimit: 16,
        features: ["Public Ticket Sales", "Vendor Marketplace"],
        isPopular: false,
    },
];

async function seedAdminUsers(auth: any, firestore: any) {
  const defaultPassword = 'password123';
  const usersCollection = collection(firestore, "users");

  for (const admin of adminUsers) {
    const userQuery = query(usersCollection, where('email', '==', admin.email), limit(1));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, admin.email, defaultPassword);
        const user = userCredential.user;
        const userDocRef = doc(firestore, "users", user.uid);
        await setDoc(userDocRef, {
          id: user.uid,
          email: admin.email,
          role: admin.role,
          firstName: admin.firstName,
          lastName: admin.lastName,
          createdAt: serverTimestamp(),
        });
        console.log(`✅ Created admin user: ${admin.email}`);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            console.log(`🟡 Admin user ${admin.email} already exists in Auth. Skipping creation.`);
        } else {
            console.error(`❌ Error seeding admin user ${admin.email}:`, error);
        }
      }
    } else {
        console.log(`⚪ Admin user ${admin.email} already exists in Firestore. Skipping.`);
    }
  }
}

async function seedMagazineIssues(firestore: any) {
    const issuesCollection = collection(firestore, "magazineIssues");
    const snapshot = await getDocs(query(issuesCollection, limit(1)));
    
    if (snapshot.empty) {
        console.log("No magazine issues found. Seeding database...");
        const batch = writeBatch(firestore);
        sampleMagazineIssues.forEach(issue => {
            const docRef = doc(issuesCollection);
            batch.set(docRef, { ...issue, createdAt: serverTimestamp() });
        });
        await batch.commit();
        console.log("✅ Magazine issues seeded successfully.");
    } else {
        console.log("⚪ Magazine issues already exist. Skipping.");
    }
}

async function seedPricePlans(firestore: any) {
    const plansCollection = collection(firestore, "price_plans");
    const snapshot = await getDocs(query(plansCollection, limit(1)));
    if (snapshot.empty) {
        console.log("No pricing plans found. Seeding database...");
        const batch = writeBatch(firestore);
        seedPricePlansData.forEach(plan => {
          const docRef = doc(plansCollection);
          batch.set(docRef, plan);
        });
        await batch.commit();
        console.log("✅ Pricing plans seeded successfully.");
    } else {
        console.log("⚪ Pricing plans already exist. Skipping.");
    }
}

async function seedDatabase() {
    console.log("🌱 Starting database seeding process...");
    // We need to initialize a new app here for the script
    const { auth, firestore } = initializeFirebase();
    
    await seedAdminUsers(auth, firestore);
    await seedMagazineIssues(firestore);
    await seedPricePlans(firestore);

    console.log("✨ Seeding process complete.");
    // In a standalone script, we might need to explicitly exit
    // but since tsx handles it, we can just let it finish.
    // process.exit(0);
}

seedDatabase().catch((error) => {
    console.error("💀 Seeding failed:", error);
    process.exit(1);
});
