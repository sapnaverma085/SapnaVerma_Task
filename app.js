
// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const fs=require('fs');

// Create an instance of Express application
const app = express();

// Set the view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware setup
// Parse JSON-encoded request bodies
app.use(bodyParser.json());
// Parse URL-encoded request bodies
app.use(bodyParser.urlencoded({
  extended: true
}));

// Serve static files from the views directory
app.use(express.static(path.join(__dirname, 'views')));

// Initialize array to store teacher records
let teachers = [];

// to load teacher records from teacher.json file
function loadTeachersFromFile() {
    try {
         // Read data from teacher.json file
        const data = fs.readFileSync('teacher.json', 'utf8');
        // Parse JSON data and store it in 'teachers' array
        teachers = JSON.parse(data);
    } catch (err) {
        console.error("Error reading or parsing teacher.json:", err);
    }
    

    // If 'teachers' is not an array, initialize it as an empty array
    if (!Array.isArray(teachers)) {
        teachers = [];
    }
}

// Load teacher records from file when the server starts
loadTeachersFromFile();

// Function to save teacher records to JSON file
function saveteachersToFile() {

   // Write 'teachers' array to teacher.json file
  fs.writeFile('teacher.json', JSON.stringify(teachers, null, 2), (err) => {
    if (err) {
      console.error('Error writing teachers to file:', err);
    } else {
      console.log('teachers saved to file successfully.');
    }
  });
}

// Define routes

// Route to render home page with teacher data
app.get("/", function (req, res) {
    console.log("Data sent to the view:", teachers);
    res.render("home", { data: teachers });
  });

// Route to handle addition of a new teacher
app.post("/", (req, res) => {

  // Extract data from request body
  const name = req.body.name;
 const age=req.body.age;
 const dateOfBirth=req.body.dateOfBirth;
 const subject_taught=req.body.subject_taught;
 
  // Add new teacher to 'teachers' array
  teachers.push({
    name: name,
    age:age,
    dateOfBirth:dateOfBirth,
    subject_taught:subject_taught
  });
  
  // Save updated data to file
  saveteachersToFile();

  // Render home page view with updated teacher data
  res.render("home", {
    data: teachers
  });

  // Send JSON response indicating successful addition of teacher
  res.json({ message: 'Teacher added successfully', teacher: teachers });
});


// Route to handle deletion of a teacher record
app.post('/delete', (req, res) => {
    // Extract name of teacher to be deleted from request body
    const requestedName = req.body.name;
    console.log(requestedName);

    // Find index of teacher in 'teachers' array
    const index = teachers.findIndex((teacher) => teacher.name === requestedName);

    // If teacher found, remove it from array
    if (index !== -1) {
      teachers.splice(index, 1);
    }
    
    // Save updated data to file
    saveteachersToFile();

    // Render home page view with updated teacher data
    res.render("home", {
      data: teachers
    });
});
  
// Route to handle searching for teachers by name
app.post('/search',(req,res)=>{
    // Extract search name from request body
    const searchName=req.body.name;

    // Filter teachers based on search name
    const foundTeachers = teachers.filter(teacher => teacher.name.toLowerCase().includes(searchName.toLowerCase()) );

    // Determine whether to show alert if no teachers found
    const showAlert = foundTeachers.length === 0;
    
    // Render home page view with search results
    res.render("home", {
        data: foundTeachers,
        showAlert: showAlert
    });
})

// Route to handle updating teacher record
app.post('/update',(req,res)=>{
    
  // Extract data for updating teacher record
    const oldname=req.body.name;
    const newage=req.body.newage;
    const newname=req.body.newname;
    const newdob=req.body.newdob;
    const newsubject=req.body.newsubject;
    
    // Find teacher to update in 'teachers' array
    const teacherToUpdate = teachers.find(teacher => teacher.name === oldname);
    if (teacherToUpdate) {
        // If teacher found, update their properties
        teacherToUpdate.name = newname;
        teacherToUpdate.age = newage;
        teacherToUpdate.dateOfBirth=newdob;
        teacherToUpdate.subject_taught=newsubject;


        // Save updated data to file
        saveteachersToFile();
    }
    
    // Render home page view with updated teacher data
    res.render("home", {
        data: teachers
    });
    
})


// Route to handle filtering of teachers based on age or subject taught
app.post('/filter', (req, res) => {
  // Extract filter criteria from request body
  const selectFilter = req.body.filterby;
  console.log(selectFilter);

  let filteredTeachers = [...teachers];  // Create a shallow copy of teachers array for filtered data
  // Apply appropriate filter based on criteria
  if(selectFilter=="Age")
      {
        filteredTeachers.sort((a, b) => a.age - b.age);
      }
  else if (selectFilter === "Age below 50") {
      filteredTeachers = filteredTeachers.filter(teacher => teacher.age < 50);
      filteredTeachers.sort((a, b) => a.age - b.age);
  } else if (selectFilter === "Age above 50") {
      filteredTeachers = filteredTeachers.filter(teacher => teacher.age >= 50);
      filteredTeachers.sort((a, b) => a.age - b.age);
  } else if (selectFilter === "subjectTaught") {
      filteredTeachers.sort((a, b) => a.subject_taught - b.subject_taught);
  }
  
  // Render home page view with filtered data
  res.render("home", {
      data: filteredTeachers,
      filterby: selectFilter
  });
});

//Route to calculate average
app.get('/avg',(req,res)=>{
 
// Check if there are any teachers
if(teachers.length===0)
{ 
  // If no teachers, send JSON response with error message
  res.json({error:'Number of teachers are zero'});
}
else 
{
  
  let avgsub=teachers.reduce((acc,teacher)=>acc+parseInt(teacher.subject_taught),0);
  // Calculate average subject taught
  avgsub=avgsub/teachers.length;

  // Render home page view with average subject taught
  res.render("home", { data:teachers,avgsub: avgsub.toFixed(2) });
 
}
})

  
//Create an HTTP server
const server = http.createServer(app);

//Listen on port 3000
server.listen(3000, () => {
  console.log("App is running on http://localhost:3000");
});
