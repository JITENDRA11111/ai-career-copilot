import {server} from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const { validateEnv } = await import("./config/index.js");
    validateEnv();
    
    await connectDB();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on ${PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
};

startServer();