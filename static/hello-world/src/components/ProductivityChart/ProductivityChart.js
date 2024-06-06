import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

const ProductivityChart = ({ productivityChartData }) => {

  const ref = useRef(null);
  const labels = productivityChartData?.map((item) => item?.sprintName) || [];
  const dataPoints =
    productivityChartData?.map((item) => item?.sprintData?.storyPoints) || [];
  const additionalLabels =
    productivityChartData?.map((item) => item?.sprintKey) || [];

    useEffect(() => {
        ref.current.scrollLeft += 350;
    }, [])

    useEffect(() => {
    const ctx = document.getElementById("myChart");
    const ctx2 = document.getElementById("mySecondChart");

    const myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Story Points",
            data: dataPoints,
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgb(75, 192, 192)",
            borderWidth: 3,
          },
        ],
      },
      options: {
        interaction: {
          mode: 'index',
          axis: 'y'
      },
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 11,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            // title: {
            //   display: true,
            //   text: 'Sprints Name',
            //   font: {
            //     weight: "bold",
            //   },
            // },  
            beginAtZero: true,
            ticks: {
              maxTicksLimit: 8, // Set the maximum number of ticks (labels) to display
              callback: function (value, index) {
                const primaryLabel = this.getLabelForValue(value);
                const secondaryLabel = additionalLabels[index];
                // Return as an array to ensure multi-line labels
                return [primaryLabel, secondaryLabel];
              },
            font: function(context) {
                return {
                    size: 12,
                    weight: 'bold'
                };
            },

            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 4,
              display: false,
            },
            border: {
              display: false,
            },
          },
        },
      },
    });

    const mySecondChart = new Chart(ctx2, {
      type: "line",
      data: {
        datasets: [
          {
            data: dataPoints,
            fill: false,
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            bottom: 36,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            gridLines: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Story Points',
              font: {
                weight: "bold",
              },
              padding: {
                top: -1, // Adjust the top padding to create a gap
              },
            },  
            // max: dataPoints.length ? Math.max(...dataPoints) + 8 : 0,
            ticks: {
              stepSize: 4,
              font: {
                weight: 'bold', // Set font weight to bold
              },      
            },
            afterFit: (c) => {
              c.width = 40;
            },
          },
        },
      },
    });
    return () => {
      myChart.destroy();
      mySecondChart.destroy();
    };
  }, [productivityChartData]);


  return (
    <div className="chart-box">
      <div className="chart-container">
        <div className="small-column">
          <canvas id="mySecondChart"></canvas>
        </div>
        <div className="large-column scrollbar" ref={ref}>
          <div className={ productivityChartData?.length > 4 ? "container" :"container-selected-data"}>
            <canvas id="myChart"></canvas>
          </div>  
        </div>
      </div>
    </div>
  );
};

export default ProductivityChart;
