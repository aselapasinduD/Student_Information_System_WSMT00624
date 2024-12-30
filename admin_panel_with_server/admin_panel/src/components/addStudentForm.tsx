import React, { Fragment, useState } from "react";

import AlertDialog from "./alertDialog";

import baseAPI from '../states/api';

import { Message } from "../states/type";

interface props{
    handleFormClose: () => void;
    collectNotifications: (notification: Message) => void;
}

/**
 * Add form component for students.
 * 
 * @param {functions} handleFormClose - Controle Form Close
 * @param {functions} collectNotifications - Notification Collect Function
 * @returns {JSX.Element}
 * @since 1.0.0
 */
const AddStudentForm: React.FC<props> = ({handleFormClose, collectNotifications}) =>{

    const [isDialogOpen, getIsDialogOpen] = useState<boolean>(false);
    const [formData, getFormData] = useState<URLSearchParams | null>(null);

    const submitForm = async(formData: URLSearchParams) => {
        const response = await fetch(baseAPI + "/admin-panel/student", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData.toString()
        })
        if(response.ok) {
            const notification = await response.json() as Message;
            console.log(notification);
            collectNotifications(notification);
        } else {
            console.log("Add Student didn't Success");
            collectNotifications({message: "Add Student didn't Success", from: "Server", error: true});
        }
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        getIsDialogOpen(true);

        let formData = new URLSearchParams();
        const inputs = event.currentTarget.getElementsByClassName("form-control");
        for(let i=0; i<inputs.length; i++){
            const inputElement = inputs[i] as HTMLInputElement;
            formData.append(inputElement.name,inputElement.value);
        }
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
                    <div className="form-container">
                        <h4 className="heading">Add Student</h4>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group input-group-sm mb-4">
                                <span className="input-group-text" id="inputGroup-sizing-sm">Full Name</span>
                                <input id="fullname" type="name" className="form-control" placeholder="Full Name" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" name="fullname" required/>
                            </div>
                            <div className="input-group input-group-sm mb-4">
                                <span className="input-group-text" id="inputGroup-sizing-sm">Email</span>
                                <input id="email" type="email" className="form-control" placeholder="example@domain.com" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" name="email" required/>
                            </div>
                            <div className="input-group input-group-sm mb-4">
                                <span className="input-group-text" id="inputGroup-sizing-sm">WhatsApp Number</span>
                                <input id="wanumber" type="tel" className="form-control" placeholder="94734567890" aria-label="Sizing example input" pattern="[0-9]{11}" aria-describedby="inputGroup-sizing-sm" maxLength={11} name="wanumber" required/>
                            </div>
                            <div className="input-group input-group-sm mb-4">
                                <span className="input-group-text" id="inputGroup-sizing-sm">Referral WhatsApp</span>
                                <input id="referralwa" type="tel" className="form-control" placeholder="94734567890" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" pattern="[0-9]{11}" maxLength={11} name="referralwa"/>
                            </div>
                            <button type="submit" className="btn btn-danger">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
            {formData && <AlertDialog title="Are you want to add this student?" description="If you want to add new student click Yes. if you don't click No." isDialogOpen={isDialogOpen} getIsDialogOpen={getIsDialogOpen} handleFormSubmitConform={handleFormSubmitConform} />}
        </Fragment>
    );
}

export default AddStudentForm;