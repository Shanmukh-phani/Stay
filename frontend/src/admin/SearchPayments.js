import React, { useState, useEffect, useCallback,useRef } from 'react';
import {
  AppBar,
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  Grid, Card, CardContent, Typography, IconButton, InputAdornment,
  Chip,
  CircularProgress,
  TableCell,
  TableRow,
  TableHead,
  Table,
  TableBody,
  Paper,
  TableContainer
} from '@mui/material';
// import { Box, Card, CardContent, Chip, Grid, IconButton, Typography, CircularProgress, Skeleton, TextField } from '@mui/material';
import { DoorBack, People, HomeWork, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import { Skeleton } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import ConfirmDialog from './ConfirmDelete'; // Adjust the path as necessary
import Header_sub from '../Header_sub'; // Adjust the path as necessary
import searchImg from '../assets/search.png';
import Footer from '../Footer';
import { Check as CheckIcon } from '@mui/icons-material';
import notFound from '../assets/notFound.png';




const PaymentsSearchPage = () => {


      // Status color mapping for chips
  const statusColors = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'error',
  };


  const token = localStorage.getItem('authToken');
  const hostelId = localStorage.getItem('hostel_id');

 
 
const [searchQuery, setSearchQuery] = useState('');
const [payments, setPayments] = useState([]);
const [loading, setLoading] = useState(false);
const [noResults, setNoResults] = useState(false);



const [paymentRequests, setPaymentRequests] = useState([]);
const [pendingPayments, setPendingPayments] = useState([]);
const [acceptedPayments, setAcceptedPayments] = useState([]);
const [pagePending, setPagePending] = useState(0);
const [rowsPerPagePending, setRowsPerPagePending] = useState(3);
const [pageAccepted, setPageAccepted] = useState(0);
const [rowsPerPageAccepted, setRowsPerPageAccepted] = useState(3);
// const [loading, setLoading] = useState(true);
const [buddieNames, setBuddieNames] = useState({}); // Object to store buddie names




const fetchBuddieName = async (buddieId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_URL}/admin/buddieName/${buddieId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.name;
    } catch (error) {
      console.error('Error fetching buddie name:', error);
      return 'Unknown'; // Fallback value
    }
  };





  const handleSearch = async (query, hostelId) => {
    if (query.trim() === '' || !hostelId) return; // Ensure both query and hostelId are provided
    setLoading(true);
    setNoResults(false);
  
    try {
      const response = await axios.get(`${process.env.REACT_APP_URL}/admin/search-payment`, {
        params: { query, hostel_id: hostelId }
      });
      setPayments(response.data);
    //   console.log("data:", response.data);
      setNoResults(response.data.length === 0);
    } catch (error) {
      console.error('Failed to fetch payment data:', error);
      setNoResults(true);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!hostelId) {
      setPayments([]); // Clear payments if hostelId is missing
      return;
    }
  
    const delayDebounce = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery, hostelId); // Call search with both parameters
      } else {
        setPayments([]); // Clear payments if searchQuery is empty
      }
    }, 300); // debounce delay of 300ms
  
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, hostelId]);
  
  



// const acceptPayment = async (paymentId) => {
//     try {
//       await axios.put(`${process.env.REACT_APP_URL}/admin/payments/${paymentId}/accept`, null, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       toast.success('Payment accepted!');
//       fetchPayments(); // Refresh payment requests after acceptance
//     } catch (error) {
//       console.error('Error accepting payment', error);
//       toast.error('Error accepting payment');
//     }
//   };



  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_URL}/admin/payments/hostel/${hostelId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payments = response.data;
      setPaymentRequests(payments);
      
      // Fetch names for all unique buddie_ids
      const buddieIds = [...new Set(payments.map(payment => payment.buddie_id))];
      const names = await Promise.all(
        buddieIds.map(async (buddieId) => {
          const name = await fetchBuddieName(buddieId);
          return { id: buddieId, name };
        })
      );
      
      const buddieNameMap = names.reduce((acc, { id, name }) => {
        acc[id] = name;
        return acc;
      }, {});

      setBuddieNames(buddieNameMap);
      
      setPendingPayments(payments.filter(payment => payment.status === 'pending'));
      setAcceptedPayments(payments.filter(payment => payment.status === 'accepted'));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payments', error);
      toast.error('Error fetching payments');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hostelId && token) {
      fetchPayments();
    }
  }, [hostelId, token]);



    // Function to handle payment deletion
const deletePayment = async (paymentId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_URL}/admin/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Payment deleted successfully!');
  
      // Refresh payments after deletion
      fetchPayments(); // Call your function to fetch updated payments
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Error deleting payment');
    }
  };




  const handleChangePagePending = (event, newPage) => {
    setPagePending(newPage);
  };

  const handleChangeRowsPerPagePending = (event) => {
    setRowsPerPagePending(parseInt(event.target.value, 10));
    setPagePending(0);
  };

  const handleChangePageAccepted = (event, newPage) => {
    setPageAccepted(newPage);
  };

  const handleChangeRowsPerPageAccepted = (event) => {
    setRowsPerPageAccepted(parseInt(event.target.value, 10));
    setPageAccepted(0);
  };


  const inputRef = useRef(null);

  useEffect(() => {
    // Focus on the input field when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <Box padding={2} display="flex" flexDirection="column" gap={2} mb={6}>
        <Header_sub/>
      <TextField
        variant="outlined"
        label="Search Payment"
        fullWidth
        inputRef={inputRef}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{marginTop:'70px'}}
      />


{/* <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" padding={4}>
  {searchQuery.trim() === "" ? (
    <>
      <img src={searchImg} alt="search" style={{ width: '350px', height: '350px', marginBottom: '16px' }} />
      <Typography variant="h6" color="textSecondary">Search your rooms</Typography>
    </>
  ) : null}
</Box>


{loading && rooms.length === 0 && Array.from(new Array(5)).map((_, index) => (
        <Card key={index} variant="outlined" sx={{ display: 'flex', padding: 2, boxShadow: 3 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Skeleton variant="text" width={100} height={20} />
            <Skeleton variant="text" width={80} height={20} />
            <Skeleton variant="text" width={80} height={20} />
          </CardContent>
        </Card>
      ))}

<Grid container spacing={2}>
        {rooms.length === 0 && !loading && noResults && searchQuery.trim() !== ""  ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" padding={4}>
            <img src={notFound} alt="No Rooms Found" style={{ width: '350px', height: '350px', marginBottom: '16px' }} />
            <Typography variant="h6" color="textSecondary">No Rooms Found</Typography>
          </Box>
        ) : (
          rooms.map(room => (
            <Grid item xs={12} sm={6} md={3} key={room._id}>
              <Card variant="outlined" sx={{ display: 'flex', justifyContent: 'space-between', padding: 2, alignItems: 'center', boxShadow: 3, borderRadius: 2 }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Chip icon={<DoorBack style={{ color: 'darkcyan' }} />} label={`Room ${room.room_number}`} variant="outlined" style={{ color: 'darkcyan', borderColor: 'darkcyan' }} sx={{ fontSize: '0.875rem', fontWeight: 'bold' }} />
                  <Box display="flex" alignItems="center" gap={1}>
                    <People color="action" />
                    <Typography variant="body2">Sharing: {room.room_sharing}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <HomeWork color="action" />
                    <Typography variant="body2">Vacancy: {room.room_vacancy}</Typography>
                  </Box>
                </CardContent>
                <Box display="flex" flexDirection="column" justifyContent="center">
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton onClick={() => handleEdit(room)} sx={{ backgroundColor: 'slategrey', color: 'white', '&:hover': { backgroundColor: '#FFB300' }, boxShadow: 1 }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => openConfirmDialog(room._id)} sx={{ backgroundColor: 'tomato', color: 'white', '&:hover': { backgroundColor: '#E57373' }, boxShadow: 1 }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))
        )}
      </Grid> */}


<Box display="flex" flexDirection="column" alignItems="center" padding={0}>
      {/* Display search image */}
      {searchQuery.trim() === '' && (
        <Box display="flex" flexDirection="column" alignItems="center">
          <img src={searchImg} alt="search" style={{ width: '350px', height: '350px', marginBottom: '16px' }} />
          <Typography variant="h6" color="textSecondary">Search for payments</Typography>
        </Box>
      )}

      {/* Display loading skeleton */}
      {loading && payments.length === 0 && Array.from(new Array(5)).map((_, index) => (
        <Box key={index} display="flex" flexDirection="column" gap={2} width="100%">
          <Skeleton variant="text" width="100%" height={40} />
          <Skeleton variant="text" width="80%" height={40} />
          <Skeleton variant="text" width="60%" height={40} />
        </Box>
      ))}

      {/* Display no results found */}
      {payments.length === 0 && !loading && noResults && searchQuery.trim() !== '' && (
        <Box display="flex" flexDirection="column" alignItems="center">
          <img src={notFound} alt="No Payments Found" style={{ width: '350px', height: '350px', marginBottom: '16px' }} />
          <Typography variant="h6" color="textSecondary">No Payments Found</Typography>
        </Box>
      )}

      {/* Display results table */}
      {payments.length > 0 && (
        <TableContainer component={Paper} sx={{ marginTop: 2, width: '100%'}}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Month</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map(payment => (
                <TableRow key={payment._id}>
                  <TableCell>{buddieNames[payment.buddie_id]}</TableCell>
                  <TableCell>{payment.amount}</TableCell>
                  <TableCell>{payment.month}</TableCell>
                  <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip label={payment.status} color={statusColors[payment.status]} />
                  </TableCell>
                  {/* <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton onClick={() => acceptPayment(payment._id)} sx={{ backgroundColor: 'green', color: 'white', '&:hover': { backgroundColor: '#FFB300' }, boxShadow: 1 }}>
                        <CheckIcon />
                      </IconButton>
                      <IconButton onClick={() => deletePayment(payment._id)} sx={{ backgroundColor: 'red', color: 'white', '&:hover': { backgroundColor: '#E57373' }, boxShadow: 1 }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>







    {/* Confirmation Dialog */}
    {/* <ConfirmDialog
          open={isDialogOpen}
          onClose={() => setDialogOpen(false)}
          onConfirm={handleDelete}
        /> */}
        <ToastContainer />

<Footer/>

    </Box>




  );
};

export default PaymentsSearchPage;
