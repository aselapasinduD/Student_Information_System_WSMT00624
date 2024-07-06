import React, {Fragment, useState} from "react";

import AlertDialog from "./alertDialog";

interface Notification{
    message: string;
    from: string;
    error: boolean;
}

interface CustomeEmail {
    id: readonly number[];
    handleFormClose: () => void;
    collectNotifications: (notification: Notification) => void;
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const CustomEmail: React.FC<CustomeEmail> = ({id, handleFormClose, collectNotifications}) => {
    const [isHtmlContent, getIsHtmlContent] = useState<string>("html");
    const [isDialogOpen, getIsDialogOpen] = useState<boolean>(false);
    const [formData, getFormData] = useState<URLSearchParams | null>(null);
    const [progress, getProgress] = useState<number>(0);

    const submitForm = async(formData: URLSearchParams) => {
        let numberOfIds = id.length;
        do{
            try{
                numberOfIds--;
                formData.set("id", `${id[numberOfIds]}`);
                const response = await fetch("/mail", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: await formData.toString()
                })
                if(response.ok) {
                    const notification = await response.json() as Notification;
                    collectNotifications(notification);
                } else {
                    console.log("Add Student didn't Success");
                    collectNotifications({message: "Error while sending the emails.", from: "Main Server", error: true});
                }
                await sleep(1000);
            } catch (error) {
                console.log("Error fetching email from server: ", error);
                collectNotifications({message: "Error fetching emails to the server.", from: "Front End", error: true});
            }
            getProgress(Math.round(100 - (numberOfIds/id.length)*100));
        } while(numberOfIds > 0)
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        getIsDialogOpen(true);
        getProgress(0);

        let formData = new URLSearchParams();
        const inputs = event.currentTarget.getElementsByClassName("form-control");

        for(let i=0; i<inputs.length; i++){
            const inputElement = inputs[i] as HTMLInputElement;
            formData.append(inputElement.name,inputElement.value);
        }
        formData.append("ishtml", isHtmlContent);
        getFormData(formData);
    }

    const handleFormSubmitConform = async (isConfirm: boolean) => {
        if(!isConfirm) return;
        if(!formData) return;
        if(!isDialogOpen) return;
        getIsDialogOpen(false);
        await submitForm(formData);
    }

    return(
        <Fragment>
            <div className="form">
                <div>
                    <button type="button" className="btn-close" onClick={handleFormClose} aria-label="Close"></button>
                    <div className="form-container mailform-container">
                        <h4 className="heading">Send Mail</h4>
                        <h6>Number of receivers: {id.length}</h6>
                        <form onSubmit={handleSubmit} style={{marginBottom: 10}}>
                            <div className="mb-4">
                                <label htmlFor="validationTextarea" className="form-label">Subject</label>
                                <input id="subject" type="text" className="form-control" placeholder="Subject" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" name="subject" required/>
                            </div>
                            <div className="mb-3">
                                <div className="textarea-header">
                                    <label htmlFor="validationTextarea" className="form-label">Mail Content</label>
                                    <div>
                                        <input className="form-check-input" type="radio" value="text-content" name="flexRadioDefault" checked={isHtmlContent === "text-content"} onChange={(e)=>getIsHtmlContent(e.target.value)} style={{marginRight: "10px"}} id="flexRadioDefault1" />
                                        <label className="form-check-label" htmlFor="flexRadioDefault1" style={{marginRight: "20px"}}>Text-Content</label>

                                        <input className="form-check-input" type="radio" value="html" name="flexRadioDefault" checked={isHtmlContent === "html"} onChange={(e)=>getIsHtmlContent(e.target.value)} style={{marginRight: "10px"}} id="flexRadioDefault2"/>
                                        <label className="form-check-label" htmlFor="flexRadioDefault2">HTML</label>
                                    </div>
                                </div>
                                <textarea className="form-control" id="validationTextarea" rows={12} placeholder="Required Content" name="emailcontent" required />
                                <div className="invalid-feedback">Please enter a message in the textarea.</div>
                                <p>{"{{full_name}} , {{email}} , {{wa_number}} , {{whatsapp_group_link}}" }</p>
                            </div>
                            <button type="submit" className="btn btn-danger">Submit</button>
                        </form>
                        {Boolean(id.length > 1) && <div className="progress" role="progressbar" aria-label="Example with label" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                            <div className="progress-bar" style={{width: `${progress}%`}}>{progress}%</div>
                        </div>}
                    </div>
                </div>
            </div>
            {formData && <AlertDialog title="Are you sure?" description={`Do you want to send this mail to ${id.length} students.`} isDialogOpen={isDialogOpen} getIsDialogOpen={getIsDialogOpen} handleFormSubmitConform={handleFormSubmitConform} />}
        </Fragment>
    );
}

export default CustomEmail;