import React, { Fragment, useRef, useState } from "react";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

import baseAPI from "../states/api";
import { Message } from "../states/type";

interface PDFDocumentProps {
  pdfArrayBuffer: ArrayBuffer;
}

const PDFDocument: React.FC<PDFDocumentProps> = ({ pdfArrayBuffer }) => {
  const pdfUint8Array = new Uint8Array(pdfArrayBuffer);
  return (
    <Worker workerUrl={`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`}>
      <div style={{ width: '40vw' }}>
        <Viewer fileUrl={pdfUint8Array} />
      </div>
    </Worker>
  );
}

interface props {
  handleFormClose: () => void;
  collectNotifications: (notification: Message) => void;
}
/**
 * Add form component for google forms.
 * 
 * @param {functions} handleFormClose - Controle Form Close
 * @param {functions} collectNotifications - Notification Collect Function
 * @returns {JSX.Element}
 * @since 1.1.0
 */
const GeneratePDFs: React.FC<props> = ({ handleFormClose, collectNotifications }) => {
  const PDFfileRef = useRef<HTMLInputElement | null>(null);
  const [PDFArrayBuffer, getPDFArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [DownloadLink, getDownloadLink] = useState<string | null>(null);

  const handlePDFTemplatePreview = async (event: React.MouseEvent<HTMLInputElement>) => {
    const currentElement = event.currentTarget;

    if (!currentElement.files || !currentElement.files[0]) {
      getPDFArrayBuffer(null);
      return;
    }

    const file = currentElement.files[0];

    try {
      // const uploadResponse = await uploadPDFFile(file);
      // if (!uploadResponse.ok) {
      //   console.error('Failed to upload PDF file');
      //   return;
      // }

      // const uploadData = await uploadResponse.json();
      // if (uploadData.error) {
      //   console.error('Error in upload response:', uploadData.error);
      //   return;
      // }

      const reader = new FileReader();
      reader.onload = () => {
        const buffer = reader.result;
        getPDFArrayBuffer(buffer as ArrayBuffer);
      };
      reader.readAsArrayBuffer(file);

    } catch (error) {
      console.error('An error occurred:', error);
      getPDFArrayBuffer(null);
    }
  };

  const uploadPDFFile = async (file: File) => {
    const formData = new FormData();
    formData.append('uploadPDF', file);

    return fetch(`${baseAPI}/admin-panel/generatepdfs`, {
      method: 'POST',
      body: formData,
    });
  };

  const handlePDFUploadButton = () => {
    console.log("Handle PDF Upload button is working.");
    if (PDFfileRef && PDFfileRef.current) {
      const PDFInputElement = PDFfileRef.current;
      PDFInputElement.click();
    }
  }
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Submit IS Working.");
    getDownloadLink("downlod Link");
  }

  const style = {
    btnDownload: {
      top: 0,
    },
    btnGenerate: {
      top: "-40px",
    }
  }

  return (
    <Fragment>
      <div className="form">
        <div style={!PDFArrayBuffer ? { width: "40vw" } : {}}>
          <button type="button" className="btn-close" onClick={handleFormClose} aria-label="Close"></button>
          <div className="form-container generate-pdfs pt-3 pb-2">
            <h4>Generate PDFs</h4>
            {PDFArrayBuffer ?
              <div>
                <label htmlFor="excelFileUpload" className="form-label">Upload The Template</label>
                <input type="file" id="excelFileUpload" accept=".pdf" onInput={handlePDFTemplatePreview} className="d-none" ref={PDFfileRef} />
                <div className="w-100 d-flex mb-4 rounded-3 position-relative justify-content-center align-items-center overflow-hidden border" style={{ minHeight: '140px' }}>
                  <button type="button" className="btn btn-outline-secondary position-absolute" onClick={handlePDFUploadButton} >Upload The PDF Template</button>
                </div>
              </div>
              :
              <form onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="placeholder-values" className="form-label fs-6">Placeholder Templates</label>
                  <div className="input-group input-group-sm mb-3">
                    <input id="title" type="name" className="form-control w-25" placeholder="Full Name" aria-label="Placeholder Example Full Name" aria-describedby="inputGroup-sizing-sm" maxLength={50} />
                    <input id="phone" type="tel" className="form-control w-25" placeholder="94734567890" aria-label="Placeholder Phone Number" aria-describedby="inputGroup-sizing-sm" pattern="[0-9]{11}" maxLength={11} />
                    <input id="address" type="text" className="form-control w-50" placeholder="Address" aria-label="Placeholder Address" aria-describedby="inputGroup-sizing-sm" maxLength={200} />
                  </div>
                </div>
                <div style={{ maxHeight: "75vh" }} className="overflow-y-scroll">
                  <div id="pdf-render-root" className="border">
                    {/*<PDFDocument pdfArrayBuffer={PDFArrayBuffer} />*/}
                  </div>
                </div>
                <div className="mt-2">
                  <label htmlFor="placeholder-configurations" className="form-label text-center w-100 fs-6 fw-bold">Placeholder Configurations</label>
                  <div className="input-group input-group-sm mb-3">
                    <input id="address-lines" type="number" className="form-control w-50" step="1" min="2" placeholder="Lines" aria-label="Placeholder Address Lines" aria-describedby="inputGroup-sizing-sm" name="address-lines" maxLength={50} required />
                  </div>
                  <div className="d-flex flex-column position-relative overflow-hidden">
                    <div className="position-relative btn-generate-pdfs" style={DownloadLink ? style.btnGenerate : {}}>
                      <div className="progress position-absolute top-0 w-100 h-100">
                        <div className={`progress-bar ${DownloadLink ? "progress-bar-striped progress-bar-animated" : ""} bg-warning w-100`} role="progressbar"></div>
                      </div>
                      <button type="submit" className="btn w-100 position-relative z-1 fw-bold">Generate</button>
                    </div>
                    <button className="btn btn-primary fw-bold position-absolute w-100 btn-download-pdfs" style={DownloadLink ? style.btnDownload : {}}>Download</button>
                  </div>
                </div>
              </form>
            }
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default GeneratePDFs;
