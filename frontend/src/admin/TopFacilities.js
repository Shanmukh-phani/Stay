import React, { useEffect, useState } from 'react';
import { Box, Chip, styled, Typography } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import LoadingScreen from '../LoadingScreen'; // Ensure this component exists



// Import Chart.js components
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';




const LocationChip1 = styled(Chip)({
  // marginTop: '15px',
  fontFamily: 'Anta',
  fontSize: '18px',
  textAlign:'center'
});

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// TopFacilities Component
const TopFacilities = () => {
  const [facilitiesData, setFacilitiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch top facilities data
  useEffect(() => {
    const fetchTopFacilities = async () => {
      try {
        const hostel_id = localStorage.getItem('hostel_id');
        const authToken = localStorage.getItem('authToken');

        if (!hostel_id) {
          throw new Error('Hostel ID not found in localStorage');
        }

        if (!authToken) {
          throw new Error('Authentication token not found');
        }

        const response = await axios.get(`${process.env.REACT_APP_URL}/admin/top-facilities`, {
          params: { hostel_id },
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        setFacilitiesData(response.data.topFacilities);
      } catch (error) {
        console.error('Error fetching top facilities:', error);
        setError(error.response?.data?.message || error.message || 'Failed to fetch top facilities');
      } finally {
        setLoading(false);
      }
    };

    fetchTopFacilities();
  }, []);

  if (loading) return <LoadingScreen />;
  if (error) return <Typography color="error" variant="h6" align="center">{error}</Typography>;

  // Prepare data for the pie chart
  const chartData = {
    labels: facilitiesData.map(facility => facility.name),
    datasets: [
      {
        label: 'Facility Count',
        data: facilitiesData.map(facility => facility.count),
        backgroundColor: [
          '#ff6384',
          '#36a2eb',
          '#cc65fe',
          '#ffce56',
          '#4bc0c0',
        ],
      },
    ],
  };

  return (
    <Box padding={2} textAlign={'center'}>
      
      <LocationChip1 label={'Top 5 Hostel Facilities'} />
      <Pie data={chartData} />
    </Box>
  );
};

export default TopFacilities;
