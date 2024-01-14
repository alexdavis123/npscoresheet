
async function processPDF() {
  const fileInput = document.getElementById('pdfInput');
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select a PDF file.');
    return;
  }

  const pdfData = await readFile(file);

      // Load the PDF document
  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
  const totalPages = pdf.numPages;

      // Extract tables from page 3
  try {
    const pageNum = 3;
    const page = await pdf.getPage(pageNum);
  // Rest of the code for processing the page
        // Perform table extraction logic
    const textContent = await page.getTextContent();


    const pageTables = extractTables(textContent);

    console.log('Tables extracted from page 3:', pageTables);

    const processedTables = pageTables.map((pageTable) => {
  // Split the table row by tab character
      const rowValues = pageTable.split(/\t/);
      console.log('rowvalues',rowValues);

      const regexArray = [
        /Trial 1 (\d+) (\d+) (\d+)/,
        /Trial 2 (\d+) (\d+) (\d+)/,
        /Trial 3 (\d+) (\d+) (\d+)/,
        /Total Recall (\d+) (\d+) (\d+)/,
        /Learning (\d+) (\d+) (\d+)/,
        /Delayed Recall (\d+) (\d+) (\d+)/
        ];
      const extractValues = (regex, data) => {
        const match = data.match(regex);
        return match ? match.slice(1).map(Number) : null;
      };
      
      const resultsArray = rowValues.map((row) => {
        const rowResults = regexArray.map((regex) => extractValues(regex, row));
        console.log('rows',rowResults);

const extractedValues = rowResults;

  console.log('extractedValues',rowResults);

  // Get all the input elements within the table
  const inputElements = document.querySelectorAll('table input[type="text"], table input[type="number"]');

  // Iterate through each input element
  inputElements.forEach((input, index) => {
    // Calculate the values for Raw and T based on the extracted values array
    const rowIndex = Math.floor(index / 7);
    const columnIndex = index % 7;

    if (columnIndex === 2 && extractedValues[rowIndex]) {
      // Raw value (third input)
      const rawValue = extractedValues[rowIndex][0];
      input.value = rawValue;
    } else if (columnIndex === 3 && extractedValues[rowIndex]) {
      // T value (fourth input)
      const tValue = extractedValues[rowIndex][1];
      input.value = tValue;
    }
  });
        
        return rowResults;
      });

  
      // Wait for the document to fully load before executing the script
//document.addEventListener('DOMContentLoaded', function () {
  // Define the extractedValues array
  

  // Log the updated HTML
 // console.log(document.querySelector('table').outerHTML);
//});



    });


  } catch (error) {
    console.error('Error getting page:', error);
  }

}

function extractTables(textContent) {
  // Placeholder logic, replace with actual table extraction code
  // For example, you can use regular expressions to find tables in the text content



// Regular expression to find the BVMT-R Score Summary Table
  const bvmtRTableRegex = /BVMT-R Score Summary Table:([\s\S]*?)Copy (\d+)/;


  // Get the entire text content as a string
  const fullText = textContent.items.map((item) => item.str).join('');

 // console.log('full text',fullText);

  // Use the regular expression to find all matches
  const matches = fullText.match(bvmtRTableRegex);

  // Return an array of matches or an empty array if none found
  return matches || [];
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = (event) => {
      reject(new Error('Error reading the file'));
    };

    reader.readAsArrayBuffer(file);
  });
}




