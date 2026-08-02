<?php

header('Content-Type: application/json');

echo json_encode([
    "name" => "School Of Freelancing MCP",
    "version" => "1.0",
    "status" => "running"
], JSON_PRETTY_PRINT);
