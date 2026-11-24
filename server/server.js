import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Book from "./src/models/Book.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ message: "Library API is running" }));
app.get("/api/books", async (req, res) => {
  try {
    const q = req.query.q || "";
    const books = await Book.find({
      $or: [{ title: { $regex: q, $options: "i" } }, { author: { $regex: q, $options: "i" } }]
    }).sort({ createdAt: -1 });
    res.json(books);
  } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post("/api/books", async (req, res) => {
  try {
    const { title, author, isbn, totalCopies } = req.body;
    if (!title || !author) return res.status(400).json({ message: "Title and author are required" });
    const book = await Book.create({ title, author, isbn, totalCopies: Number(totalCopies) || 1, availableCopies: Number(totalCopies) || 1 });
    res.status(201).json(book);
  } catch (e) { res.status(400).json({ message: e.message }); }
});
app.put("/api/books/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (e) { res.status(400).json({ message: e.message }); }
});
app.delete("/api/books/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Book deleted" });
  } catch (e) { res.status(400).json({ message: e.message }); }
});
app.patch("/api/books/:id/issue", async (req, res) => {
  try {
    const book = await Book.findOneAndUpdate(
      { _id: req.params.id, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } }, { new: true }
    );
    if (!book) return res.status(400).json({ message: "No copies available" });
    res.json(book);
  } catch (e) { res.status(400).json({ message: e.message }); }
});
app.patch("/api/books/:id/return", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.availableCopies >= book.totalCopies) return res.status(400).json({ message: "All copies are already in the library" });
    book.availableCopies += 1;
    await book.save();
    res.json(book);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/library_management")
  .then(() => app.listen(PORT, () => console.log(`Library API: http://localhost:${PORT}`)))
  .catch(err => { console.error("MongoDB connection failed:", err.message); process.exit(1); });
