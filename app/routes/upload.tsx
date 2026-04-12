import React, { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router';
import FileUploader from '~/components/FileUploader';
import Navbar from '~/components/Navbar'
import { convertPdfToImage } from '~/lib/pdf2img';
import { usePuterStore } from '~/lib/puter';
import { generateUUID } from '~/lib/utils';
import { prepareInstructions } from '../../constants';

const upload = () => {

const {auth,isLoading, fs,ai,kv} = usePuterStore();
const navigate = useNavigate();

 const[isProcessing, setIsProcessing]  = useState(false);
 const [statusText, setStatusText] = useState("");
 const[file, setFile] = useState<File | null>(null);

 const handleFileSelect = (file: File | null) => {
  setFile(file);
  }

  const handleAnalysis = async ({ companyName, jobTitle, jobDescription ,file}: { companyName: string; jobTitle: string; jobDescription: string; file: File  }) => {
    setIsProcessing(true);
    setStatusText("Analyzing your resume...");

    const uploadedFile = await fs.upload([file]);

    if (!uploadedFile) {
      setIsProcessing(false);
      return setStatusText("Failed to upload resume. Please try again.");
    }

    setStatusText('converting to image...');
    const imgFile = await convertPdfToImage(file);

    if (!imgFile.file) {
      setIsProcessing(false);
      console.error('PDF conversion failed:', imgFile.error);
      return setStatusText(imgFile.error ?? "Failed to convert resume to image. Please try again.");
    }
    setStatusText('Saving data...');

    const savedFile = await fs.upload([imgFile.file]);
    if (!savedFile) {
      setIsProcessing(false);
      return setStatusText("Failed to save resume image. Please try again.");
    }
    setStatusText('Generating feedback with AI...');

    const uuid = generateUUID();

    const data = {
      id: uuid,
      resumePath: savedFile.path,
      imagePath: savedFile.path,
      companyName,
      jobTitle,
      jobDescription,
      feedback:'',
    }

    await kv.set(`resume:${uuid}`, JSON.stringify(data));

    setStatusText('Analysis complete! Redirecting to results page...');


    const feedback = await ai.feedback(
      uploadedFile.path,
      prepareInstructions({jobDescription,jobTitle})
    )
   if (!feedback) {
    setIsProcessing(false);
    return setStatusText("Failed to get feedback from AI. Please try again.");
   }
   const feedbackText = typeof feedback.message.content === 'string' ? feedback.message.content : feedback.message.content[0].text;

    data.feedback = JSON.parse(feedbackText);
    await kv.set(`resume:${uuid}`, JSON.stringify(data));

   setStatusText('Redirecting to results page...');
   setIsProcessing(false);
   console.log("result",data)
   navigate(`/resume/${uuid}`);

  }

 const handleSubmit = (e:FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const form = e.currentTarget.closest('form');
  if(!form) return;

  const formData = new FormData(form);

  const companyName = formData.get('company-name') as string;
  const jobTitle = formData.get('job-title') as string;
  const jobDescription = formData.get('job-description') as string;
  
  if(!file) {
    alert("Please upload a resume before submitting.");
    return;
  }
  
  handleAnalysis({ companyName, jobTitle, jobDescription, file: file as File });
 }

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar/>

    <section className="main-section">
        <div className='page-heading py-16'>
              <h1>Smart Feedback For Your Dream Job</h1>
              {isProcessing ? (
                <>
                <h2>{statusText}</h2>
                <img src='/images/resume-scan.gif' className='w-full' />
                </>
              ): (
                <p>Upload your resume to get started for ATS optimization! </p>
              )}
              {!isProcessing && (
               <form  id='upload-form' onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8'>
                <div className='form-div'>
                  <label htmlFor='company-name'>Company Name</label>
                  <input type='text' id='company-name' name='company-name' placeholder='Company Name' />
                </div>

                    <div className='form-div'>
                  <label htmlFor='job-title'>Job Title</label>
                  <input type='text' id='job-title' name='job-title' placeholder='Job Title' />
                </div>

                    <div className='form-div'>
                  <label htmlFor='job-description'>Job Description</label>
                  <textarea rows={5} id='job-description' name='job-description' placeholder='Job Description' />
                </div>

                    <div className='form-div'>
                  <label htmlFor='uploader'>Upload Resume</label>
                  <FileUploader onFileSelect={handleFileSelect} />

                </div>

                <button className='primary-button' type='submit'>
                 Analyze Resume
                </button>

               </form>
              )}
        </div>
    </section>
    </main>
  )
}

export default upload