const express = require("express");
const app = express();
const path = require("path");
const db = require("./db");
const ejsMate = require("ejs-mate");

app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
  try {
    // Fetch counts from PostgreSQL
    const [bookResult, authorResult, publisherResult] = await Promise.all([
      db.one("SELECT COUNT(*) AS total_books FROM book"),
      db.one("SELECT COUNT(*) AS total_authors FROM author"),
      db.one("SELECT COUNT(*) AS total_publishers FROM publisher"),
    ]);

    // Extract values and convert to number
    const totalBooks = parseInt(bookResult.total_books, 10);
    const totalAuthors = parseInt(authorResult.total_authors, 10);
    const totalPublishers = parseInt(publisherResult.total_publishers, 10);

    res.render("home.ejs", {
      activePage: "home",
      totalBooks,
      totalAuthors,
      totalPublishers,
    });
  } catch (err) {
    console.error("Error fetching counts:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Get all books
app.get("/books", async (req, res) => {
  try {
    const books = await db.any(`
      SELECT
        book.isbn,
        book.title,
        book.year,
        book.price,
        publisher.name AS publisher,
        publisher.address AS publisher_address,
        publisher.phone AS publisher_phone
      FROM book
      LEFT JOIN publisher
        ON book.publisher_name = publisher.name
      ORDER BY book.title;
    `);
    res.render("books/show", { books, activePage: "books" });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).send("Internal Server Error");
  }
});

// new book(get)
app.get("/books/new", async (req, res) => {
  try {
    const authors = await db.any(
      "SELECT author_id, name FROM author ORDER BY name"
    );
    const publishers = await db.any("SELECT name FROM publisher ORDER BY name");

    res.render("books/new", { authors, publishers });
  } catch (error) {
    console.error("Error fetching authors/publishers:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/books", async (req, res, next) => {
  try {
    const { title, isbn, author_id, publisher_id, publication_year, price } =
      req.body.book;

    // Insert into the book table
    await db.none(
      `INSERT INTO book (title, isbn, author_id, publisher_id, year, price)
      VALUES ($1, $2, $3, $4, $5, $6)`,
      [title, isbn, author_id, publisher_id, publication_year, price]
    );

    // Insert into the bookauthor table
    await db.none(
      `INSERT INTO bookauthor (isbn, author_id)
      VALUES ($1, $2)`,
      [isbn, author_id]
    );

    res.redirect("/books");
  } catch (err) {
    console.error("Error inserting book:", err);
    next(err); // Pass error to middleware
  }
});

// show authors
app.get("/authors", async (req, res) => {
  try {
    const authors = await db.any("SELECT * FROM author ORDER BY author_id");
    res.render("authors/show", { authors, activePage: "authors" });
  } catch (error) {
    console.error("Error fetching authors:", error);
    res.status(500).send("Internal Server Error");
  }
});

// new authors(get)
app.get("/authors/new", (req, res) => {
  res.render("authors/new");
});

// new author(post)
app.post("/authors", async (req, res) => {
  try {
    const { name, url, address } = req.body.author;

    // Generate a new author_id
    const newId = await db.one(
      "SELECT COALESCE(MAX(author_id), 0) + 1 AS next_id FROM author"
    );

    await db.none(
      "INSERT INTO author (author_id, name, url, address) VALUES ($1, $2, $3, $4)",
      [newId.next_id, name, url, address]
    );

    res.redirect("/authors");
  } catch (error) {
    console.error("Error adding author:", error);
    res.status(500).send("Internal Server Error");
  }
});

// show publishers
app.get("/publishers", async (req, res) => {
  try {
    const publishers = await db.any("SELECT * FROM publisher ORDER BY name");
    res.render("publishers/show", { publishers, activePage: "publishers" });
  } catch (error) {
    console.error("Error fetching publishers:", error);
    res.status(500).send("Internal Server Error");
  }
});

// add publisher(get)
app.get("/publishers/new", (req, res) => {
  res.render("publishers/new");
});

// add publisher(post)
app.post("/publishers", async (req, res) => {
  try {
    const { name, address, url, phone } = req.body.publisher;

    await db.none(
      "INSERT INTO publisher (name, address, url, phone) VALUES ($1, $2, $3, $4)",
      [name, address, url, phone]
    );

    console.log("Publisher added successfully!");
    res.redirect("/publishers");
  } catch (error) {
    console.error("Error adding publisher:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(8080, () => {
  console.log("app is listening on port 8080");
});
