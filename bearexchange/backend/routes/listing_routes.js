// backend/src/routes/listing_routes.js

const express = require("express");
const router = express.Router();

const {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
} = require("../listings/listing");

// ==============================
// POST /listings
// Body: { userId, categoryId, title, description, price }
// ==============================
router.post("/", async (req, res) => {
  try {
    const { userId, categoryId, title, description, price } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ error: "userId and title are required." });
    }

    const result = await createListing({
      userId,
      categoryId,
      title,
      description,
      price,
    });

    return res.status(201).json({
      message: "Listing created.",
      listingId: result.listingId,
    });
  } catch (err) {
    console.error("Error in POST /listings:", err.message);
    return res.status(500).json({ error: "Failed to create listing." });
  }
});

// ==============================
// GET /listings
// Optional query params: ?categoryId=&search=
// ==============================
router.get("/", async (req, res) => {
  try {
    const { categoryId, search } = req.query;
    const listings = await getAllListings({ categoryId, search });

    return res.json(listings);
  } catch (err) {
    console.error("Error in GET /listings:", err.message);
    return res.status(500).json({ error: "Failed to fetch listings." });
  }
});

// ==============================
// GET /listings/:id
// ==============================
router.get("/:id", async (req, res) => {
  try {
    const listingId = parseInt(req.params.id, 10);
    if (Number.isNaN(listingId)) {
      return res.status(400).json({ error: "Invalid listing id." });
    }

    const listing = await getListingById(listingId);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found." });
    }

    return res.json(listing);
  } catch (err) {
    console.error("Error in GET /listings/:id:", err.message);
    return res.status(500).json({ error: "Failed to fetch listing." });
  }
});

// ==============================
// PUT /listings/:id
// Body: any of { title, description, price, status, categoryId }
// ==============================
router.put("/:id", async (req, res) => {
  try {
    const listingId = parseInt(req.params.id, 10);
    if (Number.isNaN(listingId)) {
      return res.status(400).json({ error: "Invalid listing id." });
    }

    const updateData = req.body;
    const result = await updateListing(listingId, updateData);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Listing not found or no changes." });
    }

    return res.json({ message: "Listing updated." });
  } catch (err) {
    console.error("Error in PUT /listings/:id:", err.message);
    return res.status(500).json({ error: "Failed to update listing." });
  }
});

// ==============================
// DELETE /listings/:id
// ==============================
router.delete("/:id", async (req, res) => {
  try {
    const listingId = parseInt(req.params.id, 10);
    if (Number.isNaN(listingId)) {
      return res.status(400).json({ error: "Invalid listing id." });
    }

    const result = await deleteListing(listingId);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Listing not found." });
    }

    return res.json({ message: "Listing deleted." });
  } catch (err) {
    console.error("Error in DELETE /listings/:id:", err.message);
    return res.status(500).json({ error: "Failed to delete listing." });
  }
});

module.exports = router;
