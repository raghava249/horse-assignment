const express = require('express');
const XLSX = require('xlsx');
const app = express();
const cors = require('cors');
app.use(cors());

app.use(express.json());

app.post('/assign', (req, res) => {
    // Load excel files
    const horsesWorkbook = XLSX.readFile('Horses.xlsx');
    const ridersWorkbook = XLSX.readFile('Riders.xlsx');

    // Convert to JSON
    const horsesJson = XLSX.utils.sheet_to_json(horsesWorkbook.Sheets['Sheet1']);
    const ridersJson = XLSX.utils.sheet_to_json(ridersWorkbook.Sheets['Sheet1']);

    // Sort horses and riders
    const sortedHorses = horsesJson.sort((a, b) => b.height - a.height || b.weight - a.weight);
    const sortedRiders = ridersJson.sort((a, b) => b.points - a.points);

    // Assign horses to riders
    const assignments = sortedRiders.map(rider => {
        const assignedHorse = sortedHorses.shift();
        return {
            rider: rider.name,
            horse: assignedHorse ? assignedHorse.name : null
        };
    });

    // Convert to workbook
    const assignmentWorkbook = XLSX.utils.book_new();
    const assignmentWorksheet = XLSX.utils.json_to_sheet(assignments);
    XLSX.utils.book_append_sheet(assignmentWorkbook, assignmentWorksheet, 'Sheet1');

    // Write to file
    XLSX.writeFile(assignmentWorkbook, 'assignment_results.xlsx');

    // Send assignments in response
    res.json(assignments);
});

app.listen(3000, () => console.log('Server started on port 3000'));
