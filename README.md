This Project is for HACK-A-BIT

https://collab-board-delta.vercel.app/

# 📝 Collaborative Whiteboard with Real-Time Translation  

## 🚀 Features  
- **Real-Time Collaboration**: Multiple users can connect and draw on the same board using **Socket.io**.  
- **OCR & Translation**:  
  - Users can **capture the board** at any time.  
  - An **ML model extracts text** using Optical Character Recognition (**OCR**).  
  - The extracted text is **translated into the user’s preferred language**.  
- **Seamless Communication**: Enables collaboration among users with different **native languages**, ensuring they read the board in their own language.  
- **Cross-Platform Compatibility**: Works in web browsers for easy accessibility.  

## 🛠️ Tech Stack  
- **Frontend**: React.js / Next.js (for an interactive UI)  
- **Backend**: Node.js, Express.js  
- **Real-Time Communication**: Socket.io  
- **Machine Learning**:  
  - OCR Model (e.g., Tesseract.js or Google Vision API)  
  - Translation API (e.g., Google Translate API or OpenAI)  
- **Database**: MongoDB / Firebase (for session persistence, if required)  

## 📌 How It Works  
1. **Users join a shared board** and start drawing in real-time.  
2. **A user takes a snapshot** of the board.  
3. **The ML model extracts handwritten or typed text** from the image.  
4. **The extracted text is translated** into the preferred language of each user.  
5. **Users view the board’s content in their native language** without affecting the original board.  

## 🔧 Setup & Installation  
1. Clone the repository:  
   ```sh  
   git clone https://github.com/your-repo/collaborative-board.git  
   cd collaborative-board  
   ```  
2. Install dependencies:  
   ```sh  
   npm install  
   ```  
3. Start the server:  
   ```sh  
   npm run dev  
   ```  

## 📌 Future Enhancements  
- **Handwriting Recognition Improvements** for better accuracy.  
- **Multi-User Roles** (Presenter, Viewer, etc.).  
- **Persistent Boards** to save and reload previous sessions.  
- **Voice-to-Text Support** for additional accessibility.

## **The server where the ml model had been deployed is currently down. So the image processing(extracting text from board's img and converting it to the desired language is not available in the deployed website.) To test the ml model the python server can be run locally.

