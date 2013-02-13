<?php

$name = $_POST['name'];
$score = $_POST['score'];
$hash = $_POST['hash'];

try {
    // Create (connect to) SQLite database in file
    $file_db = new PDO('sqlite:db.sqlite');

    // Set errormode to exceptions
    $file_db->setAttribute(PDO::ATTR_ERRMODE, 
    PDO::ERRMODE_EXCEPTION);

    // Select all data from slideshow table
    $hashkey = $file_db->query('SELECT key from hashkey where rowid=1');
    $toreturn;
    foreach ($hashkey as $row) {
        $toreturn = $row['key'];
    }

    $result;
    if ($hash == $toreturn) {

        $file_db->query("INSERT INTO highscore(name, score) values('$name', '$score')");

        $file_db = null;

        $result = "success";

    } else {

        $result = "nice try loser";
    }

    echo $result;

}  catch(PDOException $e) {
  // Print PDOException message
  echo $e->getMessage();
}

?>