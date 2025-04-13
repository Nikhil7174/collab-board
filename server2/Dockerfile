FROM python:3.11-slim

# Install Tesseract OCR
RUN apt-get update && apt-get install -y tesseract-ocr libtesseract-dev

RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    libgl1 \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Install the required Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy your app code and set the working directory
COPY . /app
WORKDIR /app

# Set environment variable for Tesseract path (if needed, usually it's /usr/bin/tesseract)
ENV TESSERACT_PATH="/usr/bin/tesseract"

# Run your application
CMD ["python", "app.py"]
