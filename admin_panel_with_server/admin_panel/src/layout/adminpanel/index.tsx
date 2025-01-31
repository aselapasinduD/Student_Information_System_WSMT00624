import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import DashBox from '../../components/dashPanelBox';
import Notifications from '../../components/notifications';

import { Notification, Message } from "../../states/type";
import baseAPI from "../../states/api";

interface Props {
    notification: Message | null;
}

interface dashboard {
    total_students: number;
    new_students: number;
    eligible_students: number;
    ineligible_students: number;
    total_google_forms: number;
}
const initialDashboard = {
    total_students: 0,
    new_students: 0,
    eligible_students: 0,
    ineligible_students: 0,
    total_google_forms: 0,
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
    const [dashboardData, setDashboardData] = useState<dashboard>(initialDashboard);

    useEffect(() => {
        if (!notification) return;
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
        if (button) {
            const buttonId = button.getAttribute('id');
            switch (buttonId) {
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

    useEffect(() => {
        async function handleDashboardFetch() {
            const response = await fetch(baseAPI + '/admin-panel/dashboard', {
                method: "GET"
            });
            if (response.ok) {
                const data = await response.json();
                setDashboardData(data.body);
            }
        }
        handleDashboardFetch();
    }, []);

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
            <h4>Admin Panel 1.1v</h4>
            <div className='dash-panel mb-2'>
                <DashBox title='Students' numbers={dashboardData.total_students} backgroundColor='#f8b34a' />
                <DashBox title='Google Forms' numbers={dashboardData.total_google_forms} backgroundColor='#56c2fa' />
                <DashBox title='New Students' numbers={dashboardData.new_students} backgroundColor='#7fba00' />
                <DashBox title='Eligible Students' numbers={dashboardData.eligible_students} allStudents={dashboardData.total_students} backgroundColor='#58ce5c' />
                <DashBox title='Ineligible Students' numbers={dashboardData.ineligible_students} allStudents={dashboardData.total_students} backgroundColor='#fd6770' />
            </div>
            <nav>
                <div className="nav nav-tabs" id="nav-tab" role="tablist">
                    <button className={`nav-link ${window.location.pathname.split('/')[2] === "student" ? "active" : window.location.pathname.split('/')[2] === undefined ? "active" : ""}`} id="nav-students-tab" type="button" role="tab" onClick={handleOpenTab}>Students</button>
                    <button className={`nav-link ${window.location.pathname.split('/')[2] === "googleform" ? "active" : ""}`} id="nav-googleforms-tab" type="button" role="tab" onClick={handleOpenTab}>Google Forms</button>
                </div>
            </nav>
            <Outlet />
        </div>
    );
};

export default AdminPanelLayout;
