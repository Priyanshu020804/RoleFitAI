from transformers import pipeline
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import re
import sys
from PyPDF2 import PdfReader
import pytesseract
import pypdfium2 as pdfium
import pathlib
import docxpy

extractor_model_dir = "D:\\web dev\\Axis\\jdResume\\keyphrase-extraction-kbir-inspec"
st_model_dir = "D:\\web dev\\Axis\\jdResume\\bert-base-nli-mean-tokens"
pytesseract.pytesseract.tesseract_cmd = r"D:\\web dev\\Axis\\jdResume\\tesseract-ocr\\tesseract.exe"
extractor = pipeline("token-classification", model=extractor_model_dir, tokenizer=extractor_model_dir)
model = SentenceTransformer(st_model_dir)
jd="D:\\web dev\\Axis\\job_description_final\\jd.pdf"

def pdf_classifier(inpath):
  extracted_text = ""
  with open(inpath, 'rb') as file:
    reader = PdfReader(file)
    for page in reader.pages:
      extracted_text += page.extract_text()
  threshold = 10  # if less than threshold characters are extracted, consider it scanned
  return len(extracted_text) <= threshold

def text_extract(inpath):

  file_extension = pathlib.Path(inpath).suffix

  if file_extension == ".txt":
    with open(inpath, "r", encoding="utf-8") as file:
      extracted_text = file.read()
    extracted_text = extracted_text.replace("\n", "")
    return re.sub(r'\s+', ' ', extracted_text)

  elif file_extension == ".pdf":
    if pdf_classifier(inpath):
      extracted_text = ''
      pdf = pdfium.PdfDocument(inpath)
      for page_number in range(len(pdf)):
        page = pdf.get_page(page_number)
        pil_image = page.render(scale = 3).to_pil()
        extracted_text += pytesseract.image_to_string(pil_image, lang='eng')
      return re.sub(r'\s+', ' ', extracted_text)
    else:
      extracted_text = ''
      reader = PdfReader(inpath)
      for page_number in range(len(reader.pages)):
        page = reader.pages[page_number]
        extracted_text += page.extract_text()
      return re.sub(r'\s+', ' ', extracted_text)

  elif file_extension == ".docx":
    extracted_text = docxpy.process(inpath)
    return re.sub(r'\s+', ' ', extracted_text)

  else:
    return

def extract_words(sent_):
  sent_ = sent_.replace('-', ' ')
  word_list = sent_.split()
  cleaned_word_list = [re.sub(r'[^a-zA-Z0-9\s]', '', word).strip() for word in word_list if re.sub(r'[^a-zA-Z0-9\s]', '', word).strip()]
  return [word.lower() if word.islower() or (word[0].isupper() and word[1:].islower()) else word for word in cleaned_word_list]

def keyword_extractor(doc_path_):
  keyword_set=set()
  txt = text_extract(doc_path_).replace("\n", " ")
  keywords = extractor(txt)
  for keyword in keywords:
    keyword_set.add(txt[keyword['start']:keyword['end']].lower())
  keyword_list =  list(keyword_set)
  if(len(keyword_list)==0):
    return extract_words(txt)
  return keyword_list

def process_resume(job_path_,resume_path_):
  score = 0
  job_ = keyword_extractor(job_path_)
  resume_=keyword_extractor(resume_path_)
  sen = job_ + resume_
  sen_embeddings = model.encode(sen)
  for i in range(len(job_)):
    if job_[i] in resume_:
      score += 1
    else:
      if max(cosine_similarity([sen_embeddings[i]],sen_embeddings[len(job_):])[0]) >= 0.4:
        score += max(cosine_similarity([sen_embeddings[i]],sen_embeddings[len(job_):])[0])
  score = score/len(job_)
  return round(score,3)


if __name__ == "__main__":
    resume_path = sys.argv[1]
    score = process_resume(jd, resume_path)
    print(str(score))
    sys.stdout.flush()



