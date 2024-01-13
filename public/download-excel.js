
$(document).ready(function() {
<<<<<<< HEAD
  $('#ClientResult tbody tr').each(function () {
    // Check if the cell in the 4th column is empty
    var cellIsEmpty = $(this).find('td:eq(3)').text().trim() === '';
=======
  $('#ClientResult tbody tr').each(function() {
    // Check if the cell in the 5th column is empty
    var cellIsEmpty = $(this).find('td:eq(5)').text().trim() === '';
>>>>>>> c5fb1e4a4e25efd4c82cdc7e9fd2a735bbfd1a47

    // Check if the row has rowspan in the 2nd column
    var hasRowspan = $(this).find('td:eq(1)').attr('rowspan');

    // Check if the current row is below a rowspan
    var isBelowRowspan = $(this).prev().find('td:eq(1)').attr('rowspan');

    // Check if the current row is part of a rowspan group
    var isPartOfRowspan = $(this).index() <= hasRowspan;

<<<<<<< HEAD
    // Check if the current row is a domain row
    var isDomainRow = $(this).hasClass('domain');

    // Hide the row only if the cell is empty, it's not part of a rowspan group, and it's not a domain row
    if (cellIsEmpty && !isPartOfRowspan && !isBelowRowspan && !isDomainRow) {
        $(this).hide();
    }
});

=======
    // Hide the row only if the cell is empty, it's not part of a rowspan group, and it's not directly below a rowspan
    if (cellIsEmpty && !isPartOfRowspan && !isBelowRowspan) {
      $(this).hide();
    }
  });
>>>>>>> c5fb1e4a4e25efd4c82cdc7e9fd2a735bbfd1a47

  // Add click event for the "Download CSV" button
  $('#downloadExcel').on('click', function() {
   downloadExcel();
  });
});


function downloadExcel() {
  // Create a new workbook and add a worksheet
  var wb = XLSX.utils.book_new();
  var ws = XLSX.utils.table_to_sheet(document.getElementById('ClientResult'));

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // Save the workbook as an Excel file
  XLSX.writeFile(wb, 'downloaded_data.xlsx');
}
