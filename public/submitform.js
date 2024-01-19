
$(document).ready(function () {

  const rowsData = [];

  $('#extractpdf').click(function (event) {

    event.preventDefault(); 
  });



  $('#saveForm').click(function () {
      //console.log('clicked',$('#name').val());
     // alert('clicked'+$('#name').val());
    const commonFields = {
      Name: $('#name').val(),
        // Sex: $('#sex').val(),
        // Age: $('#age').val(),
        // Education: $('#education').val(),
        // Race: $('#race').val(),
      TestNum:$('#testNum').val(),
      
    };

      // Iterate over table rows
    $('#dataTable tbody tr').each(function () {

      let allEmpty = true;
      
      const rowData = { ...commonFields };
      $(this).find('input').each(function () {
        const fieldName = $(this).attr('name');
        const fieldValue = $(this).val();
        
    // Check if T, Raw, ScaledScore, and StandardScore are not empty
        if (['T', 'Raw', 'ScaledScore', 'StandardScore'].includes(fieldName) && fieldValue.trim() !== '') {
          allEmpty = false;
        }

        rowData[fieldName] = fieldValue;
      });
      if (!allEmpty) {
        rowsData.push(rowData);
      }
    });

    console.log('rowsdata',rowsData);
  });

    // Send data to the server
  $('#submitForm').submit(function (event) {
        event.preventDefault();  // Prevent default form submission

        $.ajax({
          type: 'POST',
          url: '/submit',
          contentType: 'application/json',
          data: JSON.stringify({ rows: rowsData }),
          success: function (response) {
            console.log(response);

            // Redirect to the next page after successful submission
            window.location.href = '/thankyou';  // Replace with the URL of the next page
          },
          error: function (error) {
            console.error(error);
          }
        });
      });

  $('#generateBtn').on('click', function() {
    const clientIdInput = $('#name');
      const randomId = generateRandomId(10); // Generate at least 10 characters
      clientIdInput.val(randomId);
    });

  function generateRandomId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomId = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomId += characters.charAt(randomIndex);
    }

      // Ensure at least one letter and one number
    if (!/\d/.test(randomId) || !/[a-zA-Z]/.test(randomId)) {
        // If not, generate a new character until the requirement is met
      while (!/\d/.test(randomId) || !/[a-zA-Z]/.test(randomId)) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomId += characters.charAt(randomIndex);
      }
    }

    return randomId;
  }
  
});


