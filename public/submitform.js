
  $(document).ready(function () {

    const rowsData = [];

    $('#saveForm').click(function () {
      //console.log('clicked',$('#name').val());
     // alert('clicked'+$('#name').val());
      const commonFields = {
        Name: $('#name').val(),
        Sex: $('#sex').val(),
        Age: $('#age').val(),
        Education: $('#education').val(),
        Race: $('#race').val(),
        TestNum:$('#testNum').val(),
      
      };

      // Iterate over table rows
      $('#dataTable tbody tr').each(function () {
        const rowData = { ...commonFields };
        $(this).find('input').each(function () {
          rowData[$(this).attr('name')] = $(this).val();
        });
        rowsData.push(rowData);
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
     
  });
