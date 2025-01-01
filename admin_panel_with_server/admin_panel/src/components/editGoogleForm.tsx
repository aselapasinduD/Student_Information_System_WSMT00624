import React, { useState, Fragment } from "react";

import AlertDialog from "./alertDialog";

import baseAPI from '../states/api';
import { Message } from "../states/type";

interface editGoogleForm{
    id: number;
    title: string;
    color: string;
    whatsapp_group_link: string;
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

interface props{
    handleFormClose: () => void;
    collectNotifications: (notification: Message) => void;
    editGoogleForm: editGoogleForm;
}
/**
 * Edit form component for google forms.
 * 
 * @param {function} handleFormClose - Controle Form Close
 * @param {function} collectNotifications - Notification Collect Function
 * @param {array} editStudent - Array of Google Form
 * @returns {JSX.Element}
 * @since 1.1.0
 */
const EditGoogleForm: React.FC<props> = ({handleFormClose, collectNotifications, editGoogleForm}) =>{
    let {id} = editGoogleForm;
    const [title, setTitle] = useState<string>(editGoogleForm.title);
    const [color, setColor] = useState<string>(editGoogleForm.color);
    const [whatsapp_group_link, setWhatsappGroupLink] = useState<string | number>(editGoogleForm.whatsapp_group_link);
    const [isDialogOpen, getIsDialogOpen] = useState<boolean>(false);
    const [formData, getFormData] = useState<URLSearchParams | null>(null);

    const handleOnChange_title = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    }
    const handleOnChange_color = (event: React.ChangeEvent<HTMLInputElement>) => {
        setColor(event.target.value);
    }
    const handleOnChange_whatsapp_group_link = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWhatsappGroupLink(event.target.value);
    }

    const submitForm = async(formData: URLSearchParams) => {
        console.log(formData.getAll(""));
        const response = await fetch(baseAPI + "/admin-panel/googleform", {
            method: "PUT",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: await formData.toString()
        })
        if(response.ok) {
            const notification = await response.json() as Message;
            collectNotifications(notification);
            window.location.reload();
        } else {
            console.log("Add Google Form didn't Success");
            collectNotifications({message: "Edit Google Form didn't Success", from: "Server", error: true});
        }
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        getIsDialogOpen(true);

        let formData = new URLSearchParams();
        const inputs = event.currentTarget.getElementsByClassName("form-control");
        formData.append("id", `${id}`);
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
                        <h4 className="heading">Edit Student Form</h4>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group input-group-sm mb-4">
                                <span className="input-group-text" id="inputGroup-sizing-sm">Title</span>
                                <input id="title" type="name" className="form-control" placeholder="Google Form Title" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value={title} name="title" maxLength={50} onChange={handleOnChange_title} required/>
                            </div>
                            <div className="input-group input-group-sm mb-4">
                                <span className="input-group-text" id="inputGroup-sizing-sm" style={{background: `${color}`}}>Color</span>
                                <div className="d-flex gap-1 input-group-text">
                                    {listOfColor.map((color, index) => <button key={index} type="button" className="btn rounded-0" style={{background: `${color.color}`}} onClick={() => setColor(`${color.color}`)}></button>)}
                                    <input id="color" type="color" className="form-control rounded-0 p-0" style={{width: '20px'}} placeholder="Pick A Color" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" name="color" onChange={handleOnChange_color} value={color}/>
                                </div>
                            </div>
                            <div className="input-group input-group-sm mb-4">
                                <span className="input-group-text" id="inputGroup-sizing-sm">WhatsApp Group Link</span>
                                <input id="whatsappGroupLink" type="url" className="form-control" placeholder="Whatsapp Group Link" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value={whatsapp_group_link ?? ""} name="whatsappGroupLink" onChange={handleOnChange_whatsapp_group_link}/>
                            </div>
                            <button type="submit" className="btn btn-danger">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
            {formData && <AlertDialog title="Are you want to update this Google Form?" description="If you want to update the Google Form click Yes. if you don't click No." isDialogOpen={isDialogOpen} getIsDialogOpen={getIsDialogOpen} handleFormSubmitConform={handleFormSubmitConform} />}
        </Fragment>
    );
}

export default EditGoogleForm;