import React, { useEffect, useState, useRef } from "react";
import { invoke, requestJira } from "@forge/bridge";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js/auto";
import Chart from "chart.js/auto";
import moment from "moment";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const generatePriorityList = (basePriority) => {
  const allPriorities = ["Lowest", "Low", "Medium", "High", "Highest"];
  const startIndex = allPriorities.indexOf(basePriority);
  return allPriorities.slice(startIndex);
};

const Linechart = ({ boardId, startDate, endDate, productivityChartData }) => {
  const [selectedPriority, setSelectedPriority] = useState();
  const [AllBacklogIssue, setAllBacklogIssue] = useState(null);
  const [chatFormatData, setchatFormatData] = useState([]);
  const [loading, setloading] = useState(true);
  const ref = useRef(null);

  const fatchBackLogData = async (boardId, selectedPriority) => {
    const priorities = generatePriorityList(selectedPriority);
    const jqlQuery = ` issueType in (Bug) AND priority in (${priorities
      .map((p) => `'${p}'`)
      .join(", ")})`;
    const boardResBacklog = await requestJira(
      `/rest/agile/1.0/board/${boardId}/issue?jql=${encodeURIComponent(
        jqlQuery
      )}`
    );
    const boardDataBacklog = await boardResBacklog?.json();
    setAllBacklogIssue(boardDataBacklog);
    setloading(false);
  };
  const getPriorityAPi = async () => {
    const bugPriority = await invoke("getBugPriority", {
      key: "backlogBugPriority",
    }).catch((error) => {
      console.error(`Error setting data for board Configuration :`, error);
      return null; // Handle errors by returning null
    });
    setSelectedPriority(bugPriority ? bugPriority : "Lowest");
    return bugPriority;
  };

  useEffect(() => {
    getPriorityAPi();
  }, []);

  useEffect(() => {
    if (boardId && selectedPriority) {
      console.log(boardId, selectedPriority, 1234);
      fatchBackLogData(boardId, selectedPriority);
    }
  }, [selectedPriority, boardId]);

  function getDatesBetween(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= new Date(endDate)) {
      dates.push(new Date(currentDate).toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  // Function to count issues per day
  function countIssuesPerDay(issues) {
    const countPerDay = {};

    issues?.forEach((issue) => {
      const statusName = issue?.fields?.status.name;
      const createdDate = new Date(issue?.fields?.created)
        .toISOString()
        .split("T")[0];
      const updatedDate =
        statusName === "Done"
          ? new Date(issue?.fields?.updated).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];

      // Get all dates from created to updated
      const dates = getDatesBetween(createdDate, updatedDate);

      dates.forEach((date) => {
        let assigneeStatus = statusName;
        // if (statusName === "Done" && date !== updatedDate) {
        //   assigneeStatus = "To Do";
        // }
        if (
          statusName === "To do" ||
          statusName === "In Progress" ||
          statusName === "Done"
        ) {
          assigneeStatus = "To Do";
        }
        if (!countPerDay[date]) {
          countPerDay[date] = {
            ...countPerDay[date],
            [assigneeStatus]: 1,
          };
        } else {
          if (countPerDay[date][assigneeStatus]) {
            countPerDay[date] = {
              ...countPerDay[date],
              [assigneeStatus]: countPerDay[date][assigneeStatus] + 1,
            };
          } else {
            countPerDay[date] = {
              ...countPerDay[date],
              [assigneeStatus]: +1,
            };
          }
        }
      });
    });

    return countPerDay;
  }

  function filterAndFormatData(startDate, endDate, dataObj) {
    const result = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);
    while (currentDate <= end) {
      const dateString = currentDate.toISOString().split("T")[0];
      const todoCount = dataObj[dateString]
        ? dataObj[dateString]["To Do"] || 0
        : 0;
      result.push({ date: dateString, "To Do": todoCount });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return result;
  }

  const getDatesData = async () => {
    const result = await countIssuesPerDay(AllBacklogIssue?.issues);
    const filteredData = filterAndFormatData(startDate, endDate, result);
    setchatFormatData(filteredData);
  };

  useEffect(() => {
    getDatesData();
  }, [AllBacklogIssue, startDate, endDate]);

  useEffect(() => {
    if(ref && !loading) {
      ref.current.scrollLeft += 350;
    }
  }, [ref, loading]);

  const labels =
    chatFormatData?.map((item) => moment(item.date).format("DD MMM")) || [];
  const dataPoints = chatFormatData?.map((item) => item["To Do"]) || [];

  useEffect(() => {
    if (!loading) {
      const ctx = document.getElementById("myChart2");
      const ctx2 = document.getElementById("mySecondChart2");

      const myChart = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Bugs",
              data: dataPoints,
              borderColor: "rgb(75, 192, 192)",
              backgroundColor: "rgb(75, 192, 192)",
              borderWidth: 3,
            },
          ],
        },
        options: {
          interaction: {
            mode: "index",
            axis: "y",
          },
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
            tooltip: {
              callbacks: {
                label: function (context) {
                  let label = "";
                  // Loop through your data to find the corresponding sprint
                  productivityChartData.forEach((data) => {
                    const startDate = new Date(data.startDate);
                    const endDate = new Date(data.endDate);
                    const labelDate = new Date(context.label);

                    // Check if the xValue falls between start and end date of the sprint
                    if (labelDate >= startDate && labelDate <= endDate) {
                      // Format the tooltip label with sprint name and start-end date
                      label = `Sprint Name: ${data.sprintName}`;
                    }
                  });
                  return label;
                },
                footer: function (context) {
                  return `Bugs : ${context[0]?.formattedValue}`;
                },
              },
            },
          },
          scales: {
            x: {
              // title: {
              //   display: true,
              //   text: "Date",
              //   font: {
              //     weight: "bold",
              //   },
              // },
              beginAtZero: true,
              ticks: {
                maxTicksLimit: 20, // Set the maximum number of ticks (labels) to display
                font: function (context) {
                  return {
                    size: 12,
                    weight: "bold",
                  };
                },
              },
            },
            // x2: {
            //   position: "top",
            //   ticks: {
            //     maxTicksLimit: 13,
            //     font: function (context) {
            //       return {
            //         size: 12,
            //         weight: "bold",

            //       };
            //     },
            // callback: function (label) {
            //   let realLabel = this.getLabelForValue(label);
            //   let sprintName = '';

            //   productivityChartData?.forEach((data) => {
            //     if (data.startDate === realLabel) {
            //       sprintName = data?.sprintName;
            //     }
            //   });

            //   return sprintName; // Return the sprintName to display on x2 axis
            // },
            //   },
            // },
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 2,
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
              title: {
                display: true,
                text: "Bugs",
                font: {
                  weight: "bold",
                },
                padding: {
                  top: -1, // Adjust the top padding to create a gap
                },
              },
              beginAtZero: true,
              ticks: {
                stepSize: 2,
                font: {
                  weight: "bold",
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
    }
  }, [chatFormatData]);

  const handlePriorityChange = async (event) => {
    setSelectedPriority(event.target.value);
    await invoke("setBugPriority", {
      key: "backlogBugPriority",
      value: event.target.value,
    }).catch((error) => {
      console.error(`Error setting data for board Configuration :`, error);
      return null; // Handle errors by returning null
    });
  };

  return (
    <>
      {loading ? (
        "Loading..."
      ) : (
        <div class="w-full bg-gray-100 flex flex-col h-full border-1 border-solid border-gray-300 rounded-lg pt-4 shadow-md">
          <div>
            <div className="ml-8">
              <label htmlFor="prioritySelect">Bug Priority: </label>
              <select
                id="prioritySelect"
                value={selectedPriority}
                onChange={handlePriorityChange}
              >
                {["Lowest", "Low", "Medium", "High", "Highest"]?.map(
                  (priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  )
                )}
              </select>
            </div>
            <div className="chart-box">
              <div className="chart-container">
                <div className="small-column2">
                  <canvas id="mySecondChart2"></canvas>
                </div>
                <div
                  className={`max-w-[800px] h-[330px] overflow-x-auto overflow-y-hidden scrollbar`}
                  ref={ref}
                >
                  <div
                    className={
                      chatFormatData?.length > 8
                        ? "container2"
                        : "container-selected-data"
                    }
                  >
                    <canvas id="myChart2"></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Linechart;
