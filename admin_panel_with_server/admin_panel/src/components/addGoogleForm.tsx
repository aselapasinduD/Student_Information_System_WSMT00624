import React, { Fragment, useState } from "react";

import AlertDialog from "./alertDialog";

import baseAPI from '../states/api';

import { Message } from "../states/type";

interface props {
    handleFormClose: () => void;
    collectNotifications: (notification: Message) => void;
}

const listOfColor = [
    {
        color: "#E291FA"
    },
    {
        color: "#85FFCF"
    },
    {
        color: "#FAD37A"
    },
    {
        color: "#56C2FA"
    },
    {
        color: "#FFFB85"
    },
    {
        color: "#FA7A87"
    },
    {
        color: "#46FA65"
    },
    {
        color: "#FFB159"
    },
    {
        color: "#7FEFFA"
    }
]

/**
 * Add form component for google forms.
 * 
 * @param {functions} handleFormClose - Controle Form Close
 * @param {functions} collectNotifications - Notification Collect Function
 * @returns {JSX.Element}
 * @since 1.1.0
 */
const AddGoogleForm: React.FC<props> = ({ handleFormClose, collectNotifications }) => {
    const [colorValue, setColorValue] = useState<string>("#ffffff");
    const [isDialogOpen, getIsDialogOpen] = useState<boolean>(false);
    const [formData, getFormData] = useState<FormData | null>(null);

    const submitForm = async (formData: FormData) => {
        const response = await fetch(baseAPI + "/admin-panel/googleform", {
            method: "POST",
            body: formData
        })
        if (response.ok) {
            const notification = await response.json() as Message;
            console.log(notification);
            collectNotifications(notification);
        } else {
            console.log("Add Google Form didn't Success");
            collectNotifications({ message: "Add Google Form didn't Success", from: "Server", error: true });
        }
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        getIsDialogOpen(true);

        let formData = new FormData(event.currentTarget as HTMLFormElement);
        getFormData(formData);
    }

    const handleFormSubmitConform = async (isConfirm: boolean) => {
        if (!isConfirm) return;
        if (!formData) return;
        if (!isDialogOpen) return;
        getIsDialogOpen(false);
        await submitForm(formData);
    }

    const handleColorPicker = (event: React.ChangeEvent<HTMLInputElement>) => {
        // console.log(event.currentTarget.value);
        setColorValue(event.currentTarget.value);
    }

    return (
        <Fragment>
            <div className="form">
                <div>
                    <button type="button" className="btn-close" onClick={handleFormClose} aria-label="Close"></button>
                    <div className="form-container">
                        <h4 className="heading">Add Google Form</h4>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group input-group-sm mb-3">
                                <span className="input-group-text" id="inputGroup-sizing-sm">Title</span>
                                <input id="title" type="name" className="form-control" placeholder="Google Form Title" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" name="title" maxLength={50} required />
                            </div>
                            <div className="input-group input-group-sm mb-3">
                                <span className="input-group-text" id="inputGroup-sizing-sm" style={{ background: `${colorValue}` }}>Color</span>
                                <div className="d-flex gap-1 input-group-text">
                                    {listOfColor.map((color, index) => <button key={index} type="button" className="btn rounded-0" style={{ background: `${color.color}` }} onClick={() => setColorValue(`${color.color}`)}></button>)}
                                    <input id="color" type="color" className="form-control rounded-0 p-0" style={{ width: '20px' }} placeholder="Pick A Color" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" name="color" onChange={handleColorPicker} value={colorValue} />
                                </div>
                            </div>
                            <div className="input-group input-group-sm mb-3">
                                <span className="input-group-text" id="inputGroup-sizing-sm">WhatsApp Group Link</span>
                                <input id="whatsappGroupLink" type="url" className="form-control" placeholder="Whatsapp Group Link" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" name="whatsappGroupLink" />
                            </div>
                            <div className="d-flex gap-4 mb-4">
                                <div className="form-check d-flex align-items-center gap-2">
                                    <input className="form-check-input" type="checkbox" name="hasReferral" id="hasReferral" />
                                    <label className="form-check-label" style={{ width: "max-content" }} htmlFor="hasReferral">
                                        Has Referral
                                    </label>
                                </div>
                                <div className="form-check d-flex align-items-center gap-2">
                                    <input className="form-check-input" type="checkbox" name="hasAddress" id="hasAddress" />
                                    <label className="form-check-label" style={{ width: "max-content" }} htmlFor="hasAddress">
                                        Has Address
                                    </label>
                                </div>
                                <div className="form-check d-flex align-items-center gap-2">
                                    <input className="form-check-input" type="checkbox" name="canUploadaReceipt" id="canUploadaReceipt" />
                                    <label className="form-check-label" style={{ width: "max-content" }} htmlFor="canUploadaReceipt">
                                        Can Upload a Receipt
                                    </label>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-danger">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
            {formData && <AlertDialog title="Are you want to add this Google Form?" description="If you want to add new Google Form click Yes. if you don't click No." isDialogOpen={isDialogOpen} getIsDialogOpen={getIsDialogOpen} handleFormSubmitConform={handleFormSubmitConform} />}
        </Fragment>
    );
}

export default AddGoogleForm;
