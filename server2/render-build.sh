#!/usr/bin/env bash

# Update package lists
apt-get update

# Install Tesseract OCR
apt-get install -y tesseract-ocr

# Verify installation
tesseract --version
