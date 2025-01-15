import { Fragment, useEffect, useRef, useState } from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from "@mui/material/Box";
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

import AddIcon from '@mui/icons-material/Add';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import { Message } from "../states/type";
import baseAPI, { socket } from "../states/api";

interface props {
    handleFormClose: () => void;
    collectNotifications: (notification: Message) => void;
}

interface googleFormTitle {
    id: number;
    title: string;
}

interface ResponseGoogleFormTitles {
    message: string,
    form: string,
    body: googleFormTitle[]
}

interface columnPlaceholdersType {
    id: string;
    lable: string;
    isChangeable: boolean;
}

function createColumnPlaceholders(
    id: string,
    lable: string,
    isChangeable: boolean,
) {
    return { id, lable, isChangeable };
}

const tableColumnsPlaceholder: columnPlaceholdersType[] = [
    createColumnPlaceholders("full_name", "Full Name", false),
    createColumnPlaceholders("email", "Email", false),
    createColumnPlaceholders("address", "Address", true),
    createColumnPlaceholders("wa_number", "WhatsApp Number", false),
    createColumnPlaceholders("referral_number", "Referral Phone Number", true),
    createColumnPlaceholders("register_at", "Register Date", true)
]

export interface FetchDataSetAsJSON {
    message: string | Record<string, any>[],
    from: string,
}

const ImportBundleOfStudentsForm: React.FC<props> = ({ handleFormClose, collectNotifications }) => {
    const excelFileRef = useRef<HTMLInputElement | null>(null);
    const [dataSetAsJSON, getDataSetAsJSON] = useState<Record<string, number>[] | undefined>(undefined);
    const [isLodingDataSetAsJSON, checkIsLodingDataSetAsJSON] = useState<boolean>(false);
    const [columnPlaceholders, getColumnPlaceholders] = useState<columnPlaceholdersType[] | undefined>(undefined);
    const [googleFormTitleList, setGoogleFormTitleList] = useState<googleFormTitle[]>([]);

    const handleExcelFileUploadButton = () => {
        if (excelFileRef && excelFileRef.current) excelFileRef.current.click();
    }

    async function handleBundleFormSubmit(event: React.FormEvent){
        event.preventDefault();
        const formData = new FormData(event.currentTarget as HTMLFormElement);
        if(dataSetAsJSON) formData.append("bundleDataSetAsJSON", JSON.stringify(dataSetAsJSON));
        if(columnPlaceholders) formData.append("columnPlaceholders", JSON.stringify(columnPlaceholders));
        if(socket.id) formData.append('socketID', socket.id);
        try{
            const response = await fetch(baseAPI + "/admin-panel/bundles/import",{
                method: "POST",
                body: formData
            });
            if (response.ok) {
                const data = await response.json();
                console.log(data.message);
            }
        } catch (error) {
            console.log("Error fetching bundle data from server: ", error);
        }
    }

    useEffect(()=>{
        const fetchStudent = async () => {
            try{
                const response = await fetch(baseAPI + "/admin-panel/googleforms/titles",{
                    method: 'GET'
                });
                if(!response){
                    throw new Error("Failed to fetch Google Forms titles from the server");
                }
                const googleFormsArr = await response.json() as ResponseGoogleFormTitles;
                if(Boolean(googleFormsArr.body.length)){
                  setGoogleFormTitleList([...googleFormsArr.body]);
                }
            } catch (error){
                console.log("Error fetching Google forms titles from server: ", error);
            }
        }
        fetchStudent();
    },[]);

    const handleExcelFileUpload = async (event: React.MouseEvent<HTMLInputElement>) => {
        const currentElement = event.currentTarget;
        if (currentElement.files && currentElement.files[0]) {
            checkIsLodingDataSetAsJSON(true);
            const formData = new FormData();
            formData.append("dataBundleFile", currentElement.files[0]);
            try {
                const response = await fetch(baseAPI + "/admin-panel/bundles/process", {
                    method: "POST",
                    body: formData
                });
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data.message)) {
                        checkIsLodingDataSetAsJSON(false);
                        return getDataSetAsJSON(data.message)
                    };
                    collectNotifications({ ...data, error: true });
                    checkIsLodingDataSetAsJSON(false);
                }
            } catch (error) {
                getDataSetAsJSON(undefined);
                collectNotifications({ message: "Check your internet connection. " + String(error), from: "Front App", error: true });
            }
        } else {
            getDataSetAsJSON(undefined);
        }
        currentElement.value = "";
        checkIsLodingDataSetAsJSON(false);
    }

    useEffect(() => {
        if (!dataSetAsJSON) return;
        const initialColumnPlaceholders = [
            createColumnPlaceholders("full_name", "Full Name", false),
            createColumnPlaceholders("email", "Email", false),
            createColumnPlaceholders("wa_number", "WhatsApp Number", false),
        ]
        getColumnPlaceholders(
            Object.keys(dataSetAsJSON[0]).map((data, index) => (index < initialColumnPlaceholders.length ? initialColumnPlaceholders[index] : createColumnPlaceholders("", "", true)))
        );
    }, [dataSetAsJSON]);

    function handleAddNewColumnPlaceholders(index: number) {
        if (!columnPlaceholders || !dataSetAsJSON) return;

        getColumnPlaceholders((prevList) => {
            if (!prevList) return;
            let newList = [...prevList];

            const usedPlaceholders = newList.map((item) => item.id);
            const allPlaceholdersUsed = tableColumnsPlaceholder.every((placeholder) => usedPlaceholders.includes(placeholder.id));
            if (allPlaceholdersUsed) {
                collectNotifications({message: "All placeholders are already used.", from: "Front App", error: false});
                return prevList;
            }

            if (newList[index].id !== "") return prevList;

            const availablePlaceholders = tableColumnsPlaceholder.filter(
                (placeholder) => !usedPlaceholders.includes(placeholder.id)
            );
            [newList[index]] = [availablePlaceholders[0]];
            return newList;
        })
    }

    function handleLeftMoveColumnPlaceholder(index: number) {
        if (!columnPlaceholders || !dataSetAsJSON || index <= 0) return;
        getColumnPlaceholders((prevList) => {
            if (!prevList) return;
            const newList = [...prevList];
            [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]]
            return newList;
        });
    }
    function handleRightMoveColumnPlaceholder(index: number) {
        if (!columnPlaceholders || !dataSetAsJSON || index >= columnPlaceholders.length - 1) return;
        getColumnPlaceholders((prevList) => {
            if (!prevList) return;
            const newList = [...prevList];
            [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]]
            return newList;
        });
    }

    function handleChangePlaceholder(isUpDown: boolean, index: number) {
        if (!dataSetAsJSON) return;

        getColumnPlaceholders((prevList) => {
            if (!prevList) return;
            const newList = [...prevList];

            // Get the list of unused placeholders by filtering out already used ones
            const usedPlaceholders = newList.map((item) => item.id);
            const availablePlaceholders = tableColumnsPlaceholder.filter(
                (placeholder) => !usedPlaceholders.includes(placeholder.id)
            );

            if (availablePlaceholders.length === 0) return prevList;
            const currentPlaceholderIndex = availablePlaceholders.findIndex(
                (placeholder) => placeholder.id === newList[index].id
            );

            // Determine the next index based on direction
            let nextIndex;
            if (isUpDown) {
                nextIndex = (currentPlaceholderIndex + 1) % availablePlaceholders.length;
            } else {
                nextIndex = (currentPlaceholderIndex + availablePlaceholders.length) % availablePlaceholders.length;
            }

            newList[index] = availablePlaceholders[nextIndex];
            return newList;
        });
    }

    function handleRemoveColumnPlaceholder(index: number){
        getColumnPlaceholders((prevList) => {
            if(!prevList) return;
            const newList = [...prevList];
            [newList[index]] = [createColumnPlaceholders("", "", false)];
            return newList;
        });
    }

    useEffect(() => {
        socket.on('bundleImportPrograss', (prograss) => {
            console.log("Prograss: " + prograss);
        });
        return () => {
            socket.off('bundleImportPrograss');
        }
    }, []);

    return (
        <Fragment>
            <div className="form">
                <div style={{ width: "90vw" }}>
                    <button type="button" className="btn-close btn-close-red" onClick={handleFormClose} aria-label="Close"></button>
                    <div className="form-container import-bundles pt-3 pb-4">
                        <div className="d-flex justify-content-between">
                            <h4>Import Bundle Of Students</h4>
                            <div className="px-3 d-flex gap-2">
                                <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
                            </div>
                        </div>
                        <form onSubmit={handleBundleFormSubmit}>
                            {!Boolean(dataSetAsJSON) ?
                                <div>
                                    <label htmlFor="excelFileUpload" className="form-label">Upload The Sheet</label>
                                    <input type="file" id="excelFileUpload" accept=".csv, .xlsx, .xlsm, .xlsb" onInput={handleExcelFileUpload} className="d-none" ref={excelFileRef} />
                                    <div className="w-100 d-flex mb-4 rounded-3 position-relative justify-content-center align-items-center overflow-hidden border" style={{ minHeight: '140px' }}>
                                        {isLodingDataSetAsJSON ?
                                            <div className="d-flex justify-content-center">
                                                <div className="spinner-border" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                            :
                                            <button type="button" className="btn btn-outline-secondary position-absolute" onClick={handleExcelFileUploadButton} >Upload Sheet File <br /> .csv | .xlsx | .xlsm | .xlsb</button>
                                        }
                                    </div>
                                </div>
                                :
                                <TableContainer sx={{ height: "calc(75vh - 24px)" }} className="border-top border-bottom my-2">
                                    <Table className="border-start border-end">
                                        <TableHead>
                                            <TableRow>
                                                {columnPlaceholders && columnPlaceholders.map((columnName, index) =>
                                                    <TableCell
                                                        key={index}
                                                        padding={'checkbox'}
                                                        sx={{ padding: "4px", height: "50px" }}
                                                    >
                                                        {columnName.id === "" ?
                                                            <Button
                                                                sx={{
                                                                    width: "100%",
                                                                    height: "100%"
                                                                }}
                                                                onClick={() => handleAddNewColumnPlaceholders(index)}
                                                            >
                                                                <AddIcon />
                                                            </Button>
                                                            :
                                                            <Box
                                                                textAlign={'left'}
                                                                fontSize={'1rem'}
                                                                padding={"4px"}
                                                                margin={0}
                                                                height={"100%"}
                                                                position={'relative'}
                                                                className="alert alert-primary"
                                                            >
                                                                <Box
                                                                    display={"flex"}
                                                                    width={"100%"}
                                                                    flexWrap={"wrap"}
                                                                    alignItems={"center"}
                                                                    justifyContent={"space-between"}
                                                                >
                                                                    <Button
                                                                        sx={{
                                                                            display: "block",
                                                                            width: "max-content",
                                                                            minWidth: "auto",
                                                                            padding: "2px",
                                                                        }}
                                                                        onClick={() => handleLeftMoveColumnPlaceholder(index)}
                                                                    >
                                                                        <ArrowBackIosIcon />
                                                                    </Button>
                                                                    <p className="m-0 text-center" style={{fontSize: "0.9rem"}}>{columnName.lable}</p>
                                                                    <div className="d-flex">
                                                                        {columnName.isChangeable && <div className="d-flex">
                                                                            <IconButton
                                                                                sx={{
                                                                                    display: "block",
                                                                                    width: "max-content",
                                                                                    height: "max-content",
                                                                                    minWidth: "auto",
                                                                                    padding: "2px",
                                                                                    color: 'red'
                                                                                }}
                                                                                onClick={() => handleRemoveColumnPlaceholder(index)}
                                                                            >
                                                                                <HighlightOffIcon />
                                                                            </IconButton>
                                                                            <IconButton
                                                                                sx={{
                                                                                    display: "block",
                                                                                    width: "max-content",
                                                                                    height: "max-content",
                                                                                    minWidth: "auto",
                                                                                    padding: "2px",
                                                                                }}
                                                                                onClick={() => handleChangePlaceholder(true, index)}
                                                                            >
                                                                                <KeyboardArrowUpIcon />
                                                                            </IconButton>
                                                                            <IconButton
                                                                                sx={{
                                                                                    display: "block",
                                                                                    width: "max-content",
                                                                                    height: "max-content",
                                                                                    minWidth: "auto",
                                                                                    padding: "2px",
                                                                                }}
                                                                                onClick={() => handleChangePlaceholder(false, index)}
                                                                            >
                                                                                <KeyboardArrowDownIcon />
                                                                            </IconButton>
                                                                        </div>
                                                                        }
                                                                        <Button
                                                                            sx={{
                                                                                display: "block",
                                                                                width: "max-content",
                                                                                minWidth: "auto",
                                                                                padding: "2px",
                                                                            }}
                                                                            onClick={() => handleRightMoveColumnPlaceholder(index)}
                                                                        >
                                                                            <ArrowForwardIosIcon />
                                                                        </Button>
                                                                    </div>
                                                                </Box>
                                                            </Box>
                                                        }
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                            <TableRow>
                                                {dataSetAsJSON && Object.keys(dataSetAsJSON[0]).map((columnName, index) =>
                                                    <TableCell
                                                        key={index}
                                                        align={'left'}
                                                        // sortDirection={orderBy === column.id ? order : false}
                                                        padding={'checkbox'}
                                                    >
                                                        {columnName}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {dataSetAsJSON?.map((row, index) =>
                                                <TableRow key={index}>
                                                    {Object.values(row).map((value, valueIndex) =>
                                                        <TableCell
                                                            key={valueIndex}
                                                            padding={'checkbox'}
                                                        >
                                                            {String(value)}
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            }
                            <div className="d-flex gap-2 flex-wrap">
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text" id="inputGroup-sizing-sm">Google Form *</span>
                                    <select className="form-select" aria-label="Select the Google Form Here" name="googleForm" required>
                                        <option selected>Open this select Google Form</option>
                                        {googleFormTitleList.length > 0 && googleFormTitleList.map((googleFormtitlevalue, index) => <option key={index} value={`${googleFormtitlevalue.id}`}>{googleFormtitlevalue.title}</option>)}
                                    </select>
                                </div>
                                <div className="form-check d-flex align-items-center gap-2">
                                    <input className="form-check-input" type="checkbox" value="" id="isRegisterDateToday" />
                                    <label className="form-check-label" style={{ width: "max-content" }} htmlFor="isRegisterDateToday">
                                        Register Date Today
                                    </label>
                                </div>
                                <button type="submit" className="btn btn-primary">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default ImportBundleOfStudentsForm;