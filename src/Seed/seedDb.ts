import mongoose from "mongoose";
import { Artifact, IArtifact } from "../server/models/Artifact.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

const dummyArtifacts: IArtifact[] = [
  {
    zoneName: "Ancient Egypt",
    artifactName: "Pharaoh's Mask",
    description: "A golden mask from the tomb of Pharaoh Tutankhamun.",
    profilePicture: "https://example.com/mask.jpg",
    sections: [
      {
        title: "Discovery",
        content: "The mask was discovered in 1922 in the Valley of the Kings.",
      },
    ],
    pdfs: ["https://example.com/pharaoh-mask.pdf"],
    mediaGallery: ["https://example.com/mask1.jpg"],
    externalURL: "https://museum.example.com/pharaoh-mask",
    createdAt: new Date(),
  },
  {
    zoneName: "Medieval Europe",
    artifactName: "Knight's Sword",
    description: "A steel sword used by knights during the 14th century.",
    profilePicture: "https://example.com/sword.jpg",
    sections: [
      {
        title: "History",
        content: "This sword belonged to a noble knight from England.",
      },
    ],
    pdfs: ["https://example.com/knight-sword.pdf"],
    mediaGallery: ["https://example.com/sword1.jpg"],
    externalURL: "https://museum.example.com/knight-sword",
    createdAt: new Date(),
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    await Artifact.deleteMany({}); // Clear existing data
    console.log("Old artifacts removed");

    await Artifact.insertMany(dummyArtifacts);
    console.log("Dummy artifacts added");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

seedDB();
