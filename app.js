const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); // Directory to save uploaded files
    },
    filename: (re, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Create MySQL connection
const connection = mysql.createConnection({
// host: 'localhost',
// user: 'root',
// password: '',
// database: 'event_management'
host: 'sql.freedb.tech',
user: 'freedb_Kagurawr',
password: '2468248268',
database: 'freedb_Event_Management'
});

connection.connect((err) => {
if (err) {
console.error('Error connecting to MySQL:', err);
return;
}
console.log('Connected to MySQL database');
});

// Set up view engine
app.set('view engine', 'ejs');
// enable static files
app.use(express.static('public'));
// enable form processing
app.use(express.urlencoded({
    extended: false
}));
// enable static files
app.use(express.static('public'));

// Define routes
//C - display form
app.get("/addEvent", (req, res) => {
    res.render("addEvent");
});

//C - process form
app.post("/addEvent", upload.single('image'), (req, res) => {
    // Extract product data from the request body
    const { name, quantity, price } = req.body;
    let image;
    if (req.file) {
        image = req.file.filename; // Save only the filename
    } else {
        image = null;
    }

    const sql = 'INSERT INTO events (eventName, quantity, price, image) VALUES (?, ?, ?, ?)';
    // Insert the new event into the database
    connection.query( sql, [name, quantity, price, image], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error adding event:", error);
            res.status(500).send('Error adding event');
        } else {
            // Send a success response
            res.redirect('/');
        }
    });
});

//R - get all event
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM event_details';
    // Fetch data from MySQL
    connection.query(sql, (error, results) => {
        if (error) {
            console.log('Database query error:', error.message);
            return res.status(500).send('Error Retrieving events');
        }
        // Render HTML page with data
        res.render('index', { events: results });
    });
});

//R - get event by id
app.get("/event/:id", (req, res) => {
    // Extract the event ID from the request parameters
    const eventId = req.params.id;
    const sql = 'SELECT * FROM events WHERE eventId = ?';
    // Fetch data from MySQL based on the event ID
    connection.query( sql, [eventId], (error, results ) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving event by ID');
        }
        // Check if any event with the given IF was found
        if (results.length > 0) {
            // Render HTML page with the product data
            res.render('event', { event: results[0] });
        } else {
            // If no event with the given ID was found, render a 404 page or handle it accordingly
            res.status(404).send('Event not found');
        }
    });
});


//U - edit event
app.get('/editEvent/:id', (req, res) => {
    const eventId = req.params.id;
    const sql = 'Select * FROM events WHERE eventId = ?';
    // Fetch data from MySQL based on the event ID
    connection.query( sql, [eventId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving event by ID');
        }
        // Check if any eevent with the given ID was found
        if (results.length > 0) {
            // Render HTML page with the event data
            res.render('editEvent', {event: results[0]});
        } else {
            // If no event with the given ID was found, render a 404 page or handle it accordingly
            res.status(404).send('Event not found');
        }
    });
});

//U
app.post('/editEvent/:id', upload.single('image'), (req, res) => {
    const eventId = req.params.id;
    // Extract event data from the request body
    const { name, quantity, price } = req.body;
    let image = req.body.currentImage; //retrieve current image filename
    if (req.file) { //if new image is uploaded 
        image = req.file.filename; // set image to be new image filename
    }

    const sql = 'UPDATE events SET eventName = ?, price = ?, image = ? WHERE eventId = ?';

    // Insert the new event into the database
    connection.query( sql, [name, quantity, price, image, eventId], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error editing event:", error);
            res.status(500).send('Error editing event');
        } else {
            // Send a success response
            res.redirect('/');
        }
    });
});

//D
app.get('/deleteEvent/:id', (req, res) => {
    const eventId = req.params.id;
    const sql = 'DELETE FROM events WHERE eventId = ?';
    connection.query(sql, [eventId], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error deleting event:", error);
            res.status(500).send('Error deleting event');
        } else {
            // Send a success response
            res.redirect('/');
        }
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));