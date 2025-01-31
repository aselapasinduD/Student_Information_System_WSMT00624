import React, { useState, useLayoutEffect } from 'react';

import DataTable from '../components/dataTable';
import AddStudentForm from '../components/addStudentForm';
import EditStudentForm from '../components/editStudentForm';
import CustomEmail from '../components/customeEmail';
import ImportBundleOfStudentsForm from '../components/importBundleOfStudentsForm';
import GeneratePDFs from '../components/GeneratePDFs';
import GenerateCertificates from '../components/GenerateCertificates';

import { Message, Student } from '../states/type';
import baseAPI from '../states/api';
import { formatDateTime } from '../functions/helper';

interface FetchStudent extends Omit<Student, 'status'> {
    status: string;
}

export interface ResponseStudent {
    message: string,
    body: FetchStudent[]
}

const Loading = [{
    id: 0,
    full_name: "Loading...",
    email: "Loading...",
    number_of_mails: 0,
    wa_number: "Loading...",
    address: "Loading...",
    register_at: "Loading...",
    status: ["Loading..."],
    google_form_id: 0,
    number_of_referrals: 0,
    referral_student: [],
    receiptURL: "Loading...",
    isDetailsChecked: false,
    created_at: "Loading...",
    updated_at: "Loading..."
}]

interface EditStudent {
    id: number;
    full_name: string;
    email: string;
    wanumber: number | string;
    address: string;
    googleFormId: number;
    receiptURL: string;
}

interface props {
    collectNotifications: (value: Message) => void;
}

/**
 * This two function help to format students DateTime values
 * 
 * @function formatStudentDates(FetchStudent) - format student DateTime values.
 * @return {Student}
 * @since 1.1.0
 * 
 * @function formatStudentList(FetchStudent) - format DateTime values from list of students.
 * @returns {Stduent[]}
 * @since 1.1.0
 */
function formatStudentDates(student: FetchStudent): Student {
    return {
        ...student,
        status: Array.isArray(student.status) ? student.status : JSON.parse(student.status),
        register_at: formatDateTime(student.register_at),
        created_at: formatDateTime(student.created_at),
        updated_at: formatDateTime(student.updated_at),
    }
}
function formatStudentList(students: FetchStudent[]): Student[] {
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
const Students: React.FC<props> = ({ collectNotifications }) => {
    const [addFormOpen, isAddFormOpen] = useState<boolean>(false);
    const [editFormOpen, isEditFormOpen] = useState<EditStudent | null>(null);
    const [customEmailOpen, isCustomEmailOpen] = useState<readonly number[] | null>(null);
    const [students, getStudents] = useState<Student[] | null>(null);
    const [ImportBundleOfStudentsFormOpen, isImportBundleOfStudentsFormOpen] = useState<boolean>(false);
    const [refetchStudents, setRetechStudents] = useState<boolean>(false);
    const [GeneratePDFsFormOpen, setGeneratePDFsFormOpen] = useState<boolean>(false);
    const [selectedStudents, getSelectedStudents] = useState<readonly number[]>([]);
    const [GenerateCertificatesFormOpen, setGenerateCertificatesFormOpen] = useState<boolean>(false);

    /**
     * Handle Api for getting student data.
     * 
     * @since: 1.0.0v
     */
    useLayoutEffect(() => {
        const fetchStudent = async () => {
            try {
                getStudents(Loading);
                const response = await fetch(baseAPI + "/admin-panel/students", {
                    method: 'GET'
                });
                if (!response) {
                    throw new Error("Failed to fetch students from the server");
                }
                const studentArr = await response.json() as ResponseStudent;
                getStudents(studentArr.body ? formatStudentList(studentArr.body) : []);
                collectNotifications({ message: "Fetching Students From Server Success.", from: "Main Server", error: false });
            } catch (error) {
                console.log("Error Fetching Students From Server: ", error);
                collectNotifications({ message: "Error Fetching Students From Server.", from: "Main Server", error: true });
            }
        }
        fetchStudent();
    }, [addFormOpen, editFormOpen, collectNotifications, refetchStudents, ImportBundleOfStudentsFormOpen]);

    // handle open and close
    const handleAddFormOpen = () => {
        isAddFormOpen(true);
    }
    const handleAddFormClose = () => {
        isAddFormOpen(false);
    }
    const handleEditFormOpen = (props: EditStudent) => {
        isEditFormOpen(props);
    }
    const handleEditFormClose = () => {
        isEditFormOpen(null);
    }
    const handleCustomeEmailFormOpen = (id: readonly number[]) => {
        isCustomEmailOpen(id);
    }
    const handleCustomeEmailFormClose = () => {
        isCustomEmailOpen(null);
    }
    const handleImportBundleOfStudentsFormOpen = () => {
        isImportBundleOfStudentsFormOpen(true);
    }
    const handleImportBundleOfStudentsFormClose = () => {
        isImportBundleOfStudentsFormOpen(false);
    }
    const handleGeneratePDFsFormOpen = () => {
        setGeneratePDFsFormOpen(true);
    }
    const handleGeneratePDFsFormClose = () => {
        setGeneratePDFsFormOpen(false);
    }
    const handleGenerateCertificatesFormOpen = () => {
        setGenerateCertificatesFormOpen(true);
    }
    const handleGenerateCertificatesFormClose = () => {
        setGenerateCertificatesFormOpen(false);
    }

    return (
        <>
            {students ? <DataTable
                rows={students}
                handleAddFormOpen={handleAddFormOpen}
                handleEditFormOpen={handleEditFormOpen}
                handleCustormEmailFormOpen={handleCustomeEmailFormOpen}
                collectNotifications={collectNotifications}
                handleImportBundleOfStudentsFormOpen={handleImportBundleOfStudentsFormOpen}
                handleGeneratePDFsFormOpen={handleGeneratePDFsFormOpen}
                refetchStudents={setRetechStudents}
                selectedStudents={getSelectedStudents}
                handleGenerateCertificatesFormOpen={handleGenerateCertificatesFormOpen}
            /> : undefined}
            {addFormOpen && <AddStudentForm handleFormClose={handleAddFormClose} collectNotifications={collectNotifications} />}
            {editFormOpen && <EditStudentForm handleFormClose={handleEditFormClose} collectNotifications={collectNotifications} editStudent={editFormOpen} />}
            {customEmailOpen && <CustomEmail handleFormClose={handleCustomeEmailFormClose} id={customEmailOpen} collectNotifications={collectNotifications} />}
            {ImportBundleOfStudentsFormOpen && <ImportBundleOfStudentsForm handleFormClose={handleImportBundleOfStudentsFormClose} collectNotifications={collectNotifications} />}
            {GeneratePDFsFormOpen && <GeneratePDFs handleFormClose={handleGeneratePDFsFormClose} collectNotifications={collectNotifications} selectedStudents={selectedStudents} />}
            {GenerateCertificatesFormOpen && <GenerateCertificates handleFormClose={handleGenerateCertificatesFormClose} collectNotifications={collectNotifications} selectedStudents={selectedStudents} />}
        </>
    )
}

export default Students;
