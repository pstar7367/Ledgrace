import mongoose from "mongoose";
import dns from "dns";

const connectDb = async () => {
  try {
    console.log("Connecting to MongoDB...");
    console.log("URI:", process.env.MONGODB_URI);

    const dnsServers = process.env.DNS_SERVERS
      ? process.env.DNS_SERVERS.split(",").map((server) => server.trim())
      : ["8.8.8.8", "8.8.4.4"];

    if (dnsServers.length > 0) {
      dns.setServers(dnsServers);
      console.log("Using DNS servers:", dnsServers);
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 60000,
      retryWrites: true,
      w: "majority",
    });

    console.log("✅ Connected!");
    console.log(conn.connection.host);
  } catch (err) {
    console.error("========== MONGODB ERROR ==========");
    console.error(err);
    console.error("==================================");
    console.warn("MongoDB connection failed. Continuing without a database connection for now.");
  }
};

export default connectDb;