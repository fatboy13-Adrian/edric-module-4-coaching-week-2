// app.js - Server entry point (root directory)
const app = require("./src/app");
const port = process.env.PORT || 3000;

// Start the server
app
  .listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Database connection configured to: ${process.env.DB_HOST}`);
  })
  .on("error", (err) => {
    console.error("Server error:", err);
    process.exit(1);
  });
