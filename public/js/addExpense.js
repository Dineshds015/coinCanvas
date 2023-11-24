function sortAmount() {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById("tableContent");
    switching = true;
    
    while (switching) {
      switching = false;
      rows = table.rows;
      
      for (i = 1; i < (rows.length - 1); i++) {
        shouldSwitch = false;
        x = parseInt(rows[i].getElementsByTagName("TD")[1].innerHTML, 10);
        y = parseInt(rows[i + 1].getElementsByTagName("TD")[1].innerHTML, 10);
        
        if (x > y) {
          shouldSwitch = true;
          break;
        }
      }
      
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
  }
  
  function sortDate() {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById("tableContent");
    switching = true;
    
    while (switching) {
      switching = false;
      rows = table.rows;
      
      for (i = 1; i < (rows.length - 1); i++) {
        shouldSwitch = false;
  
        // Extract the date strings from the inner HTML of the <td> elements
        x = rows[i].getElementsByTagName("TD")[4].innerHTML; // Assuming Date is in the 5th column (index 4)
        y = rows[i + 1].getElementsByTagName("TD")[4].innerHTML;
        
        // Convert the date strings to Date objects for comparison
        x = new Date(x);
        y = new Date(y);
        
        // Compare the dates
        if (x < y) {
          shouldSwitch = true;
          break;
        }
      }
      
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
  }
  