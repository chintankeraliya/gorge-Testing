import React, { useState, useEffect } from "react";
import ProductivityChart from "../ProductivityChart/ProductivityChart";

export const SprintDetails = ({ productivityChartData }) => {
  // const [sprintIssueDetails, setSprintIssueDetails] = useState(null);

  //fetch issues grouping by teams
  // const getTeamsData = async (issues) => {
  //   const groupedData = [];
  //   const issueData = [];

  //   issues.sprint.issues.forEach((issue) => {
  //     let bug = 0;
  //     let story = 0;
  //     let task = 0;
  //     if (issue.fields.issuetype.name === "Task") {
  //       task++;
  //     } else if (issue.fields.issuetype.name === "Bug") {
  //       bug++;
  //     } else if (issue.fields.issuetype.name === "Story") {
  //       story++;
  //     }

  //     issueData.push({
  //       team: issue.fields.customfield_10001 ? issue.fields.customfield_10001.name : "Unassigned",
  //       bug: bug,
  //       task: task,
  //       story: story,
  //       points: issue.fields.customfield_10034 ? issue.fields.customfield_10034 : 0,
  //     });
  //   });
  //   // Iterate over the issue data array

  //   issueData.forEach((issue) => {
  //     const { team, bug, task, story, points } = issue;

  //     if (!groupedData[team]) {
  //       // Initialize counts from the issue object
  //       groupedData[team] = {
  //         team: team,
  //         bug: 0,
  //         task: 0,
  //         story: 0,
  //         points: 0,
  //       };
  //     }

  //     // Increment counts based on issue object
  //     groupedData[team].bug += bug;
  //     groupedData[team].task += task;
  //     groupedData[team].story += story;
  //     groupedData[team].points += points;
  //   });

  //   // Convert grouped data object to array
  //   let result = Object.values(groupedData);

  //   // Calculate total issues and points
  //   let totals = { team: "Total", bug: 0, task: 0, story: 0, points: 0 };

  //   for (let i = 0; i < result.length; i++) {
  //     totals.bug += result[i].bug;
  //     totals.task += result[i].task;
  //     totals.story += result[i].story;
  //     totals.points += result[i].points;
  //   }

  //   // Append a final row with totals
  //   result.push(totals);
  //   setSprintIssueDetails({ sprintName: issues.sprintName, result: result });
  // };
  // useEffect(() => {
  //   setSprintIssueDetails(null);
  // }, [sprintDetails]);

  return (
    <div className=" p-2 border-1 border-solid border-gray-300 rounded-lg">
      {/* Iterate over userIssueDetails array */}

      <h2 className="text-24 font-bold mb-4 ">Completed Story Points</h2>
      {/*<>{sprintDetails.sprints.length <= 0 && "No data Avaliable"}</>
      {sprintDetails.sprints.length !== 0 && (
        <div className="mb-2 p-2 bg-gray-200 border-1 border-solid border-gray-300 rounded-lg">
          <table className="table-auto  border-collapse w-full">
            <thead>
              <tr className="bg-gray-200 border-b border-gray-300">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">State</th>
                <th className="px-4 py-2">Duration</th>
                <th className="px-4 py-2">#Issues</th>
                <th className="px-4 py-2">Story Points</th>
              </tr>
            </thead>
            <tbody>
              {sprintDetails.sprints.map((issue, i) => (
                <tr key={i} className="border-b border-gray-300">
                  <td className="px-4 py-2">{issue.issueId}</td>
                  <td className="px-4 py-2">{issue.state}</td>
                  <td className="px-4 py-2">{issue.duration}</td>
                  <td className="px-4 py-2">{issue.issuesCount}</td>
                  <td className="px-4 py-2">{issue.issuesPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )} */}
      {productivityChartData?.length > 0 ? (
        <div class="w-full bg-gray-100 flex flex-col h-full border-1 border-solid border-gray-300 rounded-lg pt-4 shadow-md">
          <ProductivityChart productivityChartData={productivityChartData} />
        </div>
      ) : (
        "No data Avaliable"
      )}
      {/* {sprintIssueDetails ? (
        <div className=" p-2 border-1 border-solid mt-12 border-gray-300 rounded-lg">
          <h2 className="text-24 font-bold mb-10  ">Workload by Teams- {sprintIssueDetails.sprintName} </h2>

          <div className="mb-2 p-2 bg-gray-200 border-1 border-solid border-gray-300 rounded-lg">
            <table className="table-auto p-2 border-collapse w-full">
              <thead>
                <tr className="bg-gray-200 border-b border-gray-300">
                  <th className="px-4 py-2">Team</th>
                  <th className="px-4 py-2">#Bugs</th>
                  <th className="px-4 py-2">#Tasks</th>
                  <th className="px-4 py-2">#Stories</th>
                  <th className="px-4 py-2">Story Points</th>
                </tr>
              </thead>
              <tbody>
                {sprintIssueDetails.result.map((issue, i) => (
                  <tr key={i} className="border-b border-gray-300">
                    <td className={`px-4 py-2  ${issue.team === "Total" ? "font-bold" : ""}`}>{issue.team}</td>
                    <td className={`px-4 py-2  ${issue.team === "Total" ? "font-bold" : ""}`}>{issue.bug}</td>
                    <td className={`px-4 py-2  ${issue.team === "Total" ? "font-bold" : ""}`}>{issue.task}</td>
                    <td className={`px-4 py-2  ${issue.team === "Total" ? "font-bold" : ""}`}>{issue.story}</td>
                    <td className={`px-4 py-2  ${issue.team === "Total" ? "font-bold" : ""}`}>{issue.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <></>
      )} */}
    </div>
  );
};
