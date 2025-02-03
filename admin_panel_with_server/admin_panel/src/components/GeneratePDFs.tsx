import React, { Fragment, useEffect, useRef, useState } from "react";
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

import baseAPI from "../states/api";
import { Message } from "../states/type";

const chunkArray = (array: string[], chunks: number): string[][] => {
  const result = [];
  const chunkSize = Math.ceil(array.length / chunks);

  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = start + chunkSize;
    result.push(array.slice(start, end));
  }
  return result;
}

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
interface placeholderConfigurationsTypes {
  placeholderAmount: number,
  addressLines: number,
  placeholderInsideGap: number,
  placeholdersGap: number,
  pdfPageActualSize: null | { width: number, height: number }
  pdfFontWeight: FontWeight,
  pdfFontSize: number,
  pdfLineHeight: number,
}

interface PlaceholderProp {
  details: {
    name: string,
    phone: string,
    address: string
  },
  placeholderConfigurations: placeholderConfigurationsTypes,
  onPositionsChange?: (positions: { x: number, y: number }[]) => void;
}

const Placeholder: React.FC<PlaceholderProp> = ({ details, placeholderConfigurations, onPositionsChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const placeholderCardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const formatedAddress = chunkArray(details.address.split(", "), placeholderConfigurations.addressLines)
    .filter(chunk => chunk.length > 0)
    .map(chunk => chunk.join(", "))
    .join('<br />');

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
    if (onPositionsChange && placeholderCardRef.current) {
      const placeholderPositions = Array.from({ length: placeholderConfigurations.placeholderAmount }, (_, index) => {
        const yOffset = index * (placeholderConfigurations.placeholdersGap + placeholderCardRef.current!.offsetHeight);
        const xOffset = placeholderConfigurations.pdfPageActualSize!.width - (position.x + placeholderCardRef.current!.offsetWidth);
        return {
          x: position.x,
          y: position.y + yOffset + (placeholderCardRef.current!.offsetHeight / 2),
        };
      });
      onPositionsChange(placeholderPositions);
    }
  }, [position, placeholderConfigurations.placeholderAmount, placeholderConfigurations.placeholdersGap, onPositionsChange, placeholderCardRef, placeholderCardRef.current]);

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
    placeholderInside: {
      marginBottom: `${placeholderConfigurations.placeholderInsideGap}px`,
      fontSize: `${placeholderConfigurations.pdfFontSize}px`,
    },
    placeholderGap: {
      marginBottom: `${placeholderConfigurations.placeholdersGap}px`
    }
  };

  return (
    <div style={style.placeholderContainer}>
      <div ref={containerRef} style={{ width: "max-content", left: position.x, top: position.y }} className="position-relative">
        {Array.from({ length: placeholderConfigurations.placeholderAmount }).map((_, index) => (
          <div
            key={index}
            style={style.placeholderGap}
            onMouseDown={handleMouseDown}
            className="pdf-placeholder-card position-relative z-1 border border-blue px-1 bg-primary"
            ref={index === 0 ? placeholderCardRef : null}
          >
            <p className={`fw-${placeholderConfigurations.pdfFontWeight}`} style={{ ...style.placeholderInside, lineHeight: 1 }}>{details.name}</p>
            <p
              className={`fw-${placeholderConfigurations.pdfFontWeight}`}
              style={{ ...style.placeholderInside, lineHeight: `${placeholderConfigurations.pdfLineHeight}` }}
              dangerouslySetInnerHTML={{ __html: formatedAddress }}
            ></p>
            <p className={`fw-${placeholderConfigurations.pdfFontWeight}`} style={{ ...style.placeholderInside, lineHeight: 1 }}>{details.phone}</p>
          </div>
        ))}
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
 * @returns {JSX.Element}
 * @since 1.1.0
 */
const GeneratePDFs: React.FC<props> = ({ handleFormClose, collectNotifications, selectedStudents }) => {
  const PDFfileRef = useRef<HTMLInputElement | null>(null);
  const [PDFBlobURL, getPDFBlobURL] = useState<string | null>(null);
  const [DownloadLink, getDownloadLink] = useState<{ url: string, filename: string } | undefined>(undefined);
  const [isPDFGenerating, setIsPDFGenerating] = useState<boolean>(false);
  const [placeholderTestData, setPlaceholderTestData] = useState<{ name: string, phone: string, address: string }>({
    name: "Student Name",
    phone: "94734567890",
    address: "No. 45/12, Lakshmanperera Road, Kohuwala South, Nugegoda 10250, Western Province, Sri Lanka"
  });
  const [placeholderConfigurations, setPlaceholderConfigurations] = useState<placeholderConfigurationsTypes>({
    placeholderAmount: 1,
    addressLines: 2,
    placeholderInsideGap: 10,
    placeholdersGap: 20,
    pdfPageActualSize: null,
    pdfFontWeight: 'normal',
    pdfFontSize: 16,
    pdfLineHeight: 1,
  });
  const [placeholderPositions, getPlaceholderPositions] = useState<{ x: number; y: number }[] | null>(null);

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
          message: "PDF file not found. Please upload a template first.",
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
      formData.append('uploadPDF', PDFFile, "pdf-template.pdf");

      const response = await fetch(`${baseAPI}/admin-panel/generatepdfs`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const result = await response.json();
        collectNotifications(result);
        return;
      }

      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = (contentDisposition?.split("filename=")[1]?.replace(/"/g, "") ?? "generated-address-file") + ".pdf";

      const generatePDFBlob = await response.blob();
      const generatePDFURL = URL.createObjectURL(generatePDFBlob);

      getDownloadLink({ url: generatePDFURL, filename });
      collectNotifications({
        message: "PDFs generated successfully! Ready for download.",
        from: "Front App",
        error: false
      });

    } catch (error) {
      collectNotifications({
        message: error instanceof Error ? error.message : "PDF generation failed",
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
      setPlaceholderConfigurations((preValue) => ({ ...preValue, pdfPageActualSize: { width: viewport.width, height: viewport.height } }));
    });
  }

  return (
    <Fragment>
      <div className="form">
        <div className="d-flex flex-column" style={{ minWidth: "40vw" }}>
          <button type="button" className="btn-close" onClick={handleFormClose} aria-label="Close"></button>
          <div className="form-container generate-pdfs pt-3 pb-2">
            <h4>Generate PDFs</h4>
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
                        <input id="name" type="name" className="form-control w-25" placeholder="Full Name" onChange={(e) => setPlaceholderTestData((preValue) => ({ ...preValue, name: e.currentTarget.value }))} value={placeholderTestData.name} aria-label="Placeholder Example Full Name" aria-describedby="inputGroup-sizing-sm" maxLength={50} />
                        <input id="phone" type="tel" className="form-control w-25" placeholder="94734567890" onChange={(e) => setPlaceholderTestData((preValue) => ({ ...preValue, phone: e.currentTarget.value }))} value={placeholderTestData.phone} aria-label="Placeholder Phone Number" aria-describedby="inputGroup-sizing-sm" pattern="[0-9]{11}" maxLength={11} />
                      </div>
                      <div className="input-group mb-0">
                        <input id="address" type="text" className="form-control w-50" placeholder="Address" onChange={(e) => setPlaceholderTestData((preValue) => ({ ...preValue, address: e.currentTarget.value }))} value={placeholderTestData.address} aria-label="Placeholder Address" aria-describedby="inputGroup-sizing-sm" maxLength={200} />
                      </div>
                    </div>

                    <label htmlFor="placeholder-configurations" className="form-label text-center w-100 fs-6 fw-bold">Placeholder Configurations</label>
                    <div className="input-group input-group-sm mb-3">
                      <button
                        type="button"
                        className={`btn border fw-${placeholderConfigurations.pdfFontWeight}`}
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
                      <input
                        id="placeholder-line-height"
                        type="number"
                        className="form-control"
                        onChange={(e) => setPlaceholderConfigurations((preValue) => ({ ...preValue, pdfLineHeight: parseFloat(e.currentTarget.value) }))}
                        value={placeholderConfigurations.pdfLineHeight}
                        step={0.1}
                        min={1}
                        aria-lable="Text Line Height"
                        aria-describedby="inputGroup-sizing-sm"
                        required
                      />
                    </div>
                    <div className="input-group input-group-sm mb-3">
                      <span className="input-group-text" id="inputGroup-sizing-sm">Number Of Placeholders</span>
                      <input
                        id="placeholder-amount"
                        type="number"
                        className="form-control"
                        onChange={(e) => setPlaceholderConfigurations((preValue) => ({ ...preValue, placeholderAmount: parseInt(e.currentTarget.value) }))}
                        step={1}
                        min={1}
                        max={Math.min(10, selectedStudents.length)}
                        placeholder="Default is 1"
                        aria-label="Number of placeholder"
                        aria-describedby="inputGroup-sizing-sm"
                        required
                      />
                    </div>

                    <div className="input-group input-group-sm mb-3">
                      <span className="input-group-text" id="inputGroup-sizing-sm">Number Of Lines For Address</span>
                      <input
                        id="address-lines"
                        type="number"
                        className="form-control"
                        onChange={(e) => setPlaceholderConfigurations((preValue) => ({ ...preValue, addressLines: parseInt(e.currentTarget.value) }))}
                        step={1}
                        min={2}
                        max={5}
                        placeholder="Default is 2"
                        aria-label="Placeholder Address Lines"
                        aria-describedby="inputGroup-sizing-sm"
                        required
                      />
                    </div>

                    <div className="input-group input-group-sm mb-3">
                      <span className="input-group-text" id="inputGroup-sizing-sm">Placeholder Inside Gap</span>
                      <input
                        id="inside-gap"
                        type="number"
                        className="form-control"
                        onChange={(e) => setPlaceholderConfigurations((preValue) => ({ ...preValue, placeholderInsideGap: parseInt(e.currentTarget.value) }))}
                        step={1}
                        min={0}
                        max={80}
                        placeholder="Default is 10"
                        aria-label="Placeholder Inside Gap"
                        aria-describedby="inputGroup-sizing-sm"
                        required
                      />
                    </div>

                    <div className="input-group input-group-sm mb-3">
                      <span className="input-group-text" id="inputGroup-sizing-sm">Between Placeholders Gap</span>
                      <input
                        id="placeholders-gap"
                        type="number"
                        className="form-control"
                        onChange={(e) => setPlaceholderConfigurations((preValue) => ({ ...preValue, placeholdersGap: parseInt(e.currentTarget.value) }))}
                        step={1}
                        min={0}
                        placeholder="Default is 20"
                        aria-label="Between placeholders gap"
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

export default GeneratePDFs;
