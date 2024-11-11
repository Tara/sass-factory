#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | sed 's/#.*//g' | xargs)
fi

# Run the generator
node Tools/generate-gallery-index.js

# Check if the script succeeded
if [ $? -eq 0 ]; then
    echo "Gallery index successfully updated!"
else
    echo "Failed to update gallery index"
    exit 1
fi