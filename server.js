const express = require("express");
const app = express();
const path = require("path");
const mysql = require("mysql2");
const fileUpload = require("express-fileupload");
const port = 5455;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
// Set Ejs as the view engine
app.set("view engine", "ejs");
app.set("views", __dirname);
// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "z@R_useRn@m3",
    database: "wesome_gallery_app", // Corrected database name
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL: ", err);
        return;
    }
    console.log("Connected to MySQL");
});
// Serve style.css
app.get("/style.css", (req, res) => {
    res.sendFile(path.join(__dirname, "style.css"));
});
app.get("/", (req, res) => {
    // Fetch all images from the database
    db.query(
        "SELECT id, actualPic, picName, picDescription FROM gallery", // Include 'id' in the query
        (fetchErr, fetchedResults) => {
            if (fetchErr) {
                console.error("Error fetching images from the database: ", fetchErr);
                res.status(500).send("Error fetching images");
            } else {
                // Create an array to store image data
                const imageList = [];

                for (const row of fetchedResults) {
                    const imageUrl = `data:image/jpeg;base64,${row.actualPic.toString("base64")}`;
                    const imageName = row.picName;
                    const imageDescription = row.picDescription;
                    const imageId = row.id; // Include 'id'

                    imageList.push({
                        imageId, // Include 'id'
                        imageUrl,
                        imageName,
                        imageDescription,
                    });
                }

                res.render("index", { imageList }); // Pass imageList to the template
            }
        }
    );
});


app.post("/", (req, res) => {
    // Extract data from the form
    const { picName, picDescription } = req.body;
    const actualPic = req.files.actualPic; // use express-file upload

    // Insert data to the db
    db.query(
        "INSERT INTO gallery (actualPic, picName, picDescription) VALUES (?, ?, ?)",
        [actualPic.data, picName, picDescription], // actualPic needs to use binary data
        (err, results) => {
            if (err) {
                console.error("Error inserting your stuff into the gallery database: ", err);
                res.status(500).send("Error uploading picture");
            } else {
                console.log("Your stuff was inserted successfully into the gallery database!");

                // Redirect the user to the root URL after successful insertion
                res.redirect("/");
            }
        }
    );
});
//delete
app.delete("/delete-actualPic/:id", (req, res) => {
    const actualPicId = req.params.id;
    
    // Delete the image and associated information from the database
    const deleteItemQuery = "DELETE FROM gallery WHERE id = ?";
    db.query(deleteItemQuery, [actualPicId], (err, results) => {
        if (err) {
            console.log("Error deleting item: ", err);
            res.status(500).send("Error deleting item");
        } else {
            console.log("Item deleted successfully!");
            res.status(200).send("Item deleted successfully");
        }
    });
});

//Update or edit route
app.post("/update-actualPic", (req, res)=>{
    const { updateItem, updatePicName, updatePicDescription, actualPicId } = req.body;
    const updateItemQuery = "UPDATE gallery SET actualPic = ?, picName = ?, picDescroption = ?  WHERE id = ?";
    db.query(
        updateItemQuery,
        [updateItem, updatePicName, updatePicDescription, actualPicId ],
        (err, results) =>{
            if(err) {
                console.error("Error updating item: ", err);
                res.status(500).send("Error updating item");
            }else{
                res.redirect("/");
            }

        }
    );
});

// Server port
app.listen(port, () => {
    console.log(`Server started at port ${port}`);
});
