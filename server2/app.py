from flask import Flask, request, jsonify
import cv2
import pytesseract
from pytesseract import Output
import numpy as np
import io
import base64
from flask_cors import CORS
from googletrans import Translator
import os

translator = Translator()
app = Flask(__name__)
CORS(app, resources={r"/recognize_text": {"origins": "*"}})

def draw_text_boxes(img, data, translated_text):
    translated_words = translated_text.strip().split() if translated_text.strip() else []
    
    for i in range(len(data['text'])):
        if float(data['conf'][i]) > 30:
            x, y, w, h = data['left'][i], data['top'][i], data['width'][i], data['height'][i]
            translated_word = translated_words.pop(0) if translated_words else ''

            # Draw rectangle and translated text
            cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(img, translated_word, (x, y + h + 20), cv2.FONT_HERSHEY_SIMPLEX, 
                        0.7, (0, 255, 0), 2, cv2.LINE_AA)
    
    return img

@app.route('/')
def home():
    return "Welcome to the Flask OCR and Translation API!"

@app.route('/recognize_text', methods=['POST'])
def process_image():
    file = request.files.get('image')
    if not file:
        return jsonify({'error': 'No image file provided'}), 400

    # Read image from request
    img_bytes = file.read()
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # OCR configuration
    myconfig = r"--psm 3 --oem 3"
    data = pytesseract.image_to_data(img, config=myconfig, output_type=Output.DICT)
    
    # Extract recognized text
    recognized_text = ' '.join([data['text'][i] for i in range(len(data['text'])) if float(data['conf'][i]) > 30]).strip()

    # Translate text (Handle empty text)
    transtext = translator.translate(recognized_text, dest='de').text if recognized_text else ""

    # Draw bounding boxes with translated text
    img_with_boxes = draw_text_boxes(img.copy(), data, transtext)

    # Encode image to Base64
    _, buffer = cv2.imencode('.png', img_with_boxes)
    img_base64 = base64.b64encode(buffer).decode('utf-8')

    # Return response as JSON
    response_data = {
        'recognizedText': recognized_text,
        'translatedText': transtext,
        'image': img_base64  # Base64 string of the processed image
    }
    
    return jsonify(response_data)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))  # Use PORT from environment or default to 5000
    app.run(host='0.0.0.0', port=port)
