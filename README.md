# Front-end coding exercise

This coding exercise is part of the application process for a software engineering role at BotsAndUs. It involves the implementation of a small front-end visualisation on top of a template application that provides some real-time data.

This is not intended to be a difficult and time-consuming task. It’s a way for you to demonstrate the approach you take to writing software – how you follow specifications, how you provide documentation, the way you test functionality, and how you make decisions about what to build. It also gives us an opportunity to discuss this process with you afterwards.

This task is closely based on a real-world problem we have previously had to solve, and is broadly representative of the kind of tasks you would perform in this role. There are no specific rules regarding what tools you can use to implement this exercise, but this template application uses `next.js` with React and Typescript to provide a basic framework on top of which you can implement your solution.

A few basic front-end components are provided to get you started, along with a simple back-end API implementation that provides virtual real-time data.

## Getting Started

This template project includes a `package.json` and `yarn.lock` file specifying the basic dependencies. To prepare for development, you will need to start by installing the dependencies:

```bash
yarn install # or `npm install`
```

You can then run the development server:

```bash
yarn dev # or `npm run dev`
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the empty template application.

This project also includes `devcontainer` configuration usable by Visual Studio Code. You can optionally choose to use this environment to ensure you have an isolated and repeatable setup.

## The exercise

Robots deployed to customer sites can operate mostly offline and autonomously, but they provide a rich selection of debugging tools for remote monitoring and control. One of the most important pieces of data a robot produces is a real-time feed of the internal estimated pose within a map of its environment – where a "pose" consists of the X and Y coordinates the robot is currently located at, and the direction it is currently pointing. This internal pose can be manually updated by a user in case the robot loses track of its current position and needs to be reset.

This template application provides backend that publishes a real-time stream of poses from a virtual robot. The goal of this exercise is to implement a UI which allows a user to visualise the current pose on a map, update the current pose, and send some basic commands to the virtual robot.

## Functional requirements

**1. Display the current pose of the virtual robot published by the API on a map.**

The backend API included in this application publishes the pose of the virtual robot on a WebSocket endpoint that can be accessed at `/api/pose`:

```sh
→ ws ws://localhost:3000/api/pose
< {"x":2.5,"y":5,"angle":0}
< {"x":2.5,"y":5,"angle":0}
< {"x":2.5,"y":5,"angle":0}
# ... etc
```

This pose information above, for example, describes a robot positioned at 2.5 metres from the left on the X axis, and 5 metres from the bottom on the Y axis, pointing directly upwards. The virtual robot should appear to a simple example path where it moves back and forwards along the x axis.

The current pose of the virtual robot should be shown as an appropriate marker icon on the included map (see `public/images/map.png`, which can be embedded in the front-end using an `img` tag with a `src` attribute of `/images/map.png`). The included map image has a resolution of 1 pixel = 0.1m. Pose coordinates in the API are provided in metres from the bottom left of the map, and the angle is provided in clockwise radians from the north.

A basic React hook-based method for retrieving this data as a stream is included in the sample React component located at `components/RobotStatus.tsx`. You can implement an alternative approach if you wish.

It would also be useful to allow the user to inspect or copy the underlying raw pose data for use in debugging.

*You should implement a new component in the application that visualises the supplied pose on top of the map image in the correct location, as described above.*

**2. Allow the user to start and stop the virtual robot.**

The backend API includes another WebSocket endpoint that can be accessed at `/api/paused`, which publishes a message indicating if the robot is currently paused, or is moving:

```sh
→ ws ws://localhost:3000/api/paused
< {"paused":false}
< {"paused":false}
< {"paused":false}
# ... etc
```

A client can send a message to the WebSocket to change the status and cause the robot to stop moving:

```sh
→ ws ws://localhost:3000/api/paused
< {"paused":false}
--> {"paused":true}
< {"paused":true}
< {"paused":true}
# ... etc
```

When the robot is paused, its pose will stop changing until it is un-paused.

*You should implement a new component in the application that displays this information to the user, and allows them to pause and un-pause the movement of the robot as required.*

**3. Allow the user to manually set the pose of the virtual robot.**

Like the `paused` channel, a user can also send a new pose to the robot to manually override the current pose of the robot to a new value by sending a message to the `pose` endpoint:

```sh
→ ws ws://localhost:3000/api/pose
< {"x":2.5,"y":5,"angle":0}
< {"x":2.5,"y":5,"angle":0}
--> {"x":2.5,"y":2.5,"angle":1.57}
< {"x":2.5,"y":2.5,"angle":1.57}
< {"x":2.5,"y":2.5,"angle":1.57}
# ... etc
```

Sending the new pose isn't implemented in the example component, but could be implemented in a similar manner to pausing and un-pausing the robot.

*You should extend your map component to allow the user to interact with the map and specify a new pose to send to the robot.*

## Non-functional requirements

- You should include appropriate documentation about your code.
- Your code should follow best practices and a consistent coding style.
- Your submission should include whatever test cases you consider appropriate.
- You should describe the device types that your solution supports, and what the constraints might be.
- You should outline the limitations of your solution and describe how you would extend it in the future.

## The existing template

This template application includes some code that will get you started. The main files of interest in this project will be:

  - `server.ts` – implements a simple Javascript server that provides a UI and WebSocket API to clients. You should not need to change this, but it may be a useful reference.
  - `pages/index.tsx` – the main page of this application to which your components should be added.
  - `lib/stream.ts` – a small front-end library for fetching streaming data from the API.
  - `components/RobotStatus.tsx` – an example component that connects to the API and renders some data.

## Your submission

This project contains all of the files which are required to get started.

Your submission of a solution should include:

- The code that implements the UI described above.
- A brief description of how your submission has been designed and how it operates.
- Any test cases you have produced.

You can submit your results in a Git repository or a ZIP file. We encourage you to reach out to us with any questions you may have about the task before submitting your response.
