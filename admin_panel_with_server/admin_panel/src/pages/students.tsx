import React, {useState, useLayoutEffect} from 'react';

import DataTable from '../components/dataTable';
import AddStudentForm from '../components/addStudentForm';
import EditStudentForm from '../components/editStudentForm';
import CustomEmail from '../components/customeEmail';

import { Message, Student } from '../states/type';
import baseAPI from '../states/api';
import { formatDateTime } from '../functions/helper';

export interface ResponseStudent {
    message: string,
    body: Student[]
}

const Loading = [{
    id: 0,
    full_name: "Loading...",
    email: "Loading...",
    number_of_mails: 0,
    wa_number: "Loading...",
    register_at: "Loading...",
    created_at: "Loading...",
    updated_at: "Loading...",
    status: "[\"Loading...\"]",
    google_form_id: 0,
    number_of_referrals: 0,
    referral_student: []
}]

interface EditStudent{
    id: number;
    full_name: string;
    email: string;
    wanumber: number | string;
    googleFormId: number;
}

interface props{
    collectNotifications: (value: Message) => void;
}

/**
 * This two function help to format students DateTime values
 * 
 * @function formatStudentDates(student) - format student DateTime values.
 * @return {Student}
 * @function formatStudentList(students) - format DateTime values from list of students.
 * @returns {Stduent[]}
 * @since 1.1.0
 */
function formatStudentDates(stduent: Student): Student{
    return {
        ...stduent,
        register_at: formatDateTime(stduent.register_at),
        created_at: formatDateTime(stduent.created_at),
        updated_at: formatDateTime(stduent.updated_at),
    }
}
function formatStudentList(students: Student[]): Student[]{
    return students.map(formatStudentDates);
}

/**
 * This component handles the student funtions and data
 * 
 * @param {Function} collectNotifications - The callback function to handle notifications.
 * @returns {JSX.Elements}
 * @version 1.1.0
 * @since 1.0.0
 * @name Students - Previously named AdminPanel in version 1.0.0
 */
const Students: React.FC<props> = ({collectNotifications}) => {
    const [addFormOpen, isAddFormOpen] = useState<boolean>(false);
    const [editFormOpen, isEditFormOpen] = useState<EditStudent | null>(null);
    const [customEmailOpen, isCustomEmailOpen] = useState<readonly number[] | null>(null);
    const [students, getStudents] = useState<Student[] | null>(null);

    /**
     * Handle Api for getting student data.
     * 
     * @since: 1.0.0v
     */
    useLayoutEffect(()=>{
        const fetchStudent = async () => {
            try{
                const response = await fetch(baseAPI + "/admin-panel/students",{
                    method: 'GET'
                });
                if(!response){
                    throw new Error("Failed to fetch students from the server");
                }
                const studentArr = await response.json() as ResponseStudent;
                getStudents(studentArr.body? formatStudentList(studentArr.body) : Loading);
                collectNotifications({message: "Fetching Students From Server Success.", from: "Main Server", error: false});
            } catch (error){
                console.log("Error Fetching Students From Server: ", error);
                collectNotifications({message: "Error Fetching Students From Server.", from: "Main Server", error: true});
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

    const handleEditFormOpen= (props: EditStudent) => {
        isEditFormOpen(props);
    }

    const handleEditFormClose = () =>{
        isEditFormOpen(null);
    }

    const handleCustomeEmailFormOpen = (id: readonly number[]) =>{
        isCustomEmailOpen(id);
    }

    const handleCustomeEmailFormClose = () =>{
        isCustomEmailOpen(null);
    }

    return(
        <>
            {students? <DataTable rows={students} handleAddFormOpen={handleAddFormOpen} handleEditFormOpen={handleEditFormOpen} handleCustormEmailFormOpen={handleCustomeEmailFormOpen} collectNotifications={collectNotifications}/> : undefined}
            {addFormOpen && <AddStudentForm handleFormClose={handleAddFormClose} collectNotifications={collectNotifications}/>}
            {editFormOpen && <EditStudentForm handleFormClose={handleEditFormClose} collectNotifications={collectNotifications} editStudent={editFormOpen}/>}
            {customEmailOpen && <CustomEmail handleFormClose={handleCustomeEmailFormClose} id={customEmailOpen} collectNotifications={collectNotifications}/>}
        </>
    )
}

export default Students;