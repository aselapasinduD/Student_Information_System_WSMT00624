import React, { useEffect, useState } from "react";

import CloseIcon from '@mui/icons-material/Close';

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
  }

interface props{
    handleFormClose: () => void;
    collectNotification: (notification: Notification) => void;
    editStudent: EditStudent;
}

const EditStudentForm: React.FC<props> = ({handleFormClose, collectNotification, editStudent}) =>{
    let {id} = editStudent;
    const [fullName, setFullName] = useState<string>(editStudent.full_name);
    const [email, setEmail] = useState<string>(editStudent.email);
    const [wanumber, setWaNumber] = useState<string | number>(editStudent.wanumber);

    const handleOnChange_fullName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFullName(event.target.value);
    }
    const handleOnChange_email = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    }
    const handleOnChange_wanumber = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWaNumber(event.target.value);
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        let formData = new URLSearchParams;
        const inputs = event.currentTarget.getElementsByClassName("form-control");
        formData.append("id", `${id}`);
        for(let i=0; i<inputs.length; i++){
            const inputElement = inputs[i] as HTMLInputElement;
            formData.append(inputElement.name,inputElement.value);
        }
        console.log(await formData.toString());
        const submitForm = async() => {
            const response = await fetch("http://localhost:3000/admin-panel/student", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: await formData.toString()
            })
            if(response.ok) {
                const notification = await response.json() as Notification;
                collectNotification(notification);
            } else {
                console.log("Add Student didn't Success");
                collectNotification({message: "Edit Student didn't Success", from: "Server", error: true});
            }
        }
        await submitForm();
    }
    console.log(editStudent);
    return(
        <div className="form">
            <div>
                <button type="button" className="btn-close" onClick={handleFormClose} aria-label="Close"></button>
                <div className="form-container">
                    <h4 className="heading">Edit Student Form</h4>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group input-group-sm mb-4">
                            <span className="input-group-text" id="inputGroup-sizing-sm">Full Name</span>
                            <input type="text" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value={fullName} onChange={handleOnChange_fullName} name="fullname"/>
                        </div>
                        <div className="input-group input-group-sm mb-4">
                            <span className="input-group-text" id="inputGroup-sizing-sm">Email</span>
                            <input type="email" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value={email} onChange={handleOnChange_email} name="email"/>
                        </div>
                        <div className="input-group input-group-sm mb-4">
                            <span className="input-group-text" id="inputGroup-sizing-sm">WhatsApp Number</span>
                            <input id="wanumber" type="tel" className="form-control" placeholder="94734567890" aria-label="Sizing example input" pattern="[0-9]{11}" aria-describedby="inputGroup-sizing-sm" maxLength={11} value={wanumber} name="wanumber" onChange={handleOnChange_wanumber} required/>
                        </div>
                        <button type="submit" className="btn btn-danger">Submit</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditStudentForm;