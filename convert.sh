#!/bin/bash

input_file="$1"
output_dir="$2"
format="${3:-pdf}"

if [ -z "$input_file" ] || [ -z "$output_dir" ]; then
    echo "Usage: convert.sh <input_file> <output_dir> [format]"
    exit 1
fi

mkdir -p "$output_dir"

# Convert to PDF first if needed
if [ "$format" = "png" ]; then
    pdf_file="/tmp/temp_$(date +%s).pdf"
    libreoffice --headless --convert-to pdf --outdir /tmp "$input_file"
    base_name=$(basename "$input_file" | sed "s/\.[^.]*$//")
    pdf_file="/tmp/${base_name}.pdf"
    
    if [ -f "$pdf_file" ]; then
        # Convert PDF to PNG images
        pdftoppm -png -r 300 "$pdf_file" "$output_dir/slide"
        rm "$pdf_file"
        echo "Conversion successful"
    else
        echo "PDF conversion failed"
        exit 1
    fi
else
    libreoffice --headless --convert-to "$format" --outdir "$output_dir" "$input_file"
fi