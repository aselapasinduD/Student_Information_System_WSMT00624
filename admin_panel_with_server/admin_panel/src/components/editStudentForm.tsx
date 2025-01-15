import React, { useState, Fragment, useEffect } from "react";

import AlertDialog from "./alertDialog";

import baseAPI from '../states/api';

interface Notification{
    message: string;
    from: string;
    error: boolean;
}
interface EditStudent{
    id: number;
    full_name: string;
    email: string;
    wanumber: number | string;
    address: string;
    googleFormId: number;
    receiptURL: string;
}

interface props{
    handleFormClose: () => void;
    collectNotifications: (notification: Notification) => void;
    editStudent: EditStudent;
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
 * Edit form component for Student.
 * 
 * @param {function} handleFormClose - Controle Form Close
 * @param {function} collectNotifications - Notification Collect Function
 * @param {array} editStudent - Array of Student Details
 * @returns {JSX.Element}
 * @version 1.1.0
 * @since 1.0.0
 */
const EditStudentForm: React.FC<props> = ({handleFormClose, collectNotifications, editStudent}) =>{
    let {id} = editStudent;
    const [fullName, setFullName] = useState<string>(editStudent.full_name);
    const [email, setEmail] = useState<string>(editStudent.email);
    const [wanumber, setWaNumber] = useState<string | number>(editStudent.wanumber);
    const [address, setAddress] = useState<string>(editStudent.address);
    const [googleFormId] = useState<number>(editStudent.googleFormId);
    const [receiptURL, setReceiptURL] = useState<string>(editStudent.receiptURL);
    const [isDialogOpen, getIsDialogOpen] = useState<boolean>(false);
    const [formData, getFormData] = useState<FormData | null>(null);
    const [googleFormTitleList, setGoogleFormTitleList] = useState<googleFormTitle[]>([]);

    console.log(editStudent);

    const handleOnChange_fullName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFullName(event.target.value);
    }
    const handleOnChange_email = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    }
    const handleOnChange_wanumber = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWaNumber(event.target.value);
    }
    const handleOnChange_address = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setAddress(event.target.value);
    }

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
                // getGoogleForms(googleFormsArr.body? formatGoogleFormList(googleFormsArr.body) : Loading);
            } catch (error){
                console.log("Error fetching Google forms titles from server: ", error);
            }
        }
        fetchStudent();
    },[]);

    const submitForm = async(formData: FormData) => {
        const response = await fetch(baseAPI + "/admin-panel/student", {
            method: "PUT",
            body: formData
        })
        if(response.ok) {
            const notification = await response.json() as Notification;
            collectNotifications(notification);
            window.location.reload();
        } else {
            console.log("Add Student didn't Success");
            collectNotifications({message: "Edit Student didn't Success", from: "Server", error: true});
        }
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        getIsDialogOpen(true);

        let formData = new FormData(event.currentTarget as HTMLFormElement);
        formData.append("id", `${id}`);
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
                        <h4 className="heading">Edit Student Form</h4>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group input-group-sm mb-4">
                                <span className="input-group-text" id="inputGroup-sizing-sm">Full Name</span>
                                <input type="text" className="form-control" aria-label="Full Name" aria-describedby="inputGroup-sizing-sm" value={fullName} onChange={handleOnChange_fullName} maxLength={50} name="fullname" required/>
                            </div>
                            <div className="input-group input-group-sm mb-4">
                                <span className="input-group-text" id="inputGroup-sizing-sm">Email</span>
                                <input type="email" className="form-control" aria-label="Email" aria-describedby="inputGroup-sizing-sm" value={email} onChange={handleOnChange_email} name="email" required/>
                            </div>
                            <div className="input-group input-group-sm mb-4">
                                <span className="input-group-text" id="inputGroup-sizing-sm">WhatsApp Number</span>
                                <input id="wanumber" type="tel" className="form-control" placeholder="94734567890" aria-label="WhatsApp Number" pattern="[0-9]{11}" aria-describedby="inputGroup-sizing-sm" maxLength={11} value={wanumber} name="wanumber" onChange={handleOnChange_wanumber} required/>
                            </div>
                            <div className="input-group input-group-sm mb-4">
                                <span className="input-group-text" id="inputGroup-sizing-sm">Address</span>
                                <textarea id="address" className="form-control" placeholder="Address" aria-label="Home Address" aria-describedby="inputGroup-sizing-sm" value={address} onChange={handleOnChange_address} name="address" maxLength={200}/>
                            </div>
                            <div className="input-group input-group-sm mb-4">
                                <span className="input-group-text" id="inputGroup-sizing-sm">Google Form *</span>
                                <select className="form-select" aria-label="Google Form" name="googleForm" required>
                                    {googleFormTitleList.length > 0 && googleFormTitleList.map((googleFormtitlevalue, index) => <option key={index} value={`${googleFormtitlevalue.id}`} selected={googleFormId === googleFormtitlevalue.id}>{googleFormtitlevalue.title}</option>)}
                                </select>
                            </div>
                            <div className="input-group input-group-sm mb-3">
                                <span className="input-group-text" id="inputGroup-sizing-sm">Receipt Link</span>
                                <input id="receiptLink" type="url" className="form-control" placeholder="Receipt Link" value={receiptURL} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setReceiptURL(event.target.value)} aria-label="Receipt Link" aria-describedby="inputGroup-sizing-sm" name="receiptLink" maxLength={100}/>
                            </div>
                            <button type="submit" className="btn btn-danger">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
            {formData && <AlertDialog title="Are you want to update this student?" description="If you want to update the student click Yes. if you don't click No." isDialogOpen={isDialogOpen} getIsDialogOpen={getIsDialogOpen} handleFormSubmitConform={handleFormSubmitConform} />}
        </Fragment>
    );
}

export default EditStudentForm;