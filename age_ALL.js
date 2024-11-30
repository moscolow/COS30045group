// Define the data
const data = [
    { Age: "Less than 15 years old", Value: 37861590.0 },
    { Age: "15 to 64 years old", Value: 83227761.0 },
    { Age: "More than 64 years old", Value: 47493194.0 }
  ];

// Calculate the total value for percentages
const totalValue = d3.sum(data, d => d.Value);

// Process the data to include percentages
const processedData = data.map(d => ({
Age: d.Age,
Value: d.Value,
Percentage: ((d.Value / totalValue) * 100).toFixed(2) // Calculate percentage
}));

// Create the chart
const chart = d3.select('#age-chart');

// Create bars for each age group
chart.selectAll('.age-chart-bar')
.data(processedData)
.enter()
.append('div')
.attr('class', 'age-chart-bar')
.each(function(d) {
    const bar = d3.select(this);

    // Add the age group label
    bar.append('div')
    .attr('class', 'age-chart-bar-text')
    .text(d.Age);

    // Add the bar wrapper (100% width background)
    const barWrapper = bar.append('div')
    .attr('class', 'age-chart-bar-wrapper');

    // Add the bar fill (dark bar showing percentage)
    barWrapper.append('div')
    .attr('class', 'age-chart-bar-fill')
    .style('width', `${d.Percentage}%`);

    // Add the percentage text
    bar.append('div')
    .attr('class', 'age-chart-bar-percentage')
    .text(`${d.Percentage}%`);
});