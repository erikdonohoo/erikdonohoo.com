<?php

try {
    // Create (connect to) SQLite database in file
    $file_db = new PDO('sqlite:db.sqlite');

    // Set errormode to exceptions
    $file_db->setAttribute(PDO::ATTR_ERRMODE, 
    PDO::ERRMODE_EXCEPTION);

    // Select all data from slideshow table
    $result = $file_db->query('SELECT key from hashkey where rowid=1');
    $toreturn;
    foreach ($result as $row) {
        $toreturn = $row['key'];
    }

    echo $toreturn;

}  catch(PDOException $e) {
  // Print PDOException message
  echo $e->getMessage();
}

?>