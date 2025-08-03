import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
    try {
        
        const { title, caption, rating, image } = req.body;
        if (!image || !title || !caption || !rating) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }

        // upload image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url;

        // save book to database
        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id // Attach the authenticated user's ID
        });
        await newBook.save();
        res.status(201).json({ message: "Book added successfully", book: newBook });

    } catch (error) {
        console.error("Error creating book:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
//pagination= infinite scroll
// const response=await fetch("http://localhost:3001/api/books?page=2&limit=5");

router.get("/", protectRoute, async (req, res) => {
    try {
        const page=req.query.page || 1; 
        const limit=req.query.limit || 5;
        constskip=(page-1)*limit; 
        const books = await Book.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "username profileImage") // Populate user details
        
        res.send({
            books,
            currentPage: page,
            totalBooks: await Book.countDocuments(),
            totalBooksPages: Math.ceil(await Book.countDocuments() / limit)
        });
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
//get reccommended books
router.get("/recommended", protectRoute, async (req, res) => {
    try {
        const books = await Book.find({user: req.user._id}).sort({ createdAt: -1 });
        res.json(books);
        
    } catch (error) {
        console.log("Error fetching recommended books:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.delete("/:id", protectRoute, async (req, res) => {
    try {
  
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        //check if user is the creator of the book
        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this book" });
            
        }
        // delete image from cloudinary
        if (book.image && book.image.includes("cloudinary")) {
            try {
                const publicId = book.image.split("/").pop().split(".")[0]; // Extract public ID from URL
                await cloudinary.uploader.destroy(publicId);
                
            } catch (deleteError) {
                console.log("Error deleting image from Cloudinary:", deleteError);
                
            }

        }
        await Book.deleteOne();
        res.json({ message: "Book deleted successfully" });
    } catch (error) {
        
    }
})
export default router;