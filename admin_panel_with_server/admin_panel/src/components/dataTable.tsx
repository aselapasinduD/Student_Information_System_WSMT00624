import React, {useState, Fragment, useEffect, useMemo} from 'react';
import Box from '@mui/material/Box';
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
import Menu, {MenuProps} from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';

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

import AlertDialog from "./alertDialog";

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

function getComparator<Key extends keyof any>(order: Order, orderBy: Key):(a: { [key in Key]: any }, b: { [key in Key]: any }) => number {
  return order === 'desc'? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
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
  options?: {below: boolean};
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
  }
]

function filter(rows: readonly Student[], options: FilterOptions[]) {
  let filterdRows = rows;
  filterdRows = filterdRows.filter((record) => record.full_name.toLowerCase().includes((options[1].value? options[1].value: "").toLowerCase()));
  if(options[0].value) filterdRows = filterdRows.filter((record) => options[0].options?.below === true?  record.number_of_referrals <= parseInt((options[0].value? options[0].value: "")): record.number_of_referrals === parseInt((options[0].value? options[0].value: "")));
  filterdRows = filterdRows.filter((record) => record.register_at.toLowerCase().includes((options[2].value? options[2].value: "").toLowerCase()));
  return filterdRows;
}

interface filterMenus extends MenuProps {
  setfilteroptions: (value: FilterOptions[]) => void;
}

const FilterMenus = (props: filterMenus) => {
  const {setfilteroptions, open} = props;
  const [valueID, getValueID] = useState<string>("");
  const [valueNumberOfReferrals, getValueNumberOfRegerrals] = useState<string>("");
  const [valueRegisterAt, getValueRegisterAt] = useState<string>("");
  const [isBelowChecked, setIsBelowChecked] = useState<boolean>(false);

  const handleIdChange = (value: string) => {
    getValueID(value);
  }
  const handleNumberOfReferralsChange = (value: string) => {
    getValueNumberOfRegerrals(value);
  }
  const handleRegisterAtChange = (value: string) => {
    getValueRegisterAt(value);
  }

  const handleClearFilters = () => {
    setfilteroptions(initialFilterOptions);
    getValueID("");
    getValueNumberOfRegerrals("");
    getValueRegisterAt("");
  }

  useEffect(()=>{
    if(open){
      setfilteroptions(
        [
          {
            id: "number_of_referrals",
            value: valueNumberOfReferrals === ""? null : valueNumberOfReferrals,
            options: {below: isBelowChecked}
          },
          {
            id: "id",
            value: valueID === ""? null: valueID
          },
          {
            id: "register_at",
            value: valueRegisterAt === ""? null : valueRegisterAt
          }
        ]
      );
    }
  },[valueID, valueNumberOfReferrals, valueRegisterAt, isBelowChecked, open, setfilteroptions]);

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
            boxShadow:'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px'
            }
        }}
        {...props}
      >
        <MenuItem onKeyDown={(e) => e.stopPropagation()}>
          <TextField name="full_name"  hiddenLabel label="Full Name" inputProps={{pattern: "[0-9]{11}", value: valueID}} size='small' margin='none' onChange={(e: React.ChangeEvent<HTMLInputElement>)=>handleIdChange(e.target.value)}/>
        </MenuItem>
        <MenuItem onKeyDown={(e) => e.stopPropagation()}>
          <TextField name='number_of_referrals' placeholder='0' inputProps={{pattern: "[0-9]{11}", type: "number", value: valueNumberOfReferrals}} hiddenLabel label="Referrals" size='small' margin='none' onChange={(e: React.ChangeEvent<HTMLInputElement>)=>handleNumberOfReferralsChange(e.target.value)} sx={{ mr: 1, width: '15ch' }}/>
          <FormControlLabel control={<Checkbox onChange={(e)=>setIsBelowChecked(e.target.checked)} />} label="Below" />
        </MenuItem>
        <MenuItem onKeyDown={(e) => e.stopPropagation()}>
          <TextField name='register_at' hiddenLabel label="Register At" placeholder='2024-06-28 00:00' size='small' margin='none' inputProps={{pattern: "[0-9]{11}", value: valueRegisterAt}} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>handleRegisterAtChange(e.target.value)}/>
        </MenuItem>
        <MenuItem onKeyDown={(e) => e.stopPropagation()} onClick={handleClearFilters} style={{justifyContent: "center"}}>
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
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { numSelected, handleAddFormOpen, handleDelete, handleCustomeEmailForAll, setFilterOptions } = props;
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
        ...(numSelected > 0 && {backgroundColor: "rgba(25, 118, 210, 0.12)"}),
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
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Students
        </Typography>
      )}
      {numSelected > 0 ? (
        <Fragment>
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
            <FilterMenus setfilteroptions={setFilterOptions} open={open} anchorEl={anchorEl} onClose={handleClose}/>
          </div>
        </Fragment>
      )}
    </Toolbar>
  );
}

interface EditStudent{
  id: number;
  full_name: string;
  email: string;
  wanumber: number | string;
}

interface RowProps {
  row: Student;
  index: number;
  isSelected: (selectedID: number ) => boolean;
  handleSelectClick: (event: React.MouseEvent<unknown>, id: number) => void;
  handleCustormEmailFormOpen: (id: number[]) => void;
  handleEditFormOpen: (EditStudent: EditStudent) => void;
}

const formatDateTime = (date: string) => {
  const customDate = new Date(date);
  const formattedDate = `${customDate.toISOString().slice(0, 16).replace("T", " ")} UTC`; // Output: 2024-06-12 00:00
  return formattedDate;
}

const Row: React.FC<RowProps> = ({ row, index, isSelected, handleSelectClick, handleCustormEmailFormOpen, handleEditFormOpen}) => {
  const [open, setOpen] = useState(false);
  const isItemSelected = isSelected(row.id);
  const labelId = `checkbox-student-${index}`;

  return (
    <Fragment>
      <TableRow
        hover
        aria-checked={isItemSelected}
        selected={isItemSelected}
        sx={{ '& > *': { borderBottom: 'unset' } }}
        >
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            onClick={(event) => handleSelectClick(event, row.id)}
            checked={isItemSelected}
            inputProps={{
              'aria-labelledby': labelId,
            }}
          />
        </TableCell>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.id}
        </TableCell>
        <TableCell >{row.full_name}</TableCell>
        <TableCell >{row.email}</TableCell>
        <TableCell align='center'>{row.number_of_mails}</TableCell>
        <TableCell >{row.wa_number}</TableCell>
        {row.number_of_referrals >= 2?
            <TableCell align='center' sx={{color: "green"}}>{row.number_of_referrals}</TableCell> :
            <TableCell align='center' sx={{color: "red"}}>{row.number_of_referrals}</TableCell>
        }
        <TableCell >{formatDateTime(row.register_at)}</TableCell>
        <TableCell >{formatDateTime(row.updated_at)}</TableCell>
        <TableCell >
          <div style={{display: 'flex'}}>
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
        <TableCell >
          <Tooltip title="Edit Details">
            <IconButton
              onClick={() => handleEditFormOpen({id: row.id, full_name: row.full_name, email: row.email, wanumber: row.wa_number})}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
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
                  {row.referral_student.length !== 0? row.referral_student.map((student, index) => (
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
                      <TableCell colSpan={6} scope="row" align='center'>There is no any referral Students Yet.(refesh the page)</TableCell>
                  </TableRow>}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

interface Notification{
  message: string;
  from: string;
  error: boolean;
}

interface rowStudents{
  rows: Student[];
  handleAddFormOpen: () => void;
  handleEditFormOpen: (EditStudent: EditStudent) => void;
  handleCustormEmailFormOpen: (id: readonly number[]) => void;
  collectNotifications: (notification: Notification) => void;
}

interface ColumnNames {
  id: keyof Student;
  label: string;
  numeric: boolean;
  padding: "checkbox" | "none" | "normal" | undefined;
  aligment: string;
}

const columnNames: readonly ColumnNames[] = [
  {
    id: "id",
    label: "ID",
    numeric: true,
    padding: "checkbox",
    aligment: "left"
  },
  {
    id: "full_name",
    label: "Full Name",
    numeric: true,
    padding: 'normal',
    aligment: "left"
  },
  {
    id: "email",
    label: "Email",
    numeric: true,
    padding: 'normal',
    aligment: "left"
  },
  {
    id: "number_of_mails",
    label: "Number of Mails",
    numeric: true,
    padding: "checkbox",
    aligment: "left"
  },
  {
    id: "wa_number",
    label: "Whatsapp Number",
    numeric: true,
    padding: 'normal',
    aligment: "left"
  },
  {
    id: "number_of_referrals",
    label: "Number Of Referrals",
    numeric: true,
    padding: "checkbox",
    aligment: "left"
  },
  {
    id: "register_at",
    label: "Register Date",
    numeric: true,
    padding: 'normal',
    aligment: "left"
  },
  {
    id: "updated_at",
    label: "Updated Date",
    numeric: true,
    padding: 'normal',
    aligment: "left"
  }
]

const DataTable: React.FC<rowStudents> = ({rows, handleAddFormOpen, handleEditFormOpen, handleCustormEmailFormOpen, collectNotifications}) => {
    const [order, setOrder] = useState<Order>('desc');
    const [orderBy, setOrderBy] = useState<keyof Student | Unassigned>('id');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selected, setSelected] = useState<readonly number[]>([]);
    const [filterOptions, setFilterOptions] = useState<FilterOptions[]>(initialFilterOptions);
    const [rowCount, getRowCount] = useState<number>(rows.length);
    const [isDialogOpen, getIsDialogOpen] = useState<boolean>(false);
    const numSelected = selected.length;

    const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof Student) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    };

    const createSortHandler = (property: keyof Student) => (event: React.MouseEvent<unknown>) => {
      handleRequestSort(event, property);
    };

    const filteredRows = useMemo(() => filter(rows, filterOptions),[filterOptions, rows]);

    const visibleRows = useMemo(
      () => stableSort(filteredRows,getComparator(order, orderBy)).slice(page * rowsPerPage,page * rowsPerPage + rowsPerPage),
      [order, orderBy, page, rowsPerPage, filteredRows]);

    const isSelected = (id: number) => selected.indexOf(id) !== -1;

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        if(filterOptions !== initialFilterOptions){
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

    const DeleteStudents = async() => {
      try{
        const response = await fetch("/admin-panel/student",
        {
          method: "DELETE",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({listofdelete: selected})
        })
        if(response.ok) {
          const notification = await response.json() as Notification;
          collectNotifications(notification);
          window.location.reload();
        } else {
          console.log("Add Student didn't Success");
          collectNotifications({message: "Edit Student didn't Success", from: "Server", error: true});
        }
      } catch (error) {
        console.log("Error Fetching Students From Server: ", error);
        collectNotifications({message: "Error Fetching Students From Server.", from: "Main Server", error: true});
      }
    }

    const handleDelete = async () => {
      console.log(selected);
      getIsDialogOpen(true);
    }

    const handleFormSubmitConform = async (isConfirm: boolean) => {
      if(!isConfirm) return;
      if(!isDialogOpen) return;
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
    return (
      <Fragment>
        <Paper sx={{marginTop: "20px"}}>
        <EnhancedTableToolbar 
          numSelected={numSelected}
          handleAddFormOpen={handleAddFormOpen}
          handleDelete={handleDelete}
          handleCustomeEmailForAll={handleCustomeEmailForAll}
          setFilterOptions={setFilterOptions}
        />
        <TableContainer>
            <Table aria-label="collapsible table" size={"small"}>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
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
                    <TableCell />
                    {columnNames.map((column) => {
                      return(
                        <TableCell
                          key={column.id}
                          align={column.id==="number_of_referrals" || column.id==="number_of_mails"? "center": "left"}
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
                    <TableCell align="center" padding='checkbox'>
                      Send
                    </TableCell>
                    <TableCell padding='checkbox' />
                  </TableRow>
                </TableHead>
                <TableBody>
                    {visibleRows.map((row, index) => (
                        <Row key={index} row={row} index={index} isSelected={isSelected} handleSelectClick={handleSelectClick} handleEditFormOpen={handleEditFormOpen} handleCustormEmailFormOpen={handleCustormEmailFormOpen}/>
                    ))}
                </TableBody>
            </Table>
            <TablePagination
                rowsPerPageOptions={[5,10, 25, 50, {label: "All", value: -1}]}
                component="div"
                count={rowCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
                sx={{ '& *': {margin: "0 !important"}}}
            />
        </TableContainer>
        </Paper>
        {Boolean(selected.length !== 0) && <AlertDialog title="Are you want to delete this student?" description="If you want to delete the students click Yes. if you don't click No." isDialogOpen={isDialogOpen} getIsDialogOpen={getIsDialogOpen} handleFormSubmitConform={handleFormSubmitConform} />}
      </Fragment>
    );
}

export default DataTable;