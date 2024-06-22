import React, {useState, useLayoutEffect} from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import DataTable from '../components/dataTable';

interface Student {
    id: number | string;
    full_name: string;
    email: string;
    wa_number: number | string;
    register_at: string;
    created_at: string;
    updated_at: string;
    referral_student: Student[];
}

interface Response {
    message: string,
    body: Student[]
}

const Loading = [{
    id: "Loading...",
    full_name: "Loading...",
    email: "Loading...",
    wa_number: "Loading...",
    register_at: "Loading...",
    created_at: "Loading...",
    updated_at: "Loading...",
    referral_student: []
}]

const AdminPanel = () => {
    const [isLoading, getIsLoading] = useState(false);
    const [students, getStudents] = useState<Student[] | null>(null);
    if(students){
        console.log(students);
    }

    useLayoutEffect(()=>{
        const fetchStudent = async () => {
            getIsLoading(true);
            try{
                const response = await fetch("http://localhost:3000/admin-panel/students",{
                    method: 'GET'
                });
                if(!response){
                    throw new Error("Failed to fetch students from the server");
                }
                const studentArr = await response.json() as Response;
                getStudents(studentArr.body? studentArr.body : Loading);
            } catch (error){
                console.log("Error Fetching Students From Server: ", error);
            }
            getIsLoading(false);
        }
        fetchStudent();
    },[]);
    
    return(
        <div className="admin-panel">
            <h3>Admin Panel</h3>
            {students? <DataTable rows={students} /> : undefined}
        </div>
    )
}

export default AdminPanel;