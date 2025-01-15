import React, { useLayoutEffect, useState } from 'react';

import GoogleFormDataTable from '../components/googleFormDataTable';
import AddGoogleForm from '../components/addGoogleForm';
import EditGoogleForm from '../components/editGoogleForm';

import { Message, GoogleForm } from '../states/type';
import baseAPI from '../states/api';
import { formatDateTime } from '../functions/helper';

interface props{
    collectNotifications: (value: Message) => void;
}
interface ResponseGoogleForm {
    message: string,
    body: GoogleForm[]
}
const Loading = [{
    id: 0,
    title: "Loading...",
    slug: "Loading...",
    color: "Loading...",
    whatsapp_group_link: "Loading...",
    isReferralHas: false,
    isAddressHas: false,
    canUploadaReceipt: false,
    created_at: "Loading...",
    updated_at: "Loading...",
}]

interface editGoogleForm{
    id: number;
    title: string;
    color: string;
    isReferralHas: boolean;
    isAddressHas: boolean;
    canUploadaReceipt: boolean;
    whatsapp_group_link: string;
}

function formatGoogleFormDate(googleForm: GoogleForm): GoogleForm{
    return {
        ...googleForm,
        created_at: formatDateTime(googleForm.created_at),
        updated_at: formatDateTime(googleForm.updated_at)
    }
}
function formatGoogleFormList(googleForms: GoogleForm[]): GoogleForm[]{
    return googleForms.map(formatGoogleFormDate);
}

/**
 * This component handles the google forms funtions and data
 * 
 * @returns {JSX.Elements}
 * @since 1.1.0
 */
const GoogleForms: React.FC<props> = ({collectNotifications}) => {
    const [googleForms, getGoogleForms] = useState<GoogleForm[] | null>(null);
    const [addFormOpen, isAddFormOpen] = useState<boolean>(false);
    const [editFormOpen, isEditFormOpen] = useState<editGoogleForm | null>(null);
    
    useLayoutEffect(()=>{
        const fetchStudent = async () => {
            try{
                getGoogleForms(Loading);
                const response = await fetch(baseAPI + "/admin-panel/googleforms",{
                    method: 'GET'
                });
                if(!response){
                    throw new Error("Failed to fetch Google Forms from the server");
                }
                const googleFormsArr = await response.json() as ResponseGoogleForm;
                getGoogleForms(googleFormsArr.body? formatGoogleFormList(googleFormsArr.body) : []);
                collectNotifications({message: "Fetching Google Forms From Server Success.", from: "Main Server", error: false});
            } catch (error){
                console.log("Error Fetching Google Forms From Server: ", error);
                collectNotifications({message: "Error Fetching Google Forms From Server.", from: "Main Server", error: true});
            }
        }
        fetchStudent();
    },[addFormOpen, editFormOpen]);

    // handle open and
    const handleAddFormOpen = () => {
        isAddFormOpen(true);
    }

    const handleAddFormClose = () =>{
        isAddFormOpen(false);
    }

    const handleEditFormOpen= (props: editGoogleForm) => {
        isEditFormOpen(props);
    }

    const handleEditFormClose = () =>{
        isEditFormOpen(null);
    }

    return(
        <>
            {googleForms && <GoogleFormDataTable rows={googleForms} handleAddFormOpen={handleAddFormOpen} handleEditFormOpen={handleEditFormOpen} collectNotifications={collectNotifications} />}
            {addFormOpen && <AddGoogleForm handleFormClose={handleAddFormClose} collectNotifications={collectNotifications}/>}
            {editFormOpen && <EditGoogleForm handleFormClose={handleEditFormClose} collectNotifications={collectNotifications} editGoogleForm={editFormOpen}/>}
        </>
    );
}

export default GoogleForms;