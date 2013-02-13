<?php

try {
    // Create (connect to) SQLite database in file
    $file_db = new PDO('sqlite:db.sqlite');
    // Set errormode to exceptions
    $file_db->setAttribute(PDO::ATTR_ERRMODE, 
    PDO::ERRMODE_EXCEPTION);

    // Select all data from slideshow table
    $result = $file_db->query('SELECT * FROM highscore');
    $arr = array();
    $topscore = 0;
    foreach($result as $row) {
        if ($row['score'] > $topscore) {
            $topscore = $row['score'];
            $arr = array("name" => $row['name'], "score" => $row['score']);
        }
    }

    $file_db = null;

    echo json_encode($arr);

    }

  catch(PDOException $e) {
  // Print PDOException message
  echo $e->getMessage();
}

?>