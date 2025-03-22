#!/bin/bash

# Download the precompiled Tesseract binary
mkdir -p ~/tesseract
cd ~/tesseract
curl -L -o tesseract.tar.xz https://github.com/tesseract-ocr/tesseract/releases/download/5.3.0/tesseract-5.3.0-linux-x86_64.tar.xz

# Extract the binary
tar -xf tesseract.tar.xz
rm tesseract.tar.xz

# Set environment variables for Tesseract
export TESSERACT_PATH=$HOME/tesseract/bin/tesseract
export PATH="$TESSERACT_PATH:$PATH"

# Verify Tesseract installation
$TESSERACT_PATH --version

# Continue with normal build
pip install -r requirements.txt
