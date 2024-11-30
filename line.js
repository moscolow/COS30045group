// Define margins and dimensions
const margin = { top: 20, right: 30, bottom: 50, left: 60 },
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Create SVG container
const svg = d3.select("#graph1_chart")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left + 30},${margin.top})`);

// Tooltip for hover effects
const tooltip = d3.select("#graph1_tooltip");

// Load and process data
d3.csv("southeast_asia_aggregated_by_year_APM.csv").then(data => {
    data.forEach(d => {
        d.Year = +d.Year;
        d.APM_Value = +d.APM_Value;
        d.Value = +d.Value;
    });

    // Define scales
    const x = d3.scaleLinear()
                .domain(d3.extent(data, d => d.Year))
                .range([0, width]);

    const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => Math.max(d.APM_Value, d.Value))])
                .range([height, 0]);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Add "Value" title
    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", -margin.left - 20)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Mortality Value");


    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Year");

    // Area and Line for APM_Value (Steelblue)
    svg.append("path")
        .datum(data)
        .attr("fill", "steelblue")
        .attr("opacity", 0.5)
        .attr("d", d3.area()
            .x(d => x(d.Year))
            .y0(height)
            .y1(d => y(d.APM_Value)));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(d => x(d.Year))
            .y(d => y(d.APM_Value)));

    // Area and Line for Value (Orange)
    svg.append("path")
        .datum(data)
        .attr("fill", "orange")
        .attr("opacity", 0.5)
        .attr("d", d3.area()
            .x(d => x(d.Year))
            .y0(height)
            .y1(d => y(d.Value)));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(d => x(d.Year))
            .y(d => y(d.Value)));

    // Highlight areas for specific years
    const highlightAreas = [
        { start: 2010, end: 2015, color: "rgba(195, 176, 196, 0.5)" },
        { start: 2015, end: 2016, color: "rgba(237, 213, 219, 0.5)" },
        { start: 2016, end: 2019, color: "rgba(173, 194, 216, 0.5)" }
    ];

    highlightAreas.forEach(area => {
        svg.append("rect")
            .attr("x", x(area.start))
            .attr("width", x(area.end) - x(area.start))
            .attr("y", 0)
            .attr("height", height)
            .attr("fill", area.color);
    });

    // Add hover effect
    const hoverLine = svg.append("line")
                            .attr("y1", 0)
                            .attr("y2", height)
                            .style("opacity", 0);

    const bisect = d3.bisector(d => d.Year).left;

    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("mousemove", function(event) {
            const mouseX = d3.pointer(event, this)[0];
            const year = x.invert(mouseX);
            const index = bisect(data, year);
            const d = data[index] || data[data.length - 1];

            hoverLine.attr("x1", x(d.Year))
                    .attr("x2", x(d.Year))
                    .style("opacity", 1);

            tooltip.style("opacity", 1)
                    .html(`
                        <strong>Year:</strong> ${d.Year}<br>
                        <strong>APM_Value:</strong> ${d.APM_Value}<br>
                        <strong>Value:</strong> ${d.Value}
                    `)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 30}px`);
        })
        .on("mouseout", () => {
            hoverLine.style("opacity", 0);
            tooltip.style("opacity", 0);
        });

    // Add legend
    const legend = svg.append("g")
                        .attr("transform", `translate(${width - 250}, 10)`);

    legend.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", "steelblue");

    legend.append("text")
            .attr("x", 20)
            .attr("y", 10)
            .text("Ambient Particulate Matter");

    legend.append("rect")
            .attr("x", 0)
            .attr("y", 20)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", "orange");

    legend.append("text")
            .attr("x", 20)
            .attr("y", 30)
            .text("Total");
});
