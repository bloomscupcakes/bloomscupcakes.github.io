/* Configuration file for our cupcake shop */

/* Google Analytics and Ads tracking configuration */
const TRACKING_CONFIG = {
  GA_MEASUREMENT_ID: import.meta.env.VITE_GA_MEASUREMENT_ID || "G-QJC1ND04KX",
  ADS_ID: import.meta.env.VITE_ADS_ID || "AW-18083128218",
  // You can add conversion labels here later
  CONVERSION_LABELS: {
    // PURCHASE: "AW-18083128218/AbC-XYZ_123",
    // LEAD: "AW-18083128218/LeadLabel_456",
  }
};

/* Our packs */
import classicPack6 from "../assets/six_pack_classic.jpeg";
import floralPack6 from "../gallery/pack_of_6.jpeg";
import floralPack12 from "../gallery/midnight_packof12.jpeg";
import floralPack24 from "../gallery/baby_shower24.jpeg";
import bouqet22Pack from "../gallery/bouquet22.jpeg";

const PRODUCTS = [
  { 
    id: "floral", 
    title: "Floral Cupcakes", 
    packSizes: [
      { name: "4 Pack", price: 20, img: floralPack6 },
      { name: "6 Pack", price: 30, img: floralPack6 },
      { name: "12 Pack", price: 60, img: floralPack12 },
      { name: "24 Pack", price: 120, img: floralPack24 }
    ]
  },
  { 
    id: "bouquet", 
    title: "Cupcake Bouquet", 
    packSizes: [
      { name: "7 Pack", price: 50, img: bouqet22Pack },
      { name: "12 Pack", price: 100, img: bouqet22Pack },
      { name: "14 Pack", price: 120, img: bouqet22Pack },
      { name: "19 Pack", price: 200, img: bouqet22Pack },
      { name: "24 Pack", price: 250, img: bouqet22Pack },
      { name: "30 Pack", price: 350, img: bouqet22Pack },
      { name: "40 Pack", price: 510, img: bouqet22Pack },
    ]
  },
  { 
    id: "classic", 
    title: "Classic Cupcakes", 
    packSizes: [
      { name: "4 Pack", price: 15, img: classicPack6 },
      { name: "6 Pack", price: 20, img: classicPack6 },
      { name: "12 Pack", price: 36, img: classicPack6 },
      { name: "24 Pack", price: 72, img: classicPack6 }
    ]
  }
];

const FLAVOURS = [
  { label: "Vanilla", extra: 0 },
  { label: "Chocolate", extra: 0 },
  { label: "Red Velvet", extra: 0 },
];

/* Our reviews */
const reviews = [
  {
    name: "Sueda M.",
    text: "The Cupcakes look so beautiful I almost didn’t want to eat them.",
  },
  {
    name: "James K.",
    text: "Ordered for a birthday — everyone loved them!",
  },
  {
    name: "Emily R.",
    text: "So cute and tasty. You can tell they’re made with love 🧁",
  },
];


const contactInfo = [
  {
    type: "instagram",
    title: "Instagram",
    value: "@bloomscupcakes.ca",
    link: "https://www.instagram.com/bloomscupcakes.ca",
    external: true,
  },
  {
    type: "email",
    title: "Email",
    value: "bloomscupcakes@gmail.com",
    link: "mailto:bloomscupcakes@gmail.com",
  },
  {
    type: "phone",
    title: "Phone",
    value: "(343) 987-9593",
    link: "tel:3439879593",
  },
];

export { TRACKING_CONFIG, PRODUCTS, FLAVOURS, reviews, contactInfo };
