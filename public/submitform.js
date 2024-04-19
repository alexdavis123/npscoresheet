
$(document).ready(function () {

  const rowsData = [];

  $('#extractpdf').click(function (event) {

    event.preventDefault(); 
  });

 $('#generatepremorb').click(function () {
   event.preventDefault(); 
    // Retrieve values from the input fields
    var age = parseInt($('#age').val());
    var ed = parseInt($('#education').val());
    var spec = $('#spec').val();
    var ged = $('#ged').val();
    var handedness = $('#handedness').val();
    var residence = $('#residence').val();
    var sex = $('#sex').val();

    // Calculate the premorbid value based on the provided formula or algorithm
    var premorbid = calculatePremorbid(age, ed, spec, ged, handedness, residence, sex);

     // Convert the premorbid value to an integer (remove decimal points)
    premorbid = parseInt(premorbid);

    // Fill in the premorbid input field with the calculated value
    $('#premorbid').val(premorbid);

});

// Function to calculate the premorbid value based on the provided factors
function calculatePremorbid(age, ed, spec, ged, handedness, residence, sex) {
  console.log(age, ed, spec, ged, handedness, residence, sex);
    // Example:
    var premorbid = 41.731+ age*0.043 + ed*0.956;
    if (spec === 'yes') {
        premorbid -= 3.255*1;
    }else{
      premorbid -= 3.255*2;

    }
    if (ged === 'yes') {
        premorbid += 1.896*1;
    }else{
      premorbid += 1.896*2;
    }
    if (handedness === 'left') {
        premorbid -= 2.785*2;
    }else{
      premorbid -= 2.785*1;
    }
    if (residence === 'urban') {
        premorbid -= 0.714*2;
    }else{
      premorbid -= 0.714*1;
    }
    if (sex === 'female') {
        premorbid -=0.148* 1;
    }else{
      premorbid -=0.148* 2;
    }
    return premorbid;
}


  $('#saveForm').click(function () {
    const commonFields = {
        Name: $('#name').val(),
        Sex: $('#sex').val(),
        Premorbid: $('#premorbid').val(),
        TestNum: $('#testNum').val(),
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

   

    

    // Proceed with form submission or further processing
});


    // Send data to the server
  $('#submitForm').submit(function (event) {
    event.preventDefault(); // Prevent default form submission
 console.log('rowsdata', rowsData.length);
    // Check if rowsData contains less than 3 rows
    if (rowsData.length < 3) {
        alert('Error: There must be at least 3 rows of data.');
        return; // Do not proceed with form submission
    }else{

    $.ajax({
        type: 'POST',
        url: '/submit',
        contentType: 'application/json',
        data: JSON.stringify({ rows: rowsData }),
        success: function (response) {
            console.log(response);

            // Redirect to the next page after successful submission
            window.location.href = '/thankyou'; // Replace with the URL of the next page
        },
        error: function (error) {
            console.error(error);
        }
    });
    }
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


