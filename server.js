const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(cors());
app.use(express.json());

let books = []; // store books in-memory for simplicity

// Send initial books to clients
io.on("connection", (socket) => {
  socket.emit("initialBooks", books);
});

// GET all books
app.get("/books", (req, res) => {
  res.json(books);
});

// ADD book
app.post("/books", (req, res) => {
  const { title, author } = req.body;
  const book = { id: uuidv4(), title, author };
  books.push(book);
  io.emit("bookAdded", book); // real-time notify all clients
  res.json(book);
});

// UPDATE book
app.put("/books/:id", (req, res) => {
  const { id } = req.params;
  const { title, author } = req.body;
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) return res.status(404).json({ error: "Book not found" });

  books[index] = { id, title, author };
  io.emit("bookUpdated", books[index]);
  res.json(books[index]);
});

// DELETE book
app.delete("/books/:id", (req, res) => {
  const { id } = req.params;
  books = books.filter((b) => b.id !== id);
  io.emit("bookDeleted", id);
  res.json({ id });
});

server.listen(5000, () => console.log("Server running on port 5000"));