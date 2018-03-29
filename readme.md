# Express Server

> A simple server that serves a stock simulation.

## Credits

I'm building this project off of my coworkers 'simple-server' project [documented here](https://github.com/cmda-be/course-17-18/tree/master/examples/express-server). All credits for the work in the first commit go to [@wooorm 2018](https://github.com/wooorm). I've used his project because it's clean and has neat, well-documented code, as well as a basic setup I intend to use/abuse for my purposes.

## Plan of attack

1. Set up a working server-sent-event setup (done)
2. Send initial data and store that data client-side in memore (done)
3. Set up a basic D3 chart with update functionality (done)
4. Patch the SSE update data into the update function (done)
5. Write logic that generates stock trends and overall trend (done)
5. Finish basic D3 visualization of total market cap (done)
5. Write logic that analyses client-side the stock changes (done)
6. Send absolute stats about stock patterns to client (this will result in +/- % info) (done)
7. Add way to manipulate trend through secure client side input
8. Have stock-trends be divergent and semi-independent.
7. Have the stock graph update on a rolling window (prob about 1 hour) (done!)
9. Add colors, standard messages (done, altough I don't remember what I meant by standard messages 🤔)
10. Create login, protect system
10. Add stock ticker?
11. Update to d3.v5
13. Host it somewhere