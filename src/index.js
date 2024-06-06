import api, { storage, requestJira, route, asApp } from "@forge/api";
import { Queue, InvocationError, InvocationErrorCode } from "@forge/events";
import Resolver from "@forge/resolver";

// Define the queue with the same key as in the manifest
const projectAsyncQueue = new Queue({ key: "project-async-queue" });
const storageAsyncQueue = new Queue({ key: "storage-async-queue" });
const asyncResolver = new Resolver();

// Event handler function for Jira issue creation
// export async function scheduledTrigger() {
//   const boardsResponse = await api.asApp().requestJira(route`/rest/agile/1.0/board`);
//   const boards = await boardsResponse.json();
//   try {
//     for (const board of boards.values) {
//       // const projectId = project.id;
//       // const jqlQuery = 'issueType=Bug';
//       // const backlogData = [];

//       // // Fetch backlogs for the current project
//       // const backlogsResponse = await api.asApp().requestJira(route`/rest/agile/1.0/board?projectKeyOrId=${projectId}`);
//       // const backlogs = await backlogsResponse.json();

//       // if (backlogs.values.length > 0) {
//       //     const boardID = backlogs.values[0].id;

//       //     // Fetching issues using JQL
//       //     const boardResBacklog = await api.asApp().requestJira(route`/rest/agile/1.0/board/${boardID}/backlog`);
//       //     const boardDataBacklog = await boardResBacklog?.json();
//       //     if (boardDataBacklog.issues) {
//       //         boardDataBacklog?.issues?.forEach((issue) => {
//       //             backlogData.push({
//       //                 id: issue.id,
//       //                 priority: issue.fields.priority.name,
//       //                 key: issue.key,
//       //                 issueName: issue.fields.summary,
//       //                 issuetype: issue.fields.issuetype.name,
//       //             });
//       //         });
//       //     }
//       // }

//       // const allPriorities = ['High', 'Low', 'Highest', 'Medium', 'Lowest'];
//       // const groupedByPriority = allPriorities.map(priority => ({ priority, issues: 0 }));

//       // backlogData.forEach(curr => {
//       //     const { priority } = curr;
//       //     const existingPriorityIndex = groupedByPriority.findIndex(item => item.priority === priority);
//       //     if (existingPriorityIndex !== -1) {
//       //         groupedByPriority[existingPriorityIndex].issues++;
//       //     }
//       // });

//       // const timeStamp = Date.now();

//       // groupedByPriority.forEach(async (item) => {
//       //     const backlogIssues = [];
//       //     const boardKey = `backlog_${projectId}_${item.priority}`;
//       //     backlogIssues.push({ timeStamp: timeStamp, issues: item.issues });

//       //     const payload = {
//       //         boardKey,
//       //         backlogIssues
//       //     };
//       //     console.log(payload)
//       //     // Push the payload to the queue
//       //     const jobId = await storageAsyncQueue.push(payload,10);
//       // });

//       const payload = {
//         boardId: board.id,
//       };
//       console.log(payload);
//       await projectAsyncQueue.push(payload, 10);
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }

// Define the async event listener
// asyncResolver.define("event-listener", async ({ payload, context }) => {
//     let retryDelay = 0;
//     if (payload.retryContext) {
//         const baseDelay = 200;
//         const randomJitter = Math.random() * 100;
//         retryDelay = (baseDelay * (2 ** payload.retryContext.retryCount)) + randomJitter;
//     }

//     const { boardKey, backlogIssues } = payload;

//     try {
//         const existingValue = await storage.get(boardKey);

//         if (!existingValue) {
//             backlogIssues.forEach(item => item.key = 0);
//             await storage.set(boardKey, backlogIssues);
//             console.log(`Created new key-value pair for key ${boardKey}:`, backlogIssues);
//         } else {
//             const newKey = existingValue.length;
//             backlogIssues.forEach(item => item.key = newKey);
//             existingValue.push(...backlogIssues);
//             await storage.set(boardKey, existingValue);
//             console.log(`Updated data for key ${boardKey}:`, existingValue);
//         }
//     } catch (error) {
//         return new InvocationError({
//             retryAfter: retryDelay,
//             retryReason: InvocationErrorCode.FUNCTION_RETRY_REQUEST,
//             retryData: { boardKey, backlogIssues }
//         });
//     }
// });

// Define the async event listener

asyncResolver.define("event-listener-upload", async ({ payload, context }) => {
  let retryDelay = 0;
  if (payload.retryContext) {
    const baseDelay = 200;
    const randomJitter = Math.random() * 100;
    retryDelay = baseDelay * 2 ** payload.retryContext.retryCount + randomJitter;
  }

  const { boardKey, backlogIssues } = payload;

  try {
    const existingValue = await storage.get(boardKey);

    if (!existingValue) {
      backlogIssues.forEach((item) => (item.key = 0));
      await storage.set(boardKey, backlogIssues);
      console.log(`Created new key-value pair for key ${boardKey}:`, backlogIssues);
    } else {
      const newKey = existingValue.length;
      backlogIssues.forEach((item) => (item.key = newKey));
      existingValue.push(...backlogIssues);
      await storage.set(boardKey, existingValue);
      console.log(`Updated data for key ${boardKey}:`, existingValue);
    }
  } catch (error) {
    return new InvocationError({
      retryAfter: retryDelay,
      retryReason: InvocationErrorCode.FUNCTION_RETRY_REQUEST,
      retryData: { boardKey, backlogIssues },
    });
  }
});

asyncResolver.define("processProjectImport-listener", async ({ payload, context }) => {
  let retryDelay = 0;
  if (payload.retryContext) {
    const baseDelay = 200;
    const randomJitter = Math.random() * 100;
    retryDelay = baseDelay * 2 ** payload.retryContext.retryCount + randomJitter;
  }

  const { boardId } = payload;
  const backlogData = [];

  // For Delete all the existing data
  // const allPriorities = ['High', 'Low', 'Highest', 'Medium', 'Lowest'];

  // allPriorities.forEach(async (priority) =>{
  //     const boardKey = `backlog_${projectId}_${priority}`;

  //     console.log(boardKey);
  //     await storage.delete(boardKey);
  // })
  try {
    const boardResBacklog = await api.asApp().requestJira(route`/rest/agile/1.0/board/${boardId}/backlog`);

    const boardDataBacklog = await boardResBacklog?.json();

    if (boardDataBacklog.issues) {
      boardDataBacklog?.issues?.forEach((issue) => {
        if (issue.fields.issuetype.name === "Bug") {
          backlogData.push({
            id: issue.id,
            priority: issue.fields.priority.name,
            issuetype: issue.fields.issuetype.name,
          });
        }
      });

      // console.log(`backlogs of ${projectId} `, backlogData);

      const allPriorities = ["High", "Low", "Highest", "Medium", "Lowest"];
      const groupedByPriority = allPriorities.map((priority) => ({
        priority,
        issues: 0,
      }));

      backlogData.forEach((curr) => {
        const { priority } = curr;
        const existingPriorityIndex = groupedByPriority.findIndex((item) => item.priority === priority);
        if (existingPriorityIndex !== -1) {
          groupedByPriority[existingPriorityIndex].issues++;
        }
      });

      // console.log(`backlogs of ${projectId} `, groupedByPriority);

      const timeStamp = Date.now();

      groupedByPriority.forEach(async (item) => {
        const backlogIssues = [];
        const boardKey = `backlog_${boardId}_${item.priority}`;
        backlogIssues.push({ timeStamp: timeStamp, issues: item.issues });

        const payload = {
          boardKey,
          backlogIssues,
        };

        // Push the payload to the queue
        const jobId = await storageAsyncQueue.push(payload, 10);
      });
    }
  } catch (error) {
    return new InvocationError({
      retryAfter: retryDelay,
      retryReason: InvocationErrorCode.FUNCTION_RETRY_REQUEST,
      retryData: { boardKey, backlogIssues },
    });
  }
});
const data = async (key, newValue) => {
  // Check if the key exists in storage
  const existingValue = await storage.get(key);
  return { key, existingValue };
};

asyncResolver.define("getText", async (req) => {
  const backlogValue = await data(req.payload.exampleKey);
  return backlogValue;
});

// asyncResolver.define("setActiveSpritDoneStoriesData", async (req) => {
//   try {
//     // await storage.set(req.payload.key, req.payload.priority);
//     const response = await api.asApp().requestJira(route`/rest/agile/1.0/board`);
//     const responseData = await response.json();

//     const allSprint = []
//     for (const board of responseData.values) {
//       const boardRes = await api.asApp().requestJira(route`/rest/agile/1.0/board/${board?.id}/sprint`);
//       const boardData = await boardRes.json();

//       if(boardData && boardData?.values) {
//         allSprint.push(...boardData?.values.map?.((item) => ({...item, boardID : board?.id})))
//       }
//     }

//     // Filter the active sprints
//     const activeSprints = allSprint?.filter(sprint => sprint.state === 'active');

//     // Fetch the stories for each active sprint
//     const activeSprintStoriesPromises = activeSprints?.map(async (sprint) => {
//       // const query = `issueType = Story AND status = Done`;
//       const getDoneStoryRes = await api.asApp().requestJira(route`/rest/agile/1.0/sprint/${sprint.id}/issue`);
//       const getDoneStoryData = await getDoneStoryRes.json();

//       const filterDoneStoryData = getDoneStoryData?.issues?.filter((data) => data?.fields?.issuetype?.name === "Story" && data?.fields?.status?.name === "Done" );

//       return { boardID: sprint?.boardID, sprintID: sprint?.id , filterDoneStoryData };
//     });
  
//     const activeSprintDoneStories = await Promise.all(activeSprintStoriesPromises);
//     // console.log(activeSprintDoneStories, "getDoneStoryData")

//     const calculateSum = () => {
//       return activeSprintDoneStories?.map((obj) => {
//         const sum = obj?.filterDoneStoryData?.reduce((acc, issue) => {
//           return acc + (issue?.fields?.customfield_10032 || 0);
//         }, 0);
//         return {sprintKey:`activeBoardSprint_${obj?.boardID}_${obj?.sprintID}`,sprintData:{timeStamp:Date.now(),storyPoints:sum}}
//       });
//     };
//     console.log(calculateSum(), "req")
//   } catch (error) {
//     console.log("Unable to set priority for board", error);
//   }
// });

asyncResolver.define("setBoardConfiguration", async (req) => {
  try {
    await storage.set(req.payload.key, req.payload.priority);
    console.log("done");
  } catch (error) {
    console.log("Unable to set priority for board", error);
  }
});

asyncResolver.define("getBoardConfiguration", async (req) => {
  try {
    const boardPriority = await storage.get(req.payload.key);
    return boardPriority;
  } catch (error) {
    console.log("Unable to get priority for board", error);
  }
});

asyncResolver.define("getBugPriority", async (req) => {
  console.log(req, 111)
  try {
    const bugPriority = await storage.get(req.payload.key);
    return bugPriority;
  } catch (error) {
    console.log("Unable to get priority for board", error);
  }
});


asyncResolver.define("setBugPriority", async (req) => {
  console.log(req, 123)

  try {
    const existingValue = await storage.get(req.payload.key);
    console.log(existingValue, "existingValue")

    if (existingValue === undefined) {
      // Key does not exist, add new key
      await storage.set(req.payload.key, req.payload.value);
      console.log("Key added with priority", req.payload.priority);
    } else {
      // Key exists, update value
      await storage.set(req.payload.key, req.payload.value);
      console.log("Key updated with new priority", req.payload.priority);
    }
  } catch (error) {
    console.log("Unable to set priority for board", error);
  }
});


export const handler = asyncResolver.getDefinitions();
export const dataHandler = asyncResolver.getDefinitions();
