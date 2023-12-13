// Class definition for an editable table
class EditableTable {
    // Constructor to set up an editable table with the specified number of rows and columns
    constructor(numRows, numCols) {
        this.numRows = numRows; // Store the number of rows
        this.numCols = numCols; // Store the number of columns
        this.tableElement = document.getElementById('table'); // Find the table HTML element by ID
        this.cells = []; // Array to keep track of individual cell elements
        this.currentCellIndex = 0; // Index of the currently active cell
        this.previousCellIndex = null; // Index of the previously active cell, for navigation purposes
        this.initializeTable(); // Call method to create the table cells
        this.addEventListeners(); // Call method to attach necessary event listeners
    }

    // Method to create table cells and attach them to the table
    initializeTable() {
        for (let i = 0; i < this.numRows; i++) { // Iterate through the number of rows
            const rowElement = document.createElement('tr'); // Create a new table row (tr) element
            for (let j = 0; j < this.numCols; j++) { // Iterate through the number of columns
                const cellElement = document.createElement('td'); // Create a new table cell (td) element
                cellElement.textContent = `Cell ${i * this.numCols + j + 1}`; // Set the text content of the cell
                rowElement.appendChild(cellElement); // Append the cell to the current row
                this.cells.push(cellElement); // Add the cell element to the array of all cells

                // Add a click event listener to each cell
                cellElement.addEventListener('click', (e) => {
                    if (cellElement.getAttribute('contenteditable') === 'true') { // If the cell is already editable, do nothing
                        return;
                    }

                    // Find any cell that is currently editable
                    const editableCell = this.cells.find(cell => cell.getAttribute('contenteditable') === 'true');

                    if (editableCell) { // If there is an editable cell
                        editableCell.removeAttribute('contenteditable'); // Remove its contenteditable attribute
                        editableCell.classList.remove('editable'); // Remove the 'editable' class
                    }

                    // Update the current cell index to this cell
                    this.currentCellIndex = this.cells.indexOf(cellElement);

                    // Remove the 'active' class from all cells
                    this.cells.forEach(cell => cell.classList.remove('active'));

                    // Add the 'active' class to the currently clicked cell
                    cellElement.classList.add('active');
                });

                // Add a double click event listener to make the cell editable
                cellElement.addEventListener('dblclick', (e) => {
                    if (cellElement.getAttribute('contenteditable') === 'true') { // If the cell is already editable, do nothing
                        return;
                    }

                    this.makeCellEditable(cellElement); // Call the makeCellEditable method
                });
            }
            // Append the row to the table element
            this.tableElement.appendChild(rowElement);
        }
        // Set the initially active cell with the 'active' class
        this.cells[this.currentCellIndex].classList.add('active');
    }

    // Method to add the keydown event listener to the document for navigation and editing
    addEventListeners() {
        // Listen for the keydown event on the entire document
        document.addEventListener('keydown', (e) => {
            // Get the current active cell
            const currentCell = this.cells[this.currentCellIndex];
            // If the current cell is not in an editable state
            if (!currentCell.classList.contains('editable')) {
                // Handle arrow keys and Enter for navigation and editing
                switch (e.key) {
                    case 'ArrowUp': this.handleNavigation('up'); break; // Handle up arrow navigation
                    case 'ArrowDown': this.handleNavigation('down'); break; // Handle down arrow navigation
                    case 'ArrowLeft': this.handleNavigation('left'); break; // Handle left arrow navigation
                    case 'ArrowRight': this.handleNavigation('right'); break; // Handle right arrow navigation
                    case 'Enter': if (this.previousCellIndex !== null) // If Enter is pressed and there is a previous cell
                        this.cells[this.previousCellIndex].classList.remove('active'); // Remove active class from previous cell
                        e.preventDefault(); // Prevent default Enter key action
                        this.makeCellEditable(currentCell); // Make current cell editable
                        this.previousCellIndex = this.currentCellIndex; // Set the current cell as the previous cell for next iteration
                        break;
                }
            } else if (e.key === 'Enter') { // If the current cell is editable and Enter is pressed
                this.exitCellEditingMode(currentCell); // Exit editing mode for the cell
            }
        });
    }

    // Method to make a specific cell editable
    makeCellEditable(cell) {
        if (!cell.classList.contains('editable')) { // If the cell is not already editable
            const tempCellData = cell.textContent; // Store the current text content of the cell
            localStorage.setItem('tempCellData', tempCellData); // Save the content in local storage in case we need to revert changes
            cell.classList.add('editable'); // Add 'editable' class to the cell
            cell.contentEditable = 'true'; // Make the cell content editable
            cell.focus(); // Focus on the cell to start editing
            this.selectTextInsideCell(cell); // Select the text inside the cell for user convenience
            this.addEscapeKeyListener(cell); // Add key listener for 'Escape' key to cancel editing
        }
    }

    // Method to exit editing mode for a cell
    exitCellEditingMode(cell) {
        cell.contentEditable = 'false'; // Set content of the cell to be not editable
        cell.classList.remove('editable'); // Remove 'editable' class from cell
        cell.classList.add('active'); // Re-add 'active' class to cell
        this.clearTextSelection(); // Clear any text selection in the document
        localStorage.removeItem('tempCellData'); // Remove stored cell data from local storage
    }

    // Method to restore original cell content on 'Escape' key press
    addEscapeKeyListener(cell) {
        // Listen for keydown event on the cell
        cell.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { // If Escape key is pressed
                const restoredData = localStorage.getItem('tempCellData'); // Retrieve the original content from local storage

                if (restoredData && restoredData !== '') { // If there was original content
                    cell.textContent = restoredData; // Set the cell content back to the original
                } else if (restoredData === '') { // If the original content was empty
                    cell.textContent = ''; // Leave the cell content empty
                }

                this.exitCellEditingMode(cell); // Exit editing mode
            }
        });
    }

    // Method to select text within a cell for editing
    selectTextInsideCell(cell) {
        const textRange = document.createRange(); // Create a new text range
        textRange.selectNodeContents(cell); // Select the contents of the cell
        window.getSelection().removeAllRanges(); // Remove all existing selections
        window.getSelection().addRange(textRange); // Add the new range to the selection
    }

    // Method to clear any text selection in the document
    clearTextSelection() {
        window.getSelection().removeAllRanges(); // Remove all selections from the document
    }

    // Method to handle cell navigation using arrow keys
    handleNavigation(direction) {
        this.cells[this.currentCellIndex].classList.remove('active'); // Remove the 'active' class from the currently active cell
        // Which direction to navigate
        switch (direction) {
            case 'up': // Up arrow key was pressed
                if (this.currentCellIndex >= this.numCols) // Prevent navigating beyond the first row
                    this.currentCellIndex -= this.numCols; // Move up one row
                break;
            case 'down': // Down arrow key was pressed
                if (this.currentCellIndex < this.cells.length - this.numCols) // Prevent navigating beyond the last row
                    this.currentCellIndex += this.numCols; // Move down one row
                break;
            case 'left': // Left arrow key was pressed
                if (this.currentCellIndex % this.numCols !== 0) // Prevent navigating beyond the first column
                    this.currentCellIndex--; // Move left one column
                break;
            case 'right': // Right arrow key was pressed
                if (this.currentCellIndex % this.numCols !== this.numCols - 1 && // Prevent navigating beyond the last column
                    this.currentCellIndex < this.cells.length - 1) // Prevent navigating beyond the last cell
                    this.currentCellIndex++; // Move right one column
                break;
        }
        this.cells[this.currentCellIndex].classList.add('active'); // Add 'active' class to the new current cell
    }
}

// Create a new EditableTable with 10 rows and 10 columns
const editableTable = new EditableTable(10, 10);
