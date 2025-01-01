import React , { Fragment, useMemo, useState } from 'react';

import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { visuallyHidden } from '@mui/utils';

import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CodeIcon from '@mui/icons-material/Code';
import LinkIcon from '@mui/icons-material/Link';

import { GoogleForm, Message } from '../states/type';
import baseAPI from '../states/api';
import AlertDialog from "./alertDialog";

interface ResponseGoogleFormCode{
  message: string,
  body: string
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

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

interface ColumnNames {
  id: keyof GoogleForm;
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
      id: "title",
      label: "Title",
      numeric: false,
      padding: 'normal',
      aligment: "left"
    },
    {
      id: "slug",
      label: "Slug",
      numeric: false,
      padding: 'normal',
      aligment: "left"
    },
    {
      id: "color",
      label: "Color",
      numeric: true,
      padding: "checkbox",
      aligment: "left"
    },
    {
      id: "whatsapp_group_link",
      label: "Whatsapp Group Link",
      numeric: false,
      padding: 'normal',
      aligment: "left"
    },
    {
      id: "created_at",
      label: "Created At",
      numeric: false,
      padding: 'normal',
      aligment: "left"
    }
]

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof GoogleForm) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

/**
 * Enchanced Table Head for google form data table
 * 
 * @param {array} props - Array of parameters
 * @returns {JSX.Element}
 * @since 1.1.0
 */
function EnhancedTableHead(props: EnhancedTableProps) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
    props;
  const createSortHandler =
    (property: keyof GoogleForm) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all desserts',
            }}
          />
        </TableCell>
        {columnNames.map((column) => (
          <TableCell
            key={column.id}
            align={column.numeric ? 'center' : 'left'}
            padding={column.padding}
            sortDirection={orderBy === column.id ? order : false}
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
        ))}
        <TableCell padding='checkbox' />
      </TableRow>
    </TableHead>
  );
}

interface FilterOptions {
  id: keyof GoogleForm;
  value: string | null;
  options?: {below: boolean};
}

const initialFilterOptions: FilterOptions[] = [
  {
    id: "title",
    value: null
  },
  {
    id: "created_at",
    value: null
  }
]

interface EnhancedTableToolbarProps {
  numSelected: number;
  handleAddFormOpen: () => void;
  handleDelete: () => void;
  handleCustomeEmailForAll?: () => void;
  setFilterOptions?: (value: FilterOptions[]) => void;
}

/**
 * Enchanced Table Tools for google form data table
 * 
 * @param {array} props - Array of parameters
 * @returns {JSX.Element}
 * @since 1.1.0
 */
function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { numSelected, handleAddFormOpen, handleDelete } = props;
  return (
    <Toolbar
      sx={[
        {
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
        },
        numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        },
      ]}
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
            Google Forms
        </Typography>
      )}
      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>
            <DeleteIcon onClick={handleDelete} />
          </IconButton>
        </Tooltip>
      ) : (
        <>
         <Tooltip title="Add New Google Form">
            <IconButton onClick={handleAddFormOpen}>
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Filter list">
            <IconButton>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Toolbar>
  );
}

interface editGoogleForm{
  id: number;
  title: string;
  color: string;
  whatsapp_group_link: string;
}


interface RowProps {
  row: GoogleForm;
  index: number;
  isSelected: (selectedID: number ) => boolean;
  handleSelectClick: (event: React.MouseEvent<unknown>, id: number) => void;
  handleEditFormOpen: (EditGoogleForm: editGoogleForm) => void;
  handleDeleteRow: (rowID: number) => void;
  getGoogleFormCode: (googleFormID: number) => void;
  getGoogleFormLink: (googleFormID: number) => void;
}

/**
 * This function is for handle rows
 * 
 * @param {object} row - list of student details
 * @param {number} index - row index number
 * @param {function} isSelected - function for check is selected row
 * @param {function} handleSelectClick - function for handle selected rows
 * @param {function} handleDeleteRow - function for handle delete each google form
 * @param {function} handleEditFormOpen - function for handle edit google form details for each row
 * @returns {JSX.Element}
 * @since 1.1.0
 */
const  Row: React.FC<RowProps>  = ({ row, index, isSelected, handleSelectClick, handleEditFormOpen, handleDeleteRow, getGoogleFormCode, getGoogleFormLink}) => {
    const [open, setOpen] = useState(false);
    const isItemSelected = isSelected(row.id);
    const labelId = `checkbox-googleform-${index}`;
    return(
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
              <TableCell
                component="th"
                id={labelId}
                scope="row"
                padding="none"
                align="center"
              >
                {row.id}
              </TableCell>
              <TableCell align="left">{row.title}</TableCell>
              <TableCell align="left">
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  {row.slug}
                  <div style={{display: 'flex'}}>
                    <Tooltip title="Copy Code">
                      <IconButton onClick={() => getGoogleFormCode(row.id)} >
                        <CodeIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Copy URL">
                      <IconButton onClick={() => getGoogleFormLink(row.id)} >
                        <LinkIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                </div>
              </TableCell>
              <TableCell align="center" sx={{background: row.color}}>{row.color}</TableCell>
              <TableCell align="left">{row.whatsapp_group_link}</TableCell>
              <TableCell align="left">{row.created_at}</TableCell>
              <TableCell >
                <div style={{display: 'flex'}}>
                  <Tooltip title="Edit Details">
                    <IconButton onClick={() => handleEditFormOpen({id: row.id, title: row.title, color: row.color, whatsapp_group_link: row.whatsapp_group_link})}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDeleteRow(row.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
        </Fragment>
    );
}

interface propsOfGoogleFormDataTable{
  rows: GoogleForm[];
  handleAddFormOpen: () => void;
  handleEditFormOpen: (EditGoogleForm: editGoogleForm) => void;
  collectNotifications: (notification: Message) => void;
}

/**
 * Main Google Form data table assemble funtion.
 * 
 * @param {array} rows - all the google forms fetch from database
 * @param {function} handleAddFormOpen - this the function for handle google forms create form
 * @param {function} handleEditFormOpen - this the function for handle google forms edit form
 * @param {function} collectNotifications - Notification Collect Function
 * @returns {JSX.Element}
 * @since 1.1.0
 */
const GoogleFormDataTable: React.FC<propsOfGoogleFormDataTable> = ({rows, handleAddFormOpen, handleEditFormOpen, collectNotifications}) => {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof GoogleForm>('id');
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [isDialogOpen, getIsDialogOpen] = useState<boolean>(false);

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof GoogleForm) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const visibleRows = useMemo(() => 
    [...rows].sort(getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),[order, orderBy, page, rowsPerPage],);

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

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
      const response = await fetch(baseAPI + "/admin-panel/googleform",
      {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({listofdelete: selected})
      })
      if(response.ok) {
        const notification = await response.json() as Message;
        collectNotifications(notification);
        window.location.reload();
      } else {
        console.log("Add Google Form didn't Success");
        collectNotifications({message: "Edit Google Form didn't Success", from: "Server", error: true});
      }
    } catch (error) {
      console.log("Error Fetching Google Form From Server: ", error);
      collectNotifications({message: "Error Fetching Google Form From Server.", from: "Main Server", error: true});
    }
  }

  const handleDelete = async () => {
    // console.log(selected);
    getIsDialogOpen(true);
  }

  const handleAlertConform = async (isConfirm: boolean) => {
    if(!isConfirm) return;
    if(!isDialogOpen) return;
    getIsDialogOpen(false);
    await DeleteStudents();
  }

  const handleDeleteButtonOneRow = (id: number) => {
    console.log(id);
    setSelected([id])
    getIsDialogOpen(true);
  }

  const handleCopyGoogleFormSubmitCode = (id: number) => {
      const fetchStudent = async () => {
        try{
            const response = await fetch(baseAPI + `/admin-panel/googleform/code?id=${id}`,{
                method: 'GET'
            });
            if(!response){
                throw new Error("Failed to fetch Google Form code from the server");
            }
            const googleFormCode = await response.json() as ResponseGoogleFormCode;

            const permissionStatus = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });

            if (permissionStatus.state === 'denied') {
              collectNotifications({message: "Clipboard write permission is denied.", from: "Main Server", error: false});
              return;
            }

            await navigator.clipboard.writeText(googleFormCode.body);
            collectNotifications({message: "Google Form code is Copied.", from: "Main Server", error: false});
        } catch (error){
            console.log("Error Fetching Google Form code From Server: ", error);
            collectNotifications({message: "Google Form code is copying failed.", from: "Main Server", error: true});
        }
    }
    fetchStudent();
  }

  const handleCopyGoogleFormSubmitLink = (id: number) => {
    const fetchStudent = async () => {
      try{
          const response = await fetch(baseAPI + `/admin-panel/googleform/link?id=${id}`,{
              method: 'GET'
          });
          if(!response){
              throw new Error("Failed to fetch Google Form link from the server");
          }
          const googleFormCode = await response.json() as ResponseGoogleFormCode;

          const permissionStatus = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });

          if (permissionStatus.state === 'denied') {
            collectNotifications({message: "Clipboard write permission is denied.", from: "Main Server", error: false});
            return;
          }

          await navigator.clipboard.writeText(googleFormCode.body);
          collectNotifications({message: "Google Form link is Copied.", from: "Main Server", error: false});
      } catch (error){
          console.log("Error Fetching Google Form link From Server: ", error);
          collectNotifications({message: "Google Form link is copying failed.", from: "Main Server", error: true});
      }
  }
  fetchStudent();
}

  return (
    <Fragment>
        <Paper sx={{ width: '100%', mb: 2 }}>
            <EnhancedTableToolbar
              numSelected={selected.length}
              handleAddFormOpen={handleAddFormOpen}
              handleDelete={handleDelete}
            />
            <TableContainer>
                <Table
                    sx={{ minWidth: 750 }}
                    aria-labelledby="tableTitle"
                    size='small'
                >
                    <EnhancedTableHead
                      numSelected={selected.length}
                      order={order}
                      orderBy={orderBy}
                      onSelectAllClick={handleSelectAllClick}
                      onRequestSort={handleRequestSort}
                      rowCount={rows.length}
                    />
                    <TableBody>
                      {visibleRows.map((row, index) => {
                          return (<Row key={index} row={row} index={index} isSelected={isSelected} handleSelectClick={handleSelectClick} handleEditFormOpen={handleEditFormOpen} handleDeleteRow={handleDeleteButtonOneRow} getGoogleFormCode={handleCopyGoogleFormSubmitCode} getGoogleFormLink={handleCopyGoogleFormSubmitLink} />);
                      })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5,10, 25, 50, {label: "All", value: rows.length}]}
              component="div"
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ '& *': {margin: "0 !important"}}}
            />
        </Paper>
        {Boolean(selected.length !== 0) && <AlertDialog title="Are you want to delete this Google Form?" description="If you want to delete the Google Form click Yes. if you don't click No." isDialogOpen={isDialogOpen} getIsDialogOpen={getIsDialogOpen} handleFormSubmitConform={handleAlertConform} />}
    </Fragment>
  );
}


export default GoogleFormDataTable;