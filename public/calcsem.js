 function calculateSEM() {
      const mean = parseFloat(document.getElementById('mean').value);
      const sd = parseFloat(document.getElementById('sd').value);
      const n = parseInt(document.getElementById('n').value);

      if (!isNaN(mean) && !isNaN(sd) && !isNaN(n) && n > 0) {
        const sem = sd / Math.sqrt(n);
        document.getElementById('result').innerHTML = `SEM: ${sem.toFixed(4)}`;
      } else {
        document.getElementById('result').innerHTML = 'Please enter valid values for Mean, SD, and Sample Size (N).';
      }
    }