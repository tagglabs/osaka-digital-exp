import mongoose from "mongoose";
import {
  Artifact,
  IArtifact,
} from "../server/models/Artifact.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not defined in environment variables",
  );
}

const dummyArtifacts: IArtifact[] = [
  {
    zoneName: "Ancient Egypt",
    artifactName: "Pharaoh's Mask",
    description:
      "A golden mask from the tomb of Pharaoh Tutankhamun.",
    profilePicture:
      "https://media.istockphoto.com/id/483369699/photo/burial-mask-of-the-egyptian-pharaoh-tutankhamun.jpg?s=2048x2048&w=is&k=20&c=mGJD5PINfJnGItNZc9VoICWnvCJCs1G_jKYUrffQzQI=",
    sections: [
      {
        title: "Discovery",
        content:
          "The mask was discovered in 1922 in the Valley of the Kings.",
      },
    ],
    pdfs: [
      "https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf",
    ],
    mediaGallery: [
      "https://upload.wikimedia.org/wikipedia/commons/e/e5/Tuthankhamun_mask.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/c/c2/Tutankhamun%27s_burial_mask_2019-02-14.jpg",
    ],
    externalURL:
      "https://en.wikipedia.org/wiki/Mask_of_Tutankhamun",
    createdAt: new Date(),
  },
  {
    zoneName: "Medieval Europe",
    artifactName: "Knight's Sword",
    description:
      "A steel sword used by knights during the 14th century.",
    profilePicture:
      "https://images.unsplash.com/photo-1440711085503-89d8ec455791?q=80&w=1998&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    sections: [
      {
        title: "History",
        content:
          "This sword belonged to a noble knight from England.",
      },
    ],
    pdfs: [
      "https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf",
    ],
    mediaGallery: [
      "https://upload.wikimedia.org/wikipedia/commons/3/3c/Sword_from_the_Wallace_Collection.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/2/2d/Medieval_sword_vienna.jpg",
    ],
    externalURL:
      "https://en.wikipedia.org/wiki/Knightly_sword",
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
