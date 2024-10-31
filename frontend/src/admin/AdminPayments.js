import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Button,
  Typography,
  Box,
  Chip,
  Skeleton,
  AppBar,
  IconButton,
  InputAdornment,
  TextField
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { styled } from '@mui/system';
import { ArrowBack } from '@mui/icons-material';
import profileImage from '../assets/buddie.jpg';
import { useNavigate } from 'react-router-dom';
import Header_sub from '../Header_sub';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import SearchIcon from '@mui/icons-material/Search';


const HeaderContainer = styled(Box)({


  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  mb: 4,
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  padding: '14px 16px',
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  boxSizing: 'border-box',
  backgroundColor: '#fff',
  zIndex: 1000,
});

const StayText = styled(Typography)({
  fontFamily: '"Sofia", sans-serif',
  fontSize: '24px',
  fontWeight: 'bold',
  color: 'orange',
});

const BuddieText = styled(Typography)({
  fontFamily: '"Sofia", sans-serif',
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#333',
});

const ProfileIcon = styled(IconButton)({
  borderRadius: '50%',
  backgroundColor: '#ddd',
  width: '40px',
  height: '40px',
});

const LocationChip1 = styled(Chip)({

  // marginTop: '15px',
  fontFamily: 'Anta',
  fontSize: '18px',
  textAlign:'center',
  // backgroundColor:'#f0c674'
});


const statusColors = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'error',
};

const AdminPayments = () => {

  const navigate = useNavigate(); // Initialize navigate function

  const handleBackClick = () => {
    navigate(-1); // Go back to the previous page
  };

  const [search, setSearch] = useState('');



  const [paymentRequests, setPaymentRequests] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [acceptedPayments, setAcceptedPayments] = useState([]);
  const [pagePending, setPagePending] = useState(0);
  const [rowsPerPagePending, setRowsPerPagePending] = useState(3);
  const [pageAccepted, setPageAccepted] = useState(0);
  const [rowsPerPageAccepted, setRowsPerPageAccepted] = useState(3);
  const [loading, setLoading] = useState(true);
  const [buddieNames, setBuddieNames] = useState({}); // Object to store buddie names


  

  const token = localStorage.getItem('authToken');
  const hostelId = localStorage.getItem('hostel_id');



  // const fetchPayments = async () => {
  //   try {
  //     const response = await axios.get(`${process.env.REACT_APP_URL}/admin/payments/hostel/${hostelId}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`, // Include the token in the request headers
  //       },
  //     });

  //     const payments = response.data;
  //     setPaymentRequests(payments);
      
  //     setPendingPayments(payments.filter(payment => payment.status === 'pending'));
  //     setAcceptedPayments(payments.filter(payment => payment.status === 'accepted'));
  //     setLoading(false);
  //   } catch (error) {
  //     console.error('Error fetching payments', error);
  //     toast.error('Error fetching payments');
  //     setLoading(false);
  //   }
  // };

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
  // useEffect(() => {
  //   if (hostelId && token) {
  //     fetchPayments();
    
  //   }
  // }, [hostelId, token]);

  const acceptPayment = async (paymentId) => {
    try {
      await axios.put(`${process.env.REACT_APP_URL}/admin/payments/${paymentId}/accept`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Payment accepted!');
      fetchPayments(); // Refresh payment requests after acceptance
    } catch (error) {
      console.error('Error accepting payment', error);
      toast.error('Error accepting payment');
    }
  };


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



  const handleOpenSearchPage = () => {
    navigate('/admin/search-payments');
  };

  return (

    
    <Box p={3}>

{/* <AppBar position="static">
                <HeaderContainer>
                    <Box display="flex" alignItems="center">
                        <IconButton edge="start" color="inherit" aria-label="back" style={{ color: 'black' }} onClick={handleBackClick}>
                            <ArrowBack  />
                        </IconButton>
                        <StayText variant="h4" component="h1" style={{ marginLeft: '25px',color:'#006399' }}>
                            Stay
                        </StayText>
                        <BuddieText variant="h4" component="h1">
                            Buddie
                        </BuddieText>
                    </Box>

                    <Box >
            <ProfileIcon>
              <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%' }} />
            </ProfileIcon>
          </Box>
                </HeaderContainer>
            </AppBar> */}
            <Header_sub/>


      

            <Box  onClick={handleOpenSearchPage} sx={{ cursor: 'pointer',marginTop:'80px' }} >
      <TextField
        fullWidth
        label="Search Rooms"
        variant="outlined"
        // disabled
        // onClick={handleOpenSearchPage}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </Box>
    

      <Typography variant="h6" gutterBottom  mt={2}>
        <LocationChip1 label={'Pending Payments'}/>
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={300} />
        ) : (
          <Table>
            <TableHead>
              <TableRow style={{backgroundColor:'tomato',fontWeight:'bold',color:'white'}}>
                <TableCell style={{color:'white',fontWeight:'bold'}}>Buddie</TableCell>
                <TableCell style={{color:'white',fontWeight:'bold'}}>Amount</TableCell>
                <TableCell style={{color:'white',fontWeight:'bold'}}>Month</TableCell>
                <TableCell style={{color:'white',fontWeight:'bold'}}>Date</TableCell>
                <TableCell style={{color:'white',fontWeight:'bold'}}>Status</TableCell>
                <TableCell style={{color:'white',fontWeight:'bold'}}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingPayments.slice(pagePending * rowsPerPagePending, pagePending * rowsPerPagePending + rowsPerPagePending)
                .map((payment) => (
                  <TableRow key={payment._id}>  
                    <TableCell>{buddieNames[payment.buddie_id]}</TableCell>
                    <TableCell>{payment.amount}</TableCell>
                    <TableCell>{payment.month}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>
                      <Chip label={payment.status} color={statusColors[payment.status]} />
                    </TableCell>
                    
                    
                    {/* <TableCell>
                      <Button variant="contained" color="primary" onClick={() => acceptPayment(payment._id)}>
                        Accept
                      </Button>
                    </TableCell> */}



                    <TableCell >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                // onClick={() => handleEdit(room)}
                onClick={() => acceptPayment(payment._id)}
                sx={{
                  backgroundColor: 'green',
                  color: 'white',
                  '&:hover': { backgroundColor: '#FFB300' },
                  boxShadow: 1,
                }}
              >
                <CheckIcon color="white" />
              </IconButton>
              <IconButton
                // onClick={() => openConfirmDialog(room._id)}
                onClick={() => deletePayment(payment._id)}
                sx={{
                  backgroundColor: 'red',
                  color: 'white',
                  '&:hover': { backgroundColor: '#E57373' },
                  boxShadow: 1,
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </TableCell>




                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
        <TablePagination
          rowsPerPageOptions={[3, 10, 25]}
          component="div"
          count={pendingPayments.length}
          rowsPerPage={rowsPerPagePending}
          page={pagePending}
          onPageChange={handleChangePagePending}
          onRowsPerPageChange={handleChangeRowsPerPagePending}
        />
      </TableContainer>

      <Typography variant="h6" gutterBottom>
      <LocationChip1 label={'Accepted Payments'}/>
      </Typography>
      <TableContainer component={Paper}>
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={300} />
        ) : (
          <Table>
            <TableHead>
              <TableRow style={{backgroundColor:'darkcyan',fontWeight:'bold',color:'white'}}>
                <TableCell style={{color:'white',fontWeight:'bold'}}>Buddie</TableCell>
                <TableCell style={{color:'white',fontWeight:'bold'}}>Amount</TableCell>
                <TableCell style={{color:'white',fontWeight:'bold'}}>Month</TableCell>
                <TableCell style={{color:'white',fontWeight:'bold'}}>Date</TableCell>
                <TableCell style={{color:'white',fontWeight:'bold'}}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {acceptedPayments.slice(pageAccepted * rowsPerPageAccepted, pageAccepted * rowsPerPageAccepted + rowsPerPageAccepted)
                .map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>{buddieNames[payment.buddie_id]}</TableCell>
                    <TableCell>{payment.amount}</TableCell>
                    <TableCell>{payment.month}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>
                      <Chip label={payment.status} color={statusColors[payment.status]} />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
        <TablePagination
          rowsPerPageOptions={[3, 10, 25]}
          component="div"
          count={acceptedPayments.length}
          rowsPerPage={rowsPerPageAccepted}
          page={pageAccepted}
          onPageChange={handleChangePageAccepted}
          onRowsPerPageChange={handleChangeRowsPerPageAccepted}
        />
      </TableContainer>

      <ToastContainer />
    </Box>
  );
};

export default AdminPayments;
