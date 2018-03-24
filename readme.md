# Express Server

> A simple server that serves a stock simulation.

## Credits

I'm building this project off of my coworkers 'simple-server' project [documented here](https://github.com/cmda-be/course-17-18/tree/master/examples/express-server). All credits for the work in the first commit go to [@wooorm 2018](https://github.com/wooorm). I've used his project because it's clean and has neat, well-documented code, as well as a basic setup I intend to use/abuse for my purposes.

## Plan of attack

1. Set up a working server-sent-event setup (done)
2. Send initial data and store that data client-side in memore (done)
3. Set up a basic D3 chart with update functionality (done)
4. Patch the SSE update data into the update function (done)
5. Write logic that generates stock trends and overall trend
5. Finish basic D3 visualization of total market cap
5. Write logic that analyses server-side the stock changes
6. Send absolute stats about stock patterns to client (this will result in +/- % info)
7. Have the stock graph update on a rolling window (prob about 1 hour)
9. Add colors, standard messages
10. Create login, protect system
10. Add stock ticker?
11. Update to d3.v5