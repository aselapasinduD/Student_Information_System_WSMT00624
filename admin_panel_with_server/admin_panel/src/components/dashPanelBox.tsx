import React from "react";

interface DashBoxProps{
    title: string;
    numbers: number;
    backgroundColor: string;
}

const DashBox: React.FC<DashBoxProps>  = ({title, numbers, backgroundColor}) => {
    return(
        <div className="dash-box" style={{backgroundColor: backgroundColor}}>
            <h3>{title}</h3>
            <h1>{numbers}</h1>
        </div>
    );
}

export default DashBox;