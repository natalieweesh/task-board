## Quick start instructions
1. first create your local .env file: `cp .env.example .env`

2. then start up docker: `docker compose up --build -d`

3. navigate to `http://localhost:5173` in a few tabs to sign in as different users


## Features you implemented
- sign in and out with username
- create/edit/delete tasks
- see tasks added/deleted/updated in real time

## Tech stack choices with brief explanations
- React for nice ux, reusable components, drag and drop package for enhancements later
- Express for lightweight API, continuity of using js, can share typescript types too
- Socket.io for realtime updates, compatible with Node.js
- Prisma ORM for PostgreSQL for easy migrations, easy to write CRUD operations, typescript compatibility
- Tailwind for ease of styling

## System architecture overview
<img width="955" height="425" alt="Screenshot 2026-05-07 at 1 04 26 AM" src="https://github.com/user-attachments/assets/e26bfb08-ec05-45e0-95cd-a602e85d59ba" />


## High-level time log showing how you spent your time
- 9:36pm start code scaffolding
- 10:22pm first migration to create tasks table
- 10:43pm enable edit and delete tasks
- 10:52pm use websockets for realtime updates
- 11:07pm style into 3 column layout
- 11:36pm style touchups
- 12:00am animate card on update
- 12:14am refactor and cleanup

## Key technical decisions and trade-offs you made
- used sessionStorage for keeping track of users logged in so that it can be more easily tested with several different browser tabs, instead of using localStorage where you would need an incognito tab and another browser to test more than 2 users at once
- docker running react and express as two separate containers - cleaner separation, more scalable
- made a quick custom Dropdown component for slightly nicer styling than a \<select\> element, instead of using @tailwindplus/elements because those are web components which makes event handling a little trickier with React

## Known limitations
- kept auth simple for the sake of time, but it is not secure
- if two users edit the same task at the same time, the last edit will win
- no authentication on editing/deleting tasks
- no pagination on GET /tasks
- auth middleware hits the DB on every request
- should add tests

## What you would add/improve with more time
- i realized after i finished that for this use case, we could have gone with server-sent events instead of websockets, because right now we're only broadcasting events from the server to the client, not from the client to the server. if we wanted to update it to show when a user was typing or something else broadcast from client to server then websockets would be the best choice for this.
- add nicer animations/transitions for when tasks are added or deleted
- make the cards drag and droppable between columns
- allow reordering of the cards within the columns too
- safer auth
