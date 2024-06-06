import React from "react";
import Linechart from "../lineChart/Linechart";

export const BacklogIssueDetails = ({ boardId, startDate, endDate, productivityChartData }) => {
  //const [backlogHistory, setBacklogHistory] = useState(null);
  //function for the styling of the chip

  // function getPriorityColor(priority) {
  //   switch (priority.toLowerCase()) {
  //     case "highest":
  //       return "bg-red-500 text-white";
  //     case "high":
  //       return "bg-orange-500 text-white";
  //     case "medium":
  //       return "bg-yellow-500 text-black";
  //     case "low":
  //       return "bg-blue-200 text-black";
  //     case "lowest":
  //       return "bg-blue-900 text-white";
  //     default:
  //       return "bg-gray-300 text-black";
  //   }
  // }
  return (
    <div className=" p-2 border-1 border-solid border-gray-300 rounded-lg">
      {/* {loading ? (
        <div className="flex items-center justify-center ">Loading.......</div>
      ) : ( */}
      {/* <> */}
      <h2 className="text-24 font-bold mb-4 ">Open Bugs in Backlog</h2>
      {/* <>{backlogIssueDetails.userData.length <= 0 && "No data Avaliable"}</> */}

      {/* {backlogIssueDetails.userData.length !== 0 && ( */}
      <>
        {/* <div className="mb-2 p-2 bg-gray-100 border-1 border-solid border-gray-300 rounded-lg overflow-y-scroll" style={{ height: "40vh" }}>
                <table className="table-auto  border-collapse w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="px-4 py-2">ID</th>
                      <th className="px-4 py-2">Assignee</th>
                      <th className="px-4 py-2">Team</th>
                      <th className="px-4 py-2">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backlogIssueDetails?.userData.map((issue, i) => (
                      <tr key={i} className="border-b border-gray-300">
                        <td className="px-4 py-2">{issue.id}</td>
                        <td className={`px-4 py-2 ${issue.assignee === "Unassigned" ? "font-light" : ""}`}>{issue.assignee}</td>
                        <td className={`px-4 py-2 ${issue.team === "Unassigned" ? "font-light" : ""}`}>{issue.team}</td>
                        <td className={`px-4 py-2 `}>
                          <span className={`px-2 py-1 rounded-lg ${getPriorityColor(issue.priority)}`}>{issue.priority}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div> */}
        {/* <div class="w-full bg-gray-100 flex flex-col h-full border-1 border-solid border-gray-300 rounded-lg p-4 shadow-md" > */}
        <Linechart boardId={boardId} startDate={startDate} endDate={endDate} productivityChartData={productivityChartData}/>
        {/* </div> */}
      </>
      {/* )} */}
      {/* </> */}
      {/* )} */}
    </div>
  );
};
