import React, { useEffect, useState } from 'react';
import { SpaceDataStreamerClient } from './generated/SpacedataServiceClientPb';
import { SpaceDataRequest, SpaceDataResponse } from './generated/spacedata_pb';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { v4 as uuidv4 } from 'uuid'; 


Chart.register(...registerables);

interface DataPoint {
  x: Date;
  y: number;
}

const MAX_DATA_POINTS = 50;

const App: React.FC = () => {
  const [altitudeData, setAltitudeData] = useState<DataPoint[]>([]);
  const [velocityData, setVelocityData] = useState<DataPoint[]>([]);
  const [activeDataType, setActiveDataType] = useState<'altitude' | 'velocity'>('altitude');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    const client = new SpaceDataStreamerClient('http://localhost:5037');
    
    const request = new SpaceDataRequest();
    const connectionId = uuidv4();
    request.setConnectionid(connectionId);
    request.setDatatype(activeDataType);
    const stream = client.getSpaceData(request, {});
    
    stream.on('data', (response: SpaceDataResponse) => {
      setConnectionStatus('connected');
      const newDataPoint = {
        x: new Date(response.getMeasurementtime()),
        y: response.getValue()
      };
      
      if (response.getDatatype() === 'altitude') {
        setAltitudeData(prev => [...prev.slice(-(MAX_DATA_POINTS - 1)), newDataPoint]);
      } else {
        setVelocityData(prev => [...prev.slice(-(MAX_DATA_POINTS - 1)), newDataPoint]);
      }
    });

    stream.on('error', (err: any) => {
      console.error('Stream error:', err);
      setConnectionStatus('disconnected');
    });

    stream.on('end', () => {
      console.log('Stream ended');
      setConnectionStatus('disconnected');
    });

    return () => {
      stream.cancel();
      console.log('Cleaned up stream');
    };
  }, [activeDataType]);

  const chartData = {
    datasets: [
      {
        label: 'ISS Altitude (km)',
        data: altitudeData,
        borderColor: '#4bc0c0',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 2
      },
      {
        label: 'ISS Velocity (km/s)',
        data: velocityData,
        borderColor: '#ff6384',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 2
      }
    ]
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '900px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333' }}>ISS Real-Time Telemetry</h1>
      
      <div style={{ 
        backgroundColor: connectionStatus === 'connected' ? '#4CAF50' : 
                       connectionStatus === 'connecting' ? '#FFC107' : '#F44336',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '4px',
        display: 'inline-block',
        marginBottom: '20px',
        fontWeight: 'bold'
      }}>
        Status: {connectionStatus.toUpperCase()}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          style={{ 
            marginRight: '10px',
            padding: '8px 16px',
            backgroundColor: activeDataType === 'altitude' ? '#4bc0c0' : '#e0e0e0',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            color: activeDataType === 'altitude' ? 'white' : '#333'
          }}
          onClick={() => setActiveDataType('altitude')}
        >
          Show Altitude
        </button>
        <button
          style={{
            padding: '8px 16px',
            backgroundColor: activeDataType === 'velocity' ? '#ff6384' : '#e0e0e0',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            color: activeDataType === 'velocity' ? 'white' : '#333'
          }}
          onClick={() => setActiveDataType('velocity')}
        >
          Show Velocity
        </button>
      </div>
      
      <div style={{ 
        height: '500px', 
        marginBottom: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                type: 'time',
                time: {
                  displayFormats: {
                    minute: 'HH:mm'
                  },
                  tooltipFormat: 'PPpp'
                },
                title: {
                  display: true,
                  text: 'Time (UTC)',
                  color: '#666'
                },
                grid: {
                  color: 'rgba(0,0,0,0.05)'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Value',
                  color: '#666'
                },
                grid: {
                  color: 'rgba(0,0,0,0.05)'
                }
              }
            },
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  font: {
                    size: 14
                  }
                }
              },
              tooltip: {
                backgroundColor: 'rgba(0,0,0,0.7)',
                titleFont: {
                  size: 16
                },
                bodyFont: {
                  size: 14
                },
                callbacks: {
                  label: (context) => {
                    const label = context.dataset.label || '';
                    const value = context.parsed.y.toFixed(2);
                    return `${label}: ${value}`;
                  }
                }
              }
            }
          }}
        />
      </div>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>Current Values</h3>
        <p style={{ fontSize: '16px' }}>
          <strong style={{ color: '#4bc0c0' }}>Altitude:</strong> 
          <span style={{ marginLeft: '8px' }}>
            {altitudeData.length > 0 ? altitudeData[altitudeData.length - 1].y.toFixed(2) : '--'} km
          </span>
        </p>
        <p style={{ fontSize: '16px' }}>
          <strong style={{ color: '#ff6384' }}>Velocity:</strong> 
          <span style={{ marginLeft: '8px' }}>
            {velocityData.length > 0 ? velocityData[velocityData.length - 1].y.toFixed(2) : '--'} km/s
          </span>
        </p>
      </div>
    </div>
  );
};

export default App;
