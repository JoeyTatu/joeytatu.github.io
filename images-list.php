<?php
// Get all image files in the "images" folder
$images = glob("images/*.{jpg,jpeg,png,gif}", GLOB_BRACE);

// Return them as a JSON array
echo json_encode($images);
?>