# RoleFitAI - **job portal and HRMS powered by LLMs**

Watch the video demo [here](https://drive.google.com/file/d/1I3ncywaBV-t-9KK8s1d68iKFjITG2l02/view?usp=sharing)

Follow these instructions in order to locally launch the website using VSCode:

1. Clone this repository using the git clone command

2. Before running the code, create the following empty folders in the project directory ```..\RoleFitAI\```.
  - job_description_final
  - job_description_upload
  - uploads

An overview of the project's directory structure:
- `RoleFitAI/`: project main directory
  - `jdResume`: python files
  - `public`: HTML, CSS, and Javascript files
  - `job_description_final`: will contain the final job description
  - `job_description_upload`: will contain all the uploaded job descriptions
  - `uploads`: will contain all the uploaded resumes
  - `README.md`: Getting started guide.
  - `How To Setup MySQL.docx`: instructions for setting up MySQL in VSCode
  - `RoleFitAI_presentation.pptx`: a presentation on the project

3. Install the required Node.js libraries using the following command:

```bash
npm install express body-parser mysql2 path multer nodemailer
```

4. To set up MySQL in VSCode follow [this](https://github.com/Priyanshu020804/RoleFitAI/blob/main/How%20To%20Setup%20MySQL.docx) guide

5. Install Python Libraries:
```
git clone https://huggingface.co/ml6team/keyphrase-extraction-kbir-inspec
git clone https://huggingface.co/sentence-transformers/bert-base-nli-mean-tokens
git clone https://huggingface.co/sentence-transformers/all-mpnet-base-v2
pip install transformers sentence_transformers fpdf PyPDF2 pytesseract pypdfium2 docxpy gpt4all
```

6. After successfully installing pytesseract, you can find the folder containing all the contents of the pytesseract library in the Python installation directory.

    A common path where you might find the "site-packages" directory:

```
C:\Users\<YourUsername>\AppData\Local\Programs\Python\<PythonVersion>\Lib\site-packages
```
  Rename the folder containing the pytesseract library contents to "tesseract-ocr" and then copy it into the sub-directory 'RoleFitAI/jdResume' within the project.

7. Change the following var paths in main.py wrt to your project directory location:
```
extractor_model_dir = "path-to-dir-RoleFitAI\\jdResume\\keyphrase-extraction-kbir-inspec"
st_model_dir = "path-to-dir-RoleFitAI\\jdResume\\bert-base-nli-mean-tokens"
pytesseract.pytesseract.tesseract_cmd = r"path-to-dir-RoleFitAI\\jdResume\\tesseract-ocr\\tesseract.exe"
jd="path-to-dir-RoleFitAI\\job_description_final\\jd.pdf"
```

8. Change the following variable paths in jtjd.py wrt to your project directory location:
```
pytesseract.pytesseract.tesseract_cmd = r"path-to-dir-RoleFitAI\\jdResume\\tesseract-ocr\\tesseract.exe"
st_model_dir = "path-to-dir-RoleFitAI\\jdResume\\all-mpnet-base-v2"
```
  If you wish to utilize it, uncomment the GPT-4-All code in jtjd.py.
  
9. To open the homepage in your local browser at `http://localhost:5500/`, execute the following command in the VSCode terminal:

```bash
node server.js
