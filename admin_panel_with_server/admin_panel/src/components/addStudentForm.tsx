import React from "react";

import CloseIcon from '@mui/icons-material/Close';

interface Notification{
    message: string;
    from: string;
    error: boolean;
}

interface props{
    handleFormClose: () => void;
    collectNotifications: (notification: Notification) => void;
}

const AddStudentForm: React.FC<props> = ({handleFormClose, collectNotifications}) =>{

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        let formData = new URLSearchParams;
        const inputs = event.currentTarget.getElementsByClassName("form-control");
        for(let i=0; i<inputs.length; i++){
            const inputElement = inputs[i] as HTMLInputElement;
            formData.append(inputElement.name,inputElement.value);
        }
        const submitForm = async() => {
            const response = await fetch("http://localhost:3000/admin-panel/student", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData.toString()
            })
            if(response.ok) {
                const notification = await response.json() as Notification;
                collectNotifications(notification);
            } else {
                console.log("Add Student didn't Success");
                collectNotifications({message: "Add Student didn't Success", from: "Server", error: true});
            }
        }
        await submitForm();
    }

    return(
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
    );
}

export default AddStudentForm;