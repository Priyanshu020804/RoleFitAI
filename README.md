# RoleFitAI
JOB PORTAL AND HRMS POWERED BY LLM

Create these empty folders in the project directory - 
job_description_final
job_description_upload
uploads

Install these Node.js libraries before running the code (using npm install cmd)- 
express
body-parser
mysql2
path
multer
nodemailer

Install these python libraries before running the code (using pip install cmd)- 
git clone https://huggingface.co/ml6team/keyphrase-extraction-kbir-inspec
git clone https://huggingface.co/sentence-transformers/bert-base-nli-mean-tokens
git clone https://huggingface.co/sentence-transformers/all-mpnet-base-v2
transformers
sentence_transformers
fpdf
PyPDF2
pytesseract
pypdfium2
docxpy
gpt4all (if required)

Change the following var paths in main.py wrt to your project directory location- 
extractor_model_dir = "D:\\web dev\\Axis\\jdResume\\keyphrase-extraction-kbir-inspec"
st_model_dir = "D:\\web dev\\Axis\\jdResume\\bert-base-nli-mean-tokens"
pytesseract.pytesseract.tesseract_cmd = r"D:\\web dev\\Axis\\jdResume\\tesseract-ocr\\tesseract.exe"
extractor = pipeline("token-classification", model=extractor_model_dir, tokenizer=extractor_model_dir)
model = SentenceTransformer(st_model_dir)
jd="D:\\web dev\\Axis\\job_description_final\\jd.pdf"

Change the following var paths in jtjd.py wrt to your project directory location- 
pytesseract.pytesseract.tesseract_cmd = r"D:\\web dev\\Axis\\jdResume\\tesseract-ocr\\tesseract.exe"
st_model_dir = "D:\\web dev\\Axis\\jdResume\\all-mpnet-base-v2"
model = SentenceTransformer(st_model_dir)

Uncomment the gpt4all code in jtjd.py if you want to use it 
