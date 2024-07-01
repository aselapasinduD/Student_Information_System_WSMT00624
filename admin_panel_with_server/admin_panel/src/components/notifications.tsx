import React, {useRef} from "react";
import Alert from '@mui/material/Alert';

interface Notification{
    id: string;
    message: string;
    from: string;
    error: boolean;
}

interface props{
    id: string;
    notification: Notification;
    handleNotificationClose: (notificationID: string) => void;
}

const Notifications: React.FC<props> = ({id, notification, handleNotificationClose}) => {

    return(
        <Alert id={notification.id} className="notification" severity={`${notification.error? "error": "success"}`}>
             <div className="header">
                <h5>Notifications</h5>
                <button type="button" className="btn-close" onClick={() => handleNotificationClose(notification.id)} aria-label="Close"></button>
            </div>
            <p>{notification.message}</p>
        </Alert>
    )
}

export default Notifications;