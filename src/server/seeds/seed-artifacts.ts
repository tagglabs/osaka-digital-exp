import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { ArtifactModel } from "../models/artifact.model.js";

// Load environment variables
dotenv.config();

const mockArtifact = {
  zoneName: "Historical Zone",
  nameOfArtifact: "Ancient Japanese Sword",
  briefDescription:
    "A beautifully preserved katana from the Edo period, showcasing exceptional craftsmanship and historical significance.",
  profilePicture: "/src/assets/image.jpg",
  sections: [
    {
      title: "Historical Context",
      content:
        "This sword dates back to the early Edo period (1603-1867), a time of peace in Japan when sword-making reached its artistic peak. Created by master swordsmiths, these weapons became symbols of power and artistic excellence.",
    },
    {
      title: "Craftsmanship",
      content:
        "The blade exhibits the distinctive hamon (tempering pattern) characteristic of traditionally made Japanese swords. The tsuka (handle) is wrapped in authentic ray skin and silk cord, while the tsuba (hand guard) features intricate designs depicting scenes from Japanese mythology.",
    },
    {
      title: "Cultural Significance",
      content:
        "Beyond its role as a weapon, this katana represents the samurai's code of bushido and the highly sophisticated culture of medieval Japan. Its preservation offers valuable insights into Japanese metallurgy and artistic traditions.",
    },
  ],
  uploads: [
    {
      fileURL: "/src/assets/image.jpg",
    },
    {
      fileURL: "/src/assets/image.jpg",
    },
  ],
  mediaGallery: {
    images: [
      {
        fileName: "image.jpg",
        fileSize: 1024,
      },
      {
        fileName: "image.jpg",
        fileSize: 1024,
      },
      {
        fileName: "image.jpg",
        fileSize: 1024,
      },
    ],
    videos: [
      {
        fileName: "demo-video.mp4",
        fileSize: 5120,
      },
    ],
  },
  url: "ancient-japanese-sword",
};

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://127.0.0.1:27017/artifacts-db",
    );
    console.log("Connected to MongoDB");

    // Clear existing artifacts
    await ArtifactModel.deleteMany({});
    console.log("Cleared existing artifacts");

    // Insert mock artifact
    const artifact = await ArtifactModel.create(
      mockArtifact,
    );
    console.log("Created artifact:", artifact._id);

    console.log("Database seeding completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase();
