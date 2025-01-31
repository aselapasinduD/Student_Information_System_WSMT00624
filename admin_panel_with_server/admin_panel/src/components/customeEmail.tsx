import React, { Fragment, useEffect, useRef, useState } from "react";
import Chip from '@mui/material/Chip';

import AlertDialog from "./alertDialog";
import baseAPI from '../states/api';

interface Notification {
    message: string;
    from: string;
    error: boolean;
    imagepath?: string;
}

interface CustomeEmail {
    id: readonly number[];
    handleFormClose: () => void;
    collectNotifications: (notification: Notification) => void;
}

interface position {
    x: number;
    y: number;
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const CustomEmail: React.FC<CustomeEmail> = ({ id, handleFormClose, collectNotifications }) => {
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const textPlaceholderRef = useRef<HTMLDivElement | null>(null);

    const [isHtmlContent, getIsHtmlContent] = useState<string>("html");
    const [isDialogOpen, getIsDialogOpen] = useState<boolean>(false);
    const [formData, getFormData] = useState<FormData | null>(null);
    const [progress, getProgress] = useState<number>(0);
    const [imageURL, getImageURL] = useState<string | undefined>(undefined);
    const [placeholderSize, getPlaceholderSize] = useState<number>(14);
    const [viewFontSize, setViewFontSize] = useState<number>(placeholderSize);
    const [placeholderText, setPlaceholderText] = useState<string>("Placeholder Text");
    const [placeholderTextPosition, setPlaceholderTextPosition] = useState<position>({ x: 0, y: 0 });
    const [originalImageSize, setOriginalImageSize] = useState<position>({ x: 0, y: 0 });
    const [textTransform, setTextTransform] = useState<string>("Aa");

    const submitForm = async (formData: FormData) => {
        let numberOfIds = id.length;
        let imagePath = "";
        do {
            try {
                numberOfIds--;
                formData.set("id", `${id[numberOfIds]}`);
                if (imagePath !== "") {
                    formData.delete('imageFile');
                    if (formData.has('imagepath')) {
                        formData.set('imagepath', imagePath);
                    } else {
                        formData.append('imagepath', imagePath);
                    }
                }
                const response = await fetch(baseAPI + "/mail", {
                    method: "POST",
                    body: formData
                })
                if (response.ok) {
                    const notification = await response.json();
                    if (notification.imagepath) {
                        imagePath = notification.imagepath;
                    }
                    if (typeof notification.message === 'object') {
                        collectNotifications({ ...notification.message, from: "Main Server" });
                    } else {
                        collectNotifications(notification);
                    }
                } else {
                    console.log("Add Student didn't Success");
                    collectNotifications({ message: "Error while sending the emails.", from: "Main Server", error: true });
                }
                await sleep(1000);
            } catch (error) {
                console.log("Error fetching email from server: ", error);
                collectNotifications({ message: "Error fetching emails to the server.", from: "Front End", error: true });
            }
            getProgress(Math.round(100 - (numberOfIds / id.length) * 100));
        } while (numberOfIds > 0)
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        getIsDialogOpen(true);
        getProgress(0);

        let formData = new FormData(event.currentTarget as HTMLFormElement);

        const values = Object.fromEntries(formData);
        console.log(values.value);

        formData.append("ishtml", isHtmlContent);
        formData.append("textposition", JSON.stringify(placeholderTextPosition));
        formData.append("textsize", placeholderSize.toString());
        formData.append('texttransform', textTransform === "Aa" ? "capitalize" : textTransform === "AA" ? "uppercase" : "lowercase");
        getFormData(formData);
    }

    const handleFormSubmitConform = async (isConfirm: boolean) => {
        if (!isConfirm) return;
        if (!formData) return;
        if (!isDialogOpen) return;
        getIsDialogOpen(false);
        await submitForm(formData);
    }

    const handleImageUpload = (event: React.MouseEvent<HTMLInputElement>) => {
        const currentElement = event.currentTarget;
        console.log(currentElement.value);
        if (currentElement.files && currentElement.files[0]) {
            const imageFile = currentElement.files[0];
            const url = URL.createObjectURL(imageFile);
            const img = new Image();
            img.onload = () => {
                setOriginalImageSize({ x: img.width, y: img.height });
                URL.revokeObjectURL(url);
            }
            img.src = url
            getImageURL(url);
        } else {
            getImageURL(undefined);
        }
    }

    const handleImageUploadButton = () => {
        if (imageInputRef && imageInputRef.current) {
            imageInputRef.current.click();
        }
    }

    const handleImageRemoveButton = () => {
        if (Boolean(imageURL)) {
            if (imageInputRef && imageInputRef.current) {
                imageInputRef.current.value = "";
            }
            getImageURL(undefined);
        }
    }

    const handleDragPlaceholder = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (textPlaceholderRef && textPlaceholderRef.current) {
            const textPlaceholderParent = textPlaceholderRef.current.parentElement!;
            const textPlaceholder = textPlaceholderRef.current;
            const textPlaceholderParentRect = textPlaceholderParent.getBoundingClientRect();
            const textPlaceholderRect = textPlaceholder.getBoundingClientRect();

            const initialOffsetX = event.nativeEvent.offsetX;
            const initialOffsetY = event.nativeEvent.offsetY;

            const mouseMoveHandler = (moveEvent: MouseEvent) => {
                const movePositionX = moveEvent.clientX - textPlaceholderParentRect.left - initialOffsetX;
                const movePositionY = moveEvent.clientY - textPlaceholderParentRect.top - initialOffsetY;

                const boxedPositionX = Math.max(0, Math.min(movePositionX, textPlaceholderParentRect.width - textPlaceholderRect.width));
                const boxedPositionY = Math.max(0, Math.min(movePositionY, textPlaceholderParentRect.height - textPlaceholderRect.height));

                // console.log(originalImageSize);

                const actualPositionX = ((boxedPositionX + textPlaceholderRect.width / 2) / textPlaceholderParentRect.width) * originalImageSize.x;
                const actualPositionY = (boxedPositionY / textPlaceholderParentRect.height) * originalImageSize.y

                // setPlaceholderTextPosition({
                //     x: (actualPositionX / originalImageSize.x) * textPlaceholderParentRect.width,
                //     y: (actualPositionY / originalImageSize.y) * textPlaceholderParentRect.height
                // });

                // Actual position in image
                setPlaceholderTextPosition({
                    x: actualPositionX,
                    y: actualPositionY
                });

                textPlaceholder.style.left = `${boxedPositionX}px`;
                textPlaceholder.style.top = `${boxedPositionY}px`;
            }

            const mouseUpHandler = () => {
                document.removeEventListener("mousemove", mouseMoveHandler);
                document.removeEventListener("mouseup", mouseUpHandler);
                console.log(placeholderTextPosition);
            }

            document.addEventListener("mousemove", mouseMoveHandler);
            document.addEventListener("mouseup", mouseUpHandler);
        }
    }

    useEffect(() => {
        if (textPlaceholderRef && textPlaceholderRef.current) {
            const textPlaceholderParent = textPlaceholderRef.current.parentElement!;
            const textPlaceholderParentRect = textPlaceholderParent.getBoundingClientRect();

            const widthScale = textPlaceholderParentRect.width / originalImageSize.x;
            const heightScale = textPlaceholderParentRect.height / originalImageSize.y;

            const scale = Math.min(widthScale, heightScale);
            console.log(scale);
            setViewFontSize(placeholderSize * scale);
        }
    }, [placeholderSize, originalImageSize.x, originalImageSize.y]);

    return (
        <Fragment>
            <div className="form">
                <div className="h-100 position-relative">
                    <button type="button" className="btn-close" onClick={handleFormClose} aria-label="Close"></button>
                    <div className="form-container mailform-container">
                        <h4 className="heading">Send Mail</h4>
                        <h6>Number of receivers: {id.length}</h6>
                        <form onSubmit={handleSubmit} style={{ marginBottom: 10 }}>
                            <div className="mb-4">
                                <label htmlFor="validationTextarea" className="form-label">Subject <small>*</small></label>
                                <input id="subject" type="text" className="form-control" placeholder="Subject" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" name="subject" required />
                            </div>
                            <div className="mb-3">
                                <div className="textarea-header">
                                    <label htmlFor="validationTextarea" className="form-label">Mail Content <small>*</small></label>
                                    <div>
                                        <input className="form-check-input" type="radio" value="text-content" name="flexRadioDefault" checked={isHtmlContent === "text-content"} onChange={(e) => getIsHtmlContent(e.target.value)} style={{ marginRight: "10px" }} id="flexRadioDefault1" />
                                        <label className="form-check-label" htmlFor="flexRadioDefault1" style={{ marginRight: "20px" }}>Text-Content</label>

                                        <input className="form-check-input" type="radio" value="html" name="flexRadioDefault" checked={isHtmlContent === "html"} onChange={(e) => getIsHtmlContent(e.target.value)} style={{ marginRight: "10px" }} id="flexRadioDefault2" />
                                        <label className="form-check-label" htmlFor="flexRadioDefault2">HTML</label>
                                    </div>
                                </div>
                                <textarea className="form-control" id="validationTextarea" rows={12} placeholder="Required Content" name="emailcontent" required />
                                <div className="invalid-feedback">Please enter a message in the textarea.</div>
                                <p>{"{{full_name}} , {{email}} , {{wa_number}} , {{whatsapp_group_link}} , {{image}}"}</p>
                            </div>
                            <div>
                                <div className="d-flex justify-content-between mb-2">
                                    <label htmlFor="imageFile" className="form-label">Upload The Image</label>
                                    {Boolean(imageURL) &&
                                        <div className="d-flex gap-2">
                                            <input type="text" className="form-control" placeholder="Placeholder Name." onInput={(event) => setPlaceholderText(event.currentTarget.value)} />
                                            <input type="number" className="form-control" value={placeholderSize} step={1} style={{ width: "60px" }} min={6} onInput={(event) => getPlaceholderSize(parseInt(event.currentTarget.value))} />
                                            <button type="button" className="btn btn-secondary btn-sm" style={{ width: "60px" }} onClick={() => setTextTransform((prevValue) => prevValue === "aa" ? "Aa" : prevValue === "Aa" ? "AA" : "aa")}>{textTransform}</button>
                                            <button type="button" className="btn btn-warning btn-sm" onClick={handleImageRemoveButton}>Remove</button>
                                        </div>
                                    }
                                </div>
                                <input type="file" id="imageFile" name="imageFile" accept=".jpg, .jpeg, .png" onInput={handleImageUpload} className="d-none" ref={imageInputRef} />
                                <div className="w-100 d-flex mb-4 rounded-3 position-relative justify-content-center align-items-center overflow-hidden border" style={{ minHeight: '100px' }}>
                                    {Boolean(imageURL) &&
                                        <div className="position-absolute border border-primary rounded-3" style={{ backgroundColor: "rgb(13 110 253 / 30%)", cursor: "pointer" }} onMouseDown={handleDragPlaceholder} ref={textPlaceholderRef}>
                                            <p className="my-0 mx-1" style={{ fontSize: `${viewFontSize}px`, textTransform: textTransform === "Aa" ? "capitalize" : textTransform === "AA" ? "uppercase" : "lowercase" }}>{placeholderText ?? "Placeholder Text"}</p>
                                        </div>
                                    }
                                    {!Boolean(imageURL) && <button type="button" className="btn btn-outline-secondary position-absolute" onClick={handleImageUploadButton}>Upload Image</button>}
                                    {Boolean(imageURL) && <img id="imagePreview" src={`${imageURL}`} alt="preview" className="w-100" />}
                                </div>
                            </div>
                            <div className="form-check form-switch mb-3">
                                <input className="form-check-input" type="checkbox" id="enableCertificateEmailed" name="enableCertificateEmailed" />
                                <label className="form-check-label" htmlFor="enableCertificateEmailed">Enable Student Status As The <Chip label="CM" sx={{ fontWeight: 600 }} /> - Certificate Emailed</label>
                            </div>
                            <button type="submit" className="btn btn-danger">Submit</button>
                        </form>
                        {Boolean(id.length > 1) && <div className="progress" role="progressbar" aria-label="Example with label" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                            <div className="progress-bar" style={{ width: `${progress}%` }}>{progress}%</div>
                        </div>}
                    </div>
                </div>
            </div>
            {formData && <AlertDialog title="Are you sure?" description={`Do you want to send this mail to ${id.length} students.`} isDialogOpen={isDialogOpen} getIsDialogOpen={getIsDialogOpen} handleFormSubmitConform={handleFormSubmitConform} />}
        </Fragment>
    );
}

export default CustomEmail;
