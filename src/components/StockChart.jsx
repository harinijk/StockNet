import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const StockChart = ({ symbol }) => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/stock-data/${symbol}`);
        const data = response.data;

        // Format dates to remove time part
        const formattedDates = data.map(item => formatDate(item.date));
        const prices = data.map(item => item.price);

        setChartData({
          labels: formattedDates,
          datasets: [
            {
              label: `${symbol} Stock Price`,
              data: prices,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
            },
          ],
        });
        setError('');
      } catch (error) {
        console.error('Error fetching stock data:', error);
        setError('Error fetching stock data');
      }
    };

    if (symbol) {
      fetchData();
    }
  }, [symbol]);

  // Function to format date to remove time part
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(); // Adjust date formatting as needed
  };

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="stock-chart-container">
      {chartData ? <Line data={chartData} /> : <p>Loading chart...</p>}
    </div>
  );
};

export default StockChart;

