import React, {useState, useLayoutEffect} from 'react';

import DataTable from '../components/dataTable';
import DashBox from '../components/dashPanelBox';
import AddStudentForm from '../components/addStudentForm';
import EditStudentForm from '../components/editStudentForm';
import Notifications from '../components/notifications';
import CustomEmail from '../components/customeEmail';

interface Student {
    id: number;
    full_name: string;
    email: string;
    number_of_mails: number;
    wa_number: number | string;
    register_at: string;
    created_at: string;
    updated_at: string;
    number_of_referrals: number;
    referral_student: Student[];
}

interface Response {
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
    number_of_referrals: 0,
    referral_student: []
}]

interface Message{
    message: string;
    from: string;
    error: boolean;
}

interface Notification extends Message{
    id: string;
}

interface EditStudent{
    id: number;
    full_name: string;
    email: string;
    wanumber: number | string;
  }

const AdminPanel = () => {
    const [NotificationOn, isNotificationOn] = useState<boolean>(false);
    const [Notification, setNotification] = useState<Notification[]>([]);
    const [addFormOpen, isAddFormOpen] = useState<boolean>(false);
    const [editFormOpen, isEditFormOpen] = useState<EditStudent | null>(null);
    const [customEmailOpen, isCustomEmailOpen] = useState<readonly number[] | null>(null);
    const [students, getStudents] = useState<Student[] | null>(null);

    const collectNotifications = async (notification: Message) => {
        const Notification = {id: Date.now().toString(), ...notification} as Notification;
        setNotification((prevNotification) => ([...prevNotification, Notification]));
        isNotificationOn(true);
    }

    useLayoutEffect(()=>{
        const fetchStudent = async () => {
            try{
                const response = await fetch("http://localhost:3000/admin-panel/students",{
                    method: 'GET'
                });
                if(!response){
                    throw new Error("Failed to fetch students from the server");
                }
                const studentArr = await response.json() as Response;
                getStudents(studentArr.body? studentArr.body : Loading);
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
    
    const handleNotificationClose = (NotificationID: string) =>{
        if(!NotificationOn) return;
        setNotification((prevNotifications) => prevNotifications.filter((n) => n.id !== NotificationID));
        if(Notification.length - 1 === 0) isNotificationOn(false);
    }
    const handleAllNotificationClose = () => {
        setNotification([]);
        isNotificationOn(false);
    }

    return(
        <div className="admin-panel">
            <div id='notification-container' className='notification-container'>
                {NotificationOn && Notification.map((notification, index) => <Notifications id={`${index}`} key={index} notification={notification} handleNotificationClose={handleNotificationClose}/>)}
                {NotificationOn && <button type="button" className="btn btn-secondary" onClick={handleAllNotificationClose}>Clear All</button>}
            </div>
            <h4>Admin Panel</h4>
            <div className='dash-panel'>
                <DashBox title='Students' numbers={students? students.length: 0} backgroundColor='#f8b34a'/>
                <DashBox title='Eligible Students' numbers={students? students.filter((n) => n.number_of_referrals >= 2).length: 0} allStudents={students? students.length: 0} backgroundColor='#58ce5c'/>
                <DashBox title='Ineligible Students' numbers={students? students.filter((n) => n.number_of_referrals < 2).length: 0} allStudents={students? students.length: 0} backgroundColor='#fd6770'/>
            </div>
            {students? <DataTable rows={students} handleAddFormOpen={handleAddFormOpen} handleEditFormOpen={handleEditFormOpen} handleCustormEmailFormOpen={handleCustomeEmailFormOpen} collectNotifications={collectNotifications}/> : undefined}
            {addFormOpen && <AddStudentForm handleFormClose={handleAddFormClose} collectNotifications={collectNotifications}/>}
            {editFormOpen && <EditStudentForm handleFormClose={handleEditFormClose} collectNotifications={collectNotifications} editStudent={editFormOpen}/>}
            {customEmailOpen && <CustomEmail handleFormClose={handleCustomeEmailFormClose} id={customEmailOpen} collectNotifications={collectNotifications}/>}
        </div>
    )
}

export default AdminPanel;