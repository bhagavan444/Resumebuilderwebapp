const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://resume_user:ResumeApp123@cluster0.ybjlp61.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect(); // Connect to MongoDB
    await client.db("admin").command({ ping: 1 }); // Ping to verify
    console.log("✅ Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("❌ Connection error:", err.message);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
