# RoleFitAI

**JOB PORTAL AND HRMS POWERED BY LLM**

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

3. Install the required Node.js libraries using the following command:

```bash
npm install express body-parser mysql2 path multer nodemailer
```

4. Install Python Libraries:
```
git clone https://huggingface.co/ml6team/keyphrase-extraction-kbir-inspec
git clone https://huggingface.co/sentence-transformers/bert-base-nli-mean-tokens
git clone https://huggingface.co/sentence-transformers/all-mpnet-base-v2
pip install transformers sentence_transformers fpdf PyPDF2 pytesseract pypdfium2 docxpy gpt4all
```

5. After successfully installing pytesseract, you can find the folder containing all the contents of the pytesseract library in the Python installation directory.

    A common path where you might find the "site-packages" directory:

```
C:\Users\<YourUsername>\AppData\Local\Programs\Python\<PythonVersion>\Lib\site-packages
```
  Rename the folder containing the pytesseract library contents to "tesseract-ocr" and then copy it into the sub-directory 'RoleFitAI/jdResume' within the project.

6. Change the following var paths in main.py wrt to your project directory location:
```
extractor_model_dir = "path-to-dir-RoleFitAI\\jdResume\\keyphrase-extraction-kbir-inspec"
st_model_dir = "path-to-dir-RoleFitAI\\jdResume\\bert-base-nli-mean-tokens"
pytesseract.pytesseract.tesseract_cmd = r"path-to-dir-RoleFitAI\\jdResume\\tesseract-ocr\\tesseract.exe"
jd="path-to-dir-RoleFitAI\\job_description_final\\jd.pdf"
```

Change the following variable paths in jtjd.py wrt to your project directory location:
```
pytesseract.pytesseract.tesseract_cmd = r"path-to-dir-RoleFitAI\\jdResume\\tesseract-ocr\\tesseract.exe"
st_model_dir = "path-to-dir-RoleFitAI\\jdResume\\all-mpnet-base-v2"
```

Uncomment the gpt4all code in jtjd.py if you want to use it 
