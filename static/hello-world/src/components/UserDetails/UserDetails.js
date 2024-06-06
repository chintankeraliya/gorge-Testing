import React from "react";

export const UserDetails = ({ userIssueDetails }) => {
  /*   const [userIssueDetails, setUserIssueDetails] = useState(null);
   */
  //function for the styling of the chip
  function getPriorityColor(priority) {
    switch (priority.toLowerCase()) {
      case "highest":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-black";
      case "low":
        return "bg-blue-200 text-black";
      case "lowest":
        return "bg-blue-900 text-white";
      default:
        return "bg-gray-300 text-black";
    }
  }

  //fetch user data
  /*   const fetchUserDetails = async (boardId, boardName) => {
    setSelectedDetails(null);
    setSprintDetails(null);

    // Constructing the JQL query to filter issues by boardId and issue type "Bug"
    const jqlQuery = ` issueType in (Bug,Task,Story)`;

    // Fetching issues using JQL
    const boardResBacklog = await requestJira(`/rest/agile/1.0/board/${boardId}/issue?jql=${encodeURIComponent(jqlQuery)}`);
    const boardDataBacklog = await boardResBacklog?.json();
    const userData = [];
    //pushing the required fields into the userData array
    boardDataBacklog.issues.map((issue) => {
      if (issue.fields.assignee) {
        userData.push({
          id: issue.id,
          priority: issue.fields.priority.name,
          key: issue.key,
          issueName: issue.fields.summary,
          team: issue.fields.customfield_10001 ? issue.fields.customfield_10001.name : "Unassigned",
          issuetype: issue.fields.issuetype.name,
          assignee: issue.fields.assignee.displayName,
          accountId: issue.fields.assignee.accountId,
        });
      }
    });

    //grouping of data by assignee accountId Array.reduce()

    const groupedData = userData.reduce((acc, obj) => {
      const assignee = obj.assignee;
      const accountId = obj.accountId;
      if (!acc[accountId]) {
        acc[accountId] = { assignee, accountId, issues: [] };
      }
      acc[accountId].issues.push({
        id: obj.id,
        priority: obj.priority,
        key: obj.key,
        issueName: obj.issueName,
        team: obj.team,
        issuetype: obj.issuetype,
      });
      return acc;
    }, {});

    const groupedArray = Object.values(groupedData);
    setUserIssueDetails({ boardName, groupedArray });
  }; */
  return (
    <div className=" p-2 border-1 border-solid border-gray-300 rounded-lg">
      {/* Iterate over userIssueDetails array */}

      <h2 className="text-24 font-bold mb-12 ">
        Issues Assigned to Users -{userIssueDetails.boardName}{" "}
      </h2>
      <>{userIssueDetails.groupedArray.length <= 1 && "No data Avaliable"}</>
      {userIssueDetails.groupedArray.map((userDetails, index) => (
        <div
          key={index}
          className="mb-2 p-2 bg-gray-200 border-1 border-solid border-gray-300 rounded-lg"
        >
          {/* Display user name */}

          <h2 className="text-2xl font-bold ">{userDetails.assignee}</h2>
          <table className="table-auto  border-collapse w-full">
            <thead>
              <tr className="bg-gray-200 border-b border-gray-300">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Priority</th>
                <th className="px-4 py-2">Issue Name</th>
                <th className="px-4 py-2">Issue Type</th>
                <th className="px-4 py-2">Team</th>
              </tr>
            </thead>
            <tbody>
              {/* Iterate over user's issues */}
              {userDetails.issues.map((issue, i) => (
                <tr key={i} className="border-b border-gray-300 ">
                  <td className="px-4 py-2">{issue.id}</td>
                  <td className={`px-4 py-2 `}>
                    <span
                      className={`px-2 py-1 rounded-lg ${getPriorityColor(
                        issue.priority
                      )}`}
                    >
                      {issue.priority}
                    </span>
                  </td>
                  <td className="px-4 py-2">{issue.issueName}</td>
                  <td className="px-4 py-2">{issue.issuetype}</td>
                  <td className="px-4 py-2">{issue.team}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};
