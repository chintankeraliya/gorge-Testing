import React, { useEffect, useState } from "react";
import { requestJira, invoke } from "@forge/bridge";
import moment from "moment";

export const BoardDetails = ({
  fetchSprintsDetails,
  setProductivityLoading,
  setProductivityChartData,
  startDate,
  endDate,
  handleStartDateChange,
  handleEndDateChange,
}) => {
  const [boards, setBoards] = useState([]);
  // const [selectedBoard, setSelectedBoard] = useState(null);
  const today = moment().format("YYYY-MM-DD");
  const [loading, setloading] = useState(true);

  useEffect(() => {
    if (boards?.length > 0) {
      // setProductivityLoading(true)
      // setSelectedBoard(boards[0]?.id)
      fetchSprintsDetails(boards[0]?.id, boards[0]?.name);
      // fetchBacklogDetails(boards[0]?.id, boards[0]?.name);
    }
  }, [boards]);

  const fetchBoardsList = async () => {
    const response = await requestJira(`/rest/agile/1.0/board`);
    const responseData = await response.json();

    const formattedBoards = responseData?.values?.map((board) => ({
      id: board?.id,
      name: board?.name,
      type: board?.type,
      projectId: board?.location?.projectId,
      projectName: board?.location?.projectName,
      projectKey: board?.location?.projectKey,
      location: board?.location,
    }));
    setBoards(formattedBoards);
    setloading(false);
  };

  useEffect(() => {
    fetchBoardsList();
  }, []);

  const handleBoardChange = (event) => {
    if (event.target.value) {
      setProductivityChartData([]);
      setProductivityLoading(true);
      const boardId = event.target.value;
      const selected = boards?.find((board) => board?.id == boardId);
      // setSelectedBoard(selected);
      fetchSprintsDetails(selected.id, selected.name);
      // fetchBacklogDetails(selected.id, selected.name);
    }
  };

  return (
    <>
      <div className="mb-4">
        {/* <label htmlFor="board-select" className="text-xl block font-bold mb-2">
          Select a Board:
        </label> */}
        <div className="w-1/2 relative flex items-center justify-between   gap-2 ">
          <div className="flex items-center gap-2">
          <label className="text-nowrap font-bold text-base">Board : </label>
          <select
          style={{width:"15rem"}}
            id="board-select"
            className="w-1/2 p-2 border border-gray-300 rounded"
            defaultValue={boards[0]?.id}
            onChange={handleBoardChange}
            >
            {boards?.length < 1 && !loading && (
              <option value="" className="border-b-2 border-gray-300">
                No Data Found
              </option>
            )}
            {boards.map((board) => (
              <option
              key={board.id}
              value={board.id}
              className="border-b-2 border-gray-300"
              >
                {board.name} | {board.projectKey}
              </option>
            ))}
          </select>
          </div>
         

          <div className="space-y-2  flex items-center gap-2 ">
          <label className="text-nowrap font-bold text-base">From : </label>
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              max={today}
              className="border border-gray-300 rounded-md px-3 py-2 mr-2"
            />
            <label className="text-nowrap font-bold text-base">To : </label>
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              min={startDate}
              max={today}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
      </div>
    </>
  );
};

/* export const BoardDetails = ({ loading, fetchBacklogDetails, fetchSprintsDetails, fetchUserDetails }) => {
  const [boards, setBoards] = useState([]);
  //get board details
  const fetchBoardsList = async () => {
    const response = await requestJira(`/rest/agile/1.0/board`);
    const responseData = await response.json();

    const formattedBoards = responseData?.values?.map((board) => ({
      id: board?.id,
      name: board?.name,
      type: board?.type,
      projectId: board?.location?.projectId,
      projectName: board?.location?.projectName,
      location: board?.location,
    }));
    setBoards(formattedBoards);
  };
  useEffect(() => {
    fetchBoardsList();
  }, []);
  return (
    <div class="w-1/2 mr-2  p-6 overflow-y-scroll scrollbar" style={{ height: "97vh" }}>
      <h1 class="text-24 font-bold mb-12">Boards</h1>
      <div className="grid grid-cols-1 gap-4">
        {boards.map((board) => (
          <div key={board.id} class="bg-green-100 w-full flex flex-col border-1 border-solid border-gray-300 rounded-lg p-5 mb-10 shadow-md">
            <div class="flex mb-1">
              <div class="font-bold mr-2">ID:</div>
              <div>{board.id}</div>
            </div>
            <div class="flex mb-1">
              <div class="font-bold mr-2">Name:</div>
              <div>{board.name}</div>
            </div>
            <div class="flex mb-1">
              <div class="font-bold mr-2">Type:</div>
              <div>{board.type}</div>
            </div>
            <div class="flex mb-1">
              <div class="font-bold mr-2">Project ID:</div>
              <div>{board.projectId}</div>
            </div>
            <div class="flex">
              <div class="font-bold mr-2">Project Name:</div>
              <div>{board.projectName}</div>
            </div>
            <div class=" p-4 gap-3 ">
              {// <button class=" py-2 px-4 mb-1 bg-blue-500 text-white  rounded-md mr-1" onClick={() => fetchProjectDetails(board.location.projectId)}>Project Details</button>
                               // <button class="py-2 px-4 mb-1 bg-blue-500 text-white  rounded-md mr-1" onClick={() => fetchBoardDetails(board.id)}>Board Details</button> 
                              }
              <button class=" py-2 px-4 mb-1 bg-blue-500 text-white  rounded-md mr-1" onClick={() => fetchSprintsDetails(board.id, board.name)}>
                Sprints
              </button>
              <button class=" py-2 px-4 mb-1 bg-blue-500 text-white  rounded-md mr-1" onClick={() => fetchUserDetails(board.id, board.name)}>
                Users
              </button>
              <button className={`py-2 px-4 rounded-md ${loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500"} text-white`} onClick={() => fetchBacklogDetails(board.id, board.name)} disabled={loading}>
                Backlog
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; */
