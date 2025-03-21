from flask import Flask, request, send_file, jsonify
import cv2
import pytesseract
from pytesseract import Output
import numpy as np
import io
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
            translated_word = translated_word.encode('utf-8').decode('utf-8')
            img = cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)
            img = cv2.putText(img, translated_word, (x, y + h + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2, cv2.LINE_AA)
    
    return img

@app.route('/')
def home():
    return "Welcome to the Flask OCR and Translation API!"

@app.route('/recognize_text', methods=['POST'])
def process_image():
    file = request.files.get('image')
    if not file:
        return jsonify({'error': 'No image file provided'}), 400

    img_bytes = file.read()
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    myconfig = r"--psm 6 --oem 3"
    data = pytesseract.image_to_data(img, config=myconfig, output_type=Output.DICT)
    
    recognized_text = ''
    amount_boxes = len(data['text'])
    for i in range(amount_boxes):
        if float(data['conf'][i]) > 30:
            recognized_text += data['text'][i] + ' '
    
    transtext = translator.translate(recognized_text.strip(), dest='de').text
    img_with_boxes = draw_text_boxes(img.copy(), data, transtext)

    retval, buffer = cv2.imencode('.png', img_with_boxes)
    img_bytes = io.BytesIO(buffer)

    # Send both image and text as separate responses
    response_data = {
        'recognizedText': recognized_text,
        'translatedText': transtext,
    }
    
    # Save the processed image temporarily for sending
    img_bytes.seek(0)
    return send_file(img_bytes, mimetype='image/png')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))  # Use PORT from environment or default to 5000
    app.run(debug=True, host='0.0.0.0', port=port)
