import React, { useEffect, useState } from "react";
import { requestJira } from "@forge/bridge";
// import { invoke } from "@forge/bridge";
import "./index.css";
import moment from "moment";
import { BacklogIssueDetails } from "./components/BacklogDetails/BacklogIssueDetails";
import { BoardDetails } from "./components/boardDetails/BoardDetails";
import { SprintDetails } from "./components/sprintDetails/SprintDetails";
// import { UserDetails } from "./components/UserDetails/UserDetails";

function App() {
  // const [sprintDetails, setSprintDetails] = useState(null);
  // const [selectedDetails, setSelectedDetails] = useState(null);
  // const [userIssueDetails, setUserIssueDetails] = useState(null);
  // const [backlogIssueDetails, setBacklogIssueDetails] = useState(null);
  const [productivityChartData, setProductivityChartData] = useState([]);
  const [productivityLoading, setProductivityLoading] = useState(true);
  const [boardId, setBoardId] = useState(null);
  const today = moment().format("YYYY-MM-DD");
  const thirtyDaysAgo = moment().subtract(30, "days").format("YYYY-MM-DD");
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);

  const handleStartDateChange = (e) => {
    const selectedDate = e.target.value;
    if (moment(selectedDate).isAfter(endDate)) {
      setStartDate(moment(endDate).subtract(1, "days").format("YYYY-MM-DD"));
    } else {
      setStartDate(selectedDate);
    }
  };


  const handleEndDateChange = (e) => {
    const selectedDate = e.target.value;
    if (moment(selectedDate).isAfter(today)) {
      setEndDate(today);
    } else if (moment(selectedDate).isBefore(startDate)) {
      setEndDate(moment(startDate).add(1, "days").format("YYYY-MM-DD"));
    } else {
      setEndDate(selectedDate);
    }
  };

  //get formatted duration
  const formatDuration = (startMoment, endMoment) => {
    const days = endMoment.diff(startMoment, "days");
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    const months = Math.floor(days / 30); // Assuming a month has 30 days

    let duration = "";

    if (months > 0 && remainingDays === 0) {
      duration = `${months} ${months === 1 ? "month" : "months"}`;
    } else if (weeks > 0 && remainingDays === 0) {
      duration = `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
    } else {
      duration = `${days} ${days === 1 ? "day" : "days"}`;
    }
    return duration;
  };

  const getActiveSprintDoneStories = async (boardId) => {
    setProductivityLoading(true);
    const boardRes = await requestJira(
      `/rest/agile/1.0/board/${boardId}/sprint`
    );
    const boardData = await boardRes?.json();

    // Filter the active sprints
    const closeSprints = boardData?.values?.filter(
      (sprint) => sprint.state === "closed" && sprint?.startDate >= startDate && sprint?.startDate <= endDate
    );

    // Fetch the stories for each active sprint
    const activeSprintStoriesPromises = closeSprints?.map(async (sprint) => {
      const query = `issueType = Story AND status = Done`;
      const getDoneStoryRes = await requestJira(
        `/rest/agile/1.0/sprint/${sprint.id}/issue?jql=${encodeURIComponent(
          query
        )}`
      );
      const getDoneStoryData = await getDoneStoryRes?.json();
      return { sprintID: sprint?.id, ...sprint, ...getDoneStoryData };
    });

    const activeSprintDoneStories = await Promise.all(
      activeSprintStoriesPromises
    );
    const sortedData = [...activeSprintDoneStories].sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    );

    const calculateSum = () => {
      return sortedData?.map((obj) => {
        const formateStartDate = moment(obj?.startDate).format("DD MMM");
        const formateEndDate = moment(obj?.endDate).format("DD MMM");
        const sum = obj.issues.reduce((acc, issue) => {
          return (
            acc +
            (issue?.fields?.customfield_10032 ||
              issue?.fields?.customfield_10034 ||
              0)
          );
        }, 0);
        return {
          startDate:formateStartDate,
          endDate: formateEndDate,
          sprintKey: `${formateStartDate} - ${formateEndDate}`,
          sprintName: obj?.name,
          sprintData: { timeStamp: Date.now(), storyPoints: sum },
        };
      });
    };
    return calculateSum();
  };

  /*  //get project details
  const fetchProjectDetails = async (projectId) => {
    const projectRes = await requestJira(`/rest/api/3/project/${projectId}`);
    const projectData = await projectRes?.json();
    setUserIssueDetails(null);
    setSprintDetails(null);
    setBacklogIssueDetails(null);
    setBacklogHistory(null);
    setSelectedDetails({
      fetchType: "project",
      entityId: projectData.entityId,
      projectId: projectData?.id,
      name: projectData?.name,
      Key: projectData?.key,
      uuid: projectData?.uuid,
    });
  };

  // get board details
  const fetchBoardDetails = async (boardId) => {
    setUserIssueDetails(null);
    setSprintDetails(null);

    setBacklogIssueDetails(null);
    setBacklogHistory(null);
    const boardRes = await requestJira(`/rest/agile/1.0/board/${boardId}`);
    const boardData = await boardRes?.json();

    setSelectedDetails({
      boardId: boardData?.id,
      name: boardData?.name,
      location: { projectId: boardData?.location.projectId, projectKey: boardData?.location.projectKey, projectName: boardData?.location.projectName, projectTypeKey: boardData?.location.projectTypeKey },
      type: boardData?.type,
    });
  };
 */
  //fetch sprint data
  const fetchSprintsDetails = async (boardId) => {
    setBoardId(boardId);
    // setUserIssueDetails(null);
    // setBacklogIssueDetails(null);
    // setSelectedDetails(null);

    getActiveSprintDoneStories(boardId)
      .then((data) => {
        setProductivityChartData(data);
        setProductivityLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching active sprint stories", error);
        setProductivityLoading(false);
      });

    // const boardRes = await requestJira(`/rest/agile/1.0/board/${boardId}/sprint`);
    // const boardData = await boardRes?.json();
    // const jqlQuery = ` issueType in (Bug,Task,Story)`;
    // if (boardData && boardData.values) {
    //   let filteredValues = boardData.values.filter((value) => value.originBoardId === boardId);
    //   boardData.values = filteredValues;
    // }

    // const sprints = [];
    // if (boardData && boardData.values && boardData.values) {
    //   for (const sprint of boardData.values) {
    //     const boardRes1 = await requestJira(`/rest/agile/1.0/sprint/${sprint.id}/issue?jql=${encodeURIComponent(jqlQuery)}`);
    //     const boardData1 = await boardRes1?.json();
    //     let points = 0;
    //     boardData1.issues.map((issue) => {
    //       if (issue?.fields?.customfield_10034) {
    //         points += issue?.fields?.customfield_10034;
    //       }
    //     });
    //     // Define start date and end date
    //     var startDate = moment(sprint?.startDate, "YYYY-MM-DD");
    //     var endDate = moment(sprint?.endDate, "YYYY-MM-DD");

    //     const duration = formatDuration(startDate, endDate);

    //     sprints.push({
    //       issueId: sprint.id,
    //       state: sprint.state,
    //       issuesCount: boardData1.issues.length,
    //       issuesPoints: points ? points : "NA",
    //       duration: sprint?.startDate && sprint?.endDate ? duration : "NA",
    //       sprint: { sprintName: sprint.name, sprint: boardData1 },
    //     });
    //   }
    //   setSprintDetails({ boardName, sprints });
    // } else {
    //   setSprintDetails({ boardName, sprints: [] });
    // }
  };

  useEffect(() => {
    if(boardId) {
      fetchSprintsDetails(boardId)
    }
  }, [startDate, endDate])

  // const fetchUserDetails = async (boardId, boardName) => {
  // setSelectedDetails(null);
  // setSprintDetails(null);

  // // Constructing the JQL query to filter issues by boardId and issue type "Bug"
  // const jqlQuery = ` issueType in (Bug,Task,Story)`;

  // // Fetching issues using JQL
  // const boardResBacklog = await requestJira(`/rest/agile/1.0/board/${boardId}/issue?jql=${encodeURIComponent(jqlQuery)}`);
  // const boardDataBacklog = await boardResBacklog?.json();
  // console.log(boardDataBacklog, "171")
  // const userData = [];
  // //pushing the required fields into the userData array
  // boardDataBacklog.issues.map((issue) => {
  //   if (issue.fields.assignee) {
  //     userData.push({
  //       id: issue.id,
  //       priority: issue.fields.priority.name,
  //       key: issue.key,
  //       issueName: issue.fields.summary,
  //       team: issue.fields.customfield_10001 ? issue.fields.customfield_10001.name : "Unassigned",
  //       issuetype: issue.fields.issuetype.name,
  //       assignee: issue.fields.assignee.displayName,
  //       accountId: issue.fields.assignee.accountId,
  //     });
  //   }
  // });

  // //grouping of data by assignee accountId Array.reduce()

  // const groupedData = userData.reduce((acc, obj) => {
  //   const assignee = obj.assignee;
  //   const accountId = obj.accountId;
  //   if (!acc[accountId]) {
  //     acc[accountId] = { assignee, accountId, issues: [] };
  //   }
  //   acc[accountId].issues.push({
  //     id: obj.id,
  //     priority: obj.priority,
  //     key: obj.key,
  //     issueName: obj.issueName,
  //     team: obj.team,
  //     issuetype: obj.issuetype,
  //   });
  //   return acc;
  // }, {});

  // const groupedArray = Object.values(groupedData);
  // setUserIssueDetails({ boardName, groupedArray });
  // };

  // const fetchBacklogDetails = async (boardId, boardName) => {
  //   setLoading(true);
  //   setSelectedDetails(null);
  //   setUserIssueDetails(null);
  //   setSprintDetails(null);
  //   // Constructing the JQL query to filter issues by boardId and issue type "Bug"
  //   const jqlQuery = `issueType in (Bug)`;

  //   try {
  //     // Fetching issues using JQL
  //     const boardResBacklog = await requestJira(`/rest/agile/1.0/board/${boardId}/backlog?jql=${encodeURIComponent(jqlQuery)}`);
  //     const boardDataBacklog = await boardResBacklog.json();
  //     const userData =
  //       boardDataBacklog?.issues?.map((issue) => ({
  //         id: issue.id,
  //         priority: issue.fields.priority.name,
  //         key: issue.key,
  //         assignee: issue.fields.assignee ? issue.fields.assignee.displayName : "Unassigned",
  //         team: issue.fields.customfield_10001 ? issue.fields.customfield_10001.name : "Unassigned",
  //         // issueName: issue.fields.summary,
  //         //issuetype: issue.fields.issuetype.name,
  //       })) || [];
      // const boardPriority = await invoke("getBoardConfiguration", { key: `Backlog_configuration_${boardId}` }).catch((error) => {
      //   console.error(`Error setting data for board Configuration :`, error);
      //   return null; // Handle errors by returning null
      // });
  //     const boardPriorityData = typeof boardPriority === "object" ? "Lowest" : boardPriority;
  //     setBacklogIssueDetails({ boardName, userData, boardId, boardPriorityData });
  //   } catch (error) {
  //     console.error("Error fetching backlog details:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  /* const closeView = async () => {
    setSprintDetails(null);

    setUserIssueDetails(null);
    setSelectedDetails(null);
    setBacklogIssueDetails(null);
    setBacklogHistory(null);
  }; */

  return (
    <div>
      <div className="mb-2">
        <h5>Track team performance across Sprints</h5>
      </div>
      <BoardDetails
        fetchSprintsDetails={fetchSprintsDetails}
        setProductivityLoading={setProductivityLoading}
        setProductivityChartData={setProductivityChartData}
        startDate={startDate}
        endDate={endDate}
        handleStartDateChange={handleStartDateChange}
        handleEndDateChange={handleEndDateChange}
      />
      {productivityLoading ? (
        <p className="flex items-center justify-center">Loading...</p>
      ) : (
        <div className="flex p-2 max-w-full min-h-screen">
          <div className="w-1/2  border-r border-gray-300">
            {productivityChartData && (
              <SprintDetails productivityChartData={productivityChartData} />
            )}
          </div>
          {/* <div className="w-1/2  border-r border-gray-300">
        {selectedDetails &&<ProductivityChart productivityChartData={productivityChartData} />}

        </div> */}

          <div class="w-1/2 ">
            {/* {selectedDetails ? 
          ( */}
            {
              /* <div class="flex  pt-20 w-full h-1/2">
            <div class="flex-1  h-400 ">
              <div class="w-full bg-gray-200 flex flex-col h-full border-1 border-solid border-gray-300 rounded-lg p-2 shadow-md">
                <textarea className="flex-1 h-400  border-1 border-solid border-gray-600 rounded-lg p-3 overflow-auto  resize-none" value={JSON.stringify(selectedDetails, null, 2)} readOnly rows={25} />

                <div class="mt-2 flex ">
                  <button class="bg-blue-500 text-white p-1 px-3  rounded-md" onClick={() => closeView()}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div> */
              // }
              // )
              //  : userIssueDetails ? (
              //   <UserDetails userIssueDetails={userIssueDetails} />
              // )
              // :
              // boardId ? (
              <BacklogIssueDetails
                boardId={boardId}
                startDate={startDate}
                endDate={endDate}
                productivityChartData={productivityChartData}
              />
              // ) : (
              //   <></>
              // )
            }
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
