Pyramid Scaling Calculator

Overview

The Pyramid Scaling Calculator is a dynamic risk-management and trade-planning tool designed for traders who utilize a pyramid scaling strategy (averaging into a position). Whether you are buying the dip (Long) or selling the rip (Short), this calculator helps visualize and quantify the capital requirements, risk, and average entry prices of your scaling plan.

Key Features

Bi-directional Support: Plan both "Long" (averaging down) and "Short" (averaging up) strategies.

Dynamic Margin Scaling: Automatically increases the position size at each price interval based on a customizable increment, creating the "pyramid" effect.

Risk Visualization: Calculates the estimated equity at the worst-case price target, alerting the user to potential liquidation risks.

Capital Tracking: Monitors total margin used against total available capital to ensure the strategy stays within budget.

Visual Insights: Includes an area chart to visualize the concentration of capital at different price levels.

Exportable Data: Download the exact interval breakdown to a CSV file for your trading journal or execution platform.

How It Works

The calculator relies on a mathematical loop that simulates placing orders from your Start Price to your End Price at set Price Intervals.

At each step, the calculator performs the following logic:

Calculate Margin Used: Current Step Margin = Initial Margin + (Step Count * Margin Increment)
This ensures that as the price moves further against your initial entry, you deploy increasingly larger amounts of capital (the base of the pyramid).

Calculate Leveraged Position Size: Leveraged Size = Current Step Margin * Leverage

Accumulate Totals: The tool keeps a running tally of your Cumulative Margin (actual cash deployed), Cumulative Exposure (total position size including leverage), and total units of the asset acquired.

Calculate Weighted Average Entry: As new, larger positions are added at better prices, the calculator dynamically updates your weighted average entry price, showing you exactly where your breakeven point will be.

Estimate Worst-Case Equity: The calculator takes the final price step (the absolute worst price in your predefined range) and calculates the unrealized PnL of all accumulated units at that specific price. If your Unrealized Loss exceeds your Starting Capital, it flags a Risk of Liquidation.

Configuration Parameters

To use the calculator, input the following parameters:

Asset Name: A label for your current trading asset (e.g., Nasdaq 100, Bitcoin).

Direction: Choose Long if the price is dropping and you are buying, or Short if the price is rising and you are selling.

Start Price & End Price: The price at which you place your first order, and the worst price at which you plan to place your final order.

Target Steps / Price Interval: How many individual orders you want to place, or the exact dollar distance between each order.

Leverage (x): The multiplier applied to your margin by your broker/exchange.

Total Capital: Your total account balance available for this specific strategy.

Initial Margin: The actual cash amount used for the very first order at the Start Price.

Increment ($): The dollar amount by which you increase your margin for each subsequent order.