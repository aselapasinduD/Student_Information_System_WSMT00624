import React, { Fragment, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import { Message } from "../states/type";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

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
  const [PDFURL, getPDFurl] = useState<string | undefined>(undefined);

  const handlePDFTemplatePreview = (event: React.MouseEvent<HTMLInputElement>) => {
    console.log("Handle PDF Preview is Working.");
    const currentElement = event.currentTarget;
    console.log(currentElement.value);
    if (currentElement.files && currentElement.files[0]) {
      const imageFile = currentElement.files[0];
      const url = URL.createObjectURL(imageFile);
      getPDFurl(url);
    } else {
      getPDFurl(undefined);
    }
  }

  const handlePDFUploadButton = () => {
    console.log("Handle PDF Upload button is working.");
    if (PDFfileRef && PDFfileRef.current) {
      const PDFInputElement = PDFfileRef.current;
      PDFInputElement.click();
    }
  }
  const handleSubmit = () => {
    console.log("Submit IS Working.");
  }

  console.log(PDFURL);

  return (
    <Fragment>
      <div className="form">
        <div style={!PDFURL ? { width: "40vw" } : {}}>
          <button type="button" className="btn-close" onClick={handleFormClose} aria-label="Close"></button>
          <div className="form-container">
            <h4 className="heading">Generate PDFs</h4>
            <form onSubmit={handleSubmit}>
              {!PDFURL ?
                <div>
                  <label htmlFor="excelFileUpload" className="form-label">Upload The Template</label>
                  <input type="file" id="excelFileUpload" accept=".pdf" onInput={handlePDFTemplatePreview} className="d-none" ref={PDFfileRef} />
                  <div className="w-100 d-flex mb-4 rounded-3 position-relative justify-content-center align-items-center overflow-hidden border" style={{ minHeight: '140px' }}>
                    <button type="button" className="btn btn-outline-secondary position-absolute" onClick={handlePDFUploadButton} >Upload The PDF Template</button>
                  </div>
                </div>
                :
                <div style={{ maxHeight: "75vh" }} className="border overflow-y-scroll">
                  <div>
                    <Document file={PDFURL}>
                      <Page pageNumber={1} renderTextLayer={false} renderAnnotationLayer={false} />
                    </Document>
                  </div>
                </div>
              }
            </form>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default GeneratePDFs;
