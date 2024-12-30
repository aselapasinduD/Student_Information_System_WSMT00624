import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import DashBox from '../../components/dashPanelBox';
import Notifications from '../../components/notifications';

import { Notification, Message } from "../../states/type";
import baseAPI from '../../states/api';

interface Props {
    notification: Message | null;
}

/**
 * Provide The layout for the app
 * 
 * @param {Variable} notification - tied to the collect notification function from other pages.
 * @returns {JSXElements}
 * @since 1.1.0
 */
const AdminPanelLayout: React.FC<Props> = ({ notification }) => {
    const [isNotificationsVisible, setIsNotificationsVisible] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if(!notification) return;
        const newNotification = { id: Date.now().toString(), ...notification } as Notification;
        setNotifications(prevNotifications => [...prevNotifications, newNotification]);
        setIsNotificationsVisible(true);
    }, [notification]);

    const handleNotificationClose = (notificationID: string) => {
        if (!isNotificationsVisible) return;

        setNotifications(prevNotifications => prevNotifications.filter(notification => notification.id !== notificationID));
        if (notifications.length - 1 === 0) setIsNotificationsVisible(false);
    };

    const handleAllNotificationsClose = () => {
        setNotifications([]);
        setIsNotificationsVisible(false);
    };

    const handleOpenTab = (event: React.MouseEvent<HTMLButtonElement>) => {
        const button = event.currentTarget;
        if(button){
            const buttonId = button.getAttribute('id');
            switch(buttonId){
                case "nav-students-tab":
                    window.location.assign("/admin-panel/student");
                    button.classList.add("active");
                    break;
                case "nav-googleforms-tab":
                    window.location.assign("/admin-panel/googleform");
                    button.classList.add("active");
                    break;
                default:
                    window.location.assign("/admin-panel");
            }
        }
    }

    return (
        <div className="admin-panel">
            <div id="notification-container" className="notification-container">
                {isNotificationsVisible && notifications.map((notification, index) => (
                    <Notifications
                        id={notification.id}
                        key={notification.id}
                        notification={notification}
                        handleNotificationClose={handleNotificationClose}
                    />
                ))}
                {isNotificationsVisible && (
                    <button type="button" className="btn btn-secondary" onClick={handleAllNotificationsClose}>
                        Clear All
                    </button>
                )}
            </div>
            <h4>Admin Panel 1.0v</h4>
            {/* <div className='dash-panel'>
                <DashBox title='Students' numbers={students? students.length: 0} backgroundColor='#f8b34a'/>
                <DashBox title='Eligible Students' numbers={students? students.filter((n) => n.number_of_referrals >= 2).length: 0} allStudents={students? students.length: 0} backgroundColor='#58ce5c'/>
                <DashBox title='Ineligible Students' numbers={students? students.filter((n) => n.number_of_referrals < 2).length: 0} allStudents={students? students.length: 0} backgroundColor='#fd6770'/>
            </div> */}
            <nav>
                <div className="nav nav-tabs" id="nav-tab" role="tablist">
                    <button className={`nav-link ${window.location.pathname.split('/')[2] === "student" ? "active" : window.location.pathname.split('/')[2] === undefined? "active" : ""}`} id="nav-students-tab" type="button" role="tab" onClick={handleOpenTab}>Students</button>
                    <button className={`nav-link ${window.location.pathname.split('/')[2] === "googleform" ? "active" : ""}` } id="nav-googleforms-tab" type="button" role="tab" onClick={handleOpenTab}>Google Forms</button>
                </div>
            </nav>
            <Outlet />
        </div>
    );
};

export default AdminPanelLayout;
