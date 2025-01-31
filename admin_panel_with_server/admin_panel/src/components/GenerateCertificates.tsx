import React, { Fragment, useEffect, useRef, useState } from "react";
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

import baseAPI from "../states/api";
import { Message } from "../states/type";

interface PDFDocumentProps {
  pdfArrayBuffer: string;
  onPDFRender: (value: any) => void;
}

const PDFDocument: React.FC<PDFDocumentProps> = ({ pdfArrayBuffer, onPDFRender }) => {
  return (
    <Worker workerUrl={`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`}>
      <div style={{ width: '40vw' }}>
        <Viewer
          fileUrl={pdfArrayBuffer}
          defaultScale={SpecialZoomLevel.ActualSize}
          onDocumentLoad={onPDFRender}
        />
      </div>
    </Worker>
  );
}

type FontWeight = 'normal' | 'medium' | 'bold';
type TextTransform = 'Aa' | 'aa' | 'AA';
interface placeholderConfigurationsTypes {
  pdfPageActualSize: null | { width: number, height: number }
  pdfFontWeight: FontWeight,
  pdfFontSize: number,
  pdfTextTransform: TextTransform,
}

interface PlaceholderProp {
  details: {
    name: string,
  },
  placeholderConfigurations: placeholderConfigurationsTypes,
  onPositionsChange?: (positions: { x: number, y: number }) => void;
}

const Placeholder: React.FC<PlaceholderProp> = ({ details, placeholderConfigurations, onPositionsChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setOffset({
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    });
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (isDragging && placeholderConfigurations.pdfPageActualSize) {
      const { width: pageWidth, height: pageHeight } = placeholderConfigurations.pdfPageActualSize;
      let newX = event.clientX - offset.x;
      let newY = event.clientY - offset.y;

      newX = Math.max(0, Math.min(newX, pageWidth - containerRef.current!.offsetWidth));
      newY = Math.max(0, Math.min(newY, pageHeight - containerRef.current!.offsetHeight));

      setPosition({
        x: newX,
        y: newY,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (onPositionsChange && containerRef.current) {
      const width = containerRef.current.offsetWidth;
      const placeholderPosition = {
        x: position.x + width / 2,
        y: position.y,
      };
      onPositionsChange(placeholderPosition);
    }
  }, [position, placeholderConfigurations, onPositionsChange, containerRef, containerRef.current]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const style = {
    placeholderContainer: {
      width: `${placeholderConfigurations.pdfPageActualSize?.width}px`,
      margin: "auto",
    },
    placeholderStyle: {
      fontSize: `${placeholderConfigurations.pdfFontSize}px`,
      width: "max-content",
      left: position.x,
      top: position.y,
      textTransform: placeholderConfigurations.pdfTextTransform === "Aa" ? "capitalize" as 'capitalize' : placeholderConfigurations.pdfTextTransform === "AA" ? "uppercase" as 'uppercase' : "lowercase" as 'lowercase',
    }
  };

  return (
    <div style={style.placeholderContainer}>
      <div
        ref={containerRef}
        style={style.placeholderStyle}
        onMouseDown={handleMouseDown}
        className="pdf-placeholder-card position-relative z-1 border border-blue px-1 bg-primary"
      >
        <p className={`m-0 fw-${placeholderConfigurations.pdfFontWeight}`} style={{ lineHeight: 1 }}>{details.name}</p>
      </div>
    </div>
  );
};

interface props {
  handleFormClose: () => void;
  collectNotifications: (notification: Message) => void;
  selectedStudents: readonly number[];
}
/**
 * Add form component for google forms.
 * 
 * @param {functions} handleFormClose - Controle Form Close
 * @param {functions} collectNotifications - Notification Collect Function
 * @param {functions} selectedStudents
 * @returns {JSX.Element}
 * @since 1.1.0
 */
const GenerateCertificates: React.FC<props> = ({ handleFormClose, collectNotifications, selectedStudents }) => {
  const PDFfileRef = useRef<HTMLInputElement | null>(null);
  const [PDFBlobURL, getPDFBlobURL] = useState<string | null>(null);
  const [DownloadLink, getDownloadLink] = useState<{ url: string, filename: string } | undefined>(undefined);
  const [isPDFGenerating, setIsPDFGenerating] = useState<boolean>(false);
  const [placeholderTestData, setPlaceholderTestData] = useState<{ name: string }>({
    name: "Student Name",
  });
  const [placeholderConfigurations, setPlaceholderConfigurations] = useState<placeholderConfigurationsTypes>({
    pdfPageActualSize: null,
    pdfFontWeight: 'normal',
    pdfFontSize: 16,
    pdfTextTransform: "Aa"
  });
  const [placeholderPositions, getPlaceholderPositions] = useState<{ x: number; y: number } | null>(null);

  const handlePDFTemplatePreview = async (event: React.MouseEvent<HTMLInputElement>) => {
    const currentElement = event.currentTarget;
    if (!currentElement.files || !currentElement.files[0]) {
      getPDFBlobURL(null);
      return;
    }
    const file = currentElement.files[0];
    getPDFBlobURL(URL.createObjectURL(file));
  };

  const uploadPDFFile = async (formData: FormData) => {
    try {
      if (!PDFBlobURL) {
        collectNotifications({
          message: "PDF template file not found. Please upload a template first.",
          from: "Front App",
          error: true
        });
        return;
      }

      setIsPDFGenerating(true);

      const fetchBlob = await fetch(PDFBlobURL);
      const PDFFile = await fetchBlob.blob();

      formData.append("placeholderConfigurations", JSON.stringify(placeholderConfigurations));
      formData.append("placeholderPositions", JSON.stringify(placeholderPositions));
      formData.append("selectedStudents", JSON.stringify(selectedStudents));
      formData.append('uploadPDF', PDFFile, "pdf-certificate-template.pdf");

      const response = await fetch(`${baseAPI}/admin-panel/generatecertificate`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const result = await response.json();
        collectNotifications(result);
        return;
      }

      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = (contentDisposition?.split("filename=")[1]?.replace(/"/g, "") ?? "generated-certificates-file") + ".pdf";

      const generatePDFBlob = await response.blob();
      const generatePDFURL = URL.createObjectURL(generatePDFBlob);

      getDownloadLink({ url: generatePDFURL, filename });
      collectNotifications({
        message: "Certificates generated successfully! Ready for download.",
        from: "Front App",
        error: false
      });

    } catch (error) {
      collectNotifications({
        message: error instanceof Error ? error.message : "Certificate generation failed",
        from: "Front App",
        error: true
      });
    } finally {
      setIsPDFGenerating(false);
    }
  };

  const handlePDFUploadButton = () => {
    if (PDFfileRef && PDFfileRef.current) {
      const PDFInputElement = PDFfileRef.current;
      PDFInputElement.click();
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    uploadPDFFile(formData);
  }

  const style = {
    btnDownload: {
      top: 0,
    },
    btnGenerate: {
      top: "-40px",
    }
  }

  useEffect(() => {
    getDownloadLink(undefined);
  }, [placeholderConfigurations, placeholderPositions]);

  const onPDFRender = (event: any) => {
    const { doc } = event;
    doc.getPage(1).then((page: any) => {
      const viewport = page.getViewport({ scale: 1 });
      console.log(viewport.width + " - " + viewport.height);
      setPlaceholderConfigurations((preValue) => ({ ...preValue, pdfPageActualSize: { width: viewport.width, height: viewport.height } }));
    });
  }

  return (
    <Fragment>
      <div className="form">
        <div style={{ minWidth: "40vw" }}>
          <button type="button" className="btn-close" onClick={handleFormClose} aria-label="Close"></button>
          <div className="form-container generate-pdfs pt-3 pb-2">
            <h4>Generate Certificates</h4>
            {!PDFBlobURL ?
              <div>
                <label htmlFor="excelFileUpload" className="form-label">Upload The Template</label>
                <input type="file" id="excelFileUpload" accept=".pdf" onInput={handlePDFTemplatePreview} className="d-none" ref={PDFfileRef} />
                <div className="w-100 d-flex mb-4 rounded-3 position-relative justify-content-center align-items-center overflow-hidden border" style={{ minHeight: '140px' }}>
                  <button type="button" className="btn btn-outline-secondary position-absolute" onClick={handlePDFUploadButton} >Upload The PDF Template</button>
                </div>
              </div>
              :
              <form onSubmit={handleSubmit}>
                <div className="d-flex gap-3">
                  <div>

                    <label htmlFor="placeholder-values" className="form-label w-100 text-center fs-6 fw-bold">Placeholder Templates</label>
                    <div className="mb-3">
                      <div className="input-group input-group-sm mb-0">
                        <input
                          id="placeholder-student-name"
                          type="name"
                          className="form-control w-25"
                          placeholder="Full Name"
                          onChange={(e) => setPlaceholderTestData({ name: e.currentTarget.value })}
                          value={placeholderTestData.name}
                          aria-label="Placeholder Example Full Name"
                          aria-describedby="inputGroup-sizing-sm"
                          maxLength={50}
                        />
                      </div>
                    </div>

                    <label htmlFor="placeholder-configurations" className="form-label text-center w-100 fs-6 fw-bold">Placeholder Configurations</label>
                    <div className="input-group input-group-sm mb-3">
                      <button
                        type="button"
                        className={`btn border fw-${placeholderConfigurations.pdfFontWeight}`}
                        style={{ width: "40px" }}
                        onClick={() =>
                          setPlaceholderConfigurations((preValue) => {
                            const preFontWeight = preValue.pdfFontWeight;
                            const listOfWeights: FontWeight[] = ['normal', 'medium', 'bold'];
                            return { ...preValue, pdfFontWeight: listOfWeights[(listOfWeights.indexOf(preFontWeight) + 1) % listOfWeights.length] }
                          }
                          )}
                      >
                        B
                      </button>
                      <button
                        type="button"
                        className="btn border btn-sm"
                        style={{ width: "40px" }}
                        onClick={() =>
                          setPlaceholderConfigurations((preValue) => {
                            const listOfTextTransforms: TextTransform[] = ['Aa', 'AA', "aa"];
                            return { ...preValue, pdfTextTransform: listOfTextTransforms[(listOfTextTransforms.indexOf(preValue.pdfTextTransform) + 1) % listOfTextTransforms.length] }
                          }
                          )}
                      >
                        {placeholderConfigurations.pdfTextTransform}
                      </button>
                      <input
                        id="placeholder-font-size"
                        type="number"
                        className="form-control"
                        onChange={(e) => setPlaceholderConfigurations((preValue) => ({ ...preValue, pdfFontSize: parseInt(e.currentTarget.value) }))}
                        value={placeholderConfigurations.pdfFontSize}
                        step={1}
                        min={4}
                        placeholder="Font Size"
                        aria-lable="Placeholders Font Size"
                        aria-describedby="inputGroup-sizing-sm"
                        required
                      />
                    </div>
                    <div className="d-flex flex-column position-relative overflow-hidden">
                      <div className="position-relative btn-generate-pdfs" style={DownloadLink ? style.btnGenerate : {}}>
                        <div className="progress position-absolute top-0 w-100 h-100">
                          <div className={`progress-bar ${isPDFGenerating ? "progress-bar-striped progress-bar-animated" : ""} bg-warning w-100`} role="progressbar"></div>
                        </div>
                        <button type="submit" className="btn w-100 position-relative z-1 fw-bold">Generate</button>
                      </div>
                      <a className="btn btn-primary fw-bold position-absolute w-100 btn-download-pdfs" href={DownloadLink?.url} download={DownloadLink?.filename} style={DownloadLink ? style.btnDownload : {}}>Download</a>
                    </div>
                  </div>

                  <div style={{ maxHeight: "calc(85vh - 24px)" }} className="overflow-y-scroll">
                    <div id="pdf-render-root" className="border position-relative">
                      {placeholderConfigurations.pdfPageActualSize ?
                        <div className="position-absolute w-100 h-100">
                          <Placeholder
                            details={placeholderTestData}
                            placeholderConfigurations={placeholderConfigurations}
                            onPositionsChange={getPlaceholderPositions}
                          />
                        </div>
                        :
                        <>
                        </>
                      }
                      <PDFDocument pdfArrayBuffer={PDFBlobURL} onPDFRender={onPDFRender} />
                    </div>
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

export default GenerateCertificates;
