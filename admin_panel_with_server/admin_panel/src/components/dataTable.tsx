import React, {useState, Fragment} from 'react';
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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

interface Student {
    id: number | string;
    full_name: string;
    email: string;
    wa_number: number | string;
    register_at: string;
    created_at: string;
    updated_at: string;
    referral_student: Student[];
}

const Row = (props: { row: Student}) => {
  const { row } = props;
  const [open, setOpen] = useState(false);

  return (
    <Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
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
        <TableCell >{row.wa_number}</TableCell>
        {row.referral_student.length >= 2?
            <TableCell align='center' sx={{color: "green"}}>{row.referral_student.length}</TableCell> :
            <TableCell align='center' sx={{color: "red"}}>{row.referral_student.length}</TableCell>
        }
        <TableCell >{row.register_at}</TableCell>
        <TableCell >{row.created_at}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="p">
                Referral Students
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
                  {row.referral_student.length != 0? row.referral_student.map((student, index) => (
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
                      <TableCell colSpan={6} scope="row">There is no any referral Students Yet.(refesh the page)</TableCell>
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

export default function DataTable(props: {rows: Student[]}) {
    const {rows} = props;
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (event: unknown, newPage: number) => {
      setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };
    const visibleRows = React.useMemo(
    () => 
      rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage
    ),[page, rowsPerPage]);
    return (
        <TableContainer component={Paper}>
            <Table aria-label="collapsible table" size={"small"}>
                <TableHead>
                    <TableRow>
                    <TableCell />
                    <TableCell >ID</TableCell>
                    <TableCell >Full Name</TableCell>
                    <TableCell >Email</TableCell>
                    <TableCell >Whatsapp Number</TableCell>
                    <TableCell align='center'>Number Of Referrals</TableCell>
                    <TableCell >Register Date</TableCell>
                    <TableCell >Created Date</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {visibleRows.map((row, index) => (
                        <Row key={index} row={row} />
                    ))}
                </TableBody>
            </Table>
            <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ '& *': {margin: "0 !important"}}}
            />
        </TableContainer>
    );
}
