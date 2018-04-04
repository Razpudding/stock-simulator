# Stock Simulator 📈
A simple server that serves a real-time stock simulation.

![Here you can see the graphs that are generated](/images/graphs.png)
> Dynamically generated d3 graphs which are updated real-time
![And here is the stats view](/images/stats.png)
> Wall Street styled real-time stats

The goal of this project was to create a stock server capable of generating unpredictable trends and sending real-time updates about those stocks to any client connected to the servers real-time datastream. The stocks had to have their own trend visualization and it was necessary to be able to manipulate the trends of each stock individually from the client side.
The project was used at an event where people could invest money in these fictitious stocks. It worked quite well and people where really invested in the outcome even though they knew the stocks had no real value.

## Features
The server uses a simple self written algorithm that determines whether stocks should go up📈 or down📉. It then sends updates to each connected client using [server sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) at a set interval. The client then generates basic line-charts using the [d3](https://d3js.org/) js framework. Wallstreet like stats are also generated (client-side) when a user visits the stats page. Stocks can be manipulated through the client as long as the right password is provided. It's also possible to turn stocks "on or off" which will trigger clients to refresh, updating their view.
The coolest thing about this project is that all you need to do to add new stocks, is change one server-side object (`data`). The rest of the code is completely dynamic.

* A somewhat natural stock pattern for each individual stock.
* Dynamically generated and scaled line-charts which are updated real-time
* Client-side manipulation of stocks (password protected)
* Configurable setting (speed, max growth, visibility, etc.)
* "Wall Street" styling
* Great stability. I've run the project with dozens of different setting and it's never crashed or failed.
* Light-weight and fast. You can send data ticks at an interval as low as ~50ms (altough you probably shouldn't due to latency issues that might arise)

## Usage
In order to run a stock simulation, you'll need to do the following:
1. Download the project and install its dependencies
```bash
git clone https://github.com/Razpudding/stock-simulator.git
npm install
```
2. Think of a good password and put it in a .env file in the root of the project folder. This password needs to be filled in in the 'change' form anytime a stock is changed.
3. Change the `config` and `data` objects in `server.js`
The `config` object determines how the stocks behave, it has the following properties:
_tickInterval:_ The amount of time (in miliseconds) between each tick generated by the server
_upTick:_ The percentage a stock increases on average each upwards tick

_downTick/ upTick:_ The percentage a stock increases or decreases (on average) each tick

_historyLength:_ The amount of historical data sent to new clients. This affects how much old ticks a new client will receive when they connect

_maxMultiplier:_ Determines the maximum amount a stock can increase relative to its initial starting value

The `data` object functions as an initialization of the stock data. It holds the very first tick determining which stocks are created and which starting value they have. It is currently filled with all the basic goods in life like love💜 oil🛢 and of course bitcoinⒷ.

4. Finally, run the project with the following command: `npm start`. The graph screen will now be shown at [your localhost](http://localhost:8000/) while stats can be seen here [/stats](http://localhost:8000/stats) and stocks can be changed here [/change](http://localhost:8000/change). If you want to follow the live stream of data, go to [this endpoint](http://localhost:8000/stream).

## Algorithm
The goal was to create an algorithm that was unpredictable, somewhat natural, and easy to read. In pseudocode, all that happes is: Every new tick has a 30% chance to  trigger a new trend. It will be upwards 80% of the time and downwards 20% of the time. The % increase will be of value _x_ with random offset _x_ and the decrease is _y_ with a random offset of _y_. The algorithm is currently tweaked to provide a general upwards trend with common strong downward trends. Without client-side manipulation of the stock trends, any investment would be profitable over time.

## Wishlist
1. Add a stock ticker
2. Allow new stocks to be created client-side

## Credits
I started out with [a very nice express server template built by @wooorm](https://github.com/cmda-be/course-17-18/tree/master/examples/express-server).
