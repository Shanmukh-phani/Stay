import React, { useState, useEffect } from 'react';
import { AppBar,Box, Button, Card, CardContent, CardMedia, Typography, CircularProgress, Dialog, TextField, IconButton, Grid, Skeleton } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, ArrowBack } from '@mui/icons-material';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { styled } from '@mui/system';
import AdminSidebar from './AdminSidebar';
import profileImage from '../assets/buddie.jpg';
import { useNavigate, useParams } from 'react-router-dom';
import Header_sub from '../Header_sub';



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
  

const FoodMenu = () => {




    const [drawerOpen, setDrawerOpen] = useState(false);




  const [foodMenus, setFoodMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditing, setIsEditing] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editMenuId, setEditMenuId] = useState(null);


  const handleProfileIconClick = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const hostel_id = localStorage.getItem('hostel_id');
  const token = localStorage.getItem('authToken');

  // Fetch food menus
  const fetchFoodMenus = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_URL}/admin/foodMenu/${hostel_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFoodMenus(response.data);
    } catch (error) {
      toast.error('Failed to fetch food menus');
    } finally {
      setLoading(false);
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedFile(reader.result);  // Base64 string
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  // Add or update food menu
  const handleSaveClick = async () => {
    try {
      const existingMenu = foodMenus.find(menu => menu.hostel_id === hostel_id);

      const requestData = {
        food_menu: selectedFile,
        hostel_id,
      };

      if (existingMenu) {
        // Update existing menu
        await axios.put(`${process.env.REACT_APP_URL}/admin/update-foodMenu/${existingMenu._id}`, requestData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Menu updated successfully');
      } else {
        // Add new menu
        await axios.post(`${process.env.REACT_APP_URL}/admin/add-foodMenu`, requestData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Menu added successfully');
      }

      fetchFoodMenus();  // Fetch updated list
      setIsAdding(false);
      setIsEditing(false);
      setSelectedFile(null);
    } catch (error) {
      toast.error('Error saving menu');
    }
  };

  // Delete food menu
  const handleDeleteClick = async (menuId) => {
    try {
      // Remove the item from UI first
      setFoodMenus(foodMenus.filter(menu => menu._id !== menuId));

      await axios.delete(`${process.env.REACT_APP_URL}/admin/delete-foodMenu/${menuId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Menu deleted successfully');
    } catch (error) {
      toast.error('Error deleting menu');
      // Re-add the item if there's an error
      fetchFoodMenus();
    }
  };

  // Fetch food menus on component mount
  useEffect(() => {
    fetchFoodMenus();
  }, []);


  const navigate = useNavigate(); // Initialize navigate function

  const handleBackClick = () => {
    navigate(-1); // Go back to the previous page
  };


  return (
    <Box>
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


      <Typography variant="h4" gutterBottom>Food Menu</Typography>

      {loading ?                 <Skeleton height={500} /> : (
        <Grid container spacing={3} mt={10}>
          {foodMenus.map((menu) => (
            <Grid item xs={12} sm={6} md={4} key={menu._id}>
              <Card>
                <CardMedia
                  component="img"
                  height="500"
                  image={menu.food_menu}  // Base64 string
                  alt="Food Menu"
                />
                <CardContent>
                  {/* <Typography variant="body2">Menu ID: {menu._id}</Typography> */}
                  <Box display="flex" justifyContent="flex-end">
                    <IconButton 
                      aria-label="delete" 
                      color="error" 
                      onClick={() => handleDeleteClick(menu._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box display="flex" justifyContent="center" mt={3}>
        <Button 
          variant="contained" 
          color="success" 
          onClick={() => setIsAdding(true)}
          startIcon={<AddIcon />}
          sx={{ borderRadius: '20px', padding: '10px 20px', fontSize: '16px' }}
        >
          Add New Menu
        </Button>
      </Box>

      <Dialog open={isAdding || isEditing} onClose={() => { setIsEditing(false); setIsAdding(false); }}>
        <Box p={3}>
          <Typography variant="h6">{isEditing ? 'Edit Food Menu' : 'Add Food Menu'}</Typography>
          <TextField type="file" onChange={handleFileChange} fullWidth />
          <Button onClick={handleSaveClick} variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            {isEditing ? 'Save' : 'Add'}
          </Button>
        </Box>
      </Dialog>
      <ToastContainer />

    </Box>
  );
};

export default FoodMenu;
