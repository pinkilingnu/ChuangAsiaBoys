// Load data from CSV file
function readFromCSV(path) {
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", path, false);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status == 0) {
        let allText = rawFile.responseText;
        let out = CSV.parse(allText); // Parse CSV using a library
        trainees = convertCSVArrayToTraineeData(out); // Convert to trainee objects
        filteredTrainees = [...trainees]; // Initialize filtered list
        populateTable(filteredTrainees); // Populate the table
      }
    }
  };
  rawFile.send(null);
}

// Convert CSV data to structured trainee objects
function convertCSVArrayToTraineeData(csvArrays) {
  return csvArrays.map(function (traineeArray, index) {
    return {
      id: index, // Use index as unique ID
      stage_name: traineeArray[0],
      name_native: traineeArray[1],
      name_romanized: traineeArray[2],
      affiliation: traineeArray[3],
      nationality: traineeArray[4],
      rating: traineeArray[5],
      birthyear: traineeArray[6],
      eliminated: traineeArray[7] === "e", // Check for 'e' flag
      top9: traineeArray[7] === "t", // Check for 't' flag
      selected: false, // Default selection state
      image: traineeArray[0].replace(/\s+/g, "_") + ".png", // Generate image filename
    };
  });
}

// Filter trainees based on search input
function filterTrainees(event) {
  let filterText = event.target.value.toLowerCase(); // Get input text
  filteredTrainees = trainees.filter(function (trainee) {
    return (
      trainee.stage_name.toLowerCase().includes(filterText) ||
      (trainee.name_native && trainee.name_native.toLowerCase().includes(filterText)) ||
      (trainee.name_romanized &&
        trainee.name_romanized.toLowerCase().includes(filterText)) ||
      trainee.affiliation.toLowerCase().includes(filterText) ||
      trainee.nationality.toLowerCase().includes(filterText)
    );
  });
  rerenderTable(); // Refresh the table with filtered trainees
}

// Handle trainee selection toggle
function tableClicked(trainee) {
  if (trainee.selected) {
    trainee.selected = false; // Deselect trainee
    removeRankedTrainee(trainee);
  } else {
    trainee.selected = true; // Select trainee
    addRankedTrainee(trainee);
  }
  rerenderTable(); // Update table
  rerenderRanking(); // Update rankings
}

// Add a trainee to the ranking
function addRankedTrainee(trainee) {
  for (let i = 0; i < ranking.length; i++) {
    if (ranking[i].id === -1) {
      ranking[i] = trainee;
      return true;
    }
  }
  return false;
}

// Remove a trainee from the ranking
function removeRankedTrainee(trainee) {
  for (let i = 0; i < ranking.length; i++) {
    if (ranking[i].id === trainee.id) {
      ranking[i] = newTrainee();
      return true;
    }
  }
  return false;
}

// Populate the trainee table
function populateTable(trainees) {
  let table = document.getElementById("table__entry-container");
  clearTable(); // Clear existing entries
  trainees.forEach((trainee) => {
    const entryHTML = populateTableEntry(trainee);
    table.insertAdjacentHTML("beforeend", entryHTML);
    let insertedEntry = table.lastChild;
    insertedEntry.addEventListener("click", function () {
      tableClicked(trainee); // Add event handler for click
    });
  });
}

// Generate the HTML for a table entry
function populateTableEntry(trainee) {
  return `
  <div class="table__entry ${trainee.selected ? "selected" : ""}">
    <div class="table__entry-icon">
      <img class="table__entry-img" src="assets/trainees/${trainee.image}" />
      <div class="table__entry-icon-border"></div>
    </div>
    <div class="table__entry-text">
      <span class="name"><strong>${trainee.stage_name}</strong></span>
      <span class="native">${trainee.name_native || ""}</span>
      <span class="nationalityandyear">${trainee.nationality.toUpperCase()} • ${
    trainee.birthyear
  }</span>
    </div>
  </div>`;
}

// Clear the table
function clearTable() {
  let table = document.getElementById("table__entry-container");
  while (table.firstChild) {
    table.removeChild(table.firstChild);
  }
}

// Refresh the table with current data
function rerenderTable() {
  populateTable(filteredTrainees);
}

// --- Additional Functions ---
function rerenderRanking() {
  // Update ranking display logic here
}

// --- Initialize on page load ---
window.addEventListener("load", function () {
  readFromCSV("./trainee_info.csv"); // Load data from CSV
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", filterTrainees); // Add event listener for search
});
