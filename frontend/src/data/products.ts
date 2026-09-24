export type Product = {
  id: string;
  name: string;
  botanicalName: string;
  price: number;
  originalPrice?: number;
  discount: number;
  rating: number;
  reviews: number;
  image: string;
  gallery?: string[];
  badges: string[];
  lightRequirements: string;
  wateringFrequency: string;
  petSafe: boolean;
  category: string;
  recommendedCareIds?: string[];
};

// Top 20 Kolkata Indoor Plants + Extracted Care Products
export const products: Product[] = [
  // --- INDOOR PLANTS ---
  {
    id: "p1",
    name: "Money Plant / Golden Pothos",
    botanicalName: "Epipremnum aureum",
    price: 349,
    originalPrice: 499,
    discount: 30,
    rating: 4.9,
    reviews: 1245,
    image: "https://images.pexels.com/photos/14534666/pexels-photo-14534666.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    gallery: ["https://images.pexels.com/photos/14534666/pexels-photo-14534666.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/9094126/pexels-photo-9094126.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/16982988/pexels-photo-16982988.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/7663968/pexels-photo-7663968.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"], // Generic placeholder
    badges: ["Bestseller", "Air Purifying"],
    lightRequirements: "Low to Bright Indirect",
    wateringFrequency: "Weekly",
    petSafe: false,
    category: "Air Purifying",
    recommendedCareIds: ["c1", "c5", "c7", "c8", "c9"]
  },
  {
    id: "p2",
    name: "Snake Plant Laurentii",
    botanicalName: "Sansevieria trifasciata",
    price: 499,
    originalPrice: 650,
    discount: 23,
    rating: 4.8,
    reviews: 980,
    image: "https://images.pexels.com/photos/29218657/pexels-photo-29218657.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    gallery: ["https://images.pexels.com/photos/29218657/pexels-photo-29218657.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/6279940/pexels-photo-6279940.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/10467813/pexels-photo-10467813.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/9412363/pexels-photo-9412363.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"],
    badges: ["Low Light", "NASA Purifier"],
    lightRequirements: "Low to Direct Sun",
    wateringFrequency: "Fortnightly",
    petSafe: false,
    category: "Low Light Tolerant",
    recommendedCareIds: ["c2", "c6", "c8", "c10"]
  },
  {
    id: "p3",
    name: "Peace Lily",
    botanicalName: "Spathiphyllum wallisii",
    price: 599,
    originalPrice: 750,
    discount: 20,
    rating: 4.7,
    reviews: 654,
    image: "https://images.pexels.com/photos/32425127/pexels-photo-32425127.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    gallery: ["https://images.pexels.com/photos/32425127/pexels-photo-32425127.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/4751967/pexels-photo-4751967.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/9731992/pexels-photo-9731992.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/32425126/pexels-photo-32425126.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"],
    badges: ["Flowering"],
    lightRequirements: "Low to Medium Indirect",
    wateringFrequency: "Twice a week",
    petSafe: false,
    category: "Low Light Tolerant",
    recommendedCareIds: ["c3", "c7", "c5", "c11", "c9"]
  },
  {
    id: "p4",
    name: "Areca Palm XL",
    botanicalName: "Dypsis lutescens",
    price: 1299,
    originalPrice: 1599,
    discount: 18,
    rating: 4.6,
    reviews: 320,
    image: "https://images.pexels.com/photos/3126442/pexels-photo-3126442.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    gallery: ["https://images.pexels.com/photos/3126442/pexels-photo-3126442.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/12982687/pexels-photo-12982687.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/18063065/pexels-photo-18063065.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/7645577/pexels-photo-7645577.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"],
    badges: ["Statement Plant"],
    lightRequirements: "Bright Indirect",
    wateringFrequency: "Weekly",
    petSafe: true,
    category: "Pet-Safe Sanctuaries",
    recommendedCareIds: ["c3", "c7", "c8", "c9"]
  },
  {
    id: "p5",
    name: "Lucky Bamboo (3-Layer)",
    botanicalName: "Dracaena sanderiana",
    price: 399,
    originalPrice: 499,
    discount: 20,
    rating: 4.8,
    reviews: 2100,
    image: "https://images.pexels.com/photos/7352303/pexels-photo-7352303.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    gallery: ["https://images.pexels.com/photos/7352303/pexels-photo-7352303.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/18389256/pexels-photo-18389256.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/30384226/pexels-photo-30384226.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/32747714/pexels-photo-32747714.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"],
    badges: ["Gifting Favorite"],
    lightRequirements: "Low to Medium Indirect",
    wateringFrequency: "Weekly (Change Water)",
    petSafe: false,
    category: "Low Light Tolerant",
    recommendedCareIds: ["c12"] // Liquid fertilizer
  },
  {
    id: "p6",
    name: "Aglaonema Red Beauty",
    botanicalName: "Aglaonema commutatum",
    price: 799,
    originalPrice: 999,
    discount: 20,
    rating: 4.9,
    reviews: 412,
    image: "https://images.pexels.com/photos/11121423/pexels-photo-11121423.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    gallery: ["https://images.pexels.com/photos/11121423/pexels-photo-11121423.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/4751964/pexels-photo-4751964.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/9311882/pexels-photo-9311882.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/4589185/pexels-photo-4589185.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"],
    badges: ["Rare Foliage"],
    lightRequirements: "Low to Bright Indirect",
    wateringFrequency: "Weekly",
    petSafe: false,
    category: "Low Light Tolerant",
    recommendedCareIds: ["c4", "c5", "c7", "c9"]
  },
  {
    id: "p7",
    name: "Spider Plant",
    botanicalName: "Chlorophytum comosum",
    price: 249,
    originalPrice: 350,
    discount: 28,
    rating: 4.8,
    reviews: 512,
    image: "https://images.pexels.com/photos/36314009/pexels-photo-36314009.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    gallery: ["https://images.pexels.com/photos/36314009/pexels-photo-36314009.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/34681349/pexels-photo-34681349.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/11363534/pexels-photo-11363534.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/15202816/pexels-photo-15202816.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"],
    badges: ["Pet Safe \uD83D\uDC3E"],
    lightRequirements: "Bright Indirect",
    wateringFrequency: "Weekly",
    petSafe: true,
    category: "Pet-Safe Sanctuaries",
    recommendedCareIds: ["c3", "c7"]
  },
  {
    id: "p8",
    name: "ZZ Plant",
    botanicalName: "Zamioculcas zamiifolia",
    price: 649,
    originalPrice: 850,
    discount: 23,
    rating: 4.9,
    reviews: 740,
    image: "https://images.pexels.com/photos/3952024/pexels-photo-3952024.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    gallery: ["https://images.pexels.com/photos/3952024/pexels-photo-3952024.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/10651639/pexels-photo-10651639.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/824572/pexels-photo-824572.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/3747079/pexels-photo-3747079.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"],
    badges: ["Hard to Kill"],
    lightRequirements: "Low Light to Bright Indirect",
    wateringFrequency: "Fortnightly",
    petSafe: false,
    category: "Low Light Tolerant",
    recommendedCareIds: ["c2", "c6", "c8"]
  },
  {
    id: "p9",
    name: "Monstera Deliciosa",
    botanicalName: "Monstera deliciosa",
    price: 1199,
    originalPrice: 1499,
    discount: 20,
    rating: 4.8,
    reviews: 620,
    image: "https://images.pexels.com/photos/5352687/pexels-photo-5352687.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    gallery: ["https://images.pexels.com/photos/5352687/pexels-photo-5352687.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/36477236/pexels-photo-36477236.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/37675827/pexels-photo-37675827.jpeg?auto=compress&cs=tinysrgb&h=650&w=940","https://images.pexels.com/photos/36881511/pexels-photo-36881511.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"],
    badges: ["Instagram Favorite"],
    lightRequirements: "Bright Indirect",
    wateringFrequency: "Weekly",
    petSafe: false,
    category: "Monsteras & Aroids",
    recommendedCareIds: ["c4", "c8", "c9", "c10"]
  },
  {
    id: "p10",
    name: "Ficus Lyrata (Fiddle Leaf)",
    botanicalName: "Ficus lyrata",
    price: 2299,
    originalPrice: 2999,
    discount: 23,
    rating: 4.8,
    reviews: 120,
    image: "https://images.pexels.com/photos/15191694/pexels-photo-15191694.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    gallery: [
      "https://images.pexels.com/photos/15191694/pexels-photo-15191694.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/7084324/pexels-photo-7084324.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/6208093/pexels-photo-6208093.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/22610783/pexels-photo-22610783.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
    ],
    badges: ["Showstopper", "Statement Plant"],
    lightRequirements: "Bright Direct",
    wateringFrequency: "Moderate",
    petSafe: false,
    category: "Indoor Plants",
    recommendedCareIds: ["c1", "c2", "c12"]
  },

  // --- PLANT CARE & SOIL ---
  
  // Soils & Media
  {
    id: "c1",
    name: "Money Plant Potting Mix",
    botanicalName: "Cocopeat, Perlite, Vermicompost, Garden Soil",
    price: 249,
    originalPrice: 299,
    discount: 16,
    rating: 4.8,
    reviews: 142,
    image: "/care/potting_mix.jpg",
    gallery: ["/care/potting_mix.jpg"],
    badges: ["Bestseller"],
    lightRequirements: "N/A",
    wateringFrequency: "N/A",
    petSafe: true,
    category: "Care & Soil"
  },
  {
    id: "c2",
    name: "Succulent & Snake Plant Mix",
    botanicalName: "Garden soil, Cocopeat, Perlite, Coarse sand",
    price: 299,
    originalPrice: 349,
    discount: 14,
    rating: 4.9,
    reviews: 89,
    image: "/care/succulent_mix.jpg",
    gallery: ["/care/succulent_mix.jpg"],
    badges: ["Fast Draining"],
    lightRequirements: "N/A",
    wateringFrequency: "N/A",
    petSafe: true,
    category: "Care & Soil"
  },
  {
    id: "c3",
    name: "Universal Indoor Potting Mix",
    botanicalName: "Ideal for Peace Lily, Areca Palm, Spider Plant",
    price: 279,
    originalPrice: 350,
    discount: 20,
    rating: 4.7,
    reviews: 310,
    image: "/care/potting_mix.jpg",
    badges: ["Organic"],
    lightRequirements: "N/A",
    wateringFrequency: "N/A",
    petSafe: true,
    category: "Care & Soil"
  },
  {
    id: "c4",
    name: "Premium Aroid Mix",
    botanicalName: "Cocopeat, Perlite, Orchid bark, Charcoal, Vermicompost",
    price: 499,
    originalPrice: 599,
    discount: 16,
    rating: 5.0,
    reviews: 120,
    image: "/care/potting_mix.jpg",
    badges: ["Chunky Mix"],
    lightRequirements: "N/A",
    wateringFrequency: "N/A",
    petSafe: true,
    category: "Care & Soil"
  },
  
  // Fertilizers
  {
    id: "c5",
    name: "NPK 19:19:19 Water Soluble",
    botanicalName: "Balanced Fertilizer for Pothos, Aglaonema",
    price: 199,
    originalPrice: 250,
    discount: 20,
    rating: 4.8,
    reviews: 450,
    image: "https://images.pexels.com/photos/4099351/pexels-photo-4099351.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    badges: ["Essential Nutrition"],
    lightRequirements: "N/A",
    wateringFrequency: "N/A",
    petSafe: false,
    category: "Care & Soil"
  },
  {
    id: "c12",
    name: "Indoor Plant Liquid Fertilizer",
    botanicalName: "Ready-to-use drops for Bamboo & Water plants",
    price: 149,
    originalPrice: 199,
    discount: 25,
    rating: 4.7,
    reviews: 320,
    image: "/care/liquid_fertilizer.jpg",
    badges: ["Beginner Friendly"],
    lightRequirements: "N/A",
    wateringFrequency: "N/A",
    petSafe: true,
    category: "Care & Soil"
  },
  {
    id: "c6",
    name: "Organic Vermicompost",
    botanicalName: "1kg Earthworm Castings",
    price: 149,
    originalPrice: 199,
    discount: 25,
    rating: 4.9,
    reviews: 800,
    image: "https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    badges: ["100% Organic"],
    lightRequirements: "N/A",
    wateringFrequency: "N/A",
    petSafe: true,
    category: "Care & Soil"
  },
  {
    id: "c7",
    name: "Liquid Seaweed Extract",
    botanicalName: "Organic Biostimulant",
    price: 299,
    originalPrice: 399,
    discount: 25,
    rating: 4.8,
    reviews: 210,
    image: "https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    badges: ["Growth Booster"],
    lightRequirements: "N/A",
    wateringFrequency: "N/A",
    petSafe: true,
    category: "Care & Soil"
  },

  // Pest & Disease Control
  {
    id: "c8",
    name: "Neem Cake / Neem Khali",
    botanicalName: "Organic soil amendment & pest deterrence",
    price: 199,
    originalPrice: 249,
    discount: 20,
    rating: 4.7,
    reviews: 180,
    image: "https://images.pexels.com/photos/1084540/pexels-photo-1084540.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    badges: ["Pest Deterrent"],
    lightRequirements: "N/A",
    wateringFrequency: "N/A",
    petSafe: true,
    category: "Care & Soil"
  },
  {
    id: "c9",
    name: "Neem Oil 300 PPM Spray",
    botanicalName: "Ready-to-use Pest Repellent",
    price: 249,
    originalPrice: 300,
    discount: 17,
    rating: 4.6,
    reviews: 340,
    image: "https://images.pexels.com/photos/4505161/pexels-photo-4505161.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    badges: ["Beginner Safe"],
    lightRequirements: "N/A",
    wateringFrequency: "N/A",
    petSafe: true,
    category: "Care & Soil"
  },
  {
    id: "c10",
    name: "Perlite & Vermiculite Blend",
    botanicalName: "1kg Aeration Mix",
    price: 299,
    originalPrice: 399,
    discount: 25,
    rating: 4.9,
    reviews: 120,
    image: "https://images.pexels.com/photos/808521/pexels-photo-808521.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    badges: ["Drainage Essential"],
    lightRequirements: "N/A",
    wateringFrequency: "N/A",
    petSafe: true,
    category: "Care & Soil"
  },
  {
    id: "c11",
    name: "SAAF Fungicide",
    botanicalName: "Systemic and Contact Fungicide",
    price: 150,
    originalPrice: 180,
    discount: 16,
    rating: 4.7,
    reviews: 215,
    image: "https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    badges: ["Disease Control"],
    lightRequirements: "N/A",
    wateringFrequency: "N/A",
    petSafe: false,
    category: "Care & Soil"
  }
];

export async function searchProducts(query: string): Promise<Product[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!query.trim()) {
        resolve([]);
        return;
      }
      const lowerQuery = query.toLowerCase();
      const results = products.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        p.botanicalName.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
      );
      resolve(results.slice(0, 5));
    }, 300);
  });
}
