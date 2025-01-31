import React, { useState, Fragment, useEffect, useMemo, Dispatch, SetStateAction } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import Checkbox from '@mui/material/Checkbox';
import TableSortLabel from '@mui/material/TableSortLabel';
import visuallyHidden from '@mui/utils/visuallyHidden';
import TextField from '@mui/material/TextField';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import OutlinedInput from '@mui/material/OutlinedInput';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';

// MUI Icons
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import EmailIcon from '@mui/icons-material/Email';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import LinkIcon from '@mui/icons-material/Link';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import AlertDialog from "./alertDialog";

import { Student, Message } from '../states/type';
import baseAPI from '../states/api';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';
type Unassigned = "";

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
}

function getComparator<Key extends keyof any>(order: Order, orderBy: Key): (a: { [key in Key]: any }, b: { [key in Key]: any }) => number {
  return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: readonly Student[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface FilterOptions {
  id: keyof Student;
  value: string | null;
  options?: {
    below?: boolean,
    NoN?: boolean
  };
}

const initialFilterOptions: FilterOptions[] = [
  {
    id: "number_of_referrals",
    value: null
  },
  {
    id: "full_name",
    value: null
  },
  {
    id: "register_at",
    value: null
  },
  {
    id: "google_form_id",
    value: null
  },
  {
    id: "status",
    value: null
  },
  {
    id: "address",
    value: null
  },
  {
    id: "isDetailsChecked",
    value: null
  }
]

/**
 * This function is for apply filters to the Students List.
 * 
 * @param {Array} rows - List of Students.
 * @param {FilterOptions} options - List of filter options set by filter menu.
 * @returns {Array} - Filterd List of Students
 * @version 1.1.0
 * @since 1.0.0
 */
function filter(rows: readonly Student[], options: FilterOptions[]) {
  let filterdRows = rows;
  // Filter full_name
  filterdRows = filterdRows.filter((record) => record.full_name.toLowerCase().includes((options[1].value ? options[1].value : "").toLowerCase()));
  // Filter number_of_referrals
  if (options[0].value) filterdRows = filterdRows.filter((record) => options[0].options?.below === true ? record.number_of_referrals <= parseInt((options[0].value ? options[0].value : "")) : record.number_of_referrals === parseInt((options[0].value ? options[0].value : "")));
  // Filter register_at
  filterdRows = filterdRows.filter((record) => record.register_at.toLowerCase().includes((options[2].value ? options[2].value : "").toLowerCase()));
  // Filter google_form_id
  filterdRows = filterdRows.filter((record) => options[3].value ? record.google_form_id === parseInt((options[3].value ? options[3].value : "")) : true);
  // Filter status
  filterdRows = filterdRows.filter((record) => {
    if (!options[4].value) return true;
    if (!record.status || record.status.length === 0) return false;
    return Array.isArray(record.status) && record.status.some((status: string) => options[4].value?.toLowerCase().split(",").includes(status.toLowerCase()));
  });
  // Fillter Address
  filterdRows = filterdRows.filter((record) => {
    if (options[5].options?.NoN) return Boolean(!record.address);
    if (record.address) return record.address.toLowerCase().includes((options[5].value ? options[5].value : "").toLowerCase());
    if (options[5].value) return false;
    return true
  });
  // Fillter is details checked
  filterdRows = filterdRows.filter((record) => {
    if (options[6].value === "true") return record.isDetailsChecked;
    if (options[6].value === "false") return record.isDetailsChecked === null ? false : !record.isDetailsChecked;
    if (options[6].value === "") return record.isDetailsChecked === null;
    return true;
  });
  return filterdRows;
}

interface filterMenus extends MenuProps {
  setfilteroptions: (value: FilterOptions[]) => void;
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

const StatusList = [
  {
    status: 'gf',
    describe: 'Google Form'
  },
  {
    status: 'cm',
    describe: 'Certificate Emailed'
  },
  {
    status: 'ib',
    describe: 'Imported Bundle'
  },
]

/**
 * This function is for provide Menu Component for handle filters.
 * 
 * @param {filterMenus} props - 
 * @returns 
 * @version 1.1.0
 * @since 1.0.0
 */
const FilterMenus = (props: filterMenus) => {
  const { setfilteroptions, open } = props;
  const [valueFullName, getValueFullName] = useState<string>("");
  const [valueNumberOfReferrals, getValueNumberOfRegerrals] = useState<string>("");
  const [valueRegisterAt, getValueRegisterAt] = useState<string>("");
  const [isBelowChecked, setIsBelowChecked] = useState<boolean>(false);
  const [googleFormTitleList, setGoogleFormTitleList] = useState<googleFormTitle[]>([]);
  const [googleFormTitle, setGoogleFormTitle] = useState<string>("");
  const [status, setStatus] = React.useState<string[]>([]);
  const [valueAddress, getValueAddress] = useState<string>("");
  const [isNonAddressChecked, setIsNonAddressChecked] = useState<boolean>(false);
  const [isDetailsChecked, setIsDetailsChecked] = useState<string | null>(null);


  const handleIdChange = (value: string) => {
    getValueFullName(value);
  }
  const handleNumberOfReferralsChange = (value: string) => {
    getValueNumberOfRegerrals(value);
  }
  const handleRegisterAtChange = (value: string) => {
    getValueRegisterAt(value);
  }
  const handleStatusChange = (event: SelectChangeEvent<typeof status>) => {
    const { target: { value } } = event;
    setStatus(typeof value === 'string' ? value.split(',') : value);
  };
  const handleAddressChange = (address: string) => {
    getValueAddress(address);
  }

  const handleClearFilters = () => {
    setfilteroptions(initialFilterOptions);
    getValueFullName("");
    getValueNumberOfRegerrals("");
    getValueRegisterAt("");
    setGoogleFormTitle("");
    setStatus([]);
    getValueAddress("");
    setIsDetailsChecked(null);
  }

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch(baseAPI + "/admin-panel/googleforms/titles", {
          method: 'GET'
        });
        if (!response) {
          throw new Error("Failed to fetch Google Forms titles from the server");
        }
        const googleFormsArr = await response.json() as ResponseGoogleFormTitles;
        if (Boolean(googleFormsArr.body.length)) {
          setGoogleFormTitleList([...googleFormsArr.body]);
        }
        // getGoogleForms(googleFormsArr.body? formatGoogleFormList(googleFormsArr.body) : Loading);
      } catch (error) {
        console.log("Error fetching Google forms titles from server: ", error);
      }
    }
    fetchStudent();
  }, []);

  useEffect(() => {
    if (open) {
      setfilteroptions(
        [
          {
            id: "number_of_referrals",
            value: valueNumberOfReferrals === "" ? null : valueNumberOfReferrals,
            options: { below: isBelowChecked }
          },
          {
            id: "full_name",
            value: valueFullName === "" ? null : valueFullName
          },
          {
            id: "register_at",
            value: valueRegisterAt === "" ? null : valueRegisterAt
          },
          {
            id: "google_form_id",
            value: googleFormTitle === "" ? null : googleFormTitle
          },
          {
            id: "status",
            value: status.length === 0 ? null : status.join(",")
          },
          {
            id: "address",
            value: valueAddress === "" ? null : valueAddress,
            options: { NoN: isNonAddressChecked }
          },
          {
            id: "isDetailsChecked",
            value: isDetailsChecked
          }
        ]
      );
    }
  }, [isDetailsChecked, valueFullName, valueNumberOfReferrals, valueRegisterAt, isBelowChecked, open, setfilteroptions, googleFormTitle, googleFormTitleList, status, valueAddress, isNonAddressChecked]);

  return (
    <Menu
      id="demo-customized-menu"
      MenuListProps={{
        'aria-labelledby': 'demo-customized-button',
      }}
      elevation={0}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      sx={{
        '& .MuiPaper-root': {
          borderRadius: 3,
          marginTop: "5px",
          minWidth: 180,
          boxShadow: 'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px'
        }
      }}
      {...props}
    >
      <MenuItem sx={{ display: "flex", gap: "4px" }}>
        <Button variant="contained" color="success" onClick={() => setIsDetailsChecked("true")}>
          Complete
        </Button>
        <Button variant="contained" color="error" onClick={() => setIsDetailsChecked("false")}>
          Uncomplete
        </Button>
        <Button variant="outlined" color="inherit" onClick={() => setIsDetailsChecked("")}>
          None
        </Button>
      </MenuItem>
      <MenuItem onKeyDown={(e) => e.stopPropagation()}>
        <TextField name="full_name" hiddenLabel label="Full Name" inputProps={{ pattern: "[0-9]{11}", value: valueFullName }} size='small' margin='none' sx={{ width: "100%" }} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleIdChange(e.target.value)} />
      </MenuItem>
      <MenuItem onKeyDown={(e) => e.stopPropagation()}>
        <TextField name="address" hiddenLabel label="Address" inputProps={{ value: valueAddress }} type='text' size='small' margin='none' sx={{ mr: 1, width: "100%" }} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAddressChange(e.target.value)} />
        <FormControlLabel control={<Checkbox checked={isNonAddressChecked} onChange={(e) => setIsNonAddressChecked(e.target.checked)} />} label="NoN" />
      </MenuItem>
      <MenuItem onKeyDown={(e) => e.stopPropagation()}>
        <TextField name='number_of_referrals' placeholder='0' inputProps={{ pattern: "[0-9]{11}", type: "number", value: valueNumberOfReferrals }} hiddenLabel label="Referrals" size='small' margin='none' onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNumberOfReferralsChange(e.target.value)} sx={{ mr: 1, width: '15ch' }} />
        <FormControlLabel control={<Checkbox checked={isBelowChecked} onChange={(e) => setIsBelowChecked(e.target.checked)} />} label="Below" />
      </MenuItem>
      <MenuItem onKeyDown={(e) => e.stopPropagation()}>
        <TextField name='register_at' hiddenLabel label="Register At" placeholder='Jan 01, 2025, 00:00 PM' size='small' margin='none' sx={{ width: "100%" }} inputProps={{ pattern: "[0-9]{11}", value: valueRegisterAt }} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRegisterAtChange(e.target.value)} />
      </MenuItem>
      <MenuItem onKeyDown={(e) => e.stopPropagation()}>
        <FormControl size="small" sx={{ width: "100%" }}>
          <InputLabel id="google-form-title-select-label">Google Form Title</InputLabel>
          <Select
            labelId="google-form-title-select-label"
            id="demo-simple-select"
            value={googleFormTitle}
            label="Google Form Title"
            onChange={(e: SelectChangeEvent) => setGoogleFormTitle(e.target.value as string)}
          >
            <MenuItem value={0}>
              <em>None</em>
            </MenuItem>
            {googleFormTitleList.length > 0 && googleFormTitleList.map((googleFormtitlevalue, index) => <MenuItem key={index} value={googleFormtitlevalue.id}>{googleFormtitlevalue.title}</MenuItem>)}
          </Select>
        </FormControl>
      </MenuItem>
      <MenuItem onKeyDown={(e) => e.stopPropagation()}>
        <FormControl size="small" sx={{ width: "100%" }}>
          <InputLabel id="demo-multiple-chip-label">Status</InputLabel>
          <Select
            labelId="status-multiple-chip-label"
            id="status-multiple-chip"
            multiple
            value={status}
            onChange={handleStatusChange}
            input={<OutlinedInput id="select-multiple-chip" label="Status" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value.toUpperCase()} />
                ))}
              </Box>
            )}
            MenuProps={
              {
                PaperProps: {
                  style: {
                    maxHeight: 48 * 4.5 + 8
                  }
                }
              }
            }
          >
            {StatusList.map((status) => (
              <MenuItem
                key={status.status}
                value={status.status}
              >
                {status.status.toUpperCase()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </MenuItem>
      <MenuItem onKeyDown={(e) => e.stopPropagation()} onClick={handleClearFilters} style={{ justifyContent: "center" }}>
        <Typography align='center'>Clear Filters</Typography>
      </MenuItem>
    </Menu>
  );
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        <FirstPageIcon />
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        <KeyboardArrowRight />
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        <LastPageIcon />
      </IconButton>
    </Box>
  );
}

interface EnhancedTableToolbarProps {
  numSelected: number;
  handleAddFormOpen: () => void;
  handleDelete: () => void;
  handleCustomeEmailForAll: () => void;
  setFilterOptions: (value: FilterOptions[]) => void;
  handleImportBundleOfStudentsFormOpen: () => void;
  handleGeneratePDFsFormOpen: () => void;
  handleGenerateCertificatesFormOpen: () => void;
}

/**
 * 
 * @param props 
 * @returns 
 * @version 1.1.0
 * @since 1.0.0
 */
function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const {
    numSelected,
    handleAddFormOpen,
    handleDelete,
    handleCustomeEmailForAll,
    setFilterOptions,
    handleImportBundleOfStudentsFormOpen,
    handleGeneratePDFsFormOpen,
    handleGenerateCertificatesFormOpen
  } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleFilterButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && { backgroundColor: "rgba(25, 118, 210, 0.12)" }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Stack direction="row" spacing={2} sx={{ flex: '1 1 100%', alignItems: 'center' }}>
          <Typography
            variant="h6"
            id="tableTitle"
            component="div"
          >
            Students
          </Typography>
          <Typography variant="caption" gutterBottom sx={{ display: 'block' }}>
            <strong>Status:</strong> Google Form - <Chip label="GF" sx={{ fontWeight: 600 }} /> | Certificate Emailed - <Chip label="CM" sx={{ fontWeight: 600 }} /> | Imported Bundle - <Chip label="IB" sx={{ fontWeight: 600 }} />
          </Typography>
        </Stack>
      )}
      {numSelected > 0 ? (
        <Fragment>
          <Tooltip title="Generate Certificates">
            <IconButton
              onClick={handleGenerateCertificatesFormOpen}
            >
              <DocumentScannerIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Generate PDFs">
            <IconButton
              onClick={handleGeneratePDFsFormOpen}
            >
              <PictureAsPdfIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              onClick={handleDelete}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Send Mail">
            <IconButton
              onClick={handleCustomeEmailForAll}
            >
              <EmailIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Send SMS">
            <IconButton>
              <SendIcon />
            </IconButton>
          </Tooltip>
        </Fragment>
      ) : (

        <Fragment>
          <Tooltip title="Import Bundle of Students">
            <IconButton
              onClick={handleImportBundleOfStudentsFormOpen}
            >
              <NoteAddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Student">
            <IconButton
              onClick={handleAddFormOpen}
            >
              <PersonAddAlt1Icon />
            </IconButton>
          </Tooltip>
          <div>
            <Tooltip title="Filter list">
              <IconButton
                onClick={handleFilterButtonClick}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <FilterMenus setfilteroptions={setFilterOptions} open={open} anchorEl={anchorEl} onClose={handleClose} />
          </div>
        </Fragment>
      )}
    </Toolbar>
  );
}

interface EditStudent {
  id: number;
  full_name: string;
  email: string;
  wanumber: number | string;
  address: string;
  googleFormId: number;
  receiptURL: string;
}

interface RowProps {
  row: Student;
  index: number;
  isSelected: (selectedID: number) => boolean;
  handleSelectClick: (event: React.MouseEvent<unknown>, id: number) => void;
  handleCustormEmailFormOpen: (id: number[]) => void;
  handleEditFormOpen: (EditStudent: EditStudent) => void;
  copyReceiptLinkToClipboard: (receiptLink: string) => void;
  studentDetailsCheck: (studentID: number, status: boolean) => void;
}

/**
 * This function is for handle rows
 * 
 * @param {object} row - list of student details
 * @param {number} index - row index number
 * @param {function} isSelected - function for check is selected row
 * @param {function} handleSelectClick - function for handle selected rows
 * @param {function} handleCustormEmailFormOpen - function for handle send email for each student
 * @param {function} handleEditFormOpen - function for handle edit student details for each row
 * @returns {JSX.Element}
 * @version 1.1.0
 * @since 1.0.0
 */
const Row: React.FC<RowProps> = ({ row, index, isSelected, handleSelectClick, handleCustormEmailFormOpen, handleEditFormOpen, copyReceiptLinkToClipboard, studentDetailsCheck }) => {
  const [open, setOpen] = useState(false);
  const [anchorElForAddress, setAnchorElAddress] = React.useState<HTMLElement | null>(null);
  const isItemSelected = isSelected(row.id);
  const labelId = `checkbox-student-${index}`;

  const handleAddressPopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElAddress(event.currentTarget);
  };

  const handleAddressPopoverClose = () => {
    setAnchorElAddress(null);
  };

  const openAddressPopover = Boolean(anchorElForAddress);

  return (
    <Fragment>
      <TableRow
        hover
        aria-checked={isItemSelected}
        selected={isItemSelected}
        sx={{ background: `${row.isDetailsChecked === null ? "" : `linear-gradient(90deg, ${row.isDetailsChecked ? "#58ce5c" : "#fd6770"} 2%, transparent 3%),`} linear-gradient(165deg, transparent 30%, ${row.google_form_color}) !important` }}
      >
        <TableCell padding="none">
          <Checkbox
            color="primary"
            onClick={(event) => handleSelectClick(event, row.id)}
            checked={isItemSelected}
            inputProps={{
              'aria-labelledby': labelId,
            }}
          />
        </TableCell>
        <TableCell padding="none">
          {Boolean(row.referral_student.length !== 0) &&
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          }
        </TableCell>
        <TableCell padding='none' scope="row" align="center">
          {row.id}
        </TableCell>
        <TableCell >{row.full_name}</TableCell>
        <TableCell >{row.email}</TableCell>
        <TableCell align='center'>{row.number_of_mails}</TableCell>
        <TableCell >{row.wa_number}</TableCell>
        {row.number_of_referrals >= 2 ?
          <TableCell padding='none' align='center' sx={{ color: "green" }}>{row.number_of_referrals}</TableCell> :
          <TableCell padding='none' align='center' sx={{ color: "red" }}>{row.number_of_referrals}</TableCell>
        }
        <TableCell align='center' >
          <div style={{ display: 'flex', gap: '4px' }}>
            {Boolean(row.status) && Array.isArray(row.status) ? row.status.map((status: string, index: number) => <Chip key={index} label={`${status.toLocaleUpperCase()}`} sx={{ fontWeight: 600 }} />) : row.status}
          </div>
        </TableCell>
        <TableCell align='center'>
          {row.address || row.receiptURL ?
            <>
              <Typography
                aria-owns={openAddressPopover ? 'mouse-over-address-popover' : undefined}
                aria-haspopup="true"
                onMouseEnter={handleAddressPopoverOpen}
              >
                <VisibilityIcon />
              </Typography>
              <Popover
                id="mouse-over-address-popover"
                open={openAddressPopover}
                anchorEl={anchorElForAddress}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                onClose={handleAddressPopoverClose}
                disableRestoreFocus
              >
                <Typography sx={{ p: 1 }}>Address: {row.address}</Typography>
                <Typography sx={{ p: 1 }}>Receipt:
                  <Tooltip title="See The Receipt">
                    <a href={row.receiptURL} target='blank'><DocumentScannerIcon /></a>
                  </Tooltip>
                  <Tooltip title="Copy Receipt Link">
                    <IconButton onClick={() => copyReceiptLinkToClipboard(row.receiptURL)} sx={{ padding: "4px" }} disabled={!Boolean(row.receiptURL)} >
                      <LinkIcon />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <div className="d-grid gap-2 m-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <button type="button" className='btn btn-danger btn-sm col' onClick={() => studentDetailsCheck(row.id, false)}>NO</button>
                  <button type="button" className='btn btn-success btn-sm col' onClick={() => studentDetailsCheck(row.id, true)}>OK</button>
                </div>
              </Popover>
            </>
            :
            <VisibilityOffIcon className='text-black-50' />
          }
        </TableCell>
        <TableCell >{row.register_at}</TableCell>
        <TableCell >{row.updated_at}</TableCell>
        <TableCell padding='none' >
          <div style={{ display: 'flex' }}>
            <Tooltip title="Send Mail">
              <IconButton
                onClick={() => handleCustormEmailFormOpen([row.id])}
              >
                <EmailIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Send SMS">
              <IconButton>
                <SendIcon />
              </IconButton>
            </Tooltip>
          </div>
        </TableCell>
        <TableCell padding='none' >
          <Tooltip title="Edit Details">
            <IconButton
              onClick={() => handleEditFormOpen({ id: row.id, full_name: row.full_name, email: row.email, wanumber: row.wa_number, address: row.address, googleFormId: row.google_form_id, receiptURL: row.receiptURL })}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
      {Boolean(row.referral_student.length !== 0) &&
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="p">
                  Referral Students - {row.number_of_referrals}
                </Typography>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Full Name</TableCell>
                      <TableCell >Email</TableCell>
                      <TableCell >Whatsapp Number</TableCell>
                      <TableCell >Register Date</TableCell>
                      <TableCell >Created Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.referral_student.length !== 0 ? row.referral_student.map((student, index) => (
                      <TableRow key={index}>
                        <TableCell >{student.id}</TableCell>
                        <TableCell >{student.full_name}</TableCell>
                        <TableCell >{student.email}</TableCell>
                        <TableCell >{student.wa_number}</TableCell>
                        <TableCell >{student.register_at}</TableCell>
                        <TableCell >{student.created_at}</TableCell>
                      </TableRow>
                    )) :
                      <TableRow>
                        <TableCell colSpan={10} scope="row" align='center'>There is no any referral Students Yet.(refesh the page)</TableCell>
                      </TableRow>}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      }
    </Fragment>
  );
}

interface rowStudents {
  rows: Student[];
  handleAddFormOpen: () => void;
  handleEditFormOpen: (EditStudent: EditStudent) => void;
  handleCustormEmailFormOpen: (id: readonly number[]) => void;
  collectNotifications: (notification: Message) => void;
  handleImportBundleOfStudentsFormOpen: () => void;
  refetchStudents: Dispatch<SetStateAction<boolean>>;
  handleGeneratePDFsFormOpen: () => void;
  selectedStudents: (value: readonly number[]) => void;
  handleGenerateCertificatesFormOpen: () => void;
}

interface ColumnNames {
  id: keyof Student;
  label: string;
  numeric: boolean;
  padding: "checkbox" | "none" | "normal" | undefined;
}

const columnNames: readonly ColumnNames[] = [
  {
    id: "id",
    label: "ID",
    numeric: true,
    padding: "none",
  },
  {
    id: "full_name",
    label: "Full Name",
    numeric: false,
    padding: 'normal',
  },
  {
    id: "email",
    label: "Email",
    numeric: false,
    padding: 'normal',
  },
  {
    id: "number_of_mails",
    label: "Number of Mails",
    numeric: true,
    padding: "checkbox",
  },
  {
    id: "wa_number",
    label: "Whatsapp Number",
    numeric: false,
    padding: 'normal',
  },
  {
    id: "number_of_referrals",
    label: "Number Of Referrals",
    numeric: true,
    padding: "checkbox",
  },
  {
    id: "status",
    label: "Status",
    numeric: true,
    padding: "checkbox",
  },
  {
    id: "address",
    label: "Details",
    numeric: true,
    padding: "none",
  },
  {
    id: "register_at",
    label: "Register Date",
    numeric: false,
    padding: 'normal',
  },
  {
    id: "updated_at",
    label: "Updated Date",
    numeric: false,
    padding: 'normal',
  }
]

/**
 * Main Students data table assemble funtion.
 * 
 * @param {array} rows - all the students fetch from database
 * @param {function} handleAddFormOpen - this the function for handle students create form
 * @param {function} handleEditFormOpen - this the function for handle students edit form
 * @param {function} handleCustormEmailFormOpen - this the function for handle send emails for each student
 * @param {function} collectNotifications - Notification Collect Function
 * @returns {JSX.Element}
 * @version 1.1.0
 * @since 1.0.0
 */
const DataTable: React.FC<rowStudents> = ({
  rows,
  handleAddFormOpen,
  handleEditFormOpen,
  handleCustormEmailFormOpen,
  collectNotifications,
  handleImportBundleOfStudentsFormOpen,
  handleGeneratePDFsFormOpen,
  refetchStudents,
  selectedStudents,
  handleGenerateCertificatesFormOpen
}) => {
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<keyof Student | Unassigned>('id');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions[]>(initialFilterOptions);
  const [rowCount, getRowCount] = useState<number>(rows.length);
  const [isDialogOpen, getIsDialogOpen] = useState<boolean>(false);
  const numSelected = selected.length;

  useEffect(() => (selectedStudents(selected)), [selected]);

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof Student) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const createSortHandler = (property: keyof Student) => (event: React.MouseEvent<unknown>) => {
    handleRequestSort(event, property);
  };

  const filteredRows = useMemo(() => filter(rows, filterOptions), [filterOptions, rows]);

  const visibleRows = useMemo(
    () => stableSort(filteredRows, getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, filteredRows]);

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  useEffect(() => {
    getRowCount(filteredRows.length);
  }, [visibleRows, filteredRows.length]);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      if (filterOptions !== initialFilterOptions) {
        const newSelected = filteredRows.map((n) => n.id);
        getRowCount(filteredRows.length);
        setSelected(newSelected);
        return;
      }
      const newSelected = rows.map((n) => n.id);
      getRowCount(rows.length);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelectClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const DeleteStudents = async () => {
    try {
      const response = await fetch(baseAPI + "/admin-panel/student",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ listofdelete: selected })
        })
      if (response.ok) {
        const notification = await response.json() as Message;
        collectNotifications(notification);
        // window.location.reload();
        refetchStudents((prevValue) => !prevValue);
      } else {
        console.log("Add Student didn't Success");
        collectNotifications({ message: "Edit Student didn't Success", from: "Server", error: true });
      }
    } catch (error) {
      console.log("Error Fetching Students From Server: ", error);
      collectNotifications({ message: "Error Fetching Students From Server.", from: "Main Server", error: true });
    }
  }

  const handleDelete = async () => {
    getIsDialogOpen(true);
  }

  const handleStudentDetailsCheck = async (stduentID: number, status: Boolean) => {
    try {
      const response = await fetch(baseAPI + "/admin-panel/student/detailscheck",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ stduentID: stduentID, status: status })
        })
      if (response.ok) {
        const notification = await response.json() as Message;
        // console.log(notification);
        refetchStudents((prevValue) => !prevValue);
      } else {
        console.log("Add Student didn't Success");
      }
    } catch (error) {
      console.log("Error Fetching Students From Server: ", error);
    }
  }

  const handleFormSubmitConform = async (isConfirm: boolean) => {
    if (!isConfirm) return;
    if (!isDialogOpen) return;
    getIsDialogOpen(false);
    await DeleteStudents();
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCustomeEmailForAll = () => {
    handleCustormEmailFormOpen(selected);
  }

  const copyReceiptLinkToClipboard = async (receiptLink: string) => {
    const permissionStatus = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });

    if (permissionStatus.state === 'denied') {
      collectNotifications({ message: "Clipboard write permission is denied.", from: "Main Server", error: false });
      return;
    }

    await navigator.clipboard.writeText(receiptLink);
    collectNotifications({ message: "Receipt Link is Copied.", from: "Main Server", error: false });
  }

  return (
    <Fragment>
      <Paper>
        <EnhancedTableToolbar
          numSelected={numSelected}
          handleAddFormOpen={handleAddFormOpen}
          handleDelete={handleDelete}
          handleCustomeEmailForAll={handleCustomeEmailForAll}
          setFilterOptions={setFilterOptions}
          handleImportBundleOfStudentsFormOpen={handleImportBundleOfStudentsFormOpen}
          handleGeneratePDFsFormOpen={handleGeneratePDFsFormOpen}
          handleGenerateCertificatesFormOpen={handleGenerateCertificatesFormOpen}
        />
        <TableContainer>
          <Table aria-label="collapsible table" size={"small"}>
            <TableHead>
              <TableRow>
                <TableCell padding="none">
                  <Checkbox
                    color="primary"
                    indeterminate={numSelected > 0 && numSelected < rowCount}
                    checked={rowCount > 0 && numSelected === rowCount}
                    onChange={handleSelectAllClick}
                    inputProps={{
                      'aria-label': 'select all desserts',
                    }}
                  />
                </TableCell>
                <TableCell padding="none" />
                {columnNames.map((column) => {
                  return (
                    <TableCell
                      key={column.id}
                      align={column.numeric ? 'center' : 'left'}
                      sortDirection={orderBy === column.id ? order : false}
                      padding={column.padding}
                    >
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : 'asc'}
                        onClick={createSortHandler(column.id)}
                      >
                        {column.label}
                        {orderBy === column.id ? (
                          <Box component="span" sx={visuallyHidden}>
                            {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                          </Box>
                        ) : null}
                      </TableSortLabel>
                    </TableCell>
                  );
                })}
                <TableCell align="center" padding='none'>
                  Send
                </TableCell>
                <TableCell padding='none' />
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((row, index) => (
                <Row key={index} row={row} index={index} isSelected={isSelected} handleSelectClick={handleSelectClick} handleEditFormOpen={handleEditFormOpen} handleCustormEmailFormOpen={handleCustormEmailFormOpen} copyReceiptLinkToClipboard={copyReceiptLinkToClipboard} studentDetailsCheck={handleStudentDetailsCheck} />
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, { label: "All", value: rowCount }]}
            component="div"
            count={rowCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            ActionsComponent={TablePaginationActions}
            sx={{ '& *': { margin: "0 !important" } }}
          />
        </TableContainer>
      </Paper>
      {Boolean(selected.length !== 0) && <AlertDialog title="Are you want to delete this student?" description="If you want to delete the students click Yes. if you don't click No." isDialogOpen={isDialogOpen} getIsDialogOpen={getIsDialogOpen} handleFormSubmitConform={handleFormSubmitConform} />}
    </Fragment>
  );
}

export default DataTable;
