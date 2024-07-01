import React from "react";

interface DashBoxProps{
    title: string;
    numbers: number;
    backgroundColor: string;
    allStudents?: number;
}

const DashBox: React.FC<DashBoxProps>  = ({title, numbers, allStudents, backgroundColor}) => {
    return(
        <div className="dash-box" style={{backgroundColor: backgroundColor}}>
            <h4>{title}</h4>
            <div>
                <h1>{numbers}</h1>
                {allStudents? <h1>{Math.round(numbers/allStudents*100)}%</h1>: ""}
            </div>
        </div>
    );
}

export default DashBox;