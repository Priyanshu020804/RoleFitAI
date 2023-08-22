import sys
import re
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
# from gpt4all import GPT4All
from fpdf import FPDF
from PyPDF2 import PdfReader
import pytesseract
import pypdfium2 as pdfium
import pathlib
import docxpy

pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", size = 15)
# gpt = GPT4All("E:\ML projects and competitons_\jd-resume-matcher\orca-mini-3b.ggmlv3.q4_0.bin")
pytesseract.pytesseract.tesseract_cmd = r"path-to-dir-RoleFitAI\\jdResume\\tesseract-ocr\\tesseract.exe"
st_model_dir = "path-to-dir-RoleFitAI\\jdResume\\all-mpnet-base-v2"
model = SentenceTransformer(st_model_dir)

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

def extract_sentences(text_):
  sentences = re.split(r'[.;]', text_)
  return [sentence.strip() for sentence in sentences if sentence.strip()]

def extract_words(sent_):
  sent_ = sent_.replace('-', ' ')
  word_list = sent_.split()
  cleaned_word_list = [re.sub(r'[^a-zA-Z0-9\s]', '', word).strip() for word in word_list if re.sub(r'[^a-zA-Z0-9\s]', '', word).strip()]
  return [word.lower() if word.islower() or (word[0].isupper() and word[1:].islower()) else word for word in cleaned_word_list]

def calc_sim_score(jt_, jd_):
  embed = model.encode([jt_, jd_])
  return cosine_similarity([embed[0]],embed[1:])[0][0]

def calc_com_score(jt_, jd_):
    jt_words = extract_words(jt_)
    jd_words = extract_words(jd_)
    com_words = set(jt_words).intersection(jd_words)
    return len(com_words)/len(jt_words)

def generate_additional_details_for_JD(text_):
  improved_text = "At Tech Solutions, we are driven by a shared mission to craft innovative products that address intricate challenges and enrich the lives of individuals. We are actively seeking a skilled Front End Engineer to amplify our dynamic team based in the vibrant city of San Francisco. We are in search of a Front End Engineer boasting a minimum of 2 years' experience in spearheading the development of scalable and intuitive web applications. The triumphant candidate should exhibit prowess in contemporary JavaScript frameworks and libraries, possess an adept command over HTML, CSS, and be well-versed in responsive design principles. This role holds the pivotal responsibility of shaping and executing user interfaces for our range of web applications. Innovate and actualize novel user-oriented features utilizing state-of-the-art JavaScript frameworks such as React.js, Vue.js, or Angular.js. Forge reusable code segments and libraries for future deployments. Validate the technical viability of UI/UX designs. Enhance application performance by optimizing for speed and scalability. Validate and sanitize user inputs before transmission to backend services. Foster a collaborative environment by actively engaging with cross-functional team members and stakeholders. 2+ years of hands-on experience as a Front End Developer or in a comparable role. Proficiency in web markup languages encompassing HTML5 and CSS3. Profound grasp of contemporary JavaScript programming, coupled with familiarity with libraries such as jQuery. Sound familiarity with contemporary front-end build pipelines and toolchains. Proficient experience in renowned front-end frameworks (e.g., React, Vue, Angular). Command over version control tools like Git. Bachelor's degree in Computer Science, Engineering, or an allied field. Attractive and competitive compensation package. Comprehensive health, dental, and vision insurance coverage. Opportunity for retirement savings with our dedicated plan. Access to professional growth and development pathways. Flexibility in work hours to achieve a healthy work-life balance. Tech Solutions stands as an equal opportunity employer, celebrating diversity and dedicated to nurturing an inclusive atmosphere for all employees. To initiate the application process, kindly forward your updated resume along with a succinct overview of your pertinent experience to hiring@techsolutions.com. Please note that while the content remains largely unchanged, the improved job description employs a more engaging tone, emphasizes the company's mission, and rephrases certain sections for enhanced readability and appeal."
  improved_sent = []
  start = 0
  sentence_length = 75
  while start + sentence_length <= len(improved_text):
    sentence = improved_text[start:start + sentence_length]
    improved_sent.append(sentence)
    start += sentence_length
  # chunk_size = 137
  # chunks = [text_[i:i+chunk_size] for i in range(0, len(text_), chunk_size)]
  # for chunk in chunks:
  #     improved_sent.append(gpt.generate(chunk, max_tokens=chunk_size)) 
  return improved_sent

def generate_improved_JD(improved_sent_, jt_):
   pdf.cell(200, 10, txt = jt_, ln = 1, align = 'C')
   for i in range(len(improved_sent_)):
    pdf.cell(200, 10, txt = improved_sent_[i], ln = i+2, align = 'C')
   pdf.output("D:\\web dev\\Axis\\job_description_final\\jd.pdf")

if __name__ == "__main__":
    jd_path = sys.argv[1] 
    jt = sys.argv[2]
    jd_text = text_extract(jd_path)
    jd_sentences = extract_sentences(jd_text)
    scores = []
    for sentence in jd_sentences:
        score = calc_sim_score(jt, sentence)
        scores.append(score)
    sim_score = 0.5*(max(scores) + calc_com_score(jt, jd_text))
    generate_improved_JD(generate_additional_details_for_JD(jd_text), jt)
    print(str(sim_score))
    sys.stdout.flush()
