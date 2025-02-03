import React, { Fragment, useEffect, useState } from "react";

import AlertDialog from "./alertDialog";

import baseAPI from '../states/api';

import { Message } from "../states/type";

interface props{
    handleFormClose: () => void;
    collectNotifications: (notification: Message) => void;
}

interface googleFormTitle {
    id: number;
    title: string;
}

interface ResponseGoogleFormTitles {
    message: string,
    form: string,
    body: googleFormTitle[]
}

/**
 * Add form component for students.
 * 
 * @param {functions} handleFormClose - Controle Form Close
 * @param {functions} collectNotifications - Notification Collect Function
 * @returns {JSX.Element}
 * @version 1.1.0
 * @since 1.0.0
 */
const AddStudentForm: React.FC<props> = ({handleFormClose, collectNotifications}) =>{
    const [isDialogOpen, getIsDialogOpen] = useState<boolean>(false);
    const [formData, getFormData] = useState<FormData | null>(null);
    const [googleFormTitleList, setGoogleFormTitleList] = useState<googleFormTitle[]>([]);

    useEffect(()=>{
        const fetchStudent = async () => {
            try{
                const response = await fetch(baseAPI + "/admin-panel/googleforms/titles",{
                    method: 'GET'
                });
                if(!response){
                    throw new Error("Failed to fetch Google Forms titles from the server");
                }
                const googleFormsArr = await response.json() as ResponseGoogleFormTitles;
                if(Boolean(googleFormsArr.body.length)){
                  setGoogleFormTitleList([...googleFormsArr.body]);
                }
            } catch (error){
                console.log("Error fetching Google forms titles from server: ", error);
            }
        }
        fetchStudent();
    },[]);

    const submitForm = async(formData: FormData) => {
        const values = Object.fromEntries(formData);
        console.log(values);
        const response = await fetch(baseAPI + "/admin-panel/student", {
            method: "POST",
            body: formData
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

        let formData = new FormData(event.currentTarget as HTMLFormElement);
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
                <div className="d-flex flex-column">
                    <button type="button" className="btn-close" onClick={handleFormClose} aria-label="Close"></button>
                    <div className="form-container">
                        <h4 className="heading">Add Student</h4>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group input-group-sm mb-4">
                                <span className="input-group-text" id="inputGroup-sizing-sm">Full Name *</span>
                                <input id="fullname" type="name" className="form-control" placeholder="Full Name" aria-label="Full Name" aria-describedby="inputGroup-sizing-sm" name="fullname" maxLength={50} required/>
                            </div>
                            <div className="input-group input-group-sm mb-4">
                                <span className="input-group-text" id="inputGroup-sizing-sm">Email *</span>
                                <input id="email" type="email" className="form-control" placeholder="example@domain.com" aria-label="Email Address" aria-describedby="inputGroup-sizing-sm" name="email" required/>
                            </div>
                            <div className="input-group input-group-sm mb-4">
                                <span className="input-group-text" id="inputGroup-sizing-sm">WhatsApp Number *</span>
                                <input id="wanumber" type="tel" className="form-control" placeholder="94734567890" aria-label="Whatapp Phone Number" pattern="[0-9]{11}" aria-describedby="inputGroup-sizing-sm" maxLength={11} name="wanumber" required/>
                            </div>
                            <div className="input-group input-group-sm mb-4">
                                <span className="input-group-text" id="inputGroup-sizing-sm">Referral WhatsApp</span>
                                <input id="referralwa" type="tel" className="form-control" placeholder="94734567890" aria-label="Referral Student Whatapp Number" aria-describedby="inputGroup-sizing-sm" pattern="[0-9]{11}" maxLength={11} name="referralwa"/>
                            </div>
                            <div className="input-group input-group-sm mb-4">
                                <span className="input-group-text" id="inputGroup-sizing-sm">Address</span>
                                <textarea id="address" className="form-control" placeholder="Address" aria-label="Home Address" aria-describedby="inputGroup-sizing-sm" name="address" maxLength={200}/>
                            </div>
                            <div className="input-group input-group-sm mb-4">
                                <span className="input-group-text" id="inputGroup-sizing-sm">Google Form *</span>
                                <select className="form-select" aria-label="Select the Google Form Here" name="googleForm" required>
                                    <option selected>Open this select Google Form</option>
                                    {googleFormTitleList.length > 0 && googleFormTitleList.map((googleFormtitlevalue, index) => <option key={index} value={`${googleFormtitlevalue.id}`}>{googleFormtitlevalue.title}</option>)}
                                </select>
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