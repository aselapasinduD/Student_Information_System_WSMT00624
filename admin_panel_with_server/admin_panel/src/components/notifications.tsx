import React, {useRef} from "react";

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
        <div id={id} className={`notification ${notification.error? "error": ""}`}>
            <div className="header">
                <button type="button" className="btn-close" onClick={() => handleNotificationClose(notification.id)} aria-label="Close"></button>
                <h5>Notifications</h5>
            </div>
            <p>{notification.message}</p>
        </div>
    )
}

export default Notifications;